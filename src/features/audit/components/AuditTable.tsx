import React, { useState } from 'react';
import type { AuditEventItem } from '../types';
import {
  ChevronRight,
  ChevronDown,
  User,
  Bot,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuditTableProps {
  items: AuditEventItem[];
  onInspectIntegrity: (item: AuditEventItem) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({ items, onInspectIntegrity }) => {
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const toggleRow = (seq: number) => {
    setExpandedSeq(expandedSeq === seq ? null : seq);
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatUtcTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toISOString().replace('T', ' ').slice(0, 19);
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="mt-2 border border-[#222222] rounded bg-[#141414] overflow-x-auto custom-scroll"
      data-purpose="ledger-table-container"
    >
      <table className="w-full text-left text-xs border-collapse font-sans whitespace-nowrap">
        {/* Table Header */}
        <thead className="bg-[#171717] text-[#71717a] font-normal border-b border-[#222222] select-none text-[11px]">
          <tr>
            <th className="w-20 py-2.5 px-3 pl-4 font-normal">Seq</th>
            <th className="w-44 py-2.5 px-3 font-normal">Recorded (UTC)</th>
            <th className="w-32 py-2.5 px-3 font-normal">Execution</th>
            <th className="w-36 py-2.5 px-3 font-normal">Agent</th>
            <th className="w-28 py-2.5 px-3 font-normal">Source</th>
            <th className="py-2.5 px-3 font-normal">Decision</th>
            <th className="w-24 py-2.5 px-3 text-right font-normal">Confidence</th>
            <th className="w-28 py-2.5 px-3 pr-4 text-right font-normal">Integrity</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#1e1e1e] text-[#9ca3af] text-[12px]">
          {items.map((item) => {
            const isExpanded = expandedSeq === item.seq;
            const isHuman = item.source === 'human';
            const isDenied =
              item.outcome === 'denied' ||
              item.outcome === 'rejected' ||
              (item.denial_reason !== undefined && item.denial_reason.length > 0);
            const isEscalatedOrOverridden =
              item.outcome === 'escalated' || item.outcome === 'overridden';
            const isLowConfidence = item.confidence !== undefined && item.confidence < 0.7;

            return (
              <React.Fragment key={item.seq}>
                <tr
                  onClick={() => toggleRow(item.seq)}
                  className={`hover:bg-[#1a1a1a] transition-colors group cursor-pointer ${
                    isExpanded ? 'bg-[#181818]' : ''
                  }`}
                >
                  {/* Seq */}
                  <td className="py-2.5 px-3 pl-4 font-mono text-neutral-400">
                    <span className="inline-flex items-center space-x-1.5 hover:text-white">
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
                      )}
                      <span>{item.seq}</span>
                    </span>
                  </td>

                  {/* Recorded (UTC) */}
                  <td className="py-2.5 px-3 font-mono text-[#828894]">
                    {formatUtcTime(item.timestamp)}
                  </td>

                  {/* Execution */}
                  <td className="py-2.5 px-3 font-mono text-[#a5abb7]">
                    <Link
                      to={`/runs?search=${encodeURIComponent(item.execution_id)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-white hover:underline inline-flex items-center space-x-1 truncate max-w-[120px]"
                    >
                      <span>{item.execution_id}</span>
                    </Link>
                  </td>

                  {/* Agent */}
                  <td className="py-2.5 px-3 text-[#d1d5db] font-medium">{item.agent_name}</td>

                  {/* Source */}
                  <td className="py-2.5 px-3">
                    {isHuman ? (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] bg-[#161c24] text-[#7dd3fc] border border-[#1e2f42]">
                        <User className="w-2.5 h-2.5" />
                        <span>Human</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] bg-[#1a1a1c] text-[#8e94a0] border border-[#27272a]">
                        <Bot className="w-2.5 h-2.5" />
                        <span>Agent</span>
                      </span>
                    )}
                  </td>

                  {/* Decision */}
                  <td className="py-2.5 px-3 text-neutral-200">
                    <span className="inline-flex items-center space-x-2 truncate max-w-[420px]">
                      {isDenied ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      ) : isEscalatedOrOverridden ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                      <span className="truncate">{item.decision}</span>
                    </span>
                  </td>

                  {/* Confidence */}
                  <td
                    className={`py-2.5 px-3 text-right font-mono ${
                      isLowConfidence ? 'text-amber-500 font-medium' : 'text-neutral-300'
                    }`}
                  >
                    {item.confidence !== undefined ? item.confidence.toFixed(2) : '—'}
                  </td>

                  {/* Integrity (Short Hash) */}
                  <td className="py-2.5 px-3 pr-4 text-right font-mono text-[#7b818d]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectIntegrity(item);
                      }}
                      className="hover:text-white inline-flex items-center space-x-1 transition-colors"
                      title="Inspect Cryptographic Chain Block"
                    >
                      <Hash className="w-3 h-3 text-neutral-500" />
                      <span>{item.hash.slice(0, 8)}</span>
                    </button>
                  </td>
                </tr>

                {/* Expanded Row Detail */}
                {isExpanded && (
                  <tr className="bg-[#111111]">
                    <td colSpan={8} className="p-4 border-b border-[#222222]">
                      <div className="space-y-3 font-sans">
                        {/* Header Details */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#202020] pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-neutral-300 text-xs font-semibold">
                              Sequence #{item.seq}
                            </span>
                            <span className="text-neutral-600">·</span>
                            <span className="text-[11px] text-neutral-400">
                              Action Type:{' '}
                              <span className="text-neutral-200 capitalize">
                                {item.action_type.replace('_', ' ')}
                              </span>
                            </span>
                            {item.duration_ms !== undefined && (
                              <>
                                <span className="text-neutral-600">·</span>
                                <span className="text-[11px] text-neutral-400">
                                  Latency:{' '}
                                  <span className="font-mono text-neutral-300">
                                    {item.duration_ms}ms
                                  </span>
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/runs?search=${encodeURIComponent(item.execution_id)}`}
                              className="px-2 py-1 rounded bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 text-[11px] border border-[#2b2b2b] flex items-center space-x-1"
                            >
                              <span>View Run Trace</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            {item.case_id && (
                              <Link
                                to={`/reviews?search=${encodeURIComponent(item.case_id)}`}
                                className="px-2 py-1 rounded bg-[#16202c] hover:bg-[#1f2d3d] text-sky-300 text-[11px] border border-[#24354a] flex items-center space-x-1"
                              >
                                <span>View Review Case</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Guardrail Denial Alert if present */}
                        {item.denial_reason && (
                          <div className="p-3 rounded bg-rose-950/20 border border-rose-800/40 text-rose-300 text-[11px] flex items-start space-x-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-semibold">Guardrail Policy Intervention: </span>
                              <span>{item.denial_reason}</span>
                            </div>
                          </div>
                        )}

                        {/* Cryptographic Linkage Hashes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                          <div className="p-2.5 rounded bg-[#161616] border border-[#242424]">
                            <div className="text-neutral-500 flex items-center justify-between mb-1">
                              <span>Prior Block Hash (H_{'{i-1}'})</span>
                              <span className="text-[10px] text-neutral-600">Parent Link</span>
                            </div>
                            <div className="text-neutral-300 select-all break-all bg-[#0d0d0d] p-1.5 rounded border border-[#1f1f1f]">
                              {item.prev_hash}
                            </div>
                          </div>

                          <div className="p-2.5 rounded bg-[#161616] border border-[#242424]">
                            <div className="text-neutral-500 flex items-center justify-between mb-1">
                              <span className="text-emerald-400">Current Block SHA-256 (H_i)</span>
                              <button
                                onClick={(e) => handleCopy(item.hash, e)}
                                className="hover:text-white flex items-center space-x-1 text-[10px] text-neutral-400"
                              >
                                {copiedHash === item.hash ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>Copy</span>
                              </button>
                            </div>
                            <div className="text-emerald-400 select-all break-all bg-[#0d0d0d] p-1.5 rounded border border-[#1f1f1f]">
                              {item.hash}
                            </div>
                          </div>
                        </div>

                        {/* Sanitized Arguments / Parameters */}
                        {item.sanitized_arguments &&
                          Object.keys(item.sanitized_arguments).length > 0 && (
                            <div className="p-2.5 rounded bg-[#161616] border border-[#242424] space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-neutral-400 font-medium">
                                  Sanitized Arguments & Parameter State
                                </span>
                                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/30">
                                  PII Masked · Redacted
                                </span>
                              </div>
                              <pre className="font-mono text-[11px] text-neutral-300 bg-[#0d0d0d] p-2 rounded overflow-x-auto border border-[#1f1f1f]">
                                {JSON.stringify(item.sanitized_arguments, null, 2)}
                              </pre>
                            </div>
                          )}

                        {/* Cryptographic Link Proof Note */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>
                              Cryptographically anchored block: H_i = SHA256(Seq_i || Timestamp_i ||
                              Payload_i || H_{'{i-1}'})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onInspectIntegrity(item);
                            }}
                            className="text-neutral-400 hover:text-white flex items-center space-x-1 transition-colors"
                          >
                            <span>Verify Full Chain</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
