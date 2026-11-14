import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Key } from 'lucide-react';

interface DocsHeaderProps {
  onOpenApiKeyModal: () => void;
}

export const DocsHeader: React.FC<DocsHeaderProps> = ({ onOpenApiKeyModal }) => {
  return (
    <header className="h-14 border-b border-[#282828] bg-[#161616]/95 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Navigation */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2.5 text-white font-medium group">
          <span className="text-sm font-semibold tracking-wide font-sans">ΛRDΛ</span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#242424] text-[#A0A0A0] border border-[#2e2e2e]">
            v1.0
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1 text-xs">
          <Link
            to="/guide"
            className="px-3 py-1.5 text-[#888888] hover:text-white rounded transition-colors"
          >
            Guides
          </Link>
          <Link
            to="/docs"
            className="px-3 py-1.5 text-white bg-[#222222] border border-[#2e2e2e] rounded font-medium shadow-inner"
          >
            API reference
          </Link>
          <Link
            to="/runs"
            className="px-3 py-1.5 text-[#888888] hover:text-white rounded transition-colors"
          >
            Traces
          </Link>
          <Link
            to="/audit"
            className="px-3 py-1.5 text-[#888888] hover:text-white rounded transition-colors"
          >
            Audit Trail
          </Link>
        </nav>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center space-x-3 text-xs">
        <button
          onClick={onOpenApiKeyModal}
          type="button"
          className="hidden sm:flex items-center space-x-1.5 text-[#888888] hover:text-white transition-colors px-2 py-1"
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys</span>
        </button>
        <Link
          to="/login"
          className="text-[#888888] hover:text-white transition-colors px-2 py-1"
        >
          Sign in
        </Link>
        <Link
          to="/reviews"
          className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-medium shadow-sm transition-all flex items-center space-x-1.5"
        >
          <span>Open Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
};
