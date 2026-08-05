import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 bg-grid-pattern">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* 404 Visual Pill */}
        <div className="px-4 py-1.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200 text-sm font-extrabold tracking-widest mb-6 shadow-sm">
          ERROR 404
        </div>

        <h1 className="text-6xl sm:text-7xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-4 leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
          <Link to="/" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              <Home size={18} className="mr-2" />
              <span>Return Home</span>
            </Button>
          </Link>
          <button onClick={() => window.history.back()} className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeft size={18} className="mr-2" />
              <span>Go Back</span>
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
};
