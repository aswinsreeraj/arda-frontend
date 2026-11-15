import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  RefreshCw,
  AlertCircle,
  Activity,
  ChevronDown,
} from 'lucide-react';
import type { RunDetail, RunStatus } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface RunsTableProps {
  runs: RunDetail[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onSelectRun: (run: RunDetail) => void;
  onOpenDispatcherModal: () => void;
  selectedRunId?: string | null;
}

export const RunsTable: React.FC<RunsTableProps> = ({
  runs,
  isLoading,
  error,
  onRefresh,
  onSelectRun,
  onOpenDispatcherModal,
  selectedRunId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');

  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (modeFilter !== 'all' && r.mode !== modeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        r.id.toLowerCase().includes(q) ||
        r.workflow_id.toLowerCase().includes(q) ||
        r.agent_name.toLowerCase().includes(q)
      );
    });
  }, [runs, searchQuery, statusFilter, modeFilter]);

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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border bg-blue-950/40 text-blue-400 border-blue-800/50">
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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' +
        d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Run or Workflow ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-md text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#181818] border border-[#2e2e2e] text-xs text-gray-300 rounded-md pl-2.5 pr-7 py-1.5 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="running">Running</option>
              <option value="success">Success</option>
              <option value="escalated">Escalated</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-[#181818] border border-[#2e2e2e] text-xs text-gray-300 rounded-md pl-2.5 pr-7 py-1.5 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All modes</option>
              <option value="durable">Durable (Temporal)</option>
              <option value="realtime">Realtime (Sync)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh runs"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenDispatcherModal}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            New Run
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Failed to load execution runs: {error.message}</span>
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
            <tr className="border-b border-[#262626] text-xs uppercase tracking-wider text-[#929292] font-semibold bg-[#161616]">
              <th className="py-3 px-4">Run & Workflow ID</th>
              <th className="py-3 px-4">Agent</th>
              <th className="py-3 px-4">Mode</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 font-mono">Duration</th>
              <th className="py-3 px-4">Triggered At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {isLoading && runs.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#282828] rounded w-44 mb-1" />
                    <div className="h-3 bg-[#202020] rounded w-24" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-32" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-16" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-20" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-12" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#202020] rounded w-28" />
                  </td>
                </tr>
              ))
            ) : filteredRuns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-300 font-medium">No execution runs found</p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `No runs match your filter criteria.`
                      : 'Trigger an execution run with your registered agents to inspect distributed traces.'}
                  </p>
                  {!searchQuery && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenDispatcherModal}
                        icon={<Play className="w-3.5 h-3.5 fill-current" />}
                      >
                        Execute first run
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredRuns.map((run) => {
                const isSelected = selectedRunId === run.id;
                return (
                  <tr
                    key={run.id}
                    onClick={() => onSelectRun(run)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#222938] hover:bg-[#273042]'
                        : 'hover:bg-[#1d1d1d]'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-medium flex items-center gap-1.5 text-xs sm:text-sm">
                        <span>{run.id.slice(0, 16)}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                        {run.workflow_id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white text-xs sm:text-sm">{run.agent_name}</div>
                      <div className="text-xs font-mono text-gray-400 mt-0.5">
                        v{run.agent_version_number || 1}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={run.mode === 'durable' ? 'durable' : 'neutral'}>
                        {run.mode}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(run.status)}</td>

                    <td className="py-3.5 px-4 font-mono text-gray-200 text-xs sm:text-sm">
                      {run.duration_ms}ms
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                      {formatDate(run.created_at)}
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
