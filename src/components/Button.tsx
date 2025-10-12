/**
 * Button Component
 *
 * Accessible button component with multiple variants
 */

import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  'aria-label'?: string;
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps): React.ReactElement {
  const baseClasses = 'px-6 py-3 rounded-lg min-h-[44px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    : 'bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-500';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default Button;

