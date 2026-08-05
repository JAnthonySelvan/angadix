import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { registerUser } from '../../features/auth/authThunks';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GoogleAuthButton } from '../../components/ui/GoogleAuthButton';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[a-z]/, 'Must contain at least 1 lowercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number')
      .regex(/[@$!%*?&]/, 'Must contain at least 1 special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service to register',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const watchPassword = watch('password', '');

  // Calculate live password strength
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[@$!%*?&]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(watchPassword);

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-600' };
    if (strengthScore <= 4) return { text: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-600' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      const resultAction = await dispatch(registerUser(payload));
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success(
          resultAction.payload?.message ||
            'Registration successful! Please check your email to verify your account.'
        );
        navigate('/login');
      } else {
        const errorMsg = resultAction.payload?.message || 'Registration failed.';
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error(error?.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create an Angadix account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Join Angadix today to unlock curated releases & seamless checkout.
        </p>
      </div>

      {/* Google OAuth Register Button */}
      <GoogleAuthButton text="Sign up with Google" redirectTo="/" />

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-200/80 w-full" />
        <span className="bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          or sign up with email
        </span>
        <div className="border-t border-slate-200/80 w-full" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          leftIcon={<User size={18} />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Password Strength Meter Bar */}
          {watchPassword && (
            <div className="mt-1.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Password Strength:</span>
                <span className={`font-bold ${strength.textColor}`}>{strength.text}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strengthScore / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<CheckCircle size={18} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-800 focus:ring-primary-600 shrink-0"
              {...register('acceptTerms')}
            />
            <span className="text-xs text-slate-600 leading-normal">
              I agree to the{' '}
              <a href="#terms" className="text-primary-800 font-semibold underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-primary-800 font-semibold underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-semantic-error mt-1">• {errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          className="w-full mt-1"
        >
          <span>Create Account</span>
          {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
        </Button>
      </form>

      {/* Switch */}
      <p className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-primary-800 hover:text-primary-900 hover:underline"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
};
