import React from 'react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Register as configuration',
      desc: 'Define the prompt, tools, and decision policy. No runtime code to deploy.',
      code: 'POST /v1/agents',
      codeColor: 'text-[#2563eb]',
    },
    {
      num: '2',
      title: 'It runs durably',
      desc: 'Each run executes as a workflow with checkpoints, timeouts, and exactly-once tool calls.',
      code: 'workflow.checkpoint()',
      codeColor: 'text-[#f3f4f6]',
    },
    {
      num: '3',
      title: 'Uncertain decisions route to a human',
      desc: 'Below-threshold outcomes land in a review queue with the trace, inputs, and proposed action.',
      code: 'escalate → queue:fraud-l2',
      codeColor: 'text-[#f59e0b]',
    },
    {
      num: '4',
      title: 'Reviewer verdicts update calibration',
      desc: 'Every resolution feeds the calibration loop. Thresholds adapt and escalation rates drop over time.',
      code: 'recalibrate(τ, outcomes)',
      codeColor: 'text-[#10b981]',
    },
  ];

  return (
    <section className="py-20 border-b border-[#282828] bg-[#131313]" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">
            Lifecycle
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How it works</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            From a config file to a self-improving agent, in four stages.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step) => (
            <div key={step.num} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded border border-[#282828] bg-[#181818] font-mono text-xs text-[#f3f4f6] flex items-center justify-center font-medium">
                  {step.num}
                </span>
                <div className="h-[1px] flex-1 bg-[#282828]" />
              </div>
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">{step.desc}</p>
              <div className="pt-2">
                <code
                  className={`px-2 py-1 rounded bg-[#181818] border border-[#282828] text-[11px] font-mono block w-fit ${step.codeColor}`}
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
