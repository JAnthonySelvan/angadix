import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { googleLogin } from '../../features/auth/authThunks';
import { syncUserData } from '../../utils/syncUserData';
import { Spinner } from './Spinner';
import toast from 'react-hot-toast';

export const GoogleAuthButton = ({
  text = 'Continue with Google',
  redirectTo = '/',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const idToken = tokenResponse.credential || tokenResponse.access_token;
        const resultAction = await dispatch(googleLogin(idToken));

        if (googleLogin.fulfilled.match(resultAction)) {
          await syncUserData(dispatch);
          toast.success(resultAction.payload?.message || 'Google login successful!');
          navigate(redirectTo, { replace: true });
        } else {
          const errorMsg =
            resultAction.payload?.message ||
            resultAction.error?.message ||
            'Google authentication failed.';
          toast.error(errorMsg);
        }
      } catch (error) {
        toast.error(error?.message || 'An error occurred during Google sign in.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      setIsLoading(false);
      if (
        errorResponse?.error === 'popup_closed_by_user' ||
        errorResponse?.error === 'access_denied'
      ) {
        // Silently reset loading state when popup is closed by user
        return;
      }
      toast.error('Google authentication was not completed.');
    },
  });

  return (
    <button
      type="button"
      onClick={() => {
        setIsLoading(true);
        loginWithGoogle();
      }}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50/80 active:bg-slate-100 font-semibold text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60 disabled:cursor-not-allowed select-none"
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" color="slate" />
          <span>Connecting to Google...</span>
        </span>
      ) : (
        <>
          {/* Official Google Multicolor "G" Logo SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{text}</span>
        </>
      )}
    </button>
  );
};
