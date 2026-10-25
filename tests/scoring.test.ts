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
