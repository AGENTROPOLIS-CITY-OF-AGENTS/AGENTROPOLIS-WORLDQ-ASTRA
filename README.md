# AGENTROPOLIS · WORLDQ Mission Control

Production-oriented React + Three.js spatial observability shell for the AGENTROPOLIS design system.

## What it implements

- Layered WORLDQ spatial stack: **ORBIT → GLOBE (ATLAS) → WORLD GRID → CITY → WORLDQ**
- Live 3D agent positions, active traces, execution pulse, and district/layer labeling
- Execution Envelope observability
- QRAG loop visualization: **Retrieve → Evaluate → Execute → Verify → Re-query**
- Dense Feedback → Quantization Torque outcomes: **Increase / Decrease / Redirect**
- Receipt + Audit surfaces
- Live event stream contract over WebSocket
- Built-in demo stream when no backend is connected, so the judge build never opens to a dead screen
- Static build suitable for GitHub Pages

## Run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Connect real agents

Set:

```bash
VITE_AGENT_STREAM_URL=wss://your-host/events
```

Each message should be an `ExecutionEvent` object matching `src/lib/types.ts`.

Example:

```json
{
  "id": "evt-0192",
  "ts": 1790000000000,
  "agentId": "astra-01",
  "kind": "verification.passed",
  "summary": "Tests and policy checks passed",
  "layer": "WORLDQ",
  "qragStep": "verify",
  "tool": "code_exec",
  "receiptId": "rcpt_8af921",
  "costUsd": 0.032,
  "tokens": 2411
}
```

### Production rule

Do **not** place model/provider API keys in this client. Agent execution belongs behind your server/runtime. WORLDQ receives signed/validated telemetry and renders it.

## Judge flow

1. Human enters a mandate.
2. Execution Envelope compiles scope/permissions/budgets.
3. Agent events appear spatially in the layer where work is happening.
4. QRAG state advances in the HUD.
5. Dense Feedback updates measurements.
6. Quantization Torque changes depth/routing.
7. Receipt is issued.
8. Audit event closes the trace.

This is an observability/control surface, not merely a decorative city.
