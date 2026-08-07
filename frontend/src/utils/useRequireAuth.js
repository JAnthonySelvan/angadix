import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import toast from 'react-hot-toast';

/**
 * Custom hook to enforce authentication check before executing mutating cart/wishlist actions.
 * If user is authenticated, returns true and runs action callback.
 * If user is unauthenticated, shows toast alert and redirects to /login preserving return location state.
 */
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const requireAuth = (actionCallback, message = 'Please sign in to perform this action.') => {
    if (isAuthenticated) {
      if (typeof actionCallback === 'function') {
        actionCallback();
      }
      return true;
    }

    toast.error(message);
    navigate('/login', { state: { from: location } });
    return false;
  };

  return { requireAuth, isAuthenticated };
};
