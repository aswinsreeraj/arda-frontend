import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
import { AcceptInviteForm } from '@/features/auth/AcceptInviteForm';
import { RegisterOrgForm } from '@/features/auth/RegisterOrgForm';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/features/auth/authStore';
import { getDefaultDashboard } from '@/utils/navigation';
import type { UserRole } from '@/types/common';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isInvitePath = location.pathname.includes('invite');
  const isRegisterPath = location.pathname.includes('signup') || location.pathname.includes('register');

  const mode: 'login' | 'invite' | 'register' =
    isInvitePath || searchParams.get('mode') === 'invite'
      ? 'invite'
      : isRegisterPath || searchParams.get('mode') === 'register'
      ? 'register'
      : 'login';

  const previewRole: UserRole = (searchParams.get('role') as UserRole) || 'agent_developer';

  const handleSuccess = (userRole?: UserRole) => {
    const explicitRedirect = searchParams.get('redirect');
    if (explicitRedirect) {
      navigate(explicitRedirect);
      return;
    }

    // Role-tailored destination routing
    const role = userRole || useAuthStore.getState().user?.role || previewRole;
    navigate(getDefaultDashboard(role));
  };

  return (
    <Card
      elevated
      className="w-full bg-white dark:bg-[#1b1b1b] border border-slate-200 dark:border-[#282828] rounded-2xl shadow-xl dark:shadow-2xl p-6 sm:p-7 relative overflow-hidden transition-colors"
    >
      {mode === 'login' ? (
        <LoginForm
          onSwitchToInvite={() => navigate('/invite')}
          onSwitchToRegister={() => navigate('/signup')}
          onSuccess={(role) => handleSuccess(role)}
        />
      ) : mode === 'invite' ? (
        <AcceptInviteForm
          onSwitchToLogin={() => navigate('/login')}
          onSwitchToRegister={() => navigate('/signup')}
          onSuccess={(role) => handleSuccess(role)}
          selectedRole={previewRole}
        />
      ) : (
        <RegisterOrgForm
          onSwitchToLogin={() => navigate('/login')}
          onSwitchToInvite={() => navigate('/invite')}
          onSuccess={() => handleSuccess('company_admin')}
        />
      )}
    </Card>
  );
};
