import { proxyActivities } from '@temporalio/workflow';
import type { NetworkMeasurement, Diagnosis } from '../lib/contracts';
import type * as activities from './activities';
const { diagnoseActivity } = proxyActivities<typeof activities>({
  scheduleToStartTimeout:'5 seconds',startToCloseTimeout:'20 seconds',
  retry:{initialInterval:'1 second',maximumAttempts:2,backoffCoefficient:2},
});
export async function diagnosisWorkflow(input: NetworkMeasurement): Promise<Diagnosis> {
  return await diagnoseActivity(input);
}
