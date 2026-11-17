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
  ArrowLeft,
  Key,
  ShieldCheck,
  Code,
  Copy,
  Check,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../agentApi';
import type { ToolDefinition, ToolClassification, Credential } from '../types';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/authStore';
import type { McpServerDefinition, McpTransport } from '../mcpServerModel';
import {
  getStoredMcpServers,
  deleteMcpServerFromStorage,
  formatMcpHandlerId,
  formatMcpServerMetaHandlerId,
  formatMcpServerMetaToolName,
  isMcpServerMetaTool,
  parseMcpHandlerId,
  serializeMcpServerMeta,
} from '../mcpServerModel';

export const McpServersTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id || 'default-tenant';

  // Navigation state: selected server (null means server list view)
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  // Modals state
  const [isRegisterServerOpen, setIsRegisterServerOpen] = useState(false);
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [inspectingSchemaTool, setInspectingSchemaTool] = useState<ToolDefinition | null>(null);

  // New MCP Server Form state
  const [serverFormId, setServerFormId] = useState('');
  const [serverFormName, setServerFormName] = useState('');
  const [serverFormDesc, setServerFormDesc] = useState('');
  const [serverFormTransport, setServerFormTransport] = useState<McpTransport>('streamable_http');
  const [serverFormEndpoint, setServerFormEndpoint] = useState('');
  const [serverFormToken, setServerFormToken] = useState('');
  const [serverModalError, setServerModalError] = useState<string | null>(null);

  // New Tool Form state (inside server details)
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [toolClassification, setToolClassification] = useState<ToolClassification>('read');
  const [toolSchemaText, setToolSchemaText] = useState(
    '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}'
  );
  const [toolModalError, setToolModalError] = useState<string | null>(null);

  // Copied indicator state
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Server register / delete async states
  const [isRegisteringServer, setIsRegisteringServer] = useState(false);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);
  const [serverActionError, setServerActionError] = useState<string | null>(null);

  // RBAC permissions
  // Only company_admin can register or delete MCP servers.
  const canManageServers = user?.role === 'company_admin';
  const canManageTools = user?.role === 'company_admin' || user?.role === 'agent_developer';
  const canDeleteTools = user?.role === 'company_admin';

  // Query tools from backend
  const {
    data: tools = [],
    isLoading: isLoadingTools,
    error: toolsError,
    refetch: refetchTools,
    isRefetching: isRefetchingTools,
  } = useQuery<ToolDefinition[]>({
    queryKey: ['tools'],
    queryFn: ({ signal }) => agentApi.listTools(signal),
  });

  // Query credentials from backend
  const { data: credentials = [], refetch: refetchCredentials } = useQuery<Credential[]>({
    queryKey: ['credentials'],
    queryFn: ({ signal }) => agentApi.listCredentials(signal),
  });

  // Derive all MCP servers
  const mcpServers = getStoredMcpServers(tenantId, tools, credentials);
  const selectedServer = mcpServers.find((s) => s.id === selectedServerId) || null;

  // Filter tools belonging to the selected MCP server (excluding hidden server metadata records)
  const serverTools = selectedServer
    ? tools.filter((t) => {
        if (isMcpServerMetaTool(t)) return false;
        const parsed = parseMcpHandlerId(t.handler_id);
        if (parsed) return parsed.serverId.toLowerCase() === selectedServer.id.toLowerCase();
        return t.handler_id.toLowerCase().includes(selectedServer.id.toLowerCase());
      })
    : [];

  // Mutations
  const toggleToolMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      agentApi.setToolEnabled(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  const registerToolMutation = useMutation({
    mutationFn: async () => {
      if (!selectedServer) throw new Error('No MCP server selected');
      let parsedSchema: Record<string, unknown> = {};
      try {
        parsedSchema = JSON.parse(toolSchemaText);
      } catch {
        throw new Error('Input schema must be valid JSON');
      }

      const generatedHandlerId = formatMcpHandlerId(selectedServer.id, toolName.trim());

      return agentApi.registerTool({
        name: toolName.trim(),
        description: toolDescription.trim(),
        classification: toolClassification,
        handler_id: generatedHandlerId,
        input_schema: parsedSchema,
        enabled: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setIsAddToolOpen(false);
      setToolName('');
      setToolDescription('');
      setToolSchemaText('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
      setToolModalError(null);
    },
    onError: (err: Error) => {
      setToolModalError(err.message || 'Failed to register tool');
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: (id: string) => agentApi.deleteTool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  // Register MCP Server Handler (company_admin only)
  const handleRegisterServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageServers) {
      setServerModalError('Only Company Admins can register MCP servers');
      return;
    }

    const cleanId = serverFormId.trim().toLowerCase();
    if (!cleanId) {
      setServerModalError('Server identifier is required (e.g. postgres-mcp)');
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(cleanId)) {
      setServerModalError('Server ID must contain only lowercase letters, numbers, hyphens, and underscores');
      return;
    }
    if (mcpServers.some((s) => s.id.toLowerCase() === cleanId)) {
      setServerModalError(`An MCP server with identifier "${cleanId}" is already registered`);
      return;
    }
    if (!serverFormName.trim()) {
      setServerModalError('Server display name is required');
      return;
    }
    if (serverFormTransport !== 'inprocess' && !serverFormEndpoint.trim()) {
      setServerModalError('Server endpoint URL is required for network transport');
      return;
    }

    setIsRegisteringServer(true);
    setServerModalError(null);
    setServerActionError(null);

    try {
      const endpointValue =
        serverFormTransport === 'inprocess'
          ? `mcp://inprocess/${cleanId}`
          : serverFormEndpoint.trim();

      const descriptionValue = serverFormDesc.trim() || 'Custom Model Context Protocol server';

      // 1. If an auth token was provided, save to Vault credentials under category 'mcp'
      if (serverFormToken.trim()) {
        await agentApi.saveCredential({
          category: 'mcp',
          provider: cleanId,
          secret_value: serverFormToken.trim(),
        });
      }

      // 2. Persist the MCP server metadata record in PostgreSQL via a disabled sentinel tool
      // so all tenant members (company_admin and agent_developer) see it across any browser/session.
      const metaTool = await agentApi.registerTool({
        name: formatMcpServerMetaToolName(cleanId),
        description: serializeMcpServerMeta({
          name: serverFormName.trim(),
          description: descriptionValue,
          transport: serverFormTransport,
          endpoint: endpointValue,
        }),
        classification: 'read',
        handler_id: formatMcpServerMetaHandlerId(cleanId),
        input_schema: {
          type: 'object',
          properties: {},
          required: [],
        },
        enabled: false,
      });

      // Keep the sentinel metadata record disabled so it is never exposed as an executable tool
      await agentApi.setToolEnabled(metaTool.id, false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tools'] }),
        queryClient.invalidateQueries({ queryKey: ['credentials'] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ['tools'] });

      // Reset form & navigate into details view
      setIsRegisterServerOpen(false);
      setServerFormId('');
      setServerFormName('');
      setServerFormDesc('');
      setServerFormEndpoint('');
      setServerFormToken('');
      setServerModalError(null);

      setSelectedServerId(cleanId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register MCP server';
      setServerModalError(msg);
    } finally {
      setIsRegisteringServer(false);
    }
  };

  // Add Tool Handler
  const handleAddToolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim()) {
      setToolModalError('Tool name is required (e.g. read_balance)');
      return;
    }
    setToolModalError(null);
    registerToolMutation.mutate();
  };

  const handleCopyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleDeleteServer = async (server: McpServerDefinition) => {
    if (!canManageServers) return;
    if (
      !confirm(
        `Delete MCP Server "${server.name}" (${server.id})? This will also delete all tools registered under this server and its vaulted credential (if any).`
      )
    ) {
      return;
    }

    setDeletingServerId(server.id);
    setServerActionError(null);

    try {
      // 1. Delete all backend tools belonging to this server (including sentinel metadata record)
      const toolsToDelete = tools.filter((t) => {
        const parsed = parseMcpHandlerId(t.handler_id);
        return parsed !== null && parsed.serverId.toLowerCase() === server.id.toLowerCase();
      });

      for (const tool of toolsToDelete) {
        await agentApi.deleteTool(tool.id);
      }

      // 2. Delete any Vault credential associated with this server
      const credsToDelete = credentials.filter(
        (c) => c.category === 'mcp' && c.provider.toLowerCase() === server.id.toLowerCase()
      );

      for (const cred of credsToDelete) {
        await agentApi.deleteCredential(cred.id);
      }

      // 3. Remove any legacy localStorage cache entry
      deleteMcpServerFromStorage(tenantId, server.id);

      if (selectedServerId === server.id) {
        setSelectedServerId(null);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tools'] }),
        queryClient.invalidateQueries({ queryKey: ['credentials'] }),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete MCP server';
      setServerActionError(msg);
    } finally {
      setDeletingServerId(null);
    }
  };

  // =========================================================================
  // VIEW 1: MCP Server Details & Tool Selection View
  // =========================================================================
  if (selectedServer) {
    const hasVaultSecret = credentials.some(
      (c) => c.category === 'mcp' && c.provider.toLowerCase() === selectedServer.id.toLowerCase()
    );

    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262626] pb-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedServerId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 dark:border-[#333] bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#262626] text-xs font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white mb-2 transition shadow-xs group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              <span>Back to MCP Servers</span>
            </button>
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-blue-500 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedServer.name}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-[#333]">
                {selectedServer.id}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {selectedServer.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              {selectedServer.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {canManageTools && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddToolOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Tool to Server
              </Button>
            )}
            {canManageServers && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteServer(selectedServer)}
                isLoading={deletingServerId === selectedServer.id}
                disabled={deletingServerId !== null}
                className="text-red-600 hover:text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
              >
                Delete Server
              </Button>
            )}
          </div>
        </div>

        {serverActionError && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
              <span>{serverActionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setServerActionError(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Server Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#181818]">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-neutral-400 font-semibold block">
              Transport Protocol
            </span>
            <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white mt-1 capitalize">
              {selectedServer.transport.replace('_', ' ')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#181818] md:col-span-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-neutral-400 font-semibold block">
              Endpoint URI
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs text-slate-800 dark:text-neutral-200 truncate pr-2">
                {selectedServer.endpoint}
              </span>
              <button
                type="button"
                onClick={() => handleCopyEndpoint(selectedServer.endpoint)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded"
                title="Copy endpoint URI"
              >
                {copiedEndpoint ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#181818]">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-neutral-400 font-semibold block">
              Vault Credential
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {hasVaultSecret ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vault Secured</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                  None (Public / In-Process)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section: Tool Selection & Configuration inside MCP Server Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Tools & Capabilities ({serverTools.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Select and configure individual tools exposed by this MCP server for agent workflows.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchTools();
                refetchCredentials();
              }}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetchingTools ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>

          {/* Tools Table */}
          <div className="border border-slate-200 dark:border-[#262626] rounded-xl overflow-hidden bg-white dark:bg-[#181818] shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#262626] uppercase font-mono text-[11px] text-slate-500 dark:text-neutral-400 bg-slate-50 dark:bg-[#161616]">
                  <th className="py-3 px-4">Tool Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Handler ID</th>
                  <th className="py-3 px-4">Status & Access</th>
                  <th className="py-3 px-4">Schema</th>
                  {canDeleteTools && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
                {isLoadingTools && serverTools.length === 0 ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 dark:bg-[#282828] rounded w-32 mb-1" />
                        <div className="h-3 bg-slate-100 dark:bg-[#202020] rounded w-44" />
                      </td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-14" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-28" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-20" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-16" /></td>
                      {canDeleteTools && <td className="py-4 px-4" />}
                    </tr>
                  ))
                ) : serverTools.length === 0 ? (
                  <tr>
                    <td colSpan={canDeleteTools ? 6 : 5} className="py-10 text-center">
                      <Wrench className="w-8 h-8 text-slate-400 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-slate-800 dark:text-gray-300 font-medium">No tools registered on this MCP server</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1 max-w-sm mx-auto">
                        Add tool definitions to expose capabilities from this server for agent orchestration.
                      </p>
                      {canManageTools && (
                        <div className="mt-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsAddToolOpen(true)}
                            icon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Add first tool
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  serverTools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-slate-50 dark:hover:bg-[#1d1d1d] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-medium text-slate-900 dark:text-white text-xs">{tool.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                          {tool.description || 'No description provided'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
                            tool.classification === 'write'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 font-semibold'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                          }`}
                        >
                          {tool.classification}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-gray-400 text-[11px]">
                        {tool.handler_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={!canManageTools || toggleToolMutation.isPending}
                          onClick={() =>
                            toggleToolMutation.mutate({ id: tool.id, enabled: !tool.enabled })
                          }
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition cursor-pointer ${
                            tool.enabled
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/50 hover:border-emerald-400'
                              : 'bg-slate-100 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700 hover:border-slate-400'
                          }`}
                          title="Click to toggle tool enablement for agents"
                        >
                          {tool.enabled ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>enabled</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
                              <span>disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setInspectingSchemaTool(tool)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>View Schema</span>
                        </button>
                      </td>
                      {canDeleteTools && (
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete tool "${tool.name}" from ${selectedServer.name}?`)) {
                                deleteToolMutation.mutate(tool.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                            title="Delete tool"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Tool to this MCP Server */}
        {isAddToolOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-[#282828] flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span>Add Tool to {selectedServer.name}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddToolOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddToolSubmit} className="p-5 space-y-4">
                {toolModalError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{toolModalError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Tool Name / Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. get_balance, query_user"
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                    Handler ID: {formatMcpHandlerId(selectedServer.id, toolName || '<name>')}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Fetches account balance by customer ID"
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Classification</label>
                  <div className="relative">
                    <select
                      value={toolClassification}
                      onChange={(e) => setToolClassification(e.target.value as ToolClassification)}
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none appearance-none pr-8 cursor-pointer"
                    >
                      <option value="read">read (Safe idempotence, side-effect free)</option>
                      <option value="write">write (Mutating execution, requires guardrail approval)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Input Schema (JSON Schema)</label>
                  <textarea
                    rows={4}
                    value={toolSchemaText}
                    onChange={(e) => setToolSchemaText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white font-mono text-[11px] focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#282828] flex items-center justify-end space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setIsAddToolOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={registerToolMutation.isPending}
                  >
                    Register Tool
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Tool Schema */}
        {inspectingSchemaTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-xs">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-[#282828] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {inspectingSchemaTool.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Input Contract Schema
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingSchemaTool(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] max-h-80 overflow-y-auto">
                <pre>{JSON.stringify(inspectingSchemaTool.input_schema, null, 2)}</pre>
              </div>
              <div className="px-5 py-3 border-t border-slate-200 dark:border-[#282828] flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectingSchemaTool(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MCP Servers Main List View
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header Bar & Register MCP Server CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-gray-400">
          <Lock className="w-4 h-4 text-slate-400 dark:text-gray-400 shrink-0" />
          <span>Model Context Protocol (MCP) server connections and external tool endpoints.</span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchTools();
              refetchCredentials();
            }}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetchingTools ? 'animate-spin' : ''}`} />}
            title="Refresh MCP servers"
          >
            Refresh
          </Button>
          {canManageServers && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setServerModalError(null);
                setIsRegisterServerOpen(true);
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Register MCP Server
            </Button>
          )}
        </div>
      </div>

      {/* Error states */}
      {toolsError && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span>Failed to load MCP servers: {(toolsError as Error).message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchTools()}>
            Retry
          </Button>
        </div>
      )}

      {serverActionError && (
        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span>{serverActionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerActionError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MCP Servers Table */}
      <div className="border border-slate-200 dark:border-[#262626] rounded-xl overflow-hidden bg-white dark:bg-[#181818] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#262626] text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#828282] font-semibold bg-slate-50 dark:bg-[#161616]">
                <th className="py-3 px-4 whitespace-nowrap">MCP Server / Identifier</th>
                <th className="py-3 px-4 whitespace-nowrap">Transport</th>
                <th className="py-3 px-4 whitespace-nowrap">Endpoint</th>
                <th className="py-3 px-4 whitespace-nowrap">Tools Exposed</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
              {isLoadingTools && mcpServers.length === 0 ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-[#282828] rounded w-36 mb-1" />
                      <div className="h-3 bg-slate-100 dark:bg-[#202020] rounded w-48" />
                    </td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-36" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-[#252525] rounded w-20" /></td>
                    <td className="py-4 px-4" />
                  </tr>
                ))
              ) : mcpServers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Server className="w-8 h-8 text-slate-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-slate-800 dark:text-gray-300 font-medium text-sm">
                      No MCP servers registered
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 max-w-sm mx-auto">
                      {canManageServers
                        ? 'Register an MCP server to connect external tool providers for your organization.'
                        : 'No MCP servers have been configured yet. Contact your Company Admin to register an MCP server.'}
                    </p>
                    {canManageServers && (
                      <div className="mt-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setServerModalError(null);
                            setIsRegisterServerOpen(true);
                          }}
                          icon={<Plus className="w-3.5 h-3.5" />}
                        >
                          Register MCP Server
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                mcpServers.map((server) => {
                  const count = tools.filter((t) => {
                    if (isMcpServerMetaTool(t)) return false;
                    const parsed = parseMcpHandlerId(t.handler_id);
                    if (parsed) return parsed.serverId.toLowerCase() === server.id.toLowerCase();
                    return t.handler_id.toLowerCase().includes(server.id.toLowerCase());
                  }).length;

                  const hasVaultSecret = credentials.some(
                    (c) => c.category === 'mcp' && c.provider.toLowerCase() === server.id.toLowerCase()
                  );

                  return (
                    <tr
                      key={server.id}
                      onClick={() => setSelectedServerId(server.id)}
                      className="hover:bg-slate-50 dark:hover:bg-[#1d1d1d] transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 align-middle min-w-[240px] max-w-[340px]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Server className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{server.name}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#252525] text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-[#333] whitespace-nowrap shrink-0">
                                {server.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                              {server.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle font-mono text-xs whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-[#242424] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-[#333] capitalize whitespace-nowrap">
                          {server.transport.replace('_', ' ')}
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-4 align-middle font-mono text-[11px] text-slate-600 dark:text-neutral-400 max-w-[220px] truncate whitespace-nowrap"
                        title={server.endpoint}
                      >
                        {server.endpoint}
                      </td>

                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-neutral-200 whitespace-nowrap">
                            <Wrench className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{count} {count === 1 ? 'tool' : 'tools'}</span>
                          </span>
                          {hasVaultSecret && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 whitespace-nowrap shrink-0">
                              <ShieldCheck className="w-3 h-3 shrink-0" />
                              <span>Vault</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span>{server.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedServerId(server.id)}
                            className="text-xs group-hover:border-blue-500 whitespace-nowrap"
                          >
                            <span>Details & Tools</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1 shrink-0" />
                          </Button>
                          {canManageServers && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingServerId !== null}
                              onClick={() => handleDeleteServer(server)}
                              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 shrink-0"
                              title="Delete MCP server"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register MCP Server (company_admin only) */}
      {canManageServers && isRegisterServerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#282828] flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                <span>Register Model Context Protocol (MCP) Server</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsRegisterServerOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterServerSubmit} className="p-5 space-y-4">
              {serverModalError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{serverModalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Server Identifier (ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. postgres-mcp"
                    value={serverFormId}
                    onChange={(e) => setServerFormId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <span className="text-[10px] text-slate-500 dark:text-gray-500 block">
                    Unique slug used in tool handlers (mcp:&lt;id&gt;:&lt;tool&gt;)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. PostgreSQL MCP Server"
                    value={serverFormName}
                    onChange={(e) => setServerFormName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-gray-500 block">
                    Human-readable server label
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Production database tools and SQL query execution"
                  value={serverFormDesc}
                  onChange={(e) => setServerFormDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Transport Type</label>
                  <div className="relative">
                    <select
                      value={serverFormTransport}
                      onChange={(e) => setServerFormTransport(e.target.value as McpTransport)}
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none appearance-none pr-8 cursor-pointer"
                    >
                      <option value="streamable_http">Streamable HTTP (Standard POST)</option>
                      <option value="sse">Server-Sent Events (SSE)</option>
                      <option value="inprocess">In-Process Internal Adapter</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700 dark:text-gray-300">Endpoint URL</label>
                  <input
                    type="text"
                    disabled={serverFormTransport === 'inprocess'}
                    placeholder={serverFormTransport === 'inprocess' ? 'mcp://inprocess' : 'https://mcp.internal.acme.com/sse'}
                    value={serverFormTransport === 'inprocess' ? `mcp://inprocess/${serverFormId || 'conn'}` : serverFormEndpoint}
                    onChange={(e) => setServerFormEndpoint(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
                  <span>Server Secret / Auth Token (Optional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Bearer token or secret key"
                  value={serverFormToken}
                  onChange={(e) => setServerFormToken(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-300 dark:border-[#2f2f2f] rounded-md px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
                  autoComplete="off"
                />
                <span className="text-[10px] text-slate-500 dark:text-gray-500 block">
                  Encrypted at rest into HashiCorp Vault under category 'mcp'.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#282828] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsRegisterServerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isRegisteringServer}
                >
                  Register Server
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
