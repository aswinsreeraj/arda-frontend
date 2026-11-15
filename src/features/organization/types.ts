export type TenantRole = 'company_admin' | 'agent_developer' | 'reviewer';
export type MemberStatus = 'active' | 'invited' | 'disabled';

export interface TenantMember {
  id: string;
  user_id: string;
  tenant_id: string;
  email: string;
  display_name: string;
  role: TenantRole;
  status: MemberStatus;
  created_at: string;
  last_active?: string;
  is_current_user?: boolean;
}

export interface ListMembersResponse {
  members: TenantMember[];
}

export interface AddMemberRequest {
  email: string;
  role: TenantRole;
  user_id?: string;
}

export interface UpdateMemberRequest {
  role?: TenantRole;
  status?: MemberStatus;
}

export type OrgAdminSection = 'people' | 'usage';
