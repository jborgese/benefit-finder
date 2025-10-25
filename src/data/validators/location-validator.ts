/**
 * Location Data Validator
 *
 * Runtime validation for location data structures.
 */

import type { LocationValidationResult } from '../types/location';

/**
 * Validate location data structure
 */
export function validateLocationData(data: unknown): LocationValidationResult {
  const errors: string[] = [];

  if (!data) {
    errors.push('Location data is required');
    return { isValid: false, errors };
  }

  // Type guard to check if data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push('Location data must be an object');
    return { isValid: false, errors };
  }

  const locationData = data as Record<string, unknown>;

  if (!locationData.metadata) {
    errors.push('Location metadata is required');
  } else {
    const metadata = locationData.metadata as Record<string, unknown>;
    if (!metadata.version) errors.push('Metadata version is required');
    if (!metadata.lastUpdated) errors.push('Metadata lastUpdated is required');
    if (!metadata.description) errors.push('Metadata description is required');
  }

  if (!locationData.states || typeof locationData.states !== 'object') {
    errors.push('States data is required and must be an object');
  } else {
    const stateEntries = Object.entries(locationData.states);
    if (stateEntries.length === 0) {
      errors.push('At least one state is required');
    }

    stateEntries.forEach(([stateCode, stateData]: [string, unknown]) => {
      if (typeof stateData !== 'object' || stateData === null) {
        errors.push(`State ${stateCode} data must be an object`);
        return;
      }

      const state = stateData as Record<string, unknown>;
      if (!state.name) {
        errors.push(`State ${stateCode} is missing name`);
      }
      if (!Array.isArray(state.counties)) {
        errors.push(`State ${stateCode} counties must be an array`);
      } else if (state.counties.length === 0) {
        errors.push(`State ${stateCode} must have at least one county`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate state code format
 */
export function validateStateCode(stateCode: string): boolean {
  return /^[A-Z]{2}$/.test(stateCode);
}

/**
 * Validate county name format
 */
export function validateCountyName(countyName: string): boolean {
  return countyName.trim().length > 0 && countyName.trim().length <= 100;
}
