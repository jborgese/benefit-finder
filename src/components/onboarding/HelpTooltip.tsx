/**
 * Help Tooltip Component
 *
 * Contextual help tooltips that appear on hover or focus.
 * Uses Radix UI Tooltip for consistent positioning and accessibility.
 */

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

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
  trigger: _trigger = 'hover',
  position = 'top',
  size = 'md',
  children,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 max-w-xs',
    md: 'text-sm px-3 py-2 max-w-sm',
    lg: 'text-base px-4 py-3 max-w-md',
  };

  // Map position prop to Radix UI side
  const sideMap = {
    top: 'top' as const,
    bottom: 'bottom' as const,
    left: 'left' as const,
    right: 'right' as const,
  };
  const side = sideMap[position];

  // Map position to align for better positioning
  const align = position === 'top' || position === 'bottom' ? 'center' : 'center';

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className={`inline-block ${className}`}>
            {children}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={`
              ${sizeClasses[size]}
              bg-gray-900 dark:bg-gray-800
              text-white dark:text-gray-100
              rounded-md
              shadow-xl
              border border-gray-700 dark:border-gray-600
              z-50
              animate-fade-in
              font-medium
              backdrop-blur-sm
              whitespace-normal
              break-words
            `}
            side={side}
            align={align}
            sideOffset={6}
            alignOffset={0}
            avoidCollisions
            collisionBoundary={undefined}
            collisionPadding={16}
            hideWhenDetached={false}
          >
            {/* Content */}
            <div>
              {title && (
                <div className="font-semibold mb-1 text-blue-200 dark:text-blue-300">
                  {title}
                </div>
              )}
              <div className="leading-relaxed">
                {content}
              </div>
            </div>
            <Tooltip.Arrow
              className="fill-gray-900 dark:fill-gray-800"
              width={8}
              height={4}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default HelpTooltip;
