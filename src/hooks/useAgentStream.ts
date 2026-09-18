import { useEffect, useMemo, useRef, useState } from 'react';
import { computeMetrics, makeDemoEvent } from '../lib/demo';
import type { ExecutionEvent } from '../lib/types';

const MAX_EVENTS = 120;
const DEFAULT_MANDATE =
  'Audit AGENTROPOLIS-WORLDQ-ASTRA for launch readiness. Inspect the architecture, identify implementation or governance gaps, verify the result, and produce an accountable execution receipt.';

export function useAgentStream() {
  const [events, setEvents] = useState<ExecutionEvent[]>(() => Array.from({ length: 12 }, (_, i) => makeDemoEvent(i)));
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<'live' | 'demo'>('demo');
  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  const pushEvent = (evt: ExecutionEvent) => {
    setEvents((prev) => [...prev, evt].slice(-MAX_EVENTS));
  };

  useEffect(() => {
    const url = import.meta.env.VITE_AGENT_STREAM_URL as string | undefined;
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setMode('live');
      setEvents([]);
    };
    ws.onmessage = (message) => {
      try {
        pushEvent(JSON.parse(message.data) as ExecutionEvent);
      } catch {
        // Malformed telemetry never crashes WORLDQ.
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
    const gateway = (import.meta.env.VITE_GATEWAY_URL as string | undefined)?.replace(/\/$/, '');
    if (!gateway) return;

    const runMission = async () => {
      sseRef.current?.close();
      try {
        const response = await fetch(`${gateway}/api/missions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mandate: DEFAULT_MANDATE,
            envelope: {
              maxRequeries: 1,
              maxToolCalls: 8,
              timeoutMs: 30000,
              requireVerification: true,
              requireReceipt: true,
            },
          }),
        });
        if (!response.ok) throw new Error(`Mission start failed: ${response.status}`);
        const payload = await response.json() as { missionId: string };
        if (!payload.missionId) throw new Error('Mission id missing');

        const stream = new EventSource(`${gateway}/api/missions/${encodeURIComponent(payload.missionId)}/events`);
        sseRef.current = stream;
        stream.onopen = () => {
          setConnected(true);
          setMode('live');
          setEvents([]);
        };
        stream.onmessage = (message) => {
          try {
            pushEvent(JSON.parse(message.data) as ExecutionEvent);
          } catch {
            // Ignore malformed telemetry while preserving the live experience.
          }
        };
        stream.addEventListener('done', () => {
          stream.close();
          setConnected(false);
        });
        stream.onerror = () => {
          stream.close();
          setConnected(false);
          setMode('demo');
        };
      } catch (error) {
        console.error('[WORLDQ] Astra mission gateway unavailable', error);
        setConnected(false);
        setMode('demo');
      }
    };

    window.addEventListener('worldq:run-mission', runMission);
    return () => {
      window.removeEventListener('worldq:run-mission', runMission);
      sseRef.current?.close();
    };
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
