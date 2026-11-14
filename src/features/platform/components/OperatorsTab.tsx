import React from 'react';
import type { PlatformOperator } from '../types';
import { ShieldAlert } from 'lucide-react';

interface OperatorsTabProps {
  operators: PlatformOperator[];
}

export const OperatorsTab: React.FC<OperatorsTabProps> = ({ operators }) => {
  return (
    <div className="space-y-6 text-xs max-w-4xl font-sans">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Platform Operators</h2>
        <p className="text-[13px] text-[#999999] mt-1 leading-relaxed">
          Super administrators with global operational control over all tenant namespaces and runtime infrastructure.
        </p>
      </div>

      <div className="w-full border border-[#262626] rounded-md overflow-hidden bg-[#161616]">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#262626] text-[#737373] font-normal text-[12px]">
              <th className="py-2.5 px-4 font-normal">Operator</th>
              <th className="py-2.5 px-4 font-normal">Role</th>
              <th className="py-2.5 px-4 font-normal">Status</th>
              <th className="py-2.5 px-4 font-normal">Last active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202020] text-[#d4d4d4]">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-[10px] font-semibold flex items-center justify-center">
                      {op.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{op.name}</div>
                      <div className="text-[11px] font-mono text-[#777777]">{op.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-[12px] text-blue-400">
                  {op.role}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center space-x-1.5 text-emerald-400 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>active</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-[#888888] text-[12px] font-mono">
                  {op.last_active}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-800/40 text-[11px] text-blue-300 flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Super administrator actions are logged to the immutable audit trail. Impersonation of tenant sessions generates cryptographic proof signed by the operator identity.
        </p>
      </div>
    </div>
  );
};
