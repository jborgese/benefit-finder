/**
 * Desktop-optimized County Selector Component
 */

import React from 'react';
import type { QuestionDefinition } from '../../types';
import type { CountyOption } from './types';
import {
  renderLabelSection,
  renderDesktopStateContext,
  renderCountyList,
  renderHelpText,
  renderErrors
} from './renderHelpers';

interface DesktopCountySelectorProps {
  question: QuestionDefinition;
  id: string;
  descId: string;
  errorId: string;
  stateName: string | null;
  showStateContext: boolean;
  handleToggle: () => void;
  handleBlur: (dropdownRef: React.RefObject<HTMLDivElement>) => void;
  handleFocus: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>, onEnterKey?: () => void) => void;
  onEnterKey: (() => void) | undefined;
  disabled: boolean;
  autoFocus: boolean;
  isOpen: boolean;
  isFocused: boolean;
  selectedCounty: CountyOption | undefined;
  searchPlaceholder: string;
  enableSearch: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processedCounties: CountyOption[];
  value: string | null;
  handleCountySelect: (countyValue: string, onChange: (value: string | null) => void) => void;
  onChange: (value: string | null) => void;
  showPopularFirst: boolean;
  popularCounties: CountyOption[];
  noResultsText: string;
  maxHeight: string;
  showError: boolean;
  errors: string[];
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export const DesktopCountySelector: React.FC<DesktopCountySelectorProps> = ({
  question,
  id,
  descId,
  errorId,
  stateName,
  showStateContext,
  handleToggle,
  handleBlur,
  handleFocus,
  handleKeyDown,
  onEnterKey,
  disabled,
  autoFocus,
  isOpen,
  isFocused,
  selectedCounty,
  searchPlaceholder,
  enableSearch,
  searchInputRef,
  searchQuery,
  handleSearchChange,
  processedCounties,
  value,
  handleCountySelect,
  onChange,
  showPopularFirst,
  popularCounties,
  noResultsText,
  maxHeight,
  showError,
  errors,
  dropdownRef
}) => {
  return (
    <div className="enhanced-county-selector-desktop relative">
      {renderLabelSection(question, id, descId)}
      {renderDesktopStateContext(stateName, showStateContext)}

      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          onBlur={() => handleBlur(dropdownRef)}
          onFocus={handleFocus}
          onKeyDown={(e) => handleKeyDown(e, onEnterKey)}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={question.description ? descId : undefined}
          className={`
            w-full px-4 py-3 text-left border rounded-lg shadow-sm
            bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100
            border-secondary-300 dark:border-secondary-600
            focus:outline-none transition-all duration-200 ease-smooth
            ${showError ? 'border-error-400 ring-2 ring-error-400/20' : ''}
            ${isFocused ? 'ring-2 ring-primary-400/20 border-primary-400' : ''}
            ${!showError && !isFocused ? 'hover:border-secondary-400 dark:hover:border-secondary-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={selectedCounty ? 'text-secondary-900 dark:text-secondary-100' : 'text-secondary-500'}>
              {selectedCounty ? selectedCounty.label : searchPlaceholder}
            </span>
            <svg
              className={`w-5 h-5 text-secondary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-[99999] w-full mt-1 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-lg"
            style={{ maxHeight }}
            onClick={(e) => e.stopPropagation()}
          >
            {enableSearch && (
              <div className="p-3 border-b border-secondary-200 dark:border-secondary-600">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border-secondary-300 dark:border-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {renderCountyList(
                processedCounties,
                value,
                (countyValue: string) => handleCountySelect(countyValue, onChange),
                searchQuery,
                showPopularFirst,
                popularCounties,
                noResultsText
              )}
            </div>
          </div>
        )}
      </div>

      {renderHelpText(question, showError)}
      {errors.length > 0 && renderErrors(errorId, errors)}
    </div>
  );
};

DesktopCountySelector.displayName = 'DesktopCountySelector';
