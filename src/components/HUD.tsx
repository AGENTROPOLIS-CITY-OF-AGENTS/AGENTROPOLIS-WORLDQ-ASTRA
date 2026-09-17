import { Activity, Bot, CheckCircle2, CircleDollarSign, Cpu, FileCheck2, Gauge, Radio, RotateCcw, ShieldCheck, Waypoints } from 'lucide-react';
import type { ExecutionEvent, MissionMetrics, QragStep } from '../lib/types';

const qrag: { key: QragStep; label: string }[] = [
  { key: 'retrieve', label: 'Retrieve' },
  { key: 'evaluate', label: 'Evaluate' },
  { key: 'execute', label: 'Execute' },
  { key: 'verify', label: 'Verify' },
  { key: 'requery', label: 'Re-query' },
];

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="metric"><div className="metric-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>;
}

export function HUD({ events, metrics, mode }: { events: ExecutionEvent[]; metrics: MissionMetrics; mode: 'live' | 'demo' }) {
  const latest = events.at(-1);
  const activeStep = latest?.qragStep;
  const totalCost = events.reduce((sum, e) => sum + (e.costUsd ?? 0), 0);
  const totalTokens = events.reduce((sum, e) => sum + (e.tokens ?? 0), 0);

  return (
    <div className="hud" aria-label="AGENTROPOLIS mission control">
      <header className="topbar glass">
        <div>
          <div className="brand"><span>AGENT</span><b>ROPOLIS</b></div>
          <div className="kicker">WORLDQ · SPATIAL EXECUTION OBSERVATORY</div>
        </div>
        <div className="status"><Radio size={16} /><span>{mode === 'live' ? 'LIVE AGENT STREAM' : 'DEMO STREAM'}</span></div>
      </header>

      <section className="left-rail glass">
        <div className="panel-title"><ShieldCheck size={18}/> EXECUTION ENVELOPE</div>
        <p className="muted">Human mandate stays above agent action. Every tool call runs inside explicit scope, permission, budget, and retry bounds.</p>
        <div className="metrics-grid">
          <Metric icon={<Bot size={17}/>} value={String(metrics.activeAgents)} label="active agents" />
          <Metric icon={<Activity size={17}/>} value={String(metrics.runningTasks)} label="running tasks" />
          <Metric icon={<CheckCircle2 size={17}/>} value={`${(metrics.verifiedRate * 100).toFixed(1)}%`} label="verified" />
          <Metric icon={<Gauge size={17}/>} value={`${metrics.avgLatencyMs}ms`} label="avg latency" />
        </div>
        <div className="divider" />
        <div className="panel-title"><Waypoints size={18}/> ACTIVE MANDATE</div>
        <div className="mandate">Inspect → reason → act → verify → receipt</div>
        <div className="mini-row"><span>Token budget</span><strong>{totalTokens.toLocaleString()}</strong></div>
        <div className="mini-row"><span>Observed cost</span><strong>${totalCost.toFixed(3)}</strong></div>
        <div className="mini-row"><span>Receipts</span><strong>{metrics.receipts}</strong></div>
      </section>

      <section className="right-rail glass">
        <div className="panel-title"><RotateCcw size={18}/> QRAG LOOP</div>
        <div className="qrag">
          {qrag.map((step) => <div key={step.key} className={`qrag-step ${activeStep === step.key ? 'active' : ''}`}><span>{step.label}</span></div>)}
        </div>
        <div className="divider" />
        <div className="panel-title"><Cpu size={18}/> DENSE FEEDBACK → QUANTIZATION TORQUE</div>
        <div className="torque-row">
          <div className="torque-card increase"><strong>INCREASE</strong><span>deepen / scale intelligence</span></div>
          <div className="torque-card decrease"><strong>DECREASE</strong><span>reduce waste / drift</span></div>
          <div className="torque-card redirect"><strong>REDIRECT</strong><span>change method / route</span></div>
        </div>
        <div className="divider" />
        <div className="receipt-row">
          <div><FileCheck2 size={18}/><strong>Receipt</strong><span>tools · evidence · result · cost</span></div>
          <div><ShieldCheck size={18}/><strong>Audit</strong><span>trace · replay · policy · review</span></div>
        </div>
      </section>

      <section className="event-log glass">
        <div className="panel-title"><Activity size={17}/> LIVE EXECUTION TRACE</div>
        <div className="event-stream">
          {events.slice(-8).reverse().map((evt) => (
            <div key={evt.id} className="event-row">
              <time>{new Date(evt.ts).toLocaleTimeString([], { hour12: false })}</time>
              <span className={`event-kind ${evt.kind.replaceAll('.', '-')}`}>{evt.kind}</span>
              <span className="event-summary">{evt.summary}</span>
              {evt.tool && <span className="chip">{evt.tool}</span>}
              {evt.receiptId && <span className="chip receipt">{evt.receiptId}</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="judge-callout glass">
        <CircleDollarSign size={16}/><span>Agents act. Humans govern. Every consequential execution ends in evidence.</span>
      </div>
    </div>
  );
}
