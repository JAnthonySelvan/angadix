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
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          {t('auth.loginTitle', 'Welcome Back')}
        </h1>
        <p className="text-sm text-slate-500 font-body">
          {t('auth.loginSub', 'Sign in to access your account, wishlist, and orders')}
        </p>
      </div>

      {/* Unverified Email Warning Alert Banner */}
      {unverifiedEmail && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-heading">
                Email Verification Required
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed font-body">
                An account with <strong>{unverifiedEmail}</strong> exists, but the email address has not been verified yet.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
            <span className="text-[11px] text-amber-700 font-semibold">Didn't receive an email?</span>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isResending}
              isDisabled={isResending}
              onClick={handleResend}
              className="bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              <RefreshCw size={14} className="mr-1.5" />
              <span>Resend Verification Email</span>
            </Button>
          </div>

          {resendSuccessMsg && (
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              ✓ {resendSuccessMsg}
            </p>
          )}
        </div>
      )}

      {/* Google OAuth Login Button */}
      <GoogleAuthButton text={t('auth.googleSignIn', 'Continue with Google')} redirectTo={from} />

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-200/80 w-full" />
        <span className="bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          {t('common.or', 'or')}
        </span>
        <div className="border-t border-slate-200/80 w-full" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label={t('auth.emailLabel', 'Email Address')}
          type="email"
          placeholder="name@example.com"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label={t('auth.passwordLabel', 'Password')}
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={18} />}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary-800 focus:ring-primary-600"
            />
            <span>{t('auth.rememberMe', 'Remember me')}</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-bold text-primary-800 hover:text-primary-900 hover:underline transition-all"
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
          className="w-full mt-1"
        >
          <span>{isSubmitting ? t('auth.sendingBtn', 'Signing In...') : t('auth.signInBtn', 'Sign In')}</span>
          {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
        </Button>
      </form>

      {/* Footer Switch */}
      <p className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
        {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
        <Link
          to="/register"
          className="font-bold text-primary-800 hover:text-primary-900 hover:underline"
        >
          {t('auth.signUpBtn', 'Create Account')}
        </Link>
      </p>
    </div>
  );
};
