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
  };

  const variantClasses = {
    default: 'bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    minimal: 'bg-transparent border-none hover:bg-white/10 focus:bg-white/10 focus:ring-2 focus:ring-blue-500 text-white',
  };

  const isMaxSize = textSize === 'extra-large';
  const isMinSize = textSize === 'small';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showLabels && (
        <span className={`text-sm font-medium mr-2 ${variant === 'minimal' ? 'text-white' : 'text-gray-700'}`}>
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
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          transition-colors duration-200
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className="text-lg" aria-hidden="true">A</span>
        <span className="text-xs" aria-hidden="true">-</span>
      </Button>

      <div className={`px-2 py-1 rounded text-xs font-medium ${variant === 'minimal' ? 'text-white' : 'text-gray-700'}`}>
        {textSize}
      </div>

      <Button
        variant="ghost"
        size={size}
        onClick={increaseTextSize}
        disabled={isMaxSize}
        aria-label="Increase text size"
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
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
          ${sizeClasses[size]}
          ${variantClasses[variant]}
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
