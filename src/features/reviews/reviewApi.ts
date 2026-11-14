import { apiClient } from '@/services/api';
import type {
  ListReviewsResponse,
  ReviewCaseDetail,
  ResolveReviewRequest,
  ResolveReviewResponse,
  ReviewListFilters,
} from './types';

export const reviewApi = {
  /**
   * Retrieves paginated review queue cases with optional filters.
   * Registered route: GET /api/v1/reviews
   */
  listReviews: async (
    filters: ReviewListFilters = {},
    signal?: AbortSignal
  ): Promise<ListReviewsResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.agent_id) params.append('agent_id', filters.agent_id);
    if (filters.escalation_reason) params.append('escalation_reason', filters.escalation_reason);
    if (filters.page_size) params.append('page_size', String(filters.page_size));
    if (filters.page_token) params.append('page_token', filters.page_token);

    const queryString = params.toString();
    const url = queryString ? `/reviews?${queryString}` : '/reviews';
    const response = await apiClient.get<ListReviewsResponse>(url, { signal });
    return response.data;
  },

  /**
   * Retrieves single review case detail and frozen evidence.
   * Registered route: GET /api/v1/reviews/{id}
   */
  getReviewCase: async (
    caseId: string,
    signal?: AbortSignal
  ): Promise<ReviewCaseDetail> => {
    const response = await apiClient.get<ReviewCaseDetail>(
      `/reviews/${encodeURIComponent(caseId)}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Adjudicates an escalated review case with approve, reject, or override.
   * Registered route: POST /api/v1/reviews/{id}/resolve
   */
  resolveReviewCase: async (
    caseId: string,
    payload: ResolveReviewRequest,
    signal?: AbortSignal
  ): Promise<ResolveReviewResponse> => {
    const response = await apiClient.post<ResolveReviewResponse>(
      `/reviews/${encodeURIComponent(caseId)}/resolve`,
      payload,
      { signal }
    );
    return response.data;
  },
};
