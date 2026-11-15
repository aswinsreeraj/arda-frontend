import React from 'react';
import { AlertCircle, ShieldCheck, Zap, Sliders } from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section className="py-20 border-b border-slate-200 dark:border-[#282828] bg-white dark:bg-[#131313] transition-colors" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 font-medium">
            Core Safety Guarantees
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            The hard parts of production agents, handled by the platform.
          </h2>
          <p className="mt-2 text-base text-slate-600 dark:text-[#9ca3af]">
            Most teams rebuild fragile custom code for every agent. ARDA provides hardened runtime safety out of the box.
          </p>
        </div>

        {/* 3-Column Problem / Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Durable Execution */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-[#282828] bg-slate-50 dark:bg-[#181818] p-6 hover:border-slate-300 dark:hover:border-[#383838] transition-colors">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>The Risk</span>
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">Agents crash and lose state</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9ca3af] mt-1 leading-relaxed">
                  A worker restart or network glitch mid-task means lost context, duplicated tool actions, and orphaned transactions.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#282828]">
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-600 dark:text-[#10b981] font-medium">
                  <Zap className="w-3.5 h-3.5 text-emerald-500 dark:text-[#10b981]" />
                  <span>The ARDA Guarantee</span>
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">Durable execution workflows</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9ca3af] mt-1 leading-relaxed">
                  Every agent run executes as a durable workflow. State is checkpointed after every step and replayed with zero data loss.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#282828]">
              <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#131313] border border-slate-200 dark:border-[#282828] font-mono text-xs flex items-center justify-between">
                <span className="text-slate-700 dark:text-[#9ca3af] truncate">run_8f2c · resumed at step 14/22</span>
                <span className="text-emerald-500 font-bold">✓</span>
              </div>
            </div>
          </div>

          {/* Card 2: Governed Tool Gateway */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-[#282828] bg-slate-50 dark:bg-[#181818] p-6 hover:border-slate-300 dark:hover:border-[#383838] transition-colors">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>The Risk</span>
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">Unguarded external tool calls</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9ca3af] mt-1 leading-relaxed">
                  A model with direct credentials can refund balances, delete databases, or email users without oversight.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#282828]">
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-600 dark:text-[#10b981] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-[#10b981]" />
                  <span>The ARDA Guarantee</span>
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">Governed tool gateway</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9ca3af] mt-1 leading-relaxed">
                  All tool calls pass through an external policy gateway with hard guardrails — schema validation and parameter bounds enforced outside the model.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#282828]">
              <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#131313] border border-slate-200 dark:border-[#282828] font-mono text-xs flex items-center justify-between">
                <span className="text-slate-700 dark:text-[#9ca3af] truncate">payments.refund · deny · &gt; $500</span>
                <span className="text-red-500 font-bold">✕</span>
              </div>
            </div>
          </div>

          {/* Card 3: Calibrated Confidence Gating */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-[#282828] bg-slate-50 dark:bg-[#181818] p-6 hover:border-slate-300 dark:hover:border-[#383838] transition-colors">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>The Risk</span>
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">Blind trust in hallucinations</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9ca3af] mt-1 leading-relaxed">
                  Raw model confidence is uncalibrated. Either teams manually review everything, or errors slip through to production.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#282828]">
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-600 dark:text-[#10b981] font-medium">
                  <Sliders className="w-3.5 h-3.5 text-emerald-500 dark:text-[#10b981]" />
                  <span>The ARDA Guarantee</span>
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">Calibrated confidence gating</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9ca3af] mt-1 leading-relaxed">
                  Every decision is scored against calibrated statistical thresholds. Uncertain outputs pause and escalate directly to human review.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#282828]">
              <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#131313] border border-slate-200 dark:border-[#282828] font-mono text-xs flex items-center justify-between">
                <span className="text-slate-700 dark:text-[#9ca3af] truncate">62% confidence &lt; 80% target · escalated</span>
                <span className="text-amber-500 font-bold">!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
