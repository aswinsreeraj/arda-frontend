import React from 'react';
import { Link } from 'react-router-dom';

export const DocsHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#282828] backdrop-blur-sm bg-white/95 dark:bg-[#131313]/95 transition-colors">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left brand & primary nav */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-slate-900 dark:text-white font-medium text-base tracking-tight hover:opacity-90"
          >
            <span className="font-semibold text-slate-900 dark:text-white tracking-wide text-base font-sans">
              ΛRDΛ
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/guide"
              className="text-slate-600 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors"
            >
              Guides
            </Link>
            <Link to="/docs" className="text-slate-900 dark:text-white font-semibold">
              API Reference
            </Link>
          </nav>
        </div>

        {/* Right auth actions */}
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-[#2563eb] !text-white text-white px-4 py-2 rounded hover:bg-[#1d4ed8] transition-colors shadow-xs"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};
