/**
 * Text Size Controls Component
 *
 * Accessible text size controls for accessibility
 */

import React from 'react';
import { useTextSize } from '../contexts/TextSizeContext';
import { Button } from './Button';

interface TextSizeControlsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  showLabels?: boolean;
}

export const TextSizeControls: React.FC<TextSizeControlsProps> = ({
  className = '',
  size = 'sm',
  variant = 'default',
  showLabels = false,
}) => {
  const { textSize, increaseTextSize, decreaseTextSize, resetTextSize } = useTextSize();

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-base',
    lg: 'h-12 px-4 text-lg',
  } as const;

  // Helper function to get size class without nested ternary
  const getSizeClass = (size: 'sm' | 'md' | 'lg', sizeClasses: typeof sizeClasses) => {
    if (size === 'sm') return sizeClasses.sm;
    if (size === 'lg') return sizeClasses.lg;
    return sizeClasses.md;
  };

  const variantClasses = {
    default: 'bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-600 shadow-sm hover:bg-gray-50 dark:hover:bg-secondary-700 focus:bg-white dark:focus:bg-secondary-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-secondary-200',
    minimal: 'bg-transparent border-none hover:bg-white/10 dark:hover:bg-white/10 focus:bg-white/10 dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white',
  } as const;

  const isMaxSize = textSize === 'extra-large';
  const isMinSize = textSize === 'small';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showLabels && (
        <span className={`text-sm font-medium mr-2 ${variant === 'minimal' ? 'text-gray-700 dark:text-white' : 'text-gray-700 dark:text-secondary-200'}`}>
          Text Size:
        </span>
      )}

      <Button
        variant="ghost"
        size={size}
        onClick={decreaseTextSize}
        disabled={isMinSize}
        aria-label="Decrease text size"
        className={`
          ${getSizeClass(size, sizeClasses)}
          ${variant === 'minimal' ? variantClasses.minimal : variantClasses.default}
          transition-colors duration-200
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className="text-lg" aria-hidden="true">A</span>
        <span className="text-xs" aria-hidden="true">-</span>
      </Button>

      <div className={`px-2 py-1 rounded text-xs font-medium ${variant === 'minimal' ? 'text-gray-700 dark:text-white' : 'text-gray-700 dark:text-secondary-200'}`}>
        {textSize}
      </div>

      <Button
        variant="ghost"
        size={size}
        onClick={increaseTextSize}
        disabled={isMaxSize}
        aria-label="Increase text size"
        className={`
          ${getSizeClass(size, sizeClasses)}
          ${variant === 'minimal' ? variantClasses.minimal : variantClasses.default}
          transition-colors duration-200
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className="text-lg" aria-hidden="true">A</span>
        <span className="text-xs" aria-hidden="true">+</span>
      </Button>

      <Button
        variant="ghost"
        size={size}
        onClick={resetTextSize}
        aria-label="Reset text size to default"
        className={`
          ${getSizeClass(size, sizeClasses)}
          ${variant === 'minimal' ? variantClasses.minimal : variantClasses.default}
          transition-colors duration-200
          focus:outline-none
          ml-1
        `}
      >
        <span className="text-sm" aria-hidden="true">↺</span>
      </Button>
    </div>
  );
};

export default TextSizeControls;
