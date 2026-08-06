import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { verifyEmail } from '../../features/auth/authThunks';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams();
  const rawToken = (searchParams.get('token') || pathToken || '').trim();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const dispatch = useAppDispatch();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!rawToken) {
      setStatus('error');
      setMessage('Verification token is missing from the URL.');
      return;
    }

    // Prevent React 18 Strict Mode double-invocation in development
    if (hasFiredRef.current) return;
    hasFiredRef.current = true;

    const doVerify = async () => {
      try {
        const resultAction = await dispatch(verifyEmail(rawToken));
        if (verifyEmail.fulfilled.match(resultAction)) {
          setStatus('success');
          setMessage(
            resultAction.payload?.message ||
              'Your email address has been verified successfully!'
          );
        } else {
          setStatus('error');
          setMessage(
            resultAction.payload?.message ||
              'Verification token is invalid or has expired.'
          );
        }
      } catch {
        setStatus('error');
        setMessage('An unexpected error occurred while verifying your email.');
      }
    };

    doVerify();
  }, [dispatch, rawToken]);

  return (
    <div className="w-full flex flex-col items-center text-center gap-6 py-4">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner size="lg" color="primary" />
          <h2 className="text-xl font-bold text-slate-900">
            Verifying Your Email...
          </h2>
          <p className="text-sm text-slate-500 max-w-sm">
            Please wait while we confirm your email verification link.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Email Verified!
          </h2>
          <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
            {message}
          </p>
          <Link to="/login" className="w-full mt-4">
            <Button variant="primary" size="lg" className="w-full">
              <span>Sign In to Your Account</span>
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <XCircle size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Verification Failed
          </h2>
          <p className="text-sm text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-200/80 max-w-sm">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Link to="/login" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                Back to Sign In
              </Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                Create New Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
