/**
 * Select Input Component
 *
 * Accessible single-select input with radio or dropdown variants
 * for yes/no, state, citizenship, etc.
 */

import React, { useState, useId } from 'react';
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
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hasError = Boolean(error);
  const showError = hasError && isTouched;

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

  const handleBlur = (): void => {
    setIsFocused(false);
    setIsTouched(true);
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  if (variant === 'radio') {
    return (
      <div className={`question-select-radio ${className}`}>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            {question.text}
            {question.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </legend>

          {question.description && (
            <p
              id={descId}
              className="text-sm text-gray-600 mb-3"
            >
              {question.description}
            </p>
          )}

          <div className="space-y-2">
            {options.map((option) => {
              const optionId = `${id}-${option.value}`;
              const isSelected = value === option.value;
              const isDisabled = disabled || option.disabled;

              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className={`
                    flex items-start p-3 border rounded-md cursor-pointer
                    transition-colors
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={id}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => !isDisabled && onChange(option.value)}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    disabled={isDisabled}
                    required={question.required}
                    aria-describedby={question.description ? descId : undefined}
                    className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />

                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <span className="text-lg" aria-hidden="true">
                          {option.icon}
                        </span>
                      )}
                      <span className="font-medium text-gray-900">
                        {option.label}
                      </span>
                    </div>

                    {option.description && (
                      <p className="mt-1 text-sm text-gray-500">
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
          <p className="mt-2 text-xs text-gray-500">
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
              <p key={idx} className="text-sm text-red-600">
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

      {searchable && (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md text-sm"
        />
      )}

      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
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

SelectInput.displayName = 'SelectInput';

