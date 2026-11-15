import React, { useState } from 'react';
import {
  Server,
  Plus,
  Lock,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../agentApi';
import type { ToolDefinition, ToolClassification } from '../types';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/authStore';

export const McpServersTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Modal form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState<ToolClassification>('read');
  const [handlerId, setHandlerId] = useState('');
  const [schemaText, setSchemaText] = useState('{\n  "type": "object"\n}');
  const [modalError, setModalError] = useState<string | null>(null);

  // RBAC checks
  // company_admin: tool:create, tool:read, tool:update, tool:delete
  // agent_developer: tool:create, tool:read, tool:update (delete is false)
  // reviewer: tool:read (create/update/delete are false)
  const canManageTools = user?.role === 'company_admin' || user?.role === 'agent_developer';
  const canDeleteTools = user?.role === 'company_admin';

  // Query tools
  const {
    data: tools = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<ToolDefinition[]>({
    queryKey: ['tools'],
    queryFn: ({ signal }) => agentApi.listTools(signal),
  });

  // Toggle enabled mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      agentApi.setToolEnabled(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  // Register tool mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      let parsedSchema: Record<string, unknown> = {};
      try {
        parsedSchema = JSON.parse(schemaText);
      } catch {
        throw new Error('Input schema must be valid JSON');
      }
      return agentApi.registerTool({
        name: name.trim(),
        description: description.trim(),
        classification,
        handler_id: handlerId.trim(),
        input_schema: parsedSchema,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setIsRegisterOpen(false);
      setName('');
      setDescription('');
      setHandlerId('');
      setSchemaText('{\n  "type": "object"\n}');
      setModalError(null);
    },
    onError: (err: Error) => {
      setModalError(err.message || 'Failed to register tool');
    },
  });

  // Delete tool mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => agentApi.deleteTool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Tool name is required');
      return;
    }
    if (!handlerId.trim()) {
      setModalError('Handler ID is required');
      return;
    }
    setModalError(null);
    registerMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar & Register Tool CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-gray-400">
          <Lock className="w-4 h-4 text-slate-400 dark:text-gray-400 shrink-0" />
          <span>Tool definitions and MCP endpoints for agent execution.</span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />}
            title="Refresh tools"
          >
            Refresh
          </Button>
          {canManageTools && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRegisterOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Register Tool
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span>Failed to load tools: {(error as Error).message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Tools Table Container */}
      <div className="border border-slate-200 dark:border-[#262626] rounded-lg overflow-hidden bg-white dark:bg-[#181818] shadow-xs">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#262626] text-xs uppercase tracking-wider text-slate-500 dark:text-[#828282] font-semibold bg-slate-50 dark:bg-[#161616]">
              <th className="py-3 px-4">Tool / Identifier</th>
              <th className="py-3 px-4">Classification</th>
              <th className="py-3 px-4">Handler</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Registered</th>
              {canDeleteTools && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
            {isLoading && tools.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#282828] rounded w-32 mb-1" />
                    <div className="h-3 bg-[#202020] rounded w-44" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-14" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-20" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-16" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#202020] rounded w-24" />
                  </td>
                  {canDeleteTools && <td className="py-4 px-4" />}
                </tr>
              ))
            ) : tools.length === 0 ? (
              <tr>
                <td colSpan={canDeleteTools ? 6 : 5} className="py-12 text-center">
                  <Server className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-300 font-medium">No tools registered</p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                    Register tools or MCP servers to empower your agents with external capabilities.
                  </p>
                  {canManageTools && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsRegisterOpen(true)}
                        icon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Register first tool
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-[#1d1d1d] transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-medium text-white text-xs">{tool.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {tool.description || tool.id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
                        tool.classification === 'write'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {tool.classification}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                    {tool.handler_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      disabled={!canManageTools || toggleMutation.isPending}
                      onClick={() =>
                        toggleMutation.mutate({ id: tool.id, enabled: !tool.enabled })
                      }
                      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border transition ${
                        tool.enabled
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50 hover:border-emerald-700'
                          : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      {tool.enabled ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>enabled</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-zinc-400" />
                          <span>disabled</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                    {new Date(tool.created_at).toLocaleDateString()}
                  </td>
                  {canDeleteTools && (
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete tool "${tool.name}"?`)) {
                            deleteMutation.mutate(tool.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-400 p-1"
                        title="Delete tool"
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Tool Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Register Tool Definition</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-medium text-gray-300">Tool Name / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. ledger.read"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-300">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Fetches recent ledger transactions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-gray-300">Classification</label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as ToolClassification)}
                    className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="read">read</option>
                    <option value="write">write</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-gray-300">Handler ID</label>
                  <input
                    type="text"
                    placeholder="e.g. mock_gateway"
                    value={handlerId}
                    onChange={(e) => setHandlerId(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-300">Input Schema (JSON Schema)</label>
                <textarea
                  rows={4}
                  value={schemaText}
                  onChange={(e) => setSchemaText(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white font-mono text-[11px] focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#282828] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={registerMutation.isPending}
                >
                  Register Tool
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
