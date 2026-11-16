import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from './authStore';
import { authApi } from './authApi';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import type { LoginRequest } from './types';
import type { UserRole } from '@/types/common';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(1, 'Password is required'),
});

interface LoginFormProps {
  onSwitchToInvite: () => void;
  onSwitchToRegister: () => void;
  onSuccess: (role?: UserRole) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToInvite,
  onSwitchToRegister,
  onSuccess,
}) => {
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
      const res = await authApi.login(data);
      setAuth(res.access_token, {
        id: res.user.id,
        email: res.user.email,
        full_name: res.user.display_name,
        tenant_id: res.active_tenant_id,
        tenant_name: res.user.display_name ? `${res.user.display_name}'s Org` : 'Organization',
        role: res.role,
        queue: res.role === 'reviewer' ? 'general-reviews' : undefined,
      });
      onSuccess(res.role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Sign in</h1>
        <p className="text-xs text-slate-500 dark:text-[#8d90a0] mt-0.5">
          Access your organization's agent governance platform.
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#8d90a0] mb-1">
            Work email address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="reviewer@organization.com"
            autoComplete="email"
            className="input-telemetry w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] text-slate-900 dark:text-[#f3f4f6]"
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#8d90a0] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
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

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-blue-800 !text-white text-white font-medium py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
        >
          {isLoading ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Navigation toggles to other pages */}
      <div className="pt-3 text-center text-xs text-slate-500 dark:text-[#8d90a0] space-y-2 border-t border-slate-200 dark:border-[#222222]">
        <div>
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#2563eb] hover:underline font-medium cursor-pointer"
          >
            Sign up for organization →
          </button>
        </div>
        <div>
          <span>Have an invitation link? </span>
          <button
            type="button"
            onClick={onSwitchToInvite}
            className="text-[#2563eb] hover:underline font-medium cursor-pointer"
          >
            Accept invitation →
          </button>
        </div>
      </div>
    </div>
  );
};
