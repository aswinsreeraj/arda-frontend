import React, { useState, useMemo } from 'react';
import { Search, Plus, AlertCircle, RefreshCw, Bot } from 'lucide-react';
import type { AgentDetail } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AgentsTableProps {
  agents: AgentDetail[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onSelectAgent: (agent: AgentDetail) => void;
  onOpenRegisterModal: () => void;
  selectedAgentId?: string | null;
}

export const AgentsTable: React.FC<AgentsTableProps> = ({
  agents,
  isLoading,
  error,
  onRefresh,
  onSelectAgent,
  onOpenRegisterModal,
  selectedAgentId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const q = searchQuery.toLowerCase().trim();
    return agents.filter(
      (item) =>
        item.agent.name.toLowerCase().includes(q) ||
        item.agent.id.toLowerCase().includes(q)
    );
  }, [agents, searchQuery]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Filter by name or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-md text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh agents"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenRegisterModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Register agent
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Failed to load agents: {error.message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      )}

      {/* Table Container */}
      <div className="border border-[#262626] rounded-lg overflow-hidden bg-[#181818] shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-xs uppercase tracking-wider text-[#828282] font-semibold bg-[#161616]">
              <th className="py-3 px-4">Agent</th>
              <th className="py-3 px-4">Execution</th>
              <th className="py-3 px-4">Active version</th>
              <th className="py-3 px-4 font-mono">Threshold τ</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424] text-xs sm:text-sm">
            {isLoading && agents.length === 0 ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#282828] rounded w-36 mb-1.5" />
                    <div className="h-3 bg-[#202020] rounded w-48" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 bg-[#252525] rounded w-16" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-10" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-12" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 bg-[#252525] rounded w-20" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#202020] rounded w-24" />
                  </td>
                </tr>
              ))
            ) : filteredAgents.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Bot className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-300 font-medium">No agents found</p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `No registered agents match "${searchQuery}".`
                      : 'No agents registered yet for this tenant. Register your first agent to begin.'}
                  </p>
                  {!searchQuery && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenRegisterModal}
                        icon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Register first agent
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              // Agents Rows
              filteredAgents.map((item) => {
                const isSelected = selectedAgentId === item.agent.id;
                const activeVersion = item.latest_published_version;
                const draftVersion = item.draft_version;
                const currentConfig =
                  activeVersion?.configuration || draftVersion?.configuration;
                const isPublished = Boolean(activeVersion);

                const executionMode = currentConfig?.execution_mode || 'supervised';
                const threshold = currentConfig?.reliability_threshold != null
                  ? currentConfig.reliability_threshold.toFixed(2)
                  : '—';

                return (
                  <tr
                    key={item.agent.id}
                    onClick={() => onSelectAgent(item)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#222938] hover:bg-[#273042]'
                        : 'hover:bg-[#1d1d1d]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white text-sm flex items-center gap-1.5">
                        <span>{item.agent.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-[#71717a]">
                        {item.agent.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={executionMode === 'autonomous' ? 'neutral' : 'durable'}
                      >
                        {executionMode}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      {activeVersion ? `v${activeVersion.version_number}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-200">
                      {threshold}
                    </td>
                    <td className="py-3.5 px-4">
                      {isPublished ? (
                        <Badge variant="healthy" dot>
                          published
                        </Badge>
                      ) : (
                        <Badge variant="review" dot>
                          draft
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                      {formatDate(item.agent.updated_at || item.agent.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
