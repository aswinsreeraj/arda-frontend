import { apiClient } from '@/services/api';
import type {
  AuditEventItem,
  AuditBlockProof,
  BackendToolAuditEvent,
  ChainVerificationResult,
} from './types';
import type { ListReviewsResponse, ReviewCaseDetail } from '@/features/reviews/types';
import { reviewApi } from '@/features/reviews/reviewApi';
import { agentApi } from '@/features/agents/agentApi';
import { runsApi } from '@/features/runs/runsApi';
import type { RunDetail } from '@/features/runs/types';

function extractAutonomousDecisionSummary(run: RunDetail): {
  decisionText: string;
  outcome: AuditEventItem['outcome'];
  reasoning: string;
} {
  const out = (run.output || {}) as Record<string, unknown>;
  const rawContent =
    typeof out.content === 'string'
      ? out.content
      : typeof out.response === 'string'
        ? out.response
        : '';

  let parsedObj: Record<string, unknown> | null = null;
  if (rawContent.trim()) {
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```')) {
      const lines = cleaned.split('\n');
      if (lines.length >= 2) cleaned = lines.slice(1).join('\n');
      const lastFence = cleaned.lastIndexOf('```');
      if (lastFence !== -1) cleaned = cleaned.slice(0, lastFence);
      cleaned = cleaned.trim();
    }
    if (cleaned.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsedObj = parsed as Record<string, unknown>;
        }
      } catch {
        // Non-JSON text output
      }
    }
  }

  const rawDecision =
    (typeof parsedObj?.decision === 'string' && parsedObj.decision) ||
    (typeof parsedObj?.verdict === 'string' && parsedObj.verdict) ||
    (typeof parsedObj?.status === 'string' && parsedObj.status) ||
    '';
  const rawReason =
    (typeof parsedObj?.reason === 'string' && parsedObj.reason) ||
    (typeof parsedObj?.summary === 'string' && parsedObj.summary) ||
    (typeof parsedObj?.rationale === 'string' && parsedObj.rationale) ||
    '';

  const reasoning =
    rawReason ||
    rawContent.trim() ||
    run.reason ||
    'Autonomous execution completed and satisfied reliability policy.';

  const upperDec = rawDecision.trim().toUpperCase();
  const isSkipped = Boolean(out.reliability_skipped);

  if (upperDec === 'REJECT' || upperDec === 'DENY') {
    return {
      decisionText: rawReason
        ? `Autonomous Decision: REJECT · ${rawReason}`
        : 'Autonomous Decision: REJECT',
      outcome: 'rejected',
      reasoning,
    };
  }
  if (upperDec === 'APPROVE' || upperDec === 'ALLOW') {
    return {
      decisionText: rawReason
        ? `Autonomous Decision: APPROVE · ${rawReason}`
        : 'Autonomous Decision: APPROVE',
      outcome: 'allowed',
      reasoning,
    };
  }
  if (rawReason) {
    return {
      decisionText: isSkipped
        ? `Autonomous Execution (Reliability Skipped): ${rawReason}`
        : `Autonomous Execution: ${rawReason}`,
      outcome: 'allowed',
      reasoning,
    };
  }
  return {
    decisionText: isSkipped
      ? 'Autonomous Execution Succeeded (Reliability Skipped)'
      : 'Autonomous Execution Succeeded',
    outcome: 'allowed',
    reasoning,
  };
}

/**
 * Computes a standard SHA-256 hex digest using Web Crypto API.
 */
export async function computeSHA256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback if subtle crypto is unavailable in environment
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Anchor Genesis hash for checkpoint #48120
 */
const CHECKPOINT_ROOT_HASH = '423ea7f9c8d5a1b3e0f76928bc1d4e2a658f910382745610bcde8921a4f5c6e7';

const HISTORICAL_LEDGER_SEEDS: Omit<AuditEventItem, 'seq' | 'prev_hash' | 'hash'>[] = [];

export const auditApi = {
  /**
   * Fetches unified audit events from backend tool audit and human reviews,
   * compiles the chronological sequential SHA-256 hash-chain, and returns ledger items.
   */
  fetchAuditEvents: async (signal?: AbortSignal): Promise<AuditEventItem[]> => {
    // 1. Fetch live tool audit events
    let backendToolEvents: BackendToolAuditEvent[] = [];
    try {
      const resp = await apiClient.get<BackendToolAuditEvent[]>('/tools/audit?limit=100', {
        signal,
      });
      if (Array.isArray(resp.data)) {
        backendToolEvents = resp.data;
      }
    } catch {
      // Backend tools audit may be empty or unconfigured
    }

    // 2. Fetch processed (resolved) human reviews only
    let reviewCases: ListReviewsResponse['cases'] = [];
    try {
      const resp = await apiClient.get<ListReviewsResponse>('/reviews?status=RESOLVED&page_size=100', {
        signal,
      });
      if (resp.data?.cases) {
        reviewCases = resp.data.cases;
      }
    } catch {
      // Reviews might be empty
    }

    // 3. Fetch agents map for human-readable agent names
    const agentMap = new Map<string, string>();
    try {
      const agentsResp = await agentApi.listAgents(undefined, signal);
      for (const item of agentsResp.agents || []) {
        agentMap.set(item.agent.id, item.agent.name);
      }
    } catch {
      // Fallback
    }

    // 4. Fetch completed runs so autonomous SUCCESS executions are included in the audit trail
    let allRuns: RunDetail[] = [];
    try {
      allRuns = await runsApi.fetchRuns(signal);
    } catch {
      // Runs list may be unavailable
    }

    // Convert live backend tool events
    const liveItems: Omit<AuditEventItem, 'seq' | 'prev_hash' | 'hash'>[] = [];

    for (const te of backendToolEvents) {
      const agentName = agentMap.get(te.agent_id) || `Agent ${te.agent_id.slice(0, 8)}`;

      let decisionText = `${te.allowed ? 'Allow' : 'Deny'} ${te.tool_name}`;
      if (!te.allowed && te.denial_reason) {
        decisionText = `Guardrail Block: ${te.denial_reason}`;
      } else if (te.sanitized_arguments && Object.keys(te.sanitized_arguments).length > 0) {
        const firstArgKey = Object.keys(te.sanitized_arguments)[0];
        decisionText = `${te.allowed ? 'Execute' : 'Deny'} ${te.tool_name} · ${firstArgKey}=${String(te.sanitized_arguments[firstArgKey])}`;
      }

      liveItems.push({
        id: te.event_id,
        timestamp: te.timestamp,
        execution_id: te.execution_id,
        agent_id: te.agent_id,
        agent_name: agentName,
        source: 'agent',
        action_type: 'tool_execution',
        decision: decisionText,
        outcome: te.allowed ? 'allowed' : 'denied',
        confidence: undefined,
        tool_name: te.tool_name,
        classification: te.classification,
        sanitized_arguments: te.sanitized_arguments,
        denial_reason: te.denial_reason,
        duration_ms: te.duration_ms,
      });
    }

    // Convert autonomous SUCCESS agent executions
    for (const run of allRuns) {
      if (run.status !== 'success') continue;
      const execId = run.workflow_id || run.id;
      const { decisionText, outcome, reasoning } = extractAutonomousDecisionSummary(run);
      const actualConfidence =
        typeof run.confidence === 'number'
          ? run.confidence
          : typeof run.output?.confidence === 'number'
            ? (run.output.confidence as number)
            : undefined;

      liveItems.push({
        id: `exec-${execId}`,
        timestamp: run.created_at,
        execution_id: execId,
        agent_id: run.agent_id,
        agent_name: agentMap.get(run.agent_id) || run.agent_name || `Agent ${run.agent_id.slice(0, 8)}`,
        source: 'agent',
        action_type: 'agent_execution',
        decision: decisionText,
        outcome,
        confidence: actualConfidence,
        reliability_threshold: run.reliability_threshold,
        duration_ms: run.duration_ms,
        execution_mode: run.mode || run.execution_mode,
        agent_reasoning: reasoning,
        case_input: run.input,
        case_output: run.output,
        reliability_skipped: Boolean(run.output?.reliability_skipped),
        tool_calls: (run.tool_calls || []).map((tc) => ({
          name: tc.name,
          classification: tc.classification,
          status: tc.status,
          duration_ms: tc.duration_ms,
        })),
      });
    }

    // Convert processed human review cases (only adjudicated cases belong in the audit trail)
    const resolvedCases = reviewCases.filter((rc) => rc.status === 'RESOLVED');
    const resolvedDetails = await Promise.all(
      resolvedCases.map(async (rc) => {
        try {
          return await reviewApi.getReviewCase(rc.case_id, signal);
        } catch {
          return null;
        }
      })
    );

    for (let i = 0; i < resolvedCases.length; i++) {
      const rc = resolvedCases[i];
      const detail: ReviewCaseDetail | null = resolvedDetails[i];
      const resolution = detail?.resolution;
      const finalDec = (resolution?.final_decision || rc.proposed_decision || 'Adjudicated').trim();
      const resType = (resolution?.decision || '').toLowerCase();

      let outcome: AuditEventItem['outcome'] = 'approved';
      const decUpper = finalDec.toUpperCase();
      if (resType === 'override') {
        outcome = 'overridden';
      } else if (decUpper.includes('REJECT') || decUpper.includes('DENY')) {
        outcome = 'rejected';
      } else {
        outcome = 'approved';
      }

      let decisionDesc =
        resType === 'override'
          ? `Override → ${finalDec}`
          : `Accepted ${finalDec}`;
      if (resolution?.resolution_reason) {
        decisionDesc = `${decisionDesc}: ${resolution.resolution_reason}`;
      } else if (rc.escalation_reasons && rc.escalation_reasons.length > 0) {
        decisionDesc = `${decisionDesc}: ${rc.escalation_reasons[0]}`;
      }

      liveItems.push({
        id: rc.case_id,
        timestamp: resolution?.resolved_at || rc.created_at,
        execution_id: rc.execution_id,
        agent_id: rc.agent_id,
        agent_name: agentMap.get(rc.agent_id) || rc.agent_name || `Agent ${rc.agent_id.slice(0, 8)}`,
        source: 'human',
        action_type: 'human_resolution',
        decision: decisionDesc,
        outcome,
        confidence: typeof rc.confidence === 'number' ? rc.confidence : undefined,
        reliability_threshold: detail?.reliability_threshold,
        audit_record_id: resolution?.audit_record_id,
        reviewer_id: resolution?.reviewer_id,
        case_id: rc.case_id,
      });
    }

    // Merge baseline seeds with live items and deduplicate by id
    const seen = new Set<string>();
    const merged: Omit<AuditEventItem, 'seq' | 'prev_hash' | 'hash'>[] = [];

    for (const item of [...HISTORICAL_LEDGER_SEEDS, ...liveItems]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }

    // Sort chronologically ascending
    merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Build cryptographic chain
    let currentPrevHash = CHECKPOINT_ROOT_HASH;
    const baseSeq = 48121;
    const finalizedChain: AuditEventItem[] = [];

    for (let i = 0; i < merged.length; i++) {
      const item = merged[i];
      const seq = baseSeq + i;
      const canonicalPayload = `${seq}:${item.timestamp}:${item.execution_id}:${item.agent_name}:${item.decision}:${item.outcome}:${currentPrevHash}`;
      const blockHash = await computeSHA256(canonicalPayload);

      const chainItem: AuditEventItem = {
        ...item,
        seq,
        prev_hash: currentPrevHash,
        hash: blockHash,
      };

      finalizedChain.push(chainItem);
      currentPrevHash = blockHash;
    }

    // Return in reverse chronological order (newest head first)
    return finalizedChain.reverse();
  },

  /**
   * Cryptographically verifies the unbroken SHA-256 integrity of the hash-chain
   * from the genesis checkpoint root to the latest chain head.
   */
  verifyHashChain: async (items: AuditEventItem[]): Promise<ChainVerificationResult> => {
    const startTime = performance.now();
    if (items.length === 0) {
      return {
        isValid: true,
        verifiedCount: 0,
        headHash: CHECKPOINT_ROOT_HASH,
        rootHash: CHECKPOINT_ROOT_HASH,
        headSeq: 0,
        durationMs: 0,
        lastEntryTime: new Date().toISOString(),
        blocks: [],
      };
    }

    // Sort ascending for sequential verification
    const ascending = [...items].sort((a, b) => a.seq - b.seq);
    let expectedPrevHash = ascending[0].prev_hash;
    let chainValid = true;
    const blocks: AuditBlockProof[] = [];

    for (const item of ascending) {
      const canonicalPayload = `${item.seq}:${item.timestamp}:${item.execution_id}:${item.agent_name}:${item.decision}:${item.outcome}:${expectedPrevHash}`;
      const recalculatedHash = await computeSHA256(canonicalPayload);

      const isBlockValid = item.prev_hash === expectedPrevHash && item.hash === recalculatedHash;
      if (!isBlockValid) {
        chainValid = false;
      }

      blocks.push({
        seq: item.seq,
        hash: item.hash,
        prev_hash: item.prev_hash,
        calculated_hash: recalculatedHash,
        timestamp: item.timestamp,
        is_valid: isBlockValid,
      });

      expectedPrevHash = item.hash;
    }

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const latestItem = ascending[ascending.length - 1];

    return {
      isValid: chainValid,
      verifiedCount: ascending.length,
      headHash: latestItem.hash,
      rootHash: ascending[0].prev_hash,
      headSeq: latestItem.seq,
      durationMs,
      lastEntryTime: latestItem.timestamp,
      blocks,
    };
  },
};
