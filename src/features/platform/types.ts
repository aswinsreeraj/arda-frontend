export type TenantTier = 'enterprise' | 'growth' | 'starter';
export type TenantStatus = 'active' | 'suspended';

export interface PlatformTenant {
  id: string;
  name: string;
  slug: string;
  tier: TenantTier;
  status: TenantStatus;
  agent_count: number;
  member_count: number;
  created_at: string;
}

export interface PlatformHealthMetric {
  executions_today: string;
  executions_change: string;
  active_agents: number;
  active_tenants_note: string;
  escalation_rate: string;
  escalation_note: string;
  p95_latency: string;
  latency_note: string;
}

export interface PlatformServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
}

export interface SystemActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  operator: string;
}

export interface PlatformConfigItem {
  key: string;
  label?: string;
  value: string;
  description: string;
  category: 'gateway' | 'runtime' | 'calibration' | 'storage';
  updated_by?: string;
  updated_at?: string;
}

export interface PlatformConfigSaveResult {
  configs: PlatformConfigItem[];
  applied: string[];
  warnings: string[];
}

export interface PlatformDefaults {
  reliability_default_threshold: number;
  calibration_sampling_interval: number;
  retrieval_top_k: number;
}

export interface PlatformOperator {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'platform_operator';
  last_active: string;
}

export type PlatformTab = 'tenants' | 'health' | 'config' | 'operators' | 'audit' | 'grafana';
