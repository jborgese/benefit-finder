/**
 * Select Input Component
 *
 * Accessible single-select input with radio or dropdown variants
 * for yes/no, state, citizenship, etc.
 */

import React, { useState, useId } from 'react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import type { SelectProps } from './types';

export const SelectInput: React.FC<SelectProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  options,
  placeholder = 'Select an option...',
  searchable = false,
  variant = 'dropdown',
  onEnterKey,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging for component mount
  React.useEffect(() => {
    if (variant === 'radio') {
      console.log('SelectInput mounted', { questionId: question.id, variant });
    }
  }, [question.id, variant]);

  // Reset touched state when question changes
  React.useEffect(() => {
    setIsTouched(false);
    setHasUserInteracted(false);
  }, [question.id]);

  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Debug logging
  if (variant === 'radio' && hasError) {
    console.log('SelectInput Debug:', {
      hasError,
      isTouched,
      showError,
      error,
      value
    });
  }

  // Convert error to array format
  const errors: string[] = (() => {
    if (Array.isArray(error)) return error;
    if (error) return [error];
    return [];
  })();

  const filteredOptions = searchable
    ? options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : options;

  // Keyboard navigation for radio variant
  const keyboardNav = useKeyboardNavigation({
    itemCount: variant === 'radio' ? filteredOptions.length : 0,
    enabled: variant === 'radio' && !disabled,
    wrap: true,
    onItemSelect: (index) => {
      // Validate index is within bounds to prevent object injection
      if (index >= 0 && index < filteredOptions.length) {
        // Use .at() for safe array access - returns undefined if index is out of bounds
        const option = filteredOptions.at(index);
        // Validate option exists and has required properties
        if (option && typeof option === 'object' && 'value' in option && 'disabled' in option && !option.disabled) {
          setHasUserInteracted(true);
          onChange(option.value);
        }
      }
    },
    onEnterKey,
  });

  const handleBlur = (): void => {
    console.log('SelectInput handleBlur called', { variant, questionId: question.id, hasUserInteracted });
    setIsFocused(false);
    // Only set touched if user has actually interacted
    if (hasUserInteracted) {
      setIsTouched(true);
    }
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    if (variant === 'radio') {
      keyboardNav.handleKeyDown(e);
    } else if (e.key === 'Enter' && onEnterKey) {
      // For dropdown, only handle Enter key for submission
      e.preventDefault();
      onEnterKey();
    }
  };

  if (variant === 'radio') {
    return (
      <div className={`question-select-radio ${className}`}>
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

          <div className="space-y-2">
            {filteredOptions.map((option, index) => {
              const optionId = `${id}-${option.value}`;
              const isSelected = value === option.value;
              const isDisabled = disabled || option.disabled;
              const isFocused = keyboardNav.focusedIndex === index;

              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className={`
                    flex items-start p-4 border rounded-lg cursor-pointer
                    transition-all duration-200 ease-smooth
                    ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800' : 'border-secondary-300 dark:border-secondary-600 hover:border-secondary-400 dark:hover:border-secondary-500 hover:shadow-sm'}
                    ${isFocused && !isSelected ? 'ring-2 ring-primary-300 dark:ring-primary-700 border-primary-400 dark:border-primary-600' : ''}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    ref={keyboardNav.getItemRef(index)}
                    id={optionId}
                    type="radio"
                    name={id}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => {
                      if (!isDisabled) {
                        setHasUserInteracted(true);
                        onChange(option.value);
                      }
                    }}
                    onBlur={handleBlur}
                    onFocus={() => {
                      handleFocus();
                      keyboardNav.setFocusedIndex(index);
                    }}
                    disabled={isDisabled}
                    required={question.required}
                    aria-describedby={question.description ? descId : undefined}
                    className="mt-0.5 h-5 w-5 text-primary-600 border-secondary-300 focus:ring-primary-500"
                  />

                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <span className="text-lg" aria-hidden="true">
                          {option.icon}
                        </span>
                      )}
                      <span className="font-medium text-secondary-900 dark:text-secondary-100">
                        {option.label}
                      </span>
                    </div>

                    {option.description && (
                      <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
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

        {showError && (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-2"
          >
            {errors.map((err, idx) => (
              <p key={idx} className="text-sm text-red-600 dark:text-red-400">
                {err}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`question-select-dropdown ${className}`}>
      <label
        htmlFor={id}
        className="question-label block"
      >
        {question.text}
        {question.required && (
          <span className="required-indicator" aria-label="required">
            *
          </span>
        )}
      </label>

      {question.description && (
        <p
          id={descId}
          className="question-description"
        >
          {question.description}
        </p>
      )}

      {searchable && (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="question-input w-full px-3 py-2 mb-2 border rounded-md
                     bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100
                     border-secondary-300 dark:border-secondary-600
                     focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400"
        />
      )}

      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        required={question.required}
        aria-invalid={showError}
        aria-describedby={`${question.description ? descId : ''} ${showError ? errorId : ''}`.trim()}
        aria-label={question.ariaLabel ?? question.text}
        size={filteredOptions.length > 10 ? 8 : 1}
        className={`
          question-input w-full px-4 py-3 border rounded-lg shadow-sm
          bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100
          border-secondary-300 dark:border-secondary-600
          focus:outline-none transition-all duration-200 ease-smooth
          ${showError ? 'border-error-400 ring-2 ring-error-400/20' : ''}
          ${isFocused ? 'ring-2 ring-primary-400/20 border-primary-400' : ''}
          ${!showError && !isFocused ? 'hover:border-secondary-400 dark:hover:border-secondary-500' : ''}
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {filteredOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.icon ? `${option.icon} ${option.label}` : option.label}
          </option>
        ))}
      </select>

      {question.helpText && !showError && (
        <p className="question-help-text">
          {question.helpText}
        </p>
      )}

      {showError && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="question-error-text"
        >
          {errors.map((err, idx) => (
            <p key={idx} className="question-error-text">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

SelectInput.displayName = 'SelectInput';

