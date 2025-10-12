/**
 * Number Input Component
 *
 * Accessible number input with validation and optional steppers
 * for age, household size, counts, etc.
 */

import React, { useState, useId } from 'react';
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
  step = 1,
  decimals = 0,
  showSteppers = true,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() || '');

  const hasError = Boolean(error);
  const showError = hasError && isTouched;
  const errors = Array.isArray(error) ? error : error ? [error] : [];

  const minValue = min ?? question.min ?? undefined;
  const maxValue = max ?? question.max ?? undefined;
  const stepValue = step ?? question.step ?? 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    if (rawValue === '' || rawValue === '-') {
      onChange(undefined as any);
      return;
    }

    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      onChange(decimals === 0 ? Math.round(numValue) : numValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);

    // Format value on blur
    if (value !== undefined) {
      setInputValue(value.toFixed(decimals));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleIncrement = () => {
    const currentValue = value ?? minValue ?? 0;
    const newValue = currentValue + stepValue;

    if (maxValue === undefined || newValue <= maxValue) {
      onChange(decimals === 0 ? Math.round(newValue) : newValue);
      setInputValue(newValue.toFixed(decimals));
    }
  };

  const handleDecrement = () => {
    const currentValue = value ?? minValue ?? 0;
    const newValue = currentValue - stepValue;

    if (minValue === undefined || newValue >= minValue) {
      onChange(decimals === 0 ? Math.round(newValue) : newValue);
      setInputValue(newValue.toFixed(decimals));
    }
  };

  const canIncrement = maxValue === undefined || (value ?? 0) < maxValue;
  const canDecrement = minValue === undefined || (value ?? 0) > minValue;

  return (
    <div className={`question-number-input ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {question.text}
        {question.required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {question.description && (
        <p
          id={descId}
          className="text-sm text-gray-600 mb-2"
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
          disabled={disabled}
          min={minValue}
          max={maxValue}
          step={stepValue}
          placeholder={question.placeholder}
          autoFocus={autoFocus}
          required={question.required}
          aria-invalid={showError}
          aria-describedby={`${question.description ? descId : ''} ${showError ? errorId : ''}`.trim()}
          aria-label={question.ariaLabel || question.text}
          className={`
            flex-1 px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${showError ? 'border-red-500' : 'border-gray-300'}
            ${isFocused ? 'ring-2 ring-blue-500' : ''}
            ${showSteppers ? 'pr-20' : ''}
          `}
        />

        {showSteppers && (
          <div className="absolute right-2 flex gap-1">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || !canDecrement}
              aria-label="Decrease value"
              className="
                w-8 h-8 flex items-center justify-center
                bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50
                border border-gray-300 rounded
                disabled:cursor-not-allowed disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
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
              className="
                w-8 h-8 flex items-center justify-center
                bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50
                border border-gray-300 rounded
                disabled:cursor-not-allowed disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
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
        <p className="mt-1 text-xs text-gray-500">
          {question.helpText}
        </p>
      )}

      {showError && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="mt-1"
        >
          {errors.map((err, idx) => (
            <p key={idx} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

NumberInput.displayName = 'NumberInput';

