import { useEffect, useState } from 'react';
import { WorldQScene } from './components/WorldQScene';
import { HUD } from './components/HUD';
import { IntroOverlay } from './components/IntroOverlay';
import { useAgentStream } from './hooks/useAgentStream';
import type { WorldLayer } from './lib/types';

export function App() {
  const { events, metrics, mode } = useAgentStream();
  const [selectedLayer, setSelectedLayer] = useState<WorldLayer>('GLOBE');

  useEffect(() => {
    if (mode === 'live') {
      const latest = events.at(-1);
      if (latest?.layer) setSelectedLayer(latest.layer);
    }
  }, [events, mode]);

  const runMission = () => {
    setSelectedLayer('WORLDQ');
    window.dispatchEvent(new CustomEvent('worldq:run-mission'));
  };

  return (
    <main className="app-shell">
      <div className="scene"><WorldQScene events={events} selectedLayer={selectedLayer} /></div>
      <HUD events={events} metrics={metrics} mode={mode} selectedLayer={selectedLayer} onSelectLayer={setSelectedLayer} />
      <IntroOverlay onEnter={() => setSelectedLayer('GLOBE')} onRun={runMission} />
      <div className="scanlines" aria-hidden />
    </main>
  );
}
