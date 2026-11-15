import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { getDefaultDashboard } from '@/utils/navigation';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export const LandingHeader: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const targetDashboard = getDefaultDashboard(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#282828] bg-[#131313]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link
            to={isAuthenticated ? targetDashboard : '/'}
            className="flex items-center space-x-2 text-white font-semibold tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="text-[#f3f4f6] font-semibold text-lg tracking-tight font-sans">
              ΛRDΛ
            </span>
          </Link>
        </div>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm text-[#9ca3af] font-medium">
          <Link to="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link to="/guide" className="hover:text-white transition-colors">
            Guides
          </Link>
          <Link to="/docs" className="hover:text-white transition-colors">
            API Reference
          </Link>
        </nav>

        {/* Action Buttons & Theme Toggle */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              to={targetDashboard}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-sm font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-xs"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#9ca3af] hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-sm font-medium rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shadow-xs"
              >
                <span>Open Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
