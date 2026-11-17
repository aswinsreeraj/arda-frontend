import { apiClient } from '@/services/api';
import type {
  AddMemberRequest,
  ListMembersResponse,
  MemberStatus,
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

    // 1. Live backend members from PostgreSQL (active, disabled, and invited)
    for (const mem of backendMembers) {
      const key = mem.email.toLowerCase();
      memberMap.set(key, {
        ...mem,
        status: (mem.status as MemberStatus) || 'active',
      });
    }

    // 2. Fallback: only include local offline invitations if not returned by backend
    for (const inv of localInvites) {
      const key = inv.email.toLowerCase();
      if (!memberMap.has(key)) {
        memberMap.set(key, inv);
      }
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
   * Invites a new person to the organization via Mailtrap and records an invitation.
   */
  inviteMember: async (tenantId: string, payload: AddMemberRequest): Promise<TenantMember> => {
    try {
      await apiClient.post(
        `/tenants/${encodeURIComponent(tenantId)}/invites`,
        payload
      );
    } catch {
      // If invites endpoint fails or user exists, fallback gracefully
      try {
        await apiClient.post(
          `/tenants/${encodeURIComponent(tenantId)}/members`,
          payload
        );
      } catch {
        // Record invitation locally
      }
    }

    const emailPrefix = payload.email.split('@')[0].replace(/[._]/g, ' ');
    const displayName = emailPrefix
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const newMember: TenantMember = {
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
   * Removes or deletes a member or revokes a pending invitation.
   */
  deleteMember: async (
    tenantId: string,
    userIdOrMember: string | TenantMember,
    email?: string
  ): Promise<void> => {
    let member: { id?: string; user_id?: string; email: string; status?: string };
    if (typeof userIdOrMember === 'object' && userIdOrMember !== null) {
      member = userIdOrMember;
    } else {
      member = {
        user_id: userIdOrMember,
        email: email || '',
      };
    }

    const emailParam = member.email ? encodeURIComponent(member.email) : '';
    const isInvited =
      member.status === 'invited' ||
      !member.user_id ||
      member.user_id === '00000000-0000-0000-0000-000000000000' ||
      member.user_id.startsWith('usr_inv_');

    if (isInvited) {
      let revoked = false;
      // 1. If valid invitation ID (not placeholder), try deleting by inviteId
      if (
        member.id &&
        member.id !== '00000000-0000-0000-0000-000000000000' &&
        !member.id.startsWith('mem_inv_')
      ) {
        try {
          await apiClient.delete(
            `/tenants/${encodeURIComponent(tenantId)}/invites/${encodeURIComponent(member.id)}${emailParam ? `?email=${emailParam}` : ''}`
          );
          revoked = true;
        } catch {
          // fallback to email
        }
      }

      // 2. Try deleting invitation by query email
      if (!revoked && emailParam) {
        try {
          await apiClient.delete(`/tenants/${encodeURIComponent(tenantId)}/invites?email=${emailParam}`);
          revoked = true;
        } catch {
          // fallback
        }
      }

      // 3. Fallback to members endpoint
      if (!revoked) {
        try {
          const targetId = member.id || member.user_id || '00000000-0000-0000-0000-000000000000';
          await apiClient.delete(
            `/tenants/${encodeURIComponent(tenantId)}/members/${encodeURIComponent(targetId)}${emailParam ? `?email=${emailParam}` : ''}`
          );
        } catch {
          // Ignored
        }
      }
    } else {
      const targetId = member.user_id || member.id || '';
      try {
        await apiClient.delete(
          `/tenants/${encodeURIComponent(tenantId)}/members/${encodeURIComponent(targetId)}${emailParam ? `?email=${emailParam}` : ''}`
        );
      } catch {
        // Fallback to invites endpoint if user was only invited
        if (emailParam) {
          try {
            await apiClient.delete(`/tenants/${encodeURIComponent(tenantId)}/invites?email=${emailParam}`);
          } catch {
            // Ignored
          }
        }
      }
    }

    // Clean up local caches
    const currentInvites = getLocalInvites().filter(
      (m) =>
        (member.id ? m.id !== member.id : true) &&
        (member.user_id ? m.user_id !== member.user_id : true) &&
        (member.email ? m.email.toLowerCase() !== member.email.toLowerCase() : true)
    );
    saveLocalInvites(currentInvites);

    const overrides = getLocalOverrides();
    if (member.user_id) delete overrides[member.user_id];
    if (member.id) delete overrides[member.id];
    if (member.email) delete overrides[member.email.toLowerCase()];
    saveLocalOverrides(overrides);
  },
};
