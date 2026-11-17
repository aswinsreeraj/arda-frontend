import React, { useState, useEffect } from 'react';
import type { AuditEventItem } from '../types';
import {
  X,
  Bot,
  ShieldCheck,
  Clock,
  Layers,
  Check,
  Copy,
  FileText,
  Wrench,
} from 'lucide-react';
import clsx from 'clsx';

interface AutonomousCaseModalProps {
  item: AuditEventItem | null;
  onClose: () => void;
}

export const AutonomousCaseModal: React.FC<AutonomousCaseModalProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'tools'>('input');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

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

  const threshold = item.reliability_threshold ?? 0.80;
  const hasConfidence = typeof item.confidence === 'number';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="autonomous-case-title"
    >
      <div className="bg-[#141414] border border-[#282828] rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-neutral-200 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#242424] bg-[#161616] flex-none">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="autonomous-case-title" className="text-sm font-semibold text-white">
                  Autonomous Execution Case
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                  {item.outcome}
                </span>
                {item.execution_mode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {item.execution_mode}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-400 mt-0.5">
                <span>Seq #{item.seq}</span>
                <span>·</span>
                <span className="truncate max-w-[320px]">{item.execution_id}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(item.execution_id, 'exec')}
                  className="text-neutral-500 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  title="Copy execution ID"
                >
                  {copiedText === 'exec' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#242424] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#181818] border border-[#242424]">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>Agent</span>
              </div>
              <div className="text-white font-semibold mt-1">{item.agent_name}</div>
              <div className="text-[10px] font-mono text-neutral-500 truncate mt-0.5">{item.agent_id}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#181818] border border-[#242424]">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Recorded (UTC)</span>
              </div>
              <div className="text-neutral-200 font-mono mt-1">{formatUtcTime(item.timestamp)}</div>
              {item.duration_ms !== undefined && (
                <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                  Latency: {item.duration_ms}ms
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-[#181818] border border-[#242424]">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Governance Outcome</span>
              </div>
              <div className="text-emerald-400 font-semibold mt-1">
                Autonomously Resolved
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                Hash: {item.hash.slice(0, 16)}…
              </div>
            </div>
          </div>

          {/* Decision & Reliability Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Case Description & Reasoning */}
            <div className="p-4 rounded-lg bg-[#171717] border border-[#262626] space-y-3">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous Decision &amp; Case Description</span>
              </h3>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
                  Decision Summary
                </span>
                <div className="text-xs font-medium text-white bg-[#121212] px-2.5 py-2 rounded border border-[#232323]">
                  {item.decision}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
                  Agent Rationale
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed bg-[#121212] p-2.5 rounded border border-[#232323] whitespace-pre-wrap break-words">
                  {item.agent_reasoning || 'No explicit rationale provided by agent runtime.'}
                </p>
              </div>
            </div>

            {/* Reliability Gate Summary */}
            <div className="p-4 rounded-lg bg-[#171717] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Reliability Gate</span>
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">
                  τ = {threshold.toFixed(2)}
                </span>
              </div>

              {item.reliability_skipped ? (
                <div className="p-3 rounded bg-[#121212] border border-[#262626] space-y-1">
                  <div className="text-xs font-semibold text-amber-300">
                    Reliability check skipped
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Precedent similarity check was bypassed via agent configuration or per-run override.
                  </p>
                </div>
              ) : hasConfidence ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-emerald-400">
                        {item.confidence!.toFixed(2)}
                      </span>
                      <span className="text-xs text-neutral-400">calibrated confidence (p)</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-medium">
                      p &ge; τ (Passed)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="relative h-2.5 w-full bg-[#202020] rounded-full overflow-hidden border border-[#2c2c2c]">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(100, Math.max(3, item.confidence! * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>0.00</span>
                      <span className="text-emerald-300">
                        Margin: +{(item.confidence! - threshold).toFixed(2)}
                      </span>
                      <span>1.00</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded bg-[#121212] border border-[#262626] text-xs text-neutral-400">
                  No reliability score recorded for this execution.
                </div>
              )}
            </div>
          </div>

          {/* Evidence Tabs */}
          <div className="rounded-lg border border-[#262626] bg-[#171717] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#232323] bg-[#1a1a1a]">
              <span className="text-xs font-semibold text-neutral-200">
                Execution Evidence
              </span>
              <div className="flex items-center space-x-4 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('input')}
                  className={clsx(
                    'pb-1 transition cursor-pointer',
                    activeTab === 'input'
                      ? 'text-white border-b-2 border-emerald-500 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  )}
                >
                  Original Input
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
                  className={clsx(
                    'pb-1 transition cursor-pointer',
                    activeTab === 'output'
                      ? 'text-white border-b-2 border-emerald-500 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  )}
                >
                  Agent Output
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className={clsx(
                    'pb-1 transition cursor-pointer',
                    activeTab === 'tools'
                      ? 'text-white border-b-2 border-emerald-500 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  )}
                >
                  Tools ({item.tool_calls?.length || 0})
                </button>
              </div>
            </div>

            {activeTab === 'input' && (
              <div className="p-4 bg-[#111111] font-mono text-xs text-neutral-300 overflow-x-auto">
                {item.case_input && Object.keys(item.case_input).length > 0 ? (
                  <pre className="leading-relaxed">{JSON.stringify(item.case_input, null, 2)}</pre>
                ) : (
                  <span className="text-neutral-500 font-sans">No input payload captured.</span>
                )}
              </div>
            )}

            {activeTab === 'output' && (
              <div className="p-4 bg-[#111111] font-mono text-xs text-neutral-300 overflow-x-auto">
                {item.case_output && Object.keys(item.case_output).length > 0 ? (
                  <pre className="leading-relaxed">{JSON.stringify(item.case_output, null, 2)}</pre>
                ) : (
                  <span className="text-neutral-500 font-sans">No output payload captured.</span>
                )}
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="p-4 bg-[#111111] text-xs">
                {!item.tool_calls || item.tool_calls.length === 0 ? (
                  <span className="text-neutral-500">No external tools configured or invoked.</span>
                ) : (
                  <div className="space-y-2">
                    {item.tool_calls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded bg-[#161616] border border-[#242424] font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-white font-medium">{tc.name}</span>
                          {tc.classification && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-neutral-400 border border-[#333]">
                              {tc.classification}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 uppercase">
                          {tc.status || 'allow'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#242424] bg-[#161616] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#242424] hover:bg-[#303030] text-xs font-medium text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
