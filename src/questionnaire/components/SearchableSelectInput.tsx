/**
 * SearchableSelectInput Component
 *
 * A searchable dropdown component for selecting from a large list of options.
 * Provides keyboard navigation, accessibility, and search functionality.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import type { QuestionDefinition, QuestionOption } from '../types';

export interface SearchableSelectInputProps {
  question: QuestionDefinition;
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string[];
  disabled?: boolean;
  onEnterKey?: () => void;
  options: QuestionOption[];
  searchPlaceholder?: string;
  noResultsText?: string;
  maxHeight?: number;
}

export const SearchableSelectInput: React.FC<SearchableSelectInputProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  onEnterKey,
  options,
  searchPlaceholder = 'Search...',
  noResultsText = 'No results found',
  maxHeight = 200
}): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option
  const selectedOption = options.find(option => option.value === value);

  // Handle option selection
  const handleSelect = useCallback((option: QuestionOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) {return;}

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
           
          const selectedOption = filteredOptions[highlightedIndex];
          handleSelect(selectedOption);
        } else if (!isOpen) {
          setIsOpen(true);
          inputRef.current?.focus();
        } else {
          onEnterKey?.();
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  }, [disabled, isOpen, highlightedIndex, filteredOptions, handleSelect, onEnterKey]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) {
      setIsOpen(true);
    }
  }, [isOpen]);

  // Handle dropdown toggle
  const handleToggle = useCallback(() => {
    if (disabled) {return;}
    setIsOpen(prev => !prev);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  }, [disabled, isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current && highlightedIndex < listRef.current.children.length) {
       
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      highlightedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const hasError = error && error.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={question.fieldName}
        value={value ?? ''}
      />

      {/* Main input field */}
      <div
        className={`
          relative flex items-center w-full px-3 py-2 border rounded-md
          bg-white text-gray-900 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
          ${hasError
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
          }
          ${disabled
            ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400'
          }
        `}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={question.ariaLabel ?? question.text}
        aria-describedby={hasError ? `${question.id}-error` : undefined}
      >
        <div className="flex-1 min-w-0">
          {selectedOption ? (
            <span className="block truncate text-gray-900">
              {selectedOption.label}
            </span>
          ) : (
            <span className="block truncate text-gray-500">
              {question.placeholder ?? 'Select an option...'}
            </span>
          )}
        </div>

        <ChevronDownIcon
          className={`
            h-5 w-5 text-gray-400 transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options list */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {filteredOptions.length > 0 ? (
              <ul
                ref={listRef}
                role="listbox"
                className="py-1"
              >
                {filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    className={`
                      px-3 py-2 cursor-pointer text-sm transition-colors duration-150
                      ${index === highlightedIndex
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-900 hover:bg-gray-100'
                      }
                      ${option.value === value ? 'font-medium' : ''}
                    `}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {noResultsText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <div id={`${question.id}-error`} className="mt-1 text-sm text-red-600">
          {error[0]}
        </div>
      )}

      {/* Help text */}
      {question.helpText && !hasError && (
        <div className="mt-1 text-sm text-gray-500">
          {question.helpText}
        </div>
      )}
    </div>
  );
};
