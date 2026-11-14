export type EscalationPriority = 'P1' | 'P2' | 'P3';
export type EscalationReason = 'guardrail_breach' | 'low_confidence' | 'tool_failure' | 'manual';
export type CaseStatus = 'pending' | 'approved' | 'rejected' | 'overridden';

export interface EvidenceToolCall {
  id: string;
  name: string;
  verdict: 'allow' | 'deny';
  latency: string;
  detail: string;
}

export interface PastSimilarCase {
  id: string;
  similarity: number;
  description: string;
  confidence: number;
  verdict: 'approved' | 'rejected' | 'overridden';
}

export interface ReviewCase {
  id: string;
  run_id: string;
  priority: EscalationPriority;
  agent_id: string;
  agent_name: string;
  agent_version: string;
  proposed_decision: string;
  decision_details: string;
  escalation_reason: EscalationReason;
  guardrail_breach_detail?: string;
  queued_time: string;
  sla_target: string;
  status: CaseStatus;
  is_new?: boolean;
  agent_rationale: string;
  reasoning_steps: string[];
  calibrated_confidence: number;
  threshold_tau: number;
  raw_confidence: number;
  evidence: {
    tool_calls: EvidenceToolCall[];
    input_data: Record<string, unknown>;
  };
  similar_cases: PastSimilarCase[];
}
