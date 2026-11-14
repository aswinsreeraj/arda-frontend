import React, { useState, useId } from 'react';
import type { TenantTier } from '../types';
import { X } from 'lucide-react';

interface OnboardTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOnboard: (name: string, slug: string, tier: TenantTier) => Promise<void>;
}

export const OnboardTenantModal: React.FC<OnboardTenantModalProps> = ({
  isOpen,
  onClose,
  onOnboard,
}) => {
  const [orgName, setOrgName] = useState('');
  const [tier, setTier] = useState<TenantTier>('growth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orgNameId = useId();

  if (!isOpen) return null;

  const slug = orgName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsSubmitting(true);
    try {
      await onOnboard(orgName.trim(), slug, tier);
      setOrgName('');
      setTier('growth');
      onClose();
    } catch (err) {
      console.error('Failed to onboard tenant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg w-full max-w-[480px] shadow-2xl p-6 relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close dialog"
          className="absolute top-5 right-5 text-[#737373] hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div>
          <h3 id="onboard-modal-title" className="text-base font-semibold text-white tracking-tight">
            Onboard tenant
          </h3>
          <p className="text-[12px] text-[#737373] mt-0.5 leading-relaxed">
            Creates an isolated organization and provisions its runtime namespace.
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Org Name Field */}
          <div>
            <label htmlFor={orgNameId} className="block text-[12px] font-medium text-[#d4d4d4] mb-1">
              Organization name
            </label>
            <input
              id={orgNameId}
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Northwind Freight"
              className="w-full bg-[#141414] border border-[#2e2e2e] text-[13px] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-sans"
            />
            <div className="text-[11px] font-mono text-[#666] mt-1">
              slug — <span className="text-[#888]">{slug || '-'}</span>
            </div>
          </div>

          {/* Tier Selection */}
          <div>
            <span className="block text-[12px] font-medium text-[#d4d4d4] mb-2">Tier</span>
            <div className="space-y-2">
              {/* Starter Tier */}
              <label
                className={`flex items-start p-3 rounded border cursor-pointer transition ${
                  tier === 'starter'
                    ? 'border-blue-600/60 bg-[#172033]/30'
                    : 'border-[#2b2b2b] bg-[#161616] hover:bg-[#1f1f1f]'
                }`}
              >
                <input
                  type="radio"
                  name="tenantTier"
                  value="starter"
                  checked={tier === 'starter'}
                  onChange={() => setTier('starter')}
                  className="mt-0.5 text-blue-600 bg-[#121212] border-[#3a3a3a] focus:ring-0 focus:ring-offset-0"
                />
                <div className="ml-3 text-[12px]">
                  <div className="text-white font-medium">Starter</div>
                  <div className="text-[11px] text-[#737373]">
                    Up to 5 agents · shared runtime · community support
                  </div>
                </div>
              </label>

              {/* Growth Tier */}
              <label
                className={`flex items-start p-3 rounded border cursor-pointer transition ${
                  tier === 'growth'
                    ? 'border-blue-600/60 bg-[#172033]/30'
                    : 'border-[#2b2b2b] bg-[#161616] hover:bg-[#1f1f1f]'
                }`}
              >
                <input
                  type="radio"
                  name="tenantTier"
                  value="growth"
                  checked={tier === 'growth'}
                  onChange={() => setTier('growth')}
                  className="mt-0.5 text-blue-600 bg-[#121212] border-[#3a3a3a] focus:ring-0 focus:ring-offset-0"
                />
                <div className="ml-3 text-[12px]">
                  <div className="text-white font-medium">Growth</div>
                  <div className="text-[11px] text-[#737373]">
                    Up to 50 agents · shared runtime · 99.9% SLA
                  </div>
                </div>
              </label>

              {/* Enterprise Tier */}
              <label
                className={`flex items-start p-3 rounded border cursor-pointer transition ${
                  tier === 'enterprise'
                    ? 'border-blue-600/60 bg-[#172033]/30'
                    : 'border-[#2b2b2b] bg-[#161616] hover:bg-[#1f1f1f]'
                }`}
              >
                <input
                  type="radio"
                  name="tenantTier"
                  value="enterprise"
                  checked={tier === 'enterprise'}
                  onChange={() => setTier('enterprise')}
                  className="mt-0.5 text-blue-600 bg-[#121212] border-[#3a3a3a] focus:ring-0 focus:ring-offset-0"
                />
                <div className="ml-3 text-[12px]">
                  <div className="text-white font-medium">Enterprise</div>
                  <div className="text-[11px] text-[#737373]">
                    Unlimited agents · isolated runtime · 99.95% SLA
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-4">
            <button
              onClick={onClose}
              type="button"
              className="px-3.5 py-1.5 text-[12px] font-medium rounded text-[#a1a1aa] hover:text-white hover:bg-[#252525] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !orgName.trim()}
              className="px-3.5 py-1.5 text-[12px] font-medium rounded bg-[#2563eb] text-white hover:bg-blue-600 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Onboarding...' : 'Onboard tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
