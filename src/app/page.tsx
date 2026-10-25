'use client';
import { useState } from 'react';
import { sampleMeasurement } from '@/lib/sample';
import { measurementSchema, type DiagnosticResponse, type NetworkMeasurement } from '@/lib/contracts';

function Trace({m}:{m:NetworkMeasurement}) {
 const pts=m.points; const W=860,H=226,L=33,R=15,T=12,B=23;
 const max=Math.max(100,...pts.map(x=>x.latencyMs))*1.1;
 const x=(i:number)=>L+(i/(Math.max(1,pts.length-1)))*(W-L-R);
 const y=(v:number)=>H-B-v/max*(H-B-T);
 const path=pts.map((p,i)=>`${i===0?'M':'L'}${x(i).toFixed(1)},${y(p.latencyMs).toFixed(1)}`).join(' ');
 const cut=pts.findIndex(p=>p.phase==='loaded');
 return <svg role="img" aria-label="Observed latency trace" viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none">
  {[0,.25,.5,.75,1].map((f,i)=><g key={i}><line x1={L} x2={W-R} y1={y(max*f)} y2={y(max*f)} stroke="#28374b" strokeDasharray="5 6"/><text x="1" y={y(max*f)+3} fill="#778ba6" fontSize="11">{Math.round(max*f)}</text></g>)}
  {cut>0&&<><rect x={x(cut)} width={W-R-x(cut)} y="0" height={H-B} fill="#f97316" fillOpacity=".045"/><line x1={x(cut)} x2={x(cut)} y1="0" y2={H-B} stroke="#ec8d57" strokeDasharray="4 4"/><text x={x(cut)+10} y="20" fill="#de9a70" fontSize="12">LOADED</text></>}
  <path d={path} fill="none" stroke="#55d8da" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  {pts.map((p,i)=><circle key={i} cx={x(i)} cy={y(p.latencyMs)} r="2.8" fill={p.phase==='loaded'?'#f9ab66':'#55d8da'}/>)}
  <text x={L} y={H-3} fill="#778ba6" fontSize="11">START</text><text x={W-R} textAnchor="end" y={H-3} fill="#778ba6" fontSize="11">SAMPLE END</text>
 </svg>
}
export default function Page() {
 const [m,setM]=useState<NetworkMeasurement>(sampleMeasurement);
 const [result,setResult]=useState<DiagnosticResponse|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 async function diagnose(){setBusy(true);setError('');setResult(null);try{const r=await fetch('/api/diagnose',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(m)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Diagnosis failed');setResult(data);}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false)}}
 async function importJSON(f?:File){if(!f)return;try{const raw=JSON.parse(await f.text());const parsed=measurementSchema.parse(raw);setM(parsed);setResult(null);setError('');}catch(e){setError('Invalid measurement JSON: '+(e instanceof Error?e.message:String(e)))}}
 const d=result?.diagnosis;
 return <main className="shell">
  <header className="top"><div className="identity"><div className="mark">⌁</div><div><strong>LATENCY<span>LENS</span></strong><small>NETWORK INTELLIGENCE PLATFORM</small></div></div><div className="top-right"><span className="live"><b/> HACK DAY BUILD</span><span className="avatar">LL</span></div></header>
  <div className="columns"><aside className="sidebar"><div className="sideheading">WORKSPACE</div><div className="nav active">◫ &nbsp; Overview</div><div className="nav">⌁ &nbsp; Diagnostics</div><div className="nav">◷ &nbsp; History (soon)</div><div className="nav">▦ &nbsp; Compare (soon)</div><div className="sideheading divide">INTEGRATIONS</div><div className="integration"><span>◆</span> Gemma 4 <small>API optional</small></div><div className="integration"><span>↻</span> Temporal <small>Opt-in</small></div><div className="integration"><span>▣</span> Kepler <small>DevOps tool</small></div><div className="sidetail">Open-source AI diagnostics<br/>Hacktoberfest · Pune 2026</div></aside>
  <section className="body"><div className="intro"><div><p className="eyebrow">DIAGNOSTICS / NETWORK HEALTH</p><h1>Network overview<span className="dot">.</span></h1><p className="muted">Understand what happens to your connection under load.</p></div><div className="actions"><label className="secondarybtn">↑ Import measurement <input type="file" accept="application/json,.json" hidden onChange={e=>void importJSON(e.target.files?.[0])}/></label><button className="primarybtn" disabled={busy} onClick={()=>void diagnose()}>{busy?'Analyzing…':'✦ Run AI diagnosis'}</button></div></div>
  <div className="notice">{m.source==='sample'?'DEMO DATASET — These values are synthetic, not measured from your connection.':`SOURCE: ${m.source.toUpperCase()} — ${m.target}`}</div>
  <div className="cards"><div className="metric"><span>IDLE LATENCY</span><div><strong>{m.idleMedianMs.toFixed(1)}</strong> <small>ms</small></div><p>Baseline response time</p></div><div className="metric"><span>LOADED LATENCY</span><div><strong>{m.loadedMedianMs.toFixed(1)}</strong> <small>ms</small></div><p>Under concurrent demand</p></div><div className="metric"><span>ADDED DELAY</span><div><strong className="warn">+{Math.max(0,m.loadedMedianMs-m.idleMedianMs).toFixed(0)}</strong> <small>ms</small></div><p>Latency inflation</p></div><div className="metric"><span>NETWORK SCORE</span><div><strong>{d?.score??'—'}</strong> <small>/ 100</small></div><p>Heuristic, not standard grade</p></div></div>
  <section className="panel"><div className="panelhead"><div><h2>Latency timeline</h2><p>Observed or imported HTTP timing samples</p></div><span className="chip">● IDLE <span style={{color:'#e5a477'}}>● LOADED</span></span></div><Trace m={m}/></section>
  <div className="bottom"><section className="panel"><div className="panelhead"><div><h2>AI diagnostic report</h2><p>Evidence-led network troubleshooting</p></div><span className="chip">{d?d.aiUsed?`GEMMA · ${d.model}`:'RULE-BASED':'PENDING'}</span></div>{d?<><div className={`severity ${d.severity}`}>{d.severity.toUpperCase()} · {d.headline}</div><p className="report">{d.explanation}</p><h3>Recommended next steps</h3><ol>{d.recommendations.map((x,i)=><li key={i}>{x}</li>)}</ol><p className="micro">{d.limitations[0]}</p></>:<div className="empty">Run a diagnosis to generate a measured, explainable health report.</div>}</section><section className="panel"><div className="panelhead"><div><h2>Workflow & evidence</h2><p>Traceability and execution</p></div></div><div className="steps"><div><b>01</b><span>Dataset validation</span><em>Ready</em></div><div><b>02</b><span>Deterministic scoring</span><em>{d?'Done':'Ready'}</em></div><div><b>03</b><span>Gemma 4 explanation</span><em>{d?d.aiUsed?'Done':'Skipped':'Waiting'}</em></div><div><b>04</b><span>Temporal orchestration</span><em>{result?.workflowMode??'Waiting'}</em></div></div>{result?.workflowId&&<p className="micro">Workflow ID: {result.workflowId}</p>}{result?.warning&&<p className="warning">{result.warning}</p>}<div className="evidence">{d?.evidence.map((x,i)=><div key={i}>· {x}</div>)}</div></section></div>
  {error&&<div role="alert" className="error">{error}</div>}
  <footer>LATENCYLENS / 0.1.0 &nbsp; • &nbsp; Open source &nbsp; • &nbsp; Network measurements are never inferred by the LLM</footer></section></div>
 </main>
}
