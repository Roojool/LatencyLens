import type { NetworkMeasurement, Diagnosis } from '../lib/contracts';
import { analyzeWithGemma } from '../lib/ai';
// External network calls MUST remain in activities, never deterministic Workflow code.
export async function diagnoseActivity(input: NetworkMeasurement): Promise<Diagnosis> {
  return await analyzeWithGemma(input);
}
