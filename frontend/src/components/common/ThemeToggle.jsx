import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/theme/themeSlice';

export const ThemeToggle = ({ className = '', isOverHero = false }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`p-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        isOverHero
          ? 'bg-white/25 dark:bg-white/10 text-[#0a2540] dark:text-amber-400 hover:bg-white/45 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 backdrop-blur-md shadow-xs'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      } ${className}`}
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
