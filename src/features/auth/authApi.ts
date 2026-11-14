import { apiClient } from '@/services/api';
import type {
  LoginRequest,
  LoginResponse,
  AcceptInviteRequest,
  RegisterTenantRequest,
  RegisterTenantResponse,
} from './types';

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  registerTenant: async (payload: RegisterTenantRequest): Promise<RegisterTenantResponse> => {
    const response = await apiClient.post<RegisterTenantResponse>('/tenants/register', payload);
    return response.data;
  },

  acceptInvitation: async (token: string, payload: AcceptInviteRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(`/invitations/${encodeURIComponent(token)}/accept`, payload);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
