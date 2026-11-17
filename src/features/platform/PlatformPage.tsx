import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import { platformApi } from './platformApi';
import type {
  PlatformConfigItem,
  PlatformTab,
  PlatformTenant,
  TenantStatus,
  TenantTier,
} from './types';
import { TenantsTable } from './components/TenantsTable';
import { PlatformHealthTab } from './components/PlatformHealthTab';
import { PlatformConfigTab } from './components/PlatformConfigTab';
import { OperatorsTab } from './components/OperatorsTab';
import { PlatformAuditLogTab } from './components/PlatformAuditLogTab';
import { Search, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export const PlatformPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<PlatformTab>('tenants');
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const {
    data: tenants = [],
    isLoading: isTenantsLoading,
    isError: isTenantsError,
    error: tenantsError,
    refetch: refetchTenants,
  } = useQuery({
    queryKey: ['platform-tenants'],
    queryFn: () => platformApi.fetchTenants(),
    staleTime: 15000,
  });

  const { data: healthData } = useQuery({
    queryKey: ['platform-health'],
    queryFn: () => platformApi.fetchPlatformHealth(),
    staleTime: 30000,
  });

  const { data: activityEvents = [] } = useQuery({
    queryKey: ['platform-activity'],
    queryFn: () => platformApi.fetchSystemActivity(),
    staleTime: 15000,
  });

  const { data: platformConfigs = [] } = useQuery({
    queryKey: ['platform-config'],
    queryFn: () => platformApi.fetchPlatformConfig(),
    staleTime: 60000,
  });

  const { data: operators = [] } = useQuery({
    queryKey: ['platform-operators'],
    queryFn: () => platformApi.fetchOperators(),
    staleTime: 15000,
  });

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: ({ tenant, newStatus }: { tenant: PlatformTenant; newStatus: TenantStatus }) =>
      platformApi.updateTenantStatus(tenant.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform-activity'] });
      queryClient.invalidateQueries({ queryKey: ['platform-health'] });
    },
  });

  const changeTierMutation = useMutation({
    mutationFn: ({ tenant, newTier }: { tenant: PlatformTenant; newTier: TenantTier }) =>
      platformApi.updateTenantTier(tenant.id, newTier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform-activity'] });
    },
  });

  const addSuperAdminMutation = useMutation({
    mutationFn: (data: { email: string; display_name: string; password: string }) =>
      platformApi.createSuperAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-operators'] });
      queryClient.invalidateQueries({ queryKey: ['platform-activity'] });
    },
  });

  const handleSaveConfigs = async (newConfigs: PlatformConfigItem[]) => {
    await platformApi.savePlatformConfig(newConfigs);
    await queryClient.invalidateQueries({ queryKey: ['platform-config'] });
    await queryClient.invalidateQueries({ queryKey: ['platform-activity'] });
  };

  // Stats
  const stats = useMemo(() => {
    let active = 0;
    let suspended = 0;
    for (const t of tenants) {
      if (t.status === 'active') active++;
      if (t.status === 'suspended') suspended++;
    }
    return {
      total: tenants.length,
      active,
      suspended,
    };
  }, [tenants]);

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;
    const q = searchQuery.toLowerCase();
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.slug && t.slug.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q)
    );
  }, [tenants, searchQuery]);

  return (
    <div
      className="min-h-screen bg-[#121212] text-[#ededed] flex antialiased select-none font-sans"
      style={{ backgroundColor: '#131313', color: '#f3f4f6' }}
    >
      {/* Left Sidebar */}
      <aside
        className="w-[240px] shrink-0 border-r border-[#262626] bg-[#121212] flex flex-col justify-between p-4 min-h-screen text-[13px]"
        data-purpose="platform-operations-sidebar"
      >
        <div className="space-y-6">
          {/* App Brand Logo & Title */}
          <div className="flex items-center space-x-2.5">
            <div className="flex flex-col">
              <span className="font-bold text-[15px] leading-tight text-white tracking-wider font-mono">
                ΛRDΛ
              </span>
              <span className="text-[11px] text-[#71717a] font-mono leading-none mt-0.5">
                platform operations
              </span>
            </div>
          </div>

          {/* Environment and Region metadata */}
          <div className="space-y-1 text-[11px] font-mono border-t border-b border-[#212121] py-2.5">
            <div className="flex justify-between items-center text-[#737373]">
              <span>env</span>
              <span className="text-[#d4d4d4]">production</span>
            </div>
            <div className="flex justify-between items-center text-[#737373]">
              <span>region</span>
              <span className="text-[#d4d4d4]">us-east-1</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" data-purpose="sidebar-nav">
            <button
              type="button"
              onClick={() => setActiveTab('tenants')}
              className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded font-medium text-[13px] transition-colors cursor-pointer ${
                activeTab === 'tenants'
                  ? 'bg-[#1e1e1e] text-white'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#d4d4d4]'
              }`}
            >
              <span>Tenants</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('health')}
              className={`w-full text-left flex items-center px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'health'
                  ? 'bg-[#1e1e1e] text-white font-medium'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#d4d4d4]'
              }`}
            >
              <span>Platform health</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`w-full text-left flex items-center px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-[#1e1e1e] text-white font-medium'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#d4d4d4]'
              }`}
            >
              <span>Platform config</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('operators')}
              className={`w-full text-left flex items-center px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'operators'
                  ? 'bg-[#1e1e1e] text-white font-medium'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#d4d4d4]'
              }`}
            >
              <span>Operators</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`w-full text-left flex items-center px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#1e1e1e] text-white font-medium'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#d4d4d4]'
              }`}
            >
              <span>Audit log</span>
            </button>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#d4d4d4] transition-colors group"
            >
              <span>Grafana</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </a>
          </nav>
        </div>

        {/* Sidebar Bottom: Operator identification */}
        <div
          className="pt-4 border-t border-[#212121] text-[11px] font-mono text-[#71717a] space-y-0.5"
          data-purpose="operator-identity"
        >
          <div className="text-[#a1a1aa] truncate font-sans">
            {user?.email || 'superadmin@arda.security'}
          </div>
          <div>role: super_admin</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-x-hidden">
        {/* TopBar */}
        <header
          className="h-14 border-b border-[#262626] px-8 flex items-center justify-between shrink-0"
          data-purpose="top-navigation-header"
        >
          <div className="flex items-center space-x-2 text-[13px] font-mono text-[#8b8b8b]">
            <span>platform</span>
            <span>/</span>
            <span className="text-[#d4d4d4] capitalize">
              {activeTab === 'health' ? 'Platform Health' : activeTab}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                refetchTenants();
                queryClient.invalidateQueries({ queryKey: ['platform-health'] });
                queryClient.invalidateQueries({ queryKey: ['platform-activity'] });
                queryClient.invalidateQueries({ queryKey: ['platform-operators'] });
                queryClient.invalidateQueries({ queryKey: ['platform-config'] });
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[12px] rounded-md bg-[#1c1c1c] border border-[#2b2b2b] text-[#a1a1aa] hover:text-white hover:bg-[#252525] transition cursor-pointer"
              type="button"
              title="Refresh Platform Telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
          {/* TAB: TENANTS */}
          {activeTab === 'tenants' && (
            <section data-purpose="tenants-management-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-tight">Tenants</h1>
                  <p className="text-[12px] text-[#737373] mt-0.5">
                    {stats.total} organizations ·{' '}
                    <span className="text-[#22c55e]">{stats.active} active</span> ·{' '}
                    <span className="text-[#ef4444]">{stats.suspended} suspended</span>
                  </p>
                </div>

                {/* Search box */}
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2b2b2b] text-[12px] rounded pl-8 pr-3 py-1.5 text-[#d4d4d4] placeholder-[#555] focus:outline-none focus:border-[#404040]"
                    placeholder="Name, slug, or org ID"
                    type="text"
                  />
                </div>
              </div>

              {isTenantsLoading ? (
                <div className="p-12 text-center text-xs text-neutral-500 border border-[#262626] rounded-md bg-[#161616] flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
                  <span>Loading platform organizations...</span>
                </div>
              ) : isTenantsError ? (
                <div className="p-8 text-center text-xs text-rose-300 border border-rose-900/40 rounded-md bg-rose-950/20 space-y-2">
                  <AlertCircle className="w-5 h-5 text-rose-400 mx-auto" />
                  <div className="font-semibold">Unable to load platform tenants</div>
                  <p className="text-rose-400/80 text-[11px]">
                    {tenantsError instanceof Error ? tenantsError.message : 'Network error'}
                  </p>
                  <button
                    onClick={() => refetchTenants()}
                    className="px-3 py-1.5 rounded bg-rose-900/50 hover:bg-rose-900 text-white text-xs border border-rose-700/50 cursor-pointer"
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <TenantsTable
                  tenants={filteredTenants}
                  onToggleStatus={(tenant, newStatus) =>
                    toggleStatusMutation.mutateAsync({ tenant, newStatus })
                  }
                  onChangeTier={(tenant, newTier) =>
                    changeTierMutation.mutateAsync({ tenant, newTier })
                  }
                />
              )}

              <p className="text-[11px] text-[#525252] mt-3">
                Tenant agent configurations, execution cases, and reliability metrics are isolated within each organization namespace.
              </p>
            </section>
          )}

          {/* TAB: PLATFORM HEALTH */}
          {activeTab === 'health' && healthData && (
            <PlatformHealthTab
              metrics={healthData.metrics}
              services={healthData.services}
              stats={healthData.stats}
            />
          )}

          {/* TAB: CONFIG */}
          {activeTab === 'config' && (
            <PlatformConfigTab
              initialConfigs={platformConfigs}
              onSave={handleSaveConfigs}
            />
          )}

          {/* TAB: OPERATORS */}
          {activeTab === 'operators' && (
            <OperatorsTab
              operators={operators}
              onAddSuperAdmin={(data) => addSuperAdminMutation.mutateAsync(data)}
            />
          )}

          {/* TAB: AUDIT LOG */}
          {activeTab === 'audit' && (
            <PlatformAuditLogTab events={activityEvents} />
          )}
        </div>
      </main>
    </div>
  );
};
