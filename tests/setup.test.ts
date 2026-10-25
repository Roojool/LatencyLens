import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('setup blocks missing credentials before any live request without exposing configured values', () => {
  const secret = 'private-test-key-never-log';
  const result = spawnSync(process.execPath, ['scripts/check-setup.mjs', '--live-ai'], {
    encoding: 'utf8', env: { ...process.env, JARVISLABS_API_KEY: secret, JARVISLABS_MODEL: '', TEMPORAL_ENABLED: 'false' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /BLOCKED: JARVISLABS_MODEL/);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(secret));
});

test('setup rejects an untrusted provider before sending a credentialed request', () => {
  const result = spawnSync(process.execPath, ['scripts/check-setup.mjs', '--live-ai'], {
    encoding: 'utf8', env: { ...process.env, JARVISLABS_API_KEY: 'private-test-key', JARVISLABS_MODEL: 'test-model', JARVISLABS_BASE_URL: 'https://example.invalid/v1', TEMPORAL_ENABLED: 'false' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /BLOCKED: Provider URL/);
  assert.doesNotMatch(result.stdout + result.stderr, /private-test-key|example.invalid/);
});
