import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/features/reviews/reviewApi';
import { getDefaultDashboard } from '@/utils/navigation';
import { ChevronDown, LogOut, Shield } from 'lucide-react';
import clsx from 'clsx';

export const TopNav: React.FC = () => {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch live count of open review cases for tenant
  const { data: queueData } = useQuery({
    queryKey: ['reviews', { status: 'OPEN' }],
    queryFn: ({ signal }) => reviewApi.listReviews({ status: 'OPEN' }, signal),
    staleTime: 15000,
    enabled: !!user && (user.role === 'reviewer' || user.role === 'company_admin'),
  });

  const openCasesCount = queueData?.total_count;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      label: 'Platform',
      path: '/platform',
      visible: hasRole(['super_admin']),
    },
    {
      label: 'Organization',
      path: '/org',
      visible: hasRole(['company_admin']),
    },
    {
      label: 'Review queue',
      path: '/reviews',
      badge: openCasesCount !== undefined ? String(openCasesCount) : undefined,
      visible: hasRole(['reviewer', 'company_admin']),
    },
    {
      label: 'Agents',
      path: '/agents',
      visible: hasRole(['agent_developer', 'company_admin']),
    },
    {
      label: 'Runs',
      path: '/runs',
      visible: hasRole(['reviewer', 'agent_developer', 'company_admin']),
    },
    {
      label: 'Audit trail',
      path: '/audit',
      visible: hasRole(['company_admin', 'reviewer', 'agent_developer']),
    },
    {
      label: 'API Reference',
      path: '/docs',
      visible: true,
    },
    {
      label: 'Guides',
      path: '/guide',
      visible: true,
    },
  ];

  return (
    <header className="flex-none border-b border-slate-200 dark:border-[#242424] bg-white dark:bg-[#161616] px-6 py-3 flex items-center justify-between text-sm z-30 select-none transition-colors">
      <div className="flex items-center space-x-6">
        {/* Brand Logo & Workspace */}
        <div className="flex items-center space-x-3">
          <NavLink
            to={getDefaultDashboard(user?.role)}
            title="Go to default console dashboard"
            className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white flex items-center space-x-1.5 hover:opacity-90 transition-opacity"
          >
            <span>ΛRDΛ</span>
          </NavLink>
          <span className="text-slate-400 dark:text-neutral-500">/</span>

          {/* Workspace info */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-[#222] transition-colors py-1 px-2.5 rounded text-sm"
            >
              <span className="font-medium">{user?.tenant_name || 'ARDA'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-60 rounded-md bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] shadow-xl py-1 text-sm text-slate-700 dark:text-neutral-300 z-50">
                <div className="px-3 py-1.5 text-xs uppercase font-mono text-slate-500 dark:text-neutral-400 border-b border-slate-200 dark:border-[#282828]">
                  Active Tenant
                </div>
                <div className="px-3 py-2 text-slate-900 dark:text-white">
                  <div className="font-medium text-sm">{user?.tenant_name || 'ARDA'}</div>
                  <div className="text-xs font-mono text-slate-500 dark:text-neutral-400 mt-1 truncate">
                    {user?.tenant_id}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="flex items-center space-x-1.5">
          {navLinks
            .filter((tab) => tab.visible)
            .map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  clsx(
                    'px-3.5 py-1.5 rounded transition-colors flex items-center space-x-1.5 text-sm font-medium',
                    isActive
                      ? 'bg-slate-100 text-slate-900 border border-slate-300 dark:bg-[#252525] dark:text-white dark:border-[#333333]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-[#202020]'
                  )
                }
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-slate-200 text-slate-700 dark:bg-[#383838] dark:text-neutral-300 px-2 py-0.5 rounded text-xs font-mono leading-none">
                    {tab.badge}
                  </span>
                )}
              </NavLink>
            ))}
        </nav>
      </div>

      {/* Top Right User & Role Details */}
      <div className="flex items-center space-x-4 text-slate-500 dark:text-neutral-400">
        {/* User Identity & Role */}
        <div className="flex items-center space-x-2.5 text-sm">
          <div className="text-right">
            <div className="font-medium text-slate-900 dark:text-neutral-200 text-sm leading-tight">
              {user?.full_name || user?.email}
            </div>
            <div className="flex items-center justify-end space-x-1 text-xs text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
              <Shield className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* User initials badge */}
        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 dark:bg-[#2e2e2e] dark:border-[#3d3d3d] dark:text-neutral-200 flex items-center justify-center font-semibold text-xs">
          {user?.initials || 'AR'}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-[#222] transition-colors p-1.5 rounded"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
