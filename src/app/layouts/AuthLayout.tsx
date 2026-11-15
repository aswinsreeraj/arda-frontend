import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen text-[var(--text-primary)] antialiased flex flex-col justify-between items-center bg-[var(--surface-canvas)] selection:bg-blue-600 selection:text-white px-4 transition-colors duration-150">
      {/* Top minimal bar */}
      <header className="w-full flex items-center justify-between px-6 py-3.5 text-sm text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--surface-canvas)]/90 backdrop-blur-sm fixed top-0 z-40">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="flex items-center hover:opacity-90 transition-opacity"
            title="Return to landing page"
          >
            <span className="font-semibold text-lg tracking-tight text-[var(--text-primary)]">ΛRDΛ</span>
          </Link>
        </div>
      </header>

      {/* Main card container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center pt-20 pb-16">
        <div className="w-full max-w-[460px] my-auto">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-center w-full mb-6">
            <Link
              to="/"
              className="flex items-center hover:opacity-90 transition-opacity"
              title="Return to landing page"
            >
              <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">ΛRDΛ</span>
            </Link>
          </div>

          {/* Render Auth Forms */}
          <Outlet />

          {/* Security & Compliance Footnote */}
          <div className="flex items-center justify-center space-x-2 text-xs text-[var(--text-muted)] mt-5 select-none">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted session · Audit-logged boundary</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        © 2026 ARDA Platform. All rights reserved.
      </footer>
    </div>
  );
};
