import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

export const PreFooterCTA: React.FC = () => {
  return (
    <section className="py-20 border-b border-[#282828] bg-[#181818] text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Ready to ship governed agents?
        </h2>
        <p className="text-sm text-[#9ca3af] max-w-lg mx-auto leading-relaxed">
          Register your first agent in minutes. Production-grade infrastructure from day one.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/reviews"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-xs"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-medium rounded border border-[#282828] bg-[#1c1c1c] text-white hover:bg-[#222225] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span>Read the Docs</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
