import { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { scenarios, simulate } from './simulation';
import { downloadSummary } from './summary';
import { LiveCheck } from './LiveCheck';
import './style.css';

type Result = ReturnType<typeof simulate>;

function Track({ latency, reference = false }: { latency: number; reference?: boolean }) {
  return <div className={reference ? 'track reference' : 'track'} aria-hidden="true">
    <i style={{ '--width': `${latency / 2.5}%`, '--duration': `${0.85 + latency / 95}s` } as CSSProperties}><b key={latency} /></i>
  </div>;
}

function App() {
  const [scenario, setScenario] = useState<string>(scenarios[0].id);
  const [load, setLoad] = useState(35);
  const [comparison, setComparison] = useState('');
  const [feedback, setFeedback] = useState('');
  const [exporting, setExporting] = useState(false);
  const result = simulate(scenario, load);
  const other = comparison ? simulate(comparison, load) : undefined;

  const reset = () => {
    setScenario(scenarios[0].id);
    setLoad(35);
    setComparison('');
    setFeedback('');
  };

  async function save() {
    setFeedback('');
    setExporting(true);
    try {
      await downloadSummary(result, other);
      setFeedback('PNG ready to save or share.');
    } catch {
      setFeedback('The PNG export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function resultCard(item: Result) {
    return <article className="comparison-card">
      <h3>{item.scenario.label}</h3>
      <p>{item.baseline} ms idle · {item.loaded} ms loaded</p>
      <strong>+{item.added} ms</strong>
      <span> added · {item.indicator}</span>
    </article>;
  }

  return <>
    <header className="top"><div className="wrap header">
      <a className="brand" href="#"><span aria-hidden="true">◈</span> LatencyLens</a>
      <a className="tag" href="#live-check"><i /> Live check</a>
    </div></header>
    <main className="wrap">
      <div className="hero">
        <div><p className="eyebrow">The Internet Congestion Lab</p>
          <h1>Fast internet.<br /><em>Why the lag?</em></h1>
        </div>
        <div className="intro">
          <p>Check a slow connection, try a change, and see whether it helped.</p>
          <a className="primary" href="#experiment">Try the congestion experiment <span aria-hidden="true">↓</span></a>
        </div>
      </div>

      <LiveCheck />

      <section id="experiment" className="lab" tabIndex={-1} aria-labelledby="experiment-title">
        <div className="controls">
          <div className="control-heading"><h2 id="experiment-title">The experiment</h2><button onClick={reset} className="link">Reset</button></div>
          <fieldset>
            <legend>Activity</legend>
            <div className="choices">{scenarios.map((item, index) => <button key={item.id} type="button" aria-pressed={result.scenario.id === item.id}
              onClick={() => {
                if (item.id === comparison) setComparison(result.scenario.id);
                setScenario(item.id);
                setFeedback('');
              }}><span aria-hidden="true">{['◉', '✥', '▤', '↓'][index]}</span>{item.label}</button>)}</div>
          </fieldset>
          <div className="slider-heading"><label htmlFor="load">Simulated network load</label><output htmlFor="load">{result.load}%</output></div>
          <input id="load" type="range" min="0" max="100" step="1" value={result.load}
            onChange={event => { setLoad(event.currentTarget.valueAsNumber); setFeedback(''); }} />
          <div className="range-labels" aria-hidden="true"><span>Idle</span><span>Saturated</span></div>
          <div className="presets">
            <button aria-pressed={result.load === 10} onClick={() => { setLoad(10); setFeedback(''); }}>Healthy</button>
            <button aria-pressed={result.load === 95} onClick={() => { setLoad(95); setFeedback(''); }}>Congested</button>
          </div>
        </div>

        <div className="visual">
          <div className="visual-heading"><h2>Response time</h2><span>SIMULATION · ROUND TRIP</span></div>
          <p>Watch how long each request has to wait.</p>
          <div className="lanes">
            <div className="lane-label"><span><i /> Idle reference</span><strong>{result.baseline} <small>ms</small></strong></div>
            <Track latency={result.baseline} reference />
            <div className="lane-label"><span><i /> Under your load</span><strong>{result.loaded} <small>ms</small></strong></div>
            <Track latency={result.loaded} />
            <div className="scale" aria-hidden="true"><span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>250 ms</span></div>
          </div>
          <div className="verdict">
            <div><span className="eyebrow">Added latency</span><strong>+{result.added} <small>ms</small></strong></div>
            <div><span className="eyebrow">Congestion indicator</span><strong className="indicator">{result.indicator}</strong></div>
          </div>
        </div>
      </section>

      <div className="report">
        <section className="report-card" aria-labelledby="impact-title">
          <p className="eyebrow">What it feels like</p>
          <h2 id="impact-title">{result.scenario.label}</h2>
          <p>At {result.load}% load, each simulated round trip takes {result.added} ms longer than at idle. {result.scenario.description}</p>
          <p><strong>Try this in real life.</strong> {result.scenario.advice}</p>
        </section>
        <section className="report-card" aria-labelledby="compare-title">
          <p className="eyebrow">Same load, different activity</p>
          <h2 id="compare-title">Compare and share</h2>
          <label className="sr-only" htmlFor="comparison">Compare with</label>
          <select id="comparison" value={comparison} onChange={event => { setComparison(event.target.value); setFeedback(''); }}>
            <option value="">Compare with another activity</option>
            {scenarios.filter(item => item.id !== result.scenario.id).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          {other && <div className="comparison">{resultCard(result)}{resultCard(other)}</div>}
          <button className="primary" onClick={save} disabled={exporting}>{exporting ? 'Preparing PNG…' : 'Download summary PNG'} <span aria-hidden="true">↓</span></button>
          <div role="status">{feedback}</div>
        </section>
      </div>

      <section className="method" aria-labelledby="method-title">
        <h2 id="method-title">Speed is capacity. Latency is waiting.</h2>
        <p>Download speed tells you how much data can move each second. Latency tells you how long a round trip takes. When traffic fills a connection, small requests can queue behind big transfers.</p>
        <details><summary>How this simulation works</summary><p>Each activity starts with an illustrative idle latency. The lab squares the load percentage, divides by 50, and rounds to the nearest millisecond to model a queue that builds faster as the link fills. Total delay is capped at 250 ms.</p><p>The indicator uses added delay: 0 ms means no added delay, 1–24 ms means short queue, 25–99 ms means queue building, and 100 ms or more means long queue. These are teaching bands. The animation is slowed down, and all times are simulated. The lab makes no measurements of your connection.</p></details>
      </section>
    </main>
    <footer className="wrap footer"><strong>◈ LatencyLens</strong><a href="https://github.com/Roojool/LatencyLens">Research project and contributors ↗</a></footer>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
