import type { ExecutionMode } from '@/features/agents/types';

export type RunStatus = 'running' | 'success' | 'escalated' | 'failed' | 'accepted';
export type RunMode = 'durable' | 'realtime';

export interface SubmitExecutionRequest {
  agent_id?: string;
  agent_version_id?: string;
  version_id?: string;
  input: Record<string, unknown>;
  input_payload?: Record<string, unknown>;
  execution_mode?: ExecutionMode;
  mode?: 'async' | 'sync';
  execution_id?: string;
  skip_reliability_check?: boolean;
}

export interface EscalationInfo {
  case_id?: string;
  reason?: string;
}

export interface ExecuteAgentResponse {
  workflow_id?: string;
  run_id?: string;
  agent_id: string;
  agent_version_id: string;
  status: string;
  mode?: string;
  output?: Record<string, unknown>;
  structured_output?: unknown;
  reason?: string;
  escalation?: EscalationInfo;
  duration_ms?: number;
}

export interface ToolCallTrace {
  name: string;
  classification: 'read' | 'write';
  status: 'allow' | 'deny';
  duration_ms?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}

export interface TraceSpan {
  id: string;
  name: string;
  type: 'workflow' | 'runtime' | 'tool' | 'gate' | 'escalation';
  status: 'completed' | 'running' | 'failed' | 'skipped';
  timestamp: string;
  duration_ms: number;
  details?: Record<string, unknown>;
}

export interface RunDetail {
  id: string;
  workflow_id: string;
  run_id: string;
  agent_id: string;
  agent_name: string;
  agent_version_number?: number;
  status: RunStatus;
  mode: RunMode;
  execution_mode: ExecutionMode;
  created_at: string;
  duration_ms: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  structured_output?: unknown;
  reason?: string;
  confidence?: number;
  reliability_threshold?: number;
  escalation?: EscalationInfo;
  tool_calls: ToolCallTrace[];
  spans: TraceSpan[];
}
