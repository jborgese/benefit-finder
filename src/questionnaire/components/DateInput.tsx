/**
 * Date Input Component
 *
 * Accessible date picker with validation
 * for birth dates, employment dates, etc.
 */

import React, { useState, useId } from 'react';
import type { DateInputProps } from './types';
import { resolveQuestionString } from '../resolveQuestionText';

export const DateInput: React.FC<DateInputProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  min,
  max,
  format = 'medium',
  showPicker = true,
  onEnterKey,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const hasError = Boolean(error);
  const showError = hasError && isTouched;
  // Convert error to array format without nested ternaries
  let errors: string[];
  if (Array.isArray(error)) {
    errors = error;
  } else if (error) {
    errors = [error];
  } else {
    errors = [];
  }

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
    if (!isoDate) { return ''; }

    try {
      // Parse the ISO date string and create a date object in local timezone
      // This prevents timezone shift issues when displaying dates
      const [year, month, day] = isoDate.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed

      // Determine format options without nested ternaries
      let options: Intl.DateTimeFormatOptions;
      if (format === 'short') {
        options = { month: 'numeric', day: 'numeric', year: '2-digit' };
      } else if (format === 'long') {
        options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      } else {
        options = { year: 'numeric', month: 'long', day: 'numeric' };
      }

      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch {
      return isoDate;
    }
  };

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) { return null; }

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

  const fieldName = question.fieldName ?? '';
  const age = fieldName.toLowerCase().includes('birth') && value
    ? calculateAge(value as string)
    : null;

  return (
    <div className={`question-date-input ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {resolveQuestionString(question.text)}
        {question.required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {question.description && resolveQuestionString(question.description) && (
        <p
          id={descId}
          className="text-sm text-gray-600 mb-2"
        >
          {resolveQuestionString(question.description)}
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
          min={min}
          max={max}
          autoFocus={autoFocus}
          required={question.required}
          aria-invalid={showError}
          aria-describedby={`${question.description ? descId : ''} ${showError ? errorId : ''}`.trim()}
          aria-label={resolveQuestionString(question.ariaLabel) || resolveQuestionString(question.text)}
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

      {value && !showError && (
        <p className="mt-1 text-xs text-gray-600">
          {formatDateForDisplay(value)}
          {age !== null && ` (Age: ${age})`}
        </p>
      )}

      {question.helpText && !showError && (
        <p className="mt-1 text-xs text-gray-500">
          {resolveQuestionString(question.helpText)}
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

DateInput.displayName = 'DateInput';

