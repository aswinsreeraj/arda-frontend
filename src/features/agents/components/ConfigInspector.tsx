import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Rocket,
  Shield,
  ShieldCheck,
  AlertOctagon,
  Sliders,
  FileCode,
  Layers,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Copy,
  Check,
  Edit3,
  ChevronDown,
  X,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../agentApi';
import type {
  AgentDetail,
  AgentVersion,
  AgentConfiguration,
  ExecutionMode,
  ToolDefinition,
  Credential,
} from '../types';
import {
  ARDA_LLM_PROVIDERS,
  getProviderDisplayName,
  getProviderModels,
  getDefaultModelForProvider,
} from '../llmProviders';
import { isMcpServerMetaTool } from '../mcpServerModel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/authStore';

export interface GuardrailRule {
  id: string;
  name: string;
  type: 'parameter_bounds' | 'destructive_operation' | 'conditional_check' | 'custom';
  description: string;
  parameter?: string;
  operator?: '>' | '<' | '>=' | '<=' | '==' | 'contains';
  thresholdValue?: number | string;
  enforced: boolean;
}

interface ConfigInspectorProps {
  agentDetail: AgentDetail;
  onBackToList: () => void;
  onDeleteAgent?: () => void;
  isDeletingAgent?: boolean;
}

const parseGuardrailsFromConfig = (cfg?: AgentConfiguration): GuardrailRule[] => {
  const raw = cfg?.guardrails;
  if (raw && typeof raw === 'object' && Array.isArray((raw as { rules?: unknown }).rules)) {
    return (raw as { rules: GuardrailRule[] }).rules;
  }
  return [];
};

export const ConfigInspector: React.FC<ConfigInspectorProps> = ({
  agentDetail,
  onBackToList,
  onDeleteAgent,
  isDeletingAgent = false,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Can current user publish? According to backend policy.go:
  // company_admin: true, reviewer: true, agent_developer: false
  const canPublish = user?.role === 'company_admin' || user?.role === 'reviewer';
  const canDeleteDraft = user?.role === 'company_admin';

  // State
  const activeVersion = agentDetail.latest_published_version;
  const draftVersion = agentDetail.draft_version;
  const defaultVersion = draftVersion || activeVersion;
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    defaultVersion?.id || null
  );

  // Query full version history for this agent
  const { data: versionHistory = [], isLoading: isLoadingVersions } = useQuery<AgentVersion[]>({
    queryKey: ['agent-versions', agentDetail.agent.id],
    queryFn: ({ signal }) => agentApi.listVersions(agentDetail.agent.id, signal),
  });

  const selectedVersion = useMemo(() => {
    if (selectedVersionId) {
      const found = versionHistory.find((v) => v.id === selectedVersionId);
      if (found) return found;
    }
    return defaultVersion || versionHistory[0] || null;
  }, [selectedVersionId, versionHistory, defaultVersion]);

  const initialConfig = (defaultVersion)?.configuration || {
    prompt_template: '',
    tools: [],
    reliability_threshold: 0.85,
    execution_mode: 'durable' as ExecutionMode,
    guardrails: {},
    budgets: {},
    llm_config: { provider: 'groq', model: 'llama-3.3-70b-versatile' },
    output_schema: { strict: true, schema: {} },
  };

  const [promptTemplate, setPromptTemplate] = useState(initialConfig.prompt_template || '');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(
    initialConfig.execution_mode || 'durable'
  );
  const [selectedTools, setSelectedTools] = useState<string[]>(initialConfig.tools || []);
  const [threshold, setThreshold] = useState<number>(
    initialConfig.reliability_threshold ?? 0.85
  );
  const [skipReliabilityCheck, setSkipReliabilityCheck] = useState<boolean>(
    Boolean((initialConfig.guardrails as Record<string, unknown> | undefined)?.skip_reliability_check)
  );
  const [strictSchema, setStrictSchema] = useState<boolean>(
    initialConfig.output_schema?.strict ?? true
  );
  const [schemaText, setSchemaText] = useState<string>(
    JSON.stringify(initialConfig.output_schema?.schema || {}, null, 2)
  );

  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch active credentials from Vault
  const { data: credentials = [] } = useQuery<Credential[]>({
    queryKey: ['credentials'],
    queryFn: ({ signal }) => agentApi.listCredentials(signal),
  });

  const activeLlmCredentials = useMemo(
    () => credentials.filter((c) => c.category === 'llm'),
    [credentials]
  );

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);

  // Active LLM provider: user selection > initial config > first active key in Vault > 'google'
  const llmProvider = useMemo(() => {
    if (selectedProvider) return selectedProvider;
    if (initialConfig.llm_config?.provider && initialConfig.llm_config.provider !== 'groq') {
      return initialConfig.llm_config.provider;
    }
    if (activeLlmCredentials.length > 0) {
      return activeLlmCredentials[0].provider;
    }
    return initialConfig.llm_config?.provider || 'google';
  }, [selectedProvider, initialConfig.llm_config, activeLlmCredentials]);

  // Active credential selected or matching current provider
  const matchingCredential = useMemo(() => {
    if (selectedCredentialId) {
      const match = activeLlmCredentials.find((c) => c.id === selectedCredentialId);
      if (match) return match;
    }
    return activeLlmCredentials.find(
      (c) =>
        c.provider.toLowerCase() === llmProvider.toLowerCase() ||
        (llmProvider.toLowerCase() === 'gemini' && c.provider.toLowerCase() === 'google') ||
        (llmProvider.toLowerCase() === 'google' && c.provider.toLowerCase() === 'gemini')
    );
  }, [activeLlmCredentials, llmProvider, selectedCredentialId]);

  // Query live models from API key if matchingCredential exists
  const {
    data: liveModelsData,
    isLoading: isFetchingModels,
    isError: isModelsError,
    refetch: refetchLiveModels,
  } = useQuery({
    queryKey: ['credentialModels', matchingCredential?.id],
    queryFn: ({ signal }) =>
      matchingCredential
        ? agentApi.listCredentialModels(matchingCredential.id, signal)
        : Promise.resolve({ credential_id: '', provider: '', models: [] }),
    enabled: !!matchingCredential?.id,
    staleTime: 60 * 1000,
  });

  const liveModelIds = useMemo(() => {
    if (!liveModelsData?.models || liveModelsData.models.length === 0) return [];
    return liveModelsData.models.map((m) => m.id);
  }, [liveModelsData]);

  const availableModels = useMemo(() => {
    if (liveModelIds.length > 0) {
      return liveModelIds;
    }
    return getProviderModels(llmProvider);
  }, [liveModelIds, llmProvider]);

  const llmModel = useMemo(() => {
    if (selectedModel) return selectedModel;
    if (
      initialConfig.llm_config?.model &&
      initialConfig.llm_config.provider === llmProvider
    ) {
      return initialConfig.llm_config.model;
    }
    if (liveModelIds.length > 0) {
      if (liveModelIds.includes('gemini-3.5-flash-lite')) {
        return 'gemini-3.5-flash-lite';
      }
      return liveModelIds[0];
    }
    return getDefaultModelForProvider(llmProvider) || 'gemini-3.5-flash-lite';
  }, [selectedModel, initialConfig.llm_config, llmProvider, liveModelIds]);

  const hasActiveKey = useMemo(() => {
    return activeLlmCredentials.some(
      (c) =>
        c.provider.toLowerCase() === llmProvider.toLowerCase() ||
        (llmProvider.toLowerCase() === 'gemini' && c.provider.toLowerCase() === 'google') ||
        (llmProvider.toLowerCase() === 'google' && c.provider.toLowerCase() === 'gemini')
    );
  }, [activeLlmCredentials, llmProvider]);

  const [guardrailRules, setGuardrailRules] = useState<GuardrailRule[]>(() =>
    parseGuardrailsFromConfig(initialConfig)
  );
  const [isGuardrailModalOpen, setIsGuardrailModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const loadVersionIntoForm = (version: AgentVersion) => {
    const cfg = version.configuration;
    setSelectedVersionId(version.id);
    setPromptTemplate(cfg.prompt_template || '');
    setExecutionMode(cfg.execution_mode || 'durable');
    setSelectedTools(cfg.tools || []);
    setThreshold(cfg.reliability_threshold ?? 0.85);
    setSkipReliabilityCheck(
      Boolean((cfg.guardrails as Record<string, unknown> | undefined)?.skip_reliability_check)
    );
    setStrictSchema(cfg.output_schema?.strict ?? true);
    setSchemaText(JSON.stringify(cfg.output_schema?.schema || {}, null, 2));
    setGuardrailRules(parseGuardrailsFromConfig(cfg));
    setSelectedProvider(cfg.llm_config?.provider || null);
    setSelectedModel(cfg.llm_config?.model || null);
    setSelectedCredentialId(null);
    setIsCustomModel(false);
  };

  // Form state for Guardrail Modal
  const [ruleFormName, setRuleFormName] = useState('');
  const [ruleFormType, setRuleFormType] = useState<GuardrailRule['type']>('parameter_bounds');
  const [ruleFormParam, setRuleFormParam] = useState('');
  const [ruleFormOperator, setRuleFormOperator] = useState<GuardrailRule['operator']>('>');
  const [ruleFormThreshold, setRuleFormThreshold] = useState<string>('10000');
  const [ruleFormDescription, setRuleFormDescription] = useState('');
  const [ruleFormEnforced, setRuleFormEnforced] = useState(true);

  const openAddGuardrailModal = () => {
    setEditingRuleId(null);
    setRuleFormName('');
    setRuleFormType('parameter_bounds');
    setRuleFormParam('amount');
    setRuleFormOperator('>');
    setRuleFormThreshold('10000');
    setRuleFormDescription('Escalate any transaction exceeding threshold to human review.');
    setRuleFormEnforced(true);
    setIsGuardrailModalOpen(true);
  };

  const openEditGuardrailModal = (rule: GuardrailRule) => {
    setEditingRuleId(rule.id);
    setRuleFormName(rule.name);
    setRuleFormType(rule.type);
    setRuleFormParam(rule.parameter || '');
    setRuleFormOperator(rule.operator || '>');
    setRuleFormThreshold(String(rule.thresholdValue ?? ''));
    setRuleFormDescription(rule.description);
    setRuleFormEnforced(rule.enforced);
    setIsGuardrailModalOpen(true);
  };

  const handleToggleEnforced = (ruleId: string) => {
    setGuardrailRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enforced: !r.enforced } : r))
    );
  };

  const handleDeleteGuardrail = (ruleId: string) => {
    setGuardrailRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleSaveGuardrailRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormName.trim()) return;

    if (editingRuleId) {
      setGuardrailRules((prev) =>
        prev.map((r) =>
          r.id === editingRuleId
            ? {
                ...r,
                name: ruleFormName.trim(),
                type: ruleFormType,
                parameter: ruleFormParam.trim(),
                operator: ruleFormOperator,
                thresholdValue: ruleFormThreshold.trim(),
                description: ruleFormDescription.trim(),
                enforced: ruleFormEnforced,
              }
            : r
        )
      );
    } else {
      const newRule: GuardrailRule = {
        id: `rule_${Date.now()}`,
        name: ruleFormName.trim(),
        type: ruleFormType,
        parameter: ruleFormParam.trim(),
        operator: ruleFormOperator,
        thresholdValue: ruleFormThreshold.trim(),
        description: ruleFormDescription.trim(),
        enforced: ruleFormEnforced,
      };
      setGuardrailRules((prev) => [...prev, newRule]);
    }
    setIsGuardrailModalOpen(false);
  };

  // Fetch registered tools (excluding hidden MCP server metadata records)
  const { data: availableTools = [] } = useQuery<ToolDefinition[]>({
    queryKey: ['tools'],
    queryFn: ({ signal }) => agentApi.listTools(signal),
    select: (data) => data.filter((t) => !isMcpServerMetaTool(t)),
  });

  // Extract detected template variables
  const detectedVariables = useMemo(() => {
    const matches = promptTemplate.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim())));
  }, [promptTemplate]);

  // Selected tool counts
  const toolStats = useMemo(() => {
    const selectedDefs = availableTools.filter((t) => selectedTools.includes(t.name) || selectedTools.includes(t.id));
    const writeCount = selectedDefs.filter((t) => t.classification === 'write').length;
    return {
      total: selectedTools.length,
      writes: writeCount,
    };
  }, [availableTools, selectedTools]);

  // Build current configuration object
  const getCurrentConfiguration = (): AgentConfiguration => {
    let parsedSchema: Record<string, unknown> | undefined = undefined;
    const trimmedSchema = schemaText.trim();
    if (trimmedSchema && trimmedSchema !== '{}') {
      try {
        const parsed = JSON.parse(trimmedSchema);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          parsedSchema = parsed;
        }
      } catch {
        // Will be caught by mutation validation
      }
    }

    const maxAmountRule = guardrailRules.find(
      (r) => r.type === 'parameter_bounds' && r.enforced && r.parameter === 'amount'
    );
    const maxAmountVal =
      maxAmountRule && !isNaN(Number(maxAmountRule.thresholdValue))
        ? Number(maxAmountRule.thresholdValue)
        : undefined;

    const guardrailsPayload: Record<string, unknown> = {
      rules: guardrailRules,
      skip_reliability_check: skipReliabilityCheck,
      ...(maxAmountVal !== undefined ? { max_amount: maxAmountVal } : {}),
    };

    const cfg: AgentConfiguration = {
      prompt_template: promptTemplate.trim(),
      tools: selectedTools,
      reliability_threshold: threshold,
      execution_mode: executionMode,
      llm_config: {
        provider: llmProvider,
        model: llmModel,
      },
      guardrails: guardrailsPayload,
      budgets: initialConfig.budgets || {},
    };

    if (parsedSchema) {
      cfg.output_schema = {
        strict: strictSchema,
        schema: parsedSchema,
      };
    }

    return cfg;
  };

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!promptTemplate.trim()) {
        throw new Error('System prompt template is required and cannot be empty.');
      }

      const trimmedSchema = schemaText.trim();
      if (trimmedSchema && trimmedSchema !== '{}') {
        try {
          JSON.parse(trimmedSchema);
        } catch {
          throw new Error('Output schema contains invalid JSON syntax. Please correct it or clear the schema.');
        }
      }

      const cfg = getCurrentConfiguration();
      if (draftVersion) {
        return agentApi.updateDraftVersion(agentDetail.agent.id, draftVersion.id, cfg);
      } else {
        return agentApi.createVersion(agentDetail.agent.id, { configuration: cfg });
      }
    },
    onSuccess: (saved) => {
      if (saved?.id) {
        setSelectedVersionId(saved.id);
      }
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-versions', agentDetail.agent.id] });
      setFeedbackMsg({ type: 'success', text: 'Draft configuration saved successfully' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    },
    onError: (err: any) => {
      let msg = err?.message || 'Failed to save draft';
      if (err?.details && Array.isArray(err.details) && err.details.length > 0) {
        msg = `${msg}: ${err.details.join(', ')}`;
      }
      setFeedbackMsg({ type: 'error', text: msg });
    },
  });

  // Publish Version Mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!draftVersion) {
        throw new Error('No draft version exists to publish. Please save a draft first.');
      }
      return agentApi.publishVersion(agentDetail.agent.id, draftVersion.id);
    },
    onSuccess: (published) => {
      if (published?.id) {
        setSelectedVersionId(published.id);
      }
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-versions', agentDetail.agent.id] });
      setFeedbackMsg({
        type: 'success',
        text: 'Agent version published successfully! Changes are now active.',
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    },
    onError: (err: Error) => {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to publish version' });
    },
  });

  // Discard Draft Mutation
  const deleteDraftMutation = useMutation({
    mutationFn: async () => {
      if (!draftVersion) return;
      return agentApi.deleteDraftVersion(agentDetail.agent.id, draftVersion.id);
    },
    onSuccess: () => {
      if (activeVersion) {
        loadVersionIntoForm(activeVersion);
      } else {
        setSelectedVersionId(null);
      }
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-versions', agentDetail.agent.id] });
      setFeedbackMsg({ type: 'success', text: 'Draft discarded' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    },
    onError: (err: Error) => {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to discard draft' });
    },
  });

  // Toggle tool
  const toggleTool = (toolIdentifier: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolIdentifier)
        ? prev.filter((t) => t !== toolIdentifier)
        : [...prev, toolIdentifier]
    );
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(agentDetail.agent.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#282828]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 text-xs text-gray-400 mb-1">
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#333] bg-[#1a1a1a] hover:bg-[#262626] hover:border-gray-500 text-xs font-medium text-gray-300 hover:text-white transition shadow-sm group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-gray-400 group-hover:text-white" />
              <span>Agents</span>
            </button>
            <span className="text-gray-600">/</span>
            <span className="text-gray-200 font-medium">{agentDetail.agent.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {agentDetail.agent.name}
            </h2>
            {draftVersion ? (
              <Badge variant="review" dot>
                Draft unpublished
              </Badge>
            ) : activeVersion ? (
              <Badge variant="healthy" dot>
                v{activeVersion.version_number} active
              </Badge>
            ) : (
              <Badge variant="neutral">Draft pending</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span>ID: {agentDetail.agent.id}</span>
            <button
              onClick={handleCopyId}
              className="text-gray-500 hover:text-gray-300 p-0.5 rounded transition"
              title="Copy Agent ID"
            >
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canDeleteDraft && onDeleteAgent && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteAgent}
              isLoading={isDeletingAgent}
              className="text-red-400 hover:text-red-300 border-red-900/50 hover:border-red-700/60"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              title="Permanently delete this agent and all its versions"
            >
              Delete Agent
            </Button>
          )}

          {draftVersion && canDeleteDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteDraftMutation.mutate()}
              isLoading={deleteDraftMutation.isPending}
              icon={<Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />}
              title="Discard unpublished draft"
            >
              Discard Draft
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => saveDraftMutation.mutate()}
            isLoading={saveDraftMutation.isPending}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => publishMutation.mutate()}
            disabled={!draftVersion || !canPublish}
            isLoading={publishMutation.isPending}
            icon={<Rocket className="w-3.5 h-3.5" />}
            title={
              !canPublish
                ? 'Only company_admin and reviewer roles can publish versions'
                : !draftVersion
                  ? 'No draft version to publish'
                  : 'Publish current draft to live traffic'
            }
          >
            Publish Version
          </Button>
        </div>
      </div>

      {/* Historical Version Banner */}
      {selectedVersion && selectedVersion.published && selectedVersion.id !== activeVersion?.id && (
        <div className="p-3 rounded-lg text-xs flex items-center justify-between border bg-blue-950/30 border-blue-800/50 text-blue-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Viewing historical published version <strong className="font-mono">v{selectedVersion.version_number}</strong>. Click{' '}
              <strong>Save Draft</strong> to create a new draft from this configuration.
            </span>
          </div>
          {(draftVersion || activeVersion) && (
            <button
              type="button"
              onClick={() => loadVersionIntoForm((draftVersion || activeVersion)!)}
              className="text-blue-300 hover:text-white underline text-[11px] shrink-0 ml-3 cursor-pointer"
            >
              Return to {draftVersion ? `Draft v${draftVersion.version_number}` : `Active v${activeVersion?.version_number}`}
            </button>
          )}
        </div>
      )}

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between border ${feedbackMsg.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
            : 'bg-red-950/40 border-red-800/50 text-red-300'
            }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* RBAC Notice for Developer */}
      {!canPublish && (
        <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs flex items-center gap-2.5">
          <Lock className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            You are logged in as an <strong>agent_developer</strong>. You can edit and save draft
            configurations, but publishing new versions requires approval from a{' '}
            <strong>company_admin</strong> or <strong>reviewer</strong>.
          </span>
        </div>
      )}

      {/* Main Grid: 9-col Left Content + 3-col Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 9 Columns: Form Sections */}
        <div className="lg:col-span-9 space-y-8">
          {/* Section 1: General */}
          <section id="section-general" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>General configuration</span>
              </h3>
              <p className="text-xs text-gray-400">
                Core identity, execution profile, and LLM runtime bindings.
              </p>
            </div>

            <div className="border border-[#282828] rounded-lg p-5 bg-[#181818] space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Display name</label>
                  <input
                    type="text"
                    value={agentDetail.agent.name}
                    readOnly
                    className="w-full bg-[#121212] border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-300 text-xs cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Agent UUID</label>
                  <input
                    type="text"
                    value={agentDetail.agent.id}
                    readOnly
                    className="w-full bg-[#121212] border border-[#2b2b2b] rounded-md px-3 py-2 text-gray-400 text-xs font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Execution Mode Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-300">Execution mode</label>
                  <span className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1">
                    <span>🛡️ Reliability Service Gate Enforced (p ≥ τ) on both modes</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExecutionMode('durable')}
                    className={`p-3 rounded-lg border text-left transition ${
                      executionMode === 'durable' || executionMode === 'supervised' || executionMode === 'gated' || executionMode === 'human_in_the_loop'
                        ? 'border-blue-500 bg-blue-950/20 text-white'
                        : 'border-[#282828] bg-[#141414] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-blue-300">Durable (Temporal Workflow)</div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                        temporal
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Asynchronous stateful execution with event replay, checkpointing, and durable suspension during human review.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExecutionMode('realtime')}
                    className={`p-3 rounded-lg border text-left transition ${
                      executionMode === 'realtime' || executionMode === 'autonomous'
                        ? 'border-emerald-500 bg-emerald-950/20 text-white'
                        : 'border-[#282828] bg-[#141414] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-emerald-300">Realtime (Go Runtime)</div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                        sync
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Low-latency in-process execution via direct Go AgentRuntime for instant API responses (no Temporal overhead).
                    </div>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Every 10th autonomous decision (p ≥ τ) is automatically escalated to human review as an active learning calibration sample to continuously refine the Reliability Service vector embeddings.
                </p>
              </div>

              {/* LLM Runtime Configuration */}
              <div className="space-y-3 pt-3 border-t border-[#242424]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>LLM Runtime Configuration</span>
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Select the model provider and model version for this agent.
                    </p>
                  </div>
                  {hasActiveKey ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Key Configured (Vault)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-800/50">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      No Vault Key Configured
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LLM Provider Selection Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center justify-between">
                      <span>LLM Provider & Key</span>
                      {activeLlmCredentials.length > 0 && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {activeLlmCredentials.length} active key{activeLlmCredentials.length > 1 ? 's' : ''} in Vault
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        value={matchingCredential ? `key:${matchingCredential.id}` : `provider:${llmProvider}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('key:')) {
                            const credId = val.replace('key:', '');
                            const cred = activeLlmCredentials.find((c) => c.id === credId);
                            if (cred) {
                              setSelectedCredentialId(cred.id);
                              setSelectedProvider(cred.provider);
                              const defaultModel = getDefaultModelForProvider(cred.provider);
                              setSelectedModel(defaultModel);
                              setIsCustomModel(false);
                            }
                          } else {
                            const newProvider = val.replace('provider:', '');
                            setSelectedCredentialId(null);
                            setSelectedProvider(newProvider);
                            const defaultModel = getDefaultModelForProvider(newProvider);
                            setSelectedModel(defaultModel);
                            setIsCustomModel(false);
                          }
                        }}
                        className="w-full bg-[#141414] border border-[#2e2e2e] rounded-md px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none appearance-none pr-8 cursor-pointer"
                      >
                        {activeLlmCredentials.length > 0 && (
                          <optgroup label="Active Keys in Vault (Configured & Ready)">
                            {activeLlmCredentials.map((c) => (
                              <option key={c.id} value={`key:${c.id}`}>
                                ● {getProviderDisplayName(c.provider)} ({c.provider}) — Key #{c.id.slice(0, 8)}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="All Supported Providers (Without Vault Key)">
                          {ARDA_LLM_PROVIDERS.filter(
                            (p) =>
                              !activeLlmCredentials.some(
                                (c) => c.provider.toLowerCase() === p.id.toLowerCase()
                              )
                          ).map((p) => (
                            <option key={p.id} value={`provider:${p.id}`}>
                              {p.name} ({p.id})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Model Identifier Selection Dropdown / Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-300">Model Identifier</label>
                      {matchingCredential && (
                        <div className="flex items-center gap-1.5">
                          {isFetchingModels ? (
                            <span className="flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Fetching live models...</span>
                            </span>
                          ) : liveModelIds.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => void refetchLiveModels()}
                              title="Click to refresh live models from provider API"
                              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono transition"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{liveModelIds.length} live models</span>
                              <RefreshCw className="w-2.5 h-2.5 ml-0.5 opacity-70 hover:opacity-100" />
                            </button>
                          ) : isModelsError ? (
                            <button
                              type="button"
                              onClick={() => void refetchLiveModels()}
                              title="Failed to fetch live models; click to retry"
                              className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-mono transition"
                            >
                              <span>Static defaults (retry)</span>
                              <RefreshCw className="w-2.5 h-2.5" />
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                    {availableModels.length > 0 ? (
                      <div className="relative">
                        <select
                          value={availableModels.includes(llmModel) ? llmModel : '__custom__'}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomModel(true);
                            } else {
                              setIsCustomModel(false);
                              setSelectedModel(e.target.value);
                            }
                          }}
                          className="w-full bg-[#141414] border border-[#2e2e2e] rounded-md px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none appearance-none pr-8 font-mono cursor-pointer"
                        >
                          {availableModels.map((m, idx) => {
                            const meta = liveModelsData?.models?.find((x) => x.id === m);
                            const label =
                              meta && meta.display_name && meta.display_name !== m
                                ? `${meta.display_name} (${m})`
                                : m;
                            return (
                              <option key={m} value={m}>
                                {label} {idx === 0 ? '(Recommended)' : ''}
                              </option>
                            );
                          })}
                          <option value="__custom__">Custom model identifier...</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={llmModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        placeholder="e.g. gemini-3.5-flash-lite"
                        className="w-full bg-[#141414] border border-[#2e2e2e] rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                      />
                    )}

                    {isCustomModel && (
                      <input
                        type="text"
                        value={llmModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        placeholder="Enter custom model identifier"
                        className="w-full bg-[#141414] border border-blue-500 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none font-mono mt-1.5"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Prompt Template */}
          <section id="section-prompt" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Prompt template</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Reference runtime parameters using{' '}
                  <span className="font-mono text-gray-300">{'{{variable_name}}'}</span>.
                </p>
              </div>
              <span className="text-[11px] font-mono text-gray-500">
                {promptTemplate.length} characters
              </span>
            </div>

            <div className="rounded-lg border border-[#2c2c2c] bg-[#161616] p-3 shadow-inner">
              <textarea
                rows={7}
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                placeholder="You are an agent reviewing transaction {{transaction_id}}..."
                className="w-full bg-transparent font-mono text-xs text-gray-200 leading-relaxed outline-none resize-y"
              />
            </div>

            {/* Variable Detector Pills */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs">
              <span className="text-[11px] text-gray-500 font-mono">
                {detectedVariables.length} variable{detectedVariables.length === 1 ? '' : 's'} detected:
              </span>
              {detectedVariables.length > 0 ? (
                detectedVariables.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40 font-mono text-[11px]"
                  >
                    {`{{${v}}}`}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-gray-600 font-mono italic">
                  none yet (add with {'{{field}}'})
                </span>
              )}
            </div>
          </section>

          {/* Section 3: Input / Output Schema */}
          <section id="section-schema" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Structured Output Schema</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Defines the JSON contract for agent recommendations and structured verdicts.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={strictSchema}
                  onChange={(e) => setStrictSchema(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0"
                />
                <span>Strict mode</span>
              </label>
            </div>

            <div className="border border-[#2c2c2c] rounded-lg p-3 bg-[#161616]">
              <textarea
                rows={5}
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-gray-300 leading-relaxed outline-none resize-y"
                placeholder='{ "type": "object", "properties": { ... } }'
              />
            </div>
          </section>

          {/* Section 4: Tool Selection */}
          <section id="section-tools" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <span>Tool selection</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Tools from your organization's registered tool catalog. Calls route through the
                  governed gateway.
                </p>
              </div>
              <span className="text-xs font-mono text-gray-400">
                <span className="text-white font-semibold">{toolStats.total}</span> selected ·{' '}
                <span className="text-amber-400 font-medium">{toolStats.writes}</span> write
              </span>
            </div>

            <div className="border border-[#282828] rounded-lg divide-y divide-[#262626] bg-[#181818] text-xs overflow-hidden">
              {availableTools.length === 0 ? (
                <div className="p-4 text-center text-gray-500 font-mono text-xs">
                  No tools found in the catalog. Register tools in the MCP Servers tab.
                </div>
              ) : (
                availableTools.map((tool) => {
                  const isChecked =
                    selectedTools.includes(tool.name) || selectedTools.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => toggleTool(tool.name)}
                      className={`flex items-center justify-between p-3.5 hover:bg-[#202020] cursor-pointer transition ${!tool.enabled ? 'opacity-40' : ''
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => { }}
                          disabled={!tool.enabled}
                          className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="font-mono text-white font-medium flex items-center gap-2">
                            <span>{tool.name}</span>
                            <span className="text-[10px] text-gray-500 font-normal">
                              ({tool.handler_id})
                            </span>
                          </div>
                          <div className="text-gray-400 text-[11px] mt-0.5">
                            {tool.description || 'No description provided'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tool.classification === 'write'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                            }`}
                        >
                          {tool.classification}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Write tool calls are checked against guardrails before execution.</span>
            </div>
          </section>

          {/* Section 5: Reliability Policy */}
          <section id="section-reliability" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Reliability policy</span>
              </h3>
              <p className="text-xs text-gray-400">
                Decisions with calibrated confidence below the threshold τ are escalated to the human
                review queue.
              </p>
            </div>

            <div className="border border-[#282828] rounded-lg p-5 bg-[#181818] space-y-5">
              {/* Skip Reliability Gate Toggle */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#262626]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      Skip reliability gate (bypass precedent check)
                    </span>
                    {skipReliabilityCheck && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                        BYPASSED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    When enabled, this agent completes without querying past human-reviewed precedents
                    (useful for action/assistant agents like Obsidian that do not require cold-start precedent verification).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={skipReliabilityCheck}
                  onClick={() => setSkipReliabilityCheck((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    skipReliabilityCheck ? 'bg-amber-500' : 'bg-[#333]'
                  }`}
                  title="Toggle skipping reliability gate"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                      skipReliabilityCheck ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className={`space-y-3 transition-opacity ${skipReliabilityCheck ? 'opacity-45 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-300">
                    Confidence threshold τ
                  </label>
                  <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-[#222] border border-[#333] text-blue-400 font-semibold">
                    {threshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  disabled={skipReliabilityCheck}
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] font-mono text-gray-500">
                  <span>0.50 · fewer escalations</span>
                  <span>0.99 · more review</span>
                </div>
                <div className="p-3 bg-[#1e1e1e] rounded border border-[#2b2b2b] text-[11px] text-gray-400 space-y-1">
                  <div className="font-medium text-gray-300 flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>What confidence means:</span>
                  </div>
                  <p className="leading-relaxed">
                    The calibrated probability that the agent&apos;s decision matches what a human
                    reviewer would decide. It is recalibrated from reviewer verdicts, so a
                    threshold of {threshold.toFixed(2)} requires at least{' '}
                    {(threshold * 100).toFixed(0)}% calibrated confidence for autonomous execution.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Guardrails */}
          <section id="section-guardrails" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Guardrails condition builder</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Deterministic safety boundaries evaluated on every run regardless of confidence.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAddGuardrailModal}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Guardrail
              </Button>
            </div>

            <div className="border border-[#282828] rounded-lg p-4 bg-[#181818] space-y-3 text-xs">
              {guardrailRules.length === 0 ? (
                <div className="p-6 text-center text-gray-500 border border-dashed border-[#2e2e2e] rounded-md">
                  No guardrails defined. Click <strong>Add Guardrail</strong> to configure deterministic safety rules.
                </div>
              ) : (
                guardrailRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between p-3.5 bg-[#141414] border rounded-md transition ${
                      rule.enforced ? 'border-[#2d2d2d]' : 'border-[#222222] opacity-70'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-1.5 rounded-md mt-0.5 ${
                          rule.enforced
                            ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50'
                            : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                        }`}
                      >
                        {rule.type === 'destructive_operation' ? (
                          <AlertOctagon className="w-4 h-4" />
                        ) : rule.type === 'conditional_check' ? (
                          <Sliders className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{rule.name}</span>
                          {rule.parameter && (
                            <span className="px-1.5 py-0.5 rounded bg-[#202020] text-gray-400 font-mono text-[10px] border border-[#2c2c2c]">
                              {rule.parameter} {rule.operator || '>'} {String(rule.thresholdValue)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 leading-normal">
                          {rule.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Enforced Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleEnforced(rule.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                          rule.enforced
                            ? 'bg-blue-950/50 border border-blue-800/80 text-blue-300 hover:bg-blue-900/60'
                            : 'bg-[#1e1e1e] border border-[#333] text-gray-400 hover:text-white hover:bg-[#252525]'
                        }`}
                        title={rule.enforced ? 'Click to disable' : 'Click to enforce'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rule.enforced ? 'bg-blue-400' : 'bg-gray-500'
                          }`}
                        />
                        <span>{rule.enforced ? 'Enforced' : 'Disabled'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditGuardrailModal(rule)}
                        className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#252525] transition cursor-pointer"
                        title="Edit guardrail rule"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteGuardrail(rule.id)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                        title="Delete guardrail rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right 3 Columns: Sticky Sidebar */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
          {/* On this page quicknav */}
          <div className="p-3.5 bg-[#181818] border border-[#282828] rounded-lg space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              On this page
            </span>
            <nav className="flex flex-col space-y-1.5 text-xs text-gray-400">
              <a href="#section-general" className="hover:text-blue-400 transition">
                General
              </a>
              <a href="#section-prompt" className="hover:text-blue-400 transition">
                Prompt template
              </a>
              <a href="#section-schema" className="hover:text-blue-400 transition">
                Output schema
              </a>
              <a href="#section-tools" className="hover:text-blue-400 transition">
                Tools
              </a>
              <a href="#section-reliability" className="hover:text-blue-400 transition">
                Reliability policy
              </a>
              <a href="#section-guardrails" className="hover:text-blue-400 transition">
                Guardrails
              </a>
            </nav>
          </div>

          {/* Version history timeline */}
          <div className="p-3.5 bg-[#181818] border border-[#282828] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Version history ({versionHistory.length})
              </span>
              {!draftVersion && (
                <button
                  type="button"
                  onClick={() => saveDraftMutation.mutate()}
                  className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1 font-medium transition cursor-pointer"
                  title="Create new draft from currently loaded configuration"
                >
                  <Plus className="w-3 h-3" />
                  <span>New draft</span>
                </button>
              )}
            </div>

            {isLoadingVersions ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-12 bg-[#222] rounded" />
                <div className="h-12 bg-[#222] rounded" />
              </div>
            ) : versionHistory.length === 0 ? (
              <div className="border-l-2 border-gray-700 pl-3 py-1">
                <div className="text-[11px] text-gray-500 italic">No versions recorded yet</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                {versionHistory.map((ver) => {
                  const isDraft = !ver.published;
                  const isActivePublished = activeVersion?.id === ver.id;
                  const isSelected = selectedVersion?.id === ver.id;

                  return (
                    <button
                      key={ver.id}
                      type="button"
                      onClick={() => loadVersionIntoForm(ver)}
                      className={`w-full text-left pl-3 pr-2.5 py-2 rounded-r-md border-l-2 transition cursor-pointer space-y-1 ${
                        isDraft
                          ? 'border-l-amber-500'
                          : isActivePublished
                            ? 'border-l-emerald-500'
                            : 'border-l-neutral-600'
                      } ${
                        isSelected
                          ? 'bg-blue-950/35 ring-1 ring-inset ring-blue-500/40'
                          : 'bg-[#141414]/60 hover:bg-[#1e1e1e]'
                      }`}
                      title={`Load v${ver.version_number} configuration into inspector`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center space-x-1.5 font-mono text-xs">
                          <span className="font-semibold text-white">v{ver.version_number}</span>
                          {isDraft ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
                              draft
                            </span>
                          ) : isActivePublished ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
                              active
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-700/40 text-neutral-300 border border-neutral-600/50 whitespace-nowrap">
                              published
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-[9px] font-mono text-blue-400 uppercase font-semibold">
                            viewing
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 leading-tight truncate">
                        Mode: {ver.configuration.execution_mode} · τ:{' '}
                        {(ver.configuration.reliability_threshold ?? 0.85).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {new Date(ver.published_at || ver.created_at).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal: Add / Edit Guardrail Rule */}
      {isGuardrailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-xs transform transition-all">
            <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>{editingRuleId ? 'Edit Guardrail Rule' : 'Add Guardrail Rule'}</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Deterministic policy boundary enforced before tool execution.
                </p>
              </div>
              <button
                onClick={() => setIsGuardrailModalOpen(false)}
                type="button"
                className="text-gray-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGuardrailRule} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="font-medium text-gray-300">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Transaction Amount Limit"
                  value={ruleFormName}
                  onChange={(e) => setRuleFormName(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-gray-300">Rule Type</label>
                  <div className="relative">
                    <select
                      value={ruleFormType}
                      onChange={(e) => setRuleFormType(e.target.value as GuardrailRule['type'])}
                      className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md pl-3 pr-8 py-2 text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="parameter_bounds">Parameter Bounds (Numeric limit)</option>
                      <option value="destructive_operation">Destructive Operation Filter</option>
                      <option value="conditional_check">Conditional Check (Risk/Tenure)</option>
                      <option value="custom">Custom Policy</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-gray-300">Target Parameter</label>
                  <input
                    type="text"
                    placeholder="e.g. amount, query, count"
                    value={ruleFormParam}
                    onChange={(e) => setRuleFormParam(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-gray-300">Operator</label>
                  <div className="relative">
                    <select
                      value={ruleFormOperator}
                      onChange={(e) => setRuleFormOperator(e.target.value as GuardrailRule['operator'])}
                      className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md pl-3 pr-8 py-2 text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value=">">&gt; (Greater than)</option>
                      <option value="<">&lt; (Less than)</option>
                      <option value=">=">&gt;= (Greater or equal)</option>
                      <option value="<=">&lt;= (Less or equal)</option>
                      <option value="==">== (Equals)</option>
                      <option value="contains">contains</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="font-medium text-gray-300">Threshold / Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 10000, DROP TABLE"
                    value={ruleFormThreshold}
                    onChange={(e) => setRuleFormThreshold(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-300">Description / Action</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Escalate any transaction exceeding $10,000 USD to human review automatically."
                  value={ruleFormDescription}
                  onChange={(e) => setRuleFormDescription(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="ruleEnforcedCheckbox"
                  checked={ruleFormEnforced}
                  onChange={(e) => setRuleFormEnforced(e.target.checked)}
                  className="rounded border-[#2f2f2f] bg-[#141414] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="ruleEnforcedCheckbox" className="font-medium text-gray-300 cursor-pointer select-none">
                  Enforce this guardrail immediately
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#282828]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGuardrailModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingRuleId ? 'Update Rule' : 'Add Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
