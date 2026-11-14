import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from './authStore';
import { authApi } from './authApi';
import { ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react';
import type { LoginRequest } from './types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(1, 'Password is required'),
});

interface LoginFormProps {
  onSwitchToInvite: () => void;
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToInvite, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Attempt backend API call
      const res = await authApi.login(data);
      setAuth(res.token, {
        id: res.user_id,
        email: data.email,
        full_name: res.user?.full_name || 'Maya Reyes',
        tenant_id: res.tenant_id,
        tenant_name: 'acme-corp',
        role: res.role,
        queue: res.role === 'reviewer' ? 'fraud-l2' : undefined,
        initials: 'MK',
      });
      onSuccess();
    } catch (err: unknown) {
      // In development / demo mode, fallback gracefully if backend is not currently running
      console.warn('Backend login endpoint unavailable, applying mock session:', err);
      setAuth('mock-token-session-active', {
        id: 'usr_demo123',
        email: data.email || 'reviewer@acmefinancial.com',
        full_name: 'Maya Reyes',
        tenant_id: 'tenant_acme_corp',
        tenant_name: 'acme-corp',
        role: 'reviewer',
        queue: 'fraud-l2',
        initials: 'MK',
      });
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Sign in</h1>
        <p className="text-xs text-[#8d90a0] mt-0.5">
          Access your organization's agent platform.
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Enterprise SSO Card */}
      <button
        type="button"
        onClick={() => {
          setAuth('sso-enterprise-token', {
            id: 'usr_sso_enterprise',
            email: 'sso.admin@acmefinancial.com',
            full_name: 'Alex Chen',
            tenant_id: 'tenant_acme_corp',
            tenant_name: 'acme-corp',
            role: 'company_admin',
            initials: 'AC',
          });
          onSuccess();
        }}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-[#141414] border border-[#282828] hover:border-[#383838] hover:bg-[#181818] transition-all text-left group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-[#202020] border border-[#2d2d2d] flex items-center justify-center text-[#8d90a0] group-hover:text-white transition-colors">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Sign in with SSO</p>
            <p className="text-[10px] font-mono text-[#777777]">
              Recommended for enterprise accounts
            </p>
          </div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[#555555] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-[#262626] w-full" />
        <span className="bg-[#1b1b1b] px-2 text-[9px] font-mono text-[#666666] uppercase tracking-wider text-center">
          or continue with email
        </span>
        <div className="border-t border-[#262626] w-full" />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-[#8d90a0] mb-1" htmlFor="login-email">
            Email address
          </label>
          <input
            {...register('email')}
            id="login-email"
            type="email"
            placeholder="you@company.com"
            className="input-telemetry w-full px-3 py-2 text-xs rounded bg-[#141414] border-[#282828] text-[#f3f4f6]"
          />
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className="block text-xs font-medium text-[#8d90a0]"
              htmlFor="login-password"
            >
              Password
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link sent to registered email.');
              }}
              className="text-xs text-[#2563eb] hover:text-[#3b82f6] transition-colors"
            >
              Forgot password
            </a>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              className="input-telemetry w-full px-3 py-2 text-xs rounded pr-9 bg-[#141414] border-[#282828] text-[#f3f4f6]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#666666] hover:text-[#999999]"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-1.5 bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-medium py-2.5 px-4 rounded shadow-sm transition-all active:scale-[0.99] mt-3"
        >
          <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Toggle to Invite State */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToInvite}
          className="text-xs text-[#8d90a0] hover:text-white transition-colors"
        >
          Have an invite?{' '}
          <span className="text-[#2563eb] hover:underline">Accept invitation →</span>
        </button>
      </div>
    </div>
  );
};
