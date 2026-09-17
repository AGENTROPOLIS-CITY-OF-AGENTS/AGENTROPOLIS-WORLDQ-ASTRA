import { useEffect, useMemo, useRef, useState } from 'react';
import { computeMetrics, makeDemoEvent } from '../lib/demo';
import type { ExecutionEvent } from '../lib/types';

const MAX_EVENTS = 120;

export function useAgentStream() {
  const [events, setEvents] = useState<ExecutionEvent[]>(() => Array.from({ length: 12 }, (_, i) => makeDemoEvent(i)));
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<'live' | 'demo'>('demo');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_AGENT_STREAM_URL as string | undefined;
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setMode('live');
    };
    ws.onmessage = (message) => {
      try {
        const evt = JSON.parse(message.data) as ExecutionEvent;
        setEvents((prev) => [...prev, evt].slice(-MAX_EVENTS));
      } catch {
        // malformed events are ignored so telemetry cannot crash the experience
      }
    };
    ws.onclose = () => {
      setConnected(false);
      setMode('demo');
    };
    ws.onerror = () => ws.close();

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (mode !== 'demo') return;
    let i = 20;
    const id = window.setInterval(() => {
      setEvents((prev) => [...prev, makeDemoEvent(i++)].slice(-MAX_EVENTS));
    }, 1450);
    return () => window.clearInterval(id);
  }, [mode]);

  return useMemo(
    () => ({ events, metrics: computeMetrics(events), connected, mode }),
    [events, connected, mode],
  );
}
