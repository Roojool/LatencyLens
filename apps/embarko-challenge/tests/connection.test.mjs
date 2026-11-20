import assert from 'node:assert/strict';
import test from 'node:test';
import { nextStep, summarize } from '../src/connection.ts';

test('rounds the median, measures spread and keeps failed requests separate', () => {
  assert.deepEqual(summarize([null, 40, 10, 90, 20, null]), { median: 30, spread: 80, failed: 2 });
  assert.deepEqual(summarize([null, null]), { median: null, spread: null, failed: 2 });
  assert.deepEqual(summarize([null, 20]), { median: 20, spread: null, failed: 1 });
});

test('reports improvement only after two successful runs', () => {
  assert.match(nextStep(summarize([80]), summarize([40])), /40 ms faster/);
  assert.doesNotMatch(nextStep(summarize([80, null]), summarize([40])), /faster/);
  assert.match(nextStep(summarize([12, 72])), /Pause one large transfer/);
});
