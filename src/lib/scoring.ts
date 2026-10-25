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
