import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { runsApi } from './runsApi';
import { useRunsStore } from './runsStore';
import type { RunDetail } from './types';
import { RunsTable } from './components/RunsTable';
import { RunInspector } from './components/RunInspector';
import { RunDispatcherModal } from './components/RunDispatcherModal';
import { useAuthStore } from '@/features/auth/authStore';
import { TEMPORAL_UI_BASE_URL } from '@/services/api';

type ViewMode = 'table' | 'inspector';

export const RunsPage: React.FC = () => {
  const { runs: storeRuns, selectedRunId, setSelectedRunId, setRuns } = useRunsStore();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isDispatcherOpen, setIsDispatcherOpen] = useState(false);

  const temporalOverviewUrl = user?.tenant_id
    ? `${TEMPORAL_UI_BASE_URL}/namespaces/default/workflows?query=${encodeURIComponent(`WorkflowId STARTS_WITH "tenant-${user.tenant_id}"`)}`
    : `${TEMPORAL_UI_BASE_URL}/namespaces/default/workflows`;

  // Query real runs from backend & store, polling dynamically if any run is in 'running' state
  const {
    data: fetchedRuns = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['runs'],
    queryFn: ({ signal }) => runsApi.fetchRuns(signal),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasRunning = data?.some((r) => r.status === 'running' || r.status === 'accepted');
      return hasRunning ? 3000 : 15000;
    },
  });

  // Keep store in sync with fetched runs if store has fewer
  React.useEffect(() => {
    if (fetchedRuns.length > 0 && storeRuns.length === 0) {
      setRuns(fetchedRuns);
    }
  }, [fetchedRuns, storeRuns.length, setRuns]);

  // Combined list of runs
  const allRuns = fetchedRuns.length > 0 ? fetchedRuns : storeRuns;

  const selectedRun = allRuns.find((r) => r.id === selectedRunId) || allRuns[0] || null;

  const handleSelectRun = (run: RunDetail) => {
    setSelectedRunId(run.id);
    setViewMode('inspector');
  };

  const handleRunCreated = (newRun: RunDetail) => {
    setSelectedRunId(newRun.id);
    setViewMode('inspector');
  };

  // Metrics
  const totalCount = allRuns.length;
  const runningCount = allRuns.filter((r) => r.status === 'running' || r.status === 'accepted').length;
  const escalatedCount = allRuns.filter((r) => r.status === 'escalated').length;
  const successCount = allRuns.filter((r) => r.status === 'success').length;
  const passRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(0) : '—';

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 overflow-y-auto">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Execution Traces & Runs</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Trace distributed agent execution lifecycles, Temporal workflow histories, and confidence gates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={temporalOverviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2e2e2e] bg-[#1a1a1a] hover:bg-[#242424] text-xs font-medium text-gray-200 transition shadow-xs"
              title={user?.tenant_id ? `Inspect workflows scoped to tenant ${user.tenant_id}` : 'Inspect workflows in Temporal'}
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Temporal Dashboard</span>
            </a>

            <div className="flex items-center bg-[#1c1c1c] p-1 rounded-lg border border-[#2e2e2e] text-xs">
              <span className="text-[#9ca3af] px-2">View:</span>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  viewMode === 'table'
                    ? 'bg-[#2c2c2c] text-white shadow-xs'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                Runs Table
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedRunId && allRuns.length > 0) {
                    setSelectedRunId(allRuns[0].id);
                  }
                  setViewMode('inspector');
                }}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  viewMode === 'inspector'
                    ? 'bg-[#2c2c2c] text-white shadow-xs'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                Run Inspector
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#181818] border border-[#262626] rounded-lg">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Total Invocations
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">{totalCount}</div>
          </div>

          <div className="p-3.5 bg-[#181818] border border-[#262626] rounded-lg">
            <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
              Active / Running
            </div>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1">{runningCount}</div>
          </div>

          <div className="p-3.5 bg-[#181818] border border-[#262626] rounded-lg">
            <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">
              Autonomous Success
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {successCount} <span className="text-xs font-normal text-emerald-400/80">({passRate}%)</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#181818] border border-[#262626] rounded-lg">
            <div className="text-xs text-amber-400 uppercase tracking-wider font-semibold">
              Human Escalated
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">{escalatedCount}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'inspector' && selectedRun ? (
        <RunInspector run={selectedRun} onBackToList={() => setViewMode('table')} />
      ) : (
        <RunsTable
          runs={allRuns}
          isLoading={isLoading || isFetching}
          error={error as Error | null}
          onRefresh={() => refetch()}
          onSelectRun={handleSelectRun}
          onOpenDispatcherModal={() => setIsDispatcherOpen(true)}
          selectedRunId={selectedRun?.id}
        />
      )}

      {/* Dispatcher Modal */}
      <RunDispatcherModal
        isOpen={isDispatcherOpen}
        onClose={() => setIsDispatcherOpen(false)}
        onRunCreated={handleRunCreated}
      />
    </main>
  );
};
