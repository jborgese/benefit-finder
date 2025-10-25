/**
 * Location Data Validator
 *
 * Runtime validation for location data structures.
 */

import type { LocationData, LocationValidationResult } from '../types/location';

/**
 * Validate location data structure
 */
export function validateLocationData(data: any): LocationValidationResult {
  const errors: string[] = [];

  if (!data) {
    errors.push('Location data is required');
    return { isValid: false, errors };
  }

  if (!data.metadata) {
    errors.push('Location metadata is required');
  } else {
    if (!data.metadata.version) errors.push('Metadata version is required');
    if (!data.metadata.lastUpdated) errors.push('Metadata lastUpdated is required');
    if (!data.metadata.description) errors.push('Metadata description is required');
  }

  if (!data.states || typeof data.states !== 'object') {
    errors.push('States data is required and must be an object');
  } else {
    const stateEntries = Object.entries(data.states);
    if (stateEntries.length === 0) {
      errors.push('At least one state is required');
    }

    stateEntries.forEach(([stateCode, stateData]: [string, any]) => {
      if (!stateData.name) {
        errors.push(`State ${stateCode} is missing name`);
      }
      if (!Array.isArray(stateData.counties)) {
        errors.push(`State ${stateCode} counties must be an array`);
      } else if (stateData.counties.length === 0) {
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
