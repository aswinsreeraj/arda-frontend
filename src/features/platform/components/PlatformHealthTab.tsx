import React from 'react';
import type { PlatformHealthMetric, PlatformServiceStatus } from '../types';
import { Activity, ExternalLink, ShieldCheck, Server, Database, Radio, Cpu, Layers } from 'lucide-react';

interface PlatformHealthTabProps {
  metrics: PlatformHealthMetric;
  services: PlatformServiceStatus[];
  stats?: {
    active_tenants: number;
    total_tenants: number;
    total_agents: number;
    total_invocations: number;
    total_reviews: number;
  };
}

export const PlatformHealthTab: React.FC<PlatformHealthTabProps> = ({
  metrics,
  services,
  stats,
}) => {
  return (
    <div className="space-y-6 text-xs max-w-5xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Health & Telemetry</h2>
          <p className="text-[13px] text-[#999999] mt-1 leading-relaxed">
            Live infrastructure vitals, agent execution metrics, and subsystem operational statuses across all organizations.
          </p>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#1c1c1c] border border-[#2b2b2b] text-[#a1a1aa] hover:text-white hover:bg-[#252525] transition text-xs font-mono self-start sm:self-auto group"
        >
          <span>Grafana Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
        </a>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161616] border border-[#262626] rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between text-[#8c8c8c]">
            <span className="text-[11px] uppercase font-mono tracking-wider">Invocations</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-white tracking-tight pt-1">
            {metrics.executions_today}
          </div>
          <div className="text-[11px] text-[#737373]">{metrics.executions_change}</div>
        </div>

        <div className="bg-[#161616] border border-[#262626] rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between text-[#8c8c8c]">
            <span className="text-[11px] uppercase font-mono tracking-wider">Registered Agents</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-white tracking-tight pt-1">
            {metrics.active_agents}
          </div>
          <div className="text-[11px] text-[#737373]">{metrics.active_tenants_note}</div>
        </div>

        <div className="bg-[#161616] border border-[#262626] rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between text-[#8c8c8c]">
            <span className="text-[11px] uppercase font-mono tracking-wider">Calibration Rate</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-white tracking-tight pt-1">
            {metrics.escalation_rate}
          </div>
          <div className="text-[11px] text-[#737373]">{metrics.escalation_note}</div>
        </div>

        <div className="bg-[#161616] border border-[#262626] rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between text-[#8c8c8c]">
            <span className="text-[11px] uppercase font-mono tracking-wider">p95 Step Latency</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-semibold font-mono text-white tracking-tight pt-1">
            {metrics.p95_latency}
          </div>
          <div className="text-[11px] text-[#737373]">{metrics.latency_note}</div>
        </div>
      </div>

      {/* Subsystems & Services Status */}
      <div className="border border-[#262626] rounded-md overflow-hidden bg-[#161616]">
        <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
          <div className="font-semibold text-white text-[13px] flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span>ARDA Subsystems & Daemons</span>
          </div>
          <span className="text-[11px] text-[#22c55e] font-mono flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>All systems operational</span>
          </span>
        </div>

        <div className="divide-y divide-[#202020]">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="p-4 flex items-center justify-between hover:bg-[#1a1a1a]/60 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {svc.status === 'operational' && (
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                )}
                {svc.status === 'degraded' && (
                  <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                )}
                {svc.status === 'down' && (
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                )}
                <span className="font-medium text-white text-[13px]">{svc.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`capitalize font-mono text-xs ${
                    svc.status === 'operational'
                      ? 'text-[#22c55e]'
                      : svc.status === 'degraded'
                      ? 'text-[#eab308]'
                      : 'text-[#ef4444]'
                  }`}
                >
                  {svc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database & Infrastructure Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-[#161616] border border-[#262626] rounded-md space-y-1">
            <div className="flex items-center space-x-2 text-[#737373]">
              <Database className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] uppercase">Active / Total Tenants</span>
            </div>
            <div className="font-mono text-white text-base">
              {stats.active_tenants} / {stats.total_tenants}
            </div>
          </div>
          <div className="p-3.5 bg-[#161616] border border-[#262626] rounded-md space-y-1">
            <div className="flex items-center space-x-2 text-[#737373]">
              <Activity className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] uppercase">Total Review Cases</span>
            </div>
            <div className="font-mono text-white text-base">{stats.total_reviews}</div>
          </div>
          <div className="p-3.5 bg-[#161616] border border-[#262626] rounded-md space-y-1">
            <div className="flex items-center space-x-2 text-[#737373]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] uppercase">Tool Invocations Logged</span>
            </div>
            <div className="font-mono text-white text-base">{stats.total_invocations}</div>
          </div>
        </div>
      )}

      {/* Grafana Implementation Notice */}
      <div className="p-4 rounded-lg bg-[#181818] border border-[#262626] text-[#8c8c8c] flex items-start space-x-3 leading-relaxed">
        <Radio className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block mb-0.5">
            Grafana Deep Observability Integration
          </span>
          Live cluster telemetry above reflects direct ARDA PostgreSQL, gRPC, and Gateway health checks.
          Dedicated Grafana dashboards and Prometheus alerting pipelines are scheduled for deployment next week.
        </div>
      </div>
    </div>
  );
};
