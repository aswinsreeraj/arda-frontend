import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  Terminal,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#131313] text-[#9ca3af] antialiased selection:bg-[#2563eb] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#282828] bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Brand & Status Pill */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2.5 text-white font-semibold tracking-tight hover:opacity-90 transition-opacity"
            >
              <span className="text-[#f3f4f6] font-semibold text-sm tracking-tight font-sans">
                ΛRDΛ
              </span>
            </Link>
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-[#282828] text-[11px] font-mono text-[#6b7280] bg-[#181818]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="text-[#9ca3af]">all systems operational</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs text-[#9ca3af] font-medium">
            <Link to="/reviews" className="hover:text-white transition-colors">
              Review Queue
            </Link>
            <Link to="/agents" className="hover:text-white transition-colors">
              Agent Registry
            </Link>
            <Link to="/audit" className="hover:text-white transition-colors">
              Audit Trail
            </Link>
            <Link to="/org" className="hover:text-white transition-colors">
              Organization
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-xs font-medium text-[#9ca3af] hover:text-white transition-colors px-2 py-1"
            >
              Sign in
            </Link>
            <Link
              to="/reviews"
              className="inline-flex items-center justify-center space-x-1 px-3.5 py-1.5 text-xs font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-sm"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative pt-14 pb-20 border-b border-[#282828] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Copy & Value Proposition */}
              <div className="lg:col-span-6 space-y-6">
                {/* Release Pill */}
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full border border-[#282828] bg-[#181818] text-xs font-mono text-[#9ca3af]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                  <span>v0.9 · production ready</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-[1.12]">
                  Durable, governed AI agents — without building the infrastructure yourself.
                </h1>

                {/* Subheading */}
                <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed font-normal max-w-xl">
                  Register an agent as configuration. ARDA runs it with durable execution, routes
                  every tool call through a governed gateway, and escalates low-confidence
                  decisions to a human — with thresholds calibrated against real outcomes.
                </p>

                {/* CTA Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/reviews"
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-sm"
                  >
                    <span>Launch Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/login?mode=invite"
                    className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 text-xs font-medium rounded border border-[#282828] bg-[#181818] text-[#f3f4f6] hover:bg-[#222225] transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-[#6b7280]" />
                    <span>Accept Invite</span>
                  </Link>
                  <Link
                    to="/agents"
                    className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 text-xs font-medium rounded border border-[#282828] bg-[#181818] text-[#f3f4f6] hover:bg-[#222225] transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5 text-[#6b7280]" />
                    <span>View Agent Registry</span>
                  </Link>
                </div>

                <p className="text-xs text-[#6b7280]">
                  Already registered?{' '}
                  <Link to="/login" className="text-[#9ca3af] hover:underline">
                    Sign in to your organization
                  </Link>
                </p>

                {/* Trust Metadata Metrics Strip */}
                <div className="pt-6 border-t border-[#282828] grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider">
                      Tenancy
                    </div>
                    <div className="text-xs font-mono text-[#f3f4f6] font-medium mt-1">
                      isolated
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider">
                      Tool calls
                    </div>
                    <div className="text-xs font-mono text-[#f3f4f6] font-medium mt-1">
                      exactly-once
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider">
                      Audit trail
                    </div>
                    <div className="text-xs font-mono text-[#f3f4f6] font-medium mt-1">
                      every step
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Architecture Topology / Run Inspector */}
              <div className="lg:col-span-6">
                <div className="relative rounded-lg border border-[#282828] bg-[#181818] shadow-2xl p-5 font-mono text-xs">
                  {/* Inspector Window Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#282828] text-[#6b7280] text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#f3f4f6] font-medium">acme-corp</span>
                      <span>/</span>
                      <span className="text-[#f3f4f6]">fraud-review</span>
                      <span>/</span>
                      <span className="text-[#9ca3af]">run_8f2c</span>
                    </div>
                    <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>escalated</span>
                    </div>
                  </div>

                  {/* Architecture Canvas */}
                  <div className="py-5 grid grid-cols-2 gap-3.5 relative">
                    {/* Node 1: Agent Config */}
                    <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1">
                      <div className="text-[10px] text-[#6b7280] uppercase">Agent config</div>
                      <div className="text-[#f3f4f6] text-xs font-semibold">fraud-review@3.2.1</div>
                      <div className="text-[10px] text-[#6b7280]">POST /v1/runs/init</div>
                    </div>

                    {/* Node 2: Durable Runtime */}
                    <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1">
                      <div className="text-[10px] text-[#6b7280] uppercase">Durable runtime</div>
                      <div className="text-emerald-400 text-xs font-semibold">
                        checkpoint 14 · replayable
                      </div>
                      <div className="text-[10px] text-[#6b7280]">state persisted (WAL)</div>
                    </div>

                    {/* Node 3: Governed Tool Gateway */}
                    <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-[#6b7280]">
                        <span>Tool gateway</span>
                        <span className="text-[#9ca3af]">policy tg-07</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-emerald-400">
                          <span className="flex items-center space-x-1">
                            <span>✓</span>
                            <span>ledger.read</span>
                          </span>
                          <span className="text-[10px] px-1 bg-emerald-950/40 rounded">allow</span>
                        </div>
                        <div className="flex items-center justify-between text-red-400">
                          <span className="flex items-center space-x-1">
                            <span>✕</span>
                            <span>payments.refund</span>
                          </span>
                          <span className="text-[10px] px-1 bg-red-950/40 rounded">deny</span>
                        </div>
                      </div>
                    </div>

                    {/* Node 4: Confidence Gate */}
                    <div className="p-3 rounded border border-amber-500/40 bg-[#1c1c1c] space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-amber-400">
                        <span>Confidence gate</span>
                        <span className="text-[9px] px-1 bg-amber-950/40 rounded">p &lt; τ</span>
                      </div>
                      <div className="text-xs font-semibold text-[#f3f4f6]">p 0.62 &lt; τ 0.80</div>
                      <div className="text-[10px] text-[#6b7280]">Margin: -0.18 (uncertain)</div>
                    </div>

                    {/* Node 5: Feedback / Calibration */}
                    <div className="p-3 rounded border border-[#282828] bg-[#1c1c1c] space-y-1">
                      <div className="text-[10px] text-[#6b7280] uppercase">Calibration</div>
                      <div className="text-[#f3f4f6] text-xs font-medium">verdict → τ recalibrated</div>
                      <div className="text-[10px] text-blue-400">feedback loop active</div>
                    </div>

                    {/* Node 6: Human Review */}
                    <div className="p-3 rounded border border-amber-500/50 bg-[#1c1c1c] space-y-1">
                      <div className="text-[10px] text-amber-400 uppercase">Human review</div>
                      <div className="text-white text-xs font-semibold">queue fraud-l2</div>
                      <div className="text-[10px] text-[#6b7280]">target SLA: 15m</div>
                    </div>
                  </div>

                  {/* Status Legend Footer */}
                  <div className="pt-3 border-t border-[#282828] flex items-center justify-between text-[11px] text-[#6b7280]">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>healthy / allowed</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>escalated</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>guardrail blocked</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-[#6b7280]">run duration: 342ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PLATFORM CAPABILITIES */}
        {/* ========================================================= */}
        <section className="py-20 border-b border-[#282828] bg-[#131313]" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Durable Execution */}
              <div className="flex flex-col justify-between rounded-lg border border-[#282828] bg-[#181818] p-6 hover:border-[#383838] transition-colors">
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-red-400 font-medium">
                      <span>●</span>
                      <span>problem</span>
                    </span>
                    <h3 className="text-base font-semibold text-white mt-1">
                      Agents crash and lose state
                    </h3>
                    <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                      A worker restart mid-task means lost context, duplicated tool calls, and
                      half-finished side effects.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#282828]">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400 font-medium">
                      <span>●</span>
                      <span>solution</span>
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-1">Durable execution</h4>
                    <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                      Every agent run is a workflow. State is checkpointed after each step and
                      replayed exactly on failure — no retries you have to write.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#282828]">
                  <div className="px-2.5 py-1.5 rounded bg-[#131313] border border-[#282828] font-mono text-[11px] text-[#6b7280] flex items-center justify-between">
                    <span className="text-[#9ca3af] truncate">run_8f2c · resumed at step 14/22</span>
                    <span className="text-emerald-400 font-bold">✓</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Governed Tool Gateway */}
              <div className="flex flex-col justify-between rounded-lg border border-[#282828] bg-[#181818] p-6 hover:border-[#383838] transition-colors">
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-red-400 font-medium">
                      <span>●</span>
                      <span>problem</span>
                    </span>
                    <h3 className="text-base font-semibold text-white mt-1">
                      Agents call tools with no oversight
                    </h3>
                    <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                      A model with API keys can refund, delete, or email anyone. Prompt instructions
                      are not a permission system.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#282828]">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400 font-medium">
                      <span>●</span>
                      <span>solution</span>
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-1">Governed tool gateway</h4>
                    <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                      All tool calls pass through a policy gateway with hard guardrails —
                      allowlists, argument limits, and rate caps enforced outside the model.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#282828]">
                  <div className="px-2.5 py-1.5 rounded bg-[#131313] border border-[#282828] font-mono text-[11px] text-[#6b7280] flex items-center justify-between">
                    <span className="text-[#9ca3af] truncate">
                      payments.refund · deny · amount &gt; 5000
                    </span>
                    <span className="text-red-400 font-bold">✕</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Calibrated Confidence Gating */}
              <div className="flex flex-col justify-between rounded-lg border border-[#282828] bg-[#181818] p-6 hover:border-[#383838] transition-colors">
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-red-400 font-medium">
                      <span>●</span>
                      <span>problem</span>
                    </span>
                    <h3 className="text-base font-semibold text-white mt-1">
                      You can't tell when to trust a decision
                    </h3>
                    <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                      Raw model confidence is poorly calibrated. Either everything gets reviewed, or
                      nothing does.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#282828]">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400 font-medium">
                      <span>●</span>
                      <span>solution</span>
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-1">
                      Calibrated confidence gating
                    </h4>
                    <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                      Decisions are scored against calibrated thresholds. Anything below τ is
                      escalated to a human reviewer with full context.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#282828]">
                  <div className="px-2.5 py-1.5 rounded bg-[#131313] border border-[#282828] font-mono text-[11px] text-[#6b7280] flex items-center justify-between">
                    <span className="text-[#9ca3af] truncate">
                      p 0.62 &lt; τ 0.80 · escalated → fraud-12
                    </span>
                    <span className="text-amber-400 font-bold">!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HOW IT WORKS */}
        {/* ========================================================= */}
        <section className="py-20 border-b border-[#282828] bg-[#131313]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14">
              <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">
                Lifecycle
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                How it works
              </h2>
              <p className="mt-2 text-sm text-[#9ca3af]">
                From a config file to a self-improving agent, in four stages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded border border-[#282828] bg-[#181818] font-mono text-xs text-[#f3f4f6] flex items-center justify-center font-medium">
                    1
                  </span>
                  <div className="h-[1px] flex-1 bg-[#282828]" />
                </div>
                <h3 className="text-sm font-semibold text-white">Register as configuration</h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Define the prompt, tools, and decision policy. No runtime code to deploy.
                </p>
                <div className="pt-2">
                  <code className="px-2 py-1 rounded bg-[#181818] border border-[#282828] text-[11px] font-mono text-blue-400 block w-fit">
                    POST /v1/agents
                  </code>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded border border-[#282828] bg-[#181818] font-mono text-xs text-[#f3f4f6] flex items-center justify-center font-medium">
                    2
                  </span>
                  <div className="h-[1px] flex-1 bg-[#282828]" />
                </div>
                <h3 className="text-sm font-semibold text-white">It runs durably</h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Each run executes as a workflow with checkpoints, timeouts, and exactly-once tool calls.
                </p>
                <div className="pt-2">
                  <code className="px-2 py-1 rounded bg-[#181818] border border-[#282828] text-[11px] font-mono text-[#f3f4f6] block w-fit">
                    workflow.checkpoint()
                  </code>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded border border-[#282828] bg-[#181818] font-mono text-xs text-[#f3f4f6] flex items-center justify-center font-medium">
                    3
                  </span>
                  <div className="h-[1px] flex-1 bg-[#282828]" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Uncertain decisions route to a human
                </h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Below-threshold outcomes land in a review queue with the trace, inputs, and proposed action.
                </p>
                <div className="pt-2">
                  <code className="px-2 py-1 rounded bg-[#181818] border border-[#282828] text-[11px] font-mono text-amber-400 block w-fit">
                    escalate → queue:fraud-l2
                  </code>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded border border-[#282828] bg-[#181818] font-mono text-xs text-[#f3f4f6] flex items-center justify-center font-medium">
                    4
                  </span>
                  <div className="h-[1px] flex-1 bg-[#282828]" />
                </div>
                <h3 className="text-sm font-semibold text-white">Resolutions improve calibration</h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Every reviewer verdict updates the confidence model, so escalation rates fall over time.
                </p>
                <div className="pt-2">
                  <code className="px-2 py-1 rounded bg-[#181818] border border-[#282828] text-[11px] font-mono text-emerald-400 block w-fit">
                    calibration.update(τ)
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PRE-FOOTER CTA */}
        {/* ========================================================= */}
        <section className="py-20 border-b border-[#282828] bg-[#181818] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to ship governed agents?
            </h2>
            <p className="text-sm text-[#9ca3af] max-w-lg mx-auto leading-relaxed">
              Register your first agent in minutes. Production-grade infrastructure from day one.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/reviews"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-sm"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded border border-[#282828] bg-[#131313] text-[#f3f4f6] hover:bg-[#222225] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#131313] py-12 text-xs font-mono border-t border-[#282828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-[#f3f4f6] font-semibold font-sans">ΛRDΛ</span>
              <span className="text-[#6b7280]">·</span>
              <div className="flex items-center space-x-1.5 text-[#6b7280] text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>all systems operational</span>
              </div>
            </div>
            <div className="text-[11px] text-[#6b7280]">SOC 2 Type II · GDPR compliant</div>
          </div>
          <div className="pt-6 border-t border-[#282828] flex flex-col sm:flex-row items-center justify-between text-[#6b7280] text-[11px] gap-2">
            <div>© 2026 ARDA Platform. All rights reserved.</div>
            <div className="font-sans">Built for production agent reliability.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
