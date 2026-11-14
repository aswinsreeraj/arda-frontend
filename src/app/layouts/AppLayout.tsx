import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '@/components/shared/TopNav';
import { TelemetryStrip } from '@/components/shared/TelemetryStrip';
import { ResilienceBanner } from '@/components/shared/ResilienceBanner';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#131313] text-[#f3f4f6]">
      {/* Fixed top navigation bar */}
      <TopNav />

      {/* Global telemetry performance strip */}
      <TelemetryStrip />

      {/* Reusable resilience banner if live connection degrades */}
      <ResilienceBanner />

      {/* Main scrollable / split viewport */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <Outlet />
      </div>
    </div>
  );
};
