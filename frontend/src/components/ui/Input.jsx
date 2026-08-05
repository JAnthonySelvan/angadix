import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      name,
      id,
      placeholder,
      leftIcon,
      rightIcon,
      helperText,
      className = '',
      containerClassName = '',
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name;
    const isPasswordType = type === 'password';
    const computedType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-semantic-error ml-1">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={computedType}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full rounded-md border text-sm font-medium transition-all outline-none bg-white text-slate-900 placeholder:text-slate-400 py-2.5 px-3.5 ${
              leftIcon ? 'pl-10' : ''
            } ${isPasswordType || rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-semantic-error text-semantic-error focus:ring-2 focus:ring-semantic-error/30'
                : 'border-slate-200 hover:border-slate-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20'
            } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''} ${className}`}
            {...props}
          />

          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 pointer-events-none text-slate-400">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-semantic-error flex items-center gap-1 animate-fadeIn">
            <span>•</span>
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
