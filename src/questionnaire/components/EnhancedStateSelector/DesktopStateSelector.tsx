/**
 * Desktop State Selector Component
 */

import React from 'react';
import type { DesktopStateSelectorProps } from './selectorProps';
import { LocationDetectionUI } from './LocationDetectionUI';
import { renderStateListContent } from './utils';

export const DesktopStateSelector: React.FC<DesktopStateSelectorProps> = (props) => {
  const {
    containerRef, className, question, questionText, questionDescription, id, descId, placeholder, selectedState,
    isOpen, isFocused, showError, disabled, autoFocus, onToggle, onBlur, onFocus,
    onKeyDown, enableSearch, searchInputRef, searchQuery, onSearchChange, onClearSearch,
    groupedStates, processedStates, value, onStateSelect, showPopulation, maxHeight,
    helpText, errorId, errors, showLocationButton, isLocationLoading,
    hasRequestedLocation, onLocationRequest, showLocationError, locationError,
    locationDetected, coordinates
  } = props;

  return (
    <div ref={containerRef} className={`enhanced-state-selector-desktop relative ${className}`}>
      <label htmlFor={id} className="question-label block">
        {questionText}
        {question.required && (
          <span className="required-indicator" aria-label="required">*</span>
        )}
      </label>

      {questionDescription && (
        <p id={descId} className="question-description">
          {questionDescription}
        </p>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
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
            <span className={selectedState ? 'text-secondary-900 dark:text-secondary-100' : 'text-secondary-500'}>
              {selectedState ? selectedState.label : placeholder}
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
            className="absolute z-[99999] w-full mt-1 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-lg"
            style={{ maxHeight }}
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
                    onChange={onSearchChange}
                    placeholder="Search states..."
                    className={`w-full pl-10 py-2 border rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border-secondary-300 dark:border-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 ${searchQuery ? 'pr-10' : 'pr-3'}`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={onClearSearch}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {renderStateListContent(processedStates, groupedStates, value, onStateSelect, showPopulation)}
            </div>
          </div>
        )}
      </div>

      {helpText && !showError && (
        <p className="question-help-text">{helpText}</p>
      )}

      {showError && (
        <div id={errorId} role="alert" aria-live="polite" className="mt-2">
          {errors.map((err, idx) => (
            <p key={idx} className="text-sm text-red-600 dark:text-red-400">{err}</p>
          ))}
        </div>
      )}

      <LocationDetectionUI
        showLocationButton={showLocationButton}
        isLocationLoading={isLocationLoading}
        hasRequestedLocation={hasRequestedLocation}
        disabled={disabled}
        onLocationRequest={onLocationRequest}
        showLocationError={showLocationError}
        locationError={locationError}
        locationDetected={locationDetected}
        coordinates={coordinates}
      />
    </div>
  );
};
