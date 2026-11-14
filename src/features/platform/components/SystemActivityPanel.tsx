import React from 'react';
import type { SystemActivityEvent } from '../types';
import { Link } from 'react-router-dom';

interface SystemActivityPanelProps {
  events: SystemActivityEvent[];
}

export const SystemActivityPanel: React.FC<SystemActivityPanelProps> = ({ events }) => {
  return (
    <div className="space-y-4" data-purpose="system-activity">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">System activity</h2>
          <p className="text-[11px] text-[#737373] mt-0.5">
            Tenant lifecycle, platform config, and support access
          </p>
        </div>
        <Link to="/audit" className="text-[11px] text-[#3b82f6] hover:underline">
          Full audit log
        </Link>
      </div>

      {/* Activity Chronological List */}
      <div className="space-y-3.5 text-[12px] font-mono">
        {events.map((evt) => (
          <div key={evt.id} className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-[#555] w-14 shrink-0">{evt.timestamp}</span>
              <div>
                <div className="text-[#d4d4d4] font-sans">
                  • {evt.title}
                </div>
                <div className="text-[11px] text-[#666666] font-mono">{evt.detail}</div>
              </div>
            </div>
            <span className="text-[#666666] text-[11px] shrink-0">{evt.operator}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
