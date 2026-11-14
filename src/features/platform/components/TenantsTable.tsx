import React, { useState } from 'react';
import type { PlatformTenant, TenantStatus, TenantTier } from '../types';
import { MoreHorizontal, ShieldCheck, Ban, Zap } from 'lucide-react';

interface TenantsTableProps {
  tenants: PlatformTenant[];
  onToggleStatus: (tenant: PlatformTenant, newStatus: TenantStatus) => Promise<void>;
  onChangeTier: (tenant: PlatformTenant, newTier: TenantTier) => Promise<void>;
}

export const TenantsTable: React.FC<TenantsTableProps> = ({
  tenants,
  onToggleStatus,
  onChangeTier,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto border border-[#262626] rounded-md bg-[#161616]">
      <table className="w-full text-left text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-[#262626] text-[#737373] text-[11px] uppercase tracking-wider font-mono">
            <th className="py-2.5 px-4 font-normal">Organization</th>
            <th className="py-2.5 px-4 font-normal">Tier</th>
            <th className="py-2.5 px-4 font-normal">Status</th>
            <th className="py-2.5 px-4 font-normal text-right pr-6">Agents</th>
            <th className="py-2.5 px-4 font-normal text-right pr-6">Members</th>
            <th className="py-2.5 px-4 font-normal">Onboarded</th>
            <th className="py-2.5 px-4 font-normal w-6"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e1e1e]">
          {tenants.map((t) => {
            const isSuspended = t.status === 'suspended';
            const isMenuOpen = activeMenuId === t.id;

            return (
              <tr
                key={t.id}
                className="hover:bg-[#1a1a1a] group transition-colors"
              >
                {/* Organization */}
                <td className="py-3 px-4">
                  <div className="font-medium text-white">{t.name}</div>
                  <div className="text-[11px] font-mono text-[#666666]">
                    {t.slug} · {t.id}
                  </div>
                </td>

                {/* Tier */}
                <td className="py-3 px-4 font-mono text-[#a1a1aa] capitalize">
                  {t.tier}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  {t.status === 'active' ? (
                    <span className="inline-flex items-center text-[#22c55e] space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                      <span>active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[#ef4444] space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                      <span>suspended</span>
                    </span>
                  )}
                </td>

                {/* Agents */}
                <td className="py-3 px-4 text-right pr-6 font-mono text-[#d4d4d4]">
                  {t.agent_count}
                </td>

                {/* Members */}
                <td className="py-3 px-4 text-right pr-6 font-mono text-[#d4d4d4]">
                  {t.member_count}
                </td>

                {/* Onboarded */}
                <td className="py-3 px-4 font-mono text-[#737373]">
                  {t.created_at}
                </td>

                {/* Context Menu Actions */}
                <td className="py-3 px-4 text-center relative">
                  <button
                    onClick={() => setActiveMenuId(isMenuOpen ? null : t.id)}
                    className="text-[#525252] group-hover:text-[#a1a1aa] hover:text-white cursor-pointer px-1.5 py-0.5 rounded transition-colors"
                    title="Tenant Actions"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <div
                      className="absolute right-4 mt-1 w-52 rounded-md bg-[#1c1c1c] border border-[#2e2e2e] shadow-xl py-1 text-xs text-neutral-300 z-50 text-left font-sans"
                      onMouseLeave={() => setActiveMenuId(null)}
                    >
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          alert(`Starting scoped support session for ${t.name} (SUP-${Math.floor(1000 + Math.random() * 9000)})`);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-[#252525] flex items-center space-x-2 text-sky-300"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Impersonate session</span>
                      </button>

                      {isSuspended ? (
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onToggleStatus(t, 'active');
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-[#252525] flex items-center space-x-2 text-emerald-400"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Reactivate tenant</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            if (confirm(`Suspend tenant "${t.name}"? Executions and user logins will be halted.`)) {
                              onToggleStatus(t, 'suspended');
                            }
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-[#252525] flex items-center space-x-2 text-rose-400"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend tenant</span>
                        </button>
                      )}

                      <div className="border-t border-[#262626] my-1" />
                      <div className="px-3 py-1 text-[10px] uppercase font-mono text-neutral-500">
                        Change Tier
                      </div>
                      {(['starter', 'growth', 'enterprise'] as TenantTier[]).map((tierOpt) => (
                        <button
                          key={tierOpt}
                          disabled={t.tier === tierOpt}
                          onClick={() => {
                            setActiveMenuId(null);
                            onChangeTier(t, tierOpt);
                          }}
                          className={`w-full px-3 py-1 text-left flex items-center justify-between capitalize text-[11px] ${
                            t.tier === tierOpt
                              ? 'text-neutral-500 cursor-default'
                              : 'hover:bg-[#252525] text-neutral-300'
                          }`}
                        >
                          <span>{tierOpt}</span>
                          {t.tier === tierOpt && <span className="text-[10px] text-emerald-400">current</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
