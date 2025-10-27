/**
 * Enhanced State Selector Component
 *
 * Advanced state selection with search, popular states first,
 * geographic grouping, and mobile optimization.
 */

import React, { useState, useId, useMemo, useRef, useEffect } from 'react';
import { useGeolocation, coordinatesToState, coordinatesToCounty } from '../hooks/useGeolocation';
import { useQuestionFlowStore } from '../store';
import type { SelectProps } from './types';
import type { QuestionDefinition, QuestionContext } from '../types';

// Type for store with answerQuestion method
interface StoreWithAnswerQuestion {
  answerQuestion: (questionId: string, fieldName: string, value: unknown) => void;
}

// Enhanced state data with priority and region information
const US_STATES_ENHANCED = [
  // Most populous states (high priority)
  { value: 'CA', label: 'California', priority: 'high', region: 'West', population: 39538223 },
  { value: 'TX', label: 'Texas', priority: 'high', region: 'South', population: 29145505 },
  { value: 'FL', label: 'Florida', priority: 'high', region: 'South', population: 21538187 },
  { value: 'NY', label: 'New York', priority: 'high', region: 'Northeast', population: 20201249 },
  { value: 'PA', label: 'Pennsylvania', priority: 'high', region: 'Northeast', population: 13002700 },
  { value: 'IL', label: 'Illinois', priority: 'high', region: 'Midwest', population: 12812508 },
  { value: 'OH', label: 'Ohio', priority: 'high', region: 'Midwest', population: 11799448 },
  { value: 'GA', label: 'Georgia', priority: 'high', region: 'South', population: 10711908 },
  { value: 'NC', label: 'North Carolina', priority: 'high', region: 'South', population: 10439388 },
  { value: 'MI', label: 'Michigan', priority: 'high', region: 'Midwest', population: 10037261 },

  // All other states
  { value: 'AL', label: 'Alabama', priority: 'normal', region: 'South', population: 5024279 },
  { value: 'AK', label: 'Alaska', priority: 'normal', region: 'West', population: 733391 },
  { value: 'AZ', label: 'Arizona', priority: 'normal', region: 'West', population: 7151502 },
  { value: 'AR', label: 'Arkansas', priority: 'normal', region: 'South', population: 3011524 },
  { value: 'CO', label: 'Colorado', priority: 'normal', region: 'West', population: 5773714 },
  { value: 'CT', label: 'Connecticut', priority: 'normal', region: 'Northeast', population: 3605944 },
  { value: 'DE', label: 'Delaware', priority: 'normal', region: 'South', population: 989948 },
  { value: 'HI', label: 'Hawaii', priority: 'normal', region: 'West', population: 1455271 },
  { value: 'ID', label: 'Idaho', priority: 'normal', region: 'West', population: 1839106 },
  { value: 'IN', label: 'Indiana', priority: 'normal', region: 'Midwest', population: 6785528 },
  { value: 'IA', label: 'Iowa', priority: 'normal', region: 'Midwest', population: 3190369 },
  { value: 'KS', label: 'Kansas', priority: 'normal', region: 'Midwest', population: 2937880 },
  { value: 'KY', label: 'Kentucky', priority: 'normal', region: 'South', population: 4505836 },
  { value: 'LA', label: 'Louisiana', priority: 'normal', region: 'South', population: 4657757 },
  { value: 'ME', label: 'Maine', priority: 'normal', region: 'Northeast', population: 1344212 },
  { value: 'MD', label: 'Maryland', priority: 'normal', region: 'South', population: 6177224 },
  { value: 'MA', label: 'Massachusetts', priority: 'normal', region: 'Northeast', population: 6892503 },
  { value: 'MN', label: 'Minnesota', priority: 'normal', region: 'Midwest', population: 5737193 },
  { value: 'MS', label: 'Mississippi', priority: 'normal', region: 'South', population: 2961279 },
  { value: 'MO', label: 'Missouri', priority: 'normal', region: 'Midwest', population: 6154913 },
  { value: 'MT', label: 'Montana', priority: 'normal', region: 'West', population: 1084225 },
  { value: 'NE', label: 'Nebraska', priority: 'normal', region: 'Midwest', population: 1961504 },
  { value: 'NV', label: 'Nevada', priority: 'normal', region: 'West', population: 3104614 },
  { value: 'NH', label: 'New Hampshire', priority: 'normal', region: 'Northeast', population: 1377529 },
  { value: 'NJ', label: 'New Jersey', priority: 'normal', region: 'Northeast', population: 9288994 },
  { value: 'NM', label: 'New Mexico', priority: 'normal', region: 'West', population: 2117522 },
  { value: 'ND', label: 'North Dakota', priority: 'normal', region: 'Midwest', population: 779094 },
  { value: 'OK', label: 'Oklahoma', priority: 'normal', region: 'South', population: 3959353 },
  { value: 'OR', label: 'Oregon', priority: 'normal', region: 'West', population: 4237256 },
  { value: 'RI', label: 'Rhode Island', priority: 'normal', region: 'Northeast', population: 1097379 },
  { value: 'SC', label: 'South Carolina', priority: 'normal', region: 'South', population: 5118425 },
  { value: 'SD', label: 'South Dakota', priority: 'normal', region: 'Midwest', population: 886667 },
  { value: 'TN', label: 'Tennessee', priority: 'normal', region: 'South', population: 6910840 },
  { value: 'UT', label: 'Utah', priority: 'normal', region: 'West', population: 3271616 },
  { value: 'VT', label: 'Vermont', priority: 'normal', region: 'Northeast', population: 643077 },
  { value: 'VA', label: 'Virginia', priority: 'normal', region: 'South', population: 8631393 },
  { value: 'WA', label: 'Washington', priority: 'normal', region: 'West', population: 7705281 },
  { value: 'WV', label: 'West Virginia', priority: 'normal', region: 'South', population: 1793716 },
  { value: 'WI', label: 'Wisconsin', priority: 'normal', region: 'Midwest', population: 5893718 },
  { value: 'WY', label: 'Wyoming', priority: 'normal', region: 'West', population: 576851 },
  { value: 'DC', label: 'District of Columbia', priority: 'normal', region: 'South', population: 689545 }
];

interface EnhancedStateSelectorProps extends Omit<SelectProps, 'options'> {
  /** Show popular states first */
  showPopularFirst?: boolean;
  /** Group states by region */
  groupByRegion?: boolean;
  /** Show search functionality */
  enableSearch?: boolean;
  /** Mobile-optimized interface */
  mobileOptimized?: boolean;
  /** Auto-detect user's state */
  enableAutoDetection?: boolean;
  /** Show state population */
  showPopulation?: boolean;
  /** Maximum height for dropdown */
  maxHeight?: string;
}

// Constants
const POPULAR_LABEL = 'Popular';
const PEOPLE_TEXT = 'people';
const STATE_BUTTON_BASE_CLASSES = 'w-full px-3 py-2 text-left hover:bg-secondary-50 dark:hover:bg-secondary-600';
const REGION_HEADER_CLASSES = 'px-3 py-2 text-xs font-semibold text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 uppercase tracking-wide';
const POPULAR_BADGE_CLASSES = 'ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded';

// Helper function for debug logging
const debugLog = (message: string, data?: unknown): void => {
  if (import.meta.env.DEV) {
    console.log(message, data ?? '');
  }
};

// Helper function to handle county detection
const handleCountyDetection = (
  coordinates: GeolocationCoordinates,
  store: readonly [StoreWithAnswerQuestion]
): void => {
  const detectedCounty = coordinatesToCounty(coordinates);
  if (detectedCounty) {
    debugLog(`🏘️ Detected county: ${detectedCounty}`);
    store[0].answerQuestion('county', 'county', detectedCounty);
  }
};

// Helper function to handle state update
const handleStateUpdate = (
  detectedStateCode: string,
  value: string,
  onChange: readonly [(value: string) => void],
  setDetectedState: (state: string | null) => void,
  setLocationDetected: (detected: boolean) => void,
  coordinates: GeolocationCoordinates,
  store: readonly [StoreWithAnswerQuestion]
): void => {
  debugLog(`🔄 Updating state from "${value}" to "${detectedStateCode}"`);
  onChange[0](detectedStateCode);
  setDetectedState(detectedStateCode);
  setLocationDetected(true);
  handleCountyDetection(coordinates, store);
};

// Helper function to process location detection result
const processLocationResult = (
  coordinates: GeolocationCoordinates | null,
  detectedState: string | null,
  value: string,
  onChange: readonly [(value: string) => void],
  store: readonly [StoreWithAnswerQuestion],
  setDetectedState: (state: string | null) => void,
  setLocationDetected: (detected: boolean) => void
): void => {
  if (!coordinates || detectedState) return;

  const detectedStateCode = coordinatesToState(coordinates);
  debugLog('🌍 Location detected:', {
    coordinates: { lat: coordinates.latitude, lon: coordinates.longitude },
    detectedStateCode,
    currentValue: value
  });

  if (detectedStateCode && detectedStateCode !== value) {
    handleStateUpdate(detectedStateCode, value, onChange, setDetectedState, setLocationDetected, coordinates, store);
  } else if (detectedStateCode === value) {
    debugLog(`✅ State already matches detected state: ${detectedStateCode}`);
    setLocationDetected(true);
  } else {
    debugLog(`❌ No state detected from coordinates`);
  }
};

// Helper function to create state groups
const createStateGroups = (states: typeof US_STATES_ENHANCED): Array<{ region: string; states: typeof US_STATES_ENHANCED }> => {
  const groups = new Map<string, typeof US_STATES_ENHANCED>();

  for (const state of states) {
    const { region } = state;
    if (!groups.has(region)) {
      groups.set(region, []);
    }
    const regionStates = groups.get(region);
    if (regionStates) {
      regionStates.push(state);
    }
  }

  return Array.from(groups.entries()).map(([region, regionStates]) => ({
    region,
    states: regionStates.sort((a, b) => a.label.localeCompare(b.label))
  }));
};

// Helper function to create state button classes
const createStateButtonClasses = (isSelected: boolean, baseClasses: string): string => {
  const selectedClasses = isSelected
    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
    : 'text-secondary-900 dark:text-secondary-100';
  return `${baseClasses} ${selectedClasses}`;
};

// Helper function to render state button content
const renderStateButtonContent = (state: typeof US_STATES_ENHANCED[0], showPopulation: boolean): React.ReactNode => (
  <>
    <div className="flex items-center justify-between">
      <span className="font-medium">{state.label}</span>
      {state.priority === 'high' && (
        <span className={POPULAR_BADGE_CLASSES}>{POPULAR_LABEL}</span>
      )}
    </div>
    {showPopulation && (
      <div className="text-xs text-secondary-500 dark:text-secondary-400">
        {state.population.toLocaleString()} {PEOPLE_TEXT}
      </div>
    )}
  </>
);

// Helper function to render state list
const renderStateList = (
  states: typeof US_STATES_ENHANCED,
  value: string,
  onStateSelect: (stateValue: string) => void,
  showPopulation: boolean
): React.ReactNode => (
  states.map((state) => (
    <button
      key={state.value}
      type="button"
      onClick={() => onStateSelect(state.value)}
      className={createStateButtonClasses(value === state.value, STATE_BUTTON_BASE_CLASSES)}
    >
      {renderStateButtonContent(state, showPopulation)}
    </button>
  ))
);

// Helper function to render grouped states
const renderGroupedStates = (
  groupedStates: Array<{ region: string; states: typeof US_STATES_ENHANCED }>,
  value: string,
  onStateSelect: (stateValue: string) => void,
  showPopulation: boolean
): React.ReactNode => (
  groupedStates.map(({ region, states }) => (
    <div key={region}>
      <div className={REGION_HEADER_CLASSES}>
        {region}
      </div>
      {renderStateList(states, value, onStateSelect, showPopulation)}
    </div>
  ))
);

// Helper function to render location detection UI
const LocationDetectionUI: React.FC<{
  showLocationButton: boolean;
  isLocationLoading: boolean;
  hasRequestedLocation: boolean;
  disabled: boolean;
  onLocationRequest: () => void;
  showLocationError: boolean;
  locationError?: string | null;
  locationDetected: boolean;
  coordinates: GeolocationCoordinates | null;
}> = ({
  showLocationButton,
  isLocationLoading,
  hasRequestedLocation,
  disabled,
  onLocationRequest,
  showLocationError,
  locationError,
  locationDetected,
  coordinates
}) => {
    if (showLocationButton) {
      return (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                {isLocationLoading ? 'Detecting your location...' : 'Use your current location?'}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {isLocationLoading
                  ? 'Please allow location access to automatically detect your state.'
                  : 'We can automatically detect your state and county to save you time.'
                }
              </p>
            </div>

            {!isLocationLoading && (
              <button
                type="button"
                onClick={onLocationRequest}
                className="ml-4 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={disabled}
              >
                {hasRequestedLocation ? 'Try Again' : 'Detect Location'}
              </button>
            )}
          </div>

          {isLocationLoading && (
            <div className="mt-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Requesting location access...
              </span>
            </div>
          )}
        </div>
      );
    }

    if (showLocationError) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Location Detection Unavailable
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {locationError}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                You can still manually select your state from the dropdown above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (locationDetected && coordinates) {
      return (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                Location Detected Successfully
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                Your state has been automatically selected based on your location.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                If you change your state selection, you may need to re-select your county.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

// Helper function to render mobile state selector
const MobileStateSelector: React.FC<{
  containerRef: React.RefObject<HTMLDivElement>;
  className: string;
  question: QuestionDefinition;
  questionText: string;
  questionDescription: string | undefined;
  id: string;
  descId: string;
  placeholder: string;
  selectedState: typeof US_STATES_ENHANCED[0] | undefined;
  isOpen: boolean;
  isFocused: boolean;
  showError: boolean;
  disabled: boolean;
  autoFocus: boolean;
  onToggle: () => void;
  onBlur: () => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  enableSearch: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  groupedStates: Array<{ region: string; states: typeof US_STATES_ENHANCED }> | null;
  processedStates: typeof US_STATES_ENHANCED;
  value: string;
  onStateSelect: (stateValue: string) => void;
  showPopulation: boolean;
  helpText: string | undefined;
  errorId: string;
  errors: string[];
  showLocationButton: boolean;
  isLocationLoading: boolean;
  hasRequestedLocation: boolean;
  onLocationRequest: () => void;
  showLocationError: boolean;
  locationError: string | null | undefined;
  locationDetected: boolean;
  coordinates: GeolocationCoordinates | null;
}> = (props) => {
  const {
    containerRef, className, question, questionText, questionDescription, id, descId, placeholder, selectedState,
    isOpen, isFocused, showError, disabled, autoFocus, onToggle, onBlur, onFocus,
    onKeyDown, enableSearch, searchInputRef, searchQuery, onSearchChange, onClearSearch,
    groupedStates, processedStates, value, onStateSelect, showPopulation,
    helpText, errorId, errors, showLocationButton, isLocationLoading,
    hasRequestedLocation, onLocationRequest, showLocationError, locationError,
    locationDetected, coordinates
  } = props;

  return (
    <div ref={containerRef} className={`enhanced-state-selector-mobile ${className}`}>
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
          <span className={selectedState ? 'text-secondary-900 dark:text-secondary-100' : 'text-secondary-500 dark:text-secondary-400'}>
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
        <div className="absolute z-[99999] w-full mt-1 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {enableSearch && (
            <div className="p-3 border-b border-secondary-200 dark:border-secondary-600">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Search states..."
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border-secondary-300 dark:border-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400"
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
            {processedStates.length === 0 ? (
              <div className="px-3 py-8 text-center text-secondary-500 dark:text-secondary-400">
                <p className="text-sm">No states found</p>
              </div>
            ) : (
              groupedStates ? renderGroupedStates(groupedStates, value, onStateSelect, showPopulation) : renderStateList(processedStates, value, onStateSelect, showPopulation)
            )}
          </div>
        </div>
      )}

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

// Helper function to render desktop state selector
const DesktopStateSelector: React.FC<{
  containerRef: React.RefObject<HTMLDivElement>;
  className: string;
  question: QuestionDefinition;
  questionText: string;
  questionDescription: string | undefined;
  id: string;
  descId: string;
  placeholder: string;
  selectedState: typeof US_STATES_ENHANCED[0] | undefined;
  isOpen: boolean;
  isFocused: boolean;
  showError: boolean;
  disabled: boolean;
  autoFocus: boolean;
  onToggle: () => void;
  onBlur: () => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  enableSearch: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  groupedStates: Array<{ region: string; states: typeof US_STATES_ENHANCED }> | null;
  processedStates: typeof US_STATES_ENHANCED;
  value: string;
  onStateSelect: (stateValue: string) => void;
  showPopulation: boolean;
  maxHeight: string;
  helpText: string | undefined;
  errorId: string;
  errors: string[];
  showLocationButton: boolean;
  isLocationLoading: boolean;
  hasRequestedLocation: boolean;
  onLocationRequest: () => void;
  showLocationError: boolean;
  locationError: string | null | undefined;
  locationDetected: boolean;
  coordinates: GeolocationCoordinates | null;
}> = (props) => {
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
              {processedStates.length === 0 ? (
                <div className="px-3 py-8 text-center text-secondary-500 dark:text-secondary-400">
                  <p className="text-sm">No states found</p>
                </div>
              ) : (
                groupedStates ? renderGroupedStates(groupedStates, value, onStateSelect, showPopulation) : renderStateList(processedStates, value, onStateSelect, showPopulation)
              )}
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

export const EnhancedStateSelector: React.FC<EnhancedStateSelectorProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  placeholder = 'Search for your state...',
  showPopularFirst = true,
  groupByRegion = false,
  enableSearch = true,
  mobileOptimized = false,
  enableAutoDetection = false,
  showPopulation = false,
  maxHeight = '300px',
  onEnterKey,
}) => {
  // DEBUG: Log component mount immediately (only in dev mode)
  if (import.meta.env.DEV) {
    console.log('[EnhancedStateSelector] Component mounting', {
      questionId: question.id,
      questionText: question.text,
      questionDescription: question.description,
      inputType: question.inputType,
      fieldName: question.fieldName,
    });
  }

  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedCoordsRef = useRef<string | null>(null);

  // Resolve question text if it's a function
  const resolvedQuestionText = useMemo(() => {
    if (typeof question.text === 'function') {
      // If text is a function, we need context - but EnhancedStateSelector doesn't receive context
      // This should have been resolved by the Question component already
      console.warn('[EnhancedStateSelector] Question text is a function but no context provided', {
        questionId: question.id,
      });
      return question.text({} as QuestionContext);
    }
    return question.text || '';
  }, [question]);

  // Resolve question description if it's a function
  const resolvedQuestionDescription = useMemo(() => {
    if (typeof question.description === 'function') {
      console.warn('[EnhancedStateSelector] Question description is a function but no context provided', {
        questionId: question.id,
      });
      return question.description({} as QuestionContext);
    }
    return question.description ?? undefined;
  }, [question]);

  // Comprehensive debugging for question rendering (only in dev mode)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[EnhancedStateSelector] Component rendered', {
        questionId: question.id,
        questionFieldName: question.fieldName,
        questionText: question.text,
        questionTextType: typeof question.text,
        questionDescription: question.description,
        questionDescriptionType: typeof question.description,
        hasText: Boolean(question.text),
        hasDescription: Boolean(question.description),
        textLength: typeof question.text === 'string' ? question.text.length : 0,
        descriptionLength: typeof question.description === 'string' ? question.description.length : 0,
        questionRequired: question.required,
        value,
        disabled,
        className,
        resolvedQuestionText,
        resolvedQuestionDescription,
        mobileOptimized,
      });
    }
  }, [question, value, disabled, className, resolvedQuestionText, resolvedQuestionDescription, mobileOptimized]);

  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedState, setDetectedState] = useState<string | null>(null);
  const [_highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const store = useQuestionFlowStore();

  // Use refs to store stable references to prevent useEffect loops
  const onChangeRef = useRef(onChange);
  const storeRef = useRef(store);

  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    storeRef.current = store;
  }, [onChange, store]);

  const {
    coordinates,
    isLoading: isLocationLoading,
    error: locationError,
    isSupported,
    hasPermission,
    getCurrentPosition,
    clearLocation,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
  });

  // Debug state changes (only in dev mode to reduce overhead)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 State change:', { locationDetected, hasRequestedLocation, coordinates: !!coordinates });
    }
  }, [locationDetected, hasRequestedLocation, coordinates]);

  // Debug coordinates changes (only in dev mode to reduce overhead)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🌍 Coordinates changed:', {
        hasCoordinates: !!coordinates,
        lat: coordinates?.latitude,
        lon: coordinates?.longitude,
        locationDetected
      });
    }
  }, [coordinates, locationDetected]);

  // Auto-detect user's state when component mounts
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 EnhancedStateSelector: Auto-detection check', {
        enableAutoDetection,
        hasRequestedLocation,
        isSupported,
        hasPermission,
        questionId: question.id,
        fieldName: question.fieldName
      });
    }

    if (enableAutoDetection && !hasRequestedLocation && isSupported && hasPermission !== false) {
      if (import.meta.env.DEV) {
        console.log('🚀 Starting location detection...');
      }
      setHasRequestedLocation(true);
      getCurrentPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableAutoDetection, hasRequestedLocation, isSupported, hasPermission, question.id, question.fieldName]);

  // Handle location detection result
  useEffect(() => {
    // Early return if conditions aren't met - prevents unnecessary processing
    if (!coordinates || locationDetected || detectedState) {
      return;
    }

    // Use a ref to track if we've already processed these coordinates
    const coordsKey = `${coordinates.latitude}-${coordinates.longitude}`;

    if (lastProcessedCoordsRef.current === coordsKey) {
      return; // Already processed these coordinates
    }

    if (import.meta.env.DEV) {
      console.log('DEBUG: Coordinates useEffect triggered', { coordinates, locationDetected, value, detectedState });
    }

    lastProcessedCoordsRef.current = coordsKey;

    // Use refs to avoid dependency on onChange/store which might change
    processLocationResult(
      coordinates,
      detectedState,
      String(value ?? ''),
      [onChangeRef.current] as const,
      [storeRef.current] as const,
      setDetectedState,
      setLocationDetected
    );
  }, [coordinates, detectedState, value, locationDetected]);

  // Handle manual state changes after location detection
  useEffect(() => {
    if (locationDetected && detectedState && value !== detectedState) {
      // User manually changed state after location detection
      if (import.meta.env.DEV) {
        console.log('User manually changed state after location detection. County may need to be cleared.');
      }
      setLocationDetected(false); // Reset location detection state
      setDetectedState(null); // Clear detected state
    }
  }, [locationDetected, detectedState, value]);

  // Handle location permission denial
  useEffect(() => {
    if (hasPermission === false && !locationDetected && !coordinates) {
      setLocationDetected(true); // Prevent repeated requests only if no coordinates
    }
  }, [hasPermission, locationDetected, coordinates]);

  // Reset touched state when question changes
  useEffect(() => {
    setIsTouched(false);
    setHasUserInteracted(false);
  }, [question.id]);

  // Convert error to array format (must be declared before showError calculation)
  const errors: string[] = (() => {
    if (Array.isArray(error)) return error;
    if (error) return [error];
    return [];
  })();

  // Calculate error state (must be declared before useEffect that uses it)
  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Debug validation state
  useEffect(() => {
    if (import.meta.env.DEV) {
      const isValid = !question.required || (value && String(value).length > 0);
      console.log('[EnhancedStateSelector] Validation state', {
        questionId: question.id,
        value,
        required: question.required,
        isTouched,
        hasUserInteracted,
        hasError: Boolean(error),
        showError,
        isValid,
        errorMessages: errors,
      });
    }
  }, [question.id, question.required, value, isTouched, hasUserInteracted, error, showError, errors]);

  // Process states based on configuration
  const processedStates = useMemo(() => {
    let states = [...US_STATES_ENHANCED];

    // Filter by search query
    if (searchQuery) {
      states = states.filter(state =>
        state.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        state.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by priority if enabled
    if (showPopularFirst) {
      states.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return a.label.localeCompare(b.label);
      });
    }

    return states;
  }, [searchQuery, showPopularFirst]);

  // Group states by region if enabled
  const groupedStates = useMemo(() => {
    if (!groupByRegion) return null;
    return createStateGroups(processedStates);
  }, [processedStates, groupByRegion]);

  const selectedState = US_STATES_ENHANCED.find(state => state.value === value);

  const handleToggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && enableSearch) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Focus search input when opening
        timeoutRef.current = setTimeout(() => {
          searchInputRef.current?.focus();
          timeoutRef.current = null;
        }, 100);
      }
    }
  };

  const handleStateSelect = (stateValue: string): void => {
    if (import.meta.env.DEV) {
      console.log('[EnhancedStateSelector] State selected', {
        questionId: question.id,
        stateValue,
        previousValue: value,
        required: question.required,
      });
    }

    setHasUserInteracted(true);
    setIsTouched(true); // Mark as touched when user selects a state
    onChange(stateValue);
    setIsOpen(false);
    setSearchQuery('');

    // Trigger validation immediately after selection
    if (import.meta.env.DEV) {
      console.log('[EnhancedStateSelector] Validation triggered after selection', {
        questionId: question.id,
        stateValue,
        isValid: Boolean(stateValue && stateValue.length > 0),
      });
    }
  };

  const handleBlur = (): void => {
    // Clear any existing blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    // Delay to allow for option clicks
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      // Only close if not clicking on dropdown content
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
      if (hasUserInteracted || value) {
        setIsTouched(true);
        if (import.meta.env.DEV) {
          console.log('[EnhancedStateSelector] Field blurred and marked as touched', {
            questionId: question.id,
            value,
            hasUserInteracted,
            required: question.required,
            isValid: Boolean(value && String(value).length > 0),
          });
        }
      }
      blurTimeoutRef.current = null;
    }, 150);
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    if (e.key === 'Enter' && onEnterKey) {
      e.preventDefault();
      onEnterKey();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleClearSearch = (): void => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleLocationRequest = (): void => {
    if (isLocationLoading) return;

    clearLocation();
    setLocationDetected(false);
    setHasRequestedLocation(true);
    getCurrentPosition();
  };

  const LOCATION_DETECTION_AVAILABLE = enableAutoDetection && isSupported && hasPermission !== false && !locationDetected;
  const showLocationButton = LOCATION_DETECTION_AVAILABLE;
  const showLocationError = Boolean(locationError && hasRequestedLocation);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };
  }, []);

  // Use extracted components for cleaner code
  const commonProps = {
    containerRef,
    className,
    question,
    questionText: resolvedQuestionText,
    questionDescription: resolvedQuestionDescription,
    id,
    descId,
    placeholder,
    selectedState,
    isOpen,
    isFocused,
    showError,
    disabled,
    autoFocus,
    onToggle: handleToggle,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    enableSearch,
    searchInputRef,
    searchQuery,
    onSearchChange: handleSearchChange,
    onClearSearch: handleClearSearch,
    groupedStates,
    processedStates,
    value: String(value ?? ''),
    onStateSelect: handleStateSelect,
    showPopulation,
    helpText: question.helpText,
    errorId,
    errors,
    showLocationButton,
    isLocationLoading,
    hasRequestedLocation,
    onLocationRequest: handleLocationRequest,
    showLocationError,
    locationError,
    locationDetected,
    coordinates
  };

  if (mobileOptimized) {
    return <MobileStateSelector {...commonProps} />;
  }

  return <DesktopStateSelector {...commonProps} maxHeight={maxHeight} />;
};

EnhancedStateSelector.displayName = 'EnhancedStateSelector';
