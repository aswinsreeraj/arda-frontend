import React, { useState } from 'react';
import type { TenantMember } from '../types';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface ConfirmDeleteMemberModalProps {
  isOpen: boolean;
  member: TenantMember | null;
  onClose: () => void;
  onConfirm: (member: TenantMember) => Promise<void>;
}

export const ConfirmDeleteMemberModal: React.FC<ConfirmDeleteMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const isInvited = member.status === 'invited';

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(member);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#1b1b1b] border border-[#2d2d2d] rounded-xl w-full max-w-[440px] p-6 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="confirm-delete-modal-title" className="text-base font-semibold text-white">
                {isInvited ? 'Revoke invitation' : 'Remove member'}
              </h2>
              <p className="text-xs text-[#8e8e8e] mt-0.5">
                {isInvited ? 'Cancel pending invitation' : 'Remove access for this user'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#777777] hover:text-white transition-colors p-1 rounded-md cursor-pointer"
            type="button"
            disabled={isDeleting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Body content */}
        <div className="space-y-3 mb-6">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Are you sure you want to {isInvited ? 'revoke the invitation for' : 'remove'}{' '}
            <span className="font-semibold text-white">{member.email}</span>?
          </p>

          {/* Irreversible warning alert box */}
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-rose-400">
              <span>This change is permanent and irreversible.</span>
            </div>
            <p className="text-[11px] text-rose-300/85 leading-normal">
              {isInvited
                ? 'The invitation token will be deleted immediately. The recipient will not be able to join using their link.'
                : 'This user will immediately lose access to all tenant agents, workspaces, credentials, and audit logs.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#252525] hover:bg-[#2d2d2d] border border-[#383838] rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <span>{isInvited ? 'Revoke invitation' : 'Remove member'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
