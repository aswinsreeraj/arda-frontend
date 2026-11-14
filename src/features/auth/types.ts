import type { UserRole } from '@/types/common';
export type { UserRole };

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  tenant_id: string;
  tenant_name?: string;
  role: UserRole;
  queue?: string;
  initials?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenant_id?: string;
}

export interface BackendSafeUser {
  id: string;
  email: string;
  display_name: string;
  status: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: BackendSafeUser;
  active_tenant_id: string;
  role: UserRole;
}

export interface AcceptInviteRequest {
  full_name: string;
  password: string;
  token?: string;
}

export interface InvitationMetadata {
  token: string;
  organization_name: string;
  organization_acronym: string;
  invited_by: string;
  role: UserRole;
  role_display: string;
  email: string;
}
