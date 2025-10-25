/**
 * AMI Data Validator
 *
 * Runtime validation for Area Median Income data structures.
 */

import type { StateAMIData, ProcessedAMIData } from '../types/ami';

/**
 * Validate AMI data structure
 */
export function validateAMIData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('AMI data is required');
    return { isValid: false, errors };
  }

  if (typeof data.year !== 'number' || data.year < 2020) {
    errors.push('Valid year is required (2020 or later)');
  }

  if (!data.state || typeof data.state !== 'string') {
    errors.push('State code is required');
  }

  if (!data.counties || typeof data.counties !== 'object') {
    errors.push('Counties data is required and must be an object');
  } else {
    const countyEntries = Object.entries(data.counties);
    if (countyEntries.length === 0) {
      errors.push('At least one county is required');
    }

    countyEntries.forEach(([countyName, countyData]: [string, any]) => {
      if (!countyData.ami || typeof countyData.ami !== 'object') {
        errors.push(`County ${countyName} is missing AMI data`);
      } else {
        const amiAmounts = Object.entries(countyData.ami);
        if (amiAmounts.length === 0) {
          errors.push(`County ${countyName} must have at least one household size AMI amount`);
        }

        amiAmounts.forEach(([householdSize, amount]: [string, any]) => {
          if (typeof amount !== 'number' || amount <= 0) {
            errors.push(`County ${countyName} household size ${householdSize} must have a positive AMI amount`);
          }
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate processed AMI data
 */
export function validateProcessedAMIData(data: ProcessedAMIData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.state || typeof data.state !== 'string') {
    errors.push('State is required');
  }

  if (!data.county || typeof data.county !== 'string') {
    errors.push('County is required');
  }

  if (typeof data.year !== 'number' || data.year < 2020) {
    errors.push('Valid year is required (2020 or later)');
  }

  if (typeof data.householdSize !== 'number' || data.householdSize < 1 || data.householdSize > 8) {
    errors.push('Household size must be between 1 and 8');
  }

  if (typeof data.amiAmount !== 'number' || data.amiAmount <= 0) {
    errors.push('AMI amount must be a positive number');
  }

  if (typeof data.incomeLimit50 !== 'number' || data.incomeLimit50 <= 0) {
    errors.push('50% income limit must be a positive number');
  }

  if (typeof data.incomeLimit60 !== 'number' || data.incomeLimit60 <= 0) {
    errors.push('60% income limit must be a positive number');
  }

  if (typeof data.incomeLimit80 !== 'number' || data.incomeLimit80 <= 0) {
    errors.push('80% income limit must be a positive number');
  }

  if (typeof data.lastUpdated !== 'number' || data.lastUpdated <= 0) {
    errors.push('Last updated timestamp is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
