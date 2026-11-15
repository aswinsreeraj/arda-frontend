import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/features/reviews/reviewApi';
import type { ReviewCaseDetail } from '@/features/reviews/types';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  UserCheck,
  Bot,
  Check,
  Copy,
} from 'lucide-react';
import clsx from 'clsx';

interface AuditCaseModalProps {
  isOpen: boolean;
  caseId: string | null;
  onClose: () => void;
}

export const AuditCaseModal: React.FC<AuditCaseModalProps> = ({ isOpen, caseId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'input' | 'context'>('tools');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch complete review case detail
  const {
    data: caseDetail,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ReviewCaseDetail>({
    queryKey: ['reviewDetail', caseId],
    queryFn: ({ signal }) => reviewApi.getReviewCase(caseId!, signal),
    enabled: Boolean(isOpen && caseId),
  });

  if (!isOpen || !caseId) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatUtcTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    } catch {
      return isoString;
    }
  };

  const getPriorityBadge = (confidence?: number) => {
    if (confidence === undefined) return null;
    if (confidence < 0.5) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-red-950/60 text-red-400 border border-red-800/60">
          P1 HIGH
        </span>
      );
    }
    if (confidence < 0.7) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950/60 text-amber-400 border border-amber-800/60">
          P2 MED
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
        P3 LOW
      </span>
    );
  };

  const resolution = caseDetail?.resolution;
  const isApproved =
    resolution?.decision === 'approve' ||
    (caseDetail?.proposed_decision || '').toUpperCase().includes('APPROVE');
  const isRejected =
    resolution?.decision === 'reject' ||
    (caseDetail?.proposed_decision || '').toUpperCase().includes('REJECT');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-case-title"
    >
      <div className="bg-[#141414] border border-[#282828] rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-neutral-200 font-sans">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#242424] bg-[#161616] flex-none">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-semibold text-white tracking-tight">
                  {caseDetail?.case_id || caseId}
                </span>
                {caseDetail && getPriorityBadge(caseDetail.confidence)}
                {caseDetail?.execution_mode && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold border bg-purple-950/60 border-purple-800/60 text-purple-300">
                    {caseDetail.execution_mode}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Execution: {caseDetail?.execution_id || '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              title="Close modal (Esc)"
              className="p-1.5 hover:bg-[#222222] rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {isLoading ? (
          <div className="p-12 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <div className="text-xs text-neutral-400 font-mono">
              Retrieving case evidence & adjudication record...
            </div>
          </div>
        ) : isError || !caseDetail ? (
          <div className="p-8 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div className="text-sm font-semibold text-white">Could not load case details</div>
            <div className="text-xs text-neutral-400 font-mono max-w-sm">
              {error instanceof Error ? error.message : 'Error querying case details'}
            </div>
            <button
              onClick={() => refetch()}
              className="px-3.5 py-1.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-xs font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* 1. DECISION TAKEN BANNER (Authoritative Resolution) */}
            <div
              className={clsx(
                'p-4 rounded-lg border',
                isApproved && 'bg-[#0e1d16] border-emerald-500/40 text-emerald-200',
                isRejected && 'bg-[#221014] border-red-500/40 text-red-200',
                !isApproved && !isRejected && 'bg-[#22190d] border-amber-500/40 text-amber-200'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <ShieldCheck
                    className={clsx(
                      'w-5 h-5 shrink-0 mt-0.5',
                      isApproved && 'text-emerald-400',
                      isRejected && 'text-red-400',
                      !isApproved && !isRejected && 'text-amber-400'
                    )}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Decision Taken:
                      </span>
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded text-xs font-mono font-bold uppercase border',
                          isApproved && 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60',
                          isRejected && 'bg-red-950/90 text-red-300 border-red-700/60',
                          !isApproved &&
                            !isRejected &&
                            'bg-amber-950/90 text-amber-300 border-amber-700/60'
                        )}
                      >
                        {resolution?.final_decision ||
                          caseDetail.proposed_decision ||
                          'ADJUDICATED'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-neutral-300 font-mono">
                        {caseDetail.status}
                      </span>
                    </div>

                    {/* Resolution Reason */}
                    <div className="text-xs text-neutral-200 pt-0.5">
                      <span className="text-neutral-400 font-medium">Resolution Rationale: </span>
                      <span className="font-medium italic">
                        &quot;
                        {resolution?.resolution_reason ||
                          'Adjudicated and approved via reviewer queue'}
                        &quot;
                      </span>
                    </div>

                    {/* Metadata Sub-bar */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-400 font-mono pt-1">
                      {resolution?.audit_record_id && (
                        <span>
                          Audit Record:{' '}
                          <span className="text-neutral-200 font-semibold">
                            {resolution.audit_record_id}
                          </span>
                        </span>
                      )}
                      {resolution?.reviewer_id && (
                        <span>
                          Reviewer:{' '}
                          <span className="text-neutral-200">{resolution.reviewer_id}</span>
                        </span>
                      )}
                      <span>
                        Adjudicated:{' '}
                        <span className="text-neutral-300">
                          {formatUtcTime(resolution?.resolved_at || caseDetail.updated_at)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] shrink-0 pl-3">
                  <div className="text-neutral-400">Proposed by Agent:</div>
                  <div className="text-neutral-200 font-semibold">
                    {caseDetail.proposed_decision}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AGENT & GOVERNANCE TRIGGERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Agent Overview */}
              <div className="p-3.5 rounded-lg bg-[#161616] border border-[#242424] space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-neutral-400 text-[11px] font-medium uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Agent Context</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-white font-semibold text-sm">{caseDetail.agent_name}</span>
                  <span className="font-mono text-neutral-400 text-[11px]">
                    v{caseDetail.agent_version_number || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Calibrated Confidence</span>
                  <span
                    className={clsx(
                      'font-bold',
                      caseDetail.confidence < 0.7 ? 'text-amber-400' : 'text-emerald-400'
                    )}
                  >
                    {(caseDetail.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
                  <span>Reliability Threshold (τ)</span>
                  <span className="text-neutral-300">
                    {((caseDetail.reliability_threshold || 0.85) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Escalation Triggers */}
              <div className="p-3.5 rounded-lg bg-[#161616] border border-[#242424] space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-neutral-400 text-[11px] font-medium uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Escalation Triggers</span>
                </div>
                <ul className="space-y-1 text-[11px] text-neutral-300">
                  {caseDetail.escalation_reasons && caseDetail.escalation_reasons.length > 0 ? (
                    caseDetail.escalation_reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-amber-500 font-bold shrink-0">•</span>
                        <span>{reason}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-neutral-500 italic">No specific triggers recorded.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* 3. FROZEN EVIDENCE VIEWER */}
            <div className="border border-[#262626] rounded-lg bg-[#161616] overflow-hidden">
              {/* Evidence Tab Headers */}
              <div className="flex items-center justify-between border-b border-[#242424] px-3 bg-[#181818]">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveTab('tools')}
                    className={clsx(
                      'px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer',
                      activeTab === 'tools'
                        ? 'border-sky-500 text-white font-semibold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      Tool Invocations (
                      {caseDetail.frozen_evidence?.tool_calls?.length || 0})
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('input')}
                    className={clsx(
                      'px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer',
                      activeTab === 'input'
                        ? 'border-sky-500 text-white font-semibold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Original Input</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('context')}
                    className={clsx(
                      'px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer',
                      activeTab === 'context'
                        ? 'border-sky-500 text-white font-semibold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Context & Neighbors</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                  Frozen Evidence · Tamper Sealed
                </span>
              </div>

              {/* Evidence Tab Bodies */}
              <div className="p-4">
                {activeTab === 'tools' && (
                  <div className="space-y-3">
                    {!caseDetail.frozen_evidence?.tool_calls ||
                    caseDetail.frozen_evidence.tool_calls.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-500 font-mono">
                        No tool invocations recorded for this execution.
                      </div>
                    ) : (
                      caseDetail.frozen_evidence.tool_calls.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-[#111111] border border-[#232323] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-white font-semibold">
                                {tc.tool_name}
                              </span>
                              <span
                                className={clsx(
                                  'text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase',
                                  tc.allowed
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                    : 'bg-red-950 text-red-400 border border-red-800/40'
                                )}
                              >
                                {tc.allowed ? 'Allowed' : 'Denied'}
                              </span>
                            </div>
                            {tc.duration_ms !== undefined && (
                              <span className="text-[11px] font-mono text-neutral-400">
                                {tc.duration_ms}ms
                              </span>
                            )}
                          </div>

                          {/* Arguments */}
                          {tc.arguments && Object.keys(tc.arguments).length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono uppercase text-neutral-500">
                                Arguments
                              </div>
                              <pre className="p-2 rounded bg-[#0a0a0a] text-[11px] font-mono text-neutral-300 overflow-x-auto border border-[#1a1a1a]">
                                {JSON.stringify(tc.arguments, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Result */}
                          {tc.result && Object.keys(tc.result).length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono uppercase text-neutral-500">
                                Result
                              </div>
                              <pre className="p-2 rounded bg-[#0a0a0a] text-[11px] font-mono text-emerald-400 overflow-x-auto border border-[#1a1a1a]">
                                {JSON.stringify(tc.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'input' && (
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs text-neutral-400 font-mono">
                        Original payload submitted to workflow:
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(caseDetail.frozen_evidence?.original_input, null, 2),
                            'input'
                          )
                        }
                        className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center space-x-1"
                      >
                        {copiedText === 'input' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-[#0e0e0e] border border-[#222] font-mono text-xs text-neutral-200 overflow-x-auto max-h-64">
                      {JSON.stringify(caseDetail.frozen_evidence?.original_input, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === 'context' && (
                  <div className="space-y-3 text-xs">
                    {/* Agent Reasoning */}
                    {caseDetail.frozen_evidence?.agent_reasoning && (
                      <div className="p-3 rounded bg-[#111] border border-[#222] space-y-1">
                        <div className="text-[10px] font-mono uppercase text-neutral-500">
                          Agent Chain-of-Thought / Reasoning
                        </div>
                        <p className="text-neutral-300 leading-relaxed text-xs">
                          {caseDetail.frozen_evidence.agent_reasoning}
                        </p>
                      </div>
                    )}

                    {/* Nearest Reference Neighbors */}
                    {caseDetail.frozen_evidence?.neighbors &&
                      caseDetail.frozen_evidence.neighbors.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono uppercase text-neutral-500">
                            Nearest Reference Neighbors (Conformal Calibration Set)
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {caseDetail.frozen_evidence.neighbors.map((n, i) => (
                              <div
                                key={i}
                                className="p-2 rounded bg-[#111] border border-[#222] flex items-center justify-between text-xs"
                              >
                                <div className="font-mono text-neutral-300">
                                  {n.reference_example_id}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-[10px] text-neutral-400">
                                    {(n.similarity * 100).toFixed(0)}% similarity
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#1e1e1e] border border-[#333] text-neutral-200">
                                    {n.label}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#242424] bg-[#161616] flex items-center justify-between text-xs font-mono text-neutral-400 flex-none">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Cryptographically sealed in Audit Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium border border-[#333] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
