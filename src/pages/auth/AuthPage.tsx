import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
import { AcceptInviteForm } from '@/features/auth/AcceptInviteForm';
import { RegisterOrgForm } from '@/features/auth/RegisterOrgForm';
import { Card } from '@/components/ui/Card';
import type { UserRole } from '@/types/common';
import clsx from 'clsx';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode =
    searchParams.get('mode') === 'invite'
      ? 'invite'
      : searchParams.get('mode') === 'register'
      ? 'register'
      : 'login';

  const [mode, setMode] = useState<'login' | 'invite' | 'register'>(initialMode);
  const [previewRole, setPreviewRole] = useState<UserRole>('agent_developer');
  const navigate = useNavigate();

  const handleSuccess = () => {
    const redirect = searchParams.get('redirect') || '/reviews';
    navigate(redirect);
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
            onSuccess={handleSuccess}
          />
        ) : mode === 'invite' ? (
          <AcceptInviteForm
            onSwitchToLogin={() => setMode('login')}
            onSuccess={handleSuccess}
            selectedRole={previewRole}
          />
        ) : (
          <RegisterOrgForm
            onSwitchToLogin={() => setMode('login')}
            onSuccess={handleSuccess}
          />
        )}
      </Card>

      {/* Floating State Switcher (from Stitch Auth & Invitation Screen) */}
      <div className="fixed bottom-4 z-50 flex flex-col items-center gap-2 select-none">
        <div className="bg-[#1b1b1b] border border-[#282828] rounded-full p-1 flex items-center space-x-1 shadow-2xl backdrop-blur-md">
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

        {/* Role preview toggle when in invite view */}
        {mode === 'invite' && (
          <div className="flex items-center space-x-1 text-[10px] font-mono text-[#666666] bg-[#161616]/95 border border-[#282828] px-2.5 py-1 rounded-md shadow-lg">
            <span className="text-[#555555]">Role preview:</span>
            <button
              onClick={() => setPreviewRole('agent_developer')}
              className={clsx(
                'px-1 hover:underline',
                previewRole === 'agent_developer' ? 'text-blue-400 font-semibold' : 'text-[#888]'
              )}
            >
              Developer
            </button>
            <span>·</span>
            <button
              onClick={() => setPreviewRole('reviewer')}
              className={clsx(
                'px-1 hover:underline',
                previewRole === 'reviewer' ? 'text-blue-400 font-semibold' : 'text-[#888]'
              )}
            >
              Reviewer
            </button>
            <span>·</span>
            <button
              onClick={() => setPreviewRole('company_admin')}
              className={clsx(
                'px-1 hover:underline',
                previewRole === 'company_admin' ? 'text-blue-400 font-semibold' : 'text-[#888]'
              )}
            >
              Admin
            </button>
          </div>
        )}
      </div>
    </>
  );
};
