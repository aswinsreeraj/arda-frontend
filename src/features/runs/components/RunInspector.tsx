import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Layers,
  Activity,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import type { RunDetail, RunStatus } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface RunInspectorProps {
  run: RunDetail;
  onBackToList: () => void;
}

export const RunInspector: React.FC<RunInspectorProps> = ({ run, onBackToList }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'topology' | 'spans' | 'payload'>('topology');
  const [payloadTab, setPayloadTab] = useState<'input' | 'output' | 'reasoning'>('input');
  const [copied, setCopied] = useState(false);

  const confidence = run.confidence ?? 0.85;
  const threshold = run.reliability_threshold ?? 0.80;
  const isEscalated = run.status === 'escalated' || confidence < threshold;
  const margin = (confidence - threshold).toFixed(2);

  const handleCopyJson = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: RunStatus) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="healthy" dot>
            success
          </Badge>
        );
      case 'escalated':
        return (
          <Badge variant="review" dot>
            escalated
          </Badge>
        );
      case 'running':
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border bg-blue-950/40 text-blue-400 border-blue-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping mr-1.5" />
            <span>running</span>
          </span>
        );
      case 'failed':
      default:
        return (
          <Badge variant="blocked" dot>
            failed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#282828]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <button
              onClick={onBackToList}
              className="hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Runs</span>
            </button>
            <span>/</span>
            <span className="text-gray-300">{run.agent_name}</span>
            <span>/</span>
            <span className="font-mono text-gray-400">{run.id.slice(0, 16)}</span>
          </div>

          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{run.agent_name}</span>
              <span className="text-xs font-mono font-normal text-gray-400 px-2 py-0.5 rounded bg-[#202020] border border-[#2c2c2c]">
                v{run.agent_version_number || 1}
              </span>
            </h2>
            {getStatusBadge(run.status)}
            <Badge variant={run.mode === 'durable' ? 'durable' : 'neutral'}>
              {run.mode}
            </Badge>
          </div>

          <div className="text-xs font-mono text-gray-400">
            Workflow: {run.workflow_id}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-gray-400 font-mono">
            <div>Duration: <strong className="text-white">{run.duration_ms}ms</strong></div>
            <div className="text-xs text-gray-400 mt-0.5">
              {new Date(run.created_at).toLocaleString()}
            </div>
          </div>

          {run.escalation?.case_id && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/reviews/${run.escalation?.case_id}`)}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open Review Case
            </Button>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center border-b border-[#282828] space-x-6 text-xs">
        <button
          onClick={() => setActiveTab('topology')}
          className={`pb-2.5 font-medium border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'topology'
              ? 'border-white text-white'
              : 'border-transparent text-[#8e8e93] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Architecture Topology</span>
        </button>

        <button
          onClick={() => setActiveTab('spans')}
          className={`pb-2.5 font-medium border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'spans'
              ? 'border-white text-white'
              : 'border-transparent text-[#8e8e93] hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Execution Traces ({run.spans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payload')}
          className={`pb-2.5 font-medium border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'payload'
              ? 'border-white text-white'
              : 'border-transparent text-[#8e8e93] hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Payload & Decisions</span>
        </button>
      </div>

      {/* Tab 1: Interactive Architecture Topology (Stitch screen 6e6785425c4b44c3b9a357c3446a6fad) */}
      {activeTab === 'topology' && (
        <div className="rounded-lg border border-[#2c2c2c] bg-[#161616] p-6 space-y-6 shadow-inner font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Node 1: Agent Config */}
            <div className="p-3.5 rounded-lg border border-[#282828] bg-[#1b1b1b] space-y-1.5 shadow-xs">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                Agent Config
              </div>
              <div className="text-white text-xs font-semibold">
                {run.agent_name}@{run.agent_version_number || 1}
              </div>
              <div className="text-[10px] text-gray-400">
                Mode: {run.execution_mode} · {run.mode}
              </div>
            </div>

            {/* Node 2: Durable Runtime */}
            <div className="p-3.5 rounded-lg border border-[#282828] bg-[#1b1b1b] space-y-1.5 shadow-xs">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                Durable Runtime
              </div>
              <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {run.mode === 'durable'
                    ? 'Temporal checkpoint · replayable'
                    : 'Realtime synchronous loop'}
                </span>
              </div>
              <div className="text-[10px] text-gray-400">
                State persisted (WAL & PostgreSql)
              </div>
            </div>

            {/* Node 3: Governed Tool Gateway */}
            <div className="p-3.5 rounded-lg border border-[#282828] bg-[#1b1b1b] space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center text-[10px] text-gray-500">
                <span className="uppercase tracking-wider font-semibold">Tool Gateway</span>
                <span className="text-blue-400">policy tg-07</span>
              </div>
              <div className="space-y-1 text-[11px]">
                {run.tool_calls.length === 0 ? (
                  <div className="text-gray-500 text-[10px] italic">No tool calls invoked</div>
                ) : (
                  run.tool_calls.map((tc, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-gray-300">
                        <span className="text-emerald-400">✓</span>
                        <span>{tc.name}</span>
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border ${
                          tc.status === 'allow'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : 'bg-red-950/40 text-red-400 border-red-800/40'
                        }`}
                      >
                        {tc.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Node 4: Confidence Gate */}
            <div
              className={`p-3.5 rounded-lg border bg-[#1b1b1b] space-y-1.5 shadow-xs ${
                isEscalated ? 'border-amber-500/40' : 'border-emerald-500/40'
              }`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <span
                  className={`uppercase tracking-wider font-semibold ${
                    isEscalated ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  Confidence Gate
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded border ${
                    isEscalated
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  }`}
                >
                  {isEscalated ? 'p < τ' : 'p ≥ τ'}
                </span>
              </div>
              <div className="text-xs font-semibold text-white">
                p {confidence.toFixed(2)} {isEscalated ? '<' : '≥'} τ {threshold.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-400">
                {isEscalated
                  ? `Margin: ${margin} (Uncertain - Escalated)`
                  : `Margin: +${margin} (Reliability threshold met)`}
              </div>
            </div>

            {/* Node 5: Feedback / Calibration */}
            <div className="p-3.5 rounded-lg border border-[#282828] bg-[#1b1b1b] space-y-1.5 shadow-xs">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                Calibration Loop
              </div>
              <div className="text-white text-xs font-medium">verdict → τ recalibrated</div>
              <div className="text-[10px] text-blue-400">
                Active learning loop on Redpanda
              </div>
            </div>

            {/* Node 6: Human Review / Escalation */}
            <div
              className={`p-3.5 rounded-lg border bg-[#1b1b1b] space-y-1.5 shadow-xs ${
                run.escalation?.case_id ? 'border-amber-500/50' : 'border-[#282828]'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">
                Human Review
              </div>
              <div className="text-white text-xs font-semibold">
                {run.escalation?.case_id
                  ? `Case #${run.escalation.case_id.slice(0, 8)}`
                  : 'Automated Verdict'}
              </div>
              <div className="text-[10px] text-gray-400">
                {run.escalation?.case_id ? 'Target SLA: 15m' : 'Autonomously resolved'}
              </div>
            </div>
          </div>

          {/* Status Legend Footer */}
          <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center space-x-5">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>healthy / allowed</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>escalated</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>guardrail blocked</span>
              </span>
            </div>
            <div>execution duration: {run.duration_ms}ms</div>
          </div>
        </div>
      )}

      {/* Tab 2: Execution Traces Waterfall */}
      {activeTab === 'spans' && (
        <div className="border border-[#282828] rounded-lg overflow-hidden bg-[#181818] text-xs">
          <div className="p-3.5 border-b border-[#262626] bg-[#161616] text-[11px] text-gray-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Execution Timeline Spans</span>
            <span>Duration ({run.duration_ms}ms total)</span>
          </div>
          <div className="divide-y divide-[#242424]">
            {run.spans.map((span) => (
              <div
                key={span.id}
                className="p-4 hover:bg-[#1d1d1d] transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      span.status === 'completed'
                        ? 'bg-emerald-400'
                        : span.status === 'running'
                        ? 'bg-blue-400 animate-pulse'
                        : 'bg-red-400'
                    }`}
                  />
                  <div>
                    <div className="font-medium text-white">{span.name}</div>
                    <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                      Type: {span.type} · {new Date(span.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {span.details && Object.keys(span.details).length > 0 && (
                    <span className="font-mono text-[10px] text-gray-400 bg-[#222] px-2 py-0.5 rounded border border-[#333]">
                      {JSON.stringify(span.details).slice(0, 40)}...
                    </span>
                  )}
                  <span className="font-mono text-gray-300 font-semibold">
                    {span.duration_ms}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Payload Inspector */}
      {activeTab === 'payload' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-[#1c1c1c] p-1 rounded-lg border border-[#2e2e2e] text-xs">
              <button
                onClick={() => setPayloadTab('input')}
                className={`px-3 py-1 rounded transition font-medium ${
                  payloadTab === 'input'
                    ? 'bg-[#2c2c2c] text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Input Payload
              </button>
              <button
                onClick={() => setPayloadTab('output')}
                className={`px-3 py-1 rounded transition font-medium ${
                  payloadTab === 'output'
                    ? 'bg-[#2c2c2c] text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Output & Decision
              </button>
              <button
                onClick={() => setPayloadTab('reasoning')}
                className={`px-3 py-1 rounded transition font-medium ${
                  payloadTab === 'reasoning'
                    ? 'bg-[#2c2c2c] text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Agent Reasoning
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleCopyJson(
                  payloadTab === 'input'
                    ? run.input
                    : payloadTab === 'output'
                    ? run.output || run.structured_output
                    : run.reason
                )
              }
              icon={
                copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )
              }
            >
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
          </div>

          <div className="rounded-lg border border-[#282828] bg-[#161616] p-4 font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed shadow-inner">
            <pre>
              {payloadTab === 'input'
                ? JSON.stringify(run.input, null, 2)
                : payloadTab === 'output'
                ? JSON.stringify(run.output || run.structured_output || {}, null, 2)
                : run.reason || 'No reasoning trace provided.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
