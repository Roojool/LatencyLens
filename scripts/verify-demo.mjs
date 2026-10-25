// Local-only integration check. Sends the synthetic fixture, never runs a network probe.
import assert from 'node:assert/strict';
import { sampleMeasurement } from '../src/lib/sample.ts';
import { scoreMeasurement } from '../src/lib/scoring.ts';

const endpoint = 'http://127.0.0.1:3000/api/diagnose';
const started = Date.now();
const invalid = await fetch(endpoint, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: '{', signal: AbortSignal.timeout(5000),
});
assert.equal(invalid.status, 400, 'Malformed JSON must return HTTP 400');

const response = await fetch(endpoint, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify(sampleMeasurement), signal: AbortSignal.timeout(90000),
});
assert.equal(response.status, 200, 'Synthetic diagnosis must return HTTP 200');
const result = await response.json();
const expected = scoreMeasurement(sampleMeasurement);
assert.deepEqual(result.measurement, sampleMeasurement, 'Measurement must survive the API unchanged');
for (const key of ['score', 'severity', 'deltaMs', 'ratio']) {
  assert.equal(result.diagnosis[key], expected[key], `Deterministic ${key} must remain unchanged`);
}
assert.ok(['direct', 'direct-fallback', 'temporal'].includes(result.workflowMode));
if (result.workflowMode === 'temporal') {
  assert.ok(typeof result.workflowId === 'string' && result.workflowId.startsWith('latencylens-'));
} else {
  assert.equal(result.workflowId, null, 'Direct responses must not claim a Temporal ID');
}
if (result.workflowMode === 'direct-fallback') assert.ok(result.warning, 'Fallback must be visible');
if (process.argv.includes('--require-ai')) assert.equal(result.diagnosis.aiUsed, true, 'Real validated AI diagnosis required');
if (process.argv.includes('--require-temporal')) assert.equal(result.workflowMode, 'temporal', 'Completed Temporal execution required');
console.log(JSON.stringify({
  source: result.measurement.source, aiUsed: result.diagnosis.aiUsed,
  model: result.diagnosis.model, workflowMode: result.workflowMode,
  workflowId: result.workflowId, score: result.diagnosis.score,
  deltaMs: result.diagnosis.deltaMs, warningPresent: Boolean(result.warning),
  elapsedMs: Date.now() - started,
}, null, 2));
