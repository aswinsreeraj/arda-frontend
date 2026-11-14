import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from './authApi';
import { useAuthStore } from './authStore';
import { ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react';
import type { RegisterTenantRequest } from './types';

const registerSchema = z.object({
  company_name: z.string().min(2, 'Organization name must be at least 2 characters'),
  display_name: z.string().min(2, 'Full name is required'),
  admin_email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms of service'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterOrgFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export const RegisterOrgForm: React.FC<RegisterOrgFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      company_name: '',
      display_name: '',
      admin_email: '',
      password: '',
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const payload: RegisterTenantRequest = {
        company_name: data.company_name,
        admin_email: data.admin_email,
        password: data.password,
        display_name: data.display_name,
      };

      const res = await authApi.registerTenant(payload);
      setAuth(res.access_token, {
        id: res.user.id,
        email: res.user.email,
        full_name: res.user.display_name,
        tenant_id: res.tenant.id,
        tenant_name: res.tenant.name,
        role: 'company_admin',
        initials: data.display_name.slice(0, 2).toUpperCase(),
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-white mb-1">
          <Building2 className="w-4 h-4 text-blue-400" />
          <h1 className="text-lg font-semibold tracking-tight">Create Organization</h1>
        </div>
        <p className="text-xs text-[#8d90a0]">
          Set up a new isolated multi-tenant workspace with full admin privileges.
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#8d90a0] mb-1">
            Organization name
          </label>
          <input
            {...register('company_name')}
            type="text"
            placeholder="Acme Autonomous Systems"
            className="input-telemetry w-full px-3 py-1.5 text-xs rounded bg-[#141414] border-[#282828] text-[#f3f4f6]"
          />
          {errors.company_name && (
            <p className="text-[11px] text-red-400 mt-1">{errors.company_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8d90a0] mb-1">
            Administrator full name
          </label>
          <input
            {...register('display_name')}
            type="text"
            placeholder="Alex Chen"
            className="input-telemetry w-full px-3 py-1.5 text-xs rounded bg-[#141414] border-[#282828] text-[#f3f4f6]"
          />
          {errors.display_name && (
            <p className="text-[11px] text-red-400 mt-1">{errors.display_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8d90a0] mb-1">
            Work email address
          </label>
          <input
            {...register('admin_email')}
            type="email"
            placeholder="alex@acmefinancial.com"
            className="input-telemetry w-full px-3 py-1.5 text-xs rounded bg-[#141414] border-[#282828] text-[#f3f4f6]"
          />
          {errors.admin_email && (
            <p className="text-[11px] text-red-400 mt-1">{errors.admin_email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8d90a0] mb-1">
            Admin password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="input-telemetry w-full px-3 py-1.5 text-xs rounded pr-9 bg-[#141414] border-[#282828] text-[#f3f4f6]"
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

        {/* Terms */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            {...register('terms')}
            id="reg-terms"
            type="checkbox"
            className="w-3.5 h-3.5 rounded bg-[#141414] border-[#2e2e2e] text-[#2563eb] focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label
            htmlFor="reg-terms"
            className="text-[11px] text-[#888888] cursor-pointer leading-tight select-none"
          >
            I accept the{' '}
            <a href="#tos" className="text-[#2563eb] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-[#2563eb] hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.terms && <p className="text-[11px] text-red-400">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white text-xs font-medium py-2 px-4 rounded shadow-sm transition-all mt-2"
        >
          <span>{isLoading ? 'Creating workspace...' : 'Create Organization & Workspace'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Switch to login */}
      <div className="text-center pt-2 border-t border-[#222222]">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs text-[#8d90a0] hover:text-white transition-colors"
        >
          Already have an account?{' '}
          <span className="text-[#2563eb] hover:underline">Sign in →</span>
        </button>
      </div>
    </div>
  );
};
