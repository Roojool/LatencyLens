import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreMeasurement, compareDiagnoses } from '../src/lib/scoring';
import {
  sampleMeasurement, healthySampleMeasurement,
  comparisonBeforeMeasurement, comparisonAfterMeasurement,
} from '../src/lib/sample';

const before = scoreMeasurement(comparisonBeforeMeasurement);
const after = scoreMeasurement(comparisonAfterMeasurement);

test('the before/after pair is comparable and honestly labelled', () => {
  assert.equal(comparisonBeforeMeasurement.source, comparisonAfterMeasurement.source);
  assert.equal(comparisonBeforeMeasurement.target, comparisonAfterMeasurement.target);
  assert.notEqual(comparisonBeforeMeasurement.id, comparisonAfterMeasurement.id);
  for (const m of [comparisonBeforeMeasurement, comparisonAfterMeasurement]) {
    assert.match(m.notes!, /synthetic/i);
    assert.match(m.notes!, /NOT actual measurements/);
  }
  // The after capture must not claim causation.
  assert.match(comparisonAfterMeasurement.notes!, /not proof that any change caused/i);
  assert.ok(new Date(comparisonAfterMeasurement.createdAt) > new Date(comparisonBeforeMeasurement.createdAt));
});

test('the pair spans a visible severity improvement', () => {
  assert.equal(before.severity, 'high');
  assert.equal(after.severity, 'healthy');
  assert.ok(after.deltaMs < before.deltaMs);
  assert.ok(after.score > before.score);
});

test('comparison reports direction, deltas and severity change', () => {
  const c = compareDiagnoses(before, after);
  assert.equal(c.direction, 'improved');
  assert.ok(c.deltaMsDelta < 0, `deltaMsDelta ${c.deltaMsDelta}`);
  assert.ok(c.scoreDelta > 0, `scoreDelta ${c.scoreDelta}`);
  assert.equal(c.severityBefore, 'high');
  assert.equal(c.severityAfter, 'healthy');
  assert.equal(c.severityChanged, true);
  assert.equal(c.evidence.length, 3);
  assert.ok(c.limitations.some(l => /not a controlled experiment/i.test(l)));
});

test('reversing the pair reports a regression', () => {
  const c = compareDiagnoses(after, before);
  assert.equal(c.direction, 'regressed');
  assert.ok(c.deltaMsDelta > 0);
  assert.ok(c.scoreDelta < 0);
  assert.equal(c.severityChanged, true);
});

test('an identical pair is unchanged with zero deltas', () => {
  const c = compareDiagnoses(before, before);
  assert.equal(c.direction, 'unchanged');
  assert.equal(c.scoreDelta, 0);
  assert.equal(c.deltaMsDelta, 0);
  assert.equal(c.ratioDelta, 0);
  assert.equal(c.severityChanged, false);
});

test('score breaks the tie when added latency is identical', () => {
  const base = scoreMeasurement(sampleMeasurement);
  const jitterOnly = scoreMeasurement({ ...sampleMeasurement, jitterMs: 1 });
  assert.equal(jitterOnly.deltaMs, base.deltaMs, 'same delta, different jitter');
  assert.ok(jitterOnly.score > base.score);
  assert.equal(compareDiagnoses(base, jitterOnly).direction, 'improved');
  assert.equal(compareDiagnoses(jitterOnly, base).direction, 'regressed');
});

test('comparison is repeatable and never mutates its inputs', () => {
  const snapshotBefore = JSON.stringify(before);
  const snapshotAfter = JSON.stringify(after);
  const first = compareDiagnoses(before, after);
  const second = compareDiagnoses(before, after);
  assert.deepEqual(first, second, 'repeatable for identical input');
  assert.equal(JSON.stringify(before), snapshotBefore, 'before is untouched');
  assert.equal(JSON.stringify(after), snapshotAfter, 'after is untouched');
});

test('deltas are rounded so no float noise reaches the UI', () => {
  const a = scoreMeasurement({ ...sampleMeasurement, idleMedianMs: 10, loadedMedianMs: 10.1 });
  const b = scoreMeasurement({ ...sampleMeasurement, idleMedianMs: 10, loadedMedianMs: 10.4 });
  for (const value of Object.values(compareDiagnoses(a, b))) {
    if (typeof value === 'number') {
      assert.equal(value, Math.round(value * 10) / 10, `${value} is not rounded to one decimal`);
    }
  }
});

test('comparison does not recompute or alter deterministic fields', () => {
  const healthy = scoreMeasurement(healthySampleMeasurement);
  const c = compareDiagnoses(before, healthy);
  assert.equal(c.severityBefore, before.severity);
  assert.equal(c.severityAfter, healthy.severity);
  assert.equal(c.scoreDelta, Math.round((healthy.score - before.score) * 10) / 10);
  assert.equal(c.deltaMsDelta, Math.round((healthy.deltaMs - before.deltaMs) * 10) / 10);
});
