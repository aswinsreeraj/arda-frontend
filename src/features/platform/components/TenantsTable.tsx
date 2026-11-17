import React, { useState } from 'react';
import type { PlatformTenant, TenantStatus, TenantTier } from '../types';
import { MoreHorizontal, Ban, Zap } from 'lucide-react';

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
  const [menuAnchor, setMenuAnchor] = useState<{
    id: string;
    top: number;
    right: number;
  } | null>(null);

  const activeTenant = menuAnchor ? tenants.find((t) => t.id === menuAnchor.id) : null;

  return (
    <div className="w-full border border-[#262626] rounded-md bg-[#161616]">
      <table className="w-full text-left text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-[#262626] text-[#737373] text-[11px] uppercase tracking-wider font-mono">
            <th className="py-2.5 px-4 font-normal">Organization</th>
            <th className="py-2.5 px-4 font-normal">Tier</th>
            <th className="py-2.5 px-4 font-normal">Status</th>
            <th className="py-2.5 px-4 font-normal text-right pr-6">Agents</th>
            <th className="py-2.5 px-4 font-normal text-right pr-6">Members</th>
            <th className="py-2.5 px-4 font-normal">Onboarded</th>
            <th className="py-2.5 px-4 font-normal w-8 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e1e1e]">
          {tenants.map((t) => {
            return (
              <tr
                key={t.id}
                className="hover:bg-[#1a1a1a] group transition-colors"
              >
                {/* Organization */}
                <td className="py-3 px-4">
                  <div className="font-medium text-white">{t.name}</div>
                  <div className="text-xs font-mono text-[#8c8c8c] mt-0.5">
                    {t.slug || t.id.slice(0, 8)} · {t.id}
                  </div>
                </td>

                {/* Tier */}
                <td className="py-3 px-4 font-mono text-[#a1a1aa] capitalize">
                  {t.tier || 'enterprise'}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  {t.status === 'active' ? (
                    <span className="inline-flex items-center text-[#22c55e] space-x-1.5 font-mono text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                      <span>active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[#ef4444] space-x-1.5 font-mono text-xs">
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
                  {t.created_at ? t.created_at.slice(0, 10) : '—'}
                </td>

                {/* Context Menu Trigger */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={(e) => {
                      if (menuAnchor?.id === t.id) {
                        setMenuAnchor(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const menuHeight = 180;
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;
                        setMenuAnchor({
                          id: t.id,
                          top: openUpwards ? Math.max(10, rect.top - menuHeight) : rect.bottom + 4,
                          right: Math.max(16, window.innerWidth - rect.right),
                        });
                      }
                    }}
                    className="text-[#525252] group-hover:text-[#a1a1aa] hover:text-white cursor-pointer px-1.5 py-1 rounded hover:bg-[#222] transition-colors"
                    title="Tenant Actions"
                    type="button"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Floating Unclipped Context Menu */}
      {menuAnchor && activeTenant && (
        <>
          <div
            className="fixed inset-0 z-[999] bg-transparent"
            onClick={() => setMenuAnchor(null)}
          />
          <div
            style={{
              position: 'fixed',
              top: `${menuAnchor.top}px`,
              right: `${menuAnchor.right}px`,
            }}
            className="w-48 rounded-md bg-[#1c1c1c] border border-[#2e2e2e] shadow-2xl py-1 text-xs text-neutral-300 z-[1000] text-left font-sans select-none animate-in fade-in zoom-in-95 duration-100"
          >
            {activeTenant.status === 'suspended' ? (
              <button
                onClick={() => {
                  setMenuAnchor(null);
                  onToggleStatus(activeTenant, 'active');
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#252525] flex items-center space-x-2 text-emerald-400 cursor-pointer"
                type="button"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Reactivate tenant</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMenuAnchor(null);
                  if (
                    confirm(
                      `Suspend organization "${activeTenant.name}"? Active user logins and API executions will be immediately halted.`
                    )
                  ) {
                    onToggleStatus(activeTenant, 'suspended');
                  }
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#252525] flex items-center space-x-2 text-rose-400 cursor-pointer"
                type="button"
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
                disabled={activeTenant.tier === tierOpt}
                onClick={() => {
                  setMenuAnchor(null);
                  onChangeTier(activeTenant, tierOpt);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between capitalize text-[11px] ${
                  activeTenant.tier === tierOpt
                    ? 'text-neutral-500 cursor-default bg-[#181818]'
                    : 'hover:bg-[#252525] text-neutral-300 cursor-pointer'
                }`}
                type="button"
              >
                <span>{tierOpt}</span>
                {activeTenant.tier === tierOpt && (
                  <span className="text-[10px] text-emerald-400 font-mono">current</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
