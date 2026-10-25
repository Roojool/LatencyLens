'use client';
import { useRef, useState } from 'react';
import { sampleMeasurement } from '@/lib/sample';
import { measurementSchema, type DiagnosticResponse, type NetworkMeasurement } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { MetricCards } from '@/components/dashboard/metric-cards';
import { LatencyPanel } from '@/components/dashboard/latency-panel';
import { DiagnosisPanels } from '@/components/dashboard/diagnosis-panels';

export default function Page() {
  const [measurement, setMeasurement] = useState<NetworkMeasurement>(sampleMeasurement);
  const [result, setResult] = useState<DiagnosticResponse | null>(null);
  const [operation, setOperation] = useState<'import' | 'diagnose' | null>(null);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const busy = operation !== null;
  async function diagnose() {
    setOperation('diagnose'); setError(''); setResult(null);
    try {
      const response = await fetch('/api/diagnose', {method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify(measurement),signal:AbortSignal.timeout(80000)});
      if (!response.ok) throw new Error();
      setResult(await response.json());
    } catch { setError('Diagnosis could not complete. Check the local app and worker, then try again.'); }
    finally { setOperation(null); }
  }
  async function importJSON(file?: File) {
    if (!file) return;
    setOperation('import'); setError('');
    try {
      if (file.size > 128 * 1024) throw new Error();
      setMeasurement(measurementSchema.parse(JSON.parse(await file.text()))); setResult(null);
    } catch { setError('Import a valid LatencyLens measurement JSON file, up to 128 KiB.'); }
    finally { setOperation(null); }
  }
  const synthetic = measurement.source === 'sample';
  return <DashboardShell>
    <div className="page-heading"><div><p className="eyebrow">YOUR CONNECTION, EXPLAINED</p><h1>Network overview</h1><p className="muted">A clearer picture of latency under load.</p></div>
      <div className="actions"><input ref={fileInput} hidden type="file" accept=".json,application/json" aria-label="Measurement JSON file" disabled={busy} onChange={e => {const file=e.currentTarget.files?.[0];e.currentTarget.value='';void importJSON(file);}} />
        <Button variant="outline" disabled={busy} onClick={() => fileInput.current?.click()}><span aria-hidden="true">↑</span>{operation === 'import' ? 'Importing…' : 'Import JSON'}</Button>
        <Button disabled={busy} onClick={() => void diagnose()}><span aria-hidden="true">✦</span>{operation === 'diagnose' ? 'Analyzing…' : 'Run diagnosis'}</Button></div>
    </div>
    <div className="source-notice"><span className="source-symbol" aria-hidden="true">ⓘ</span><div><strong>{synthetic ? 'Synthetic demonstration' : measurement.source === 'local-https-probe' ? 'Imported HTTPS estimate' : 'Imported browser estimate'}</strong><p>{synthetic ? 'These values are simulated, not readings from your connection.' : 'Approximate timing, not ICMP or a controlled link-capacity test.'}</p></div><span className="dataset-id">{measurement.id}</span></div>
    {error && <p role="alert" className="error">{error}</p>}
    <p role="status" className="sr-only">{busy ? `${operation === 'import' ? 'Importing measurement' : 'Analyzing measurement; fallback may take up to 75 seconds'}.` : result ? 'Diagnosis complete. Report and execution status updated.' : 'Measurement ready.'}</p>
    <MetricCards measurement={measurement} diagnosis={result?.diagnosis}/><LatencyPanel measurement={measurement}/><DiagnosisPanels result={result} busy={operation === 'diagnose'}/>
    <footer><span>LatencyLens <span className="footer-dot">·</span> Open-source network literacy</span><span>Read-only guidance. Deterministic scoring.</span></footer>
  </DashboardShell>;
}
