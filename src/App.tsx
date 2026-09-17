import { WorldQScene } from './components/WorldQScene';
import { HUD } from './components/HUD';
import { useAgentStream } from './hooks/useAgentStream';

export function App() {
  const { events, metrics, mode } = useAgentStream();
  return (
    <main className="app-shell">
      <div className="scene"><WorldQScene events={events} /></div>
      <HUD events={events} metrics={metrics} mode={mode} />
      <div className="scanlines" aria-hidden />
    </main>
  );
}
