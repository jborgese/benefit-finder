/**
 * Enhanced Button Component
 *
 * Accessible button component with multiple variants, animations, and improved UX
 */

import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  type = 'button',
}: ButtonProps): React.ReactElement {
  // Base classes with enhanced animations and interactions
  const baseClasses = `
    relative inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-[0.98] disabled:active:scale-100
    min-h-touch rounded-lg
    ${loading ? 'cursor-wait' : ''}
  `.trim();

  // Size variants
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  // Enhanced variant classes with better color usage
  const variantClasses = {
    primary: `
      bg-primary-600 text-white
      hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/25
      focus:ring-primary-500
      active:bg-primary-800
    `,
    secondary: `
      bg-secondary-700 text-secondary-100
      hover:bg-secondary-600 hover:shadow-md hover:shadow-secondary-600/25
      focus:ring-secondary-500
      active:bg-secondary-800
    `,
    success: `
      bg-success-600 text-white
      hover:bg-success-700 hover:shadow-md hover:shadow-success-600/25
      focus:ring-success-500
      active:bg-success-800
    `,
    warning: `
      bg-warning-600 text-white
      hover:bg-warning-700 hover:shadow-md hover:shadow-warning-600/25
      focus:ring-warning-500
      active:bg-warning-800
    `,
    error: `
      bg-error-600 text-white
      hover:bg-error-700 hover:shadow-md hover:shadow-error-600/25
      focus:ring-error-500
      active:bg-error-800
    `,
    ghost: `
      bg-transparent text-secondary-700 border border-secondary-300
      hover:bg-secondary-50 hover:border-secondary-400
      focus:ring-secondary-500
      active:bg-secondary-100
    `,
  };

  const disabledClasses = disabled || loading
    ? 'opacity-60 cursor-not-allowed hover:shadow-none'
    : '';

  const isLoading = loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Button content */}
      <span className={isLoading ? 'opacity-70' : ''}>
        {children}
      </span>
    </button>
  );
}

export default Button;
