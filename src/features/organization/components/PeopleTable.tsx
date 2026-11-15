import React, { useState } from 'react';
import type { MemberStatus, TenantMember, TenantRole } from '../types';
import { Mail, ChevronDown, MoreHorizontal, UserX, UserCheck, Trash2, Send } from 'lucide-react';

interface PeopleTableProps {
  members: TenantMember[];
  onUpdateRole: (member: TenantMember, newRole: TenantRole) => Promise<void>;
  onUpdateStatus: (member: TenantMember, newStatus: MemberStatus) => Promise<void>;
  onDeleteMember: (member: TenantMember) => Promise<void>;
}

export const PeopleTable: React.FC<PeopleTableProps> = ({
  members,
  onUpdateRole,
  onUpdateStatus,
  onDeleteMember,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getInitials = (name: string, email: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const roleLabels: Record<TenantRole, string> = {
    company_admin: 'Company admin',
    agent_developer: 'Agent developer',
    reviewer: 'Reviewer',
  };

  return (
    <div
      className="w-full border border-[#262626] rounded-md overflow-hidden bg-[#161616]"
      data-purpose="people-table-container"
    >
      <table className="w-full text-left text-sm border-collapse" id="people-table">
        <thead>
          <tr className="border-b border-[#262626] text-[#8c8c8c] font-normal text-xs uppercase tracking-wider">
            <th className="py-2.5 px-4 font-normal" scope="col">
              Name
            </th>
            <th className="py-2.5 px-4 font-normal" scope="col">
              Email
            </th>
            <th className="py-2.5 px-4 font-normal" scope="col">
              Role
            </th>
            <th className="py-2.5 px-4 font-normal" scope="col">
              Status
            </th>
            <th className="py-2.5 px-4 font-normal" scope="col">
              Last active
            </th>
            <th className="py-2.5 px-4 font-normal text-right" scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#202020] text-[#d4d4d4]">
          {members.map((member) => {
            const isDisabled = member.status === 'disabled';
            const isInvited = member.status === 'invited';
            const initials = getInitials(member.display_name, member.email);
            const isMenuOpen = activeMenuId === member.id;

            return (
              <tr
                key={member.id}
                className={`hover:bg-[#1a1a1a]/80 transition-colors ${
                  isDisabled ? 'opacity-75' : ''
                }`}
              >
                {/* Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2.5">
                    {isInvited ? (
                      <div className="w-6 h-6 rounded-full bg-[#222222] border border-[#333333] text-[#777777] flex items-center justify-center">
                        <Mail className="w-3 h-3" />
                      </div>
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${
                          isDisabled
                            ? 'bg-[#202020] text-[#666666]'
                            : 'bg-[#2a2a2a] text-[#a3a3a3]'
                        }`}
                      >
                        {initials}
                      </div>
                    )}
                    <span
                      className={`font-medium ${
                        isInvited
                          ? 'text-[#9ca3af] italic font-normal'
                          : isDisabled
                            ? 'text-[#a3a3a3]'
                            : 'text-white'
                      }`}
                    >
                      {isInvited ? 'Pending invite' : member.display_name}
                    </span>
                    {member.is_current_user && (
                      <span className="text-xs bg-[#242424] text-[#888888] px-1.5 py-0.5 rounded border border-[#333333]">
                        you
                      </span>
                    )}
                  </div>
                </td>

                {/* Email */}
                <td
                  className={`py-3 px-4 font-mono text-[12px] ${
                    isDisabled ? 'text-[#737373]' : 'text-[#a3a3a3]'
                  }`}
                >
                  {member.email}
                </td>

                {/* Role */}
                <td className="py-3 px-4">
                  {member.is_current_user ? (
                    <span className="text-[#999999] text-[12px]">
                      {roleLabels[member.role] || member.role}
                    </span>
                  ) : (
                    <div className="relative inline-block">
                      <select
                        aria-label={`Role for ${member.display_name || member.email}`}
                        value={member.role}
                        onChange={(e) => onUpdateRole(member, e.target.value as TenantRole)}
                        className="w-36 px-2 py-1 bg-[#1a1a1a] border border-[#2d2d2d] rounded text-[12px] text-[#e5e5e5] cursor-pointer hover:border-[#404040] focus:outline-none appearance-none pr-6"
                      >
                        <option value="company_admin">Company admin</option>
                        <option value="agent_developer">Agent developer</option>
                        <option value="reviewer">Reviewer</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-[#777777] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1.5">
                    {member.status === 'active' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-emerald-500 text-[12px]">active</span>
                      </>
                    )}
                    {member.status === 'invited' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-amber-500 text-[12px]">invited</span>
                      </>
                    )}
                    {member.status === 'disabled' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#666666]" />
                        <span className="text-[#737373] text-[12px]">disabled</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Last active */}
                <td
                  className={`py-3 px-4 text-[12px] ${
                    isDisabled ? 'text-[#666666]' : 'text-[#888888]'
                  }`}
                >
                  {member.last_active || '—'}
                </td>

                {/* Actions Menu */}
                <td className="py-3 px-4 text-right relative">
                  {!member.is_current_user && (
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setActiveMenuId(isMenuOpen ? null : member.id)}
                        className="text-[#666666] hover:text-[#cccccc] px-1.5 py-0.5 rounded transition-colors"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-1 w-44 rounded-md bg-[#1c1c1c] border border-[#2e2e2e] shadow-xl py-1 text-xs text-neutral-300 z-50 text-left"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          {isInvited && (
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                alert(`Invitation re-sent to ${member.email}`);
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-[#252525] flex items-center space-x-2 text-neutral-300"
                            >
                              <Send className="w-3.5 h-3.5 text-sky-400" />
                              <span>Resend invitation</span>
                            </button>
                          )}

                          {member.status === 'active' && (
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onUpdateStatus(member, 'disabled');
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-[#252525] flex items-center space-x-2 text-amber-300"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Disable access</span>
                            </button>
                          )}

                          {member.status === 'disabled' && (
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onUpdateStatus(member, 'active');
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-[#252525] flex items-center space-x-2 text-emerald-400"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Restore access</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              if (confirm(`Remove ${member.email} from the organization?`)) {
                                onDeleteMember(member);
                              }
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-[#252525] flex items-center space-x-2 text-rose-400 border-t border-[#262626] mt-1 pt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove member</span>
                          </button>
                        </div>
                      )}
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
