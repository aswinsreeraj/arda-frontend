import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from './authStore';
import { authApi } from './authApi';
import { ArrowRight, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
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
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'reviewer@acme.com',
      password: 'ReviewerPass123!',
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
        tenant_name: 'Acme Robotics',
        role: res.role,
        queue: res.role === 'reviewer' ? 'fraud-l2' : undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Sign in</h1>
        <p className="text-xs text-[#8d90a0] mt-0.5">
          Access your organization's agent governance platform.
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Quick Test Credential Switchers */}
      <div className="p-2.5 rounded bg-[#181818] border border-[#262626] space-y-2">
        <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold tracking-wider">
          Quick Sign In (Verified Accounts)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('reviewer@acme.com', 'ReviewerPass123!')}
            className="flex items-center space-x-1.5 p-2 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left text-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div>
              <div className="font-medium text-white text-[11px]">Rachel (Reviewer)</div>
              <div className="text-[10px] text-neutral-400 font-mono">reviewer@acme.com</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin@acme.com', 'AdminPass123!')}
            className="flex items-center space-x-1.5 p-2 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left text-xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <div>
              <div className="font-medium text-white text-[11px]">Alice (Admin)</div>
              <div className="text-[10px] text-neutral-400 font-mono">admin@acme.com</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Work email address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="reviewer@organization.com"
            autoComplete="email"
            className="w-full bg-[#181818] border border-[#2c2c2c] rounded px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="w-full bg-[#181818] border border-[#2c2c2c] rounded pl-3 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2 rounded text-xs transition-colors flex items-center justify-center space-x-1.5 shadow"
        >
          {isLoading ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign in with password</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-neutral-400 border-t border-[#222222]">
        <span>Have an invite token? </span>
        <button
          type="button"
          onClick={onSwitchToInvite}
          className="text-blue-400 hover:text-blue-300 underline font-medium"
        >
          Accept organization invitation
        </button>
      </div>
    </div>
  );
};
