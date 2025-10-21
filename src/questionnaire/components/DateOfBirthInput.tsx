/**
 * Date of Birth Input Component
 *
 * Enhanced date picker specifically designed for birth dates
 * with user-friendly features and age calculation display
 */

import React, { useState, useId, useEffect } from 'react';
import type { DateInputProps } from './types';

interface DateOfBirthInputProps extends Omit<DateInputProps, 'format'> {
  /** Show calculated age */
  showAge?: boolean;
  /** Show age in a friendly format */
  showAgeInWords?: boolean;
  /** Custom age calculation function */
  calculateAge?: (birthDate: string) => number | null;
}

export const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  min,
  max,
  showPicker = true,
  onEnterKey,
  showAge = true,
  showAgeInWords = false,
  calculateAge: customCalculateAge,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Convert error to array format
  let errors: string[];
  if (Array.isArray(error)) {
    errors = error;
  } else if (error) {
    errors = [error];
  } else {
    errors = [];
  }

  // Default age calculation function
  const defaultCalculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;

    try {
      const today = new Date();
      // Parse the ISO date string and create a date object in local timezone
      // This prevents timezone shift issues when calculating age
      const [year, month, day] = birthDate.split('-').map(Number);
      const birth = new Date(year, month - 1, day); // month is 0-indexed

      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age;
    } catch {
      return null;
    }
  };

  const ageCalculator = customCalculateAge || defaultCalculateAge;

  // Calculate age when value changes
  useEffect(() => {
    if (value && showAge) {
      const age = ageCalculator(value);
      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [value, showAge, ageCalculator]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    setIsTouched(true);
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && onEnterKey) {
      e.preventDefault();
      onEnterKey();
    }
  };

  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';

    try {
      // Parse the ISO date string and create a date object in local timezone
      // This prevents timezone shift issues when displaying dates
      const [year, month, day] = isoDate.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return isoDate;
    }
  };

  const formatAgeInWords = (age: number): string => {
    if (age < 1) return 'Less than 1 year old';
    if (age === 1) return '1 year old';
    if (age < 2) return '1 year old';
    return `${age} years old`;
  };

  // Set reasonable min/max dates for birth dates
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0]; // Today
  const minDate = new Date(today.getFullYear() - 120, 0, 1).toISOString().split('T')[0]; // 120 years ago

  const effectiveMin = min || minDate;
  const effectiveMax = max || maxDate;

  return (
    <div className={`question-date-of-birth-input ${className}`}>
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

      <div className="relative">
        <input
          id={id}
          type="date"
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          min={effectiveMin}
          max={effectiveMax}
          autoFocus={autoFocus}
          required={question.required}
          aria-invalid={showError}
          aria-describedby={`${question.description ? descId : ''} ${showError ? errorId : ''}`.trim()}
          aria-label={question.ariaLabel ?? question.text}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${showError ? 'border-red-500' : 'border-gray-300'}
            ${isFocused ? 'ring-2 ring-blue-500' : ''}
          `}
        />

        {showPicker && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Age display */}
      {value && !showError && calculatedAge !== null && showAge && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-blue-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                {formatDateForDisplay(value)}
              </p>
              <p className="text-xs text-blue-700">
                {showAgeInWords ? formatAgeInWords(calculatedAge) : `Age: ${calculatedAge}`}
              </p>
            </div>
          </div>
        </div>
      )}

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

DateOfBirthInput.displayName = 'DateOfBirthInput';
