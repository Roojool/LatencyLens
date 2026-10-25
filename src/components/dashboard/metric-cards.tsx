import type { Diagnosis, NetworkMeasurement } from '@/lib/contracts';
import { Card } from '@/components/ui/card';

export function MetricCards({measurement: m, diagnosis: d}: {measurement: NetworkMeasurement; diagnosis?: Diagnosis}) {
  const metrics = [
    {label:'Idle latency',value:m.idleMedianMs.toFixed(1),unit:'ms',detail:'Baseline response time',symbol:'↔'},
    {label:'Loaded latency',value:m.loadedMedianMs.toFixed(1),unit:'ms',detail:'Response under demand',symbol:'↗'},
    {label:'Added delay',value:`+${(d?.deltaMs ?? Math.max(0,m.loadedMedianMs-m.idleMedianMs)).toFixed(1)}`,unit:'ms',detail:'Increase over the baseline',symbol:'△'},
    {label:'Heuristic score',value:d?.score ?? '—',unit:'/ 100',detail:'A heuristic, not a calibrated grade',symbol:'◎'},
  ];
  return <div className="metric-grid">{metrics.map(metric => <Card className="metric-card" key={metric.label}><div className="metric-label">{metric.label}<span aria-hidden="true">{metric.symbol}</span></div><p className="metric-value">{metric.value}<small>{metric.unit}</small></p><p className="metric-detail">{metric.detail}</p></Card>)}</div>;
}
