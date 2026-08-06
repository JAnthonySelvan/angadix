import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CheckCircle, CheckCircle2 } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { resetPassword } from '../../features/auth/authThunks';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[a-z]/, 'Must contain at least 1 lowercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number')
      .regex(/[@$!%*?&]/, 'Must contain at least 1 special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams();
  const rawToken = (searchParams.get('token') || pathToken || '').trim();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    if (!rawToken) {
      toast.error('Invalid or missing reset token.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(
        resetPassword({ token: rawToken, password: data.password })
      );

      if (resetPassword.fulfilled.match(resultAction)) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorMsg = resultAction.payload?.message || 'Password reset failed.';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reset Your Password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Please enter your new password below.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-base font-bold text-emerald-900">Password Reset Complete</h3>
          <p className="text-xs text-emerald-800">
            Your password has been updated. Redirecting to login in 3 seconds...
          </p>
          <Link to="/login" className="w-full mt-2">
            <Button variant="primary" size="md" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<CheckCircle size={18} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            className="w-full mt-2"
          >
            Update Password
          </Button>
        </form>
      )}
    </div>
  );
};
