export type WorldLayer = 'ORBIT' | 'GLOBE' | 'WORLD_GRID' | 'CITY' | 'WORLDQ';
export type QragStep = 'retrieve' | 'evaluate' | 'execute' | 'verify' | 'requery';
export type TorqueAction = 'increase' | 'decrease' | 'redirect';
export type AgentStatus = 'idle' | 'working' | 'verifying' | 'complete' | 'blocked';

export interface AgentNode {
  id: string;
  name: string;
  district: string;
  layer: WorldLayer;
  status: AgentStatus;
  task: string;
  x: number;
  z: number;
  latencyMs: number;
  confidence: number;
}

export interface ExecutionEvent {
  id: string;
  ts: number;
  agentId: string;
  kind:
    | 'mandate.received'
    | 'qrag.retrieve'
    | 'qrag.evaluate'
    | 'tool.called'
    | 'action.executed'
    | 'verification.passed'
    | 'verification.failed'
    | 'torque.applied'
    | 'receipt.issued'
    | 'audit.committed';
  summary: string;
  layer: WorldLayer;
  qragStep?: QragStep;
  torque?: TorqueAction;
  tool?: string;
  receiptId?: string;
  costUsd?: number;
  tokens?: number;
}

export interface MissionMetrics {
  activeAgents: number;
  runningTasks: number;
  verifiedRate: number;
  avgLatencyMs: number;
  receipts: number;
}
