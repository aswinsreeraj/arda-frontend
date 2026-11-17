import React, { useState } from 'react';
import type { PlatformConfigItem } from '../types';
import { Sliders, Save, Check } from 'lucide-react';

interface PlatformConfigTabProps {
  initialConfigs: PlatformConfigItem[];
  onSave: (configs: PlatformConfigItem[]) => Promise<void>;
}

export const PlatformConfigTab: React.FC<PlatformConfigTabProps> = ({
  initialConfigs,
  onSave,
}) => {
  const [configs, setConfigs] = useState<PlatformConfigItem[]>(initialConfigs);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (key: string, value: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, value } : c))
    );
  };

  const handleSave = async () => {
    await onSave(configs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-xs max-w-4xl font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Configuration</h2>
          <p className="text-[13px] text-[#999999] mt-1 leading-relaxed">
            Global operational settings governing request rate limits, calibration sampling, and execution retention.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center space-x-1.5 bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer"
          type="button"
        >
          {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
        </button>
      </div>

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
