import React, { useState } from 'react';
import type { TenantRole } from '../types';
import { X, RefreshCw } from 'lucide-react';

interface InvitePersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: TenantRole) => Promise<void>;
}

export const InvitePersonModal: React.FC<InvitePersonModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TenantRole>('reviewer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onInvite(email.trim(), role);
      setEmail('');
      setRole('reviewer');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="invite-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#1b1b1b] border border-[#2d2d2d] rounded-xl w-full max-w-[460px] p-6 shadow-2xl relative text-left">
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="invite-modal-title" className="text-base font-semibold text-white">
              Invite person
            </h2>
            <p className="text-xs text-[#8e8e8e] mt-0.5">
              They'll get an email link to join this organization.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#777777] hover:text-white transition-colors p-1 rounded-md"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input Field */}
          <div>
            <label className="block text-xs font-medium text-[#cccccc] mb-1.5" htmlFor="inviteEmail">
              Email
            </label>
            <input
              id="inviteEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full bg-[#131313] border border-[#2c2c2c] text-xs text-white placeholder-[#555555] rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-[#6b7280] mt-1">
              An invitation email with a secure setup link will be sent to this address.
            </p>
          </div>

          {/* Role Selection Field (Radio Group Container) */}
          <div>
            <span className="block text-xs font-medium text-[#cccccc] mb-1.5">Role</span>
            <div
              className="border border-[#2a2a2a] rounded-lg divide-y divide-[#262626] bg-[#141414] overflow-hidden"
              data-purpose="role-radio-options"
            >
              {/* Role Option 1: Agent Developer */}
              <label className="flex items-start p-3 cursor-pointer hover:bg-[#191919] transition-colors">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    name="userRole"
                    value="agent_developer"
                    checked={role === 'agent_developer'}
                    onChange={() => setRole('agent_developer')}
                    className="h-4 w-4 text-indigo-600 bg-[#222222] border-[#383838] focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0"
                  />
                </div>
                <div className="ml-2.5 text-xs">
                  <div className="font-medium text-white">Agent developer</div>
                  <div className="text-[#777777] text-[11px] mt-0.5 leading-snug">
                    Register and version agents, edit tool policies and thresholds.
                  </div>
                </div>
              </label>

              {/* Role Option 2: Reviewer */}
              <label className="flex items-start p-3 cursor-pointer hover:bg-[#191919] transition-colors">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    name="userRole"
                    value="reviewer"
                    checked={role === 'reviewer'}
                    onChange={() => setRole('reviewer')}
                    className="h-4 w-4 text-indigo-600 bg-[#222222] border-[#383838] focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0"
                  />
                </div>
                <div className="ml-2.5 text-xs">
                  <div className="font-medium text-white">Reviewer</div>
                  <div className="text-[#777777] text-[11px] mt-0.5 leading-snug">
                    Work the escalation queue and record verdicts.
                  </div>
                </div>
              </label>

              {/* Role Option 3: Company admin */}
              <label className="flex items-start p-3 cursor-pointer hover:bg-[#191919] transition-colors">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    name="userRole"
                    value="company_admin"
                    checked={role === 'company_admin'}
                    onChange={() => setRole('company_admin')}
                    className="h-4 w-4 text-indigo-600 bg-[#222222] border-[#383838] focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0"
                  />
                </div>
                <div className="ml-2.5 text-xs">
                  <div className="font-medium text-white">Company admin</div>
                  <div className="text-[#777777] text-[11px] mt-0.5 leading-snug">
                    Manage people, SSO, API keys, and all organization settings.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              type="button"
              className="px-3.5 py-1.5 text-xs font-medium text-[#d1d5db] bg-[#222222] hover:bg-[#282828] border border-[#333333] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#4338ca] hover:bg-[#4f46e5] rounded-md transition-colors shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Send invite</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
