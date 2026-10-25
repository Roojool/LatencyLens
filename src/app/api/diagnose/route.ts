import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { Connection, WorkflowClient } from '@temporalio/client';
import { measurementSchema } from '@/lib/contracts';
import type { DiagnosticResponse, NetworkMeasurement } from '@/lib/contracts';
import { diagnoseActivity } from '@/temporal/activities';
import { scoreMeasurement } from '@/lib/scoring';

export const runtime = 'nodejs';
const maxBodyBytes = 128 * 1024;
const readTimeoutMs = 5_000;
const diagnosisTimeoutMs = 20_000;
const temporalRpcTimeoutMs = 43_000;

async function readBody(request: Request): Promise<string> {
  if (Number(request.headers.get('content-length')) > maxBodyBytes) throw new RangeError();
  if (!request.body) throw new SyntaxError();
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > maxBodyBytes) throw new RangeError();
          chunks.push(value);
        }
        return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
      })(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('request-timeout')), readTimeoutMs); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    await reader.cancel().catch(() => undefined);
  }
}

function bounded<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), timeoutMs); })])
    .finally(() => clearTimeout(timer));
}

function appendWarning(current: string | undefined, next: string): string {
  return current ? `${current} ${next}` : next;
}

export async function POST(request: Request) {
  let measurement: NetworkMeasurement;
  try {
    measurement = measurementSchema.parse(JSON.parse(await readBody(request)));
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ error: 'Request body exceeds 128 KiB.' }, { status: 413 });
    if (error instanceof Error && error.message === 'request-timeout') return NextResponse.json({ error: 'Request body timed out.' }, { status: 408 });
    return NextResponse.json({ error: 'Invalid measurement JSON or schema.' }, { status: 400 });
  }

  try {
  const temporalEnabled = process.env.TEMPORAL_ENABLED === 'true';
  let workflowId: string | null = null;
  let workflowMode: DiagnosticResponse['workflowMode'] = 'direct';
  let warning: string | undefined;
  let diagnosis: DiagnosticResponse['diagnosis'];

  if (temporalEnabled) {
    let connection: Connection | undefined;
    let handle: Awaited<ReturnType<WorkflowClient['start']>> | undefined;
    try {
      connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233', connectTimeout: '3 seconds' });
      const client = new WorkflowClient({ connection });
      const candidateId = `latencylens-${randomUUID()}`;
      diagnosis = await connection.withDeadline(Date.now() + temporalRpcTimeoutMs, async () => {
        handle = await client.start('diagnosisWorkflow', {
          taskQueue: 'latencylens-diagnostics', workflowId: candidateId, workflowExecutionTimeout: '40 seconds', args: [measurement],
        });
        return await handle.result();
      });
      workflowId = candidateId;
      workflowMode = 'temporal';
    } catch {
      workflowMode = 'direct-fallback';
      warning = 'Temporal did not complete the diagnosis. Direct mode used.';
      if (handle && connection) await connection.withDeadline(Date.now() + 1_000, () => handle!.cancel()).catch(() => undefined);
    } finally {
      await connection?.close().catch(() => undefined);
    }
  }

  if (!diagnosis!) {
    try {
      diagnosis = await bounded(diagnoseActivity(measurement), diagnosisTimeoutMs);
    } catch {
      diagnosis = scoreMeasurement(measurement);
    }
    if (!diagnosis.aiUsed) warning = appendWarning(warning, 'AI diagnosis unavailable or not configured. Deterministic analysis used.');
  } else if (!diagnosis.aiUsed) {
    warning = appendWarning(warning, 'AI diagnosis unavailable or not configured. Deterministic analysis used.');
  }

  const result: DiagnosticResponse = { measurement, diagnosis, workflowMode, workflowId, ...(warning ? { warning } : {}) };
  return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Diagnosis service failed.' }, { status: 500 });
  }
}
