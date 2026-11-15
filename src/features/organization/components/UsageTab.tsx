import React from 'react';
import {
  Activity,
  Users,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Lock,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface UsageTabProps {
  memberCount: number;
}

export const UsageTab: React.FC<UsageTabProps> = ({ memberCount }) => {
  const seatsQuota = 25;
  const seatsPercentage = Math.round((memberCount / seatsQuota) * 100);

  const executionsUsed = 42810;
  const executionsQuota = 100000;
  const execPercentage = Math.round((executionsUsed / executionsQuota) * 100);

  const reviewEscalations = 24;
  const toolCallsIntercepted = 18420;

  return (
    <div className="space-y-6 text-xs max-w-5xl font-sans">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Usage</h2>
        <p className="text-xs text-slate-500 dark:text-[#999999] mt-1 leading-relaxed">
          Monitor live agent workflow executions, human review volume, governed tool calls, and organization capacity.
        </p>
      </div>

      {/* Quotas & Capacity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Executions */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-xs">Monthly Executions</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
            {executionsUsed.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-[#777]">
              / {executionsQuota.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#202020] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${execPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#777777]">
            {execPercentage}% of execution quota utilized
          </div>
        </div>

        {/* Metric 2: Team Seats */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-xs">Active Team Seats</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
            {memberCount}{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-[#777]">
              / {seatsQuota}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#202020] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(seatsPercentage, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#777777]">
            {seatsQuota - memberCount} seats available for invitation
          </div>
        </div>

        {/* Metric 3: Governed Tool Invocations */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-xs">Tool Invocations</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
            {toolCallsIntercepted.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% policy-intercepted & audited</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#777777]">
            Zero uninspected egress escapes
          </div>
        </div>

        {/* Metric 4: Human Review Escalations */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-xs">Human Review Cases</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
            {reviewEscalations}{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-[#777]">cases</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>Low-confidence (p &lt; &tau;) halts</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#777777]">
            Escalated to expert reviewers
          </div>
        </div>
      </div>

      {/* How ARDA Tracks Platform Usage Section */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] space-y-4 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>How ARDA Tracks Platform Usage</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            ARDA continuously records operational telemetry at each execution layer without disclosing confidential payload data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Dimension 1: Durable Workflow Executions */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-xs">
              <Workflow className="w-4 h-4 text-blue-500" />
              <span>1. Durable Workflow Executions</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
              Each agent run triggered via the Gateway (<code className="text-xs font-mono">POST /api/v1/agents/:id/execute</code>) 
              instantiates a Temporal workflow. State transitions and checkpoints are persisted to PostgreSQL, tracking total runs and execution status across all agents.
            </p>
          </div>

          {/* Dimension 2: Governed Tool Invocations */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-xs">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>2. Governed Tool Gateway Calls</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
              Every tool execution (<code className="text-xs font-mono">POST /api/v1/tools/:id/execute</code>) 
              is mediated by the Tool Gateway. Latency, classification (<code className="text-xs font-mono">read</code> vs <code className="text-xs font-mono">write</code>), 
              and policy evaluations (<code className="text-xs font-mono">ALLOW</code>, <code className="text-xs font-mono">DENY</code>, <code className="text-xs font-mono">GUARDED</code>) are logged in the tool invocation ledger.
            </p>
          </div>

          {/* Dimension 3: Reliability Gating & Human Reviews */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>3. Confidence Gating & Escalation Volume</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
              When an agent's confidence score <span className="font-mono">p</span> falls below the configured safety threshold <span className="font-mono">&tau;</span> 
              (<code className="text-xs font-mono">POST /api/v1/reliability/gate</code>), the workflow halts automatically and creates a case in <code className="text-xs font-mono">review_cases</code> for human review.
            </p>
          </div>

          {/* Dimension 4: Cryptographic Hash Chain */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#191919] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-xs">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>4. Tamper-Evident Audit Ledger</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
              Every tool execution and human adjudication emits an HMAC-SHA256 signed event into an append-only hash chain, providing verifiable compliance and zero data manipulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
