import test, { before } from 'node:test';
import assert from 'node:assert/strict';

// Loaded in a before hook: tsx compiles tests to CJS, so top-level await is unavailable.
// The non-literal specifier keeps tsc from type-resolving the .mjs module.
const probeModule = '../scripts/probe.mjs';
let probe: any;
before(async () => { probe = await import(probeModule); });

test('allowlisted latency targets are accepted and normalised', () => {
  for (const url of probe.LATENCY_TARGETS) {
    assert.equal(probe.assertTrustedLatencyTarget(url), url);
  }
});

test('untrusted latency targets are rejected without echoing the value', () => {
  const cases: [string, RegExp][] = [
    ['http://www.google.com/generate_204', /must use HTTPS/],
    ['https://evil.example.com/generate_204', /not allowlisted/],
    ['https://user:pass@www.google.com/generate_204', /must not embed credentials/],
    ['https://www.google.com/generate_204?x=1', /query string/],
    ['https://www.google.com/generate_204#f', /fragment/],
    ['https://www.google.com/other', /not allowlisted/],
    ['not a url', /not a valid URL/],
    ['https://169.254.169.254/latest/meta-data', /not allowlisted/],
  ];
  for (const [input, expected] of cases) {
    assert.throws(() => probe.assertTrustedLatencyTarget(input), expected, `expected rejection for ${input}`);
    try { probe.assertTrustedLatencyTarget(input); } catch (err) {
      assert.doesNotMatch((err as Error).message, /evil\.example\.com|169\.254\.169\.254|user:pass/,
        'rejection must not echo the supplied endpoint');
    }
  }
});

test('load URL accepts only an allowlisted endpoint with a bounded bytes parameter', () => {
  const base = probe.LOAD_ENDPOINTS[0];
  assert.ok(probe.assertTrustedLoadUrl(`${base}?bytes=1000`).includes('bytes=1000'));
  assert.ok(probe.assertTrustedLoadUrl(base));
  assert.ok(probe.assertTrustedLoadUrl(`${base}?bytes=${probe.LIMITS.maxLoadBytes}`));
  assert.throws(() => probe.assertTrustedLoadUrl(`${base}?bytes=${probe.LIMITS.maxLoadBytes + 1}`), /byte cap/);
  assert.throws(() => probe.assertTrustedLoadUrl(`${base}?bytes=0`), /positive integer/);
  assert.throws(() => probe.assertTrustedLoadUrl(`${base}?bytes=-5`), /positive integer/);
  assert.throws(() => probe.assertTrustedLoadUrl(`${base}?bytes=1e9`), /positive integer/);
  assert.throws(() => probe.assertTrustedLoadUrl(`${base}?bytes=100&redirect=x`), /only a bounded bytes parameter/);
  assert.throws(() => probe.assertTrustedLoadUrl('https://evil.example.com/__down?bytes=1'), /not allowlisted/);
  assert.throws(() => probe.assertTrustedLoadUrl('http://speed.cloudflare.com/__down'), /must use HTTPS/);
});

test('limits stay bounded and the probe sends a fixed number of requests', () => {
  const L = probe.LIMITS;
  assert.ok(L.idleRequests > 0 && L.idleRequests <= 10);
  assert.ok(L.loadedRequests > 0 && L.loadedRequests <= 10);
  assert.ok(L.concurrentLoads > 0 && L.concurrentLoads <= 2);
  assert.ok(L.maxLoadBytes <= 3_000_000);
  assert.ok(L.sampleTimeoutMs > 0 && L.sampleTimeoutMs <= 10_000);
  assert.ok(L.loadTimeoutMs > 0 && L.loadTimeoutMs <= 15_000);
});

test('readBounded stops at the cap and cancels the stream', async () => {
  let cancelled = false;
  const chunk = new Uint8Array(1000);
  const response = {
    body: {
      getReader: () => ({
        read: async () => ({ done: false, value: chunk }),
        cancel: async () => { cancelled = true; },
      }),
    },
  };
  const total = await probe.readBounded(response, 2500);
  assert.ok(total >= 2500 && total < 4000, `bounded read returned ${total}`);
  assert.equal(cancelled, true);
  assert.equal(await probe.readBounded({ body: null }, 100), 0);
});

test('median averages the two middle values for even-length samples', () => {
  assert.equal(probe.median([1, 2, 3, 4]), 2.5);
  assert.equal(probe.median([4, 1, 3, 2]), 2.5);
  assert.equal(probe.median([1, 2, 3]), 2);
  assert.equal(probe.median([7]), 7);
  assert.equal(probe.median([]), 0);
});

test('buildMeasurement labels provenance honestly and never claims ICMP', () => {
  const m = probe.buildMeasurement({ target: probe.LATENCY_TARGETS[0], idle: [20, 22], loaded: [60, 80] });
  assert.equal(m.source, 'local-https-probe');
  assert.equal(m.idleMedianMs, 21);
  assert.equal(m.loadedMedianMs, 70);
  assert.equal(m.packetLossPct, null);
  assert.equal(m.downloadMbps, null);
  assert.match(m.notes, /not equate with ICMP/i);
  assert.equal(m.points.filter((p: any) => p.phase === 'idle').length, 2);
  assert.equal(m.points.filter((p: any) => p.phase === 'loaded').length, 2);
});
