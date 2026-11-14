import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, X, ShieldAlert } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-14 pb-20 border-b border-[#282828] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            {/* Release Pill */}
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full border border-[#282828] bg-[#181818] text-xs font-mono text-[#9ca3af]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
              <span>v1.0 · production governance ready</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-[1.12]">
              Durable, governed AI agents — without building the infrastructure yourself.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed font-normal max-w-xl">
              Register an agent as configuration. ARDA runs it with durable execution, routes every tool
              call through a governed gateway, and escalates low-confidence decisions to a human — with
              thresholds calibrated against real outcomes.
            </p>

            {/* CTA Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/reviews"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-medium rounded border border-[#282828] bg-[#181818] text-white hover:bg-[#222225] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#9ca3af]" />
                <span>Read the Docs</span>
              </Link>
            </div>

            {/* Trust Metadata Metrics Strip */}
            <div className="pt-4 border-t border-[#282828] grid grid-cols-3 gap-4 text-xs font-mono text-[#9ca3af]">
              <div>
                <div className="text-white font-semibold text-sm">100%</div>
                <div className="text-[11px] text-[#6b7280]">durable replay</div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">0</div>
                <div className="text-[11px] text-[#6b7280]">uncontrolled tool calls</div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Conformal</div>
                <div className="text-[11px] text-[#6b7280]">confidence sets</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Architecture Topology / Run Inspector */}
          <div className="lg:col-span-6">
            <div className="relative rounded-lg border border-[#282828] bg-[#181818] shadow-2xl p-5 font-mono text-xs">
              {/* Inspector Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#282828] text-[#6b7280] text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">acme-corp</span>
                  <span>/</span>
                  <span className="text-white">fraud-review</span>
                  <span>/</span>
                  <span className="text-[#9ca3af]">run_8f2c</span>
                </div>
                <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/15 text-[#f59e0b] border border-amber-500/20 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  <span>escalated</span>
                </div>
              </div>

              {/* Architecture Canvas (Grid) */}
              <div className="py-5 grid grid-cols-2 gap-3.5 relative bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px]">
                {/* Node 1: Agent Config */}
                <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1">
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Agent config</div>
                  <div className="text-white text-xs font-semibold">fraud-review@3.2.1</div>
                  <div className="text-[10px] text-[#6b7280]">POST /v1/agents/:id/execute</div>
                </div>

                {/* Node 2: Durable Runtime */}
                <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1">
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Durable runtime</div>
                  <div className="text-[#10b981] text-xs font-semibold">checkpoint 14 · replayable</div>
                  <div className="text-[10px] text-[#6b7280]">Temporal WAL persisted</div>
                </div>

                {/* Node 3: Governed Tool Gateway */}
                <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-[#6b7280]">
                    <span className="uppercase tracking-wider">Tool gateway</span>
                    <span className="text-[#9ca3af]">policy tg-07</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-[#10b981]">
                      <span className="flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>ledger.read</span>
                      </span>
                      <span className="text-[10px] px-1 bg-emerald-500/15 rounded">allow</span>
                    </div>
                    <div className="flex items-center justify-between text-[#ef4444]">
                      <span className="flex items-center space-x-1">
                        <X className="w-3 h-3" />
                        <span>payments.refund</span>
                      </span>
                      <span className="text-[10px] px-1 bg-red-500/15 rounded">deny</span>
                    </div>
                  </div>
                </div>

                {/* Node 4: Confidence Gate */}
                <div className="p-3 rounded border border-amber-500/40 bg-[#1c1c1c] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-[#f59e0b]">
                    <span className="uppercase tracking-wider">Confidence gate</span>
                    <span className="text-[9px] px-1 bg-amber-500/15 rounded">p &lt; τ</span>
                  </div>
                  <div className="text-xs font-semibold text-white">
                    p 0.62 &lt; τ 0.80
                  </div>
                  <div className="text-[10px] text-[#6b7280]">
                    Margin: -0.18 (uncertain)
                  </div>
                </div>

                {/* Node 5: Feedback / Calibration */}
                <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1">
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Calibration</div>
                  <div className="text-white text-xs font-medium">verdict → τ recalibrated</div>
                  <div className="text-[10px] text-blue-400">feedback loop active</div>
                </div>

                {/* Node 6: Human Review */}
                <div className="p-3 rounded border border-blue-500/40 bg-[#1c1c1c] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-blue-400 uppercase tracking-wider">Human review</span>
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-xs font-semibold text-white">case #4109 queued</div>
                  <div className="text-[10px] text-[#6b7280]">assigned to fraud-l2</div>
                </div>
              </div>

              {/* Status Legend Footer */}
              <div className="pt-3 border-t border-[#282828] flex items-center justify-between text-[10px] text-[#6b7280]">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span className="text-[#9ca3af]">passed</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                    <span className="text-[#9ca3af]">escalated</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                    <span className="text-[#9ca3af]">blocked</span>
                  </span>
                </div>
                <div className="font-mono text-[#9ca3af]">deterministic replay enabled</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
