import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 border-b border-slate-200 dark:border-[#282828] overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Dual-Audience Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            {/* Release Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-medium text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Production AI Agent Safety & Governance Platform</span>
            </div>

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

          {/* Right Column: Interactive Architecture Window (Matching screenshot media_1794745659533_52aa5738) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-xl border border-slate-800 bg-[#121214] shadow-2xl p-5 font-mono text-xs text-slate-300">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">acme-corp</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-white">fraud-review</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">run_8f2c</span>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>escalated</span>
                </div>
              </div>

              {/* 6-Node Architecture Grid with Dot Background */}
              <div className="py-5 grid grid-cols-2 gap-3.5 relative bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:18px_18px]">
                {/* Node 1: Agent Action */}
                <div className="p-3.5 rounded-lg border border-slate-800 bg-[#18181b]/95 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Agent Action</div>
                  <div className="text-white text-sm font-semibold truncate">fraud-review@3.2.1</div>
                  <div className="text-xs text-slate-400 font-sans">Proposes $450 refund</div>
                  <div className="text-[11px] text-slate-500 font-mono">POST /v1/agents/execute</div>
                </div>

                {/* Node 2: Durable Runtime */}
                <div className="p-3.5 rounded-lg border border-slate-800 bg-[#18181b]/95 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Durable Runtime</div>
                  <div className="text-emerald-400 text-sm font-semibold">checkpoint 14 · replayable</div>
                  <div className="text-xs text-slate-400 font-sans">Crash-proof state saved</div>
                  <div className="text-[11px] text-slate-500 font-mono">Temporal WAL persisted</div>
                </div>

                {/* Node 3: Governed Tool Gateway */}
                <div className="p-3.5 rounded-lg border border-slate-800 bg-[#18181b]/95 space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span className="uppercase tracking-wider">Tool Gateway</span>
                    <span className="text-slate-400 text-[11px]">policy tg-07</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>ledger.read</span>
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 bg-emerald-500/15 rounded font-mono">allow</span>
                    </div>
                    <div className="flex items-center justify-between text-red-400">
                      <span className="flex items-center space-x-1">
                        <X className="w-3.5 h-3.5" />
                        <span>payments.refund</span>
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 bg-red-500/15 rounded font-mono">deny</span>
                    </div>
                  </div>
                </div>

                {/* Node 4: Confidence Gate */}
                <div className="p-3.5 rounded-lg border border-amber-500/50 bg-[#18181b]/95 space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-amber-400 font-mono">
                    <span className="uppercase tracking-wider">Confidence Gate</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-amber-500/20 rounded font-semibold">p &lt; τ</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    p 0.62 &lt; τ 0.80
                  </div>
                  <div className="text-xs text-amber-300/80 font-sans">
                    62% confidence below 80% target
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Margin: -0.18 (auto-paused)
                  </div>
                </div>

                {/* Node 5: Feedback / Calibration */}
                <div className="p-3.5 rounded-lg border border-slate-800 bg-[#18181b]/95 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Calibration</div>
                  <div className="text-white text-sm font-medium">verdict → τ recalibrated</div>
                  <div className="text-xs text-slate-400 font-sans">Human choices train thresholds</div>
                  <div className="text-[11px] text-blue-400 font-mono">feedback loop active</div>
                </div>

                {/* Node 6: Human Review */}
                <div className="p-3.5 rounded-lg border border-blue-500/50 bg-[#18181b]/95 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs text-blue-400 uppercase tracking-wider">Human Review</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-sm font-semibold text-white">case #4109 queued</div>
                  <div className="text-xs text-slate-400 font-sans">Escalated to human expert</div>
                  <div className="text-[11px] text-slate-500 font-mono">assigned to fraud-l2</div>
                </div>
              </div>

              {/* Status Legend Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-300">passed</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-slate-300">escalated</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-slate-300">blocked</span>
                  </span>
                </div>
                <div className="font-mono text-slate-400">deterministic replay enabled</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
