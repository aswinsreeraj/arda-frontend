import React from 'react';
import { Outlet } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const version = import.meta.env.VITE_APP_VERSION || 'v0.9 beta';

  return (
    <div className="min-h-screen text-[#e5e2e1] antialiased flex flex-col justify-between items-center bg-[#131313] selection:bg-blue-600 selection:text-white px-4">
      {/* Top minimal bar */}
      <header className="w-full flex items-center justify-between px-6 py-3 text-xs text-[#888888] border-b border-[#222222] bg-[#131313]/90 backdrop-blur-sm fixed top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm tracking-tight text-white">ΛRDΛ</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#777777] bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
            Governance
          </span>
        </div>
        <div className="text-xs text-neutral-400 font-mono">
          AI Agent Platform Auth
        </div>
      </header>

      {/* Main card container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center pt-20 pb-16">
        <div className="w-full max-w-[440px] my-auto">
          {/* Brand & Version Header */}
          <div className="flex items-center justify-between w-full mb-3.5 px-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-base font-semibold text-white tracking-tight">ΛRDΛ</span>
            </div>
            <span className="font-mono text-[11px] text-[#707070] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded">
              {version}
            </span>
          </div>

          {/* Render Auth Forms */}
          <Outlet />

          {/* Security & Compliance Footer */}
          <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-[#777777] mt-4 select-none">
            <Lock className="w-3 h-3 text-[#777777]" />
            <span>SOC2-ready · Audit-logged access</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-neutral-500 border-t border-[#1f1f1f]">
        © 2026 ARDA Governance Platform. All executions auditable and verified.
      </footer>
    </div>
  );
};
