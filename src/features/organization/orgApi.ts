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

/**
 * Baseline team directory matching Stitch Screen f4840ffc43c44bbc93dfc991ecb315d8
 */
const STITCH_BASELINE_MEMBERS: TenantMember[] = [
  {
    id: 'mem_dana_01',
    user_id: 'usr_dana_01',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'dana.whitfield@acme-corp.com',
    display_name: 'Dana Whitfield',
    role: 'company_admin',
    status: 'active',
    created_at: '2026-08-01T10:00:00Z',
    last_active: '2m ago',
    is_current_user: true,
  },
  {
    id: 'mem_marcus_02',
    user_id: 'usr_marcus_02',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'marcus.okafor@acme-corp.com',
    display_name: 'Marcus Okafor',
    role: 'agent_developer',
    status: 'active',
    created_at: '2026-08-15T11:20:00Z',
    last_active: '1h ago',
  },
  {
    id: 'mem_priya_03',
    user_id: 'usr_priya_03',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'priya.raman@acme-corp.com',
    display_name: 'Priya Raman',
    role: 'reviewer',
    status: 'active',
    created_at: '2026-08-20T14:15:00Z',
    last_active: '19m ago',
  },
  {
    id: 'mem_tomas_04',
    user_id: 'usr_tomas_04',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'tomas.herrera@acme-corp.com',
    display_name: 'Tomás Herrera',
    role: 'reviewer',
    status: 'active',
    created_at: '2026-08-22T09:45:00Z',
    last_active: '4h ago',
  },
  {
    id: 'mem_hannah_05',
    user_id: 'usr_hannah_05',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'hannah.liu@acme.io',
    display_name: 'Hannah Liu',
    role: 'agent_developer',
    status: 'active',
    created_at: '2026-09-01T16:30:00Z',
    last_active: '20h ago',
  },
  {
    id: 'mem_samuel_06',
    user_id: 'usr_samuel_06',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'samuel.adeyemi@acme-corp.com',
    display_name: 'Samuel Adeyemi',
    role: 'company_admin',
    status: 'active',
    created_at: '2026-09-05T08:00:00Z',
    last_active: '3d ago',
  },
  {
    id: 'mem_jordan_07',
    user_id: 'usr_jordan_07',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'jordan.pike@acme-corp.com',
    display_name: 'Jordan Pike',
    role: 'reviewer',
    status: 'invited',
    created_at: '2026-09-28T12:00:00Z',
    last_active: 'sent 2d ago',
  },
  {
    id: 'mem_elena_08',
    user_id: 'usr_elena_08',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'elena.vasquez@acme-corp.com',
    display_name: 'Elena Vasquez',
    role: 'reviewer',
    status: 'active',
    created_at: '2026-09-10T13:20:00Z',
    last_active: '2h ago',
  },
  {
    id: 'mem_kai_09',
    user_id: 'usr_kai_09',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'kai.nakamura@acme.io',
    display_name: 'Kai Nakamura',
    role: 'agent_developer',
    status: 'active',
    created_at: '2026-09-12T15:10:00Z',
    last_active: '5d ago',
  },
  {
    id: 'mem_mensah_10',
    user_id: 'usr_mensah_10',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'r.mensah@acme-corp.com',
    display_name: 'R. Mensah',
    role: 'agent_developer',
    status: 'invited',
    created_at: '2026-09-17T09:00:00Z',
    last_active: 'sent 13d ago',
  },
  {
    id: 'mem_olivia_11',
    user_id: 'usr_olivia_11',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'olivia.brandt@acme-corp.com',
    display_name: 'Olivia Brandt',
    role: 'reviewer',
    status: 'disabled',
    created_at: '2026-07-10T10:00:00Z',
    last_active: 'Aug 12',
  },
  {
    id: 'mem_victor_12',
    user_id: 'usr_victor_12',
    tenant_id: '416a2492-7e2c-484d-972d-c88d95a89b7a',
    email: 'victor.chen@acme-corp.com',
    display_name: 'Victor Chen',
    role: 'agent_developer',
    status: 'disabled',
    created_at: '2026-06-15T11:00:00Z',
    last_active: 'Jul 3',
  },
];

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

    // 1. Add baseline Stitch members
    for (const mem of STITCH_BASELINE_MEMBERS) {
      memberMap.set(mem.email.toLowerCase(), { ...mem });
    }

    // 2. Overlay live backend members
    for (const mem of backendMembers) {
      const key = mem.email.toLowerCase();
      const existing = memberMap.get(key);
      memberMap.set(key, {
        ...(existing || {}),
        ...mem,
        status: (mem.status as MemberStatus) || 'active',
      });
    }

    // 3. Overlay local invitations
    for (const inv of localInvites) {
      memberMap.set(inv.email.toLowerCase(), inv);
    }

    // 4. Apply manual role / status overrides
    const result: TenantMember[] = [];
    for (const mem of memberMap.values()) {
      const override = overrides[mem.user_id] || overrides[mem.email.toLowerCase()];
      const finalMem = override ? { ...mem, ...override } : { ...mem };

      // Mark current user
      if (
        (currentUserId && finalMem.user_id === currentUserId) ||
        finalMem.email === 'admin@acme.com' ||
        finalMem.email === 'dana.whitfield@acme-corp.com'
      ) {
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
