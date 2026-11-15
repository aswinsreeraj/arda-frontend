import React, { useState } from 'react';
import type { ApiKeyItem, TenantRole } from '../types';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';

interface ApiKeysTabProps {
  initialKeys?: ApiKeyItem[];
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ initialKeys = [] }) => {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<TenantRole>('agent_developer');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomSuffix = Math.random().toString(36).slice(2, 6);
    const secret = `arda_live_${randomSuffix}_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;

    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `arda_live_${randomSuffix}`,
      role: newKeyRole,
      created_at: new Date().toISOString(),
      last_used: 'never',
      status: 'active',
      scopes:
        newKeyRole === 'company_admin'
          ? ['admin:*', 'agents:*', 'runs:*', 'audit:*']
          : newKeyRole === 'agent_developer'
            ? ['agents:read', 'agents:write', 'runs:execute', 'tools:invoke']
            : ['reviews:read', 'reviews:adjudicate'],
    };

    setKeys((prev) => [newKey, ...prev]);
    setGeneratedSecret(secret);
  };

  const handleCopySecret = () => {
    if (generatedSecret) {
      navigator.clipboard.writeText(generatedSecret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke "${name}"? Any systems using this key will immediately fail.`)) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-xs max-w-5xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">API Keys</h2>
          <p className="text-xs text-slate-500 dark:text-[#999999] mt-1 leading-relaxed">
            Tenant-scoped credentials for programmatic agent execution and pipeline integrations.
          </p>
        </div>
        <button
          onClick={() => {
            setGeneratedSecret(null);
            setNewKeyName('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-xs transition-colors self-start shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate new key</span>
        </button>
      </div>

      {/* Keys Table */}
      <div className="w-full border border-slate-200 dark:border-[#262626] rounded-md overflow-hidden bg-white dark:bg-[#161616] shadow-xs">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#181818] text-slate-500 dark:text-[#737373] font-normal text-xs">
              <th className="py-2.5 px-4 font-normal">Name</th>
              <th className="py-2.5 px-4 font-normal">Key Prefix</th>
              <th className="py-2.5 px-4 font-normal">Role</th>
              <th className="py-2.5 px-4 font-normal">Scopes</th>
              <th className="py-2.5 px-4 font-normal">Last used</th>
              <th className="py-2.5 px-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#202020] text-slate-700 dark:text-[#d4d4d4]">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-500 dark:text-neutral-400">
                  No active API keys found. Generate a key to get started.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Key className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                      <span className="font-medium text-slate-900 dark:text-white">{k.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-[#a3a3a3]">
                    {k.prefix}...
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-[#a3a3a3] capitalize text-xs">
                    {k.role.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {k.scopes.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-[#333]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-[#888888] text-xs">{k.last_used}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRevoke(k.id, k.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:text-[#666666] dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                      title="Revoke key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Key Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-[#1b1b1b] border border-slate-200 dark:border-[#2d2d2d] rounded-xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Generate API Key</h3>
            <p className="text-xs text-slate-500 dark:text-[#8e8e8e] mt-0.5">
              Create an authentication key for backend services and pipelines.
            </p>

            {generatedSecret ? (
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <span>
                    Copy your key now. For security purposes, this secret will not be displayed again.
                  </span>
                </div>

                <div className="flex items-center space-x-2 font-mono text-xs">
                  <input
                    readOnly
                    value={generatedSecret}
                    className="flex-1 bg-slate-50 dark:bg-[#121212] border border-slate-300 dark:border-[#282828] px-3 py-2 rounded text-emerald-600 dark:text-emerald-400 select-all"
                  />
                  <button
                    onClick={handleCopySecret}
                    className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#282828] text-slate-800 dark:text-white border border-slate-200 dark:border-[#333333] flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedKey ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#242424] dark:hover:bg-[#2c2c2c] text-slate-800 dark:text-white text-xs border border-slate-300 dark:border-[#383838] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-[#cccccc] mb-1.5">
                    Key Name
                  </label>
                  <input
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Temporal Worker Key"
                    className="w-full bg-white dark:bg-[#131313] border border-slate-300 dark:border-[#2c2c2c] text-xs text-slate-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-[#cccccc] mb-1.5">Role</label>
                  <select
                    value={newKeyRole}
                    onChange={(e) => setNewKeyRole(e.target.value as TenantRole)}
                    className="w-full bg-white dark:bg-[#131313] border border-slate-300 dark:border-[#2c2c2c] text-xs text-slate-900 dark:text-white rounded-md px-3 py-2 focus:outline-none"
                  >
                    <option value="agent_developer">Agent developer</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="company_admin">Company admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#222] dark:hover:bg-[#282828] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-[#333] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
