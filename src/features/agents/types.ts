/**
 * Agent Registry, Tools, and Credentials Domain Types
 * Matching ARDA Go backend models and database schemas strictly.
 */

export type ExecutionMode = 'supervised' | 'autonomous' | 'human_in_the_loop' | 'gated';

export interface LLMConfig {
  provider?: string;
  model?: string;
  credential_ref?: string;
  parameters?: Record<string, unknown>;
}

export interface OutputSchema {
  name?: string;
  description?: string;
  strict?: boolean;
  schema: Record<string, unknown>;
}

export interface AgentConfiguration {
  prompt_template: string;
  tools: string[];
  reliability_threshold: number;
  execution_mode: ExecutionMode;
  guardrails?: Record<string, unknown>;
  budgets?: Record<string, unknown>;
  llm_config?: LLMConfig;
  output_schema?: OutputSchema;
}

export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version_number: number;
  configuration: AgentConfiguration;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface AgentDetail {
  agent: Agent;
  latest_published_version?: AgentVersion;
  draft_version?: AgentVersion;
}

export interface ListAgentsParams {
  page_size?: number;
  page_token?: string;
}

export interface ListAgentsResponse {
  agents: AgentDetail[];
  next_page_token: string;
  total_count: number;
}

export interface CreateAgentRequest {
  name: string;
  configuration?: AgentConfiguration;
  prompt_template?: string;
  tools?: string[];
  reliability_threshold?: number;
  execution_mode?: ExecutionMode;
  guardrails?: Record<string, unknown>;
  budgets?: Record<string, unknown>;
  llm_provider?: string;
  llm_model?: string;
  llm_config?: LLMConfig;
  output_schema?: OutputSchema;
}

export interface CreateVersionRequest {
  configuration?: AgentConfiguration;
  prompt_template?: string;
  tools?: string[];
  reliability_threshold?: number;
  execution_mode?: ExecutionMode;
  guardrails?: Record<string, unknown>;
  budgets?: Record<string, unknown>;
  llm_provider?: string;
  llm_model?: string;
  llm_config?: LLMConfig;
  output_schema?: OutputSchema;
}

export type UpdateVersionRequest = AgentConfiguration;

export type ToolClassification = 'read' | 'write';

export interface ToolDefinition {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  classification: ToolClassification;
  input_schema: Record<string, unknown>;
  version: number;
  enabled: boolean;
  required_permissions: string[];
  handler_id: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterToolRequest {
  name: string;
  description?: string;
  classification: ToolClassification;
  input_schema?: Record<string, unknown>;
  required_permissions?: string[];
  handler_id: string;
  enabled?: boolean;
}

export type CredentialCategory = 'llm' | 'mcp';

export interface Credential {
  id: string;
  tenant_id: string;
  category: CredentialCategory;
  provider: string;
  reference: string;
  created_at: string;
  updated_at: string;
}

export interface ListCredentialsResponse {
  credentials: Credential[];
}

export interface SaveCredentialRequest {
  category: CredentialCategory;
  provider: string;
  secret_value: string;
}

export interface VerifyCredentialResponse {
  id: string;
  verified: boolean;
  reference: string;
  message: string;
}
