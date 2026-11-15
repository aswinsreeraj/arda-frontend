import React from 'react';

export interface TelemetryStripProps {
  totalCount?: number;
  openCount?: number;
  statusFilter?: string;
  agentFilter?: string;
}

export const TelemetryStrip: React.FC<TelemetryStripProps> = ({
  totalCount,
  statusFilter = 'OPEN',
  agentFilter,
}) => {
  return (
    <section className="flex-none bg-[#131313] border-b border-[#232323] px-6 py-2.5 flex items-center justify-between text-xs font-mono text-neutral-400 select-none overflow-x-auto">
      <div className="flex items-center space-x-6 min-w-max">
        {/* Queue depth */}
        <div className="flex items-center space-x-2">
          <span className="text-neutral-400">Queue status:</span>
          <span className="font-semibold text-white">
            {totalCount !== undefined ? totalCount : '—'}
          </span>
          <span className="text-neutral-400">cases</span>
          <span className="text-neutral-600">·</span>
          <span className={statusFilter === 'OPEN' ? 'text-amber-400' : 'text-emerald-400'}>
            filter: {statusFilter}
          </span>
          {agentFilter && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="text-blue-400">agent filtered</span>
            </>
          )}
        </div>

        <div className="h-3.5 w-px bg-[#262626]" />

        {/* Temporal Signaling mode */}
        <div className="flex items-center space-x-2">
          <span className="text-neutral-400">Temporal Workflow Sync:</span>
          <span className="text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase font-bold">ACTIVE</span>
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#262626]" />

        {/* Audit logging mode */}
        <div className="flex items-center space-x-2">
          <span className="text-neutral-400">Audit pipeline:</span>
          <span className="text-neutral-200">HMAC-SHA256 Signed Outbox</span>
        </div>
      </div>

      <div className="text-neutral-400 text-xs font-sans hidden md:block">
        Adjudication signals waiting Temporal workflows and emits Redpanda audit events
      </div>
    </section>
  );
};
