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
  if (question.required && (value === undefined || value === null || value === '')) {
    errors.push(`${question.text} is required`);
    return { valid: false, errors };
  }

  // If not required and empty, skip other validations
  if (!value && !question.required) {
    return { valid: true, errors: [] };
  }

  // Apply custom validations
  if (question.validations) {
    for (const validation of question.validations) {
      const error = applyValidation(validation, value, question);
      if (error) {
        errors.push(error);
      }
    }
  }

  // Type-specific validations
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
      if (question.min !== undefined && (value as number) < question.min) {
        errors.push(`Value must be at least ${question.min}`);
      }
      if (question.max !== undefined && (value as number) > question.max) {
        errors.push(`Value must be at most ${question.max}`);
      }
      break;

    case 'currency':
      if (typeof value === 'number') {
        if (value < 0) {
          errors.push('Amount cannot be negative');
        }
      }
      break;

    case 'date':
      if (!isValidDate(value as string)) {
        errors.push('Please enter a valid date');
      }
      break;

    case 'multiselect':
      if (Array.isArray(value)) {
        // Check min/max selections in component props
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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
      if (!value || value === '') {
        return validation.message;
      }
      break;

    case 'min':
      if (typeof value === 'number' && value < (validation.value as number)) {
        return validation.message;
      }
      if (typeof value === 'string' && value.length < (validation.value as number)) {
        return validation.message;
      }
      break;

    case 'max':
      if (typeof value === 'number' && value > (validation.value as number)) {
        return validation.message;
      }
      if (typeof value === 'string' && value.length > (validation.value as number)) {
        return validation.message;
      }
      break;

    case 'pattern':
      if (typeof value === 'string') {
        const regex = validation.value instanceof RegExp
          ? validation.value
          : new RegExp(validation.value as string);

        if (!regex.test(value)) {
          return validation.message;
        }
      }
      break;

    case 'custom':
      if (validation.rule) {
        // Use JSON Logic for custom validation
        // This would integrate with the rule engine
        // For now, return null to skip
      }
      break;
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

  // 5 digits or 5+4 format
  const zipRegex = /^\d{5}(-\d{4})?$/;
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

