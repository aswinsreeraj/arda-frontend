import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from './authStore';
import { authApi } from './authApi';
import { ArrowRight, Eye, EyeOff, ShieldCheck, UserCheck, Building2, Code, Shield } from 'lucide-react';
import type { LoginRequest } from './types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(1, 'Password is required'),
});

interface LoginFormProps {
  onSwitchToInvite: () => void;
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToInvite,
  onSwitchToRegister,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoOpen, setIsSsoOpen] = useState(false);
  const [ssoDomain, setSsoDomain] = useState('');
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

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain.trim()) return;

    // Simulate seamless Enterprise SSO sign-in
    setAuth('sso-enterprise-jwt-token', {
      id: 'usr_sso_8819',
      email: `alex.chen@${ssoDomain.replace('@', '')}`,
      full_name: 'Alex Chen (SSO)',
      tenant_id: 'tenant_acme_core',
      tenant_name: 'Acme Enterprise',
      role: 'company_admin',
      initials: 'AC',
    });
    onSuccess();
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

      {/* Enterprise SSO Card (from Stitch Auth Specification) */}
      {!isSsoOpen ? (
        <button
          onClick={() => setIsSsoOpen(true)}
          type="button"
          className="w-full flex items-center justify-between p-3 rounded-lg bg-[#141414] border border-[#282828] hover:border-[#383838] transition-all group text-left"
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
      ) : (
        <form
          onSubmit={handleSsoSubmit}
          className="p-3 rounded-lg bg-[#141414] border border-blue-500/40 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Enterprise SAML / OIDC</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSsoOpen(false)}
              className="text-[10px] text-[#777777] hover:text-white"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            value={ssoDomain}
            onChange={(e) => setSsoDomain(e.target.value)}
            placeholder="e.g. acme-corp.com or work email"
            className="input-telemetry w-full px-2.5 py-1.5 text-xs rounded bg-[#181818] border-[#2e2e2e] text-white"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs py-1.5 rounded font-medium transition-colors"
          >
            Authenticate via Identity Provider →
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-[#262626] w-full" />
        <span className="bg-[#1b1b1b] px-2 text-[9px] font-mono text-[#666666] uppercase tracking-wider text-center shrink-0">
          or continue with email
        </span>
        <div className="border-t border-[#262626] w-full" />
      </div>

      {/* Quick Test Credential Switchers */}
      <div className="p-2.5 rounded bg-[#181818] border border-[#262626] space-y-2">
        <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold tracking-wider block">
          Quick Sign In (Verified Accounts)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('reviewer@acme.com', 'ReviewerPass123!')}
            className="flex items-center space-x-1.5 p-1.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left text-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div>
              <div className="font-medium text-white text-[11px]">Rachel (Reviewer)</div>
              <div className="text-[9px] text-neutral-400 font-mono">reviewer@acme.com</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin@acme.com', 'AdminPass123!')}
            className="flex items-center space-x-1.5 p-1.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left text-xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <div>
              <div className="font-medium text-white text-[11px]">Alice (Admin)</div>
              <div className="text-[9px] text-neutral-400 font-mono">admin@acme.com</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('developer@acme.com', 'DeveloperPass123!')}
            className="flex items-center space-x-1.5 p-1.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left text-xs transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-medium text-white text-[11px]">Dave (Developer)</div>
              <div className="text-[9px] text-neutral-400 font-mono">developer@acme.com</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('superadmin@arda.platform', 'SuperAdminPass123!')}
            className="flex items-center space-x-1.5 p-1.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left text-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <div className="font-medium text-white text-[11px]">Sam (Super Admin)</div>
              <div className="text-[9px] text-neutral-400 font-mono">superadmin@...</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-[#8d90a0] mb-1">
            Work email address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="reviewer@organization.com"
            autoComplete="email"
            className="input-telemetry w-full px-3 py-2 text-xs rounded bg-[#141414] border-[#282828] text-[#f3f4f6]"
          />
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8d90a0] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="input-telemetry w-full px-3 pr-8 py-2 text-xs rounded bg-[#141414] border-[#282828] text-[#f3f4f6]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
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
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-blue-800 text-white font-medium py-2 rounded text-xs transition-colors flex items-center justify-center space-x-1.5 shadow"
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

      {/* Navigation toggles */}
      <div className="pt-2 text-center text-xs text-[#8d90a0] space-y-1.5 border-t border-[#222222]">
        <div>
          <span>Have an invite? </span>
          <button
            type="button"
            onClick={onSwitchToInvite}
            className="text-[#2563eb] hover:underline font-medium"
          >
            Accept invitation →
          </button>
        </div>
        <div>
          <span>New organization? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#2563eb] hover:underline font-medium"
          >
            Register workspace →
          </button>
        </div>
      </div>
    </div>
  );
};
