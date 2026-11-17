import React, { useState } from 'react';
import { X, Shield, AlertCircle, Loader2 } from 'lucide-react';

interface AddSuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { email: string; display_name: string; password: string }) => Promise<void>;
}

export const AddSuperAdminModal: React.FC<AddSuperAdminModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        email: trimmedEmail,
        display_name: displayName.trim() || trimmedEmail.split('@')[0],
        password,
      });
      setEmail('');
      setDisplayName('');
      setPassword('');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to provision super administrator.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-[#161616] border border-[#2e2e2e] rounded-lg shadow-2xl p-6 relative font-sans text-xs">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#737373] hover:text-white transition-colors cursor-pointer"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Add Platform Super Admin
            </h2>
            <p className="text-[11px] text-[#737373]">
              Grants global administrative access across all tenant namespaces.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300 flex items-center space-x-2 text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#8c8c8c] uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@arda.security"
              className="w-full bg-[#121212] border border-[#2b2b2b] text-[12px] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 placeholder-[#555]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8c8c8c] uppercase mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full bg-[#121212] border border-[#2b2b2b] text-[12px] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 placeholder-[#555]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8c8c8c] uppercase mb-1">
              Password (min. 8 characters)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#121212] border border-[#2b2b2b] text-[12px] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 placeholder-[#555]"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-[#2b2b2b] text-[#a1a1aa] hover:bg-[#1f1f1f] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 bg-[#2563eb] hover:bg-blue-600 disabled:opacity-50 text-white font-medium px-4 py-1.5 rounded transition shadow-xs cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Adding...' : 'Add Super Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
