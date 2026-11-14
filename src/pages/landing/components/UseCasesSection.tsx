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
    <section className="py-20 border-b border-[#282828] bg-[#131313]" id="use-cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Copy */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider">
              Production Deployments
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              One platform, many agent types.
            </h2>
            <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
              ARDA doesn’t know what fraud or procurement is. Each agent is just a prompt, a tool
              set, and a decision policy — the runtime, gateway, and review queue are shared.
            </p>
            <div className="pt-4 text-xs font-mono text-[#6b7280] space-y-1">
              <div>same runtime · same gateway · same review queue</div>
              <div className="text-[11px] text-[#6b7280]/80">
                Per-agent calibrated τ thresholds update dynamically.
              </div>
            </div>
          </div>

          {/* Right Column: Agent Registry Table */}
          <div className="lg:col-span-8 overflow-hidden rounded-lg border border-[#282828] bg-[#181818]">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-[#282828] bg-[#1c1c1c] text-[#6b7280] text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 font-medium" scope="col">
                      Agent
                    </th>
                    <th className="py-3.5 px-4 font-medium" scope="col">
                      Version
                    </th>
                    <th className="py-3.5 px-4 font-medium" scope="col">
                      Tools
                    </th>
                    <th className="py-3.5 px-4 font-medium" scope="col">
                      Threshold τ
                    </th>
                    <th className="py-3.5 px-4 font-medium text-right" scope="col">
                      Escalation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {agents.map((agent) => (
                    <tr
                      key={agent.slug}
                      className="hover:bg-[#1c1c1c]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded bg-[#131313] border border-[#282828] flex items-center justify-center text-[#9ca3af]">
                            {agent.icon}
                          </div>
                          <div>
                            <div className="text-white font-medium font-sans">{agent.name}</div>
                            <div className="text-[10px] text-[#6b7280] font-mono">{agent.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#9ca3af]">{agent.version}</td>
                      <td className="py-3.5 px-4 text-[#9ca3af]">{agent.toolsCount}</td>
                      <td className="py-3.5 px-4 text-white font-medium">{agent.threshold}</td>
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
