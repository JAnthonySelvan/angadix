import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';

export const NotFound = () => {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 bg-grid-pattern">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* 404 Visual Pill */}
          <div className="px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-900/60 text-sm font-extrabold tracking-widest mb-6 shadow-sm">
            ERROR 404
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
            <Link to="/" className="flex-1">
              <Button variant="primary" size="lg" className="w-full rounded-2xl font-bold">
                <Home size={18} className="mr-2" />
                <span>Return Home</span>
              </Button>
            </Link>
            <button onClick={() => window.history.back()} className="flex-1">
              <Button variant="outline" size="lg" className="w-full rounded-2xl font-bold">
                <ArrowLeft size={18} className="mr-2" />
                <span>Go Back</span>
              </Button>
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
