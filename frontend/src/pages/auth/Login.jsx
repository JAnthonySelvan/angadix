import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
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
        toast.success(resultAction.payload?.message || 'Welcome back to Angadix!');
        navigate(from, { replace: true });
      } else {
        const payload = resultAction.payload;
        const statusCode = payload?.statusCode;
        const errorMsg = payload?.message || 'Invalid email or password.';

        // Explicit 403 check for unverified email address
        if (statusCode === 403 || errorMsg.toLowerCase().includes('not verified')) {
          setUnverifiedEmail(data.email);
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      toast.error(error?.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = unverifiedEmail || watchEmail;
    if (!targetEmail) {
      toast.error('Please enter your email address to resend verification.');
      return;
    }

    setIsResending(true);
    try {
      const result = await dispatch(resendVerification(targetEmail)).unwrap();
      setResendSuccessMsg(result?.message || 'Verification email sent successfully! Please check your inbox.');
      toast.success(result?.message || 'Verification email sent!');
    } catch (err) {
      toast.error(err?.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header Copy */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back! Enter your details below to continue.
        </p>
      </div>

      {/* Dedicated Unverified Email Alert Banner */}
      {unverifiedEmail && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col gap-3.5 animate-fadeIn shadow-sm">
          <div className="flex items-start gap-3 text-amber-900">
            <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">
              <p className="font-bold text-sm text-amber-950">Email Verification Required</p>
              <p className="mt-0.5 text-amber-800">
                An account with <strong>{unverifiedEmail}</strong> exists, but the email address has not been verified yet. Please check your email inbox.
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
      <GoogleAuthButton text="Continue with Google" redirectTo={from} />

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-200/80 w-full" />
        <span className="bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          or sign in with email
        </span>
        <div className="border-t border-slate-200/80 w-full" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
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
            <span>Remember me for 30 days</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-bold text-primary-800 hover:text-primary-900 hover:underline transition-all"
          >
            Forgot password?
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
          <span>Sign In</span>
          {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
        </Button>
      </form>

      {/* Footer Switch */}
      <p className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
        Don't have an Angadix account?{' '}
        <Link
          to="/register"
          className="font-bold text-primary-800 hover:text-primary-900 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};
