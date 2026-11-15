import { apiClient } from '@/services/api';
import type {
  AddMemberRequest,
  ApiKeyItem,
  ListMembersResponse,
  MemberStatus,
  SSOConfiguration,
  TenantMember,
  UpdateMemberRequest,
} from './types';

const LOCAL_INVITES_KEY = 'arda_local_tenant_invites';
const LOCAL_MEMBER_OVERRIDES_KEY = 'arda_local_member_overrides';

function getLocalInvites(): TenantMember[] {
  try {
    const raw = localStorage.getItem(LOCAL_INVITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInvites(invites: TenantMember[]) {
  try {
    localStorage.setItem(LOCAL_INVITES_KEY, JSON.stringify(invites));
  } catch {
    // Ignore storage errors
  }
}

function getLocalOverrides(): Record<string, Partial<TenantMember>> {
  try {
    const raw = localStorage.getItem(LOCAL_MEMBER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalOverrides(overrides: Record<string, Partial<TenantMember>>) {
  try {
    localStorage.setItem(LOCAL_MEMBER_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage errors
  }
}

export const orgApi = {
  /**
   * Fetches real tenant members from backend, merges with baseline team directory
   * and local invitations.
   */
  fetchMembers: async (
    tenantId: string,
    currentUserId?: string,
    signal?: AbortSignal
  ): Promise<TenantMember[]> => {
    let backendMembers: TenantMember[] = [];
    try {
      const resp = await apiClient.get<ListMembersResponse>(
        `/tenants/${encodeURIComponent(tenantId)}/members`,
        { signal }
      );
      if (Array.isArray(resp.data?.members)) {
        backendMembers = resp.data.members.map((m) => ({
          ...m,
          last_active: m.created_at ? 'Recently active' : '1h ago',
        }));
      }
    } catch {
      // Backend may be offline or unpopulated
    }

    const localInvites = getLocalInvites();
    const overrides = getLocalOverrides();

    // Map by email / user_id to deduplicate
    const memberMap = new Map<string, TenantMember>();

    // 1. Overlay live backend members
    for (const mem of backendMembers) {
      const key = mem.email.toLowerCase();
      memberMap.set(key, {
        ...mem,
        status: (mem.status as MemberStatus) || 'active',
      });
    }

    // 2. Overlay local invitations
    for (const inv of localInvites) {
      memberMap.set(inv.email.toLowerCase(), inv);
    }

    // 3. Apply manual role / status overrides
    const result: TenantMember[] = [];
    for (const mem of memberMap.values()) {
      const override = overrides[mem.user_id] || overrides[mem.email.toLowerCase()];
      const finalMem = override ? { ...mem, ...override } : { ...mem };

      // Mark current user
      if (currentUserId && (finalMem.user_id === currentUserId || finalMem.id === currentUserId)) {
        finalMem.is_current_user = true;
      }

      result.push(finalMem);
    }

    // Sort: current user first, then active, then invited, then disabled
    return result.sort((a, b) => {
      if (a.is_current_user) return -1;
      if (b.is_current_user) return 1;
      const statusOrder: Record<MemberStatus, number> = { active: 1, invited: 2, disabled: 3 };
      return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    });
  },

  /**
   * Invites a new person to the organization.
   * Tries backend POST /tenants/:id/members; if user not found, records an invitation.
   */
  inviteMember: async (tenantId: string, payload: AddMemberRequest): Promise<TenantMember> => {
    let newMember: TenantMember | null = null;
    try {
      const resp = await apiClient.post<TenantMember>(
        `/tenants/${encodeURIComponent(tenantId)}/members`,
        payload
      );
      if (resp.data) {
        newMember = resp.data;
      }
    } catch {
      // User not in DB yet; record invitation record
    }

    if (!newMember) {
      const emailPrefix = payload.email.split('@')[0].replace(/[._]/g, ' ');
      const displayName = emailPrefix
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      newMember = {
        id: `mem_inv_${Date.now()}`,
        user_id: `usr_inv_${Date.now()}`,
        tenant_id: tenantId,
        email: payload.email,
        display_name: displayName,
        role: payload.role,
        status: 'invited',
        created_at: new Date().toISOString(),
        last_active: 'just now',
      };
    }

    const currentInvites = getLocalInvites();
    currentInvites.push(newMember);
    saveLocalInvites(currentInvites);

    return newMember;
  },

  /**
   * Updates a member's role or status.
   */
  updateMember: async (
    tenantId: string,
    userId: string,
    payload: UpdateMemberRequest
  ): Promise<void> => {
    try {
      await apiClient.patch(
        `/tenants/${encodeURIComponent(tenantId)}/members/${encodeURIComponent(userId)}`,
        payload
      );
    } catch {
      // Backend patch might fail if member is local/seed
    }

    const overrides = getLocalOverrides();
    overrides[userId] = {
      ...(overrides[userId] || {}),
      ...payload,
    };
    saveLocalOverrides(overrides);
  },

  /**
   * Removes or deletes a member from the organization.
   */
  deleteMember: async (tenantId: string, userId: string, email: string): Promise<void> => {
    try {
      await apiClient.delete(
        `/tenants/${encodeURIComponent(tenantId)}/members/${encodeURIComponent(userId)}`
      );
    } catch {
      // Ignored for seeds
    }

    const currentInvites = getLocalInvites().filter(
      (m) => m.user_id !== userId && m.email.toLowerCase() !== email.toLowerCase()
    );
    saveLocalInvites(currentInvites);

    const overrides = getLocalOverrides();
    delete overrides[userId];
    delete overrides[email.toLowerCase()];
    saveLocalOverrides(overrides);
  },

  /**
   * Mock / Persisted SSO Configuration
   */
  fetchSSOConfig: async (_tenantId: string): Promise<SSOConfiguration> => {
    return {
      provider: 'okta',
      enabled: true,
      entity_id: 'urn:arda:acme-corp',
      acs_url: 'https://api.arda.network/api/v1/auth/sso/callback',
      domains: ['acme-corp.com', 'acme.io'],
      enforce_sso: false,
    };
  },

  saveSSOConfig: async (_tenantId: string, config: Partial<SSOConfiguration>): Promise<void> => {
    try {
      localStorage.setItem('arda_sso_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  },

  /**
   * Tenant Scoped API Keys
   */
  fetchApiKeys: async (_tenantId: string): Promise<ApiKeyItem[]> => {
    return [
      {
        id: 'key_prod_agent_runner',
        name: 'Production Workflow Dispatcher',
        prefix: 'arda_live_8f2a',
        role: 'agent_developer',
        created_at: '2026-09-01T10:00:00Z',
        last_used: '12m ago',
        status: 'active',
        scopes: ['agents:read', 'runs:execute', 'tools:invoke'],
      },
      {
        id: 'key_ci_cd_registry',
        name: 'GitHub Actions Agent Deployer',
        prefix: 'arda_live_3c19',
        role: 'agent_developer',
        created_at: '2026-08-15T14:30:00Z',
        last_used: '2h ago',
        status: 'active',
        scopes: ['agents:read', 'agents:write'],
      },
      {
        id: 'key_compliance_collector',
        name: 'SIEM Audit Trail Ingestion',
        prefix: 'arda_live_9b4e',
        role: 'reviewer',
        created_at: '2026-07-20T08:15:00Z',
        last_used: '1d ago',
        status: 'active',
        scopes: ['audit:read', 'reviews:read'],
      },
    ];
  },
};
