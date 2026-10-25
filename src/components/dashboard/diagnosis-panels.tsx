import type { DiagnosticResponse } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DiagnosisPanels({result, busy}: {result: DiagnosticResponse | null; busy: boolean}) {
  const d=result?.diagnosis;
  const mode = result ? {temporal:'Completed in Temporal',direct:'Direct execution','direct-fallback':'Direct fallback'}[result.workflowMode] : 'Awaiting diagnosis';
  return <div id="diagnosis" className="diagnosis-grid" aria-busy={busy}>
    <Card><CardHeader><div><CardTitle>Diagnostic report</CardTitle><CardDescription>Evidence first. Hypotheses second.</CardDescription></div><Badge variant={d?.aiUsed ? 'success' : 'neutral'}>{d ? d.aiUsed ? d.model : 'Rule-based' : busy ? 'Analyzing' : 'Ready to analyze'}</Badge></CardHeader><CardContent>
      {d ? <><div className="report-heading"><Badge variant={d.severity === 'healthy' ? 'success' : 'warning'}>{d.severity.toUpperCase()}</Badge><h3>{d.headline}</h3></div><p className="report-copy">{d.explanation}</p><h3 className="section-label">Recommended next steps</h3><ol className="recommendations">{d.recommendations.map((text,i)=><li key={i}>{text}</li>)}</ol><div className="limitations"><h3 className="section-label">Keep in mind</h3><ul>{d.limitations.map((text,i)=><li key={i}>{text}</li>)}</ul></div></> : <div className="empty-report"><span className={busy ? 'spinner' : 'empty-icon'} aria-hidden="true">{busy ? '' : '⌁'}</span><strong>{busy ? 'Reading the evidence…' : 'From latency to understanding'}</strong><p>{busy ? 'A bounded direct fallback keeps the report available if orchestration fails.' : 'Run a diagnosis for an explanation, supporting evidence and safe next steps.'}</p></div>}
    </CardContent></Card>
    <Card><CardHeader><div><CardTitle>Execution & evidence</CardTitle><CardDescription>A transparent path to your result</CardDescription></div><Badge variant={result?.workflowMode === 'temporal' ? 'success' : 'neutral'}>{mode}</Badge></CardHeader><CardContent>
      <ol className="workflow-steps">{[['Validate measurement',result ? 'Complete' : 'Ready'],['Deterministic scoring',d ? 'Complete' : 'On request'],['Model explanation',d ? d.aiUsed ? 'Validated' : 'Rule-based fallback' : 'On request'],['Execution',busy ? 'In progress' : mode]].map(([label,status],i)=><li key={label}><span className="step-number">{i+1}</span><span>{label}</span><small>{status}</small></li>)}</ol>
      {result?.workflowId && <div className="workflow-id"><span>COMPLETED WORKFLOW ID</span><code>{result.workflowId}</code></div>}
      {result?.warning && <p className="warning" role="status">{result.warning}</p>}
      {d && <div className="evidence"><h3 className="section-label">Report evidence</h3><ul>{d.evidence.map((text,i)=><li key={i}>{text}</li>)}</ul></div>}
    </CardContent></Card>
  </div>;
}
