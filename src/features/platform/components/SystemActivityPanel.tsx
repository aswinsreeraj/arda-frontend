import React from 'react';
import type { SystemActivityEvent } from '../types';

interface SystemActivityPanelProps {
  events: SystemActivityEvent[];
  onViewAll?: () => void;
}

export const SystemActivityPanel: React.FC<SystemActivityPanelProps> = ({ events, onViewAll }) => {
  return (
    <div className="space-y-4" data-purpose="system-activity">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Platform Activity</h2>
          <p className="text-[11px] text-[#737373] mt-0.5">
            Real-time log of administrative actions, organization status, and platform configuration
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] text-[#3b82f6] hover:underline cursor-pointer bg-transparent border-0 p-0"
            type="button"
          >
            View full log
          </button>
        )}
      </div>

      {/* Activity Chronological List */}
      <div className="space-y-3.5 text-[12px] font-mono">
        {events.length === 0 ? (
          <div className="text-[11px] text-[#666666] py-3">No platform activity recorded yet.</div>
        ) : (
          events.slice(0, 6).map((evt) => (
            <div key={evt.id} className="flex items-start justify-between border-b border-[#1c1c1c] pb-2.5 last:border-b-0">
              <div className="flex items-start space-x-3">
                <span className="text-[#555] w-16 shrink-0 text-[11px]">{evt.timestamp}</span>
                <div>
                  <div className="text-[#d4d4d4] font-sans font-medium text-[12px]">
                    • {evt.title}
                  </div>
                  <div className="text-[11px] text-[#777777] font-mono mt-0.5">{evt.detail}</div>
                </div>
              </div>
              <span className="text-[#666666] text-[11px] shrink-0 font-mono ml-2">{evt.operator}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
