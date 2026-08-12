import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../app/hooks';
import { loginUser, resendVerification } from '../../features/auth/authThunks';
import { syncUserData } from '../../utils/syncUserData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GoogleAuthButton } from '../../components/ui/GoogleAuthButton';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const Login = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const watchEmail = watch('email');

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setUnverifiedEmail('');
    setResendSuccessMsg('');

    try {
      const resultAction = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(resultAction)) {
        await syncUserData(dispatch);
        toast.success(resultAction.payload?.message || t('toasts.loggedIn', 'Welcome back!'));
        navigate(from, { replace: true });
      } else {
        const errorMsg = resultAction.payload || 'Login failed. Please check your credentials.';
        if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('verify your email')) {
          setUnverifiedEmail(data.email);
        } else {
          toast.error(errorMsg);
        }
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const emailToResend = unverifiedEmail || watchEmail;
    if (!emailToResend) {
      toast.error('Please enter your email address to resend verification.');
      return;
    }

    setIsResending(true);
    setResendSuccessMsg('');

    try {
      const resultAction = await dispatch(resendVerification(emailToResend));
      if (resendVerification.fulfilled.match(resultAction)) {
        setResendSuccessMsg(resultAction.payload?.message || 'Verification email resent successfully!');
      } else {
        toast.error(resultAction.payload || 'Failed to resend verification email.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
          {t('auth.loginTitle', 'Welcome Back')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium font-body">
          {t('auth.loginSub', 'Sign in to access your account, wishlist, and orders')}
        </p>
      </div>

      {/* Unverified Email Warning Alert Banner */}
      {unverifiedEmail && (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider font-outfit">
                Email Verification Required
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-body">
                An account with <strong>{unverifiedEmail}</strong> exists, but the email address has not been verified yet.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Didn't receive an email?</span>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isResending}
              isDisabled={isResending}
              onClick={handleResend}
              className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 rounded-xl"
            >
              <RefreshCw size={14} className="mr-1.5" />
              <span>Resend Verification Email</span>
            </Button>
          </div>

          {resendSuccessMsg && (
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
              ✓ {resendSuccessMsg}
            </p>
          )}
        </div>
      )}

      {/* Google OAuth Login Button */}
      <GoogleAuthButton text={t('auth.googleSignIn', 'Continue with Google')} redirectTo={from} />

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 font-outfit">
          {t('common.or', 'or sign in with email')}
        </span>
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label={t('auth.emailLabel', 'Email Address')}
          type="email"
          placeholder="name@example.com"
          leftIcon={<Mail size={18} className="text-[#0266C8] dark:text-sky-400" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label={t('auth.passwordLabel', 'Password')}
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={18} className="text-[#0266C8] dark:text-sky-400" />}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#0266C8] focus:ring-[#0266C8]"
            />
            <span>{t('auth.rememberMe', 'Remember me')}</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-extrabold text-[#0266C8] dark:text-sky-400 hover:underline transition-all"
          >
            {t('auth.forgotPasswordLink', 'Forgot password?')}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          className="w-full mt-2 bg-gradient-to-r from-[#0266C8] to-[#0054A6] hover:from-[#0054A6] hover:to-[#003C78] text-white shadow-lg shadow-[#0266C8]/25 rounded-2xl h-12 font-extrabold text-sm tracking-wide transition-all transform active:scale-[0.99]"
        >
          <span>{isSubmitting ? t('auth.sendingBtn', 'Signing In...') : t('auth.signInBtn', 'Sign In')}</span>
          {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
        </Button>
      </form>

      {/* Footer Switch */}
      <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
        <Link
          to="/register"
          className="font-extrabold text-[#0266C8] dark:text-sky-400 hover:underline"
        >
          {t('auth.signUpBtn', 'Create Account')}
        </Link>
      </p>
    </div>
  );
};
