import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { getDefaultDashboard } from '@/utils/navigation';

export const LandingHeader: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const targetDashboard = getDefaultDashboard(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#282828] bg-white/95 dark:bg-[#131313]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link
            to={isAuthenticated ? targetDashboard : '/'}
            className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="font-semibold text-lg tracking-tight font-sans">
              ΛRDΛ
            </span>
          </Link>
        </div>

        {/* Public Navigation Links: Only Guides and API Reference */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            to="/guide"
            className="text-slate-600 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors"
          >
            Guides
          </Link>
          <Link
            to="/docs"
            className="text-slate-600 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors"
          >
            API Reference
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {isAuthenticated ? (
            <Link
              to={targetDashboard}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-md bg-[#2563eb] !text-white text-white hover:bg-[#1d4ed8] transition-colors shadow-xs"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white px-2.5 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-md bg-[#2563eb] !text-white text-white hover:bg-[#1d4ed8] transition-colors shadow-xs"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
