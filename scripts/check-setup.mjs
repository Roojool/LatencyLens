// Setup only: no network traffic unless --live-ai is explicitly requested.
import { config } from 'dotenv';
import OpenAI from 'openai';
config({ path: '.env.local' });

let ready = true;
function check(ok, message) {
  console.log(`${ok ? 'PASS' : 'BLOCKED'}: ${message}`);
  if (!ok) ready = false;
}

check(Number(process.versions.node.split('.')[0]) >= 22, 'Node 22+ (CI uses Node 22)');
const key = process.env.JARVISLABS_API_KEY?.trim();
const model = process.env.JARVISLABS_MODEL?.trim();
check(Boolean(key), 'JARVISLABS_API_KEY configured privately');
check(Boolean(model), 'JARVISLABS_MODEL copied from your account catalog');
let trusted = false;
try {
  const url = new URL(process.env.JARVISLABS_BASE_URL || 'https://models.jarvislabs.net/v1');
  trusted = url.origin === 'https://models.jarvislabs.net' &&
    /^\/v1\/?$/.test(url.pathname) && !url.username && !url.password && !url.search && !url.hash;
} catch { /* Report only status; configuration may contain secrets. */ }
check(trusted, 'Provider URL matches trusted Jarvislabs HTTPS endpoint');
check(['true', 'false'].includes(process.env.TEMPORAL_ENABLED || 'false'), 'TEMPORAL_ENABLED is true or false');
console.log('INFO: GitHub permissions, heuristic API, Temporal and Kepler require the separate docs/SETUP.md checks.');

if (process.argv.includes('--live-ai') && ready) {
  try {
    const client = new OpenAI({ apiKey: key, baseURL: process.env.JARVISLABS_BASE_URL || 'https://models.jarvislabs.net/v1', timeout: 17000, maxRetries: 0 });
    const response = await client.chat.completions.create({
      // Gemma consumes tokens for reasoning before producing visible content.
      model, max_tokens: 256, temperature: 0,
      messages: [{ role: 'user', content: 'Reply with the single word READY.' }],
    });
    check(Boolean(response.choices[0]?.message?.content?.trim()), 'Real provider completion returned nonempty content');
  } catch (error) {
    // Never print provider bodies, headers, URLs, or error messages containing credentials.
    const status = Number.isInteger(error?.status) ? ` (HTTP ${error.status})` : '';
    check(false, `Provider smoke failed${status}; check account, credits, model and connectivity privately`);
  }
} else if (!process.argv.includes('--live-ai')) {
  console.log('PENDING: live access not tested; run npm run setup:check -- --live-ai after configuring your account.');
}
console.log(ready ? 'Configuration checks passed; complete all setup report items before feature work.' : 'Setup incomplete; resolve BLOCKED items before feature work.');
process.exitCode = ready ? 0 : 1;
