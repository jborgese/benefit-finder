/**
 * Help Tooltip Component
 *
 * Contextual help tooltips that appear on hover or focus
 */

import React, { useState, useRef, useEffect } from 'react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  trigger?: 'hover' | 'click' | 'focus';
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  trigger = 'hover',
  position = 'top',
  size = 'md',
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 max-w-xs',
    md: 'text-sm px-3 py-2 max-w-sm',
    lg: 'text-base px-4 py-3 max-w-md',
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  // Calculate tooltip position
  const updatePosition = (): void => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + 8;
        break;
    }

    // Keep tooltip within viewport
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewport.width - 8) {
      left = viewport.width - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewport.height - 8) {
      top = viewport.height - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  // Show/hide tooltip based on trigger
  const showTooltip = (): void => {
    setIsVisible(true);
  };

  const hideTooltip = (): void => {
    setIsVisible(false);
  };

  // Handle different triggers
  const handleMouseEnter = (): void => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = (): void => {
    if (trigger === 'hover') hideTooltip();
  };

  const handleClick = (): void => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleFocus = (): void => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = (): void => {
    if (trigger === 'focus') hideTooltip();
  };

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, position]);

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      if (isVisible) {
        updatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isVisible && trigger === 'click') {
        hideTooltip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, trigger]);

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={trigger === 'focus' ? 0 : undefined}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 bg-secondary-900 text-white rounded-lg shadow-lg
            ${sizeClasses[size]}
            ${positionClasses[position]}
            animate-scale-in
          `}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 bg-secondary-900 transform rotate-45
              ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1' : ''}
              ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1' : ''}
              ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 translate-x-1' : ''}
            `}
          />

          {/* Content */}
          <div>
            {title && (
              <div className="font-semibold mb-1 text-primary-200">
                {title}
              </div>
            )}
            <div className="leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
