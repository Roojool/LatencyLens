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
