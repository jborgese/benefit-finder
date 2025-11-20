import React, { useEffect } from 'react';
import { useI18n } from '../i18n/hooks';
import { useAppSettingsStore } from '../stores/appSettingsStore';
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
    availableLanguages,
    getLanguageDisplayName,
    getLanguageFlag,
    changeLanguage,
    i18n,
  } = useI18n();

  // Use app settings store for current language to ensure consistency
  const { language: currentLanguage, setLanguage } = useAppSettingsStore((state) => ({
    language: state.language,
    setLanguage: state.setLanguage,
  }));

  const handleLanguageChange = async (newLanguage: string): Promise<void> => {
    try {
      // Update both systems to keep them in sync
      await changeLanguage(newLanguage);
      setLanguage(newLanguage as 'en' | 'es');
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Synchronize i18n system with app settings store on mount
  useEffect(() => {
    const normalizedCurrentLanguage = currentLanguage.split('-')[0];

    // If i18n language doesn't match app settings, update i18n to match
    if (i18n.language !== normalizedCurrentLanguage) {
      changeLanguage(normalizedCurrentLanguage).catch((error) => {
        console.error('Failed to sync i18n language:', error);
      });
    }
  }, [currentLanguage, changeLanguage, i18n.language]);

  // Size-based styling
  const sizeClasses = {
    sm: 'h-11 px-2 text-sm', // Updated to meet WCAG 2.1 AA requirement (44px)
    md: 'h-11 px-3 text-base', // Updated to meet WCAG 2.1 AA requirement (44px)
    lg: 'h-12 px-4 text-lg',
  } as const;

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  } as const;

  // Helper functions to get size classes
  const getSizeClass = (size: 'sm' | 'md' | 'lg'): string => {
    if (size === 'sm') {return sizeClasses.sm;}
    if (size === 'lg') {return sizeClasses.lg;}
    return sizeClasses.md;
  };

  const getIconSizeClass = (size: 'sm' | 'md' | 'lg'): string => {
    if (size === 'sm') {return iconSizeClasses.sm;}
    if (size === 'lg') {return iconSizeClasses.lg;}
    return iconSizeClasses.md;
  };

  // Variant-based styling
  const variantClasses = {
    default: 'bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-600 shadow-sm hover:bg-gray-50 dark:hover:bg-secondary-700 focus:bg-white dark:focus:bg-secondary-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-secondary-200',
    minimal: 'bg-transparent border-none hover:bg-white/10 dark:hover:bg-white/10 focus:bg-white/10 dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-white',
  } as const;

  return (
    <Select.Root
      value={currentLanguage}
      onValueChange={(value) => {
        handleLanguageChange(value).catch((error) => {
          console.error('Failed to change language:', error);
        });
      }}
    >
      <Select.Trigger
        className={`
          inline-flex items-center justify-between rounded-md
          ${getSizeClass(size)}
          ${variant === 'minimal' ? variantClasses.minimal : variantClasses.default}
          transition-colors duration-200
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label="Select language"
      >
        <Select.Value>
          <span className={`flex items-center gap-2 ${variant === 'minimal' ? 'text-gray-700 dark:text-white' : 'text-gray-900 dark:text-secondary-100'}`}>
            <span className="text-lg" role="img" aria-hidden="true">
              {getLanguageFlag(currentLanguage)}
            </span>
            <span className="font-medium">
              {getLanguageDisplayName(currentLanguage)}
            </span>
          </span>
        </Select.Value>
        <Select.Icon className={variant === 'minimal' ? 'text-gray-500 dark:text-white/70' : 'text-gray-500 dark:text-secondary-400'}>
          <ChevronDownIcon className={getIconSizeClass(size)} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="
            bg-white dark:bg-secondary-800 rounded-md shadow-lg border border-gray-200 dark:border-secondary-700
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
                  text-sm cursor-pointer text-gray-900 dark:text-secondary-100
                  hover:bg-gray-100 dark:hover:bg-secondary-700 focus:bg-gray-100 dark:focus:bg-secondary-700 focus:outline-none
                  data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-secondary-700 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-secondary-100
                  data-[state=checked]:bg-blue-50 dark:data-[state=checked]:bg-blue-900/30 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-blue-300
                  transition-colors duration-150
                "
              >
                <Select.ItemIndicator className="text-blue-600 dark:text-blue-400">
                  <CheckIcon className="w-4 h-4" />
                </Select.ItemIndicator>
                <span className="text-lg" role="img" aria-hidden="true">
                  {getLanguageFlag(language)}
                </span>
                <Select.ItemText className="font-medium text-gray-900 dark:text-secondary-100">
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
