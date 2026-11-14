import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/features/reviews/reviewApi';
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
      visible: true,
    },
    {
      label: 'Audit trail',
      path: '/audit',
      visible: hasRole(['company_admin', 'reviewer', 'agent_developer']),
    },
    {
      label: 'Organization',
      path: '/org',
      visible: hasRole(['company_admin']),
    },
  ];

  return (
    <header className="flex-none border-b border-[#242424] bg-[#161616] px-4 py-2.5 flex items-center justify-between text-xs z-30 select-none">
      <div className="flex items-center space-x-6">
        {/* Brand Logo & Workspace */}
        <div className="flex items-center space-x-2.5">
          <NavLink
            to="/"
            className="font-semibold text-sm tracking-tight text-white flex items-center space-x-1.5"
          >
            <span>ΛRDΛ</span>
          </NavLink>
          <span className="text-neutral-600">/</span>

          {/* Workspace info */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1.5 text-neutral-300 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-[#222]"
            >
              <span>{user?.tenant_name || 'Acme Robotics'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-52 rounded-md bg-[#1c1c1c] border border-[#2e2e2e] shadow-xl py-1 text-xs text-neutral-300 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-neutral-500 border-b border-[#282828]">
                  Active Tenant
                </div>
                <div className="px-3 py-2 text-white">
                  <div className="font-medium">{user?.tenant_name || 'Acme Robotics'}</div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate">
                    {user?.tenant_id}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          {navLinks
            .filter((tab) => tab.visible)
            .map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  clsx(
                    'px-2.5 py-1 rounded transition-colors flex items-center space-x-1.5',
                    isActive
                      ? 'bg-[#252525] text-white font-medium border border-[#333333]'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202020]'
                  )
                }
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-[#383838] text-neutral-300 px-1.5 py-0.2 rounded text-[10px] font-mono leading-none">
                    {tab.badge}
                  </span>
                )}
              </NavLink>
            ))}
        </nav>
      </div>

      {/* Top Right User & Role Details */}
      <div className="flex items-center space-x-3 text-neutral-400">
        {/* User Identity & Role */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="text-right">
            <div className="font-medium text-neutral-200 text-[11px] leading-tight">
              {user?.full_name || user?.email}
            </div>
            <div className="flex items-center justify-end space-x-1 text-[10px] text-neutral-400 font-mono">
              <Shield className="w-2.5 h-2.5 text-blue-400" />
              <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* User initials badge */}
        <div className="h-6 w-6 rounded bg-[#2e2e2e] border border-[#3d3d3d] text-neutral-200 flex items-center justify-center font-medium text-[11px]">
          {user?.initials || 'AR'}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="text-neutral-500 hover:text-red-400 transition-colors p-1"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
