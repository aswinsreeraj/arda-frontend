import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from './reviewApi';
import { useReviewWebSocket, type ReviewWSNotification } from './useReviewWebSocket';
import type {
  ReviewCaseSummary,
  ReviewCaseDetail,
  ResolveReviewRequest,
  ReviewListFilters,
} from './types';
import { ApiError } from '@/types/common';
import {
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Edit3,
  RefreshCw,
  ChevronRight,
  Copy,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

const getAgentProposedDecision = (raw?: string | null): 'APPROVE' | 'REJECT' | null => {
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  if (normalized === 'APPROVE' || normalized === 'REJECT') {
    return normalized;
  }
  return null;
};

export const ReviewQueuePage: React.FC = () => {
  const { caseId } = useParams<{ caseId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state for queue filters
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'RESOLVED'>('OPEN');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'tools' | 'input' | 'context'>('tools');

  // Adjudication Modal State (Accept agent's decision or Override with a different decision)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveDecision, setResolveDecision] = useState<'approve' | 'override'>('approve');
  const [resolveReason, setResolveReason] = useState('');
  const [resolveFinalDecision, setResolveFinalDecision] = useState('');
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  // Toast notice for successful operations
  const [toastNotice, setToastNotice] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Live tenant-scoped WebSocket notifications (REST API remains single source of truth)
  const handleReviewWSEvent = useCallback(
    (event: ReviewWSNotification) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      if (event.case_id) {
        queryClient.invalidateQueries({ queryKey: ['reviewDetail', event.case_id] });
      }
      if (event.type === 'review.resolved') {
        queryClient.invalidateQueries({ queryKey: ['audit-events'] });
      } else if (event.type === 'review.created' && event.case_id) {
        setToastNotice((prev) =>
          prev
            ? prev
            : {
                message: `New escalated case ${event.case_id} arrived.`,
                type: 'info',
              }
        );
        window.setTimeout(() => {
          setToastNotice((prev) =>
            prev?.message === `New escalated case ${event.case_id} arrived.` ? null : prev
          );
        }, 4000);
      }
    },
    [queryClient]
  );

  const { status: wsStatus } = useReviewWebSocket({
    enabled: true,
    onEvent: handleReviewWSEvent,
  });

  // Filter params sent to backend
  const queryFilters: ReviewListFilters = useMemo(() => {
    const f: ReviewListFilters = {
      status: statusFilter,
    };
    if (selectedAgentId) f.agent_id = selectedAgentId;
    return f;
  }, [statusFilter, selectedAgentId]);

  // 1. Fetch Review Cases Queue from real backend
  const {
    data: listResponse,
    isLoading: isQueueLoading,
    isError: isQueueError,
    error: queueError,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ['reviews', queryFilters],
    queryFn: ({ signal }) => reviewApi.listReviews(queryFilters, signal),
  });

  const cases: ReviewCaseSummary[] = useMemo(() => {
    return listResponse?.cases || [];
  }, [listResponse]);

  // Derive unique agents present for agent filter dropdown
  const availableAgents = useMemo(() => {
    const map = new Map<string, string>();
    cases.forEach((c) => {
      if (c.agent_id && c.agent_name) {
        map.set(c.agent_id, c.agent_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [cases]);

  // Filter cases by client search query
  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return cases;
    const q = searchQuery.toLowerCase().trim();
    return cases.filter(
      (c) =>
        c.case_id.toLowerCase().includes(q) ||
        c.execution_id.toLowerCase().includes(q) ||
        c.agent_name.toLowerCase().includes(q) ||
        c.proposed_decision.toLowerCase().includes(q) ||
        c.escalation_reasons.some((r) => r.toLowerCase().includes(q))
    );
  }, [cases, searchQuery]);

  // Active Selected Case ID (only set when explicitly selected / in URL)
  const activeCaseId = caseId || '';

  const currentIndex = useMemo(() => {
    return filteredCases.findIndex((c) => c.case_id === activeCaseId);
  }, [filteredCases, activeCaseId]);

  // Close inspector when user presses Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCaseId && !isResolveModalOpen) {
        navigate('/reviews');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCaseId, isResolveModalOpen, navigate]);

  // 2. Fetch Active Case Detail from real backend
  const {
    data: caseDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery<ReviewCaseDetail>({
    queryKey: ['reviewDetail', activeCaseId],
    queryFn: ({ signal }) => reviewApi.getReviewCase(activeCaseId, signal),
    enabled: Boolean(activeCaseId),
  });

  // Navigate to selected case
  const handleSelectCase = useCallback(
    (id: string) => {
      navigate(`/reviews/${id}`);
    },
    [navigate]
  );

  // 3. Resolve Mutation calling backend POST /api/v1/reviews/:id/resolve
  const resolveMutation = useMutation({
    mutationFn: async ({
      caseIdToResolve,
      payload,
    }: {
      caseIdToResolve: string;
      payload: ResolveReviewRequest;
    }) => {
      return await reviewApi.resolveReviewCase(caseIdToResolve, payload);
    },
    onSuccess: (res, variables) => {
      const actionLabel =
        variables.payload.decision === 'approve'
          ? `ACCEPTED (${variables.payload.final_decision || 'AGENT DECISION'})`
          : `OVERRIDDEN (${variables.payload.final_decision || 'CUSTOM'})`;
      setToastNotice({
        message: `Case ${res.case_id} ${actionLabel}. Audit: ${res.audit_record_id}`,
        type: 'success',
      });
      setIsResolveModalOpen(false);
      setResolveReason('');
      setResolveFinalDecision('');
      setResolutionError(null);

      // Invalidate queries so queue, detail, and audit trail refresh with authoritative backend data
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewDetail', variables.caseIdToResolve] });
      queryClient.invalidateQueries({ queryKey: ['audit-events'] });

      // Return to review queue list
      navigate('/reviews');

      setTimeout(() => setToastNotice(null), 5000);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === 'CASE_ALREADY_RESOLVED') {
          setResolutionError(
            'Conflict (409): This review case has already been resolved by another reviewer. Refetching latest state...'
          );
          queryClient.invalidateQueries({ queryKey: ['reviews'] });
          queryClient.invalidateQueries({ queryKey: ['reviewDetail', activeCaseId] });
        } else {
          setResolutionError(err.message || 'Adjudication failed. Please verify submission.');
        }
      } else {
        setResolutionError(
          err instanceof Error ? err.message : 'An unexpected error occurred during adjudication.'
        );
      }
    },
  });

  const agentProposedDecision = getAgentProposedDecision(caseDetail?.proposed_decision);

  // Open modal for decision
  const triggerAdjudicate = useCallback(
    (decision: 'approve' | 'override') => {
      if (!caseDetail) return;
      if (caseDetail.status === 'RESOLVED') {
        setToastNotice({
          message: 'Case is already resolved. No further adjudication permitted.',
          type: 'info',
        });
        setTimeout(() => setToastNotice(null), 3000);
        return;
      }
      const proposed = getAgentProposedDecision(caseDetail.proposed_decision);
      if (decision === 'approve' && !proposed) {
        return;
      }
      setResolveDecision(decision);
      setResolveReason('');
      if (decision === 'override') {
        if (proposed === 'APPROVE') {
          setResolveFinalDecision('REJECT');
        } else if (proposed === 'REJECT') {
          setResolveFinalDecision('APPROVE');
        } else {
          setResolveFinalDecision('');
        }
      } else {
        setResolveFinalDecision(proposed || '');
      }
      setResolutionError(null);
      setIsResolveModalOpen(true);
    },
    [caseDetail]
  );

  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDetail) return;

    if (!resolveReason.trim()) {
      setResolutionError('Resolution reason is mandatory for governance audit compliance.');
      return;
    }

    if (resolveDecision === 'approve' && !agentProposedDecision) {
      setResolutionError('No agent decision is available to accept. Please override with an authoritative decision.');
      return;
    }

    if (resolveDecision === 'override') {
      const trimmedFinal = resolveFinalDecision.trim();
      if (!trimmedFinal) {
        setResolutionError('Authoritative final decision is required when overriding.');
        return;
      }
      if (agentProposedDecision && trimmedFinal.toUpperCase() === agentProposedDecision) {
        setResolutionError(
          `Override decision must differ from the agent's proposed decision (${agentProposedDecision}). Use Accept instead.`
        );
        return;
      }
    }

    setResolutionError(null);
    resolveMutation.mutate({
      caseIdToResolve: caseDetail.case_id || caseDetail.id,
      payload: {
        decision: resolveDecision,
        reason: resolveReason.trim(),
        final_decision:
          resolveDecision === 'override'
            ? resolveFinalDecision.trim().toUpperCase()
            : agentProposedDecision || '',
      },
    });
  };

  // Keyboard navigation & decision hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        isResolveModalOpen
      ) {
        return;
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < filteredCases.length - 1) {
          const next = filteredCases[currentIndex + 1];
          handleSelectCase(next.case_id);
        }
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prev = filteredCases[currentIndex - 1];
          handleSelectCase(prev.case_id);
        }
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (caseDetail?.status !== 'RESOLVED' && agentProposedDecision) {
          triggerAdjudicate('approve');
        }
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        if (caseDetail?.status !== 'RESOLVED') {
          triggerAdjudicate('override');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentIndex,
    filteredCases,
    handleSelectCase,
    triggerAdjudicate,
    isResolveModalOpen,
    caseDetail?.status,
    agentProposedDecision,
  ]);

  // Derive priority badge based on confidence and threshold
  const getPriorityBadge = (confidence: number) => {
    if (confidence < 0.5) {
      return <span className="text-[10px] font-bold font-mono text-red-400">P1</span>;
    }
    if (confidence < 0.7) {
      return <span className="text-[10px] font-bold font-mono text-amber-500">P2</span>;
    }
    return <span className="text-[10px] font-bold font-mono text-neutral-400">P3</span>;
  };

  const formatUtcTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    } catch {
      return isoString;
    }
  };

  const effectiveThreshold =
    caseDetail && caseDetail.reliability_threshold > 0
      ? caseDetail.reliability_threshold
      : 0.85;

  const isPolicyEscalation = Boolean(
    caseDetail &&
      caseDetail.escalation_reasons &&
      caseDetail.escalation_reasons.length > 0 &&
      caseDetail.confidence <= 0
  );

  return (
    <main className="flex-1 flex overflow-hidden select-none bg-slate-100 dark:bg-[#141414] text-slate-900 dark:text-neutral-200">
      {/* Toast Notification */}
      {toastNotice && (
        <div
          className={clsx(
            'absolute top-3 right-6 z-50 px-3.5 py-2.5 rounded-lg text-xs font-mono shadow-2xl flex items-center space-x-2 border transition-all animate-in fade-in slide-in-from-top-2',
            toastNotice.type === 'success' && 'bg-[#0f1f18] border-emerald-500/60 text-emerald-200',
            toastNotice.type === 'error' && 'bg-[#261014] border-red-500/60 text-red-200',
            toastNotice.type === 'info' && 'bg-[#121c2e] border-blue-500/60 text-blue-200'
          )}
        >
          {toastNotice.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastNotice.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          {toastNotice.type === 'info' && <Clock className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toastNotice.message}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* LEFT: Escalation Queue List (Full width or Split Pane) */}
      {/* ========================================================= */}
      <section
        className={clsx(
          'flex flex-col bg-white dark:bg-[#141414] overflow-hidden transition-all',
          activeCaseId ? 'w-1/2 border-r border-slate-200 dark:border-[#232323]' : 'w-full'
        )}
      >
        {/* Queue Header & Filter Toolbar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#232323] space-y-3 flex-none bg-white dark:bg-[#141414]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                Escalation Queue
              </h1>
              <span
                title={
                  wsStatus === 'connected'
                    ? 'Connected to tenant-scoped live review updates'
                    : wsStatus === 'reconnecting' || wsStatus === 'connecting'
                      ? 'Reconnecting to live review updates'
                      : 'Live updates disconnected (use Refresh to sync)'
                }
                className={clsx(
                  'inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border',
                  wsStatus === 'connected' &&
                    'bg-emerald-950/50 text-emerald-300 border-emerald-800/60',
                  (wsStatus === 'connecting' || wsStatus === 'reconnecting') &&
                    'bg-amber-950/50 text-amber-300 border-amber-800/60',
                  wsStatus === 'offline' && 'bg-neutral-900 text-neutral-400 border-neutral-700'
                )}
              >
                <span
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    wsStatus === 'connected' && 'bg-emerald-400 animate-pulse',
                    (wsStatus === 'connecting' || wsStatus === 'reconnecting') &&
                      'bg-amber-400 animate-pulse',
                    wsStatus === 'offline' && 'bg-neutral-500'
                  )}
                />
                <span>
                  {wsStatus === 'connected'
                    ? 'Live'
                    : wsStatus === 'reconnecting'
                      ? 'Reconnecting'
                      : wsStatus === 'connecting'
                        ? 'Connecting'
                        : 'Offline'}
                </span>
              </span>
            </div>

            {/* Status Tabs: OPEN vs RESOLVED */}
            <div className="flex items-center bg-slate-100 dark:bg-[#1b1b1b] p-0.5 rounded border border-slate-200 dark:border-[#2c2c2c] text-xs">
              <button
                onClick={() => setStatusFilter('OPEN')}
                className={clsx(
                  'px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  statusFilter === 'OPEN'
                    ? 'bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                )}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('RESOLVED')}
                className={clsx(
                  'px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  statusFilter === 'RESOLVED'
                    ? 'bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                )}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2 text-xs">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case ID, agent, proposed decision..."
                type="text"
                className="w-full bg-white dark:bg-[#1b1b1b] border border-slate-300 dark:border-[#2c2c2c] rounded pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Agent Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-white dark:bg-[#1b1b1b] border border-slate-300 dark:border-[#2c2c2c] px-2.5 py-1.5 rounded text-slate-700 dark:text-neutral-300 text-xs hover:bg-slate-50 dark:hover:bg-[#222] focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="">All agents</option>
                {availableAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-neutral-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => refetchQueue()}
              title="Refresh queue"
              className="p-1.5 rounded bg-white dark:bg-[#1b1b1b] border border-slate-300 dark:border-[#2c2c2c] hover:bg-slate-50 dark:hover:bg-[#222] text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', isQueueLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Queue Table Container */}
        <div className="flex-1 overflow-y-auto">
          {isQueueLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded bg-slate-100 dark:bg-[#1a1a1a] animate-pulse border border-slate-200 dark:border-[#232323]"
                />
              ))}
            </div>
          ) : isQueueError ? (
            <div className="p-8 text-center space-y-3">
              <ShieldAlert className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto" />
              <div className="text-sm font-medium text-slate-900 dark:text-white">Failed to load review queue</div>
              <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                {queueError instanceof Error ? queueError.message : 'Backend connection error'}
              </div>
              <button
                onClick={() => refetchQueue()}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
              >
                Retry connection
              </button>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-400 dark:text-neutral-600 mx-auto" />
              <div className="text-sm font-medium text-slate-900 dark:text-white">Queue is clear</div>
              <div className="text-xs text-slate-500 dark:text-neutral-500 max-w-xs mx-auto">
                No {statusFilter.toLowerCase()} review cases found matching your filters.
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-[#181818] border-b border-slate-200 dark:border-[#232323] text-slate-500 dark:text-neutral-400 sticky top-0 z-10 select-none">
                <tr className="text-[11px]">
                  <th className="py-2 px-3 font-normal w-12">Priority</th>
                  <th className="py-2 px-3 font-normal w-36">Case ID</th>
                  <th className="py-2 px-3 font-normal w-44">Agent</th>
                  <th className="py-2 px-3 font-normal">Proposed decision</th>
                  {!activeCaseId && (
                    <>
                      <th className="py-2 px-3 font-normal w-24 text-right">Confidence</th>
                      <th className="py-2 px-3 font-normal w-44">Created (UTC)</th>
                      <th className="py-2 px-3 font-normal w-24 text-right pr-4">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#202020] font-sans">
                {filteredCases.map((c) => {
                  const isSelected = c.case_id === activeCaseId;
                  return (
                    <tr
                      key={c.case_id}
                      onClick={() => handleSelectCase(c.case_id)}
                      className={clsx(
                        'cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-[#1e1e1e] border-l-2 border-l-blue-500'
                          : 'hover:bg-slate-50/80 dark:hover:bg-[#1a1a1a]'
                      )}
                    >
                      <td className="py-3 px-3 align-top">
                        {getPriorityBadge(c.confidence)}
                      </td>
                      <td className="py-3 px-3 align-top font-mono text-slate-600 dark:text-neutral-300">
                        <div className="space-y-0.5">
                          <span className={clsx('font-medium', isSelected && 'text-slate-900 dark:text-white')}>
                            {c.case_id}
                          </span>
                          <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono truncate max-w-[120px]">
                            {c.execution_id}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                          {c.agent_name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-neutral-400 font-mono">
                          {c.status}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        {(() => {
                          const proposed = getAgentProposedDecision(c.proposed_decision);
                          return proposed ? (
                            <div className="font-mono font-semibold text-slate-800 dark:text-neutral-200">
                              {proposed}
                            </div>
                          ) : (
                            <div className="italic text-slate-400 dark:text-neutral-500">
                              No decision proposed
                            </div>
                          );
                        })()}
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                          {c.escalation_reasons[0] || 'Escalation threshold breached'}
                        </div>
                      </td>
                      {!activeCaseId && (
                        <>
                          <td className="py-3 px-3 align-top font-mono text-right text-slate-600 dark:text-neutral-300">
                            {(c.confidence * 100).toFixed(0)}%
                          </td>
                          <td className="py-3 px-3 align-top font-mono text-slate-500 dark:text-neutral-400">
                            {formatUtcTime(c.created_at)}
                          </td>
                          <td className="py-3 px-3 align-top text-right pr-4">
                            <span className="inline-flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Queue Footer */}
        <div className="p-2.5 border-t border-slate-200 dark:border-[#232323] bg-slate-50 dark:bg-[#161616] flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-mono flex-none">
          <span>{filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'}</span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RIGHT: Escalation Case Inspector (50% Split Pane) */}
      {/* ========================================================= */}
      {activeCaseId ? (
        <section className="w-1/2 flex flex-col bg-slate-50 dark:bg-[#141414] overflow-hidden">
          {isDetailLoading ? (
            <div className="flex-1 p-6 space-y-4">
              <div className="h-10 bg-slate-200 dark:bg-[#1c1c1c] rounded animate-pulse" />
              <div className="h-40 bg-slate-200 dark:bg-[#1c1c1c] rounded animate-pulse" />
              <div className="h-40 bg-slate-200 dark:bg-[#1c1c1c] rounded animate-pulse" />
            </div>
          ) : isDetailError || !caseDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <div className="text-sm font-medium text-slate-900 dark:text-white">Could not load case detail</div>
              <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono max-w-sm">
                {detailError instanceof Error ? detailError.message : 'Error retrieving frozen evidence'}
              </div>
              <button
                onClick={() => refetchDetail()}
                className="px-3.5 py-1.5 rounded bg-white hover:bg-slate-100 dark:bg-[#202020] dark:hover:bg-[#282828] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Top Inspector Header */}
              <div className="p-4 border-b border-slate-200 dark:border-[#232323] space-y-3 flex-none bg-white dark:bg-[#161616]">
                {/* Row 1: Case ID, Status, Mode & Navigation */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {getPriorityBadge(caseDetail.confidence)}
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      {caseDetail.case_id || caseDetail.id}
                    </span>
                    <span
                      className={clsx(
                        'text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold border',
                        caseDetail.status === 'RESOLVED'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                      )}
                    >
                      ● {caseDetail.status.toLowerCase()}
                    </span>
                    <span
                      className={clsx(
                        'text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold border',
                        caseDetail.execution_mode === 'durable'
                          ? 'bg-purple-950/50 border-purple-800/50 text-purple-300'
                          : 'bg-blue-950/50 border-blue-800/50 text-blue-300'
                      )}
                    >
                      {caseDetail.execution_mode}
                    </span>
                  </div>

                  {/* Navigation Shortcuts & Close */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 shrink-0">
                    <div className="flex items-center bg-[#1c1c1c] border border-[#2c2c2c] rounded-md px-2 py-1 gap-1.5">
                      <span className="text-[11px] font-mono font-medium text-gray-300">
                        {currentIndex >= 0 ? currentIndex + 1 : 1} of {filteredCases.length}
                      </span>
                      <div className="w-px h-3 bg-[#333] mx-0.5" />
                      <button
                        disabled={currentIndex <= 0}
                        onClick={() => {
                          if (currentIndex > 0)
                            handleSelectCase(filteredCases[currentIndex - 1].case_id);
                        }}
                        className="p-0.5 hover:bg-[#282828] rounded text-neutral-400 hover:text-white transition disabled:opacity-30 cursor-pointer"
                        title="Previous case (k)"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={currentIndex >= filteredCases.length - 1}
                        onClick={() => {
                          if (currentIndex < filteredCases.length - 1)
                            handleSelectCase(filteredCases[currentIndex + 1].case_id);
                        }}
                        className="p-0.5 hover:bg-[#282828] rounded text-neutral-400 hover:text-white transition disabled:opacity-30 cursor-pointer"
                        title="Next case (j)"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Close Sidewindow Button */}
                    <button
                      onClick={() => navigate('/reviews')}
                      title="Close inspector (Esc)"
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#242424] rounded-md text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-transparent hover:border-[#333]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Agent Name, Version & Time */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {caseDetail.agent_name}
                    </h2>
                    <span className="font-mono text-[11px] text-gray-300 px-2 py-0.5 rounded bg-[#222] border border-[#303030]">
                      v{caseDetail.agent_version_number || 1}
                    </span>
                    <span className="text-slate-400 dark:text-neutral-600">·</span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 text-[11px]">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(caseDetail.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Row 3: Workflow / Execution Reference */}
                {caseDetail.execution_id && (
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-[#121212] border border-[#222] text-[11px] font-mono text-gray-400">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-gray-500 uppercase tracking-wider text-[10px] shrink-0 font-semibold">
                        Workflow:
                      </span>
                      <span className="truncate text-gray-300" title={caseDetail.execution_id}>
                        {caseDetail.execution_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(caseDetail.execution_id);
                          setToastNotice({ message: 'Workflow ID copied to clipboard', type: 'info' });
                          setTimeout(() => setToastNotice(null), 2000);
                        }}
                        className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#202020] transition cursor-pointer flex items-center gap-1"
                        title="Copy workflow ID"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </button>
                      {caseDetail.execution_mode === 'durable' && (
                        <a
                          href={`http://localhost:8233/namespaces/default/workflows/${encodeURIComponent(caseDetail.execution_id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 hover:underline"
                          title="Inspect in Temporal UI"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Temporal</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Inspector Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Authoritative Resolution Banner (if RESOLVED) */}
                {caseDetail.status === 'RESOLVED' && caseDetail.resolution && (
                  <div className="p-3.5 rounded bg-[#0e1d15] border border-emerald-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-300">
                          Authoritative Resolution Applied
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60 text-emerald-400 uppercase font-bold">
                        {caseDetail.resolution.decision}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div>
                        <span className="text-neutral-400 text-[10px]">Final Decision:</span>
                        <div className="text-white font-bold">
                          {caseDetail.resolution.final_decision}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[10px]">Audit Record:</span>
                        <div className="text-emerald-400">
                          {caseDetail.resolution.audit_record_id}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-300 font-sans pt-1 border-t border-emerald-900/50">
                      <span className="text-neutral-400 text-[10px] block font-mono">
                        Reviewer Rationale:
                      </span>
                      {caseDetail.resolution.resolution_reason}
                    </div>
                    {caseDetail.resolution.resolved_at && (
                      <div className="text-[10px] text-neutral-400 font-mono">
                        Resolved on {new Date(caseDetail.resolution.resolved_at).toLocaleString()} by reviewer{' '}
                        {caseDetail.resolution.reviewer_id}
                      </div>
                    )}
                  </div>
                )}

                {/* Escalation Reasons Callout */}
                {caseDetail.escalation_reasons && caseDetail.escalation_reasons.length > 0 && (
                  <div className="p-3.5 rounded bg-[#1e1315] border border-red-900/60 flex items-start space-x-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-red-300">
                        Governance Escalation Triggers
                      </div>
                      <ul className="list-disc list-inside text-neutral-300 space-y-0.5">
                        {caseDetail.escalation_reasons.map((reason, idx) => (
                          <li key={idx} className="font-sans leading-relaxed">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Evidence Section */}
                <div className="rounded border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#171717] overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-[#232323] bg-slate-50 dark:bg-[#1a1a1a]">
                    <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                      Frozen Evidence
                    </span>
                    <div className="flex items-center space-x-3 text-xs">
                      <button
                        onClick={() => setActiveEvidenceTab('tools')}
                        className={clsx(
                          'pb-1 transition-colors cursor-pointer',
                          activeEvidenceTab === 'tools'
                            ? 'text-blue-600 dark:text-neutral-200 border-b-2 border-blue-500 font-medium'
                            : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
                        )}
                      >
                        Tool invocations ({caseDetail.frozen_evidence?.tool_calls?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveEvidenceTab('input')}
                        className={clsx(
                          'pb-1 transition-colors cursor-pointer',
                          activeEvidenceTab === 'input'
                            ? 'text-blue-600 dark:text-neutral-200 border-b-2 border-blue-500 font-medium'
                            : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
                        )}
                      >
                        Original input
                      </button>
                      {caseDetail.frozen_evidence?.metadata && (
                        <button
                          onClick={() => setActiveEvidenceTab('context')}
                          className={clsx(
                            'pb-1 transition-colors cursor-pointer',
                            activeEvidenceTab === 'context'
                              ? 'text-blue-600 dark:text-neutral-200 border-b-2 border-blue-500 font-medium'
                              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
                          )}
                        >
                          Context metadata
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Evidence Content Tabs */}
                  {activeEvidenceTab === 'tools' && (
                    <div className="divide-y divide-[#222222] text-xs font-mono">
                      {!caseDetail.frozen_evidence?.tool_calls ||
                        caseDetail.frozen_evidence.tool_calls.length === 0 ? (
                        <div className="p-4 text-center text-neutral-500 text-xs font-sans">
                          No external tools were invoked during this execution.
                        </div>
                      ) : (
                        caseDetail.frozen_evidence.tool_calls.map((tool, idx) => (
                          <div key={tool.tool_id || idx} className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={clsx(
                                    'font-bold text-sm',
                                    tool.allowed !== false ? 'text-emerald-400' : 'text-red-400'
                                  )}
                                >
                                  {tool.allowed !== false ? '✓' : '✕'}
                                </span>
                                <span className="text-white font-semibold">
                                  {tool.tool_name}
                                </span>
                                <span
                                  className={clsx(
                                    'text-[10px] px-1.5 py-0.2 rounded border font-mono',
                                    tool.allowed !== false
                                      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50'
                                      : 'text-red-400 bg-red-950/60 border-red-900/50'
                                  )}
                                >
                                  {tool.allowed !== false ? 'ALLOWED' : 'BLOCKED'}
                                </span>
                              </div>
                              {tool.duration_ms !== undefined && (
                                <span className="text-neutral-400 text-[11px]">
                                  {tool.duration_ms}ms
                                </span>
                              )}
                            </div>

                            {tool.arguments && Object.keys(tool.arguments).length > 0 && (
                              <div className="text-[11px] bg-[#121212] p-2 rounded border border-[#222] overflow-x-auto text-neutral-300">
                                <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">
                                  Arguments:
                                </div>
                                <pre>{JSON.stringify(tool.arguments, null, 2)}</pre>
                              </div>
                            )}

                            {tool.result && Object.keys(tool.result).length > 0 && (
                              <div className="text-[11px] bg-[#121212] p-2 rounded border border-[#222] overflow-x-auto text-neutral-300">
                                <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">
                                  Result:
                                </div>
                                <pre>{JSON.stringify(tool.result, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeEvidenceTab === 'input' && (
                    <div className="p-3.5 text-xs font-mono bg-[#141414] text-neutral-300">
                      {caseDetail.frozen_evidence?.original_input ? (
                        <pre className="overflow-x-auto leading-relaxed">
                          {JSON.stringify(caseDetail.frozen_evidence.original_input, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-neutral-500 font-sans">
                          No original input data preserved.
                        </span>
                      )}
                    </div>
                  )}

                  {activeEvidenceTab === 'context' && (
                    <div className="p-3.5 text-xs font-mono bg-[#141414] text-neutral-300">
                      <pre className="overflow-x-auto leading-relaxed">
                        {JSON.stringify(caseDetail.frozen_evidence?.metadata || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Split Details: Agent Reasoning & Reliability Signal */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Box 1: Agent Reasoning */}
                  <div className="p-3.5 rounded border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#171717] space-y-3 shadow-xs">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-neutral-200">
                      Agent Reasoning
                    </h3>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Proposed decision
                      </span>
                      <div>
                        {agentProposedDecision ? (
                          <div className="font-mono font-semibold text-slate-900 dark:text-white text-xs bg-slate-100 dark:bg-[#222] px-2 py-1 rounded inline-block">
                            {agentProposedDecision}
                          </div>
                        ) : (
                          <div className="text-xs italic text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-[#222] px-2 py-1 rounded inline-block">
                            No decision proposed (requires reviewer override)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Stated rationale
                      </span>
                      {(() => {
                        const rawReasoning = caseDetail.frozen_evidence?.agent_reasoning?.trim() || '';
                        const isReliabilityGateMessage =
                          /^(reliability threshold not met|active learning calibration sample|confidence\s+[\d.]+\s+below)/i.test(
                            rawReasoning
                          );
                        const agentRationale =
                          rawReasoning && !isReliabilityGateMessage ? rawReasoning : '';
                        return (
                          <p
                            className={clsx(
                              'text-xs leading-relaxed font-sans bg-slate-50 dark:bg-[#131313] p-2.5 rounded border border-slate-200 dark:border-[#222]',
                              agentRationale
                                ? 'text-slate-700 dark:text-neutral-300'
                                : 'italic text-slate-500 dark:text-neutral-500'
                            )}
                          >
                            {agentRationale ||
                              'No case rationale was provided by the agent for this decision.'}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Box 2: Reliability Signal & Neighbors */}
                  <div className="p-3.5 rounded border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#171717] space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-neutral-200">
                        Reliability Calibration
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-400">
                        τ = {effectiveThreshold.toFixed(2)}
                      </span>
                    </div>

                    {isPolicyEscalation ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/50 text-amber-400 border border-amber-800/50">
                              Policy Breach
                            </span>
                            <span className="text-xs text-neutral-400">
                              Deterministic Override
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-gray-400">
                            Threshold τ = {effectiveThreshold.toFixed(2)}
                          </span>
                        </div>

                        <div className="p-2.5 rounded bg-[#131313] border border-[#222] text-xs space-y-1">
                          <div className="text-gray-400 text-[11px]">
                            Confidence gate bypassed by governance rule:
                          </div>
                          <div className="text-amber-300 font-mono text-[11px] font-medium leading-relaxed">
                            {caseDetail.escalation_reasons[0] || 'Governance limit exceeded'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 border-t border-[#222]">
                          <span>Gate Status: <strong className="text-amber-400">ESCALATED</strong></span>
                          <span>Evaluation: <strong className="text-gray-300">Policy Trigger</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={clsx(
                                'text-2xl font-bold font-mono',
                                caseDetail.confidence >= effectiveThreshold
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              )}
                            >
                              {caseDetail.confidence.toFixed(2)}
                            </span>
                            <span className="text-xs text-neutral-400">
                              calibrated confidence (p)
                            </span>
                          </div>
                          <span className="text-xs font-mono">
                            {caseDetail.confidence < effectiveThreshold ? (
                              <span className="text-amber-400 font-medium">p &lt; τ (Escalated)</span>
                            ) : (
                              <span className="text-emerald-400 font-medium">p &ge; τ (Reliable)</span>
                            )}
                          </span>
                        </div>

                        {/* Progress Bar with Tau Marker */}
                        <div className="space-y-1.5">
                          <div className="relative h-2.5 w-full bg-[#202020] rounded-full overflow-hidden border border-[#2c2c2c]">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all',
                                caseDetail.confidence >= effectiveThreshold
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              )}
                              style={{
                                width: `${Math.min(100, Math.max(3, caseDetail.confidence * 100))}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                            <span>0.00</span>
                            <span className="text-amber-300 font-semibold bg-[#222] px-1.5 py-0.2 rounded border border-[#333]">
                              τ = {effectiveThreshold.toFixed(2)}
                            </span>
                            <span>1.00</span>
                          </div>
                        </div>

                        {caseDetail.escalation_reasons && caseDetail.escalation_reasons.length > 0 && (
                          <div className="p-2 rounded bg-[#131313] border border-[#222] text-[11px] font-mono text-amber-300/90 leading-relaxed">
                            <span className="text-neutral-500">Escalation trigger: </span>
                            {caseDetail.escalation_reasons[0]}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reference Neighbors (Similar Cases) */}
                    {caseDetail.frozen_evidence?.neighbors &&
                      caseDetail.frozen_evidence.neighbors.length > 0 && (
                        <div className="pt-2 border-t border-[#232323] space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-400">Reference Examples</span>
                            <span className="text-neutral-500 font-mono text-[10px]">
                              {caseDetail.frozen_evidence.neighbors.length} retrieved
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            {caseDetail.frozen_evidence.neighbors.map((n, idx) => (
                              <div
                                key={n.reference_example_id || idx}
                                className="flex items-center justify-between bg-[#131313] p-1.5 rounded border border-[#222]"
                              >
                                <div className="space-y-0.5 pr-2">
                                  <div className="font-mono text-neutral-300 text-[11px]">
                                    {n.reference_example_id}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    {(n.similarity * 100).toFixed(0)}% sim
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border font-mono bg-[#222] text-neutral-200 border-[#333]">
                                    {n.label}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Action Bar */}
              <footer className="p-3.5 border-t border-slate-200 dark:border-[#232323] bg-white dark:bg-[#161616] flex items-center justify-between flex-none z-20">
                {caseDetail.status === 'RESOLVED' ? (
                  <div className="flex-1 flex items-center justify-between bg-emerald-50/60 dark:bg-[#181818] border border-emerald-300 dark:border-emerald-800/40 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
                          <span>Case Resolved · Immutable Record</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 text-xs font-mono uppercase font-bold">
                            Final
                          </span>
                        </div>
                        <div className="text-xs text-emerald-700/80 dark:text-neutral-400 mt-1">
                          This case has already been adjudicated and committed to Temporal. No further modification permitted.
                        </div>
                      </div>
                    </div>
                    {caseDetail.resolution?.resolution_reason && (
                      <div className="text-right max-w-sm truncate text-xs text-emerald-800 dark:text-neutral-400 italic">
                        &quot;{caseDetail.resolution.resolution_reason}&quot;
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      {agentProposedDecision && (
                        <button
                          disabled={resolveMutation.isPending}
                          onClick={() => triggerAdjudicate('approve')}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-[#202020] disabled:text-slate-400 dark:disabled:text-neutral-500 text-white font-medium px-4 py-2 rounded-md text-sm flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <span>✓ Accept ({agentProposedDecision})</span>
                          <span className="bg-blue-700 text-blue-200 px-1.5 py-0.5 rounded text-xs font-mono">
                            A
                          </span>
                        </button>
                      )}

                      <button
                        disabled={resolveMutation.isPending}
                        onClick={() => triggerAdjudicate('override')}
                        className={clsx(
                          'disabled:bg-slate-200 dark:disabled:bg-[#202020] disabled:text-slate-400 dark:disabled:text-neutral-500 font-medium px-4 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors cursor-pointer',
                          agentProposedDecision
                            ? 'bg-slate-100 dark:bg-[#1f1f1f] hover:bg-slate-200 dark:hover:bg-[#252525] border border-slate-300 dark:border-[#333333] hover:border-slate-400 dark:hover:border-neutral-500 text-slate-800 dark:text-neutral-300'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                        )}
                      >
                        <span>{agentProposedDecision ? '✎ Override' : '✎ Override (Decide)'}</span>
                        <span
                          className={clsx(
                            'px-1.5 py-0.5 rounded text-xs font-mono',
                            agentProposedDecision
                              ? 'bg-slate-200 dark:bg-[#2a2a2a] text-slate-600 dark:text-neutral-400'
                              : 'bg-amber-700 text-amber-100'
                          )}
                        >
                          O
                        </span>
                      </button>
                    </div>

                    {/* Hotkey Guide */}
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-neutral-400">
                      <span className="bg-slate-100 dark:bg-[#222222] border border-slate-200 dark:border-[#333] px-1.5 py-0.5 rounded font-mono text-xs text-slate-700 dark:text-neutral-300">
                        J
                      </span>
                      <span className="bg-slate-100 dark:bg-[#222222] border border-slate-200 dark:border-[#333] px-1.5 py-0.5 rounded font-mono text-xs text-slate-700 dark:text-neutral-300">
                        K
                      </span>
                      <span className="text-xs text-slate-500 dark:text-neutral-400">next / prev case</span>
                    </div>
                  </>
                )}
              </footer>
            </>
          )}
        </section>
      ) : null}

      {/* ========================================================= */}
      {/* ADJUDICATION MODAL (Accept Agent Decision or Override) */}
      {/* ========================================================= */}
      {isResolveModalOpen && caseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#181818] border border-[#2e2e2e] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#282828] flex items-center justify-between bg-[#151515]">
              <div className="flex items-center space-x-2">
                {resolveDecision === 'approve' && <Check className="w-4 h-4 text-emerald-400" />}
                {resolveDecision === 'override' && <Edit3 className="w-4 h-4 text-amber-400" />}
                <h3 className="text-sm font-semibold text-white">
                  {resolveDecision === 'approve'
                    ? `Accept Agent Decision (${agentProposedDecision})`
                    : agentProposedDecision
                      ? 'Override Agent Decision'
                      : 'Provide Authoritative Decision (Override)'}
                </h3>
              </div>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitResolution} className="p-5 space-y-4">
              {resolutionError && (
                <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-xs text-red-200">
                  {resolutionError}
                </div>
              )}

              <div className="bg-[#121212] p-3 rounded border border-[#242424] text-xs font-mono space-y-1">
                <div className="text-neutral-400 text-[10px]">CASE UNDER REVIEW:</div>
                <div className="text-white font-bold">{caseDetail.case_id || caseDetail.id}</div>
                <div className="text-neutral-300">
                  Agent Proposal:{' '}
                  {agentProposedDecision ? (
                    <span className="text-emerald-400 font-semibold">{agentProposedDecision}</span>
                  ) : (
                    <span className="text-neutral-400 italic font-sans">
                      No decision proposed by agent
                    </span>
                  )}
                </div>
              </div>

              {/* Override requires selecting or entering an authoritative final decision */}
              {resolveDecision === 'override' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-300">
                    Authoritative Final Decision <span className="text-red-400">*</span>
                  </label>

                  {/* Quick-select contrasting decisions */}
                  <div className="flex items-center gap-2">
                    {agentProposedDecision !== 'APPROVE' && (
                      <button
                        type="button"
                        onClick={() => setResolveFinalDecision('APPROVE')}
                        className={clsx(
                          'flex-1 px-3 py-2 rounded text-xs font-mono font-semibold border transition-colors cursor-pointer',
                          resolveFinalDecision.trim().toUpperCase() === 'APPROVE'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-[#121212] border-[#2e2e2e] text-neutral-300 hover:border-neutral-500'
                        )}
                      >
                        APPROVE
                      </button>
                    )}
                    {agentProposedDecision !== 'REJECT' && (
                      <button
                        type="button"
                        onClick={() => setResolveFinalDecision('REJECT')}
                        className={clsx(
                          'flex-1 px-3 py-2 rounded text-xs font-mono font-semibold border transition-colors cursor-pointer',
                          resolveFinalDecision.trim().toUpperCase() === 'REJECT'
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                            : 'bg-[#121212] border-[#2e2e2e] text-neutral-300 hover:border-neutral-500'
                        )}
                      >
                        REJECT
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={resolveFinalDecision}
                    onChange={(e) => setResolveFinalDecision(e.target.value)}
                    placeholder={
                      agentProposedDecision === 'APPROVE'
                        ? 'e.g. REJECT'
                        : agentProposedDecision === 'REJECT'
                          ? 'e.g. APPROVE'
                          : 'Select APPROVE or REJECT above, or enter custom decision'
                    }
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
                    autoFocus
                  />
                  <p className="text-[10px] text-neutral-400">
                    {agentProposedDecision
                      ? `Select a decision other than ${agentProposedDecision}. This authoritative value replaces the agent's proposal in Temporal and the audit trail.`
                      : 'The agent escalated without a decision. Choose the authoritative final decision to commit to Temporal and the audit trail.'}
                  </p>
                </div>
              )}

              {/* Mandatory Resolution Reason */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Resolution Reason (Audit Mandatory) <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={resolveReason}
                  onChange={(e) => setResolveReason(e.target.value)}
                  placeholder="State the verifiable reason and evidence used to adjudicate this case..."
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Required by regulatory compliance. Stored immutably with reviewer identity.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#262626]">
                <button
                  type="button"
                  disabled={resolveMutation.isPending}
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-[#202020] hover:bg-[#282828] text-neutral-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveMutation.isPending}
                  className={clsx(
                    'px-4 py-1.5 rounded text-white text-xs font-medium transition-colors shadow flex items-center space-x-1.5 cursor-pointer',
                    resolveDecision === 'approve' && 'bg-blue-600 hover:bg-blue-500',
                    resolveDecision === 'override' && 'bg-amber-600 hover:bg-amber-500',
                    resolveMutation.isPending && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {resolveMutation.isPending ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>
                      {resolveDecision === 'approve'
                        ? `Confirm Accept (${agentProposedDecision})`
                        : resolveFinalDecision.trim()
                          ? `Confirm Override (${resolveFinalDecision.trim().toUpperCase()})`
                          : 'Confirm Override'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
