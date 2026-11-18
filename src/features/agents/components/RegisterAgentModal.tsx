import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../agentApi';
import { platformApi } from '@/features/platform/platformApi';
import type { AgentDetail, ExecutionMode } from '../types';
import { Button } from '@/components/ui/Button';

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agent: AgentDetail) => void;
}

export const RegisterAgentModal: React.FC<RegisterAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { data: platformDefaults } = useQuery({
    queryKey: ['platform-defaults'],
    queryFn: () => platformApi.fetchPlatformDefaults(),
    enabled: isOpen,
    staleTime: 30000,
  });

  const defaultThreshold = platformDefaults?.reliability_default_threshold ?? 0.85;

  const [name, setName] = useState('');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('durable');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [customThreshold, setCustomThreshold] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const threshold = customThreshold ?? defaultThreshold;
  const setThreshold = (val: number) => setCustomThreshold(val);

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      execution_mode: ExecutionMode;
      prompt_template: string;
      reliability_threshold: number;
    }) => agentApi.createAgent(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      resetForm();
      onSuccess(data);
      onClose();
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Failed to register agent');
    },
  });

  const resetForm = () => {
    setName('');
    setExecutionMode('durable');
    setPromptTemplate('');
    setCustomThreshold(null);
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Display name is required');
      return;
    }
    setErrorMsg(null);
    createMutation.mutate({
      name: name.trim(),
      execution_mode: executionMode,
      prompt_template: promptTemplate.trim(),
      reliability_threshold: threshold,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs transform transition-all">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Register agent</span>
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Creates a draft. Nothing runs until you publish a version.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
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

          <div className="space-y-1.5">
            <label className="font-medium text-gray-300">Display name</label>
            <input
              type="text"
              placeholder="e.g. Chargeback Investigator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-gray-300">Execution mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExecutionMode('durable')}
                className={`py-2 px-3 border rounded-md text-left transition ${
                  executionMode === 'durable' || executionMode === 'supervised' || executionMode === 'gated'
                    ? 'border-blue-500 bg-blue-950/30 text-blue-300'
                    : 'border-[#2f2f2f] bg-[#141414] text-gray-400 hover:text-white'
                }`}
              >
                <div className="font-medium text-xs">Durable (Temporal)</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Asynchronous workflow with replay & checkpoints</div>
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('realtime')}
                className={`py-2 px-3 border rounded-md text-left transition ${
                  executionMode === 'realtime' || executionMode === 'autonomous'
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                    : 'border-[#2f2f2f] bg-[#141414] text-gray-400 hover:text-white'
                }`}
              >
                <div className="font-medium text-xs">Realtime (In-Process)</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Sub-second synchronous Go runtime (no Temporal)</div>
              </button>
            </div>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
              <span>🛡️ Reliability Service Gate Enforced (p ≥ τ) on both modes · 1-in-10 sampled for calibration</span>
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-gray-300">Initial Prompt Template (optional)</label>
            <textarea
              rows={3}
              placeholder="You are an agent reviewing..."
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white font-mono placeholder-gray-600 focus:border-blue-500 focus:outline-none transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-medium text-gray-300">Reliability Threshold (τ)</label>
              <span className="font-mono text-blue-400 font-semibold">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#282828] flex items-center justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending}
            >
              Register agent
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
