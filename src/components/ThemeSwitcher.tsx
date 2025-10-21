/**
 * Theme Switcher Component
 *
 * Accessible theme switcher with light/dark/system options
 */

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './Button';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';

interface ThemeSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  size = 'sm',
  variant = 'default',
}) => {
  const { theme, actualTheme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-base',
    lg: 'h-12 px-4 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-600 shadow-sm hover:bg-gray-50 dark:hover:bg-secondary-700 focus:bg-white dark:focus:bg-secondary-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-secondary-200',
    minimal: 'bg-transparent border-none hover:bg-white/10 dark:hover:bg-white/10 focus:bg-white/10 dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white',
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[0];

  return (
    <Select.Root value={theme} onValueChange={(value) => setTheme(value as any)}>
      <Select.Trigger
        className={`
          inline-flex items-center justify-between rounded-md
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          transition-colors duration-200
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label="Select theme"
      >
        <Select.Value>
          <span className={`flex items-center gap-2 ${variant === 'minimal' ? 'text-gray-700 dark:text-white' : 'text-gray-900 dark:text-secondary-100'}`}>
            <span className="text-lg" role="img" aria-hidden="true">
              {currentTheme.icon}
            </span>
            <span className="font-medium">
              {currentTheme.label}
            </span>
          </span>
        </Select.Value>
        <Select.Icon className={variant === 'minimal' ? 'text-gray-500 dark:text-white/70' : 'text-gray-500 dark:text-secondary-400'}>
          <ChevronDownIcon className={iconSizeClasses[size]} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="
            bg-white rounded-md shadow-lg border border-gray-200
            min-w-[160px] max-h-[200px] overflow-hidden
            z-50
          "
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {themeOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="
                  flex items-center gap-3 px-3 py-2 rounded-sm
                  text-sm cursor-pointer text-gray-900
                  hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                  data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900
                  data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700
                  transition-colors duration-150
                "
              >
                <Select.ItemIndicator className="text-blue-600">
                  <CheckIcon className="w-4 h-4" />
                </Select.ItemIndicator>
                <span className="text-lg" role="img" aria-hidden="true">
                  {option.icon}
                </span>
                <Select.ItemText className="font-medium text-gray-900">
                  {option.label}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default ThemeSwitcher;
