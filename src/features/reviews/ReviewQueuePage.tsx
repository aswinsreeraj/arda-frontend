import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ReviewCase } from './types';
import { mockCases } from './mockData';
import {
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';

export const ReviewQueuePage: React.FC = () => {
  const { caseId } = useParams<{ caseId?: string }>();
  const navigate = useNavigate();

  const [cases, setCases] = useState<ReviewCase[]>(mockCases);
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    caseId || mockCases[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'tools' | 'input'>('tools');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Active case ID priority: route param -> state selection -> default first
  const activeCaseId = caseId || internalSelectedId || cases[0]?.id || '';
  const selectedCase = cases.find((c) => c.id === activeCaseId) || cases[0];
  const currentIndex = cases.findIndex((c) => c.id === activeCaseId);

  // Filter cases
  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.proposed_decision.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCase = useCallback(
    (id: string) => {
      setInternalSelectedId(id);
      navigate(`/reviews/${id}`);
    },
    [navigate]
  );

  const handleAdjudicate = useCallback(
    (decision: 'approved' | 'rejected' | 'overridden') => {
      if (!selectedCase) return;
      setActionNotice(`Case ${selectedCase.id} ${decision}. Temporal workflow signaled.`);
      setCases((prev) =>
        prev.map((c) => (c.id === selectedCase.id ? { ...c, status: decision } : c))
      );
      setTimeout(() => setActionNotice(null), 3500);
    },
    [selectedCase]
  );

  // Keyboard navigation & decision hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < cases.length - 1) {
          const next = cases[currentIndex + 1];
          handleSelectCase(next.id);
        }
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prev = cases[currentIndex - 1];
          handleSelectCase(prev.id);
        }
      } else if (e.key === 'a' || e.key === 'A') {
        handleAdjudicate('approved');
      } else if (e.key === 'r' || e.key === 'R') {
        handleAdjudicate('rejected');
      } else if (e.key === 'o' || e.key === 'O') {
        handleAdjudicate('overridden');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cases, handleSelectCase, handleAdjudicate]);

  return (
    <main className="flex-1 flex overflow-hidden select-none">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="absolute top-3 right-6 z-50 bg-[#16233d] border border-blue-500/60 text-blue-200 px-3.5 py-2 rounded-lg text-xs font-mono shadow-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* LEFT: Escalation Queue List (50% Split Pane) */}
      {/* ========================================================= */}
      <section className="w-1/2 flex flex-col border-r border-[#232323] bg-[#141414] overflow-hidden">
        {/* Queue Header & Filter Toolbar */}
        <div className="p-3.5 border-b border-[#232323] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base font-semibold text-white tracking-tight">
                Escalation queue
              </h1>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>live</span>
              </div>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              {filteredCases.length} cases
            </span>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2 text-xs">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case ID, agent, decision"
                type="text"
                className="w-full bg-[#1b1b1b] border border-[#2c2c2c] rounded pl-8 pr-7 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              />
              <span className="absolute right-2.5 top-1.5 text-[10px] text-neutral-500 bg-[#252525] px-1 rounded border border-[#333]">
                /
              </span>
            </div>

            {/* Dropdowns */}
            <button className="bg-[#1b1b1b] border border-[#2c2c2c] px-2.5 py-1 rounded text-neutral-300 flex items-center space-x-1.5 hover:bg-[#222]">
              <span className="text-neutral-400">Agent</span>
              <span>All types</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>
            <button className="bg-[#1b1b1b] border border-[#2c2c2c] px-2.5 py-1 rounded text-neutral-300 flex items-center space-x-1.5 hover:bg-[#222]">
              <span className="text-neutral-400">Reason</span>
              <span>All reasons</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>
            <button className="bg-[#1b1b1b] border border-[#2c2c2c] px-2.5 py-1 rounded text-neutral-300 flex items-center space-x-1.5 hover:bg-[#222]">
              <span className="text-neutral-400">Queued</span>
              <span>Last 7d</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Queue Table Container */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#181818] border-b border-[#232323] text-neutral-400 sticky top-0 z-10 select-none">
              <tr className="text-[11px]">
                <th className="py-2 px-3 font-normal w-12">Priority ↓</th>
                <th className="py-2 px-3 font-normal w-28">Case ↑</th>
                <th className="py-2 px-3 font-normal w-40">Agent ↑</th>
                <th className="py-2 px-3 font-normal">Proposed decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020] font-sans">
              {filteredCases.map((c) => {
                const isSelected = c.id === selectedCase?.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => handleSelectCase(c.id)}
                    className={clsx(
                      'cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-[#1e1e1e] border-l-2 border-l-blue-500'
                        : 'hover:bg-[#1a1a1a]'
                    )}
                  >
                    <td className="py-3 px-3 align-top">
                      <span
                        className={clsx(
                          'text-[10px] font-bold font-mono',
                          c.priority === 'P1' && 'text-red-400',
                          c.priority === 'P2' && 'text-amber-500',
                          c.priority === 'P3' && 'text-neutral-400'
                        )}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 align-top font-mono text-neutral-300">
                      <div className="flex items-center space-x-1.5">
                        <span className={isSelected ? 'text-white font-medium' : ''}>
                          {c.id}
                        </span>
                        {c.is_new && (
                          <span className="bg-indigo-950/80 text-indigo-400 border border-indigo-700/60 px-1 py-0.2 rounded text-[9px] font-sans uppercase tracking-wider font-semibold">
                            new
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <div className="font-medium text-white">{c.agent_name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {c.agent_id}@{c.agent_version}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <div className="font-medium text-neutral-200">
                        {c.proposed_decision}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {c.decision_details}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RIGHT: Escalation Case Inspector (50% Split Pane) */}
      {/* ========================================================= */}
      {selectedCase ? (
        <section className="w-1/2 flex flex-col bg-[#141414] overflow-hidden">
          {/* Top Inspector Header */}
          <div className="p-4 border-b border-[#232323] space-y-2 flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={clsx(
                    'text-[11px] font-bold font-mono',
                    selectedCase.priority === 'P1' && 'text-red-400',
                    selectedCase.priority === 'P2' && 'text-amber-500',
                    selectedCase.priority === 'P3' && 'text-neutral-400'
                  )}
                >
                  {selectedCase.priority}
                </span>
                <span className="font-mono text-sm font-semibold text-white">
                  {selectedCase.id}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  {selectedCase.run_id}
                </span>
              </div>

              {/* Navigation Shortcuts */}
              <div className="flex items-center space-x-3 text-xs text-neutral-400">
                <span>
                  {currentIndex + 1} of {cases.length}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => {
                      if (currentIndex > 0) handleSelectCase(cases[currentIndex - 1].id);
                    }}
                    className="p-1 hover:bg-[#222] rounded text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={currentIndex === cases.length - 1}
                    onClick={() => {
                      if (currentIndex < cases.length - 1)
                        handleSelectCase(cases[currentIndex + 1].id);
                    }}
                    className="p-1 hover:bg-[#222] rounded text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-1 text-[11px]">
                  <span className="font-mono text-[10px] bg-[#222] px-1 py-0.5 rounded border border-[#333]">
                    Esc
                  </span>
                  <button
                    onClick={() => navigate('/reviews')}
                    className="hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline space-x-2">
                <h2 className="text-sm font-semibold text-white">
                  {selectedCase.agent_name}
                </h2>
                <span className="font-mono text-xs text-neutral-400">
                  {selectedCase.agent_id}@{selectedCase.agent_version}
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-xs text-neutral-400">
                  queued {selectedCase.queued_time} of {selectedCase.sla_target}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <a
                  href="#temporal"
                  onClick={(e) => e.preventDefault()}
                  className="text-neutral-400 hover:text-neutral-200 flex items-center space-x-1 transition-colors"
                >
                  <span>View execution trace</span>
                  <ExternalLink className="w-3 h-3 text-[10px]" />
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-[#222] rounded border border-[#333] text-neutral-400">
                    Temporal
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Inspector Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Guardrail Breach Callout Banner */}
            {selectedCase.guardrail_breach_detail && (
              <div className="p-3.5 rounded bg-[#1e1315] border border-red-900/60 flex items-start space-x-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-red-300">
                    {selectedCase.guardrail_breach_detail}
                  </div>
                  <div className="text-neutral-400">
                    The tool call was blocked by policy before execution. Nothing has been
                    changed.
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Section */}
            <div className="rounded border border-[#262626] bg-[#171717] overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#232323] bg-[#1a1a1a]">
                <span className="text-xs font-semibold text-neutral-200">Evidence</span>
                <div className="flex items-center space-x-3 text-xs">
                  <button
                    onClick={() => setActiveEvidenceTab('tools')}
                    className={clsx(
                      'pb-1 transition-colors',
                      activeEvidenceTab === 'tools'
                        ? 'text-neutral-200 border-b-2 border-blue-500 font-medium'
                        : 'text-neutral-400 hover:text-neutral-300'
                    )}
                  >
                    Tool results ({selectedCase.evidence.tool_calls.length})
                  </button>
                  <button
                    onClick={() => setActiveEvidenceTab('input')}
                    className={clsx(
                      'pb-1 transition-colors',
                      activeEvidenceTab === 'input'
                        ? 'text-neutral-200 border-b-2 border-blue-500 font-medium'
                        : 'text-neutral-400 hover:text-neutral-300'
                    )}
                  >
                    Input data (4)
                  </button>
                </div>
              </div>

              {/* Evidence Content */}
              {activeEvidenceTab === 'tools' ? (
                <div className="divide-y divide-[#222222] text-xs font-mono">
                  {selectedCase.evidence.tool_calls.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-3 flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={clsx(
                              'font-bold',
                              tool.verdict === 'allow'
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            )}
                          >
                            {tool.verdict === 'allow' ? '✓' : '✕'}
                          </span>
                          <span className="text-white font-semibold">
                            {tool.name}
                          </span>
                          <span
                            className={clsx(
                              'text-[10px] px-1 py-0.2 rounded border font-mono',
                              tool.verdict === 'allow'
                                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50'
                                : 'text-red-400 bg-red-950/60 border-red-900/50'
                            )}
                          >
                            {tool.verdict}
                          </span>
                        </div>
                        <div className="text-neutral-400 font-sans text-xs">
                          {tool.detail}
                        </div>
                      </div>
                      <span className="text-neutral-400 text-[11px]">
                        {tool.latency}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 text-xs font-mono bg-[#141414] text-neutral-300">
                  <pre className="overflow-x-auto">
                    {JSON.stringify(selectedCase.evidence.input_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Split Details: Agent Reasoning & Reliability Signal */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Box 1: Agent Reasoning */}
              <div className="p-3.5 rounded border border-[#262626] bg-[#171717] space-y-3">
                <h3 className="text-xs font-semibold text-neutral-200">
                  Agent Reasoning
                </h3>
                <div className="space-y-1">
                  <span className="text-[11px] text-neutral-400">
                    Proposed decision
                  </span>
                  <div className="font-medium text-white text-xs">
                    {selectedCase.proposed_decision}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {selectedCase.decision_details}
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-neutral-400">
                    Stated rationale
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {selectedCase.agent_rationale}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#232323] space-y-1 text-xs text-neutral-400">
                  {selectedCase.reasoning_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="font-mono text-neutral-400">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Reliability Signal */}
              <div className="p-3.5 rounded border border-[#262626] bg-[#171717] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-neutral-200">
                    Reliability Signal
                  </h3>
                </div>

                {/* Score & Gauge Bar */}
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {selectedCase.calibrated_confidence.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-400">
                      calibrated confidence
                    </span>
                  </div>

                  {/* Progress Bar with Tau Marker */}
                  <div className="relative pt-1">
                    <div className="h-2 w-full bg-[#252525] rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${selectedCase.calibrated_confidence * 100}%`,
                        }}
                      />
                    </div>
                    {/* Threshold marker at tau */}
                    <div
                      className="absolute top-0 bottom-0 flex flex-col items-center"
                      style={{ left: `${selectedCase.threshold_tau * 100}%` }}
                    >
                      <div className="w-0.5 h-3.5 bg-neutral-300" />
                      <span className="text-[9px] font-mono text-neutral-400 mt-0.5 font-semibold">
                        τ {selectedCase.threshold_tau.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-2">
                      <span>0.00</span>
                      <span>1.00</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400">
                    raw {selectedCase.raw_confidence.toFixed(2)} → calibrated{' '}
                    {selectedCase.calibrated_confidence.toFixed(2)}
                  </div>
                </div>

                {/* Similar Past Cases */}
                {selectedCase.similar_cases.length > 0 && (
                  <div className="pt-2 border-t border-[#232323] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Most similar past cases</span>
                      <span className="text-neutral-400 font-mono text-[10px]">
                        agent upheld 1/3
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {selectedCase.similar_cases.map((sc) => (
                        <div
                          key={sc.id}
                          className="flex items-center justify-between"
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-baseline space-x-1.5">
                              <span className="font-mono font-semibold text-neutral-200">
                                {sc.similarity.toFixed(2)}
                              </span>
                              <span className="text-neutral-300 truncate max-w-[210px] text-[11px]">
                                {sc.description}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-neutral-400">
                              {sc.id} · p {sc.confidence.toFixed(2)}
                            </div>
                          </div>
                          <span
                            className={clsx(
                              'px-1.5 py-0.5 rounded text-[10px] font-medium border font-mono',
                              sc.verdict === 'approved' &&
                                'bg-emerald-950/70 border-emerald-800/60 text-emerald-400',
                              sc.verdict === 'rejected' &&
                                'bg-red-950/70 border-red-800/60 text-red-400',
                              sc.verdict === 'overridden' &&
                                'bg-amber-950/70 border-amber-800/60 text-amber-400'
                            )}
                          >
                            {sc.verdict}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <footer className="p-3.5 border-t border-[#232323] bg-[#161616] flex items-center justify-between flex-none z-20">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAdjudicate('approved')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <span>✓ Approve</span>
                <span className="bg-blue-700 text-blue-200 px-1 py-0.2 rounded text-[10px] font-mono">
                  A
                </span>
              </button>

              <button
                onClick={() => handleAdjudicate('rejected')}
                className="bg-[#1f1f1f] hover:bg-[#252525] border border-red-900/50 hover:border-red-700/70 text-red-400 font-medium px-3.5 py-1.5 rounded text-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>✕ Reject</span>
                <span className="bg-[#2a2a2a] text-neutral-400 px-1 py-0.2 rounded text-[10px] font-mono">
                  R
                </span>
              </button>

              <button
                onClick={() => handleAdjudicate('overridden')}
                className="bg-[#1f1f1f] hover:bg-[#252525] border border-[#333333] hover:border-neutral-500 text-neutral-300 font-medium px-3.5 py-1.5 rounded text-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>✎ Override</span>
                <span className="bg-[#2a2a2a] text-neutral-400 px-1 py-0.2 rounded text-[10px] font-mono">
                  O
                </span>
              </button>
            </div>

            {/* Hotkey Guide */}
            <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
              <span className="bg-[#222222] border border-[#333] px-1 py-0.2 rounded font-mono text-[10px] text-neutral-300">
                J
              </span>
              <span className="bg-[#222222] border border-[#333] px-1 py-0.2 rounded font-mono text-[10px] text-neutral-300">
                K
              </span>
              <span className="text-[11px] text-neutral-400">next / prev case</span>
            </div>
          </footer>
        </section>
      ) : (
        <div className="w-1/2 flex items-center justify-center text-xs text-neutral-500 font-mono">
          Select a case to inspect
        </div>
      )}
    </main>
  );
};
