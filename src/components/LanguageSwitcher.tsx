import React from 'react';
import { useI18n } from '../i18n/hooks';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';

interface LanguageSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

/**
 * Accessible language switcher component
 * Uses Radix UI Select for consistent behavior and accessibility
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const {
    currentLanguage,
    availableLanguages,
    getLanguageDisplayName,
    getLanguageFlag,
    changeLanguage,
  } = useI18n();

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      await changeLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Size-based styling
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

  // Variant-based styling
  const variantClasses = {
    default: 'bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    minimal: 'bg-transparent border-none hover:bg-white/10 focus:bg-white/10 focus:ring-2 focus:ring-blue-500 text-white',
  };

  return (
    <Select.Root
      value={currentLanguage}
      onValueChange={handleLanguageChange}
    >
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
        aria-label="Select language"
      >
        <Select.Value>
          <span className={`flex items-center gap-2 ${variant === 'minimal' ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-lg" role="img" aria-hidden="true">
              {getLanguageFlag(currentLanguage)}
            </span>
            <span className="font-medium">
              {getLanguageDisplayName(currentLanguage)}
            </span>
          </span>
        </Select.Value>
        <Select.Icon className={variant === 'minimal' ? 'text-white/70' : 'text-gray-500'}>
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
            {availableLanguages.map((language) => (
              <Select.Item
                key={language}
                value={language}
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
                  {getLanguageFlag(language)}
                </span>
                <Select.ItemText className="font-medium text-gray-900">
                  {getLanguageDisplayName(language)}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default LanguageSwitcher;
