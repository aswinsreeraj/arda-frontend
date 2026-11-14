import React from 'react';
import type { PlatformHealthMetric, PlatformServiceStatus } from '../types';
import { ExternalLink } from 'lucide-react';

interface PlatformHealthPanelProps {
  metrics: PlatformHealthMetric;
  services: PlatformServiceStatus[];
}

export const PlatformHealthPanel: React.FC<PlatformHealthPanelProps> = ({
  metrics,
  services,
}) => {
  return (
    <div className="space-y-4" data-purpose="platform-health">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Platform health</h2>
          <p className="text-[11px] text-[#737373] mt-0.5">
            Aggregate across all tenants · updated 1m ago
          </p>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#3b82f6] hover:underline flex items-center space-x-1"
        >
          <span>Open in Grafana</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 2x2 Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#171717] border border-[#242424] rounded-md p-3.5 space-y-1">
          <div className="text-[11px] text-[#737373]">Executions today</div>
          <div className="text-xl font-medium font-mono text-white tracking-tight">
            {metrics.executions_today}
          </div>
          <div className="text-[10px] text-[#737373]">{metrics.executions_change}</div>
        </div>

        <div className="bg-[#171717] border border-[#242424] rounded-md p-3.5 space-y-1">
          <div className="text-[11px] text-[#737373]">Active agents</div>
          <div className="text-xl font-medium font-mono text-white tracking-tight">
            {metrics.active_agents}
          </div>
          <div className="text-[10px] text-[#737373]">{metrics.active_tenants_note}</div>
        </div>

        <div className="bg-[#171717] border border-[#242424] rounded-md p-3.5 space-y-1">
          <div className="text-[11px] text-[#737373]">Escalation rate</div>
          <div className="text-xl font-medium font-mono text-white tracking-tight">
            {metrics.escalation_rate}
          </div>
          <div className="text-[10px] text-[#737373]">{metrics.escalation_note}</div>
        </div>

        <div className="bg-[#171717] border border-[#242424] rounded-md p-3.5 space-y-1">
          <div className="text-[11px] text-[#737373]">p95 step latency</div>
          <div className="text-xl font-medium font-mono text-white tracking-tight">
            {metrics.p95_latency}
          </div>
          <div className="text-[10px] text-[#737373]">{metrics.latency_note}</div>
        </div>
      </div>

      {/* Service Status Checklist */}
      <div className="space-y-2 pt-2 text-[12px] font-mono">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between text-[#8c8c8c]">
            <span className="flex items-center space-x-2">
              {svc.status === 'operational' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              )}
              {svc.status === 'degraded' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
              )}
              {svc.status === 'down' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
              )}
              <span className="text-[#d4d4d4] font-sans">{svc.name}</span>
            </span>
            <span
              className={
                svc.status === 'operational'
                  ? 'text-[#737373]'
                  : svc.status === 'degraded'
                    ? 'text-[#eab308]'
                    : 'text-[#ef4444]'
              }
            >
              {svc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
