import type { NetworkMeasurement } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Trace({measurement: m}: {measurement: NetworkMeasurement}) {
  const pts=m.points, W=860,H=226,L=33,R=15,T=12,B=23;
  if (!pts.length) return <p className="empty-chart">No timing samples supplied. Summary metrics remain available.</p>;
  const max=Math.max(100,...pts.map(p=>p.latencyMs))*1.1;
  const x=(i:number)=>L+i/Math.max(1,pts.length-1)*(W-L-R), y=(v:number)=>H-B-v/max*(H-B-T);
  const path=pts.map((p,i)=>`${i===0?'M':'L'}${x(i).toFixed(1)},${y(p.latencyMs).toFixed(1)}`).join(' ');
  const cut=pts.findIndex(p=>p.phase==='loaded');
  return <svg role="img" aria-label={`${m.source === 'sample' ? 'Synthetic' : 'Imported'} latency in milliseconds, samples in capture order`} viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none">
    {[0,.25,.5,.75,1].map((f,i)=><g key={i}><line x1={L} x2={W-R} y1={y(max*f)} y2={y(max*f)} stroke="#e4e7eb" strokeDasharray="4 5"/><text x="0" y={y(max*f)+3} fill="#667085" fontSize="11">{Math.round(max*f)}</text></g>)}
    {cut>0&&<><rect x={x(cut)} width={W-R-x(cut)} y="0" height={H-B} fill="#f59e0b" fillOpacity=".04"/><line x1={x(cut)} x2={x(cut)} y1="0" y2={H-B} stroke="#c9a96d" strokeDasharray="4 4"/><text x={x(cut)+10} y="16" fill="#94621a" fontSize="11">LOADED PHASE</text></>}
    <path d={path} fill="none" stroke="#147d64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {pts.map((p,i)=><circle key={i} cx={x(i)} cy={y(p.latencyMs)} r="2.5" fill={p.phase==='loaded'?'#b7791f':'#147d64'}/>)}
    <text x={L} y={H-3} fill="#667085" fontSize="10">START</text><text x={W-R} textAnchor="end" y={H-3} fill="#667085" fontSize="10">CAPTURE END</text>
  </svg>;
}
export function LatencyPanel({measurement: m}: {measurement: NetworkMeasurement}) {
  const value=(n:number|null,unit:string)=>n === null ? '—' : `${n.toFixed(1)} ${unit}`;
  return <Card id="timeline" className="latency-panel"><CardHeader><div><CardTitle>Latency timeline</CardTitle><CardDescription>Samples in capture order · milliseconds</CardDescription></div><Badge>{m.source === 'sample' ? 'Synthetic' : 'Approximate timing'}</Badge></CardHeader><CardContent><div className="chart-legend"><span><i/>Idle</span><span><i className="loaded"/>Loaded</span></div><Trace measurement={m}/><dl className="measurement-details">{[['Jitter',value(m.jitterMs,'ms')],['Packet loss',value(m.packetLossPct,'%')],['Download',value(m.downloadMbps,'Mbps')],['Upload',value(m.uploadMbps,'Mbps')]].map(([label,text])=><div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl></CardContent></Card>;
}
