/**
 * Rendering functions for EnhancedCountySelector UI elements
 */

import React from 'react';
import { resolveQuestionString } from '../../resolveQuestionText';
import type { QuestionDefinition } from '../../types';
import type { CountyOption } from './types';

// Helper function to render county list item
export const renderCountyItem = (
  county: CountyOption,
  value: string | null,
  handleCountySelect: (countyValue: string) => void,
  isPopular: boolean
): React.JSX.Element => {
  return (
    <button
      key={county.value}
      type="button"
      onClick={() => handleCountySelect(county.value)}
      className={`
        w-full px-3 py-2 text-left hover:bg-secondary-50 dark:hover:bg-secondary-600
        ${value === county.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-secondary-900 dark:text-secondary-100'}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{county.label}</span>
        {isPopular && (
          <span className="text-xs text-primary-500 dark:text-primary-400">Popular</span>
        )}
      </div>
    </button>
  );
};

// Helper function to render county list
export const renderCountyList = (
  processedCounties: CountyOption[],
  value: string | null,
  handleCountySelect: (countyValue: string) => void,
  searchQuery: string,
  showPopularFirst: boolean,
  popularCounties: CountyOption[],
  noResultsText: string
): React.JSX.Element => {
  if (processedCounties.length > 0) {
    return (
      <>
        {showPopularFirst && !searchQuery && popularCounties.length > 0 && (
          <div className="px-3 py-2 text-xs font-semibold text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 uppercase tracking-wide">
            Popular Counties
          </div>
        )}
        {processedCounties.map((county) => {
          const isPopular = popularCounties.some(p => p.value === county.value);
          return renderCountyItem(county, value, handleCountySelect, isPopular);
        })}
      </>
    );
  }

  return (
    <div className="px-3 py-4 text-center text-secondary-500 dark:text-secondary-400">
      <div className="text-4xl mb-2">🔍</div>
      <p className="text-sm">{noResultsText}</p>
      {searchQuery && (
        <p className="text-xs mt-1">Try a different search term</p>
      )}
    </div>
  );
};

// Helper function to render label section
export const renderLabelSection = (
  question: QuestionDefinition,
  id: string,
  descId: string
): React.JSX.Element => {
  return (
    <>
      <label
        htmlFor={id}
        className="question-label block"
      >
        {resolveQuestionString(question.text)}
        {question.required && (
          <span className="required-indicator" aria-label="required">
            *
          </span>
        )}
      </label>

      {question.description && resolveQuestionString(question.description) && (
        <p id={descId} className="question-description">
          {resolveQuestionString(question.description)}
        </p>
      )}
    </>
  );
};

// Helper function to render state context banner
export const renderStateContext = (
  stateName: string | null,
  showStateContext: boolean
): React.JSX.Element | null => {
  if (!showStateContext || !stateName) { return null; }

  return (
    <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <span className="font-medium">State:</span> {stateName}
      </p>
    </div>
  );
};

// Helper function to render desktop state context
export const renderDesktopStateContext = (
  stateName: string | null,
  showStateContext: boolean
): React.JSX.Element | null => {
  if (!showStateContext || !stateName) { return null; }

  return (
    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center">
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-medium">Selected State:</span> {stateName}
        </p>
      </div>
    </div>
  );
};

// Helper function to render error messages
export const renderErrors = (errorId: string, errors: string[]): React.JSX.Element => {
  return (
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
  );
};

// Helper function to render help text
export const renderHelpText = (
  question: QuestionDefinition,
  showError: boolean
): React.JSX.Element | null => {
  if (!question.helpText || showError) { return null; }

  return (
    <p className="mt-2 text-xs text-secondary-700 dark:text-secondary-100">
      {question.helpText}
    </p>
  );
};
