import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Spinner } from '../ui/Spinner';
import toast from 'react-hot-toast';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-sm font-semibold text-slate-500 tracking-wide">
          Verifying administrative authorization...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    toast.error('Access denied. Administrator privileges required.');
    return <Navigate to="/" replace />;
  }

  return children;
};
