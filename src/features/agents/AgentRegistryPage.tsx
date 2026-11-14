import React from 'react';
import { Search, Plus } from 'lucide-react';

export const AgentRegistryPage: React.FC = () => {
  const agents = [
    {
      name: 'Fraud review',
      id: 'fraud-review',
      mode: 'durable',
      version: 'v3.2.1',
      tau: '0.80',
      status: 'published',
      updated: '3 hours ago',
    },
    {
      name: 'Support triage',
      id: 'support-triage',
      mode: 'realtime',
      version: 'v1.9.0',
      tau: '0.70',
      status: 'published',
      updated: '3 days ago',
    },
    {
      name: 'Procurement approval',
      id: 'procurement-approval',
      mode: 'durable',
      version: 'v2.0.4',
      tau: '0.85',
      status: 'published',
      updated: '12 days ago',
    },
    {
      name: 'KYC onboarding',
      id: 'kyc-onboarding',
      mode: 'durable',
      version: '—',
      tau: '0.90',
      status: 'draft',
      updated: '20 hours ago',
    },
    {
      name: 'Refund assistant',
      id: 'refund-assistant',
      mode: 'realtime',
      version: '—',
      tau: '0.80',
      status: 'draft',
      updated: '5 days ago',
    },
  ];

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 overflow-y-auto">
      {/* View Switcher & Title */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Agent Registry</h1>
          <div className="flex items-center bg-[#1c1c1c] p-1 rounded-lg border border-[#2e2e2e] text-xs">
            <span className="text-[#9ca3af] px-2">Screen View:</span>
            <button className="px-2.5 py-1 rounded bg-[#2c2c2c] text-white font-medium shadow-sm">
              Registry Table
            </button>
            <button className="px-2.5 py-1 rounded text-[#9ca3af] hover:text-white transition">
              Config Inspector
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#282828] space-x-6">
          <button className="pb-3 text-sm font-medium border-b-2 border-white text-white flex items-center space-x-2">
            <span>Agents</span>
            <span className="text-[11px] font-mono bg-[#282828] text-gray-300 px-1.5 py-0.5 rounded">
              5
            </span>
          </button>
          <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-[#8e8e93] hover:text-white flex items-center space-x-2">
            <span>MCP Servers</span>
            <span className="text-[11px] font-mono bg-[#282828] text-gray-400 px-1.5 py-0.5 rounded">
              5
            </span>
          </button>
          <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-[#8e8e93] hover:text-white flex items-center space-x-2">
            <span>LLM Keys</span>
            <span className="text-[11px] font-mono bg-[#282828] text-gray-400 px-1.5 py-0.5 rounded">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Filter by name or ID"
            className="w-full pl-9 pr-3 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-md text-xs text-white placeholder-gray-500 focus:border-blue-500 transition"
          />
        </div>
        <button className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-medium transition shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>Register agent</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="border border-[#262626] rounded-lg overflow-hidden bg-[#181818]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#262626] text-[11px] uppercase tracking-wider text-[#828282] font-semibold bg-[#161616]">
              <th className="py-3 px-4">Agent</th>
              <th className="py-3 px-4">Execution</th>
              <th className="py-3 px-4">Active version</th>
              <th className="py-3 px-4 font-mono">Threshold τ</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424] text-xs">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-[#1d1d1d] cursor-pointer transition">
                <td className="py-3.5 px-4">
                  <div className="font-medium text-white text-sm">{agent.name}</div>
                  <div className="font-mono text-[11px] text-[#71717a]">{agent.id}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#1e293b] text-[#93c5fd] border border-[#2563eb]/30">
                    {agent.mode}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-gray-300">{agent.version}</td>
                <td className="py-3.5 px-4 font-mono font-medium text-gray-200">{agent.tau}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#064e3b]/30 text-[#34d399] border border-[#059669]/40 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>{agent.status}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-400">{agent.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};
