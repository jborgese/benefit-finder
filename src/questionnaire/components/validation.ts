/**
 * Question Validation Utilities
 *
 * Validation functions for question inputs
 */

import type { QuestionDefinition, QuestionValidation } from '../types';

/**
 * Validate a question answer
 */
export function validateAnswer(
  question: QuestionDefinition,
  value: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required
  const isEmpty = value === undefined || value === null || value === '';
  if (question.required && isEmpty) {
    errors.push(`${question.text} is required`);
    return { valid: false, errors };
  }

  // If not required and empty, skip other validations
  if (!value && !question.required) {
    return { valid: true, errors: [] };
  }

  // Apply custom validations
  applyCustomValidations(question, value, errors);

  // Type-specific validations
  applyTypeSpecificValidations(question, value, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Apply custom validation rules
 */
function applyCustomValidations(
  question: QuestionDefinition,
  value: unknown,
  errors: string[]
): void {
  if (!question.validations) {
    return;
  }

  for (const validation of question.validations) {
    const error = applyValidation(validation, value, question);
    if (error) {
      errors.push(error);
    }
  }
}

/**
 * Apply type-specific validation rules
 */
function applyTypeSpecificValidations(
  question: QuestionDefinition,
  value: unknown,
  errors: string[]
): void {
  switch (question.inputType) {
    case 'email':
      if (!isValidEmail(value as string)) {
        errors.push('Please enter a valid email address');
      }
      break;

    case 'phone':
      if (!isValidPhone(value as string)) {
        errors.push('Please enter a valid phone number');
      }
      break;

    case 'number':
      validateNumberRange(question, value as number, errors);
      break;

    case 'currency':
      validateCurrency(value, errors);
      break;

    case 'date':
      if (!isValidDate(value as string)) {
        errors.push('Please enter a valid date');
      }
      break;

    case 'multiselect':
      // Check min/max selections in component props
      break;
  }
}

/**
 * Validate number range constraints
 */
function validateNumberRange(
  question: QuestionDefinition,
  value: number,
  errors: string[]
): void {
  if (question.min !== undefined && value < question.min) {
    errors.push(`Value must be at least ${question.min}`);
  }
  if (question.max !== undefined && value > question.max) {
    errors.push(`Value must be at most ${question.max}`);
  }
}

/**
 * Validate currency value
 */
function validateCurrency(value: unknown, errors: string[]): void {
  if (typeof value === 'number' && value < 0) {
    errors.push('Amount cannot be negative');
  }
}

/**
 * Apply a single validation rule
 */
function applyValidation(
  validation: QuestionValidation,
  value: unknown,
  _question: QuestionDefinition
): string | null {
  switch (validation.type) {
    case 'required':
      return validateRequired(value, validation.message);

    case 'min':
      return validateMin(value, validation.value as number, validation.message);

    case 'max':
      return validateMax(value, validation.value as number, validation.message);

    case 'pattern':
      // Ensure validation.value is defined and is a valid pattern type
      if (validation.value === undefined) {
        return 'Pattern validation requires a pattern value';
      }
      // Pattern validation requires string or RegExp, not number
      if (typeof validation.value === 'number') {
        return 'Pattern validation requires a string or RegExp pattern';
      }
      return validatePattern(value, validation.value, validation.message);

    case 'custom':
      // Use JSON Logic for custom validation
      // This would integrate with the rule engine
      // For now, return null to skip
      return null;

    default:
      return null;
  }
}

/**
 * Validate required field
 */
function validateRequired(value: unknown, message: string): string | null {
  if (!value || value === '') {
    return message;
  }
  return null;
}

/**
 * Validate minimum value/length
 */
function validateMin(value: unknown, minValue: number, message: string): string | null {
  if (typeof value === 'number' && value < minValue) {
    return message;
  }
  if (typeof value === 'string' && value.length < minValue) {
    return message;
  }
  return null;
}

/**
 * Validate maximum value/length
 */
function validateMax(value: unknown, maxValue: number, message: string): string | null {
  if (typeof value === 'number' && value > maxValue) {
    return message;
  }
  if (typeof value === 'string' && value.length > maxValue) {
    return message;
  }
  return null;
}

/**
 * Validate pattern match
 */
function validatePattern(
  value: unknown,
  pattern: RegExp | string,
  message: string
): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  // Use provided RegExp directly or convert string pattern
  // Note: Pattern should be validated at schema definition time
  let regex: RegExp;
  if (pattern instanceof RegExp) {
    regex = pattern;
  } else {
    try {
      // eslint-disable-next-line security/detect-non-literal-regexp
      regex = new RegExp(pattern);
    } catch {
      // Invalid pattern - should be caught at schema validation
      return 'Invalid validation pattern';
    }
  }

  if (!regex.test(value)) {
    return message;
  }

  return null;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (US format)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // US phone numbers are 10 or 11 digits (with country code)
  return digits.length === 10 || digits.length === 11;
}

/**
 * Validate date
 */
export function isValidDate(date: string): boolean {
  if (!date) return false;

  const parsed = Date.parse(date);
  return !isNaN(parsed);
}

/**
 * Validate SSN format
 */
export function isValidSSN(ssn: string): boolean {
  if (!ssn) return false;

  // Remove all non-digits
  const digits = ssn.replace(/\D/g, '');

  // SSN must be exactly 9 digits
  if (digits.length !== 9) return false;

  // Invalid SSN patterns
  const invalid = [
    '000000000',
    '111111111',
    '222222222',
    '333333333',
    '444444444',
    '555555555',
    '666666666',
    '777777777',
    '888888888',
    '999999999',
    '123456789',
  ];

  return !invalid.includes(digits);
}

/**
 * Format SSN for display
 */
export function formatSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, '');

  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
}

/**
 * Format phone number for display (US)
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

/**
 * Validate ZIP code (US)
 */
export function isValidZipCode(zip: string): boolean {
  if (!zip) return false;

  // 5 digits or 5+4 format (safe regex - no ReDoS vulnerability)
  // Using specific length checks instead of quantifiers to avoid backtracking
  // eslint-disable-next-line security/detect-unsafe-regex
  const zipRegex = /^[0-9]{5}(?:-[0-9]{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number | null {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
}

