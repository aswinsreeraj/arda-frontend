import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ArrowRight } from 'lucide-react';

interface AuthCalloutBannerProps {
  onOpenApiKeyModal: () => void;
}

export const AuthCalloutBanner: React.FC<AuthCalloutBannerProps> = ({ onOpenApiKeyModal }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8000/api';

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <section className="p-4 lg:p-6 pb-0" data-purpose="auth-callout">
      <div className="bg-[#1c1c1c] border border-[#282828] rounded-lg p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-[#888888]" />
            <span>Authentication depends on the resource</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[#AAAAAA] text-[11px] leading-relaxed">
            <div>
              <span className="text-white font-semibold">Executions</span>
              <span className="font-mono text-white/90 ml-1.5 bg-[#141414] px-1.5 py-0.5 rounded border border-[#282828]">
                X-Arbiter-Key: $ARBITER_API_KEY
              </span>
              <span className="text-[#777777]"> · scoped to one tenant</span>
            </div>
            <div>
              <span className="text-white font-semibold">Agents, Reviews, Tools</span>
              <span className="font-mono text-white/90 ml-1.5 bg-[#141414] px-1.5 py-0.5 rounded border border-[#282828]">
                Authorization: Bearer $ARDA_JWT
              </span>
              <span className="text-[#777777]"> · dashboard session</span>
            </div>
          </div>
        </div>

        {/* Right Base URL & Key Actions */}
        <div className="flex items-center gap-3 shrink-0 self-start xl:self-center">
          <button
            onClick={handleCopyBaseUrl}
            type="button"
            className="flex items-center space-x-1.5 text-xs text-[#888888] hover:text-white font-mono bg-[#141414] px-2.5 py-1.5 rounded border border-[#282828] transition-colors"
            title="Click to copy API base URL"
          >
            <span>{baseUrl}</span>
            {copiedUrl ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#666666] ml-1" />
            )}
          </button>
          <button
            onClick={onOpenApiKeyModal}
            type="button"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 rounded font-medium transition-colors text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <span>Generate API key</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
