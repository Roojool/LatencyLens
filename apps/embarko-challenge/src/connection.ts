export type Run = { median: number | null; spread: number | null; failed: number };

export function summarize(samples: (number | null)[]): Run {
  const times = samples.filter((value): value is number => value !== null).sort((a, b) => a - b);
  const middle = Math.floor(times.length / 2);
  return {
    median: times.length ? Math.round((times[middle] + times[Math.floor((times.length - 1) / 2)]) / 2) : null,
    spread: times.length > 1 ? Math.round(times[times.length - 1] - times[0]) : null,
    failed: samples.length - times.length,
  };
}

export function nextStep(before: Run, after?: Run) {
  if (after && before.median !== null && after.median !== null && before.failed === 0 && after.failed === 0) {
    const saved = before.median - after.median;
    if (saved >= 20) return `The retest was ${saved} ms faster. If you changed one thing, keep it in place and repeat to check whether the improvement holds.`;
    if (saved <= -20) return 'The retest was slower. Repeat under the same conditions before drawing a conclusion.';
  }
  const current = after ?? before;
  if (current.failed) return 'Some requests failed. Check whether another website opens, then try this check again. Failure can come from your connection or the test server.';
  if ((current.spread ?? 0) >= 40) return 'Response time varied during the check. Pause one large transfer or cloud sync, then retest. If nothing is transferring, try moving closer to your Wi-Fi router.';
  return 'Try the check while the lag is happening. Pause one large upload or download, then retest to see whether it changes the result.';
}

export async function sampleResponse(signal: AbortSignal): Promise<number | null> {
  const started = performance.now();
  try {
    const response = await fetch('/latency-check.txt', {
      cache: 'no-store',
      credentials: 'omit',
      signal: AbortSignal.any([signal, AbortSignal.timeout(2500)]),
    });
    const body = await response.text();
    return response.ok && body.trim() === 'latencylens-check-v1' ? performance.now() - started : null;
  } catch {
    return null;
  }
}
