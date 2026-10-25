// Lightweight read-only local HTTPS timing probe, not ICMP and not a formal bufferbloat grade.
// Usage: npm run probe > probe-output.json; then import that file into the LatencyLens UI.
const target = process.env.PROBE_TARGET || 'https://www.google.com/generate_204';
const loadUrl = process.env.PROBE_LOAD_URL || 'https://speed.cloudflare.com/__down?bytes=3000000';
const delay = ms => new Promise(r=>setTimeout(r,ms));
const sample = async () => {
 const st=performance.now();
 try { const r=await fetch(target,{method:'GET',cache:'no-store',signal:AbortSignal.timeout(10000)});await r.arrayBuffer();return Math.round((performance.now()-st)*10)/10; }
 catch {return null}
};
const median = values => {const sorted=[...values].sort((a,b)=>a-b);return sorted.length ? sorted[Math.floor(sorted.length/2)] : 0};
const idle=[];const loaded=[];
for(let i=0;i<7;i++){const val=await sample();if(val!==null)idle.push(val);await delay(150)}
if(idle.length<3)throw Error('Too few successful idle requests; check target connectivity');
const active=Array.from({length:2},async()=>{try{const r=await fetch(loadUrl,{cache:'no-store',signal:AbortSignal.timeout(12000)});await r.arrayBuffer()}catch{}});
for(let i=0;i<8;i++){const val=await sample();if(val!==null)loaded.push(val);await delay(130)}
await Promise.allSettled(active);
if(loaded.length<3)throw Error('Too few successful loaded requests');
const all=[...idle.map((latencyMs,at)=>({at,latencyMs,phase:'idle'})),...loaded.map((latencyMs,i)=>({at:i+idle.length,latencyMs,phase:'loaded'}))];
const jitters=all.slice(1).map((s,i)=>Math.abs(s.latencyMs-all[i].latencyMs));
const output={id:`https-probe-${Date.now()}`,source:'local-https-probe',createdAt:new Date().toISOString(),target,idleMedianMs:median(idle),loadedMedianMs:median(loaded),jitterMs:median(jitters),packetLossPct:null,downloadMbps:null,uploadMbps:null,points:all,notes:'HTTPS request timing includes DNS/TLS/server delay; concurrent bounded downloads generate some load, but may not saturate the link. Do not equate with ICMP or formal bufferbloat tests.'};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
