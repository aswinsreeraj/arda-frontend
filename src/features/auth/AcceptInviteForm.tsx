import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from './authStore';
import { authApi } from './authApi';
import { ArrowRight, Eye, EyeOff, Mail, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/types/common';


const inviteSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type InviteFormData = z.infer<typeof inviteSchema>;

interface AcceptInviteFormProps {
  onSwitchToLogin: () => void;
  onSwitchToRegister?: () => void;
  onSuccess: (role?: UserRole) => void;
  selectedRole?: UserRole;
}

export const AcceptInviteForm: React.FC<AcceptInviteFormProps> = ({
  onSwitchToLogin,
  onSwitchToRegister,
  onSuccess,
  selectedRole = 'agent_developer',
}) => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Dynamic invitation details from query params (sent via Mailtrap email link)
  const inviteEmail = searchParams.get('email') || searchParams.get('to') || '';
  const token = searchParams.get('token') || '';
  const orgName = searchParams.get('org') || searchParams.get('tenant_name') || 'Organization';
  const invitedBy = searchParams.get('invitedBy') || searchParams.get('inviter') || 'Organization Admin';
  const effectiveRole = (searchParams.get('role') as UserRole) || selectedRole;


  const hasInvitation = Boolean(inviteEmail || token);

  const orgInitials = orgName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AR';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const inviteToken = token || searchParams.get('token') || '';
      if (!inviteToken) {
        setErrorMsg('Invalid invitation token. Please check your invitation email.');
        return;
      }

      const res = await authApi.acceptInvitation(inviteToken, {
        full_name: data.fullName,
        password: data.password,
      });

      // Clear any cached local invite for this email
      if (typeof localStorage !== 'undefined') {
        const localInvitesStr = localStorage.getItem('arda_local_invites');
        if (localInvitesStr) {
          try {
            const list = JSON.parse(localInvitesStr) as Array<{ email: string }>;
            const filtered = list.filter((item) => item.email.toLowerCase() !== res.user.email.toLowerCase());
            localStorage.setItem('arda_local_invites', JSON.stringify(filtered));
          } catch {
            // Ignore parse error
          }
        }
      }

      setAuth(res.access_token, {
        id: res.user.id,
        email: res.user.email,
        full_name: res.user.display_name,
        tenant_id: res.active_tenant_id,
        tenant_name: orgName,
        role: res.role,
        initials: res.user.display_name.slice(0, 2).toUpperCase(),
        queue: res.role === 'reviewer' ? 'general-reviews' : undefined,
      });
      onSuccess(res.role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invitation. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };


  const roleNameMap: Record<UserRole, string> = {
    reviewer: 'Reviewer',
    agent_developer: 'Agent Developer',
    company_admin: 'Company Admin',
    super_admin: 'Super Admin',
  };

  if (!hasInvitation) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invitation Link Required</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Team invitations are sent directly via email. Please check your inbox (or Mailtrap) for your secure invitation link to join the organization.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium py-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
          >
            Return to Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Organization Invitation Details Box */}
      <div className="bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] rounded-xl p-3.5 text-xs space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-[#1e2a4a] border border-blue-200 dark:border-[#2b3e75] text-blue-700 dark:text-[#b4c5ff] font-bold text-xs flex items-center justify-center shrink-0">
            {orgInitials}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-700 dark:text-[#e5e2e1] font-normal leading-snug">
              <strong className="text-slate-900 dark:text-white font-semibold">{orgName}</strong> has invited you to
              ARDA
            </p>
            <p className="text-[10px] font-mono text-slate-500 dark:text-[#777777]">Invited by {invitedBy}</p>
          </div>
        </div>

        {/* Role & Email metadata table */}
        <div className="pt-2 border-t border-slate-200 dark:border-[#232323] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-[#888888]">Assigned role</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#16233d] dark:text-[#b4c5ff] dark:border-[#263b6b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] mr-1.5" />
              {roleNameMap[effectiveRole]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-[#888888]">Email</span>
            <span className="font-mono text-slate-600 dark:text-[#aaaaaa] text-[10px]">{inviteEmail}</span>
          </div>
        </div>
      </div>

      {/* Section Heading */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Accept invitation</h2>
        <p className="text-xs text-slate-500 dark:text-[#8d90a0] mt-0.5">
          Choose a name and password to complete your account setup.
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#8d90a0] mb-1" htmlFor="invite-fullname">
            Full name
          </label>
          <input
            {...register('fullName')}
            id="invite-fullname"
            type="text"
            placeholder="Morgan Lee"
            className="input-telemetry w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] text-slate-900 dark:text-[#f3f4f6]"
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#8d90a0] mb-1" htmlFor="invite-password">
            Set password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="invite-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="input-telemetry w-full px-3 pr-8 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] text-slate-900 dark:text-[#f3f4f6]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label
            className="block text-xs font-medium text-slate-700 dark:text-[#8d90a0] mb-1"
            htmlFor="invite-confirm-password"
          >
            Confirm password
          </label>
          <input
            {...register('confirmPassword')}
            id="invite-confirm-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            className="input-telemetry w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] text-slate-900 dark:text-[#f3f4f6]"
          />
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            {...register('terms')}
            id="terms"
            type="checkbox"
            className="w-3.5 h-3.5 rounded bg-slate-50 dark:bg-[#141414] border-slate-300 dark:border-[#2e2e2e] text-[#2563eb] focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label
            htmlFor="terms"
            className="text-[11px] text-slate-600 dark:text-[#888888] cursor-pointer leading-tight select-none"
          >
            I accept the{' '}
            <span className="text-[#2563eb] hover:underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-[#2563eb] hover:underline">
              Privacy Policy
            </span>
          </label>
        </div>
        {errors.terms && <p className="text-[11px] text-red-500 dark:text-red-400">{errors.terms.message}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] !text-white text-white text-xs font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all mt-2 cursor-pointer"
        >
          <span>{isLoading ? 'Accepting...' : 'Accept invitation'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Navigation toggles to other pages */}
      <div className="pt-3 text-center text-xs text-slate-500 dark:text-[#8d90a0] space-y-2 border-t border-slate-200 dark:border-[#222222]">
        <div>
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#2563eb] hover:underline font-medium cursor-pointer"
          >
            Sign in →
          </button>
        </div>
        {onSwitchToRegister && (
          <div>
            <span>Need to create a new organization? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[#2563eb] hover:underline font-medium cursor-pointer"
            >
              Sign up for organization →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

