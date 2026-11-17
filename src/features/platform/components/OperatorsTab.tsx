import React, { useState } from 'react';
import type { PlatformOperator } from '../types';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { AddSuperAdminModal } from './AddSuperAdminModal';

interface OperatorsTabProps {
  operators: PlatformOperator[];
  onAddSuperAdmin: (data: { email: string; display_name: string; password: string }) => Promise<void>;
}

export const OperatorsTab: React.FC<OperatorsTabProps> = ({ operators, onAddSuperAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 text-xs max-w-4xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Operators</h2>
          <p className="text-[13px] text-[#999999] mt-1 leading-relaxed">
            Super administrators with platform governance over all tenant namespaces and runtime infrastructure.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          type="button"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Super Admin</span>
        </button>
      </div>

      <div className="w-full border border-[#262626] rounded-md overflow-hidden bg-[#161616]">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#262626] text-[#737373] font-normal text-[12px]">
              <th className="py-2.5 px-4 font-normal">Super Admin</th>
              <th className="py-2.5 px-4 font-normal">Privileges</th>
              <th className="py-2.5 px-4 font-normal">Status</th>
              <th className="py-2.5 px-4 font-normal">Created / Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202020] text-[#d4d4d4]">
            {operators.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#666666]">
                  No super administrators found.
                </td>
              </tr>
            ) : (
              operators.map((op) => (
                <tr key={op.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {(op.name || op.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{op.name || op.email.split('@')[0]}</div>
                        <div className="text-[11px] font-mono text-[#777777]">{op.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[12px] text-blue-400">
                    super_admin
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 rounded-lg bg-[#181818] border border-[#262626] text-[11px] text-[#999999] flex items-start space-x-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Super administrator accounts hold root platform authority. Only assign this role to trusted platform operators responsible for global infrastructure and tenancy controls.
        </p>
      </div>

      <AddSuperAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddSuperAdmin}
      />
    </div>
  );
};
