import React, { useState } from 'react';
import type { SSOConfiguration } from '../types';
import { Copy, Check, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';

interface SSOTabProps {
  initialConfig?: SSOConfiguration;
  onSave?: (config: Partial<SSOConfiguration>) => Promise<void>;
}

export const SSOTab: React.FC<SSOTabProps> = ({ initialConfig, onSave }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [provider, setProvider] = useState<'okta' | 'google' | 'azure_ad' | 'saml'>(
    initialConfig?.provider || 'okta'
  );
  const [enforceSSO, setEnforceSSO] = useState(initialConfig?.enforce_sso || false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const acsUrl = initialConfig?.acs_url || 'https://api.arda.network/api/v1/auth/sso/callback';
  const entityId = initialConfig?.entity_id || 'urn:arda:acme-corp';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave({ provider, enforce_sso: enforceSSO });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 text-xs max-w-4xl font-sans">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Single Sign-On (SSO)</h2>
        <p className="text-xs text-slate-500 dark:text-[#999999] mt-1 leading-relaxed">
          Configure SAML 2.0 or OpenID Connect (OIDC) identity provider for enterprise authentication.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>SSO configuration saved successfully.</span>
        </div>
      )}

      {/* Identity Provider Selection */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-medium text-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Identity Provider</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { id: 'okta', name: 'Okta', desc: 'SAML 2.0 / OIDC' },
            { id: 'google', name: 'Google Workspace', desc: 'Google Cloud Identity' },
            { id: 'azure_ad', name: 'Microsoft Entra ID', desc: 'Azure AD SAML' },
            { id: 'saml', name: 'Custom SAML 2.0', desc: 'Generic XML Metadata' },
          ].map((item) => (
            <label
              key={item.id}
              className={`p-3.5 rounded-lg border cursor-pointer transition-colors block ${
                provider === item.id
                  ? 'bg-indigo-50/60 dark:bg-[#1e1b4b]/40 border-indigo-400 dark:border-indigo-500/60 text-slate-900 dark:text-white'
                  : 'bg-slate-50 dark:bg-[#141414] border-slate-200 dark:border-[#292929] text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-[#383838]'
              }`}
            >
              <input
                type="radio"
                name="idp"
                value={item.id}
                checked={provider === item.id}
                onChange={() => setProvider(item.id as typeof provider)}
                className="sr-only"
              />
              <div className="font-medium text-slate-900 dark:text-white text-xs">{item.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-[#777777] mt-0.5">{item.desc}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Service Provider Credentials */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-4 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Service Provider (SP) Metadata</h3>
        <p className="text-slate-500 dark:text-[#888888] text-xs">
          Enter these endpoints into your IdP configuration console to complete trust federation.
        </p>

        <div className="space-y-3 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 dark:text-[#777777] block mb-1">Assertion Consumer Service (ACS) URL:</span>
            <div className="flex items-center space-x-2">
              <input
                readOnly
                value={acsUrl}
                className="flex-1 bg-slate-50 dark:bg-[#121212] border border-slate-300 dark:border-[#282828] px-3 py-1.5 rounded text-slate-800 dark:text-neutral-200 select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(acsUrl, 'acs')}
                className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#282828] text-slate-800 dark:text-white border border-slate-200 dark:border-[#333333] flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedKey === 'acs' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-500 dark:text-[#777777] block mb-1">Entity ID / Audience URI:</span>
            <div className="flex items-center space-x-2">
              <input
                readOnly
                value={entityId}
                className="flex-1 bg-slate-50 dark:bg-[#121212] border border-slate-300 dark:border-[#282828] px-3 py-1.5 rounded text-slate-800 dark:text-neutral-200 select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(entityId, 'entity')}
                className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#282828] text-slate-800 dark:text-white border border-slate-200 dark:border-[#333333] flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedKey === 'entity' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Domains */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-medium text-sm">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Domains</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#666666]">2 verified</span>
        </div>
        <div className="space-y-2">
          {['acme-corp.com', 'acme.io'].map((dom) => (
            <div
              key={dom}
              className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-[#131313] border border-slate-200 dark:border-[#242424]"
            >
              <div className="flex items-center space-x-2 font-mono text-xs text-slate-800 dark:text-neutral-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{dom}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                DNS Verified
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Enforce SSO policy */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] flex items-center justify-between shadow-xs">
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-xs">Enforce Single Sign-On</div>
          <p className="text-[11px] text-slate-500 dark:text-[#888888] mt-0.5">
            Require all organization members to sign in exclusively with the configured IdP.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnforceSSO(!enforceSSO)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enforceSSO ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-[#2a2a2a]'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              enforceSSO ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          Save SSO Settings
        </button>
      </div>
    </div>
  );
};
