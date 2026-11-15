import React from 'react';
import { Outlet } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export const AuthLayout: React.FC = () => {
  const version = import.meta.env.VITE_APP_VERSION || 'v1.0';

  return (
    <div className="min-h-screen text-[var(--text-primary)] antialiased flex flex-col justify-between items-center bg-[var(--surface-canvas)] selection:bg-blue-600 selection:text-white px-4 transition-colors duration-150">
      {/* Top minimal bar */}
      <header className="w-full flex items-center justify-between px-6 py-3.5 text-sm text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--surface-canvas)]/90 backdrop-blur-sm fixed top-0 z-40">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-lg tracking-tight text-[var(--text-primary)]">ΛRDΛ</span>
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface-recessed)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
            Governance
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-xs text-[var(--text-muted)] font-mono hidden sm:block">
            Enterprise Agent Platform Auth
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main card container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center pt-24 pb-16">
        <div className="w-full max-w-[460px] my-auto">
          {/* Brand & Version Header */}
          <div className="flex items-center justify-between w-full mb-4 px-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">ΛRDΛ</span>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--surface-recessed)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded">
              {version}
            </span>
          </div>

          {/* Render Auth Forms */}
          <Outlet />

          {/* Security & Compliance Footer */}
          <div className="flex items-center justify-center space-x-2 text-xs font-mono text-[var(--text-muted)] mt-5 select-none">
            <Lock className="w-3.5 h-3.5" />
            <span>Audit-logged authenticated tenant boundary</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        © 2026 ARDA Platform. All executions cryptographically verified.
      </footer>
    </div>
  );
};
