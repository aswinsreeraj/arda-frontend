import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

export const PreFooterCTA: React.FC = () => {
  return (
    <section className="py-20 border-b border-slate-200 dark:border-[#282828] bg-slate-50 dark:bg-[#181818] text-center transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Ready to ship governed agents with zero risk?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#9ca3af] max-w-lg mx-auto leading-relaxed">
          Register your first agent configuration in minutes. Production safety, durable execution, and human oversight from day one.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/signup"
            className="btn-primary inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-medium rounded-md bg-[#2563eb] !text-white text-white hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-medium rounded-md border border-slate-300 dark:border-[#282828] bg-white dark:bg-[#1c1c1c] text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#222225] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-500 dark:text-[#9ca3af]" />
            <span>API Reference</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
