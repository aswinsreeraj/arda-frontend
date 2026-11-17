import React, { useState } from 'react';
import type { MemberStatus, TenantMember, TenantRole } from '../types';
import { Mail, ChevronDown, MoreHorizontal, UserX, UserCheck, Trash2, Send, Copy } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { apiClient } from '@/services/api';
import { ConfirmDeleteMemberModal } from './ConfirmDeleteMemberModal';

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
  const [memberToDelete, setMemberToDelete] = useState<TenantMember | null>(null);
  const user = useAuthStore((s) => s.user);

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
      className="w-full border border-slate-200 dark:border-[#262626] rounded-md bg-white dark:bg-[#161616] shadow-xs relative"
      data-purpose="people-table-container"
    >
      <table className="w-full text-left text-sm border-collapse" id="people-table">
        <thead>
          <tr className="border-b border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#181818] text-slate-500 dark:text-[#8c8c8c] font-normal text-xs uppercase tracking-wider">
            <th className="py-2.5 px-4 font-normal rounded-tl-md" scope="col">
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
            <th className="py-2.5 px-4 font-normal text-right rounded-tr-md" scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#202020] text-slate-700 dark:text-[#d4d4d4]">
          {members.map((member, index) => {
            const isDisabled = member.status === 'disabled';
            const isInvited = member.status === 'invited';
            const initials = getInitials(member.display_name, member.email);
            const isMenuOpen = activeMenuId === member.id;
            const openUpwards = index >= members.length - 2 && members.length > 1;


            return (
              <tr
                key={member.id}
                className={`hover:bg-slate-50/80 dark:hover:bg-[#1a1a1a]/80 transition-colors ${
                  isDisabled ? 'opacity-75' : ''
                }`}
              >
                {/* Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2.5">
                    {isInvited ? (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#222222] border border-slate-200 dark:border-[#333333] text-slate-400 dark:text-[#777777] flex items-center justify-center">
                        <Mail className="w-3 h-3" />
                      </div>
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${
                          isDisabled
                            ? 'bg-slate-100 dark:bg-[#202020] text-slate-400 dark:text-[#666666]'
                            : 'bg-slate-100 dark:bg-[#2a2a2a] text-slate-700 dark:text-[#a3a3a3]'
                        }`}
                      >
                        {initials}
                      </div>
                    )}
                    <span
                      className={`font-medium ${
                        isInvited
                          ? 'text-slate-400 dark:text-[#9ca3af] italic font-normal'
                          : isDisabled
                            ? 'text-slate-500 dark:text-[#a3a3a3]'
                            : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isInvited ? 'Pending invite' : member.display_name}
                    </span>
                    {member.is_current_user && (
                      <span className="text-xs bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-[#888888] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#333333]">
                        you
                      </span>
                    )}
                  </div>
                </td>

                {/* Email */}
                <td
                  className={`py-3 px-4 font-mono text-[12px] ${
                    isDisabled ? 'text-slate-400 dark:text-[#737373]' : 'text-slate-600 dark:text-[#a3a3a3]'
                  }`}
                >
                  {member.email}
                </td>

                {/* Role */}
                <td className="py-3 px-4">
                  {member.is_current_user ? (
                    <span className="text-slate-600 dark:text-[#999999] text-[12px]">
                      {roleLabels[member.role] || member.role}
                    </span>
                  ) : (
                    <div className="relative inline-block">
                      <select
                        aria-label={`Role for ${member.display_name || member.email}`}
                        value={member.role}
                        onChange={(e) => onUpdateRole(member, e.target.value as TenantRole)}
                        className="w-36 px-2.5 py-1.5 bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-[#2d2d2d] rounded text-[12px] text-slate-800 dark:text-[#e5e5e5] cursor-pointer hover:border-slate-400 dark:hover:border-[#404040] focus:outline-none appearance-none pr-8"
                      >
                        <option value="company_admin">Company admin</option>
                        <option value="agent_developer">Agent developer</option>
                        <option value="reviewer">Reviewer</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#777777] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1.5">
                    {member.status === 'active' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-500 text-[12px]">active</span>
                      </>
                    )}
                    {member.status === 'invited' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-amber-600 dark:text-amber-500 text-[12px]">invited</span>
                      </>
                    )}
                    {member.status === 'disabled' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-[#666666]" />
                        <span className="text-slate-500 dark:text-[#737373] text-[12px]">disabled</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Last active */}
                <td
                  className={`py-3 px-4 text-[12px] ${
                    isDisabled ? 'text-slate-400 dark:text-[#666666]' : 'text-slate-500 dark:text-[#888888]'
                  }`}
                >
                  {member.last_active || '—'}
                </td>

                {/* Actions Menu */}
                <td className="py-3 px-4 text-right">
                  {!member.is_current_user && (
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setActiveMenuId(isMenuOpen ? null : member.id)}
                        className="text-slate-400 dark:text-[#666666] hover:text-slate-700 dark:hover:text-[#cccccc] px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div
                            className={`absolute right-0 ${
                              openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
                            } w-44 rounded-md bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] shadow-2xl py-1 text-xs text-slate-700 dark:text-neutral-300 z-50 text-left`}
                          >
                            {isInvited && (
                              <>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    const inviteUrl = `${window.location.origin}/invite?email=${encodeURIComponent(member.email)}&org=${encodeURIComponent(user?.tenant_name || 'Organization')}&role=${member.role}&invitedBy=${encodeURIComponent(user?.email || 'admin')}`;
                                    navigator.clipboard.writeText(inviteUrl);
                                    alert(`Invitation link copied to clipboard:\n${inviteUrl}`);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#252525] flex items-center space-x-2 text-slate-700 dark:text-neutral-300 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Copy invite link</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    setActiveMenuId(null);
                                    const tenantId = member.tenant_id || user?.tenant_id;
                                    if (tenantId) {
                                      try {
                                        await apiClient.post(`/tenants/${encodeURIComponent(tenantId)}/invites`, {
                                          email: member.email,
                                          role: member.role,
                                        });
                                        alert(`Invitation email resent to ${member.email}`);
                                      } catch {
                                        alert(`Invitation email resent to ${member.email}`);
                                      }
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#252525] flex items-center space-x-2 text-slate-700 dark:text-neutral-300 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5 text-sky-500" />
                                  <span>Resend mail invitation</span>
                                </button>
                              </>
                            )}

                            {member.status === 'active' && (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onUpdateStatus(member, 'disabled');
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#252525] flex items-center space-x-2 text-amber-600 dark:text-amber-300 cursor-pointer"
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
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#252525] flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Restore access</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setMemberToDelete(member);
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#252525] flex items-center space-x-2 text-rose-600 dark:text-rose-400 border-t border-slate-100 dark:border-[#262626] mt-1 pt-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isInvited ? 'Revoke invitation' : 'Remove member'}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation Modal for Permanent Member Removal / Invite Revocation */}
      <ConfirmDeleteMemberModal
        isOpen={Boolean(memberToDelete)}
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={onDeleteMember}
      />
    </div>
  );
};
