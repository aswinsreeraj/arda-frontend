export type AuditSource = 'agent' | 'human';
export type AuditOutcome = 'allowed' | 'denied' | 'escalated' | 'approved' | 'rejected' | 'overridden';

export interface BackendToolAuditEvent {
  event_id: string;
  tenant_id: string;
  execution_id: string;
  agent_id: string;
  agent_version_id: string;
  tool_id: string;
  tool_name: string;
  tool_version: number;
  invocation_id: string;
  classification: 'read' | 'write';
  allowed: boolean;
  denial_code?: string;
  denial_reason?: string;
  failure_category?: string;
  sanitized_arguments?: Record<string, unknown>;
  duration_ms: number;
  timestamp: string;
  mode?: string;
  mode_type?: string;
  execution_mode?: string;
}

export interface AuditEventItem {
  seq: number;
  id: string;
  timestamp: string;
  execution_id: string;
  agent_id: string;
  agent_name: string;
  source: AuditSource;
  action_type: 'tool_execution' | 'human_resolution' | 'escalation_event' | 'agent_execution';
  decision: string;
  outcome: AuditOutcome;
  confidence?: number;
  reliability_threshold?: number;
  tool_name?: string;
  classification?: 'read' | 'write';
  sanitized_arguments?: Record<string, unknown>;
  denial_reason?: string;
  audit_record_id?: string;
  prev_hash: string;
  hash: string;
  reviewer_id?: string;
  case_id?: string;
  duration_ms?: number;
  execution_mode?: string;
  agent_reasoning?: string;
  case_input?: Record<string, unknown>;
  case_output?: Record<string, unknown>;
  reliability_skipped?: boolean;
  tool_calls?: Array<{
    name: string;
    classification?: 'read' | 'write';
    status?: string;
    duration_ms?: number;
  }>;
}

export interface AuditBlockProof {
  seq: number;
  hash: string;
  prev_hash: string;
  calculated_hash: string;
  timestamp: string;
  is_valid: boolean;
}

export interface ChainVerificationResult {
  isValid: boolean;
  verifiedCount: number;
  headHash: string;
  rootHash: string;
  headSeq: number;
  durationMs: number;
  lastEntryTime: string;
  blocks: AuditBlockProof[];
}

export interface AuditListFilters {
  search?: string;
  timeframe?: '24h' | '7d' | '30d' | 'all';
  agent_id?: string;
  source?: 'all' | 'agent' | 'human';
  outcome?: 'all' | 'allowed' | 'denied' | 'escalated';
}
