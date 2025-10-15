/**
 * Text Input Component
 *
 * Accessible text input with validation for various text types
 * (name, email, phone, SSN, etc.)
 */

import React, { useState, useId } from 'react';
import type { TextInputProps } from './types';

export const TextInput: React.FC<TextInputProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  type = 'text',
  maxLength,
  pattern,
  autoComplete,
  onEnterKey,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Convert error to array format
  const errors: string[] = (() => {
    if (Array.isArray(error)) return error;
    if (error) return [error];
    return [];
  })();

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

  // Format SSN as user types (if field is SSN)
  const formatSSN = (val: string): string => {
    const numbers = val.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  const displayValue = question.fieldName.toLowerCase().includes('ssn')
    ? formatSSN(value)
    : value;

  return (
    <div className={`question-text-input ${className}`}>
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

      <div className="relative">
        <input
          id={id}
          type={type}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={maxLength ?? question.maxLength}
          pattern={pattern}
          placeholder={question.placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={question.required}
          aria-invalid={showError}
          aria-describedby={`${question.description ? descId : ''} ${showError ? errorId : ''}`.trim()}
          aria-label={question.ariaLabel ?? question.text}
          className={`
            question-input w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none
            ${showError ? 'border-red-400' : ''}
            ${isFocused ? 'ring-2 ring-blue-400/20' : ''}
          `}
        />

        {maxLength && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {value.length}/{maxLength}
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
            <p key={idx} className="question-error-text">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

TextInput.displayName = 'TextInput';

