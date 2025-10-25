/**
 * Multi-Select Input Component
 *
 * Accessible multi-select input with checkbox or pills variants
 * for disabilities, programs, interests, etc.
 */

import React, { useState, useId } from 'react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import type { MultiSelectProps } from './types';

export const MultiSelectInput: React.FC<MultiSelectProps> = ({
  question,
  value = [],
  onChange,
  error,
  disabled = false,
  className = '',
  options,
  minSelections,
  maxSelections,
  variant = 'checkbox',
  onEnterKey,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isTouched, setIsTouched] = useState(false);

  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Convert error to array format (avoiding nested ternaries)
  const errors = (() => {
    if (Array.isArray(error)) return error;
    if (error) return [error];
    return [];
  })();

  // Keyboard navigation
  const keyboardNav = useKeyboardNavigation({
    itemCount: options.length,
    enabled: !disabled,
    wrap: true,
    onItemSelect: (index) => {
      const option = options[index];
      if (option && !option.disabled) {
        handleToggle(option.value);
      }
    },
    onEnterKey: onEnterKey,
  });

  const handleToggle = (optionValue: string | number): void => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    // Check constraints
    if (maxSelections && newValue.length > maxSelections) {
      return; // Don't allow more than max
    }

    onChange(newValue);
    setIsTouched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    keyboardNav.handleKeyDown(e);
  };

  const isOptionSelected = (optionValue: string | number): boolean => {
    return value.includes(optionValue);
  };

  const canSelectMore = !maxSelections || value.length < maxSelections;

  // Helper to generate selection constraint message
  const getSelectionMessage = (): string => {
    if (minSelections && maxSelections) {
      return `Select ${minSelections} to ${maxSelections} options`;
    }
    if (minSelections) {
      return `Select at least ${minSelections}`;
    }
    if (maxSelections) {
      return `Select up to ${maxSelections}`;
    }
    return '';
  };

  // Render selection constraints helper text
  const renderConstraintsText = (): React.ReactElement | null => {
    if (!(minSelections ?? maxSelections)) return null;
    return (
      <p className="text-xs text-gray-500 dark:text-secondary-400 mt-1 mb-3">
        {getSelectionMessage()}
      </p>
    );
  };

  // Render error messages
  const renderErrors = (): React.ReactElement | null => {
    if (!showError) return null;
    return (
      <div
        id={errorId}
        role="alert"
        aria-live="polite"
        className="mt-2"
      >
        {errors.map((err, idx) => (
          <p key={idx} className="text-sm text-red-600">
            {err}
          </p>
        ))}
      </div>
    );
  };

  if (variant === 'pills') {
    return (
      <div className={`question-multiselect-pills ${className}`} onKeyDown={handleKeyDown}>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200">
            {question.text}
            {question.required && (
              <span className="text-red-500 dark:text-red-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>

          {question.description && (
            <p
              id={descId}
              className="text-sm text-gray-600 dark:text-secondary-300 mt-1"
            >
              {question.description}
            </p>
          )}

          {renderConstraintsText()}
        </div>

        <div
          role="group"
          aria-labelledby={id}
          className="flex flex-wrap gap-2"
        >
          {options.map((option, index) => {
            const isSelected = isOptionSelected(option.value);
            const isDisabled = disabled || (option.disabled ?? false) || (!isSelected && !canSelectMore);
            const isFocused = keyboardNav.focusedIndex === index;

            return (
              <button
                key={option.value}
                ref={keyboardNav.getItemRef(index)}
                type="button"
                onClick={() => !isDisabled && handleToggle(option.value)}
                onFocus={() => keyboardNav.setFocusedIndex(index)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all border-2
                  ${isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-secondary-700 text-gray-700 dark:text-secondary-200 border-gray-300 dark:border-secondary-600 hover:border-blue-300 dark:hover:border-blue-400'
                  }
                  ${isFocused && !isSelected ? 'ring-2 ring-blue-300 dark:ring-blue-700 border-blue-400 dark:border-blue-600' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                {option.icon && (
                  <span aria-hidden="true">{option.icon}</span>
                )}
                <span>{option.label}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {question.helpText && !showError && (
          <p className="mt-2 text-xs text-gray-500 dark:text-secondary-400">
            {question.helpText}
          </p>
        )}

        {renderErrors()}
      </div>
    );
  }

  // Checkbox variant
  return (
    <div className={`question-multiselect-checkbox ${className}`}>
      <fieldset onKeyDown={handleKeyDown}>
        <legend className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-2">
          {question.text}
          {question.required && (
            <span className="text-red-500 dark:text-red-400 ml-1" aria-label="required">
              *
            </span>
          )}
        </legend>

        {question.description && (
          <p
            id={descId}
            className="text-sm text-gray-600 dark:text-secondary-300 mb-3"
          >
            {question.description}
          </p>
        )}

        {renderConstraintsText()}

        <div className="space-y-2">
          {options.map((option, index) => {
            const optionId = `${id}-${option.value}`;
            const isSelected = isOptionSelected(option.value);
            const isDisabled = disabled || (option.disabled ?? false) || (!isSelected && !canSelectMore);
            const isFocused = keyboardNav.focusedIndex === index;

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={`
                  flex items-start p-3 border rounded-md cursor-pointer
                  transition-colors
                  ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-secondary-600 hover:border-gray-400 dark:hover:border-secondary-500'}
                  ${isFocused && !isSelected ? 'ring-2 ring-blue-300 dark:ring-blue-700 border-blue-400 dark:border-blue-600' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  ref={keyboardNav.getItemRef(index)}
                  id={optionId}
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => !isDisabled && handleToggle(option.value)}
                  onFocus={() => keyboardNav.setFocusedIndex(index)}
                  disabled={isDisabled}
                  aria-describedby={option.description ? `${optionId}-desc` : undefined}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />

                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <span className="text-lg" aria-hidden="true">
                        {option.icon}
                      </span>
                    )}
                    <span className="font-medium text-gray-900 dark:text-secondary-100">
                      {option.label}
                    </span>
                  </div>

                  {option.description && (
                    <p id={`${optionId}-desc`} className="mt-1 text-sm text-gray-500 dark:text-secondary-400">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {question.helpText && !showError && (
        <p className="mt-2 text-xs text-gray-500 dark:text-secondary-400">
          {question.helpText}
        </p>
      )}

      {renderErrors()}
    </div>
  );
};

MultiSelectInput.displayName = 'MultiSelectInput';

