import React from 'react';
import { AlertCircle, ShieldCheck, Zap, Sliders } from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section className="py-20 border-b border-[#282828] bg-[#131313]" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">
            Platform Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The hard parts of production agents, handled by the platform.
          </h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Most teams rebuild the same reliability layer for every agent. ARDA makes it the default.
          </p>
        </div>

        {/* 3-Column Problem / Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Durable Execution */}
          <div className="flex flex-col justify-between rounded-lg border border-[#282828] bg-[#181818] p-6 hover:border-[#383838] transition-colors">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#ef4444] font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>problem</span>
                </span>
                <h3 className="text-base font-semibold text-white mt-1">Agents crash and lose state</h3>
                <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                  A worker restart mid-task means lost context, duplicated tool calls, and half-finished side effects.
                </p>
              </div>

              <div className="pt-4 border-t border-[#282828]">
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#10b981] font-medium">
                  <Zap className="w-3 h-3 text-[#10b981]" />
                  <span>solution</span>
                </span>
                <h4 className="text-sm font-semibold text-white mt-1">Durable execution</h4>
                <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                  Every agent run is a workflow. State is checkpointed after each step and replayed exactly on failure — no custom retries required.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#282828]">
              <div className="px-2.5 py-1.5 rounded bg-[#131313] border border-[#282828] font-mono text-[11px] text-[#6b7280] flex items-center justify-between">
                <span className="text-[#9ca3af] truncate">run_8f2c · resumed at step 14/22</span>
                <span className="text-[#10b981] font-bold">✓</span>
              </div>
            </div>
          </div>

          {/* Card 2: Governed Tool Gateway */}
          <div className="flex flex-col justify-between rounded-lg border border-[#282828] bg-[#181818] p-6 hover:border-[#383838] transition-colors">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#ef4444] font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>problem</span>
                </span>
                <h3 className="text-base font-semibold text-white mt-1">Agents call tools with no oversight</h3>
                <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                  A model with API keys can refund, delete, or email anyone. Prompt instructions are not a permission system.
                </p>
              </div>

              <div className="pt-4 border-t border-[#282828]">
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#10b981] font-medium">
                  <ShieldCheck className="w-3 h-3 text-[#10b981]" />
                  <span>solution</span>
                </span>
                <h4 className="text-sm font-semibold text-white mt-1">Governed tool gateway</h4>
                <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                  All tool calls pass through a policy gateway with hard guardrails — allowlists, argument limits, and rate caps enforced outside the model.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#282828]">
              <div className="px-2.5 py-1.5 rounded bg-[#131313] border border-[#282828] font-mono text-[11px] text-[#6b7280] flex items-center justify-between">
                <span className="text-[#9ca3af] truncate">payments.refund · deny · amount &gt; 5000</span>
                <span className="text-[#ef4444] font-bold">✕</span>
              </div>
            </div>
          </div>

          {/* Card 3: Calibrated Confidence Gating */}
          <div className="flex flex-col justify-between rounded-lg border border-[#282828] bg-[#181818] p-6 hover:border-[#383838] transition-colors">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#ef4444] font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>problem</span>
                </span>
                <h3 className="text-base font-semibold text-white mt-1">You can't tell when to trust a decision</h3>
                <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                  Raw model confidence is poorly calibrated. Either everything gets reviewed, or nothing does.
                </p>
              </div>

              <div className="pt-4 border-t border-[#282828]">
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#10b981] font-medium">
                  <Sliders className="w-3 h-3 text-[#10b981]" />
                  <span>solution</span>
                </span>
                <h4 className="text-sm font-semibold text-white mt-1">Calibrated confidence gating</h4>
                <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                  Decisions are scored against calibrated thresholds. Anything below τ is escalated to a human reviewer with frozen context.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#282828]">
              <div className="px-2.5 py-1.5 rounded bg-[#131313] border border-[#282828] font-mono text-[11px] text-[#6b7280] flex items-center justify-between">
                <span className="text-[#9ca3af] truncate">p 0.62 &lt; τ 0.80 · escalated → fraud-l2</span>
                <span className="text-[#f59e0b] font-bold">!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
