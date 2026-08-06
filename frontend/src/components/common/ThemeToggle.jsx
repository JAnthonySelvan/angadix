import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/theme/themeSlice';

export const ThemeToggle = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`p-2.5 rounded-full transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
      aria-label="Toggle theme mode"
      title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {mode === 'light' ? (
        <Moon size={18} className="transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Sun size={18} className="transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  );
};
