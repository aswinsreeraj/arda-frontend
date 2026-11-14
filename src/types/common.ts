export type UserRole = 'super_admin' | 'company_admin' | 'agent_developer' | 'reviewer';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export type ResilienceState = 'connected' | 'reconnecting' | 'disconnected' | 'error';
