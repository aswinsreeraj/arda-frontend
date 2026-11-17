import { apiClient } from '@/services/api';
import type {
  AgentDetail,
  AgentVersion,
  CreateAgentRequest,
  CreateVersionRequest,
  Credential,
  ListAgentsParams,
  ListAgentsResponse,
  ListCredentialsResponse,
  RegisterToolRequest,
  SaveCredentialRequest,
  ToolDefinition,
  UpdateVersionRequest,
  VerifyCredentialResponse,
  CredentialModelsResponse,
} from './types';

export const agentApi = {
  /**
   * Retrieves paginated list of registered agents for the tenant.
   * Registered route: GET /api/v1/agents
   */
  listAgents: async (
    params?: ListAgentsParams,
    signal?: AbortSignal
  ): Promise<ListAgentsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page_size) searchParams.append('page_size', String(params.page_size));
    if (params?.page_token) searchParams.append('page_token', params.page_token);

    const queryString = searchParams.toString();
    const url = queryString ? `/agents?${queryString}` : '/agents';
    const response = await apiClient.get<ListAgentsResponse>(url, { signal });
    return response.data;
  },

  /**
   * Retrieves full agent detail including latest published and draft versions.
   * Registered route: GET /api/v1/agents/:id
   */
  getAgent: async (id: string, signal?: AbortSignal): Promise<AgentDetail> => {
    const response = await apiClient.get<AgentDetail>(`/agents/${encodeURIComponent(id)}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Registers a new agent draft.
   * Registered route: POST /api/v1/agents
   */
  createAgent: async (
    payload: CreateAgentRequest,
    signal?: AbortSignal
  ): Promise<AgentDetail> => {
    const response = await apiClient.post<AgentDetail>('/agents', payload, { signal });
    return response.data;
  },

  /**
   * Permanently deletes an agent and all of its versions (company_admin only).
   * Registered route: DELETE /api/v1/agents/:id
   */
  deleteAgent: async (id: string, signal?: AbortSignal): Promise<void> => {
    await apiClient.delete(`/agents/${encodeURIComponent(id)}`, { signal });
  },

  /**
   * Creates a new draft version for an existing agent.
   * Registered route: POST /api/v1/agents/:id/versions
   */
  createVersion: async (
    agentId: string,
    payload: CreateVersionRequest,
    signal?: AbortSignal
  ): Promise<AgentVersion> => {
    const response = await apiClient.post<AgentVersion>(
      `/agents/${encodeURIComponent(agentId)}/versions`,
      payload,
      { signal }
    );
    return response.data;
  },

  /**
   * Retrieves all versions of an agent ordered newest-first.
   * Registered route: GET /api/v1/agents/:id/versions
   */
  listVersions: async (
    agentId: string,
    signal?: AbortSignal
  ): Promise<AgentVersion[]> => {
    const response = await apiClient.get<{ versions: AgentVersion[] }>(
      `/agents/${encodeURIComponent(agentId)}/versions`,
      { signal }
    );
    return response.data.versions || [];
  },

  /**
   * Retrieves the latest published version for an agent.
   * Registered route: GET /api/v1/agents/:id/versions/latest
   */
  getLatestPublishedVersion: async (
    agentId: string,
    signal?: AbortSignal
  ): Promise<AgentVersion> => {
    const response = await apiClient.get<AgentVersion>(
      `/agents/${encodeURIComponent(agentId)}/versions/latest`,
      { signal }
    );
    return response.data;
  },

  /**
   * Retrieves a specific version of an agent.
   * Registered route: GET /api/v1/agents/:id/versions/:versionId
   */
  getVersion: async (
    agentId: string,
    versionId: string,
    signal?: AbortSignal
  ): Promise<AgentVersion> => {
    const response = await apiClient.get<AgentVersion>(
      `/agents/${encodeURIComponent(agentId)}/versions/${encodeURIComponent(versionId)}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Updates an existing draft version's configuration.
   * Registered route: PUT /api/v1/agents/:id/versions/:versionId
   */
  updateDraftVersion: async (
    agentId: string,
    versionId: string,
    payload: UpdateVersionRequest,
    signal?: AbortSignal
  ): Promise<AgentVersion> => {
    const response = await apiClient.put<AgentVersion>(
      `/agents/${encodeURIComponent(agentId)}/versions/${encodeURIComponent(versionId)}`,
      payload,
      { signal }
    );
    return response.data;
  },

  /**
   * Publishes an existing draft version.
   * Note: Restricted to company_admin and reviewer roles by backend RBAC policy.
   * Registered route: POST /api/v1/agents/:id/versions/:versionId/publish
   */
  publishVersion: async (
    agentId: string,
    versionId: string,
    signal?: AbortSignal
  ): Promise<AgentVersion> => {
    const response = await apiClient.post<AgentVersion>(
      `/agents/${encodeURIComponent(agentId)}/versions/${encodeURIComponent(versionId)}/publish`,
      {},
      { signal }
    );
    return response.data;
  },

  /**
   * Deletes an unpublished draft version.
   * Registered route: DELETE /api/v1/agents/:id/versions/:versionId
   */
  deleteDraftVersion: async (
    agentId: string,
    versionId: string,
    signal?: AbortSignal
  ): Promise<void> => {
    await apiClient.delete(
      `/agents/${encodeURIComponent(agentId)}/versions/${encodeURIComponent(versionId)}`,
      { signal }
    );
  },

  /**
   * Retrieves all tools registered for the tenant.
   * Registered route: GET /api/v1/tools
   */
  listTools: async (signal?: AbortSignal): Promise<ToolDefinition[]> => {
    const response = await apiClient.get<ToolDefinition[]>('/tools', { signal });
    return response.data;
  },

  /**
   * Registers a new tool in the tenant catalog.
   * Registered route: POST /api/v1/tools
   */
  registerTool: async (
    payload: RegisterToolRequest,
    signal?: AbortSignal
  ): Promise<ToolDefinition> => {
    const response = await apiClient.post<ToolDefinition>('/tools', payload, { signal });
    return response.data;
  },

  /**
   * Enables or disables a registered tool.
   * Registered route: PATCH /api/v1/tools/:id/enable
   */
  setToolEnabled: async (
    id: string,
    enabled: boolean,
    signal?: AbortSignal
  ): Promise<ToolDefinition> => {
    const response = await apiClient.patch<ToolDefinition>(
      `/tools/${encodeURIComponent(id)}/enable`,
      { enabled },
      { signal }
    );
    return response.data;
  },

  /**
   * Deletes a tool definition from the catalog.
   * Registered route: DELETE /api/v1/tools/:id
   */
  deleteTool: async (id: string, signal?: AbortSignal): Promise<void> => {
    await apiClient.delete(`/tools/${encodeURIComponent(id)}`, { signal });
  },

  /**
   * Retrieves tenant-scoped credentials metadata from HashiCorp Vault.
   * Registered route: GET /api/v1/credentials
   */
  listCredentials: async (signal?: AbortSignal): Promise<Credential[]> => {
    const response = await apiClient.get<ListCredentialsResponse>('/credentials', { signal });
    return response.data.credentials || [];
  },

  /**
   * Vaults a new credential (LLM API key or MCP token).
   * Registered route: POST /api/v1/credentials
   */
  saveCredential: async (
    payload: SaveCredentialRequest,
    signal?: AbortSignal
  ): Promise<Credential> => {
    const response = await apiClient.post<Credential>('/credentials', payload, { signal });
    return response.data;
  },

  /**
   * Verifies live connectivity of a vaulted credential without exposing secrets.
   * Registered route: POST /api/v1/credentials/:id/verify
   */
  verifyCredential: async (
    id: string,
    signal?: AbortSignal
  ): Promise<VerifyCredentialResponse> => {
    const response = await apiClient.post<VerifyCredentialResponse>(
      `/credentials/${encodeURIComponent(id)}/verify`,
      {},
      { signal }
    );
    return response.data;
  },

  /**
   * Deletes a vaulted credential.
   * Registered route: DELETE /api/v1/credentials/:id
   */
  deleteCredential: async (id: string, signal?: AbortSignal): Promise<void> => {
    await apiClient.delete(`/credentials/${encodeURIComponent(id)}`, { signal });
  },

  /**
   * Fetches real-time models available for a specific vaulted credential API key.
   * Registered route: GET /api/v1/credentials/:id/models
   */
  listCredentialModels: async (
    id: string,
    signal?: AbortSignal
  ): Promise<CredentialModelsResponse> => {
    const response = await apiClient.get<CredentialModelsResponse>(
      `/credentials/${encodeURIComponent(id)}/models`,
      { signal }
    );
    return response.data;
  },
};
