import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Home, RefreshCw, ServerCrash } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';

export const ServerError = ({ onRetry, title, message }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 bg-grid-pattern">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* 500 Visual Pill */}
          <div className="px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-sm font-extrabold tracking-widest mb-6 shadow-sm flex items-center gap-2">
            <ServerCrash size={16} />
            <span>ERROR 500</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title || t('errors.serverErrorTitle', 'Server Error')}
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
            {message ||
              t(
                'errors.serverErrorSub',
                'We encountered an unexpected server error. Please try reloading or check back shortly.'
              )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={handleRetry}
              className="flex-1 rounded-2xl font-bold"
            >
              <RefreshCw size={18} className="mr-2" />
              <span>{t('common.tryAgain', 'Try Again')}</span>
            </Button>

            <Link to="/" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-2xl font-bold"
              >
                <Home size={18} className="mr-2" />
                <span>{t('common.returnHome', 'Return Home')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
