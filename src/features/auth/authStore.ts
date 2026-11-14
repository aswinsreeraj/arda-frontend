import { create } from 'zustand';
import type { AuthUser, UserRole } from '@/features/auth/types';
import { AUTH_TOKEN_KEY, AUTH_TENANT_KEY } from '@/services/api';

const USER_STORAGE_KEY = 'arda_user_data';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (token: string, user: AuthUser) => void;
  setRole: (role: UserRole) => void;
  setTenant: (tenantId: string, tenantName?: string) => void;
  logout: () => void;

  // Role verification helpers
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isReviewer: () => boolean;
  isDeveloper: () => boolean;
  isAdmin: () => boolean;
}

export const getInitials = (name?: string, email?: string): string => {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'AC';
};

// Initial state restored from localStorage or default demo admin user
const loadInitialState = (): { token: string | null; user: AuthUser | null } => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (token && userJson) {
      const user = JSON.parse(userJson) as AuthUser;
      return { token, user };
    }
  } catch (err) {
    console.error('Failed to parse cached auth state:', err);
  }

  // Fallback demo admin state with access across all platform modules
  const demoUser: AuthUser = {
    id: 'usr_01j7abc',
    email: 'alex.chen@acmefinancial.com',
    full_name: 'Alex Chen',
    tenant_id: 'tenant_acme_corp',
    tenant_name: 'acme-corp',
    role: 'company_admin',
    queue: 'fraud-l2',
    initials: 'AC',
  };

  return {
    token: 'mock-jwt-token-obsidian',
    user: demoUser,
  };
};

const initial = loadInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initial.token,
  user: initial.user,
  isAuthenticated: Boolean(initial.token),
  isLoading: false,

  setAuth: (token: string, user: AuthUser) => {
    const userWithInitials = {
      ...user,
      initials: user.initials || getInitials(user.full_name, user.email),
    };
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_TENANT_KEY, user.tenant_id);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithInitials));
    set({ token, user: userWithInitials, isAuthenticated: true, isLoading: false });
  },

  setRole: (role: UserRole) => {
    const current = get().user;
    if (!current) return;
    const updated: AuthUser = {
      ...current,
      role,
      queue: role === 'reviewer' ? 'fraud-l2' : undefined,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    set({ user: updated });
  },

  setTenant: (tenantId: string, tenantName?: string) => {
    const current = get().user;
    if (!current) return;
    const updated: AuthUser = {
      ...current,
      tenant_id: tenantId,
      tenant_name: tenantName || tenantId,
    };
    localStorage.setItem(AUTH_TENANT_KEY, tenantId);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    set({ user: updated });
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TENANT_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const userRole = get().user?.role;
    if (!userRole) return false;
    // Admins have access across all views
    if (userRole === 'super_admin' || userRole === 'company_admin') return true;
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  },

  isReviewer: () => {
    const role = get().user?.role;
    return role === 'reviewer' || role === 'company_admin' || role === 'super_admin';
  },

  isDeveloper: () => {
    const role = get().user?.role;
    return role === 'agent_developer' || role === 'company_admin' || role === 'super_admin';
  },

  isAdmin: () => {
    const role = get().user?.role;
    return role === 'company_admin' || role === 'super_admin';
  },
}));
