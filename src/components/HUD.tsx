import { Activity, Radio, ShieldCheck } from 'lucide-react';
import type { ExecutionEvent, MissionMetrics, WorldLayer } from '../lib/types';

const layers: { key: WorldLayer; n: string; title: string; sub: string }[] = [
  { key: 'ORBIT', n: '01', title: 'ORBIT', sub: 'ORBITAL INTELLIGENCE' },
  { key: 'GLOBE', n: '02', title: 'GLOBE', sub: 'ATLAS' },
  { key: 'WORLD_GRID', n: '03', title: 'WORLD GRID', sub: 'GOVERNANCE' },
  { key: 'CITY', n: '04', title: 'CITY', sub: 'AGENTROPOLIS WORLD' },
  { key: 'WORLDQ', n: '05', title: 'WORLDQ', sub: 'STREAM' },
];

const copy: Record<WorldLayer, { code: string; title: string; body: string; tags: string; action: string }> = {
  ORBIT: { code: '01 · ORBIT', title: 'Know what is happening above us.', body: 'Orbital intelligence for external signals, satellites, networks, and real-time systems.', tags: 'signals · satellites · feeds · events', action: 'SCAN ORBIT' },
  GLOBE: { code: '02 · ATLAS', title: 'Know where.', body: 'Geospatial intelligence. ATLAS knows WHERE.', tags: 'Earth · geography · borders · routes · spatial provenance', action: 'EXPLORE THE WORLD' },
  WORLD_GRID: { code: '03 · AGENTROPOLIS-WORLD-GRID', title: 'Know who governs there.', body: 'International governance and jurisdiction intelligence layer. WORLD GRID describes authority context. It does not grant execution permission.', tags: 'countries · governments · jurisdictions · regulators · treaties', action: 'INSPECT GOVERNANCE' },
  CITY: { code: '04 · AGENTROPOLIS-WORLD', title: 'See what is happening inside Agentropolis.', body: 'The persistent city. Descent enters the existing AGENTROPOLIS world.', tags: 'city-state · districts · buildings · agents · civic state', action: 'OPEN DISTRICTS' },
  WORLDQ: { code: '05 · WORLDQ', title: 'Watch agents execute.', body: 'The spatial execution stream. Human intent descends through mandate, policy, tools, verification, receipt, and audit.', tags: 'agents · execution · QRAG · receipts · audit', action: 'RUN ASTRA MISSION' },
};

function LayerRail({ selected, onSelect }: { selected: WorldLayer; onSelect: (layer: WorldLayer) => void }) {
  return <nav className="layer-rail" aria-label="WORLDQ layers">{layers.map((layer) => (
    <button key={layer.key} className={selected === layer.key ? 'active' : ''} onClick={() => onSelect(layer.key)}>
      <span className="layer-num">{layer.n}</span><span><strong>{layer.title}</strong><small>{layer.sub}</small></span>
    </button>
  ))}</nav>;
}

export function HUD({ events, metrics, mode, selectedLayer, onSelectLayer }: {
  events: ExecutionEvent[];
  metrics: MissionMetrics;
  mode: 'live' | 'demo';
  selectedLayer: WorldLayer;
  onSelectLayer: (layer: WorldLayer) => void;
}) {
  const latest = events.at(-1);
  const current = copy[selectedLayer];
  const totalTokens = events.reduce((sum, e) => sum + (e.tokens ?? 0), 0);
  const totalCost = events.reduce((sum, e) => sum + (e.costUsd ?? 0), 0);

  return <div className="world-hud">
    <header className="world-topbar">
      <div className="brand-lockup"><div className="brand-mark">A</div><div><div className="brand"><span>AGENT</span><b>ROPOLIS</b></div><small>A CITY BUILT FOR AGENTS.</small></div></div>
      <div className="world-heading"><strong>FROM CITY STREETS TO ORBITAL SPACE</strong><span>AGENTROPOLIS IS BEING BUILT AS ONE CONNECTED INTELLIGENCE CIVILIZATION.</span></div>
      <div className="display-modes"><span>CALM</span><span>CONTRAST</span><span>DENSITY</span><span>FULL</span><b>ADAPT</b><span>LITE</span><span>MIN</span></div>
    </header>

    <LayerRail selected={selectedLayer} onSelect={onSelectLayer} />

    <section className="world-card world-copy-card">
      <div className="eyebrow">{current.code}</div>
      <h1>{current.title}</h1>
      <p>{current.body}</p>
      <strong className="tags">{current.tags}</strong>
      <div className="demo-meta">{mode === 'live' ? 'ASTRA LIVE' : 'DEMO'} · NEURO BUILDS · zoom {selectedLayer === 'CITY' ? '0.80' : selectedLayer === 'WORLD_GRID' ? '0.35' : '0.23'}</div>
      <button className="primary-action" onClick={() => onSelectLayer(selectedLayer === 'WORLDQ' ? 'GLOBE' : 'WORLDQ')}>{current.action}</button>
      <button className="secondary-action" onClick={() => onSelectLayer('CITY')}>ENTER AGENTROPOLIS</button>
    </section>

    <aside className="world-card system-hud">
      <div className="hud-head"><span>HUD</span><b>{layers.find((l) => l.key === selectedLayer)?.n}</b><span>· {selectedLayer.replace('_', ' ')}</span><em>{mode === 'live' ? 'ASTRA LIVE' : 'DEMO'}</em></div>
      <h2>{current.title}</h2>
      <div className="telemetry">District {selectedLayer === 'CITY' ? 'mission' : '--'} · Mission {latest?.kind ?? '--'} · Agents {metrics.activeAgents}</div>
      <div className="telemetry">Runtime {mode === 'live' ? 'ASTRA' : 'DEMO'} · tokens {totalTokens.toLocaleString()} · drift low · entropy contained</div>
      <div className="permission">Permission APPROVAL REQUIRED · risk HIGH</div>
      <div className="corridor">IDENTITY <b>MANDATE</b> PLAN POLICY EXECUTE RECEIPT AUDIT</div>
      <div className="qrag-live">QRAG · {latest?.qragStep?.toUpperCase() ?? 'OBSERVE'} · {latest?.summary ?? 'No object selected. Execute remains gated.'}</div>
      <div className="mini-metrics"><span><b>{metrics.runningTasks}</b> TASKS</span><span><b>{(metrics.verifiedRate * 100).toFixed(0)}%</b> VERIFIED</span><span><b>${totalCost.toFixed(3)}</b> COST</span></div>
      <button className="kill-switch"><ShieldCheck size={17}/> KILL SWITCH · {mode === 'live' ? 'ARMED' : 'DEMO'}</button>
    </aside>

    <section className="trace-strip">
      <div className="trace-title"><Activity size={14}/> EXECUTION TRACE</div>
      {events.slice(-4).reverse().map((evt) => <div className="trace-event" key={evt.id}><time>{new Date(evt.ts).toLocaleTimeString([], { hour12: false })}</time><b>{evt.kind}</b><span>{evt.summary}</span></div>)}
    </section>

    <div className={`stream-pill ${mode}`}><Radio size={14}/>{mode === 'live' ? 'ASTRA LIVE STREAM' : 'WORLDQ DEMO STREAM'}</div>
  </div>;
}
