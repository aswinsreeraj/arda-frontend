import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import { orgApi } from './orgApi';
import type { MemberStatus, OrgAdminSection, TenantMember, TenantRole } from './types';
import { PeopleTable } from './components/PeopleTable';
import { InvitePersonModal } from './components/InvitePersonModal';
import { SSOTab } from './components/SSOTab';
import { ApiKeysTab } from './components/ApiKeysTab';
import { PlanUsageTab } from './components/PlanUsageTab';
import { UserPlus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrgPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const tenantId = user?.tenant_id || '416a2492-7e2c-484d-972d-c88d95a89b7a';

  // Navigation section
  const [activeSection, setActiveSection] = useState<OrgAdminSection>('people');

  // People filters
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Fetch members
  const {
    data: members = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tenant-members', tenantId],
    queryFn: ({ signal }) => orgApi.fetchMembers(tenantId, user?.id, signal),
    staleTime: 15000,
  });

  // Fetch API keys
  const { data: apiKeys = [] } = useQuery({
    queryKey: ['tenant-api-keys', tenantId],
    queryFn: () => orgApi.fetchApiKeys(tenantId),
    staleTime: 30000,
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ member, newRole }: { member: TenantMember; newRole: TenantRole }) =>
      orgApi.updateMember(tenantId, member.user_id, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ member, newStatus }: { member: TenantMember; newStatus: MemberStatus }) =>
      orgApi.updateMember(tenantId, member.user_id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (member: TenantMember) =>
      orgApi.deleteMember(tenantId, member.user_id, member.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
    },
  });

  // Handle invite
  const handleInvite = async (email: string, role: TenantRole) => {
    await orgApi.inviteMember(tenantId, { email, role });
    await queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
  };

  // Counts
  const counts = useMemo(() => {
    let active = 0;
    let invited = 0;
    let disabled = 0;
    let admins = 0;

    for (const m of members) {
      if (m.status === 'active') active++;
      if (m.status === 'invited') invited++;
      if (m.status === 'disabled') disabled++;
      if (m.role === 'company_admin' && m.status === 'active') admins++;
    }

    return {
      all: members.length,
      active,
      invited,
      disabled,
      admins,
    };
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.display_name.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesRole = m.role.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole) return false;
      }

      return true;
    });
  }, [members, statusFilter, searchQuery]);

  return (
    <div className="flex flex-1 w-full max-w-[1720px] mx-auto min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-[#131313] text-slate-900 dark:text-[#f3f4f6]">
      {/* Left Sidebar */}
      <aside
        aria-label="Admin Navigation"
        className="w-56 shrink-0 py-6 px-4 border-r border-slate-200 dark:border-[#202020] bg-white dark:bg-[#131313] flex flex-col justify-between select-none"
        data-purpose="admin-sidebar"
      >
        <div className="space-y-6">
          {/* Section: Organization */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-[#666666] tracking-wider uppercase px-2 mb-2">
              Organization
            </h3>
            <ul className="space-y-0.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection('people')}
                  className={`w-full text-left flex items-center px-2.5 py-1.5 rounded-md transition-colors ${
                    activeSection === 'people'
                      ? 'bg-slate-100 dark:bg-[#222222] text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-[#2e2e2e]'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  People
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection('sso')}
                  className={`w-full text-left flex items-center px-2.5 py-1.5 rounded-md transition-colors ${
                    activeSection === 'sso'
                      ? 'bg-slate-100 dark:bg-[#222222] text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-[#2e2e2e]'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  Single sign-on
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection('api-keys')}
                  className={`w-full text-left flex items-center px-2.5 py-1.5 rounded-md transition-colors ${
                    activeSection === 'api-keys'
                      ? 'bg-slate-100 dark:bg-[#222222] text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-[#2e2e2e]'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  API keys
                </button>
              </li>
              <li>
                <Link
                  to="/audit"
                  className="w-full text-left flex items-center px-2.5 py-1.5 rounded-md text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  Audit log
                </Link>
              </li>
            </ul>
          </div>

          {/* Section: Billing */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-[#666666] tracking-wider uppercase px-2 mb-2">
              Billing
            </h3>
            <ul className="space-y-0.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection('plan')}
                  className={`w-full text-left flex items-center px-2.5 py-1.5 rounded-md transition-colors ${
                    activeSection === 'plan'
                      ? 'bg-slate-100 dark:bg-[#222222] text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-[#2e2e2e]'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  Plan & usage
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection('invoices')}
                  className={`w-full text-left flex items-center px-2.5 py-1.5 rounded-md transition-colors ${
                    activeSection === 'invoices'
                      ? 'bg-slate-100 dark:bg-[#222222] text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-[#2e2e2e]'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  Invoices
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 py-7 px-8 max-w-6xl">
        {/* PEOPLE TAB */}
        {activeSection === 'people' && (
          <div data-purpose="people-management">
            {/* Title & Description Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Team Members</h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  Manage members, assign roles, and control organization access.
                </p>
                <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono mt-2 flex items-center space-x-2">
                  <span>{counts.all} members</span>
                  <span>·</span>
                  <span>{counts.admins} active admins</span>
                </div>
              </div>

              {/* Invite Person Action Trigger */}
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-xs transition-all self-start shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span>Invite person</span>
              </button>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              {/* Status Tabs */}
              <div className="flex items-center space-x-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-[#242424] text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-[#333333] shadow-xs'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span>All</span>
                  <span className="text-slate-400 dark:text-[#888888] text-[11px]">{counts.all}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                    statusFilter === 'active'
                      ? 'bg-white dark:bg-[#242424] text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-[#333333] shadow-xs'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span>Active</span>
                  <span className="text-slate-400 dark:text-[#666666] text-[11px]">{counts.active}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('invited')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                    statusFilter === 'invited'
                      ? 'bg-white dark:bg-[#242424] text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-[#333333] shadow-xs'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span>Invited</span>
                  <span className="text-slate-400 dark:text-[#666666] text-[11px]">{counts.invited}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('disabled')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                    statusFilter === 'disabled'
                      ? 'bg-white dark:bg-[#242424] text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-[#333333] shadow-xs'
                      : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span>Disabled</span>
                  <span className="text-slate-400 dark:text-[#666666] text-[11px]">{counts.disabled}</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400 dark:text-[#666666]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or email"
                  className="w-full bg-white dark:bg-[#171717] border border-slate-300 dark:border-[#2b2b2b] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#555555] rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* People Table */}
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-500 dark:text-neutral-500 border border-slate-200 dark:border-[#262626] rounded-md bg-white dark:bg-[#161616] flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400 dark:text-neutral-400" />
                <span>Loading team directory...</span>
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-xs text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 rounded-md bg-rose-50 dark:bg-rose-950/20 space-y-2">
                <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 mx-auto" />
                <div className="font-semibold">Unable to load team members</div>
                <p className="text-rose-500/80 dark:text-rose-400/80 text-[11px]">
                  {error instanceof Error ? error.message : 'Network error'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs"
                >
                  Retry
                </button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 dark:text-neutral-500 border border-slate-200 dark:border-[#262626] rounded-md bg-white dark:bg-[#161616]">
                No members found matching your filter criteria.
              </div>
            ) : (
              <PeopleTable
                members={filteredMembers}
                onUpdateRole={(member, newRole) => updateRoleMutation.mutateAsync({ member, newRole })}
                onUpdateStatus={(member, newStatus) =>
                  updateStatusMutation.mutateAsync({ member, newStatus })
                }
                onDeleteMember={(member) => deleteMemberMutation.mutateAsync(member)}
              />
            )}
          </div>
        )}

        {/* SSO TAB */}
        {activeSection === 'sso' && <SSOTab onSave={(cfg) => orgApi.saveSSOConfig(tenantId, cfg)} />}

        {/* API KEYS TAB */}
        {activeSection === 'api-keys' && <ApiKeysTab initialKeys={apiKeys} />}

        {/* PLAN & INVOICES TAB */}
        {(activeSection === 'plan' || activeSection === 'invoices') && (
          <PlanUsageTab memberCount={counts.active} />
        )}
      </main>

      {/* Invite Person Modal */}
      <InvitePersonModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
};
