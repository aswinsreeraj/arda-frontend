import React from 'react';
import { ShieldAlert, MessageSquare, ShoppingCart, UserCheck, FileText } from 'lucide-react';

interface AgentRow {
  name: string;
  slug: string;
  version: string;
  toolsCount: number;
  threshold: string;
  escalationRate: string;
  rateColor: string;
  icon: React.ReactNode;
}

export const UseCasesSection: React.FC = () => {
  const agents: AgentRow[] = [
    {
      name: 'Fraud review',
      slug: 'fraud-review',
      version: 'v3.2.1',
      toolsCount: 6,
      threshold: '0.80',
      escalationRate: '7.4%',
      rateColor: 'text-[#f59e0b]',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-[#9ca3af]" />,
    },
    {
      name: 'Support triage',
      slug: 'support-triage',
      version: 'v1.9.0',
      toolsCount: 4,
      threshold: '0.70',
      escalationRate: '12.1%',
      rateColor: 'text-[#9ca3af]',
      icon: <MessageSquare className="w-3.5 h-3.5 text-[#9ca3af]" />,
    },
    {
      name: 'Procurement',
      slug: 'procurement-approval',
      version: 'v2.0.4',
      toolsCount: 5,
      threshold: '0.85',
      escalationRate: '9.8%',
      rateColor: 'text-[#9ca3af]',
      icon: <ShoppingCart className="w-3.5 h-3.5 text-[#9ca3af]" />,
    },
    {
      name: 'KYC onboarding',
      slug: 'kyc-onboarding',
      version: 'v0.7.2',
      toolsCount: 3,
      threshold: '0.90',
      escalationRate: '18.3%',
      rateColor: 'text-[#f59e0b]',
      icon: <UserCheck className="w-3.5 h-3.5 text-[#9ca3af]" />,
    },
    {
      name: 'Claims intake',
      slug: 'claims-intake',
      version: 'v1.1.0',
      toolsCount: 7,
      threshold: '0.75',
      escalationRate: '5.2%',
      rateColor: 'text-[#10b981]',
      icon: <FileText className="w-3.5 h-3.5 text-[#9ca3af]" />,
    },
  ];

  return (
    <section className="py-20 border-b border-slate-200 dark:border-[#282828] bg-white dark:bg-[#131313] transition-colors" id="use-cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Copy */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider font-medium">
              Enterprise Agent Fleet
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              One platform, any agent use case.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9ca3af] leading-relaxed">
              ARDA abstracts runtime governance across any domain — fraud detection, customer support,
              procurement, claims, or data analysis. Every agent shares the same durable execution engine,
              policy gateway, and human review infrastructure.
            </p>
            <div className="pt-4 text-xs font-mono text-slate-500 dark:text-[#6b7280] space-y-1">
              <div>same runtime · same gateway · same review queue</div>
              <div className="text-[11px] text-slate-500 dark:text-[#6b7280]/80">
                Per-agent calibrated safety thresholds adapt dynamically.
              </div>
            </div>
          </div>

          {/* Right Column: Agent Registry Table */}
          <div className="lg:col-span-8 overflow-hidden rounded-xl border border-slate-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-slate-200 dark:border-[#282828] bg-slate-50 dark:bg-[#1c1c1c] text-slate-600 dark:text-[#6b7280] text-xs">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Agent
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Version
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Tools
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Threshold τ
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-right" scope="col">
                      Escalation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#282828]">
                  {agents.map((agent) => (
                    <tr
                      key={agent.slug}
                      className="hover:bg-slate-50 dark:hover:bg-[#1c1c1c]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-[#131313] border border-slate-200 dark:border-[#282828] flex items-center justify-center text-slate-600 dark:text-[#9ca3af]">
                            {agent.icon}
                          </div>
                          <div>
                            <div className="text-slate-900 dark:text-white font-medium font-sans">{agent.name}</div>
                            <div className="text-xs text-slate-500 dark:text-[#8c8c8c] font-mono">{agent.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-[#9ca3af]">{agent.version}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-[#9ca3af]">{agent.toolsCount}</td>
                      <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">{agent.threshold}</td>
                      <td className={`py-3.5 px-4 text-right font-medium ${agent.rateColor}`}>
                        {agent.escalationRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
