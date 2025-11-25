/**
 * Utility functions for eligibility evaluation
 */

import { hasOwnProperty } from '../../../../utils/safePropertyAccess';
import { MEDICAID_EXPANSION_STATE_CODES, STATE_NAME_TO_CODE } from './constants';

/**
 * Global debug log utility
 */
export function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.debug('[Eligibility Evaluation Debug]', ...args);
  }
}

/**
 * Determine if a state has expanded Medicaid under the ACA
 */
export function isMedicaidExpansionState(stateCode: string): boolean {
  return MEDICAID_EXPANSION_STATE_CODES.has(stateCode);
}

/**
 * Normalize state name or code to 2-character state code
 */
export function normalizeStateToCode(stateValue: string): string {
  // If it's already a 2-character code, return it
  if (stateValue.length === 2) {
    return stateValue.toUpperCase();
  }

  // If it's a full state name, convert to code
  const normalizedName = stateValue.trim();
  let code: string | undefined;
  if (hasOwnProperty(STATE_NAME_TO_CODE, normalizedName)) {
    code = STATE_NAME_TO_CODE[normalizedName];
  }

  if (code) {
    return code;
  }

  // Fallback: return the original value (shouldn't happen in normal usage)
  console.warn(`[prepareDataContext] Unknown state value: ${stateValue}`);
  return stateValue;
}

/**
 * Calculate age from date of birth
 */
export function calculateAgeFromDateOfBirth(dateOfBirth: string): number {
  // Parse the ISO date string and create a date object in local timezone
  // This prevents timezone shift issues when calculating age
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day); // month is 0-indexed
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check for missing required fields
 */
export function checkMissingFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): string[] {
  const missing: string[] = [];
  debugLog('Checking missing fields', { requiredFields, data });
  for (const field of requiredFields) {
    const fieldValue = hasOwnProperty(data, field) ? data[field] : undefined;
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      missing.push(field);
    }
  }
  debugLog('Missing fields found', missing);
  return missing;
}

/**
 * Check if word boundary exists for a keyword in text
 */
export function hasWordBoundary(text: string, keyword: string): boolean {
  const index = text.indexOf(keyword);
  if (index === -1) {return false;}

  // Check if it's at the beginning or after a non-word character
  const beforeChar = index === 0 ? '' : text[index - 1];
  const afterChar = index + keyword.length >= text.length ? '' : text[index + keyword.length];

  const isWordChar = (char: string): boolean => /[a-zA-Z0-9_]/.test(char);

  return (!isWordChar(beforeChar) && !isWordChar(afterChar));
}
