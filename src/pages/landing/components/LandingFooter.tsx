import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-[#131313] py-12 text-sm border-t border-slate-200 dark:border-[#282828] text-slate-600 dark:text-[#a1a1aa] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Branding Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-slate-900 dark:text-white font-semibold font-sans text-base">ΛRDΛ</span>
            <span className="text-slate-400 dark:text-[#52525b]">·</span>
            <span className="text-sm text-slate-600 dark:text-[#a1a1aa]">Deterministic AI Agent Governance & Execution</span>
          </div>
        </div>

        {/* Clean, Focused Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pt-6 border-t border-slate-200 dark:border-[#282828]">
          {/* Col 1: Documentation */}
          <div className="space-y-3">
            <div className="text-slate-900 dark:text-white font-medium font-sans text-sm">Documentation</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/guide" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Account */}
          <div className="space-y-3">
            <div className="text-slate-900 dark:text-white font-medium font-sans text-sm">Account</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Safety */}
          <div className="space-y-3">
            <div className="text-slate-900 dark:text-white font-medium font-sans text-sm">Platform Safety</div>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-[#71717a]">
              <li>Durable Workflow Execution</li>
              <li>Policy Tool Gateway</li>
              <li>Calibrated Confidence Gating</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-200 dark:border-[#282828] flex flex-col sm:flex-row items-center justify-between text-slate-500 dark:text-[#71717a] text-xs font-mono gap-2">
          <div>© 2026 ARDA Platform. All rights reserved.</div>
          <div className="font-sans text-xs">Engineered for production enterprise agent safety.</div>
        </div>
      </div>
    </footer>
  );
};
