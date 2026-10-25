// Lightweight read-only local HTTPS timing probe, not ICMP and not a formal bufferbloat grade.
// Usage: npm run probe > probe-output.json; then import that file into the LatencyLens UI.
//
// This script must never fetch an arbitrary URL. PROBE_TARGET and PROBE_LOAD_URL are
// validated against a fixed allowlist, every request is bounded in time, the number of
// requests is fixed, and response bodies are read under a hard byte cap. It generates a
// small amount of deliberate load, so it is not run during setup.
import { pathToFileURL } from 'node:url';

/** Endpoints that return a tiny empty response, used for latency timing. */
export const LATENCY_TARGETS = Object.freeze([
  'https://www.google.com/generate_204',
  'https://www.gstatic.com/generate_204',
  'https://connectivitycheck.gstatic.com/generate_204',
]);

/** Endpoints permitted to serve bounded download load. */
export const LOAD_ENDPOINTS = Object.freeze([
  'https://speed.cloudflare.com/__down',
]);

export const LIMITS = Object.freeze({
  idleRequests: 7,
  loadedRequests: 8,
  concurrentLoads: 2,
  maxLoadBytes: 3_000_000,
  maxResponseBytes: 5_000_000,
  sampleTimeoutMs: 10_000,
  loadTimeoutMs: 12_000,
  idleDelayMs: 150,
  loadedDelayMs: 130,
  minSuccessfulSamples: 3,
});

/** Parses an HTTPS URL, rejecting credentials and non-HTTPS schemes. */
function parseHttps(raw) {
  let url;
  try {
    url = new URL(String(raw));
  } catch {
    throw new Error('Probe endpoint is not a valid URL');
  }
  if (url.protocol !== 'https:') throw new Error('Probe endpoints must use HTTPS');
  if (url.username || url.password) throw new Error('Probe endpoints must not embed credentials');
  return url;
}

// Allowlist failures never echo the supplied value: an operator's env may point at a
// private host, and this output is pasted into reports.
function rejectNotAllowlisted(kind, allowed) {
  throw new Error(`${kind} is not allowlisted. Permitted: ${allowed.join(', ')}`);
}

export function assertTrustedLatencyTarget(raw) {
  const url = parseHttps(raw);
  if (url.search) throw new Error('Latency target must not carry a query string');
  if (url.hash) throw new Error('Latency target must not carry a fragment');
  const normalized = `${url.origin}${url.pathname}`;
  if (!LATENCY_TARGETS.includes(normalized)) rejectNotAllowlisted('Latency target', LATENCY_TARGETS);
  return normalized;
}

export function assertTrustedLoadUrl(raw) {
  const url = parseHttps(raw);
  if (url.hash) throw new Error('Load URL must not carry a fragment');
  const normalized = `${url.origin}${url.pathname}`;
  if (!LOAD_ENDPOINTS.includes(normalized)) rejectNotAllowlisted('Load URL', LOAD_ENDPOINTS);
  for (const key of url.searchParams.keys()) {
    if (key !== 'bytes') throw new Error('Load URL accepts only a bounded bytes parameter');
  }
  const bytes = url.searchParams.get('bytes');
  if (bytes !== null) {
    if (!/^[0-9]{1,9}$/.test(bytes)) throw new Error('Load bytes must be a plain positive integer');
    const value = Number(bytes);
    if (value <= 0) throw new Error('Load bytes must be a plain positive integer');
    if (value > LIMITS.maxLoadBytes) {
      throw new Error(`Load bytes exceeds the ${LIMITS.maxLoadBytes} byte cap`);
    }
  }
  return url.toString();
}

/** True median: averages the two middle values for an even-length sample. */
export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const lo = Math.floor((sorted.length - 1) / 2);
  const hi = Math.ceil((sorted.length - 1) / 2);
  return (sorted[lo] + sorted[hi]) / 2;
}

/** Drains a response under a hard byte cap, cancelling the stream once reached. */
export async function readBounded(response, maxBytes = LIMITS.maxResponseBytes) {
  const body = response.body;
  if (!body) return 0;
  const reader = body.getReader();
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total >= maxBytes) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return total;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sampleOnce(target) {
  const startedAt = performance.now();
  try {
    const response = await fetch(target, {
      method: 'GET', cache: 'no-store', redirect: 'error',
      signal: AbortSignal.timeout(LIMITS.sampleTimeoutMs),
    });
    await readBounded(response, 64 * 1024);
    return Math.round((performance.now() - startedAt) * 10) / 10;
  } catch {
    return null;
  }
}

/**
 * Runs one bounded load download and returns the number of bytes actually
 * transferred. Returns 0 for a non-2xx status, an empty body, a timeout or any
 * transport error, so a failed load can never be mistaken for generated load.
 * `fetchImpl` is injected by tests; nothing here reaches the network under test.
 */
export async function generateLoad(loadUrl, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(loadUrl, {
      cache: 'no-store', redirect: 'error',
      signal: AbortSignal.timeout(LIMITS.loadTimeoutMs),
    });
    if (!response || !response.ok) {
      await response?.body?.cancel?.().catch(() => undefined);
      return 0;
    }
    return await readBounded(response, LIMITS.maxLoadBytes);
  } catch {
    return 0;
  }
}

export function buildMeasurement({ target, idle, loaded, loadBytes = 0 }) {
  const points = [
    ...idle.map((latencyMs, at) => ({ at, latencyMs, phase: 'idle' })),
    ...loaded.map((latencyMs, i) => ({ at: i + idle.length, latencyMs, phase: 'loaded' })),
  ];
  const jitters = points.slice(1).map((p, i) => Math.abs(p.latencyMs - points[i].latencyMs));
  return {
    id: `https-probe-${Date.now()}`,
    source: 'local-https-probe',
    createdAt: new Date().toISOString(),
    target,
    idleMedianMs: median(idle),
    loadedMedianMs: median(loaded),
    jitterMs: median(jitters),
    packetLossPct: null, downloadMbps: null, uploadMbps: null,
    points,
    notes: loadBytes > 0
      ? `HTTPS request timing includes DNS/TLS/server delay; ${loadBytes} bytes of concurrent bounded download generated load, which may not saturate the link. Do not equate with ICMP or formal bufferbloat tests.`
      : 'HTTPS request timing includes DNS/TLS/server delay. No concurrent load was generated, so the loaded phase is NOT a load measurement. Do not equate with ICMP or formal bufferbloat tests.',
  };
}

async function main() {
  const target = assertTrustedLatencyTarget(process.env.PROBE_TARGET || LATENCY_TARGETS[0]);
  const loadUrl = assertTrustedLoadUrl(
    process.env.PROBE_LOAD_URL || `${LOAD_ENDPOINTS[0]}?bytes=${LIMITS.maxLoadBytes}`,
  );

  const idle = [];
  for (let i = 0; i < LIMITS.idleRequests; i++) {
    const value = await sampleOnce(target);
    if (value !== null) idle.push(value);
    await delay(LIMITS.idleDelayMs);
  }
  if (idle.length < LIMITS.minSuccessfulSamples) {
    throw new Error('Too few successful idle requests; check target connectivity');
  }

  const active = Array.from({ length: LIMITS.concurrentLoads }, () => generateLoad(loadUrl));

  const loaded = [];
  for (let i = 0; i < LIMITS.loadedRequests; i++) {
    const value = await sampleOnce(target);
    if (value !== null) loaded.push(value);
    await delay(LIMITS.loadedDelayMs);
  }
  const loadBytes = (await Promise.all(active)).reduce((total, bytes) => total + bytes, 0);
  if (loaded.length < LIMITS.minSuccessfulSamples) {
    throw new Error('Too few successful loaded requests');
  }
  // Without a successful load there is no loaded phase to report: the samples would
  // be idle samples wearing a 'loaded' label.
  if (loadBytes <= 0) {
    throw new Error('No load response succeeded; refusing to report a loaded phase that measured no load');
  }

  process.stdout.write(JSON.stringify(buildMeasurement({ target, idle, loaded, loadBytes }), null, 2) + '\n');
}

const invokedDirectly = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) await main();
