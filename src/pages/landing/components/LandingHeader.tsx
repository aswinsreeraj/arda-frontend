import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const LandingHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#282828] bg-[#131313]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Status Pill */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="flex items-center space-x-2.5 text-white font-semibold tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="text-[#f3f4f6] font-semibold text-sm tracking-tight font-sans">
              ΛRDΛ
            </span>
          </Link>
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-[#282828] text-[11px] font-mono text-[#6b7280] bg-[#181818]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-[#9ca3af]">all systems operational</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs text-[#9ca3af] font-medium">
          <Link to="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link to="/guide" className="hover:text-white transition-colors">
            Guides
          </Link>
          <Link to="/docs" className="hover:text-white transition-colors">
            API Reference
          </Link>
          <Link to="/runs" className="hover:text-white transition-colors">
            Traces
          </Link>
          <Link to="/audit" className="hover:text-white transition-colors">
            Audit Trail
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-xs font-medium text-[#9ca3af] hover:text-white px-2.5 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/reviews"
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-xs"
          >
            <span>Open Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
