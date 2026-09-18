# Backend Contract — Competition Mode

WORLDQ remains a static, fast React/Three.js client. Grok Build owns the secret-bearing Astra gateway.

## Fast path
1. Browser renders WORLDQ immediately.
2. User clicks RUN ASTRA MISSION.
3. Client POSTs mandate + bounded envelope to /api/missions.
4. Gateway returns missionId immediately.
5. Client opens SSE /api/missions/:id/events.
6. Gateway emits real execution events while Astra works.
7. Receipt and audit close the mission.

## Non-negotiable limits
- 30 second hard timeout
- 1 re-query maximum
- 8 tool calls maximum
- no database
- in-memory state
- no fake LIVE mode
- OPENAI_API_KEY server-side only
- mechanical work done with application code where possible

## Front-end integration
Set VITE_GATEWAY_URL to the deployed gateway base URL during the GitHub Pages build.

The existing useAgentStream hook listens for the worldq:run-mission browser event and automatically:
- starts the mission
- opens the SSE stream
- clears demo events only when the live stream opens
- returns to clearly labeled DEMO mode if the gateway is unavailable
