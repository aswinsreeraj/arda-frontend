export interface ReviewCaseSummary {
  case_id: string;
  execution_id: string;
  agent_id: string;
  agent_name: string;
  proposed_decision: string;
  confidence: number;
  escalation_reasons: string[];
  status: 'OPEN' | 'RESOLVED' | string;
  created_at: string;
}

export interface ListReviewsResponse {
  cases: ReviewCaseSummary[];
  next_page_token?: string;
  total_count: number;
}

export interface ReferenceNeighbor {
  reference_example_id: string;
  label: string;
  similarity: number;
}

export interface ToolCallEvidence {
  tool_id: string;
  tool_name: string;
  arguments?: Record<string, unknown>;
  result?: Record<string, unknown>;
  output?: string;
  error?: string;
  allowed?: boolean;
  denial_code?: string;
  duration_ms?: number;
}

export interface FrozenEvidence {
  original_input?: Record<string, unknown>;
  agent_reasoning?: string;
  proposed_decision?: string;
  confidence?: number;
  reliability_threshold?: number;
  escalation_reasons?: string[];
  neighbors?: ReferenceNeighbor[];
  tool_calls?: ToolCallEvidence[];
  metadata?: Record<string, string>;
}

export interface ReviewResolution {
  decision: 'approve' | 'reject' | 'override' | string;
  final_decision: string;
  resolution_reason: string;
  reviewer_id: string;
  audit_record_id: string;
  resolved_at?: string;
}

export interface ReviewCaseDetail {
  id: string;
  case_id: string;
  tenant_id: string;
  execution_id: string;
  agent_id: string;
  agent_name: string;
  agent_version_id: string;
  agent_version_number: number;
  execution_mode: 'realtime' | 'durable' | string;
  status: 'OPEN' | 'RESOLVED' | string;
  proposed_decision: string;
  confidence: number;
  reliability_threshold: number;
  escalation_reasons: string[];
  frozen_evidence: FrozenEvidence;
  created_at: string;
  updated_at: string;
  resolution?: ReviewResolution;
}

export interface ResolveReviewRequest {
  decision: 'approve' | 'reject' | 'override';
  reason: string;
  final_decision?: string;
}

export interface ResolveReviewResponse {
  case_id: string;
  status: string;
  audit_record_id: string;
}

export interface ReviewListFilters {
  status?: 'OPEN' | 'RESOLVED';
  agent_id?: string;
  escalation_reason?: string;
  page_size?: number;
  page_token?: string;
}
