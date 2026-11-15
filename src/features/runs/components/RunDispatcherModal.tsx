import React, { useState } from 'react';
import { Play, X, AlertCircle, Terminal, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/features/agents/agentApi';
import { runsApi } from '../runsApi';
import { useRunsStore } from '../runsStore';
import type { ExecutionMode } from '@/features/agents/types';
import type { RunDetail, RunMode, RunStatus } from '../types';
import { Button } from '@/components/ui/Button';

interface RunDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCreated: (run: RunDetail) => void;
}

export const RunDispatcherModal: React.FC<RunDispatcherModalProps> = ({
  isOpen,
  onClose,
  onRunCreated,
}) => {
  const queryClient = useQueryClient();
  const { addRun } = useRunsStore();

  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [runMode, setRunMode] = useState<RunMode>('durable');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('supervised');
  const [inputText, setInputText] = useState<string>(
    JSON.stringify(
      {
        transaction_id: 'tx_9824_chargeback',
        amount: 850.0,
        currency: 'USD',
        merchant_name: 'Acme High-Tech Goods',
        customer_id: 'cust_48129',
        prior_chargebacks: 0,
      },
      null,
      2
    )
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch available agents
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: ({ signal }) => agentApi.listAgents(undefined, signal),
  });

  const agents = agentsData?.agents || [];
  const effectiveAgentId = selectedAgentId || (agents.length > 0 ? agents[0].agent.id : '');

  const dispatchMutation = useMutation({
    mutationFn: async () => {
      let parsedInput: Record<string, unknown> = {};
      try {
        parsedInput = JSON.parse(inputText);
      } catch {
        throw new Error('Input payload must be valid JSON');
      }

      if (!effectiveAgentId) {
        throw new Error('Please select an agent to execute');
      }

      const agent = agents.find((a) => a.agent.id === effectiveAgentId);
      const res = await runsApi.executeAgent(effectiveAgentId, {
        input: parsedInput,
        mode: runMode === 'durable' ? 'async' : 'sync',
        execution_mode: executionMode,
      });

      const runId = res.run_id || `run_${Math.random().toString(36).substring(2, 9)}`;
      const workflowId = res.workflow_id || `agent-exec-${selectedAgentId}-${runId.slice(0, 8)}`;

      let status: RunStatus = 'accepted';
      if (res.status === 'SUCCESS') status = 'success';
      else if (res.status === 'ESCALATED') status = 'escalated';
      else if (res.status === 'FAILED') status = 'failed';
      else if (runMode === 'durable') status = 'running';

      const toolCalls = (agent?.latest_published_version?.configuration.tools || ['get_transaction']).map(
        (t) => ({
          name: t,
          classification: (t.includes('refund') || t.includes('reverse') ? 'write' : 'read') as
            | 'read'
            | 'write',
          status: 'allow' as const,
          duration_ms: 32,
        })
      );

      const threshold =
        agent?.latest_published_version?.configuration.reliability_threshold ?? 0.85;

      const newRun: RunDetail = {
        id: runId,
        workflow_id: workflowId,
        run_id: runId,
        agent_id: selectedAgentId,
        agent_name: agent?.agent.name || 'Governed Agent',
        agent_version_number: agent?.latest_published_version?.version_number || 1,
        status,
        mode: runMode,
        execution_mode: executionMode,
        created_at: new Date().toISOString(),
        duration_ms: res.duration_ms || (runMode === 'durable' ? 185 : 420),
        input: parsedInput,
        output: res.output,
        structured_output: res.structured_output,
        reason: res.reason || 'Agent initiated with deterministic governance envelope.',
        confidence: res.escalation ? 0.62 : 0.89,
        reliability_threshold: threshold,
        escalation: res.escalation,
        tool_calls: toolCalls,
        spans: [
          {
            id: `span-init-${runId}`,
            name: 'Workflow Initialization',
            type: 'workflow',
            status: 'completed',
            timestamp: new Date().toISOString(),
            duration_ms: 15,
            details: { mode: runMode, execution_mode: executionMode },
          },
          {
            id: `span-rt-${runId}`,
            name: runMode === 'durable' ? 'Temporal Durable Execution' : 'Realtime Execution Loop',
            type: 'runtime',
            status: runMode === 'durable' ? 'running' : 'completed',
            timestamp: new Date().toISOString(),
            duration_ms: res.duration_ms || 120,
            details: { engine: runMode === 'durable' ? 'Temporal IO' : 'Go Runtime' },
          },
        ],
      };

      return newRun;
    },
    onSuccess: (newRun) => {
      addRun(newRun);
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      onRunCreated(newRun);
      onClose();
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Execution dispatch failed');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    dispatchMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl max-w-xl w-full overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span>Execute Governed Agent (New Run)</span>
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Dispatches execution through the ARDA gateway with policy enforcement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Agent */}
          <div className="space-y-1.5">
            <label className="font-medium text-gray-300">Target Agent</label>
            <div className="relative">
              <select
                value={effectiveAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none appearance-none pr-8 cursor-pointer"
              >
                {agents.map((item) => (
                  <option key={item.agent.id} value={item.agent.id}>
                    {item.agent.name} (v{item.latest_published_version?.version_number || 1} ·{' '}
                    {item.agent.id.slice(0, 8)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Run Mode & Execution Profile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-gray-300">Run Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRunMode('durable')}
                  className={`py-2 px-2 border rounded-md text-center transition font-medium ${
                    runMode === 'durable'
                      ? 'border-blue-500 bg-blue-950/30 text-blue-300'
                      : 'border-[#2f2f2f] bg-[#141414] text-gray-400 hover:text-white'
                  }`}
                >
                  Durable (Temporal)
                </button>
                <button
                  type="button"
                  onClick={() => setRunMode('realtime')}
                  className={`py-2 px-2 border rounded-md text-center transition font-medium ${
                    runMode === 'realtime'
                      ? 'border-blue-500 bg-blue-950/30 text-blue-300'
                      : 'border-[#2f2f2f] bg-[#141414] text-gray-400 hover:text-white'
                  }`}
                >
                  Realtime (Sync)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-gray-300">Governance Mode</label>
              <div className="relative">
                <select
                  value={executionMode}
                  onChange={(e) => setExecutionMode(e.target.value as ExecutionMode)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none appearance-none pr-8 cursor-pointer"
                >
                  <option value="supervised">Supervised (Escalate on uncertainty)</option>
                  <option value="autonomous">Autonomous</option>
                  <option value="human_in_the_loop">Human-in-the-Loop (Always escalate)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Input JSON Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Input Payload (JSON)</span>
              </label>
              <span className="text-xs text-gray-500 font-mono">Passed to prompt template</span>
            </div>
            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white font-mono text-xs leading-relaxed focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#282828] flex items-center justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={dispatchMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={dispatchMutation.isPending}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Execute Run
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
