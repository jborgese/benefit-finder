/**
 * Currency Input Component
 *
 * Accessible currency input with formatting and validation
 * for income, benefit amounts, expenses, etc.
 */

import React, { useState, useId } from 'react';
import type { CurrencyInputProps } from './types';

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  currency = 'USD',
  min: _min = 0,
  max: _max,
  allowNegative = false,
  onEnterKey,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    value !== undefined ? formatCurrency(value, false) : ''
  );

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

  const currencySymbol = getCurrencySymbol(currency);

  function formatCurrency(amount: number, withSymbol: boolean = true): string {
    // Format with 2 decimal places
    const absAmount = Math.abs(amount);
    const [integerPart, decimalPart] = absAmount.toFixed(2).split('.');

    // Add commas to integer part - safe manual implementation
    // Process digits from right to left, adding comma every 3 digits
    const digits = integerPart.split('');
    const formatted: string[] = [];
    for (let i = digits.length - 1, count = 0; i >= 0; i--, count++) {
      if (count > 0 && count % 3 === 0) {
        formatted.unshift(',');
      }
      // Use .at() method for safe array access
      const digit = digits.at(i);
      if (digit) {
        formatted.unshift(digit);
      }
    }
    const formattedInteger = formatted.join('');

    const formattedAmount = `${formattedInteger}.${decimalPart}`;
    return withSymbol ? `${currencySymbol}${formattedAmount}` : formattedAmount;
  }

  function getCurrencySymbol(code: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
    };
    // Type-safe access using hasOwnProperty to prevent object injection
    if (Object.prototype.hasOwnProperty.call(symbols, code)) {
      // eslint-disable-next-line security/detect-object-injection -- Safe: property existence validated above
      return symbols[code];
    }
    return '$';
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let inputVal = e.target.value;

    // Remove all non-numeric characters except decimal point and minus
    inputVal = inputVal.replace(/[^0-9.-]/g, '');

    // Handle negative sign
    if (!allowNegative) {
      inputVal = inputVal.replace(/-/g, '');
    } else {
      // Keep only first minus sign at the beginning
      const hasNegative = inputVal.startsWith('-');
      inputVal = inputVal.replace(/-/g, '');
      if (hasNegative) {
        inputVal = `-${inputVal}`;
      }
    }

    // Allow only one decimal point
    const parts = inputVal.split('.');
    if (parts.length > 2) {
      inputVal = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      inputVal = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    setDisplayValue(inputVal);

    const numValue = parseFloat(inputVal);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else if (inputVal === '' || inputVal === '-') {
      // When input is cleared, pass undefined
      // Type assertion needed: component allows clearing optional number fields
      onChange(undefined as unknown as number);
    }
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    setIsTouched(true);

    // Format with commas on blur
    if (value !== undefined) {
      setDisplayValue(formatCurrency(value, false));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    setIsFocused(true);
    // Remove formatting on focus for easier editing
    if (value !== undefined) {
      setDisplayValue(value.toString());
    }
    // Select all text on focus
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && onEnterKey) {
      e.preventDefault();
      onEnterKey();
    }
  };

  return (
    <div className={`question-currency-input ${className}`}>
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-secondary-400 pointer-events-none">
          {currencySymbol}
        </div>

        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={question.placeholder ?? '0.00'}
          autoFocus={autoFocus}
          required={question.required}
          aria-invalid={showError}
          aria-describedby={`${question.description ? descId : ''} ${showError ? errorId : ''}`.trim()}
          aria-label={question.ariaLabel ?? question.text}
          className={`
            question-input w-full pl-8 pr-3 py-2 border rounded-md shadow-sm
            focus:outline-none
            ${showError ? 'border-red-400' : ''}
            ${isFocused ? 'ring-2 ring-blue-400/20' : ''}
          `}
        />
      </div>

      {question.helpText && !showError && (
        <p className="question-help-text">
          {question.helpText}
        </p>
      )}

      {!showError && value !== undefined && value >= 1000 && (
        <p className="question-help-text">
          {formatCurrency(value, false)} {currency}
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

CurrencyInput.displayName = 'CurrencyInput';

