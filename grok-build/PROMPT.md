# GROK BUILD — AGENTROPOLIS WORLDQ × GPT-6 ASTRA

Build and deploy the backend gateway for the existing public repository:
https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-WORLDQ-ASTRA

Do not redesign or replace the existing React + Three.js WORLDQ front end. The current GitHub Pages experience is the product UI. Your job is to provide the production backend that makes **RUN ASTRA MISSION** execute a real GPT-6 Astra mission and stream truthful telemetry into WORLDQ.

## Required production endpoints

### GET /health
Return JSON with service status and version. Never expose secrets.

### POST /api/missions
Accept JSON:
- mandate: string
- envelope.maxRequeries: integer, hard-cap at 1 for competition mode
- envelope.maxToolCalls: integer, hard-cap at 8
- envelope.timeoutMs: integer, hard-cap at 30000
- envelope.requireVerification: boolean
- envelope.requireReceipt: boolean

Immediately create an in-memory mission and return:
{ "missionId": "<id>" }

Target response time: under 500 ms before model completion. Do not wait for Astra to finish before returning the mission id.

### GET /api/missions/:missionId/events
Server-Sent Events stream. Send JSON ExecutionEvent objects compatible with the repository's src/lib/types.ts.

Required event names:
- mandate.received
- qrag.retrieve
- qrag.evaluate
- tool.called
- action.executed
- verification.passed
- verification.failed
- torque.applied
- receipt.issued
- audit.committed

Each event must include:
- id
- ts
- agentId
- kind
- summary
- layer: ORBIT | GLOBE | WORLD_GRID | CITY | WORLDQ
- optional qragStep
- optional torque
- optional tool
- optional receiptId
- optional costUsd
- optional tokens

Send an SSE event named "done" after the final audit event.

## Astra requirements

Use the OpenAI Responses API with model:
gpt-6-astra

OPENAI_API_KEY must be server-side only. Never serialize it to the browser, logs, telemetry, receipts, or error messages.

The competition mission must prove real Astra execution. Record the OpenAI response id in the final receipt.

Default competition mission:
"Audit AGENTROPOLIS-WORLDQ-ASTRA for launch readiness. Inspect the architecture, identify implementation or governance gaps, verify the result, and produce an accountable execution receipt."

## Execution Envelope

Before model execution, construct a bounded envelope:
- identity
- mandate
- allowed tools
- denied tools
- maxRequeries = 1
- maxToolCalls = 8
- timeoutMs <= 30000
- requireVerification = true
- requireReceipt = true
- competitionMode = true

Fail closed on invalid input or budget violations.

## QRAG protocol

Implement a bounded observable loop:
RETRIEVE → EVALUATE → EXECUTE → VERIFY → optional RE-QUERY

Do not allow infinite loops.
Maximum one re-query.
Maximum eight tool calls.
Hard mission timeout 30 seconds.

Emit telemetry at every stage so WORLDQ animates while the mission is running.

Suggested spatial mapping:
- Retrieve → GLOBE
- Evaluate → WORLD_GRID
- Execute/tool calls → CITY
- Verify → WORLDQ
- Re-query → GLOBE or WORLD_GRID
- Receipt/Audit → WORLDQ

## Quantization Torque

This competition build does not depend on local GPUs or EXL3 hardware.

Implement Quantization Torque as runtime intelligence allocation:
- INCREASE: escalate to deeper Astra reasoning when evidence or verification is insufficient
- DECREASE: use deterministic application code for mechanical work instead of extra model calls
- REDIRECT: change tool/method/retrieval route rather than repeatedly asking the same question

Normal application code should perform formatting, hashing, budgets, timers, event routing, validation, receipt assembly, and duplicate removal. Do not spend model calls on mechanical work.

Emit torque.applied with torque = increase | decrease | redirect when a routing decision is made.

## Receipt

At mission completion produce a receipt containing:
- receiptId
- missionId
- timestamp
- model = gpt-6-astra
- openaiResponseId
- mandate hash
- execution envelope version
- QRAG stages completed
- re-query count
- tools used
- verification result
- latencyMs
- tokens if available
- costUsd if available
- torque decisions
- outcome summary
- auditHash

Emit receipt.issued followed by audit.committed.

Do not invent token/cost values when unavailable. Omit or mark them unavailable.

## Speed requirements

Optimize for judge experience:
- backend health response under 250 ms
- POST mission acknowledgement under 500 ms
- stream first truthful telemetry immediately
- world/UI must never wait for full Astra completion
- mission target 10–30 seconds
- hard timeout at 30 seconds
- no database
- in-memory mission state
- no authentication required for the competition demo
- strict input size limits
- CORS restricted to the GitHub Pages production origin and local development origin
- keep response/event payloads small
- no unnecessary framework or dependency bloat

## Reliability

If Astra errors or times out:
- emit a truthful failure/verification event
- issue a failure receipt if possible
- close the stream cleanly
- never display fake live telemetry

## CORS

Allow:
https://agentropolis-city-of-agents.github.io
and localhost development origins.

## Environment

Server secrets:
OPENAI_API_KEY
PORT
ALLOWED_ORIGINS

No secret belongs in VITE_* variables.

## Deliverable

Deploy the gateway to a public HTTPS URL and report:
1. gateway base URL
2. /health URL
3. example mission id
4. confirmation that SSE streams
5. confirmation model is gpt-6-astra
6. any environment variables I must set

Do not change the product's visual identity. Do not add a new landing page. Do not replace WORLDQ.
