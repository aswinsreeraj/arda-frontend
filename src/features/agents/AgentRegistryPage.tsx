import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentApi } from './agentApi';
import type { AgentDetail } from './types';
import { AgentsTable } from './components/AgentsTable';
import { ConfigInspector } from './components/ConfigInspector';
import { RegisterAgentModal } from './components/RegisterAgentModal';
import { McpServersTab } from './components/McpServersTab';
import { LlmKeysTab } from './components/LlmKeysTab';

type TabType = 'agents' | 'mcp' | 'llm';
type ScreenViewType = 'table' | 'inspector';

export const AgentRegistryPage: React.FC = () => {
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

  // Handle agent selection
  const handleSelectAgent = (agent: AgentDetail) => {
    setSelectedAgent(agent);
    setScreenView('inspector');
  };

  // Switch to inspector view directly
  const handleSwitchToInspector = () => {
    if (!selectedAgent && agents.length > 0) {
      setSelectedAgent(agents[0]);
    }
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
      {/* View Switcher & Title */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Agent Registry</h1>
          <div className="flex items-center bg-[#1c1c1c] p-1 rounded-lg border border-[#2e2e2e] text-xs">
            <span className="text-[#9ca3af] px-2">Screen View:</span>
            <button
              type="button"
              onClick={() => setScreenView('table')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                screenView === 'table'
                  ? 'bg-[#2c2c2c] text-white shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Registry Table
            </button>
            <button
              type="button"
              onClick={handleSwitchToInspector}
              className={`px-2.5 py-1 rounded font-medium transition ${
                screenView === 'inspector'
                  ? 'bg-[#2c2c2c] text-white shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Config Inspector
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#282828] space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('agents')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'agents'
                ? 'border-white text-white'
                : 'border-transparent text-[#8e8e93] hover:text-white'
            }`}
          >
            <span>Agents</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'agents'
                  ? 'bg-[#282828] text-gray-200'
                  : 'bg-[#222222] text-gray-500'
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
                ? 'border-white text-white'
                : 'border-transparent text-[#8e8e93] hover:text-white'
            }`}
          >
            <span>MCP Servers</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'mcp'
                  ? 'bg-[#282828] text-gray-200'
                  : 'bg-[#222222] text-gray-500'
              }`}
            >
              {toolsData.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('llm')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'llm'
                ? 'border-white text-white'
                : 'border-transparent text-[#8e8e93] hover:text-white'
            }`}
          >
            <span>LLM Keys</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'llm'
                  ? 'bg-[#282828] text-gray-200'
                  : 'bg-[#222222] text-gray-500'
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
