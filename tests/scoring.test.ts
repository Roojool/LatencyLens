import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreMeasurement } from '../src/lib/scoring';
import { sampleMeasurement } from '../src/lib/sample';
test('high loaded latency flags severity and keeps metric arithmetic',()=>{
  const d=scoreMeasurement(sampleMeasurement);
  assert.equal(d.severity,'high');assert.equal(d.deltaMs,183.5);assert.equal(d.aiUsed,false);
});
test('no inflation is healthy',()=>{
  const d=scoreMeasurement({...sampleMeasurement,idleMedianMs:25,loadedMedianMs:27,jitterMs:1});
  assert.equal(d.severity,'healthy');assert.equal(d.deltaMs,2);
});

import { healthySampleMeasurement, moderateSampleMeasurement } from '../src/lib/sample';

const at = (idleMedianMs: number, loadedMedianMs: number, jitterMs: number | null = 0) =>
  scoreMeasurement({ ...sampleMeasurement, idleMedianMs, loadedMedianMs, jitterMs });

test('severity thresholds are exact at their boundaries', () => {
  // deltaMs >= 30 is moderate; ratio stays below 2 so delta alone decides.
  assert.equal(at(100, 129.9).severity, 'healthy');
  assert.equal(at(100, 130).severity, 'moderate');
  // ratio >= 2 is moderate; delta stays below 30 so ratio alone decides.
  assert.equal(at(10, 19.9).severity, 'healthy');
  assert.equal(at(10, 20).severity, 'moderate');
  // deltaMs >= 100 is high.
  assert.equal(at(100, 199.9).severity, 'moderate');
  assert.equal(at(100, 200).severity, 'high');
  // ratio >= 4 is high.
  assert.equal(at(5, 19.9).severity, 'moderate');
  assert.equal(at(5, 20).severity, 'high');
});

test('deltaMs never goes negative and ratio survives a zero idle median', () => {
  const faster = at(50, 30);
  assert.equal(faster.deltaMs, 0);
  assert.equal(faster.severity, 'healthy');
  const zeroIdle = at(0, 200);
  assert.equal(zeroIdle.ratio, 1, 'no division by zero');
  assert.equal(zeroIdle.deltaMs, 200);
  assert.equal(zeroIdle.severity, 'high');
});

test('score stays clamped to 0..100', () => {
  assert.equal(at(25, 25, 0).score, 100);
  assert.equal(at(25, 100000, 0).score, 0);
  for (const d of [at(24.5, 208, 32), at(10, 20), at(100, 130)]) {
    assert.ok(d.score >= 0 && d.score <= 100, `score ${d.score} out of range`);
  }
});

test('jitter is reported as evidence only when measured', () => {
  assert.ok(at(25, 30, 5).evidence.some(e => /jitter/i.test(e)));
  assert.ok(!at(25, 30, null).evidence.some(e => /jitter/i.test(e)));
});

test('synthetic fixtures land in their intended severity bands', () => {
  const healthy = scoreMeasurement(healthySampleMeasurement);
  assert.equal(healthy.severity, 'healthy');
  assert.equal(healthy.aiUsed, false);
  assert.ok(healthy.score > 90, `healthy score ${healthy.score}`);
  assert.match(healthy.limitations[1], /synthetic/i);

  const moderate = scoreMeasurement(moderateSampleMeasurement);
  assert.equal(moderate.severity, 'moderate');
  assert.ok(moderate.deltaMs >= 30 && moderate.deltaMs < 100, `delta ${moderate.deltaMs}`);

  // The pre-existing loaded fixture must keep its documented arithmetic.
  const loaded = scoreMeasurement(sampleMeasurement);
  assert.equal(loaded.severity, 'high');
  assert.equal(loaded.deltaMs, 183.5);
  assert.equal(loaded.score, 4);
});
