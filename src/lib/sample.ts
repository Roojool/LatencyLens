import type { NetworkMeasurement } from './contracts';
const idle = [24,23,25,24,26,25,24,23,26,25,24,25];
const loaded = [38,81,170,260,318,330,345,298,270,233,183,120,75,54];
const median=(xs:number[])=>{const s=[...xs].sort((a,b)=>a-b);return (s[Math.floor((s.length-1)/2)]+s[Math.ceil((s.length-1)/2)])/2};
export const sampleMeasurement: NetworkMeasurement = {
  id: 'sample-bufferbloat-01', source: 'sample', createdAt: '2026-10-25T09:00:00.000Z',
  target: 'Synthetic Pune home broadband demonstration',
  idleMedianMs: median(idle), loadedMedianMs: median(loaded), jitterMs: 32, packetLossPct: null,
  downloadMbps: 48.7, uploadMbps: null,
  points: [...idle.map((latencyMs,at)=>({at,latencyMs,phase:'idle' as const})),...loaded.map((latencyMs,i)=>({at:i+12,latencyMs,phase:'loaded' as const}))],
  notes: 'Synthetic values chosen to demonstrate an inflated latency-under-load pattern. NOT actual measurements.'
};

// Synthetic scenarios for tests and demos. NOT measurements. Exports above are unchanged.
const healthyIdle = [21,22,21,23,22,21,22,23,21,22,23,22];
const healthyLoaded = [23,24,25,23,24,26,24,23,25,24,23,24];
export const healthySampleMeasurement: NetworkMeasurement = {
  ...sampleMeasurement,
  id: 'sample-healthy-01',
  target: 'Synthetic well-managed connection demonstration',
  idleMedianMs: median(healthyIdle), loadedMedianMs: median(healthyLoaded),
  jitterMs: 2, downloadMbps: 92.4,
  points: [...healthyIdle.map((latencyMs,at)=>({at,latencyMs,phase:'idle' as const})),...healthyLoaded.map((latencyMs,i)=>({at:i+healthyIdle.length,latencyMs,phase:'loaded' as const}))],
  notes: 'Synthetic values chosen to demonstrate a connection with no meaningful latency inflation. NOT actual measurements.'
};

const moderateIdle = [26,25,27,26,25,26,27,26,25,26,27,26];
const moderateLoaded = [44,58,72,80,86,84,79,70,63,55,48,45];
export const moderateSampleMeasurement: NetworkMeasurement = {
  ...sampleMeasurement,
  id: 'sample-moderate-01',
  target: 'Synthetic moderate inflation demonstration',
  idleMedianMs: median(moderateIdle), loadedMedianMs: median(moderateLoaded),
  jitterMs: 11, downloadMbps: 61.2,
  points: [...moderateIdle.map((latencyMs,at)=>({at,latencyMs,phase:'idle' as const})),...moderateLoaded.map((latencyMs,i)=>({at:i+moderateIdle.length,latencyMs,phase:'loaded' as const}))],
  notes: 'Synthetic values chosen to demonstrate partial latency inflation under load. NOT actual measurements.'
};

// Before/after comparison pair. Same synthetic target and source, so the two sides
// are comparable. NOT measurements, and not evidence that any change caused the shift.
const beforeIdle = [27,26,28,27,26,27,28,27,26,27,28,27];
const beforeLoaded = [52,96,188,274,330,342,356,310,282,241,196,133,88,61];
const afterIdle = [26,27,26,28,27,26,27,28,26,27,26,27];
const afterLoaded = [31,34,38,41,44,43,40,37,35,33,31,30,29,31];
const comparisonTarget = 'Synthetic queue-management before/after demonstration';
export const comparisonBeforeMeasurement: NetworkMeasurement = {
  ...sampleMeasurement,
  id: 'sample-comparison-before-01', createdAt: '2026-10-25T09:00:00.000Z',
  target: comparisonTarget,
  idleMedianMs: median(beforeIdle), loadedMedianMs: median(beforeLoaded),
  jitterMs: 38, downloadMbps: 47.9,
  points: [...beforeIdle.map((latencyMs,at)=>({at,latencyMs,phase:'idle' as const})),...beforeLoaded.map((latencyMs,i)=>({at:i+beforeIdle.length,latencyMs,phase:'loaded' as const}))],
  notes: 'Synthetic BEFORE capture for the comparison demonstration. NOT actual measurements.'
};
export const comparisonAfterMeasurement: NetworkMeasurement = {
  ...sampleMeasurement,
  id: 'sample-comparison-after-01', createdAt: '2026-10-25T10:30:00.000Z',
  target: comparisonTarget,
  idleMedianMs: median(afterIdle), loadedMedianMs: median(afterLoaded),
  jitterMs: 4, downloadMbps: 46.8,
  points: [...afterIdle.map((latencyMs,at)=>({at,latencyMs,phase:'idle' as const})),...afterLoaded.map((latencyMs,i)=>({at:i+afterIdle.length,latencyMs,phase:'loaded' as const}))],
  notes: 'Synthetic AFTER capture for the comparison demonstration. NOT actual measurements, and not proof that any change caused the difference.'
};
