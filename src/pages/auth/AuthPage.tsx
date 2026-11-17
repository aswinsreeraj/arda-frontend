import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
import { AcceptInviteForm } from '@/features/auth/AcceptInviteForm';
import { RegisterOrgForm } from '@/features/auth/RegisterOrgForm';
import { VerifyEmailForm } from '@/features/auth/VerifyEmailForm';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/features/auth/authStore';
import { getDefaultDashboard } from '@/utils/navigation';
import type { UserRole } from '@/types/common';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const isInvitePath = location.pathname.includes('invite');
  const isRegisterPath = location.pathname.includes('signup') || location.pathname.includes('register');
  const isVerifyPath = location.pathname.includes('verify');

  React.useEffect(() => {
    if (isAuthenticated && user && !isInvitePath) {
      navigate(getDefaultDashboard(user.role), { replace: true });
    }
  }, [isAuthenticated, user, isInvitePath, navigate]);

  const mode: 'login' | 'invite' | 'register' | 'verify' =
    isVerifyPath || searchParams.get('mode') === 'verify'
      ? 'verify'
      : isInvitePath || searchParams.get('mode') === 'invite'
      ? 'invite'
      : isRegisterPath || searchParams.get('mode') === 'register'
      ? 'register'
      : 'login';

  const previewRole: UserRole = (searchParams.get('role') as UserRole) || 'agent_developer';

  const handleSuccess = (userRole?: UserRole) => {
    // Always navigate to the user's role-specific default dashboard
    const role = userRole || useAuthStore.getState().user?.role || previewRole;
    navigate(getDefaultDashboard(role), { replace: true });
  };

  return (
    <Card
      elevated
      className="w-full bg-white dark:bg-[#1b1b1b] border border-slate-200 dark:border-[#282828] rounded-2xl shadow-xl dark:shadow-2xl p-6 sm:p-7 relative overflow-hidden transition-colors"
    >
      {mode === 'login' ? (
        <LoginForm
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
      ) : mode === 'verify' ? (
        <VerifyEmailForm
          initialEmail={searchParams.get('email') || ''}
          initialToken={searchParams.get('token') || ''}
          onSwitchToLogin={(email) =>
            navigate(email ? `/login?verified=true&email=${encodeURIComponent(email)}` : '/login?verified=true')
          }
        />
      ) : (
        <RegisterOrgForm
          onSwitchToLogin={() => navigate('/login')}
          onSuccess={() => handleSuccess('company_admin')}
        />
      )}
    </Card>
  );
};

