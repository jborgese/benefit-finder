/**
 * State Selector with Location Detection
 *
 * Enhanced state selector that automatically detects user's location
 * when permission is granted, with fallback to manual selection.
 */

import React, { useEffect, useState } from 'react';
import { SelectInput } from './SelectInput';
import { useGeolocation, coordinatesToState, coordinatesToCounty } from '../hooks/useGeolocation';
import { useQuestionFlowStore } from '../store';
import type { QuestionDefinition } from '../types';

interface StateSelectorWithLocationProps {
  question: QuestionDefinition;
  value: string | number | null;
  onChange: (value: string | number) => void;
  error?: string[];
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  onEnterKey?: () => void;
}

export const StateSelectorWithLocation: React.FC<StateSelectorWithLocationProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  onEnterKey,
}) => {
  const store = useQuestionFlowStore();
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const {
    coordinates,
    isLoading,
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

  // Auto-detect location when component mounts (only for state question)
  useEffect(() => {
    if (question.fieldName === 'state' && !hasRequestedLocation && isSupported && hasPermission !== false) {
      setHasRequestedLocation(true);
      getCurrentPosition();
    }
  }, [question.fieldName, hasRequestedLocation, isSupported, hasPermission, getCurrentPosition]);

  // Handle location detection result
  useEffect(() => {
    if (coordinates && !locationDetected) {
      const detectedState = coordinatesToState(coordinates);
      if (detectedState && detectedState !== value) {
        // Update the state selection
        onChange(detectedState);
        setLocationDetected(true);

        // Try to detect county for the next question
        const detectedCounty = coordinatesToCounty(coordinates);
        if (detectedCounty) {
          // Store county for the next question
          // This would be used when the county question is reached
          store.answerQuestion('county', 'county', detectedCounty);
        }
      }
    }
  }, [coordinates, locationDetected, value, onChange, store]);

  // Handle location permission denial
  useEffect(() => {
    if (hasPermission === false && !locationDetected) {
      setLocationDetected(true); // Prevent repeated requests
    }
  }, [hasPermission, locationDetected]);

  const handleLocationRequest = (): void => {
    if (isLoading) return;

    clearLocation();
    setLocationDetected(false);
    setHasRequestedLocation(true);
    getCurrentPosition();
  };

  const showLocationButton = isSupported && hasPermission !== false && !locationDetected;
  const showLocationError = locationError && hasRequestedLocation;

  return (
    <div className={`state-selector-with-location ${className}`}>
      <SelectInput
        question={question}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
        autoFocus={autoFocus}
        onEnterKey={onEnterKey}
      />

      {showLocationButton && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                {isLoading ? 'Detecting your location...' : 'Use your current location?'}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {isLoading
                  ? 'Please allow location access to automatically detect your state.'
                  : 'We can automatically detect your state and county to save you time.'
                }
              </p>
            </div>

            {!isLoading && (
              <button
                type="button"
                onClick={handleLocationRequest}
                className="ml-4 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={disabled}
              >
                {hasRequestedLocation ? 'Try Again' : 'Detect Location'}
              </button>
            )}
          </div>

          {isLoading && (
            <div className="mt-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Requesting location access...
              </span>
            </div>
          )}
        </div>
      )}

      {showLocationError && (
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
      )}

      {locationDetected && coordinates && (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
