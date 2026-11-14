import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Rocket,
  Shield,
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
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../agentApi';
import type {
  AgentDetail,
  AgentConfiguration,
  ExecutionMode,
  ToolDefinition,
} from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/authStore';

interface ConfigInspectorProps {
  agentDetail: AgentDetail;
  onBackToList: () => void;
}

export const ConfigInspector: React.FC<ConfigInspectorProps> = ({
  agentDetail,
  onBackToList,
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
  const initialConfig = (draftVersion || activeVersion)?.configuration || {
    prompt_template: '',
    tools: [],
    reliability_threshold: 0.85,
    execution_mode: 'supervised' as ExecutionMode,
    guardrails: {},
    budgets: {},
    llm_config: { provider: 'groq', model: 'llama-3.3-70b-versatile' },
    output_schema: { strict: true, schema: {} },
  };

  const [promptTemplate, setPromptTemplate] = useState(initialConfig.prompt_template || '');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(
    initialConfig.execution_mode || 'supervised'
  );
  const [selectedTools, setSelectedTools] = useState<string[]>(initialConfig.tools || []);
  const [threshold, setThreshold] = useState<number>(
    initialConfig.reliability_threshold ?? 0.85
  );
  const [llmProvider, setLlmProvider] = useState<string>(
    initialConfig.llm_config?.provider || 'groq'
  );
  const [llmModel, setLlmModel] = useState<string>(
    initialConfig.llm_config?.model || 'llama-3.3-70b-versatile'
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

  // Fetch registered tools
  const { data: availableTools = [] } = useQuery<ToolDefinition[]>({
    queryKey: ['tools'],
    queryFn: ({ signal }) => agentApi.listTools(signal),
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

  // Projected escalation calculation
  const projectedEscalation = useMemo(() => {
    // Model escalation percentage monotonically increasing with threshold
    // e.g. at 0.50 -> ~2.1%, at 0.82 -> ~8.9%, at 0.95 -> ~22.4%
    const rate = Math.min(99.9, Math.max(0.5, Math.pow((threshold - 0.4) / 0.6, 2.2) * 28));
    return rate.toFixed(1);
  }, [threshold]);

  // Build current configuration object
  const getCurrentConfiguration = (): AgentConfiguration => {
    let parsedSchema: Record<string, unknown> = {};
    try {
      parsedSchema = JSON.parse(schemaText);
    } catch {
      // ignore
    }
    return {
      prompt_template: promptTemplate,
      tools: selectedTools,
      reliability_threshold: threshold,
      execution_mode: executionMode,
      llm_config: {
        provider: llmProvider,
        model: llmModel,
      },
      output_schema: {
        strict: strictSchema,
        schema: parsedSchema,
      },
      guardrails: initialConfig.guardrails || {},
      budgets: initialConfig.budgets || {},
    };
  };

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const cfg = getCurrentConfiguration();
      if (draftVersion) {
        return agentApi.updateDraftVersion(agentDetail.agent.id, draftVersion.id, cfg);
      } else {
        return agentApi.createVersion(agentDetail.agent.id, { configuration: cfg });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setFeedbackMsg({ type: 'success', text: 'Draft configuration saved successfully' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    },
    onError: (err: Error) => {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to save draft' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
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
      queryClient.invalidateQueries({ queryKey: ['agents'] });
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
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <button
              onClick={onBackToList}
              className="hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Agents</span>
            </button>
            <span>/</span>
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
        <div className="flex items-center gap-2">
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

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between border ${
            feedbackMsg.type === 'success'
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
                <label className="text-xs font-medium text-gray-300">Execution mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setExecutionMode('supervised')}
                    className={`p-3 rounded-lg border text-left transition ${
                      executionMode === 'supervised'
                        ? 'border-blue-500 bg-blue-950/20 text-white'
                        : 'border-[#282828] bg-[#141414] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-blue-300">Supervised / Durable</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Orchestrated via Temporal with human escalation safety net.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExecutionMode('autonomous')}
                    className={`p-3 rounded-lg border text-left transition ${
                      executionMode === 'autonomous'
                        ? 'border-blue-500 bg-blue-950/20 text-white'
                        : 'border-[#282828] bg-[#141414] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-emerald-300">Autonomous</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Direct automated resolution above the reliability threshold.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExecutionMode('human_in_the_loop')}
                    className={`p-3 rounded-lg border text-left transition ${
                      executionMode === 'human_in_the_loop'
                        ? 'border-blue-500 bg-blue-950/20 text-white'
                        : 'border-[#282828] bg-[#141414] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-amber-300">Human-in-the-Loop</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Every proposed decision routes through the human review queue.
                    </div>
                  </button>
                </div>
              </div>

              {/* LLM Runtime Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#242424]">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">LLM Provider</label>
                  <input
                    type="text"
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
                    placeholder="e.g. groq, openai, anthropic"
                    className="w-full bg-[#141414] border border-[#2e2e2e] rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Model Identifier</label>
                  <input
                    type="text"
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    placeholder="e.g. llama-3.3-70b-versatile"
                    className="w-full bg-[#141414] border border-[#2e2e2e] rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                  />
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
                      className={`flex items-center justify-between p-3.5 hover:bg-[#202020] cursor-pointer transition ${
                        !tool.enabled ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
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
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            tool.classification === 'write'
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

          {/* Section 5: Reliability Policy & Calibration Curve */}
          <section id="section-reliability" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Reliability policy & calibration curve</span>
              </h3>
              <p className="text-xs text-gray-400">
                Decisions with calibrated confidence below the threshold τ are escalated to the human
                review queue.
              </p>
            </div>

            <div className="border border-[#282828] rounded-lg p-5 bg-[#181818] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Slider control */}
                <div className="md:col-span-7 space-y-3">
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
                      The calibrated probability that the agent's decision matches what a human
                      reviewer would decide. It's recalibrated from every reviewer verdict, so a
                      score of {threshold.toFixed(2)} means roughly{' '}
                      {(threshold * 100).toFixed(0)}% agreement on similar past cases.
                    </p>
                  </div>
                </div>

                {/* Projected Escalation Chart Preview */}
                <div className="md:col-span-5 bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold block">
                      Projected escalation rate
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="text-2xl font-bold font-mono text-amber-400">
                        {projectedEscalation}%
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        of decisions at τ {threshold.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* SVG Curve */}
                  <div className="relative w-full h-24 my-2">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 80">
                      {/* Grid lines */}
                      <line stroke="#222" strokeDasharray="2,2" x1="0" x2="200" y1="20" y2="20" />
                      <line stroke="#222" strokeDasharray="2,2" x1="0" x2="200" y1="50" y2="50" />
                      <line stroke="#333" x1="0" x2="200" y1="78" y2="78" />
                      {/* Escalation curve */}
                      <path
                        d="M 0,75 Q 120,70 160,35 T 200,10"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                      />
                      {/* Current point based on threshold */}
                      {(() => {
                        const x = ((threshold - 0.5) / 0.49) * 180 + 10;
                        const y = 75 - (Math.pow((threshold - 0.5) / 0.49, 1.8) * 60);
                        return (
                          <>
                            <line
                              stroke="#f59e0b"
                              strokeDasharray="2,2"
                              strokeWidth="1.5"
                              x1={x}
                              x2={x}
                              y1="0"
                              y2="78"
                            />
                            <circle cx={x} cy={y} fill="#f59e0b" r="3.5" />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Based on seed examples and the last 30 days of runs.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Guardrails */}
          <section id="section-guardrails" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Guardrails condition builder</span>
              </h3>
              <p className="text-xs text-gray-400">
                Deterministic safety boundaries evaluated on every run regardless of confidence.
              </p>
            </div>

            <div className="border border-[#282828] rounded-lg p-4 bg-[#181818] space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#141414] border border-[#262626] rounded-md">
                <div className="space-y-0.5">
                  <div className="font-medium text-white">Amount Limit Threshold</div>
                  <div className="text-[11px] text-gray-400">
                    Escalate any transaction exceeding $10,000 USD to human review automatically.
                  </div>
                </div>
                <Badge variant="info">Enforced</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#141414] border border-[#262626] rounded-md">
                <div className="space-y-0.5">
                  <div className="font-medium text-white">High-Risk Prior Chargeback Check</div>
                  <div className="text-[11px] text-gray-400">
                    Require review if account tenure &lt; 30 days and prior chargebacks &gt; 0.
                  </div>
                </div>
                <Badge variant="info">Enforced</Badge>
              </div>
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
                Version history
              </span>
              {!draftVersion && (
                <button
                  type="button"
                  onClick={() => saveDraftMutation.mutate()}
                  className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1 font-medium transition"
                  title="Create new draft from active version"
                >
                  <Plus className="w-3 h-3" />
                  <span>New draft</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Draft Item */}
              {draftVersion ? (
                <div className="border-l-2 border-amber-500 pl-3 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-white">Draft</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      unpublished
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">Editable · autosaved</div>
                </div>
              ) : (
                <div className="border-l-2 border-gray-700 pl-3 space-y-1">
                  <div className="text-[11px] text-gray-500 italic">No unpublished draft</div>
                </div>
              )}

              {/* Active Published Version */}
              {activeVersion ? (
                <div className="border-l-2 border-emerald-500 pl-3 space-y-1">
                  <div className="flex items-center space-x-1.5 font-mono text-xs">
                    <span className="font-semibold text-white">v{activeVersion.version_number}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      active
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 leading-tight">
                    Mode: {activeVersion.configuration.execution_mode} · τ:{' '}
                    {activeVersion.configuration.reliability_threshold.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {new Date(
                      activeVersion.published_at || activeVersion.created_at
                    ).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="border-l-2 border-gray-700 pl-3 space-y-1">
                  <div className="text-[11px] text-gray-500 italic">No version published yet</div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
