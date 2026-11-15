import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { TopNav } from '@/components/shared/TopNav';
import {
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Activity,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface CodeSnippetProps {
  filename: string;
  code: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ filename, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-md overflow-hidden text-[12px] font-mono">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#282828] bg-[#1f1f1f] text-[#888888] text-[11px]">
        <span>{filename}</span>
        <button
          onClick={handleCopy}
          className="hover:text-white flex items-center space-x-1 transition-colors"
          type="button"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 bg-[#141414] text-[#dadada] leading-relaxed overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const GuidePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeAnchor, setActiveAnchor] = useState('what-is-this-platform');

  const scrollTo = (id: string) => {
    setActiveAnchor(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed bg-[var(--surface-canvas)] transition-colors duration-150">
      {/* Top Header */}
      {isAuthenticated ? (
        <TopNav />
      ) : (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#282828] backdrop-blur-sm bg-white/95 dark:bg-[#131313]/95 transition-colors">
          <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
            {/* Left brand & primary nav */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 text-slate-900 dark:text-white font-medium text-base tracking-tight hover:opacity-90">
                <span className="font-semibold text-slate-900 dark:text-white tracking-wide text-base font-sans">ΛRDΛ</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link to="/guide" className="text-slate-900 dark:text-white font-semibold">
                  Guides
                </Link>
                <Link to="/docs" className="text-slate-600 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors">
                  API Reference
                </Link>
              </nav>
            </div>

            {/* Right auth actions */}
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-[#2563eb] !text-white text-white px-4 py-2 rounded hover:bg-[#1d4ed8] transition-colors shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Documentation Layout */}
      <div className="max-w-[1440px] mx-auto w-full px-6 flex-1 flex pt-8 pb-20">
        {/* Left Sidebar */}
        <aside className="w-60 shrink-0 hidden lg:block pr-8 select-none">
          <div className="sticky top-20 space-y-7 text-[13px]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-2.5">
                Getting started
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => scrollTo('what-is-this-platform')}
                    className={`block py-1 text-left w-full transition-colors pl-2 -ml-2 ${
                      activeAnchor === 'what-is-this-platform'
                        ? 'text-white font-medium border-l-2 border-[#2563eb]'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    What is this platform
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('registering-your-first-agent')}
                    className={`block py-1 text-left w-full transition-colors pl-2 -ml-2 ${
                      activeAnchor === 'registering-your-first-agent'
                        ? 'text-white font-medium border-l-2 border-[#2563eb]'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    Registering your first agent
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('understanding-the-reliability-gate')}
                    className={`block py-1 text-left w-full transition-colors pl-2 -ml-2 ${
                      activeAnchor === 'understanding-the-reliability-gate'
                        ? 'text-white font-medium border-l-2 border-[#2563eb]'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    Understanding the reliability gate
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('working-the-escalation-queue')}
                    className={`block py-1 text-left w-full transition-colors pl-2 -ml-2 ${
                      activeAnchor === 'working-the-escalation-queue'
                        ? 'text-white font-medium border-l-2 border-[#2563eb]'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    Working the escalation queue
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('connecting-to-grafana-and-temporal')}
                    className={`block py-1 text-left w-full transition-colors pl-2 -ml-2 ${
                      activeAnchor === 'connecting-to-grafana-and-temporal'
                        ? 'text-white font-medium border-l-2 border-[#2563eb]'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    Connecting to Grafana and Temporal
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-2.5">
                Reference
              </div>
              <ul className="space-y-1 text-[#9ca3af]">
                <li>
                  <Link to="/docs" className="block py-1 hover:text-white transition-colors pl-2 -ml-2">
                    Tool gateway policies
                  </Link>
                </li>
                <li>
                  <Link to="/docs" className="block py-1 hover:text-white transition-colors pl-2 -ml-2">
                    CLI reference
                  </Link>
                </li>
                <li>
                  <Link to="/org" className="block py-1 hover:text-white transition-colors pl-2 -ml-2">
                    Reviewer permissions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-[780px] lg:pl-4 space-y-16">
          {/* Guide Header */}
          <section className="space-y-3">
            <div className="text-[12px] font-mono text-[#737373]">docs / getting-started</div>
            <h1 className="text-3xl font-semibold text-white tracking-tight pt-1">
              Getting started
            </h1>
            <p className="text-[#dadada] text-[14px] leading-relaxed pt-1">
              Register an agent, understand when and why it hands decisions to a person, and work the
              review queue. Read top to bottom the first time. After that, use the sidebar to jump to a
              section.
            </p>
            <div className="pt-2 text-[12px] text-[#737373] flex items-center space-x-2">
              <span>updated 2026-09-24</span>
              <span>·</span>
              <span>~12 min read</span>
              <span>·</span>
              <span>for developers &amp; reviewers</span>
            </div>
          </section>

          {/* Section: Platform Overview */}
          <section className="space-y-6 pt-4 border-t border-[#282828]" id="what-is-this-platform">
            <h2 className="text-xl font-semibold text-white tracking-tight">
              What is this platform
            </h2>
            <p className="text-[13px] text-[#dadada] leading-relaxed">
              Arbiter runs AI agents that your organization defines as configuration: a prompt, a set of
              tools, and a decision policy. You don't write runtime code. Every run executes as a
              durable workflow that survives crashes and resumes where it stopped. Every tool call passes
              through a gateway that enforces your permissions. Every decision is scored against a
              reliability gate calibrated on real outcomes. When the agent isn't confident enough, or a
              guardrail blocks an action, the case goes to a human reviewer with the full context. That
              reviewer's verdict then makes the agent more reliable.
            </p>

            {/* Model vs Platform comparison row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[12px] font-mono">
              <div className="bg-[#1b1b1b] border border-[#282828] p-3.5 rounded-lg">
                <span className="text-[#888888] block text-[11px] font-sans mb-1 uppercase tracking-wide">
                  You provide:
                </span>
                <span className="text-[#dadada]">prompt · tools · policy · examples</span>
              </div>
              <div className="bg-[#1b1b1b] border border-[#282828] p-3.5 rounded-lg">
                <span className="text-[#888888] block text-[11px] font-sans mb-1 uppercase tracking-wide">
                  The platform provides:
                </span>
                <span className="text-[#dadada]">runtime · gateway · gate · review queue</span>
              </div>
            </div>
          </section>

          {/* Section: Register First Agent */}
          <section className="space-y-8 pt-4 border-t border-[#282828]" id="registering-your-first-agent">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Registering your first agent
              </h2>
              <p className="text-[13px] text-[#dadada] mt-2 leading-relaxed">
                Register an agent directly in the dashboard or via the REST API, configure its tools and
                safety guardrails, calibrate with seed examples, and publish an immutable version. Allow about 10 minutes.
              </p>
            </div>

            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#242424] text-[#dadada] text-[11px] font-mono flex items-center justify-center border border-[#383838]">
                  1
                </span>
                <div>
                  <h3 className="font-medium text-white text-[13px]">Register the agent</h3>
                  <p className="text-[12px] text-[#a3a3a3] mt-1 leading-normal">
                    Click <strong>Register agent</strong> on the Agents tab or call <code>POST /api/v1/agents</code> with
                    the display name, execution mode, system prompt, and baseline reliability threshold.
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <CodeSnippet
                  filename="POST /api/v1/agents"
                  code={`{
  "name": "fraud-review",
  "execution_mode": "supervised",
  "prompt_template": "You review card transactions flagged by the risk engine. Decide whether to approve, hold, or refund.",
  "reliability_threshold": 0.80
}`}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#242424] text-[#dadada] text-[11px] font-mono flex items-center justify-center border border-[#383838]">
                  2
                </span>
                <div>
                  <h3 className="font-medium text-white text-[13px]">Select tools</h3>
                  <p className="text-[12px] text-[#a3a3a3] mt-1 leading-normal">
                    In the agent's details panel, choose tools from your connected MCP servers and catalog.
                    Each tool is explicitly allowed and validated by the gateway. The agent can only call what is enabled here.
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <CodeSnippet
                  filename="tools.json"
                  code={`{
  "tools": [
    "mcp:mcp-tx-conn:get_transaction",
    "mcp:mcp-tx-conn:reverse_transaction"
  ]
}`}
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#242424] text-[#dadada] text-[11px] font-mono flex items-center justify-center border border-[#383838]">
                  3
                </span>
                <div>
                  <h3 className="font-medium text-white text-[13px]">
                    Set the reliability threshold and guardrails
                  </h3>
                  <p className="text-[12px] text-[#a3a3a3] mt-1 leading-normal">
                    The threshold <i>t</i> is the confidence an agent needs before its decision is
                    committed automatically. Guardrails are deterministic safety boundaries evaluated on every run regardless of model confidence.
                  </p>
                </div>
              </div>
              <div className="ml-8 space-y-3">
                <CodeSnippet
                  filename="guardrails.json"
                  code={`{
  "reliability_threshold": 0.80,
  "guardrails": {
    "max_amount": 5000,
    "require_review_above": 5000
  }
}`}
                />
                {/* Alert callout */}
                <div className="bg-[#231e13] border border-[#5c4314] rounded-lg p-3 text-[12px] flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-[#f3f4f6]">Guardrails always win</div>
                    <div className="text-[#d1d5db] mt-0.5 leading-normal">
                      Guardrails are enforced outside the model. A blocked call cannot be overridden by
                      high confidence. It always goes to a human.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#242424] text-[#dadada] text-[11px] font-mono flex items-center justify-center border border-[#383838]">
                  4
                </span>
                <div>
                  <h3 className="font-medium text-white text-[13px]">Upload seed examples</h3>
                  <p className="text-[12px] text-[#a3a3a3] mt-1 leading-normal">
                    Seed examples give the reliability gate a starting point. Without them, every case
                    escalates to reviewers.
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <CodeSnippet
                  filename="terminal"
                  code={`$ arbiter examples upload ./seed.jsonl --agent fraud-review
✓ 42 examples validated against output_schema
✓ uploaded to acme-corp/fraud-review`}
                />
              </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#242424] text-[#dadada] text-[11px] font-mono flex items-center justify-center border border-[#383838]">
                  5
                </span>
                <div>
                  <h3 className="font-medium text-white text-[13px]">Publish version</h3>
                  <p className="text-[12px] text-[#a3a3a3] mt-1 leading-normal">
                    Publishing creates an immutable version (e.g. v1). The published agent is immediately available for execution via the Gateway.
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <CodeSnippet
                  filename="POST /api/v1/agents/:id/versions/:versionId/publish"
                  code={`POST /api/v1/agents/c475d0ee/versions/a3c9c835/publish
Status: 200 OK
{
  "version_number": 1,
  "published": true,
  "status": "calibrating"
}`}
                />
              </div>
            </div>
          </section>

          {/* Section: Reliability Gate */}
          <section className="space-y-6 pt-4 border-t border-[#282828]" id="understanding-the-reliability-gate">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Understanding the reliability gate
              </h2>
              <p className="text-[13px] text-[#dadada] mt-2 leading-relaxed">
                The gate answers one fundamental question for every decision:{' '}
                <em>have we seen enough evidence to trust this agent on a case like this?</em>
              </p>
              <p className="text-[13px] text-[#dadada] mt-3 leading-relaxed">
                Each decision gets a <strong className="text-white font-medium">calibrated confidence score</strong>{' '}
                from 0 to 1. If the agent says 0.80, it is right about 80% of the time on cases like this one.
                Your threshold <code className="font-mono text-white text-[12px] bg-[#242424] px-1 py-0.5 rounded border border-[#333]">t</code>{' '}
                sets the dividing line.
              </p>
            </div>

            {/* Visual Gate Spectrum Meter */}
            <div className="bg-[#181818] border border-[#282828] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#888888]">
                <span>0.00 (Untrusted)</span>
                <span className="text-amber-400 font-semibold">Threshold t = 0.80</span>
                <span>1.00 (Max Confidence)</span>
              </div>

              {/* Spectrum Track */}
              <div className="relative h-3 bg-[#242424] rounded-full overflow-hidden border border-[#333333]">
                <div className="absolute left-0 top-0 bottom-0 bg-amber-500/30 w-[80%]" />
                <div className="absolute left-[80%] top-0 bottom-0 bg-emerald-500/40 w-[20%]" />
                <div className="absolute left-[80%] top-0 bottom-0 w-0.5 bg-white z-10 shadow-xs" />
              </div>

              {/* Sample Decision outcomes */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[#dadada]">run_0f2c (p = 0.62)</span>
                  <span className="text-amber-400">→ escalated to reviewer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[#dadada]">run_8f2c (p = 0.93)</span>
                  <span className="text-emerald-400">→ committed automatically</span>
                </div>
              </div>
            </div>

            {/* Calibration Trajectory Table */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-medium text-white tracking-tight">
                Why new agents escalate more at first
              </h3>
              <p className="text-[13px] text-[#dadada] leading-relaxed">
                Calibration is built from reviewed examples. The table shows a typical fraud-review agent
                at threshold <i>t</i> = 0.80 over its lifetime.
              </p>

              <div className="border border-[#282828] rounded-lg overflow-hidden">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#282828] bg-[#1f1f1f] text-[#888888] font-medium">
                      <th className="py-2.5 px-4 font-mono font-normal">Reviewed examples</th>
                      <th className="py-2.5 px-4 font-mono font-normal">Escalation rate</th>
                      <th className="py-2.5 px-4 font-medium">What's happening</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242424] text-[#d4d4d4]">
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">0–50</td>
                      <td className="py-3 px-4 font-mono text-white font-medium">92%</td>
                      <td className="py-3 px-4 text-[#a3a3a3]">
                        Almost everything goes to a reviewer. The platform has too little evidence.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">50–200</td>
                      <td className="py-3 px-4 font-mono text-white font-medium">58%</td>
                      <td className="py-3 px-4 text-[#a3a3a3]">
                        Routine cases start clearing the threshold. Unusual ones still escalate.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">200–500</td>
                      <td className="py-3 px-4 font-mono text-white font-medium">24%</td>
                      <td className="py-3 px-4 text-[#a3a3a3]">
                        Scores line up closely with real outcomes. Most escalations are genuinely hard cases.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">500+</td>
                      <td className="py-3 px-4 font-mono text-white font-medium">8%</td>
                      <td className="py-3 px-4 text-[#a3a3a3]">
                        Steady state. Escalations are mostly novel inputs and guardrail blocks.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Warning callout */}
              <div className="bg-[#231e13] border border-[#5c4314] rounded-lg p-3 text-[12px] flex items-start space-x-3">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-[#f3f4f6]">High early escalation is expected, not a bug</div>
                  <div className="text-[#d1d5db] mt-0.5 leading-normal">
                    A newly registered agent will escalate most cases until it has enough reviewed examples.
                    Don't lower <i>t</i> to reduce queue volume during this period. Keep reviewing, and the rate
                    will fall steadily.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Escalation Queue */}
          <section className="space-y-6 pt-4 border-t border-[#282828]" id="working-the-escalation-queue">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Working the escalation queue
              </h2>
              <p className="text-[13px] text-[#dadada] mt-2 leading-relaxed">
                This part is for reviewers. Every case in the queue has the same three parts. Read them in
                order: the reason, then the reasoning, then the evidence.
              </p>
            </div>

            {/* Mock Escalation Case Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-8 bg-[#1b1b1b] border border-[#2a2a2a] rounded-lg overflow-hidden text-[12px] shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#282828] bg-[#1f1f1f]">
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-[#888888]">
                    <span>esc_41a0</span>
                    <span>·</span>
                    <span>fraud-review@1.2.0</span>
                    <span>·</span>
                    <span>run_8f2c</span>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#382b13] text-[#f59e0b] border border-[#634919]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                    <span>below_threshold</span>
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-[#888888] mb-1">
                      Proposed action
                    </div>
                    <div className="font-mono text-[12px] bg-[#141414] p-2.5 rounded border border-[#282828] text-[#dadada]">
                      payments.refund(txn: "tx_9921", amount: 1240.00)
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-[#888888] mb-1">
                      Agent reasoning
                    </div>
                    <div className="text-[12px] text-[#dadada] leading-relaxed bg-[#141414] p-3 rounded border border-[#282828]">
                      Cardholder disputed two charges from the same merchant within 4 hours. The account has
                      3 prior chargebacks this month. Duplicate billing pattern detected.
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#282828] grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#888888] block text-[10px]">Confidence</span>
                      <span className="font-mono text-[#f59e0b]">p 0.62 &lt; t 0.80</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">Reviewed examples</span>
                      <span className="font-mono text-[#dadada]">186</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">Similar past cases</span>
                      <span className="font-mono text-[#10b981]">7 of 9 approved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annotation Pointers */}
              <div className="md:col-span-4 space-y-3.5 pt-1 text-[11px]">
                <div className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center font-mono shrink-0 text-[10px] mt-0.5">
                    1
                  </span>
                  <div>
                    <div className="font-medium text-white">Escalation reason</div>
                    <div className="text-[#888888] leading-tight mt-0.5">
                      Why this case is here. It sets what you check first.
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center font-mono shrink-0 text-[10px] mt-0.5">
                    2
                  </span>
                  <div>
                    <div className="font-medium text-white">Agent reasoning</div>
                    <div className="text-[#888888] leading-tight mt-0.5">
                      What the agent proposes and why. Treat it as a hypothesis to verify.
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center font-mono shrink-0 text-[10px] mt-0.5">
                    3
                  </span>
                  <div>
                    <div className="font-medium text-white">Reliability signal</div>
                    <div className="text-[#888888] leading-tight mt-0.5">
                      Calibrated score vs threshold, and historical neighbor similarity.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Reference Table */}
            <div className="space-y-3 pt-3">
              <h3 className="text-base font-medium text-white tracking-tight">
                Reading the escalation-reason badge
              </h3>
              <p className="text-[12px] text-[#dadada]">
                Amber means the agent was unsure. Red means an action was stopped. Grey means policy
                mandated a human check.
              </p>
              <div className="border border-[#282828] rounded-lg overflow-hidden">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#282828] bg-[#1f1f1f] text-[#888888] font-medium">
                      <th className="py-2 px-3.5 font-normal">Badge</th>
                      <th className="py-2 px-3.5 font-normal">Means</th>
                      <th className="py-2 px-3.5 font-normal">Check first</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242424] text-[#cfcfcf]">
                    <tr>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#382b13] text-[#f59e0b] border border-[#634919]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                          <span>below_threshold</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">Confidence p fell under threshold t.</td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">
                        Is the reasoning sound? Low confidence doesn't mean the decision is wrong.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#382b13] text-[#f59e0b] border border-[#634919]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                          <span>novel_input</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">
                        Input looks unlike anything in reviewed examples.
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">
                        Whether this case belongs to this agent at all.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#381a1a] text-[#ef4444] border border-[#632727]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                          <span>guardrail_denied</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">
                        A hard rule blocked a tool call (e.g. limit bounds).
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">
                        Why the agent attempted a blocked call, and if an exception applies.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#242424] text-[#a3a3a3] border border-[#383838]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
                          <span>policy_mandated</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">
                        Rule requires human approval regardless of confidence.
                      </td>
                      <td className="py-2.5 px-3.5 text-[#a3a3a3]">
                        Follow standard operating procedures for mandated approvals.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reviewer Shortcuts Card */}
            <div className="bg-[#1b1b1b] border border-[#282828] rounded-lg p-4 flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-1.5 text-white font-medium text-[13px] mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Your verdict trains the gate</span>
                </div>
                <p className="text-[11px] text-[#9ca3af] max-w-md leading-normal">
                  Each resolution becomes a reviewed example for that agent. Decide on the merits of the
                  case, not to clear the queue.
                </p>
              </div>

              {/* Shortcuts List */}
              <div className="text-[11px] font-mono border-t md:border-t-0 md:border-l border-[#282828] md:pl-5 space-y-1 text-[#888888] shrink-0">
                <div className="text-[10px] uppercase font-sans text-[#737373] mb-1">Queue shortcuts</div>
                <div className="flex justify-between space-x-4">
                  <span className="font-sans text-[#a3a3a3]">Next / previous case</span>
                  <span className="text-white">
                    <kbd className="bg-[#242424] border border-[#333333] px-1 rounded">j</kbd>{' '}
                    <kbd className="bg-[#242424] border border-[#333333] px-1 rounded">k</kbd>
                  </span>
                </div>
                <div className="flex justify-between space-x-4">
                  <span className="font-sans text-[#a3a3a3]">Approve, modify, reject</span>
                  <span className="text-white">
                    <kbd className="bg-[#242424] border border-[#333333] px-1 rounded">a</kbd>{' '}
                    <kbd className="bg-[#242424] border border-[#333333] px-1 rounded">m</kbd>{' '}
                    <kbd className="bg-[#242424] border border-[#333333] px-1 rounded">r</kbd>
                  </span>
                </div>
                <div className="flex justify-between space-x-4">
                  <span className="font-sans text-[#a3a3a3]">Open trace in Temporal</span>
                  <span className="text-white">
                    <kbd className="bg-[#242424] border border-[#333333] px-1 rounded">t</kbd>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Connecting to Grafana and Temporal */}
          <section className="space-y-6 pt-4 border-t border-[#282828]" id="connecting-to-grafana-and-temporal">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Connecting to Grafana and Temporal
              </h2>
              <p className="text-[13px] text-[#dadada] mt-2 leading-relaxed">
                Arbiter covers day-to-day governance. For deeper technical detail, your organization has
                linked dashboards. Both share the same sign-in credentials.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Grafana Card */}
              <div className="bg-[#1b1b1b] border border-[#282828] rounded-lg p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-[#383838] transition-colors">
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded bg-[#242424] flex items-center justify-center text-[#e5e5e5] shrink-0 mt-0.5 border border-[#333333]">
                    <Activity className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-white text-[13px]">Grafana</div>
                    <p className="text-[12px] text-[#a3a3a3]">
                      Aggregate metrics across every agent in your organization.
                    </p>
                    <ul className="text-[11px] text-[#737373] list-disc list-inside space-y-0.5 pt-1">
                      <li>Escalation rate by agent and version</li>
                      <li>Calibration error over time</li>
                      <li>Tool gateway latency and deny counts</li>
                    </ul>
                  </div>
                </div>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#2563eb] hover:underline hover:text-[#3b82f6] shrink-0 pt-1"
                >
                  <span>grafana.acme-corp.arbiter.dev</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Temporal Card */}
              <div className="bg-[#1b1b1b] border border-[#282828] rounded-lg p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-[#383838] transition-colors">
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded bg-[#242424] flex items-center justify-center text-[#e5e5e5] shrink-0 mt-0.5 border border-[#333333]">
                    <Workflow className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-white text-[13px]">Temporal</div>
                    <p className="text-[12px] text-[#a3a3a3]">
                      The full execution history of a single run, step by step.
                    </p>
                    <ul className="text-[11px] text-[#737373] list-disc list-inside space-y-0.5 pt-1">
                      <li>Every checkpoint, retry, and timeout</li>
                      <li>Exact tool call inputs and outputs</li>
                      <li>Replay a run against a new agent version</li>
                    </ul>
                  </div>
                </div>
                <a
                  href="http://localhost:7233"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#2563eb] hover:underline hover:text-[#3b82f6] shrink-0 pt-1"
                >
                  <span>temporal.acme-corp.arbiter.dev</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <p className="text-[12px] text-[#888888] leading-relaxed pt-2">
              IDs correlate across all three platforms. The run ID on an escalation case matches the
              Temporal workflow ID{' '}
              <code className="text-[11px] font-mono text-[#dadada] bg-[#222222] px-1 py-0.5 rounded border border-[#303030]">
                agent-run/acme-corp/run_8f2c
              </code>
              , and Grafana panels filter by{' '}
              <code className="text-[11px] font-mono text-[#dadada] bg-[#222222] px-1 py-0.5 rounded border border-[#303030]">
                agent="fraud-review"
              </code>
              .
            </p>

            {/* Next Link */}
            <div className="pt-10 flex justify-end">
              <Link to="/docs" className="group text-right">
                <span className="block text-[11px] font-mono uppercase text-[#737373] tracking-wide mb-1">
                  Next
                </span>
                <span className="text-sm font-medium text-white group-hover:text-[#2563eb] transition-colors flex items-center space-x-1">
                  <span>API Reference &amp; Config Schema</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </section>
        </main>
      </div>

      {/* Site Footer */}
      <footer className="w-full border-t border-[#282828] bg-[#101010]">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between text-xs text-[#737373]">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-[#dadada]">ΛRDΛ</span>
            <span>·</span>
            <span>Deterministic AI Agent Governance</span>
          </div>
          <div>© 2026 ARDA Platform. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
