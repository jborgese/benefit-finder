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
  const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm min-h-[44px]'; // Updated to meet WCAG 2.1 AA requirement
      case 'lg':
        return 'px-8 py-4 text-lg min-h-[52px]';
      default:
        return 'px-6 py-3 text-base min-h-[44px]';
    }
  };

  // Enhanced variant classes with better color usage
  const getVariantClasses = (variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost'): string => {
    const getPrimaryClasses = (): string => `
      bg-primary-600 dark:bg-primary-500 text-white
      hover:bg-primary-700 dark:hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/25
      focus:ring-primary-500 dark:focus:ring-primary-400
      active:bg-primary-800 dark:active:bg-primary-700
    `;

    switch (variant) {
      case 'primary':
        return getPrimaryClasses();
      case 'secondary':
        return `
          bg-secondary-700 dark:bg-secondary-600 text-white
          hover:bg-secondary-600 dark:hover:bg-secondary-500 hover:shadow-md hover:shadow-secondary-600/25
          focus:ring-secondary-500 dark:focus:ring-secondary-400
          active:bg-secondary-800 dark:active:bg-secondary-700
        `;
      case 'success':
        return `
          bg-success-600 dark:bg-success-500 text-white
          hover:bg-success-700 dark:hover:bg-success-600 hover:shadow-md hover:shadow-success-600/25
          focus:ring-success-500 dark:focus:ring-success-400
          active:bg-success-800 dark:active:bg-success-700
        `;
      case 'warning':
        return `
          bg-warning-600 dark:bg-warning-500 text-white
          hover:bg-warning-700 dark:hover:bg-warning-600 hover:shadow-md hover:shadow-warning-600/25
          focus:ring-warning-500 dark:focus:ring-warning-400
          active:bg-warning-800 dark:active:bg-warning-700
        `;
      case 'error':
        return `
          bg-error-600 dark:bg-error-500 text-white
          hover:bg-error-700 dark:hover:bg-error-600 hover:shadow-md hover:shadow-error-600/25
          focus:ring-error-500 dark:focus:ring-error-400
          active:bg-error-800 dark:active:bg-error-700
        `;
      case 'ghost':
        return `
          bg-transparent text-secondary-700 dark:text-secondary-200 border border-secondary-300 dark:border-secondary-600
          hover:bg-secondary-50 dark:hover:bg-secondary-700 hover:border-secondary-400 dark:hover:border-secondary-500
          focus:ring-secondary-500 dark:focus:ring-secondary-400
          active:bg-secondary-100 dark:active:bg-secondary-600
        `;
      default:
        return getPrimaryClasses();
    }
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
      className={`${baseClasses} ${getSizeClasses(size)} ${getVariantClasses(variant)} ${disabledClasses} ${className}`}
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
