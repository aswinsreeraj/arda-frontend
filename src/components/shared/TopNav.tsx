import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

export const TopNav: React.FC = () => {
  const { user, logout, setRole } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Review queue', path: '/reviews', badge: '11' },
    { label: 'Agents', path: '/agents' },
    { label: 'Runs', path: '/runs' },
    { label: 'Audit', path: '/audit' },
    { label: 'Organization', path: '/org' },
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

          {/* Workspace dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1.5 text-neutral-300 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-[#222]"
            >
              <span>{user?.tenant_name || 'acme-corp'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-md bg-[#1c1c1c] border border-[#2e2e2e] shadow-xl py-1 text-xs text-neutral-300 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-neutral-500 border-b border-[#282828]">
                  Workspaces
                </div>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#262626] flex items-center justify-between text-white"
                >
                  <span>acme-corp</span>
                  <span className="text-[10px] text-emerald-400 font-mono">active</span>
                </button>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#262626] text-neutral-400"
                >
                  <span>acme-staging</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          {navLinks.map((tab) => (
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
              {tab.badge && (
                <span className="bg-[#383838] text-neutral-300 px-1.5 py-0.2 rounded text-[10px] font-mono leading-none">
                  {tab.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Top Right User & Role Details */}
      <div className="flex items-center space-x-4 text-neutral-400">
        {/* Role switcher preview */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center space-x-1.5 hover:text-white transition-colors"
            title="Switch demo role preview"
          >
            <span className="capitalize">{user?.role || 'reviewer'}</span>
            {user?.queue && (
              <>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-300 font-mono text-[11px]">{user.queue}</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-neutral-500" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-md bg-[#1c1c1c] border border-[#2e2e2e] shadow-xl py-1 text-xs text-neutral-300 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-neutral-500 border-b border-[#282828]">
                Role Simulator
              </div>
              <button
                onClick={() => {
                  setRole('reviewer');
                  setIsRoleMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#262626] flex items-center justify-between"
              >
                <span>Reviewer</span>
                {user?.role === 'reviewer' && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
              </button>
              <button
                onClick={() => {
                  setRole('agent_developer');
                  setIsRoleMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#262626] flex items-center justify-between"
              >
                <span>Agent Developer</span>
                {user?.role === 'agent_developer' && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
              </button>
              <button
                onClick={() => {
                  setRole('company_admin');
                  setIsRoleMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#262626] flex items-center justify-between"
              >
                <span>Company Admin</span>
                {user?.role === 'company_admin' && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            </div>
          )}
        </div>

        {/* User initials badge */}
        <div className="h-6 w-6 rounded bg-[#2e2e2e] border border-[#3d3d3d] text-neutral-200 flex items-center justify-center font-medium text-[11px]">
          {user?.initials || 'MK'}
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
