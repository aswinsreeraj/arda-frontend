import React, { useState } from 'react';
import {
  Key,
  Plus,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../agentApi';
import type { Credential } from '../types';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/authStore';

export const LlmKeysTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);

  // Form states (never stored in local storage)
  const [provider, setProvider] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Verification results map: credentialId -> { verified: boolean, message: string }
  const [verifyResults, setVerifyResults] = useState<
    Record<string, { verified: boolean; message: string }>
  >({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // RBAC checks
  // ActionCredentialManage is restricted to company_admin only.
  // agent_developer has ActionCredentialRead (view-only).
  const canManageCredentials = user?.role === 'company_admin';

  // Query credentials
  const {
    data: credentials = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<Credential[]>({
    queryKey: ['credentials'],
    queryFn: ({ signal }) => agentApi.listCredentials(signal),
  });

  // Filter to LLM credentials
  const llmCredentials = credentials.filter((c) => c.category === 'llm');

  // Add Key Mutation
  const addKeyMutation = useMutation({
    mutationFn: async () => {
      return agentApi.saveCredential({
        category: 'llm',
        provider: provider.trim().toLowerCase(),
        secret_value: secretValue.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      setIsAddKeyOpen(false);
      setProvider('');
      setSecretValue(''); // Immediately purge from state
      setModalError(null);
    },
    onError: (err: Error) => {
      setModalError(err.message || 'Failed to save credential to Vault');
    },
  });

  // Delete Credential Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => agentApi.deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });

  // Verify Connectivity Handler
  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await agentApi.verifyCredential(id);
      setVerifyResults((prev) => ({
        ...prev,
        [id]: { verified: res.verified, message: res.message || 'Connectivity verified' },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connectivity check failed';
      setVerifyResults((prev) => ({
        ...prev,
        [id]: { verified: false, message: msg },
      }));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim()) {
      setModalError('Provider name is required (e.g. groq, openai, anthropic)');
      return;
    }
    if (!secretValue.trim()) {
      setModalError('API secret value is required');
      return;
    }
    setModalError(null);
    addKeyMutation.mutate();
  };

  const maskReference = (ref: string) => {
    if (!ref) return '••••••••';
    // If ref is formatted as secret:credentials/llm/groq#api_key or similar
    const suffix = ref.slice(-4);
    return `••••••••${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* Callout Notice Banner & Add Key CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="p-3 bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#2a2a2a] rounded-lg text-xs text-slate-600 dark:text-gray-300 flex items-center space-x-2.5 max-w-2xl shadow-xs">
          <Lock className="w-4 h-4 text-slate-400 dark:text-gray-400 shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-white">Bring Your Own Key (BYOK).</strong> Model provider keys are encrypted in Vault and isolated per tenant.
          </span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />}
            title="Refresh keys"
          >
            Refresh
          </Button>
          {canManageCredentials && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddKeyOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Key
            </Button>
          )}
        </div>
      </div>

      {/* RBAC notice if developer */}
      {!canManageCredentials && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
          <span>
            Viewing credentials as <strong>{user?.role}</strong>. Vault secret management is restricted
            to <strong>company_admin</strong>.
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span>Failed to load credentials: {(error as Error).message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Keys Table Container */}
      <div className="border border-slate-200 dark:border-[#262626] rounded-lg overflow-hidden bg-white dark:bg-[#181818] shadow-xs">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#262626] text-xs uppercase tracking-wider text-slate-500 dark:text-[#828282] font-semibold bg-slate-50 dark:bg-[#161616]">
              <th className="py-3 px-4">Provider</th>
              <th className="py-3 px-4 font-mono">Vault Reference</th>
              <th className="py-3 px-4">Connectivity Status</th>
              <th className="py-3 px-4">Added</th>
              {canManageCredentials && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
            {isLoading && llmCredentials.length === 0 ? (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#282828] rounded w-28" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-40" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#252525] rounded w-24" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#202020] rounded w-20" />
                  </td>
                  {canManageCredentials && <td className="py-4 px-4" />}
                </tr>
              ))
            ) : llmCredentials.length === 0 ? (
              <tr>
                <td colSpan={canManageCredentials ? 5 : 4} className="py-12 text-center">
                  <Key className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-300 font-medium">No LLM provider keys configured</p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                    Add API keys from Groq, OpenAI, or Anthropic to enable model generation.
                  </p>
                  {canManageCredentials && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAddKeyOpen(true)}
                        icon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add first LLM key
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              llmCredentials.map((cred) => {
                const check = verifyResults[cred.id];
                const isVerifying = verifyingId === cred.id;

                return (
                  <tr key={cred.id} className="hover:bg-[#1d1d1d] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white text-sm capitalize">
                        {cred.provider}
                      </div>
                      <div className="font-mono text-[11px] text-[#71717a]">LLM Provider</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400 text-xs">
                      {maskReference(cred.reference)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {check ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                              check.verified
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                                : 'bg-red-950/40 text-red-400 border-red-800/50'
                            }`}
                            title={check.message}
                          >
                            {check.verified ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            <span>{check.verified ? 'verified' : 'unreachable'}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500 font-mono">unverified</span>
                        )}

                        {canManageCredentials && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleVerify(cred.id)}
                            isLoading={isVerifying}
                            className="text-[10px] py-0.5 px-2 h-6"
                            title="Verify connectivity against Vault"
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(cred.created_at).toLocaleDateString()}
                    </td>
                    {canManageCredentials && (
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete vaulted key for "${cred.provider}"?`)) {
                              deleteMutation.mutate(cred.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-400 p-1"
                          title="Delete vaulted key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Key Modal */}
      {isAddKeyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                <span>Vault LLM Provider Key</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddKeyOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-medium text-gray-300">Provider Name</label>
                <input
                  type="text"
                  placeholder="e.g. groq, openai, anthropic"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
                <span className="text-[10px] text-gray-500 block">
                  Alphanumeric identifier matching runtime model configuration.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-300">API Secret Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={secretValue}
                  onChange={(e) => setSecretValue(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                  autoComplete="off"
                />
                <span className="text-[10px] text-gray-500 block">
                  Encrypted at rest with HashiCorp Vault. Plaintext is never stored in browser memory.
                </span>
              </div>

              <div className="pt-3 border-t border-[#282828] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAddKeyOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={addKeyMutation.isPending}
                >
                  Store Key in Vault
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
