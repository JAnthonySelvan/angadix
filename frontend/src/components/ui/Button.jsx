import React from 'react';
import { motion } from 'framer-motion';
import { Spinner } from './Spinner';

export const Button = React.forwardRef(
  (
    {
      children,
      type = 'button',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

    const variantStyles = {
      primary:
        'bg-primary-800 text-white hover:bg-primary-900 focus:ring-primary-600 shadow-md hover:shadow-lg active:shadow-sm',
      secondary:
        'bg-primary-50 text-primary-900 hover:bg-primary-100 focus:ring-primary-300 border border-primary-100',
      outline:
        'border-2 border-primary-800 text-primary-800 hover:bg-primary-50 focus:ring-primary-600',
      ghost:
        'text-slate-700 hover:bg-slate-100 focus:ring-slate-400',
      danger:
        'bg-semantic-error text-white hover:bg-red-600 focus:ring-red-500 shadow-md',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs tracking-wide',
      md: 'px-4 py-2.5 text-sm tracking-wide',
      lg: 'px-6 py-3.5 text-base tracking-wide',
    };

    const isButtonDisabled = isDisabled || isLoading;

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={!isButtonDisabled ? { scale: 0.97 } : undefined}
        disabled={isButtonDisabled}
        onClick={onClick}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
