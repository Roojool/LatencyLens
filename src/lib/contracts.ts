import { z } from 'zod';

export const pointSchema = z.object({
  at: z.number().finite(), latencyMs: z.number().finite().min(0),
  phase: z.enum(['idle', 'loaded']),
});
export const measurementSchema = z.object({
  id: z.string().min(1).max(100),
  source: z.enum(['sample', 'local-https-probe', 'browser-estimate']),
  createdAt: z.string(),
  target: z.string().max(200),
  idleMedianMs: z.number().finite().min(0),
  loadedMedianMs: z.number().finite().min(0),
  jitterMs: z.number().finite().min(0).nullable(),
  packetLossPct: z.number().finite().min(0).max(100).nullable(),
  downloadMbps: z.number().finite().min(0).nullable(),
  uploadMbps: z.number().finite().min(0).nullable(),
  points: z.array(pointSchema).max(1000),
  notes: z.string().max(700).optional(),
});
export type NetworkMeasurement = z.infer<typeof measurementSchema>;
export type Severity = 'healthy' | 'moderate' | 'high';
export type Diagnosis = {
  severity: Severity; score: number; deltaMs: number; ratio: number;
  headline: string; evidence: string[]; recommendations: string[];
  explanation: string; aiUsed: boolean; model: string | null;
  limitations: string[];
};
export type DiagnosticResponse = {
  measurement: NetworkMeasurement;
  diagnosis: Diagnosis;
  workflowMode: 'temporal' | 'direct' | 'direct-fallback';
  workflowId: string | null;
  warning?: string;
};
