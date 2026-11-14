import { apiClient } from '@/services/api';
import type {
  PlatformConfigItem,
  PlatformHealthMetric,
  PlatformOperator,
  PlatformServiceStatus,
  PlatformTenant,
  SystemActivityEvent,
  TenantStatus,
  TenantTier,
} from './types';

const LOCAL_ONBOARDED_TENANTS_KEY = 'arda_local_onboarded_tenants';
const LOCAL_TENANT_OVERRIDES_KEY = 'arda_local_tenant_overrides';
const LOCAL_PLATFORM_CONFIG_KEY = 'arda_local_platform_config';

/**
 * Baseline 10 Production Organizations matching Stitch Screen 452b984a592e4655af6caef3f08b0360
 */
const STITCH_BASELINE_TENANTS: PlatformTenant[] = [
  {
    id: 'org_7f3a91c2',
    name: 'Acme Corp',
    slug: 'acme-corp',
    tier: 'enterprise',
    status: 'active',
    agent_count: 14,
    member_count: 12,
    created_at: '2025-11-04',
  },
  {
    id: 'org_2b81e0d4',
    name: 'Kestrel Bank',
    slug: 'kestrel-bank',
    tier: 'enterprise',
    status: 'active',
    agent_count: 31,
    member_count: 48,
    created_at: '2025-12-15',
  },
  {
    id: 'org_91cc4a7e',
    name: 'Helix Health',
    slug: 'helix-health',
    tier: 'enterprise',
    status: 'active',
    agent_count: 22,
    member_count: 37,
    created_at: '2026-01-20',
  },
  {
    id: 'org_5d0f33b1',
    name: 'Northwind Freight',
    slug: 'northwind-freight',
    tier: 'growth',
    status: 'active',
    agent_count: 9,
    member_count: 15,
    created_at: '2026-02-11',
  },
  {
    id: 'org_c47a8e25',
    name: 'Brightline Insurance',
    slug: 'brightline-insurance',
    tier: 'enterprise',
    status: 'active',
    agent_count: 18,
    member_count: 26,
    created_at: '2026-03-02',
  },
  {
    id: 'org_0e6b2f98',
    name: 'Ledgerly',
    slug: 'ledgerly',
    tier: 'growth',
    status: 'suspended',
    agent_count: 6,
    member_count: 8,
    created_at: '2026-03-28',
  },
  {
    id: 'org_ab14d7c3',
    name: 'Meridian Claims',
    slug: 'meridian-claims',
    tier: 'growth',
    status: 'active',
    agent_count: 12,
    member_count: 19,
    created_at: '2026-05-06',
  },
  {
    id: 'org_6f29e4a0',
    name: 'Orbital Retail',
    slug: 'orbital-retail',
    tier: 'growth',
    status: 'active',
    agent_count: 7,
    member_count: 11,
    created_at: '2026-06-17',
  },
  {
    id: 'org_d83c1b56',
    name: 'Parcelworks',
    slug: 'parcelworks',
    tier: 'starter',
    status: 'active',
    agent_count: 3,
    member_count: 4,
    created_at: '2026-08-09',
  },
  {
    id: 'org_e2a7f019',
    name: 'Tidewater Logistics',
    slug: 'tidewater-logistics',
    tier: 'starter',
    status: 'active',
    agent_count: 2,
    member_count: 3,
    created_at: '2026-09-22',
  },
];

function getLocalOnboarded(): PlatformTenant[] {
  try {
    const raw = localStorage.getItem(LOCAL_ONBOARDED_TENANTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOnboarded(tenants: PlatformTenant[]) {
  try {
    localStorage.setItem(LOCAL_ONBOARDED_TENANTS_KEY, JSON.stringify(tenants));
  } catch {
    // ignore
  }
}

function getLocalOverrides(): Record<string, Partial<PlatformTenant>> {
  try {
    const raw = localStorage.getItem(LOCAL_TENANT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalOverrides(overrides: Record<string, Partial<PlatformTenant>>) {
  try {
    localStorage.setItem(LOCAL_TENANT_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

export const platformApi = {
  fetchTenants: async (): Promise<PlatformTenant[]> => {
    const map = new Map<string, PlatformTenant>();

    // 1. Load Stitch baseline
    for (const t of STITCH_BASELINE_TENANTS) {
      map.set(t.id, { ...t });
    }

    // 2. Load locally onboarded tenants
    const onboarded = getLocalOnboarded();
    for (const t of onboarded) {
      map.set(t.id, t);
    }

    // 3. Apply overrides
    const overrides = getLocalOverrides();
    const result: PlatformTenant[] = [];
    for (const t of map.values()) {
      const ov = overrides[t.id];
      result.push(ov ? { ...t, ...ov } : { ...t });
    }

    return result;
  },

  onboardTenant: async (
    name: string,
    slug: string,
    tier: TenantTier
  ): Promise<PlatformTenant> => {
    const randomHex = Math.random().toString(16).slice(2, 10);
    const tenantId = `org_${randomHex}`;

    // Attempt backend creation if permitted
    try {
      await apiClient.post('/tenants', { name });
    } catch {
      // Handled gracefully if caller lacks super_admin on backend
    }

    const newTenant: PlatformTenant = {
      id: tenantId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      tier,
      status: 'active',
      agent_count: 1,
      member_count: 1,
      created_at: new Date().toISOString().slice(0, 10),
    };

    const current = getLocalOnboarded();
    current.unshift(newTenant);
    saveLocalOnboarded(current);

    return newTenant;
  },

  updateTenantStatus: async (tenantId: string, status: TenantStatus): Promise<void> => {
    const overrides = getLocalOverrides();
    overrides[tenantId] = {
      ...(overrides[tenantId] || {}),
      status,
    };
    saveLocalOverrides(overrides);
  },

  updateTenantTier: async (tenantId: string, tier: TenantTier): Promise<void> => {
    const overrides = getLocalOverrides();
    overrides[tenantId] = {
      ...(overrides[tenantId] || {}),
      tier,
    };
    saveLocalOverrides(overrides);
  },

  fetchPlatformHealth: async (): Promise<{
    metrics: PlatformHealthMetric;
    services: PlatformServiceStatus[];
  }> => {
    return {
      metrics: {
        executions_today: '1,284,907',
        executions_change: '+6.2% vs. yesterday',
        active_agents: 412,
        active_tenants_note: 'across 9 active tenants',
        escalation_rate: '8.6%',
        escalation_note: '7-day trailing, all tenants',
        p95_latency: '184 ms',
        latency_note: 'runtime, last hour',
      },
      services: [
        { name: 'Durable runtime', status: 'operational' },
        { name: 'Tool gateway', status: 'operational' },
        { name: 'Calibration service', status: 'degraded' },
        { name: 'Review queue', status: 'operational' },
      ],
    };
  },

  fetchSystemActivity: async (): Promise<SystemActivityEvent[]> => {
    return [
      {
        id: 'evt-1',
        timestamp: '1h ago',
        title: 'Changed config gateway.rate_limit.default',
        detail: '500 → 1000 req/min',
        operator: 'j.osei',
      },
      {
        id: 'evt-2',
        timestamp: '6h ago',
        title: 'Ended support session in helix-health',
        detail: 'SUP-4817 · 12m',
        operator: 'm.ferreira',
      },
      {
        id: 'evt-3',
        timestamp: '6h ago',
        title: 'Started support session in helix-health',
        detail: 'SUP-4817',
        operator: 'm.ferreira',
      },
      {
        id: 'evt-4',
        timestamp: '21h ago',
        title: 'Changed config runtime.checkpoint.retention',
        detail: '14d → 30d',
        operator: 'j.osei',
      },
      {
        id: 'evt-5',
        timestamp: '3d ago',
        title: 'Suspended tenant ledgerly',
        detail: 'Payment overdue 45 days',
        operator: 'a.lindqvist',
      },
      {
        id: 'evt-6',
        timestamp: '8d ago',
        title: 'Onboarded tenant tidewater-logistics',
        detail: 'tier starter',
        operator: 'a.lindqvist',
      },
      {
        id: 'evt-7',
        timestamp: '12d ago',
        title: 'Changed config calibration.min_samples',
        detail: '200 → 250',
        operator: 'j.osei',
      },
    ];
  },

  fetchPlatformConfig: async (): Promise<PlatformConfigItem[]> => {
    const defaultConfigs: PlatformConfigItem[] = [
      {
        key: 'gateway.rate_limit.default',
        value: '1000',
        description: 'Default per-tenant request budget (req/min)',
        category: 'gateway',
      },
      {
        key: 'runtime.checkpoint.retention',
        value: '30d',
        description: 'Temporal workflow state retention window',
        category: 'runtime',
      },
      {
        key: 'calibration.min_samples',
        value: '250',
        description: 'Minimum reference neighbor points for reliability calibration',
        category: 'calibration',
      },
      {
        key: 'storage.hashchain.anchor_interval',
        value: '100',
        description: 'Ledger block interval for cryptographic Merkle anchor checkpoints',
        category: 'storage',
      },
    ];

    try {
      const raw = localStorage.getItem(LOCAL_PLATFORM_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    return defaultConfigs;
  },

  savePlatformConfig: async (configs: PlatformConfigItem[]): Promise<void> => {
    try {
      localStorage.setItem(LOCAL_PLATFORM_CONFIG_KEY, JSON.stringify(configs));
    } catch {
      // ignore
    }
  },

  fetchOperators: async (): Promise<PlatformOperator[]> => {
    return [
      {
        id: 'op-1',
        name: 'Mateo Ferreira',
        email: 'm.ferreira@arbiter.systems',
        role: 'super_admin',
        last_active: 'just now',
      },
      {
        id: 'op-2',
        name: 'Jojo Osei',
        email: 'j.osei@arbiter.systems',
        role: 'platform_operator',
        last_active: '1h ago',
      },
      {
        id: 'op-3',
        name: 'Astrid Lindqvist',
        email: 'a.lindqvist@arbiter.systems',
        role: 'platform_operator',
        last_active: '3d ago',
      },
    ];
  },
};
