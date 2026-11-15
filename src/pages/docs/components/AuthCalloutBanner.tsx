import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AuthCalloutBanner: React.FC = () => {
  return (
    <section className="p-4 lg:p-6 pb-0" data-purpose="auth-callout">
      <div className="bg-[#18181b] border border-[#282828] rounded-lg p-4">
        {/* Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-[#888888]" />
            <span>Authentication depends on the resource</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[#AAAAAA] text-[11px] leading-relaxed">
            <div>
              <span className="text-white font-semibold">Executions</span>
              <span className="font-mono text-white/90 ml-1.5 bg-[#141416] px-1.5 py-0.5 rounded border border-[#282828]">
                X-Arbiter-Key: $ARBITER_API_KEY
              </span>
              <span className="text-[#777777]"> · scoped to one tenant</span>
            </div>
            <div>
              <span className="text-white font-semibold">Agents, Reviews, Tools</span>
              <span className="font-mono text-white/90 ml-1.5 bg-[#141416] px-1.5 py-0.5 rounded border border-[#282828]">
                Authorization: Bearer $ARDA_JWT
              </span>
              <span className="text-[#777777]"> · dashboard session</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
