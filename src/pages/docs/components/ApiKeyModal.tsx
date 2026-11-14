import React, { useState } from 'react';
import { X, Copy, Check, Key, ShieldCheck, Terminal } from 'lucide-react';
import { AUTH_TOKEN_KEY, AUTH_TENANT_KEY } from '@/services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedJwt, setCopiedJwt] = useState(false);

  if (!isOpen) return null;

  const currentToken =
    typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) || '' : '';
  const currentTenant =
    typeof window !== 'undefined'
      ? localStorage.getItem(AUTH_TENANT_KEY) || 'tenant_acme_core'
      : 'tenant_acme_core';

  const simulatedApiKey = `arda_live_sec_${currentTenant.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}_99210f`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(simulatedApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyJwt = () => {
    navigator.clipboard.writeText(currentToken || 'No active JWT session found');
    setCopiedJwt(true);
    setTimeout(() => setCopiedJwt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-lg max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#282828] bg-[#1a1a1a]">
          <div className="flex items-center space-x-2.5">
            <Key className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Tenant API Keys & Authentication</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs text-[#BCBCBC]">
          {/* Server-to-Server Tenant API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Server API Key (X-Arbiter-Key)</span>
              </span>
              <span className="font-mono text-[10px] text-[#777777]">Scoped: {currentTenant}</span>
            </div>
            <p className="text-[11px] text-[#888888]">
              Use this key for durable agent execution calls (<code className="text-white">POST /api/v1/agents/:id/execute</code>).
            </p>
            <div className="flex items-center bg-[#141414] border border-[#282828] rounded px-3 py-2 font-mono text-xs">
              <span className="text-white flex-1 truncate select-all">{simulatedApiKey}</span>
              <button
                onClick={handleCopyKey}
                type="button"
                className="ml-2 text-[#888888] hover:text-white transition-colors"
                title="Copy API Key"
              >
                {copiedKey ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* User Session JWT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Session JWT (Authorization: Bearer)</span>
              </span>
              <span className="font-mono text-[10px] text-[#777777]">Expires: 1 hour</span>
            </div>
            <p className="text-[11px] text-[#888888]">
              Used for administrative registry management, human reviews, and tool configuration.
            </p>
            <div className="flex items-center bg-[#141414] border border-[#282828] rounded px-3 py-2 font-mono text-xs">
              <span className="text-white/80 flex-1 truncate select-all">
                {currentToken ? `${currentToken.slice(0, 32)}...` : 'Sign in to obtain active JWT'}
              </span>
              {currentToken && (
                <button
                  onClick={handleCopyJwt}
                  type="button"
                  className="ml-2 text-[#888888] hover:text-white transition-colors"
                  title="Copy Session JWT"
                >
                  {copiedJwt ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* cURL Usage Reminder */}
          <div className="bg-[#141414] border border-[#242424] rounded p-3 text-[11px] font-mono leading-relaxed text-[#AAAAAA]">
            <span className="text-[#888888] block mb-1"># Quick cURL header sample</span>
            <span className="text-emerald-400">curl</span> -H <span className="text-blue-300">"X-Arbiter-Key: {simulatedApiKey}"</span> \
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;http://localhost:8000/api/v1/agents/...
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[#282828] bg-[#161616]">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-medium transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
