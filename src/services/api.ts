import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, type ApiErrorResponse } from '@/types/common';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const TEMPORAL_UI_BASE_URL = import.meta.env.VITE_TEMPORAL_UI_URL || 'http://localhost:8233';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Storage keys
export const AUTH_TOKEN_KEY = 'arda_auth_token';
export const AUTH_TENANT_KEY = 'arda_tenant_id';

// Request interceptor to attach bearer token and tenant scope
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantId = localStorage.getItem(AUTH_TENANT_KEY);
    if (tenantId && config.headers && !config.headers['X-Tenant-ID']) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status || 500;

    if (status === 401) {
      // Clear token and caches if unauthorized, and redirect to login if not already there
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_TENANT_KEY);
      localStorage.removeItem('arda_user_data');
      localStorage.removeItem('arda_runs_cache');
      localStorage.removeItem('arda_runs_store');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    const errData = error.response?.data?.error;
    const code = errData?.code || (status === 409 ? 'CONFLICT' : 'INTERNAL_ERROR');
    const message = errData?.message || error.message || 'An unexpected error occurred';
    const details = errData?.details;

    return Promise.reject(new ApiError(status, code, message, details));
  }
);
