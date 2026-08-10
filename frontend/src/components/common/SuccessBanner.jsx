import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export const SuccessBanner = ({
  title,
  message,
  actionText,
  onAction,
  onDismiss,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className={`p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60 shadow-md flex flex-col items-center text-center gap-3 text-emerald-900 dark:text-emerald-100 relative ${className}`}
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      )}

      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
        <CheckCircle2 size={24} />
      </div>

      {title && (
        <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
          {title}
        </h3>
      )}

      {message && (
        <p className="text-xs text-emerald-800 dark:text-emerald-200/90 max-w-md leading-relaxed font-medium">
          {message}
        </p>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};
