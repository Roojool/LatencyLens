import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWithGemma, applyAiNarrative, extractJsonObject } from '../src/lib/ai';
import { scoreMeasurement } from '../src/lib/scoring';
import { sampleMeasurement } from '../src/lib/sample';
import type { GemmaCompleter } from '../src/lib/ai';

const base = scoreMeasurement(sampleMeasurement);
const MODEL = 'gemma-4-31b-it';

const validNarrative = {
  headline: 'Loaded latency inflates sharply under concurrent download',
  explanation: 'Median latency rises from idle to loaded phase, consistent with queue buildup on the uplink. This is a hypothesis, not a proven root cause.',
  recommendations: ['Repeat the loaded test to confirm the pattern.', 'Compare Ethernet against Wi-Fi before changing settings.'],
  evidence: ['Loaded median is several times the idle median.'],
  limitations: ['Synthetic dataset, not a live measurement.'],
};

/** Runs analyzeWithGemma with fake credentials and an injected completer. */
async function withFakeProvider(completer: GemmaCompleter) {
  const prevKey = process.env.JARVISLABS_API_KEY;
  const prevModel = process.env.JARVISLABS_MODEL;
  process.env.JARVISLABS_API_KEY = 'test-key-never-sent';
  process.env.JARVISLABS_MODEL = MODEL;
  try { return await analyzeWithGemma(sampleMeasurement, completer); }
  finally {
    if (prevKey === undefined) delete process.env.JARVISLABS_API_KEY; else process.env.JARVISLABS_API_KEY = prevKey;
    if (prevModel === undefined) delete process.env.JARVISLABS_MODEL; else process.env.JARVISLABS_MODEL = prevModel;
  }
}

/** The rule engine alone owns these four values (docs/CONTRACTS.md). */
function assertDeterministicUnchanged(d: ReturnType<typeof scoreMeasurement>) {
  assert.equal(d.severity, 'high');
  assert.equal(d.deltaMs, 183.5);
  assert.equal(d.severity, base.severity);
  assert.equal(d.score, base.score);
  assert.equal(d.deltaMs, base.deltaMs);
  assert.equal(d.ratio, base.ratio);
}

test('successful provider output applies the narrative and sets aiUsed truthfully', async () => {
  const d = await withFakeProvider(async () => ({ content: JSON.stringify(validNarrative), finishReason: 'stop' }));
  assert.equal(d.aiUsed, true);
  assert.equal(d.model, MODEL);
  assert.equal(d.headline, validNarrative.headline);
  assert.equal(d.explanation, validNarrative.explanation);
  assert.deepEqual(d.recommendations, validNarrative.recommendations);
  assert.ok(d.evidence.length <= 8 && d.limitations.length <= 8);
  assert.ok(d.evidence.includes(base.evidence[0]), 'deterministic evidence is preserved');
  assertDeterministicUnchanged(d);
});

test('fenced output wrapped in prose still parses', async () => {
  const wrapped = 'Here is the analysis you asked for:\n```json\n' + JSON.stringify(validNarrative) + '\n```\nLet me know if you need more.';
  const d = await withFakeProvider(async () => ({ content: wrapped, finishReason: 'stop' }));
  assert.equal(d.aiUsed, true);
  assert.equal(d.headline, validNarrative.headline);
  assertDeterministicUnchanged(d);
});

test('malformed output falls back without throwing', async () => {
  const d = await withFakeProvider(async () => ({ content: 'not json at all', finishReason: 'stop' }));
  assert.equal(d.aiUsed, false);
  assert.equal(d.model, null);
  assert.equal(d.headline, base.headline);
  assertDeterministicUnchanged(d);
});

test('output truncated by token budget falls back (finish_reason=length)', async () => {
  const cut = JSON.stringify(validNarrative).slice(0, 80);
  const d = await withFakeProvider(async () => ({ content: cut, finishReason: 'length' }));
  assert.equal(d.aiUsed, false);
  assert.equal(d.explanation, base.explanation);
  assertDeterministicUnchanged(d);
});

test('unterminated JSON object falls back even when finish_reason is stop', async () => {
  const cut = '```json\n' + JSON.stringify(validNarrative).slice(0, 80);
  const d = await withFakeProvider(async () => ({ content: cut, finishReason: 'stop' }));
  assert.equal(d.aiUsed, false);
  assertDeterministicUnchanged(d);
});

test('empty provider content falls back', async () => {
  for (const content of ['', '   ', null]) {
    const d = await withFakeProvider(async () => ({ content, finishReason: 'stop' }));
    assert.equal(d.aiUsed, false);
    assertDeterministicUnchanged(d);
  }
});

test('provider failure falls back and leaks nothing from the error', async () => {
  const secret = 'sk-private-key-should-never-surface';
  const d = await withFakeProvider(async () => { throw new Error(`401 Unauthorized for ${secret}`); });
  assert.equal(d.aiUsed, false);
  assert.equal(d.model, null);
  assert.doesNotMatch(JSON.stringify(d), new RegExp(secret));
  assertDeterministicUnchanged(d);
});

test('schema violations fall back instead of partially applying', async () => {
  const cases = [
    { ...validNarrative, recommendations: [] },
    { ...validNarrative, headline: 'x' },
    { ...validNarrative, explanation: 'short' },
    { headline: validNarrative.headline },
  ];
  for (const bad of cases) {
    const d = await withFakeProvider(async () => ({ content: JSON.stringify(bad), finishReason: 'stop' }));
    assert.equal(d.aiUsed, false, `expected fallback for ${JSON.stringify(bad).slice(0, 40)}`);
    assertDeterministicUnchanged(d);
  }
});

test('model cannot override deterministic score, severity, delta or ratio', async () => {
  const hostile = { ...validNarrative, severity: 'healthy', score: 99, deltaMs: 0, ratio: 1, aiUsed: true };
  const d = await withFakeProvider(async () => ({ content: JSON.stringify(hostile), finishReason: 'stop' }));
  assert.equal(d.aiUsed, true, 'narrative keys are still accepted');
  assertDeterministicUnchanged(d);
  assert.notEqual(d.score, 99);
});

test('missing credentials skip the provider entirely', async () => {
  const prevKey = process.env.JARVISLABS_API_KEY;
  delete process.env.JARVISLABS_API_KEY;
  try {
    let called = false;
    const d = await analyzeWithGemma(sampleMeasurement, async () => { called = true; return { content: '{}', finishReason: 'stop' }; });
    assert.equal(called, false, 'no request is attempted without credentials');
    assert.equal(d.aiUsed, false);
    assertDeterministicUnchanged(d);
  } finally {
    if (prevKey !== undefined) process.env.JARVISLABS_API_KEY = prevKey;
  }
});

test('extractJsonObject handles fences, prose, nesting and truncation', () => {
  assert.equal(extractJsonObject('{"a":1}'), '{"a":1}');
  assert.equal(extractJsonObject('```json\n{"a":1}\n```'), '{"a":1}');
  assert.equal(extractJsonObject('text {"a":{"b":2}} tail'), '{"a":{"b":2}}');
  assert.equal(extractJsonObject('{"a":"}"}'), '{"a":"}"}', 'braces inside strings are ignored');
  assert.equal(extractJsonObject('{"a":"\\""}'), '{"a":"\\""}', 'escaped quotes are ignored');
  assert.equal(extractJsonObject('{"a":1'), null, 'unterminated object is truncation');
  assert.equal(extractJsonObject('no object here'), null);
  assert.equal(extractJsonObject(''), null);
});

test('applyAiNarrative is pure and never throws on hostile input', () => {
  for (const raw of ['', 'null', '[]', '{}', '{"headline":', 'undefined', '{"a":1}']) {
    const d = applyAiNarrative(base, raw, 'stop', MODEL);
    assert.equal(d.aiUsed, false);
    assert.equal(d.score, base.score);
  }
});
