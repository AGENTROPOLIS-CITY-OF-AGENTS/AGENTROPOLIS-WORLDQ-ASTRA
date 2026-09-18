import { useState } from 'react';

export function IntroOverlay({ onEnter, onRun }: { onEnter: () => void; onRun: () => void }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const enter = () => { setOpen(false); onEnter(); };
  const run = () => { setOpen(false); onRun(); };
  return (
    <div className="intro-overlay" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div className="intro-panel">
        <div className="intro-kicker">AGENTROPOLIS WORLDQ × GPT-6 ASTRA</div>
        <h1 id="intro-title">Watch accountable AI agents work inside a live spatial world.</h1>
        <p>WORLDQ turns autonomous execution into something humans can see, govern, verify, and audit.</p>
        <div className="intro-flow" aria-label="WORLDQ execution protocol">
          <span>MANDATE</span><b>→</b><span>EXECUTION ENVELOPE</span><b>→</b><span>QRAG</span><b>→</b><span>VERIFY</span><b>→</b><span>RECEIPT</span><b>→</b><span>AUDIT</span>
        </div>
        <div className="intro-actions">
          <button className="intro-primary" onClick={run}>RUN ASTRA MISSION</button>
          <button className="intro-secondary" onClick={enter}>ENTER WORLDQ</button>
        </div>
        <small>Agents act. Humans govern. Every consequential execution leaves evidence.</small>
      </div>
    </div>
  );
}
