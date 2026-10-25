import type { Diagnosis, NetworkMeasurement, Severity } from './contracts';

/** Heuristic demo score. Not an official latency-under-load standard or measured grade. */
export function scoreMeasurement(m: NetworkMeasurement): Diagnosis {
  const deltaMs = Math.max(0, m.loadedMedianMs - m.idleMedianMs);
  const ratio = m.idleMedianMs ? m.loadedMedianMs / m.idleMedianMs : 1;
  const severity: Severity = deltaMs >= 100 || ratio >= 4 ? 'high' : deltaMs >= 30 || ratio >= 2 ? 'moderate' : 'healthy';
  const score = Math.max(0, Math.min(100, Math.round(100 - deltaMs * .3 - Math.max(0,ratio - 1) * 5 - (m.jitterMs ?? 0) * .1)));
  const evidence = [
    `Idle median: ${m.idleMedianMs.toFixed(1)} ms`,
    `Loaded median: ${m.loadedMedianMs.toFixed(1)} ms`,
    `Added latency: +${deltaMs.toFixed(1)} ms (${ratio.toFixed(1)}× idle)`,
  ];
  if (m.jitterMs !== null) evidence.push(`Observed jitter: ${m.jitterMs.toFixed(1)} ms`);
  const recommendations = severity === 'healthy'
    ? ['Repeat at different times to establish a baseline.', 'Test on wired and Wi-Fi connections separately.']
    : ['Repeat the loaded test to confirm the pattern.', 'Try queue management (SQM / CAKE / fq_codel) if your router supports it.', 'Compare Ethernet against Wi-Fi before changing router settings.'];
  return {
    severity, score, deltaMs, ratio,
    headline: severity === 'high' ? 'High loaded-latency inflation detected' : severity === 'moderate' ? 'Moderate loaded-latency inflation' : 'No major loaded-latency inflation in this sample',
    evidence, recommendations,
    explanation: 'This is a rule-based preliminary interpretation of the supplied measurements. AI analysis has not been applied.',
    aiUsed: false, model: null,
    limitations: [
      'The health score uses heuristic thresholds, not an official calibrated grade.',
      m.source === 'local-https-probe' ? 'HTTPS request timing includes DNS/TLS/server delays; it is not ICMP RTT or a controlled link-capacity test.' : m.source === 'sample' ? 'This is a synthetic demonstration dataset, not a live measurement.' : 'Browser estimates cannot replace an OS-level diagnostic probe.'
    ]
  };
}

/** Rounds to one decimal so comparisons never surface float noise. */
const round1 = (n: number) => Math.round(n * 10) / 10;

export type ComparisonDirection = 'improved' | 'regressed' | 'unchanged';
export type DiagnosisComparison = {
  direction: ComparisonDirection;
  scoreDelta: number; deltaMsDelta: number; ratioDelta: number;
  severityBefore: Severity; severityAfter: Severity; severityChanged: boolean;
  evidence: string[]; limitations: string[];
};

/**
 * Compares two deterministic diagnoses. Pure: it reads the rule engine's output
 * and never recomputes or alters score/severity/deltaMs/ratio. Direction follows
 * deltaMs, the product's core measure, with score as the tiebreaker.
 */
export function compareDiagnoses(before: Diagnosis, after: Diagnosis): DiagnosisComparison {
  const deltaMsDelta = round1(after.deltaMs - before.deltaMs);
  const scoreDelta = round1(after.score - before.score);
  const ratioDelta = round1(after.ratio - before.ratio);
  const direction: ComparisonDirection =
    deltaMsDelta < 0 ? 'improved' : deltaMsDelta > 0 ? 'regressed'
    : scoreDelta > 0 ? 'improved' : scoreDelta < 0 ? 'regressed' : 'unchanged';
  return {
    direction, scoreDelta, deltaMsDelta, ratioDelta,
    severityBefore: before.severity, severityAfter: after.severity,
    severityChanged: before.severity !== after.severity,
    evidence: [
      `Added latency: ${round1(before.deltaMs)} ms to ${round1(after.deltaMs)} ms (${deltaMsDelta >= 0 ? '+' : ''}${deltaMsDelta} ms)`,
      `Heuristic score: ${before.score} to ${after.score} (${scoreDelta >= 0 ? '+' : ''}${scoreDelta})`,
      `Severity: ${before.severity} to ${after.severity}`,
    ],
    limitations: [
      'A before/after comparison is not a controlled experiment; other conditions may have changed between the two captures.',
      'Both sides must come from the same measurement source to be comparable.',
    ],
  };
}
