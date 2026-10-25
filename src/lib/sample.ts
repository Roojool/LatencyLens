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
