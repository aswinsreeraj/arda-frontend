import React, { useState, useMemo } from 'react';
import type { SystemActivityEvent } from '../types';
import { Search, ShieldAlert, History } from 'lucide-react';

interface PlatformAuditLogTabProps {
  events: SystemActivityEvent[];
}

export const PlatformAuditLogTab: React.FC<PlatformAuditLogTabProps> = ({ events }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        e.operator.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  return (
    <div className="space-y-6 text-xs max-w-5xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Audit Log</h2>
          <p className="text-[13px] text-[#999999] mt-1 leading-relaxed">
            Global log of administrative changes executed by platform super administrators.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181818] border border-[#2b2b2b] text-[12px] rounded pl-8 pr-3 py-1.5 text-[#d4d4d4] placeholder-[#555] focus:outline-none focus:border-[#404040]"
            placeholder="Search action, details, operator"
            type="text"
          />
        </div>
      </div>

      <div className="w-full border border-[#262626] rounded-md overflow-hidden bg-[#161616]">
        <table className="w-full text-left text-[12px] border-collapse">
          <thead>
            <tr className="border-b border-[#262626] text-[#737373] text-[11px] uppercase tracking-wider font-mono">
              <th className="py-2.5 px-4 font-normal w-32">Timestamp</th>
              <th className="py-2.5 px-4 font-normal">Super Admin</th>
              <th className="py-2.5 px-4 font-normal">Action & Scope</th>
              <th className="py-2.5 px-4 font-normal">Change Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202020] text-[#d4d4d4]">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[#666666]">
                  <History className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  No platform audit events matching your criteria.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[#888888] whitespace-nowrap">
                    {evt.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {evt.operator.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-mono text-white text-[11px] truncate max-w-[200px]">
                        {evt.operator}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{evt.title}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#999999]">
                    {evt.detail}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 rounded-lg bg-[#181818] border border-[#282828] text-[11px] text-[#888888] flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Platform-level events capture global operations such as organization suspension, tier modifications, super administrator provisioning, and cluster parameter tuning.
        </p>
      </div>
    </div>
  );
};
