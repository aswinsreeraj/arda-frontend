import React, { useState } from 'react';
import type { PlatformConfigItem, PlatformConfigSaveResult } from '../types';
import { Sliders, Save, Check, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface PlatformConfigTabProps {
  initialConfigs: PlatformConfigItem[];
  onSave: (configs: PlatformConfigItem[]) => Promise<PlatformConfigSaveResult>;
}

export const PlatformConfigTab: React.FC<PlatformConfigTabProps> = ({
  initialConfigs,
  onSave,
}) => {
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const configs = initialConfigs.map((item) => ({
    ...item,
    value: draftValues[item.key] ?? item.value,
  }));

  const handleChange = (key: string, value: string) => {
    setErrorMsg(null);
    setDraftValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setWarnings([]);
    try {
      const result = await onSave(configs);
      setDraftValues({});
      if (result.warnings.length > 0) {
        setWarnings(result.warnings);
      }
      setIsSaved(true);
      window.setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save platform configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-xs max-w-4xl font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Configuration</h2>
          <p className="text-[13px] text-[#999999] mt-1 leading-relaxed">
            Live global settings persisted in PostgreSQL and enforced across API Gateway, Temporal Worker, Reliability Service, and Temporal retention.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || configs.length === 0}
          className="inline-flex items-center space-x-1.5 bg-[#2563eb] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer"
          type="button"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isSaved ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Applying...' : isSaved ? 'Applied Live' : 'Save & Apply'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-md bg-rose-950/30 border border-rose-800/60 text-rose-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-3 rounded-md bg-amber-950/30 border border-amber-800/60 text-amber-300 space-y-1">
          {warnings.map((w, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border border-[#262626] rounded-md overflow-hidden bg-[#161616] divide-y divide-[#202020]">
        {configs.map((item) => (
          <div key={item.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-[13px] text-white">
                  {item.label || item.key}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#202020] text-neutral-400 border border-[#2d2d2d]">
                  {item.category}
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#666666]">{item.key}</div>
              <p className="text-[12px] text-[#8c8c8c] leading-relaxed pt-0.5">{item.description}</p>
              {item.updated_by && (
                <div className="text-[10px] font-mono text-neutral-500 pt-0.5">
                  Last updated by {item.updated_by}
                  {item.updated_at ? ` · ${new Date(item.updated_at).toISOString().replace('T', ' ').slice(0, 19)} UTC` : ''}
                </div>
              )}
            </div>
            <div className="w-full sm:w-56 shrink-0">
              <input
                type="text"
                value={item.value}
                onChange={(e) => handleChange(item.key, e.target.value)}
                className="w-full bg-[#121212] border border-[#2b2b2b] text-[12px] rounded px-3 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
