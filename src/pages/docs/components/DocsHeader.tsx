import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Key } from 'lucide-react';

interface DocsHeaderProps {
  onOpenApiKeyModal: () => void;
}

export const DocsHeader: React.FC<DocsHeaderProps> = ({ onOpenApiKeyModal }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-[#282828] bg-white/95 dark:bg-[#161616]/95 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between px-6 transition-colors">
      {/* Brand & Navigation */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-medium group">
          <span className="text-base font-semibold tracking-wide font-sans">ΛRDΛ</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-[#A0A0A0] border border-slate-300 dark:border-[#2e2e2e]">
            v1.0
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-2 text-sm">
          <Link
            to="/guide"
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white rounded transition-colors"
          >
            Guides
          </Link>
          <Link
            to="/docs"
            className="px-3.5 py-1.5 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#222222] border border-slate-300 dark:border-[#2e2e2e] rounded font-medium shadow-inner"
          >
            API Reference
          </Link>
        </nav>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center space-x-4 text-sm">
        <button
          onClick={onOpenApiKeyModal}
          type="button"
          className="hidden sm:flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white transition-colors px-2 py-1 cursor-pointer"
        >
          <Key className="w-4 h-4" />
          <span>API Keys</span>
        </button>
        <Link
          to="/login"
          className="text-slate-600 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white transition-colors px-2 py-1"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] !text-white text-white rounded font-medium shadow-sm transition-all flex items-center space-x-1.5"
        >
          <span>Sign Up</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};
