import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { Connection, WorkflowClient } from '@temporalio/client';
import { measurementSchema } from '@/lib/contracts';
import { analyzeWithGemma } from '@/lib/ai';
import { scoreMeasurement } from '@/lib/scoring';
import type { DiagnosticResponse } from '@/lib/contracts';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const measurement = measurementSchema.parse(body);
    const temporalEnabled = process.env.TEMPORAL_ENABLED === 'true';
    let workflowId: string | null = null;
    let workflowMode: DiagnosticResponse['workflowMode'] = 'direct';
    let warning: string | undefined;
    let diagnosis;
    if (temporalEnabled) {
      try {
        const connection = await Connection.connect({address:process.env.TEMPORAL_ADDRESS || 'localhost:7233',connectTimeout:'5 seconds'});
        const client = new WorkflowClient({connection});
        workflowId = `latencylens-${randomUUID()}`;
        const handle = await client.start('diagnosisWorkflow',{taskQueue:'latencylens-diagnostics',workflowId,args:[measurement]});
        diagnosis = await handle.result();
        workflowMode = 'temporal';
      } catch(err) {
        workflowMode = 'direct-fallback';
        workflowId = null;
        warning = `Temporal unavailable: ${err instanceof Error ? err.message.slice(0,120) : 'unknown error'}. Direct mode used.`;
      }
    }
    if (!diagnosis) {
      try { diagnosis = await analyzeWithGemma(measurement); }
      catch (err) { diagnosis = scoreMeasurement(measurement); warning = `AI unavailable: ${err instanceof Error ? err.message.slice(0,120) : 'unknown error'}. Heuristic analysis used.`; }
    }
    const result: DiagnosticResponse = {measurement,diagnosis,workflowMode,workflowId,...(warning?{warning}:{})};
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({error:err instanceof Error ? err.message : 'Invalid request'},{status:400});
  }
}
