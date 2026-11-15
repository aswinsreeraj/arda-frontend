import React from 'react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Register as Configuration',
      desc: 'Define prompts, allowed tools, and safety policies declaratively. No boilerplate runtime infrastructure required.',
      code: 'POST /v1/agents',
      codeColor: 'text-blue-600 dark:text-[#2563eb]',
    },
    {
      num: '2',
      title: 'Executes Durably',
      desc: 'Runs execute as fault-tolerant workflows with checkpointing, automatic recovery from network drops, and replayable execution traces.',
      code: 'workflow.checkpoint()',
      codeColor: 'text-slate-800 dark:text-[#f3f4f6]',
    },
    {
      num: '3',
      title: 'Automated Human Oversight',
      desc: 'Low-confidence decisions automatically pause and route to human specialists with the full input context and execution trace.',
      code: 'escalate → queue:fraud-l2',
      codeColor: 'text-amber-600 dark:text-[#f59e0b]',
    },
    {
      num: '4',
      title: 'Continuous Calibration',
      desc: 'Human reviewer approvals and overrides train the calibration buffer, refining future confidence thresholds and reducing manual reviews.',
      code: 'recalibrate(τ, outcomes)',
      codeColor: 'text-emerald-600 dark:text-[#10b981]',
    },
  ];

  return (
    <section className="py-20 border-b border-slate-200 dark:border-[#282828] bg-slate-50 dark:bg-[#131313] transition-colors" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <div className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 font-medium">
            Workflow Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">How ARDA Works</h2>
          <p className="mt-2 text-base text-slate-600 dark:text-[#9ca3af]">
            From declarative configuration to a self-improving, production-safe agent fleet.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step) => (
            <div key={step.num} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-full border border-slate-300 dark:border-[#282828] bg-white dark:bg-[#181818] font-mono text-xs text-slate-900 dark:text-[#f3f4f6] flex items-center justify-center font-bold shadow-xs">
                  {step.num}
                </span>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-[#282828]" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9ca3af] leading-relaxed">{step.desc}</p>
              <div className="pt-2">
                <code
                  className={`px-2.5 py-1 rounded-md bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#282828] text-xs font-mono block w-fit ${step.codeColor}`}
                >
                  {step.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
