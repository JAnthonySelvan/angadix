import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { forgotPassword } from '../../features/auth/authThunks';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await dispatch(forgotPassword(data)).unwrap();
      setIsSubmitted(true);
      toast.success('Password reset instructions processed.');
    } catch {
      // Still show success to prevent enumeration
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-800 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Forgot your password?
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          No worries. Enter your registered email address below and we'll send you a password reset link.
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-base font-bold text-emerald-900">Check Your Email</h3>
          <p className="text-xs text-emerald-800/90 leading-relaxed">
            If an account with that email exists, password reset instructions have been sent to your inbox.
          </p>
          <Link to="/login" className="w-full mt-2">
            <Button variant="primary" size="md" className="w-full">
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            leftIcon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            className="w-full mt-2"
          >
            Send Reset Link
          </Button>
        </form>
      )}
    </div>
  );
};
