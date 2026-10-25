import { config as loadEnv } from 'dotenv';
loadEnv({path:'.env.local'});
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
async function main() {
  const connection = await NativeConnection.connect({address:process.env.TEMPORAL_ADDRESS || 'localhost:7233'});
  try {
    const worker = await Worker.create({connection,namespace:'default',taskQueue:'latencylens-diagnostics',workflowsPath:require.resolve('./workflows'),activities});
    console.log('LatencyLens Temporal worker listening on latencylens-diagnostics');
    await worker.run();
  } finally {
    await connection.close();
  }
}
main().catch(()=>{console.error('LatencyLens Temporal worker failed to start or stopped unexpectedly.');process.exit(1)});
