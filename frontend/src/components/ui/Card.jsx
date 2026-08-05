import React from 'react';

export const Card = ({
  children,
  variant = 'glass',
  className = '',
  ...props
}) => {
  const variantStyles = {
    glass: 'glass-card rounded-2xl p-6 sm:p-8',
    elevated: 'bg-white shadow-xl shadow-primary-900/5 border border-slate-100 rounded-2xl p-6 sm:p-8',
    bordered: 'bg-white border border-slate-200 rounded-2xl p-6 sm:p-8',
    flat: 'bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
