import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, X, ShieldAlert } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 border-b border-slate-200 dark:border-[#282828] overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Dual-Audience Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            {/* Main Heading: Plain English & High Impact */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Durable, safe AI agents — without building complex infrastructure yourself.
            </h1>

            {/* Subheading: Dual Audience (Clear for both business & technical visitors) */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-[#a1a1aa] leading-relaxed font-normal max-w-xl">
              Deploy AI agents that take real-world actions with zero fear. ARDA guarantees
              crash-proof execution, intercepts unauthorized tool calls before they run, and automatically
              escalates low-confidence decisions to human experts — backed by verifiable audit trails.
            </p>

            {/* Action Buttons: Sign In / Sign Up & Docs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/signup"
                className="btn-primary inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-medium rounded-md bg-[#2563eb] !text-white text-white hover:bg-[#1d4ed8] transition-colors shadow-sm"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-medium rounded-md border border-slate-300 dark:border-[#282828] bg-white dark:bg-[#181818] text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#222225] transition-colors"
              >
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-[#9ca3af]" />
                <span>API Reference</span>
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors"
              >
                <span>Explore Guides</span>
              </Link>
            </div>

            {/* Trust Metadata Strip */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#282828] grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <div className="text-slate-900 dark:text-white font-semibold text-sm">100% Crash-Proof</div>
                <div className="text-[11px] text-slate-500 dark:text-[#6b7280]">Durable workflow replay</div>
              </div>
              <div>
                <div className="text-slate-900 dark:text-white font-semibold text-sm">Zero Leaks</div>
                <div className="text-[11px] text-slate-500 dark:text-[#6b7280]">Policy-guarded tools</div>
              </div>
              <div>
                <div className="text-slate-900 dark:text-white font-semibold text-sm">Human in Loop</div>
                <div className="text-[11px] text-slate-500 dark:text-[#6b7280]">Calibrated confidence gate</div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Uncrowded Architecture Window (Adapts to light & dark theme) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121214] shadow-xl dark:shadow-2xl p-5 sm:p-6 text-slate-700 dark:text-slate-300 transition-colors">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-900 dark:text-white font-medium">acme-corp</span>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <span className="text-slate-900 dark:text-white">fraud-review</span>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <span className="text-slate-500 dark:text-slate-400">run_8f2c</span>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 text-xs font-sans">
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                  <span>Escalated to Human</span>
                </div>
              </div>

              {/* 6-Node Architecture Grid - Clean, spacious & theme-adaptive */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative bg-[radial-gradient(rgba(100,116,139,0.12)_1px,transparent_0)] dark:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px]">
                {/* Node 1: Agent Action */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#18181b]/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between space-y-2 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-wider">1. Agent Action</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans">AI Request</span>
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white text-base font-semibold">Refund $450</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-value payout proposed by agent</div>
                  </div>
                </div>

                {/* Node 2: Durable Runtime */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#18181b]/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between space-y-2 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    <span className="uppercase tracking-wider">2. Durable Runtime</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  </div>
                  <div>
                    <div className="text-emerald-600 dark:text-emerald-400 text-base font-semibold">Checkpoint Saved</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Crash-proof · Replays automatically</div>
                  </div>
                </div>

                {/* Node 3: Governed Tool Gateway */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#18181b]/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between space-y-2 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-wider">3. Tool Gateway</span>
                    <span className="text-[11px] text-slate-500 font-sans">Guardrails</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-sans">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-slate-800 dark:text-slate-300">Read Balance</span>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-transparent rounded-md font-mono">Allow</span>
                    </div>
                    <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                      <span className="flex items-center space-x-1.5">
                        <X className="w-3.5 h-3.5" />
                        <span className="text-slate-800 dark:text-slate-300">Execute Refund</span>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-transparent rounded-md font-mono">Guarded</span>
                    </div>
                  </div>
                </div>

                {/* Node 4: Confidence Gate */}
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-500/50 bg-amber-50/50 dark:bg-[#18181b]/90 shadow-xs flex flex-col justify-between space-y-2 shadow-amber-500/5 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-700 dark:text-amber-400">
                    <span className="uppercase tracking-wider">4. Confidence Gate</span>
                    <span className="text-[11px] px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-transparent rounded-md font-sans font-semibold">Auto-Paused</span>
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white text-base font-semibold">62% Confidence</div>
                    <div className="text-xs text-amber-800 dark:text-amber-300/80 mt-1">Below 80% safety bar · Paused for safety</div>
                  </div>
                </div>

                {/* Node 5: Human Review */}
                <div className="p-4 rounded-xl border border-blue-300 dark:border-blue-500/50 bg-blue-50/50 dark:bg-[#18181b]/90 shadow-xs flex flex-col justify-between space-y-2 shadow-blue-500/5 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono text-blue-700 dark:text-blue-400">
                    <span className="uppercase tracking-wider">5. Human Review</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white text-base font-semibold">Case #4109 Queued</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Escalated to human specialist for approval</div>
                  </div>
                </div>

                {/* Node 6: Continuous Learning */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#18181b]/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between space-y-2 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-wider">6. Continuous Learning</span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-sans">Active</span>
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white text-base font-semibold">Threshold Calibrated</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Human choice trains future agent confidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
