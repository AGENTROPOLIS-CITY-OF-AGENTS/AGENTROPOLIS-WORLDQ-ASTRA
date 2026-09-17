import type { AgentNode, ExecutionEvent, MissionMetrics, QragStep, TorqueAction, WorldLayer } from './types';

const layers: WorldLayer[] = ['ORBIT', 'GLOBE', 'WORLD_GRID', 'CITY', 'WORLDQ'];
const steps: QragStep[] = ['retrieve', 'evaluate', 'execute', 'verify', 'requery'];
const torque: TorqueAction[] = ['increase', 'decrease', 'redirect'];

export const demoAgents: AgentNode[] = [
  { id: 'astra-01', name: 'ASTRA / Architect', district: 'Mission Control', layer: 'WORLDQ', status: 'working', task: 'Compile mandate into execution envelope', x: -3.2, z: -0.8, latencyMs: 228, confidence: 0.96 },
  { id: 'review-07', name: 'Sentinel Reviewer', district: 'AEGIS', layer: 'WORLD_GRID', status: 'verifying', task: 'Review patch, tests, policy gates', x: 2.2, z: 1.7, latencyMs: 344, confidence: 0.93 },
  { id: 'browser-22', name: 'Browser Operator', district: 'Tool District', layer: 'CITY', status: 'working', task: 'Collect live source evidence', x: -1.0, z: 3.2, latencyMs: 511, confidence: 0.89 },
  { id: 'memory-04', name: 'Continuity Keeper', district: 'Memory Layer', layer: 'GLOBE', status: 'working', task: 'Assemble context capsule', x: 3.1, z: -2.2, latencyMs: 190, confidence: 0.98 },
  { id: 'orbit-11', name: 'Signal Scout', district: 'Orbit', layer: 'ORBIT', status: 'complete', task: 'Discover external signals', x: 0.7, z: -3.8, latencyMs: 420, confidence: 0.91 },
  { id: 'audit-54', name: 'Receipt Auditor', district: 'Audit Ledger', layer: 'WORLDQ', status: 'idle', task: 'Awaiting verified receipt', x: 3.8, z: 0.2, latencyMs: 132, confidence: 1.0 },
];

const summaries = [
  'Mandate accepted inside bounded execution envelope',
  'Retrieved repository, policy, and runtime evidence',
  'Evaluated evidence quality and selected next action',
  'Called code and browser tools under least privilege',
  'Executed patch in isolated task boundary',
  'Verification passed across tests and policy gates',
  'Dense Feedback updated execution measurements',
  'Quantization Torque redirected reasoning depth',
  'Receipt issued with tool, token, cost, and evidence trace',
  'Audit commitment recorded for replay and review',
];

export function makeDemoEvent(i: number): ExecutionEvent {
  const agent = demoAgents[i % demoAgents.length];
  const mod = i % 10;
  const kind: ExecutionEvent['kind'][] = [
    'mandate.received',
    'qrag.retrieve',
    'qrag.evaluate',
    'tool.called',
    'action.executed',
    'verification.passed',
    'qrag.evaluate',
    'torque.applied',
    'receipt.issued',
    'audit.committed',
  ];

  return {
    id: `evt-${Date.now()}-${i}`,
    ts: Date.now(),
    agentId: agent.id,
    kind: kind[mod],
    summary: summaries[mod],
    layer: layers[(i + 4) % layers.length],
    qragStep: steps[i % steps.length],
    torque: mod === 7 ? torque[i % torque.length] : undefined,
    tool: mod === 3 ? ['web_search', 'code_exec', 'repo_read', 'browser'][i % 4] : undefined,
    receiptId: mod >= 8 ? `rcpt_${(i + 1000).toString(16)}` : undefined,
    costUsd: Number((0.008 + (i % 5) * 0.004).toFixed(3)),
    tokens: 900 + (i % 7) * 310,
  };
}

export function computeMetrics(events: ExecutionEvent[]): MissionMetrics {
  const recent = events.slice(-80);
  const verified = recent.filter((e) => e.kind === 'verification.passed').length;
  const failed = recent.filter((e) => e.kind === 'verification.failed').length;
  const receipts = recent.filter((e) => e.kind === 'receipt.issued').length;
  const denominator = verified + failed;
  return {
    activeAgents: demoAgents.filter((a) => a.status === 'working' || a.status === 'verifying').length,
    runningTasks: 12 + (recent.length % 9),
    verifiedRate: denominator ? verified / denominator : 0.987,
    avgLatencyMs: Math.round(demoAgents.reduce((sum, a) => sum + a.latencyMs, 0) / demoAgents.length),
    receipts,
  };
}
