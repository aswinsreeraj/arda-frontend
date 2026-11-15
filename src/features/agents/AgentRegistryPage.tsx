import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentApi } from './agentApi';
import type { AgentDetail } from './types';
import { AgentsTable } from './components/AgentsTable';
import { ConfigInspector } from './components/ConfigInspector';
import { RegisterAgentModal } from './components/RegisterAgentModal';
import { McpServersTab } from './components/McpServersTab';
import { LlmKeysTab } from './components/LlmKeysTab';
import { useAuthStore } from '@/features/auth/authStore';
import { getStoredMcpServers } from './mcpServerModel';

type TabType = 'agents' | 'mcp' | 'llm';
type ScreenViewType = 'table' | 'inspector';

export const AgentRegistryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('agents');
  const [screenView, setScreenView] = useState<ScreenViewType>('table');
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Query agents
  const {
    data: agentsData,
    isLoading: isLoadingAgents,
    error: agentsError,
    refetch: refetchAgents,
  } = useQuery({
    queryKey: ['agents'],
    queryFn: ({ signal }) => agentApi.listAgents(undefined, signal),
  });

  // Query tools (for count badge)
  const { data: toolsData = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: ({ signal }) => agentApi.listTools(signal),
  });

  // Query credentials (for count badge)
  const { data: credentialsData = [] } = useQuery({
    queryKey: ['credentials'],
    queryFn: ({ signal }) => agentApi.listCredentials(signal),
  });

  const agents = agentsData?.agents || [];
  const llmKeys = credentialsData.filter((c) => c.category === 'llm');
  const mcpServers = getStoredMcpServers(user?.tenant_id || 'default-tenant', toolsData, credentialsData);

  // Handle agent selection
  const handleSelectAgent = (agent: AgentDetail) => {
    setSelectedAgent(agent);
    setScreenView('inspector');
  };

  // Agent registered successfully callback
  const handleAgentRegistered = (newAgent: AgentDetail) => {
    setSelectedAgent(newAgent);
    setScreenView('inspector');
  };

  // Keep selectedAgent updated if cache refreshes
  const currentSelectedAgent = selectedAgent
    ? agents.find((a) => a.agent.id === selectedAgent.agent.id) || selectedAgent
    : agents[0] || null;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 overflow-y-auto">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Agent Registry</h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Configure and version governed agent workflows, tool permissions, and LLM providers.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-[#282828] space-x-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('agents');
              setScreenView('table');
            }}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'agents'
                ? 'border-blue-600 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 dark:text-[#8e8e93] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Agents</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'agents'
                  ? 'bg-slate-200 dark:bg-[#282828] text-slate-800 dark:text-gray-200'
                  : 'bg-slate-100 dark:bg-[#222222] text-slate-500 dark:text-gray-500'
              }`}
            >
              {agents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mcp')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'mcp'
                ? 'border-blue-600 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 dark:text-[#8e8e93] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>MCP Servers</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'mcp'
                  ? 'bg-slate-200 dark:bg-[#282828] text-slate-800 dark:text-gray-200'
                  : 'bg-slate-100 dark:bg-[#222222] text-slate-500 dark:text-gray-500'
              }`}
            >
              {mcpServers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('llm')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'llm'
                ? 'border-blue-600 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 dark:text-[#8e8e93] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>LLM Keys</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'llm'
                  ? 'bg-slate-200 dark:bg-[#282828] text-slate-800 dark:text-gray-200'
                  : 'bg-slate-100 dark:bg-[#222222] text-slate-500 dark:text-gray-500'
              }`}
            >
              {llmKeys.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Agents Content */}
      {activeTab === 'agents' && (
        <>
          {screenView === 'inspector' && currentSelectedAgent ? (
            <ConfigInspector
              key={currentSelectedAgent.agent.id}
              agentDetail={currentSelectedAgent}
              onBackToList={() => setScreenView('table')}
            />
          ) : (
            <AgentsTable
              agents={agents}
              isLoading={isLoadingAgents}
              error={agentsError as Error | null}
              onRefresh={() => refetchAgents()}
              onSelectAgent={handleSelectAgent}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              selectedAgentId={currentSelectedAgent?.agent.id}
            />
          )}
        </>
      )}

      {/* Tab 2: MCP Servers Content */}
      {activeTab === 'mcp' && <McpServersTab />}

      {/* Tab 3: LLM Keys Content */}
      {activeTab === 'llm' && <LlmKeysTab />}

      {/* Register Agent Modal */}
      <RegisterAgentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleAgentRegistered}
      />
    </main>
  );
};
