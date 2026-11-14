import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
import { AcceptInviteForm } from '@/features/auth/AcceptInviteForm';
import { RegisterOrgForm } from '@/features/auth/RegisterOrgForm';
import { Card } from '@/components/ui/Card';
import type { UserRole } from '@/types/common';
import clsx from 'clsx';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isInvitePath = location.pathname.includes('invite');
  const isRegisterPath = location.pathname.includes('signup') || location.pathname.includes('register');

  const initialMode =
    isInvitePath || searchParams.get('mode') === 'invite'
      ? 'invite'
      : isRegisterPath || searchParams.get('mode') === 'register'
      ? 'register'
      : 'login';

  const [mode, setMode] = useState<'login' | 'invite' | 'register'>(initialMode);
  const [previewRole, setPreviewRole] = useState<UserRole>(
    (searchParams.get('role') as UserRole) || 'agent_developer'
  );
  const navigate = useNavigate();

  const handleSuccess = (userRole?: UserRole) => {
    const explicitRedirect = searchParams.get('redirect');
    if (explicitRedirect) {
      navigate(explicitRedirect);
      return;
    }

    // Role-tailored destination routing
    const role = userRole || previewRole;
    if (role === 'reviewer') {
      navigate('/reviews');
    } else if (role === 'agent_developer') {
      navigate('/agents');
    } else if (role === 'company_admin') {
      navigate('/org');
    } else if (role === 'super_admin') {
      navigate('/platform');
    } else {
      navigate('/reviews');
    }
  };

  return (
    <>
      {/* Authentication Card Container */}
      <Card
        elevated
        className="w-full bg-[#1b1b1b] border-[#282828] rounded-xl shadow-2xl p-6 relative overflow-hidden"
      >
        {mode === 'login' ? (
          <LoginForm
            onSwitchToInvite={() => setMode('invite')}
            onSwitchToRegister={() => setMode('register')}
            onSuccess={() => handleSuccess()}
          />
        ) : mode === 'invite' ? (
          <AcceptInviteForm
            onSwitchToLogin={() => setMode('login')}
            onSuccess={(role) => handleSuccess(role)}
            selectedRole={previewRole}
          />
        ) : (
          <RegisterOrgForm
            onSwitchToLogin={() => setMode('login')}
            onSuccess={() => handleSuccess('company_admin')}
          />
        )}
      </Card>

      {/* Floating Prototype State Switcher (from Stitch Auth & Invitation Screen) */}
      <div className="fixed bottom-4 z-50 flex flex-col items-center gap-2 select-none" data-purpose="prototype-switcher">
        <div className="bg-[#1b1b1b] border border-[#282828] rounded-full p-1 flex items-center space-x-1 shadow-2xl backdrop-blur-md">
          <Link
            to="/reviews"
            className="px-3 py-1 rounded-full text-[11px] font-mono text-[#666666] hover:text-[#999999] transition-all hover:bg-[#252525]"
            title="Prototype Demo View"
          >
            demo
          </Link>
          <Link
            to="/"
            className="px-3 py-1 rounded-full text-[11px] font-mono text-[#666666] hover:text-[#999999] transition-all hover:bg-[#252525]"
            title="Landing Page"
          >
            landing
          </Link>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={clsx(
              'px-3 py-1 rounded-full text-[11px] font-mono transition-all font-medium',
              mode === 'login'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-[#777777] hover:text-white hover:bg-[#252525]'
            )}
          >
            login
          </button>
          <button
            type="button"
            onClick={() => setMode('invite')}
            className={clsx(
              'px-3 py-1 rounded-full text-[11px] font-mono transition-all font-medium',
              mode === 'invite'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-[#777777] hover:text-white hover:bg-[#252525]'
            )}
          >
            invite
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={clsx(
              'px-3 py-1 rounded-full text-[11px] font-mono transition-all font-medium',
              mode === 'register'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-[#777777] hover:text-white hover:bg-[#252525]'
            )}
          >
            register
          </button>
        </div>

        {/* Route Preview toggle when in invite view (Stitch Specification) */}
        {mode === 'invite' && (
          <div className="flex items-center space-x-1 text-[10px] font-mono text-[#666666] bg-[#161616]/95 border border-[#282828] px-2.5 py-1 rounded-md shadow-lg">
            <span className="text-[#555555]">Route Preview:</span>
            <button
              onClick={() => setPreviewRole('agent_developer')}
              className={clsx(
                'px-1 hover:underline transition-colors',
                previewRole === 'agent_developer'
                  ? 'text-blue-400 font-semibold'
                  : 'text-[#888888] hover:text-white'
              )}
            >
              Developer → Registry
            </button>
            <span>·</span>
            <button
              onClick={() => setPreviewRole('reviewer')}
              className={clsx(
                'px-1 hover:underline transition-colors',
                previewRole === 'reviewer'
                  ? 'text-blue-400 font-semibold'
                  : 'text-[#888888] hover:text-white'
              )}
            >
              Reviewer → Queue
            </button>
            <span>·</span>
            <button
              onClick={() => setPreviewRole('company_admin')}
              className={clsx(
                'px-1 hover:underline transition-colors',
                previewRole === 'company_admin'
                  ? 'text-blue-400 font-semibold'
                  : 'text-[#888888] hover:text-white'
              )}
            >
              Admin → Console
            </button>
          </div>
        )}
      </div>
    </>
  );
};
