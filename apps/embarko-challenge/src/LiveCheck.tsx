import { useEffect, useRef, useState } from 'react';
import { nextStep, sampleResponse, summarize, type Run } from './connection';

const SAMPLE_COUNT = 6;

export function LiveCheck() {
  const [before, setBefore] = useState<Run>();
  const [after, setAfter] = useState<Run>();
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function measure(retest: boolean) {
    if (controller.current) return;
    const check = new AbortController();
    controller.current = check;
    setRunning(true);
    setProgress(0);
    setCopyStatus('');
    const samples: (number | null)[] = [];
    for (let i = 0; i < SAMPLE_COUNT && !check.signal.aborted; i++) {
      samples.push(await sampleResponse(check.signal));
      if (!check.signal.aborted) setProgress(samples.length);
      if (i < SAMPLE_COUNT - 1 && !check.signal.aborted) await new Promise(resolve => setTimeout(resolve, 400));
    }
    if (!check.signal.aborted) {
      const result = summarize(samples);
      if (retest) setAfter(result);
      else {
        setBefore(result);
        setAfter(undefined);
      }
    }
    if (controller.current === check) {
      controller.current = null;
      setRunning(false);
    }
  }

  function resultCard(label: string, result: Run) {
    return <div className="comparison-card">
      <h3>{label}</h3>
      <strong>{result.median === null ? 'Unavailable' : `${result.median} ms median`}</strong>
      <p>{result.spread === null ? 'Spread unavailable' : `${result.spread} ms spread`} · {result.failed}/{SAMPLE_COUNT} checks failed</p>
    </div>;
  }

  async function copyAdvice() {
    const data = { initial: before, retest: after };
    try {
      await navigator.clipboard.writeText(`Help me troubleshoot latency from these browser-to-site HTTP checks. Each run used six requests; median and spread are in milliseconds. These are not ping or packet loss, and include browser, network and server time. Give one low-risk change I can make and then retest. Treat causes as hypotheses. Do not change settings or ask for identifiers. Results: ${JSON.stringify(data)}`);
      setCopyStatus('Copied. Paste the prompt into your AI assistant.');
    } catch {
      setCopyStatus('Clipboard unavailable. You can copy the results above by selecting the text.');
    }
  }

  return <section id="live-check" tabIndex={-1} className="report-card live-check" aria-labelledby="live-title">
    <p className="eyebrow">Live HTTPS check</p>
    <h2 id="live-title">Check your connection</h2>
    <p>Measure how quickly this site responds. Run it while you notice lag, try one change, then compare a retest.</p>
    <div className="live-actions">
      <button className="primary" disabled={running} onClick={() => void measure(false)}>{before ? 'Start new check' : 'Run live check'}</button>
      {before && <button className="primary" disabled={running} onClick={() => void measure(true)}>Retest after a change</button>}
      {running && <button className="link" onClick={() => controller.current?.abort()}>Cancel check</button>}
    </div>
    <div aria-live="polite">{running ? `Checked ${progress} of ${SAMPLE_COUNT}` : before ? 'Check complete' : ''}</div>
    {before && <div className="live-results">
      <div className="comparison">{resultCard('First check', before)}{after && resultCard('Retest', after)}</div>
      <p><strong>What to try.</strong> {nextStep(before, after)}</p>
      <button className="link" disabled={running} onClick={() => void copyAdvice()}>Copy prompt for AI troubleshooting</button>
      <p role="status">{copyStatus}</p>
    </div>}
    <details><summary>What this check measures</summary><p>Six small HTTPS requests to this site, spaced 400 ms apart, with a 2.5 s timeout each. The first request may include connection setup. Spread is the slowest successful request minus the fastest. These times include server and browser overhead. They cannot identify your ISP, prove congestion, or measure ping, throughput, or packet loss. The app only sends the checks you request.</p></details>
  </section>;
}
