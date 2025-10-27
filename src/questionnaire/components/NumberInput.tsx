/**
 * Number Input Component
 *
 * Accessible number input with validation and optional steppers
 * for age, household size, counts, etc.
 */

import React, { useState, useId, useEffect } from 'react';
import type { NumberInputProps } from './types';

export const NumberInput: React.FC<NumberInputProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  min,
  max,
  step,
  decimals = 0,
  showSteppers = true,
  onEnterKey,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() ?? '');
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [isDecrementing, setIsDecrementing] = useState(false);

  // Sync inputValue with value prop to prevent glitches
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toFixed(decimals));
    } else {
      setInputValue('');
    }
  }, [value, decimals]);

  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Convert error to array format
  const errors: string[] = (() => {
    if (Array.isArray(error)) return error;
    if (error) return [error];
    return [];
  })();

  const minValue = min ?? question.min;
  const maxValue = max ?? question.max;
  // Default step to 1 if neither prop nor question defines it
  const stepValue = step ?? question.step ?? 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    if (rawValue === '' || rawValue === '-') {
      // Type assertion needed: component allows clearing optional number fields
      onChange(undefined as unknown as number);
      return;
    }

    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      onChange(decimals === 0 ? Math.round(numValue) : numValue);
    }
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    setIsTouched(true);

    // Format value on blur
    if (value !== undefined) {
      setInputValue(value.toFixed(decimals));
    }
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && onEnterKey) {
      e.preventDefault();
      onEnterKey();
    }

    // Handle arrow keys for increment/decrement
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (canIncrement) {
        handleIncrement();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (canDecrement) {
        handleDecrement();
      }
    }
  };

  const handleIncrement = (): void => {
    const currentValue = value ?? minValue ?? 0;
    const newValue = currentValue + stepValue;

    if (maxValue === undefined || newValue <= maxValue) {
      setIsIncrementing(true);
      setIsTouched(true); // Mark as touched when using stepper buttons
      onChange(decimals === 0 ? Math.round(newValue) : newValue);
      // Reset the incrementing state after a brief delay
      setTimeout(() => setIsIncrementing(false), 200);
    }
  };

  const handleDecrement = (): void => {
    const currentValue = value ?? minValue ?? 0;
    const newValue = currentValue - stepValue;

    if (minValue === undefined || newValue >= minValue) {
      setIsDecrementing(true);
      setIsTouched(true); // Mark as touched when using stepper buttons
      onChange(decimals === 0 ? Math.round(newValue) : newValue);
      // Reset the decrementing state after a brief delay
      setTimeout(() => setIsDecrementing(false), 200);
    }
  };

  const canIncrement = maxValue === undefined || (value ?? 0) < maxValue;
  const canDecrement = minValue === undefined || (value ?? 0) > minValue;

  return (
    <div className={`question-number-input ${className}`}>
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

      <div className="relative flex items-center">
        <input
          id={id}
          type="number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          min={minValue}
          max={maxValue}
          step={stepValue}
          placeholder={question.placeholder}
          autoFocus={autoFocus}
          required={question.required}
          aria-invalid={showError}
          aria-describedby={`${question.description ? descId : ''} ${showError ? errorId : ''}`.trim()}
          aria-label={question.ariaLabel ?? question.text}
          className={`
            question-input flex-1 px-3 py-2 border rounded-md shadow-sm
            bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100
            border-secondary-300 dark:border-secondary-600
            focus:outline-none transition-all duration-200 ease-smooth
            ${showError ? 'border-red-400 dark:border-red-400' : ''}
            ${isFocused ? 'ring-2 ring-blue-400/20 border-blue-400 dark:border-blue-400' : ''}
            ${!showError && !isFocused ? 'hover:border-secondary-400 dark:hover:border-secondary-500' : ''}
            ${showSteppers ? 'pr-20' : ''}
            ${(isIncrementing || isDecrementing) ? 'ring-2 ring-blue-400/30 border-blue-400 dark:border-blue-400' : ''}
            no-spinner
          `}
        />

        {showSteppers && (
          <div className="absolute right-2 flex gap-1">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || !canDecrement}
              aria-label="Decrease value"
              className={`
                w-11 h-11 flex items-center justify-center
                ${isDecrementing
                  ? 'bg-blue-200 dark:bg-blue-600 border-blue-400 dark:border-blue-400'
                  : 'bg-gray-100 dark:bg-secondary-700 border-gray-300 dark:border-secondary-600'
                }
                hover:bg-gray-200 dark:hover:bg-secondary-600
                active:bg-gray-300 dark:active:bg-secondary-500
                disabled:bg-gray-50 dark:disabled:bg-secondary-800
                rounded
                text-gray-700 dark:text-secondary-200
                disabled:cursor-not-allowed disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all duration-150 ease-in-out
                active:scale-95
                ${isDecrementing ? 'ring-2 ring-blue-400/50' : ''}
              `}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || !canIncrement}
              aria-label="Increase value"
              className={`
                w-11 h-11 flex items-center justify-center
                ${isIncrementing
                  ? 'bg-blue-200 dark:bg-blue-600 border-blue-400 dark:border-blue-400'
                  : 'bg-gray-100 dark:bg-secondary-700 border-gray-300 dark:border-secondary-600'
                }
                hover:bg-gray-200 dark:hover:bg-secondary-600
                active:bg-gray-300 dark:active:bg-secondary-500
                disabled:bg-gray-50 dark:disabled:bg-secondary-800
                rounded
                text-gray-700 dark:text-secondary-200
                disabled:cursor-not-allowed disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all duration-150 ease-in-out
                active:scale-95
                ${isIncrementing ? 'ring-2 ring-blue-400/50' : ''}
              `}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

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
            <p key={idx}>
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

NumberInput.displayName = 'NumberInput';

