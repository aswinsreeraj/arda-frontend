import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';
import { authApi } from './authApi';
import { ApiError } from '@/types/common';

interface VerifyEmailFormProps {
  initialEmail?: string;
  initialToken?: string;
  onSwitchToLogin: (prefilledEmail?: string) => void;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  initialEmail = '',
  initialToken = '',
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenVerifying, setIsTokenVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const tokenVerifiedRef = useRef(false);

  // Auto-verify if token is provided via email confirmation link
  const verifyToken = useCallback(async (tok: string, targetEmail: string) => {
    setIsTokenVerifying(true);
    setErrorMsg(null);
    try {
      await authApi.verifyEmail({ token: tok, email: targetEmail || undefined });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Verification link is invalid or has expired.');
      }
    } finally {
      setIsTokenVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (initialToken && !tokenVerifiedRef.current) {
      tokenVerifiedRef.current = true;
      void verifyToken(initialToken, initialEmail);
    }
  }, [initialToken, initialEmail, verifyToken]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your work email address.');
      return;
    }
    const cleanCode = otpCode.replace(/\s+/g, '').trim();
    if (cleanCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authApi.verifyEmail({ email: email.trim(), code: cleanCode });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid or expired verification code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0) return;
    setErrorMsg(null);
    setResendStatus(null);
    try {
      await authApi.resendVerification(email.trim());
      setResendStatus('A new 6-digit code has been dispatched to your email via Mailtrap.');
      setCooldown(30);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend verification code.';
      setErrorMsg(msg);
    }
  };

  if (isTokenVerifying) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Verifying your email...</h2>
        <p className="text-xs text-slate-500 dark:text-[#8d90a0]">
          Please wait while we validate your confirmation link.
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Email Verified Successfully
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#8d90a0] mt-1 max-w-sm mx-auto">
            Your email {email ? <strong className="text-slate-800 dark:text-slate-200">{email}</strong> : 'account'} has been verified. You can now sign in with your password to access the workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSwitchToLogin(email)}
          className="btn-primary w-full flex items-center justify-center space-x-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] !text-white text-white text-xs font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>Continue to Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Verify your email
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#8d90a0]">
          We have sent a 6-digit confirmation code and a verification link to your inbox.
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {resendStatus && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{resendStatus}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleVerifyOTP} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#8d90a0] mb-1">
            Work email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@organization.com"
            className="input-telemetry w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] text-slate-900 dark:text-[#f3f4f6]"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-[#8d90a0]">
              6-digit verification code
            </label>
            <span className="text-[10px] text-slate-400 dark:text-[#666666]">Valid for 24 hours</span>
          </div>
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              autoFocus
              className="input-telemetry w-full px-3 py-2.5 text-center text-sm font-mono tracking-widest rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] text-slate-900 dark:text-[#f3f4f6] focus:border-blue-500 dark:focus:border-blue-500"
            />
            <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || otpCode.length !== 6}
          className="btn-primary w-full flex items-center justify-center space-x-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 !text-white text-white text-xs font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          {isLoading ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Verify & Continue to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Resend actions */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-[#8d90a0]">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || !email.trim()}
          className="flex items-center space-x-1 text-[#2563eb] hover:underline disabled:text-slate-400 dark:disabled:text-[#555555] disabled:no-underline font-medium cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${cooldown > 0 ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code via Mailtrap'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchToLogin(email)}
          className="flex items-center space-x-1 text-slate-500 hover:text-slate-700 dark:text-[#888888] dark:hover:text-[#ffffff] cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Sign In</span>
        </button>
      </div>

      {/* Mailtrap notice */}
      <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 text-[11px] text-blue-600 dark:text-blue-400">
        <p className="font-medium mb-0.5">Mailtrap Email Delivery</p>
        <p className="text-slate-600 dark:text-[#8d90a0]">
          Emails are routed to your configured Mailtrap sandbox inbox. Check Mailtrap to inspect the received verification email or click the direct confirmation link.
        </p>
      </div>
    </div>
  );
};
