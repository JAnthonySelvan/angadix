import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { loginUser } from '../../features/auth/authThunks';
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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success(resultAction.payload?.message || 'Welcome back to Angadix!');
        navigate(from, { replace: true });
      } else {
        const errorMsg = resultAction.payload?.message || 'Invalid email or password.';
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error(error?.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
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
