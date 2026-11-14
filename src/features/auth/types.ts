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
}

export interface LoginResponse {
  token: string;
  user_id: string;
  tenant_id: string;
  role: UserRole;
  expires_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
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
