import React from 'react';

export interface TelemetryMetrics {
  queueDepth: number;
  guardrailBreaches: number;
  lowConfidence: number;
  escalationRate: string;
  totalRuns: string;
  trendPt: string;
  avgResolutionTime: string;
  p90ResolutionTime: string;
}

const defaultMetrics: TelemetryMetrics = {
  queueDepth: 11,
  guardrailBreaches: 5,
  lowConfidence: 6,
  escalationRate: '7.9%',
  totalRuns: '412 of 5,214 runs',
  trendPt: '-0.6 pt vs 7d',
  avgResolutionTime: '6m 42s',
  p90ResolutionTime: 'p90 14m 10s',
};

export const TelemetryStrip: React.FC<{ metrics?: Partial<TelemetryMetrics> }> = ({
  metrics = {},
}) => {
  const data = { ...defaultMetrics, ...metrics };

  return (
    <section className="flex-none bg-[#131313] border-b border-[#232323] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-neutral-400 select-none overflow-x-auto">
      <div className="flex items-center space-x-6 min-w-max">
        {/* Queue depth */}
        <div className="flex items-center space-x-2">
          <span className="text-neutral-400">Queue depth</span>
          <span className="font-semibold text-white">{data.queueDepth}</span>
          <span className="text-red-400">{data.guardrailBreaches} guardrail</span>
          <span className="text-neutral-600">·</span>
          <span className="text-amber-400">{data.lowConfidence} low conf.</span>
        </div>

        <div className="h-3 w-px bg-[#262626]" />

        {/* Escalation rate */}
        <div className="flex items-center space-x-2">
          <span className="text-neutral-400">Escalation rate today</span>
          <span className="font-bold text-white">{data.escalationRate}</span>
          <span className="text-neutral-400">{data.totalRuns}</span>
          <span className="text-emerald-400 font-sans text-[11px]">{data.trendPt}</span>
        </div>

        <div className="h-3 w-px bg-[#262626]" />

        {/* Avg. resolution */}
        <div className="flex items-center space-x-2">
          <span className="text-neutral-400">Avg. resolution</span>
          <span className="text-white font-medium">{data.avgResolutionTime}</span>
          <span className="text-neutral-400">{data.p90ResolutionTime}</span>
        </div>
      </div>

      <div className="text-neutral-400 text-[11px] font-sans hidden md:block">
        Sorted by urgency: SLA pressure, then guardrail breaches
      </div>
    </section>
  );
};
