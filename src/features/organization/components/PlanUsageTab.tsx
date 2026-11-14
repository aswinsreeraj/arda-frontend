import React from 'react';
import { CreditCard, Download, ShieldCheck, Zap } from 'lucide-react';

interface PlanUsageTabProps {
  memberCount: number;
}

export const PlanUsageTab: React.FC<PlanUsageTabProps> = ({ memberCount }) => {
  const seatsQuota = 25;
  const seatsPercentage = Math.round((memberCount / seatsQuota) * 100);

  const executionsUsed = 42810;
  const executionsQuota = 100000;
  const execPercentage = Math.round((executionsUsed / executionsQuota) * 100);

  const invoices = [
    { id: 'INV-2026-09', date: '2026-09-30', amount: '$3,200.00', status: 'Paid' },
    { id: 'INV-2026-08', date: '2026-08-31', amount: '$3,200.00', status: 'Paid' },
    { id: 'INV-2026-07', date: '2026-07-31', amount: '$3,200.00', status: 'Paid' },
  ];

  return (
    <div className="space-y-6 text-xs max-w-5xl font-sans">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Plan & Usage</h2>
        <p className="text-[13px] text-[#999999] mt-1 leading-relaxed">
          Monitor seats utilization, monthly execution quotas, and enterprise billing invoices.
        </p>
      </div>

      {/* Plan Tier Banner */}
      <div className="p-5 rounded-lg bg-[#161616] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-base">Enterprise Governance</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                Active Subscription
              </span>
            </div>
            <p className="text-[#888888] text-[12px] mt-0.5">
              Dedicated Temporal cluster, HashiCorp Vault BYOK integration, and immutable hash-chains.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white font-mono">$3,200 / mo</div>
          <span className="text-[11px] text-[#777777]">Next invoice Nov 30, 2026</span>
        </div>
      </div>

      {/* Quotas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Seats */}
        <div className="p-4 rounded-lg bg-[#161616] border border-[#262626] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Team Seats</span>
            <span className="font-mono text-white text-[12px]">
              {memberCount} / {seatsQuota}
            </span>
          </div>
          <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(seatsPercentage, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-[#777777]">
            {seatsQuota - memberCount} seats available in current tier
          </div>
        </div>

        {/* Executions */}
        <div className="p-4 rounded-lg bg-[#161616] border border-[#262626] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Monthly Executions</span>
            <span className="font-mono text-white text-[12px]">
              {executionsUsed.toLocaleString()} / {executionsQuota.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${execPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-[#777777]">
            {execPercentage}% used · resets in 16 days
          </div>
        </div>

        {/* Audit Retention */}
        <div className="p-4 rounded-lg bg-[#161616] border border-[#262626] space-y-2">
          <div className="flex items-center space-x-2 text-white font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Retention</span>
          </div>
          <div className="text-base font-bold text-white font-mono mt-1">365 Days</div>
          <div className="text-[11px] text-[#777777]">
            SHA-256 tamper-evident hash-chain preservation
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Billing Invoices</h3>
        <div className="w-full border border-[#262626] rounded-md overflow-hidden bg-[#161616]">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[#262626] text-[#737373] font-normal text-[12px]">
                <th className="py-2.5 px-4 font-normal">Invoice ID</th>
                <th className="py-2.5 px-4 font-normal">Date</th>
                <th className="py-2.5 px-4 font-normal">Amount</th>
                <th className="py-2.5 px-4 font-normal">Status</th>
                <th className="py-2.5 px-4 font-normal text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020] text-[#d4d4d4]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[12px] text-white flex items-center space-x-2">
                    <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{inv.id}</span>
                  </td>
                  <td className="py-3 px-4 text-[#888888] font-mono text-[12px]">{inv.date}</td>
                  <td className="py-3 px-4 font-mono text-[12px] text-white">{inv.amount}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading receipt for ${inv.id}`)}
                      className="p-1 text-[#666666] hover:text-white rounded transition-colors"
                      title="Download receipt PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
