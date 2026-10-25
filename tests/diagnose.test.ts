import { test, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Connection, WorkflowClient } from '@temporalio/client';
import { POST } from '../src/app/api/diagnose/route';
import { diagnoseActivity } from '../src/temporal/activities';
import { sampleMeasurement } from '../src/lib/sample';
import { scoreMeasurement } from '../src/lib/scoring';

const keys = ['TEMPORAL_ENABLED', 'JARVISLABS_API_KEY', 'JARVISLABS_MODEL'] as const;
const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
afterEach(() => {
  mock.restoreAll();
  for (const key of keys) {
    if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
  }
});
function noAI() {
  process.env.TEMPORAL_ENABLED = 'false';
  process.env.JARVISLABS_API_KEY = '';
  process.env.JARVISLABS_MODEL = '';
}
function request(body = JSON.stringify(sampleMeasurement)) {
  return new Request('http://localhost/api/diagnose', {method:'POST',body});
}

test('direct diagnosis preserves the measurement and arithmetic without claiming AI or a workflow', async () => {
  noAI();
  const response = await POST(request());
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(result.measurement, sampleMeasurement);
  assert.deepEqual(result.diagnosis, scoreMeasurement(sampleMeasurement));
  assert.equal(result.workflowMode, 'direct');
  assert.equal(result.workflowId, null);
  assert.match(result.warning, /AI diagnosis unavailable/);
});

test('input errors are generic and oversized bodies are rejected before validation', async () => {
  noAI();
  for (const body of ['{', JSON.stringify({source:'private-sentinel'})]) {
    const response = await POST(request(body));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {error:'Invalid measurement JSON or schema.'});
  }
  assert.equal((await POST(request(' '.repeat(128 * 1024 + 1)))).status, 413);
});

test('Temporal failure preserves both warnings and never exposes exception details or a candidate ID', async () => {
  noAI(); process.env.TEMPORAL_ENABLED = 'true';
  mock.method(Connection, 'connect', async () => {throw new Error('private-runtime-sentinel');});
  const result = await (await POST(request())).json();
  assert.equal(result.workflowMode, 'direct-fallback');
  assert.equal(result.workflowId, null);
  assert.match(result.warning, /Temporal/); assert.match(result.warning, /AI diagnosis/);
  assert.doesNotMatch(JSON.stringify(result), /private-runtime-sentinel/);
});

test('a stalled request body is bounded even when stream cancellation stalls', {timeout:7000}, async () => {
  noAI(); const started = Date.now();
  const body = new ReadableStream({cancel: () => new Promise(() => {})});
  const response = await POST(new Request('http://localhost/api/diagnose', {method:'POST',body,duplex:'half'} as RequestInit));
  assert.equal(response.status, 408);
  assert.ok(Date.now() - started < 6500);
});

test('only a completed workflow exposes its actual ID and closes its connection', async () => {
  noAI(); process.env.TEMPORAL_ENABLED = 'true';
  let closed = false; let actualId = '';
  mock.method(Connection, 'connect', async () => ({
    withDeadline: async (_deadline: number, fn: () => Promise<unknown>) => fn(),
    close: async () => {closed = true;},
  }) as unknown as Connection);
  mock.method(WorkflowClient.prototype, 'start', async (...args: unknown[]) => {
    const options = args[1] as {workflowId:string;workflowExecutionTimeout:string};
    actualId = options.workflowId;
    assert.equal(options.workflowExecutionTimeout, '40 seconds');
    return {result: async () => scoreMeasurement(sampleMeasurement)};
  });
  const result = await (await POST(request())).json();
  assert.equal(result.workflowMode, 'temporal'); assert.equal(result.workflowId, actualId);
  assert.equal(closed, true); assert.match(result.warning, /AI diagnosis/);
});

test('activity excludes imported private free text from model requests', async () => {
  noAI(); process.env.JARVISLABS_API_KEY = 'fake-key'; process.env.JARVISLABS_MODEL = 'test-model';
  let payload = '';
  mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    payload = String(init?.body);
    return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({
      headline:'Validated diagnostic narrative', explanation:'The supplied synthetic trace shows a loaded latency increase.',
      recommendations:['Repeat this test to verify the pattern.'], evidence:[], limitations:[],
    })}}]}), {headers:{'content-type':'application/json'}});
  });
  const result = await diagnoseActivity({...sampleMeasurement,target:'private-target-sentinel',notes:'private-note-sentinel'});
  assert.equal(result.aiUsed, true);
  assert.ok(payload.length > 0);
  assert.doesNotMatch(payload, /private-target-sentinel|private-note-sentinel/);
});
