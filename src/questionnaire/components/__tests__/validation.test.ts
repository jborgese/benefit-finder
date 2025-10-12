/**
 * Validation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateAnswer,
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidSSN,
  isValidZipCode,
  formatSSN,
  formatPhone,
  formatCurrency,
  parseCurrency,
} from '../validation';
import type { QuestionDefinition } from '../../types';

describe('Validation', () => {
  describe('validateAnswer', () => {
    it('should validate required fields', () => {
      const question: QuestionDefinition = {
        id: 'q1',
        text: 'Name',
        inputType: 'text',
        fieldName: 'name',
        required: true,
      };

      const result1 = validateAnswer(question, '');
      expect(result1.valid).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);

      const result2 = validateAnswer(question, 'John Doe');
      expect(result2.valid).toBe(true);
      expect(result2.errors.length).toBe(0);
    });

    it('should validate number min/max', () => {
      const question: QuestionDefinition = {
        id: 'q1',
        text: 'Age',
        inputType: 'number',
        fieldName: 'age',
        min: 18,
        max: 100,
      };

      expect(validateAnswer(question, 17).valid).toBe(false);
      expect(validateAnswer(question, 18).valid).toBe(true);
      expect(validateAnswer(question, 50).valid).toBe(true);
      expect(validateAnswer(question, 100).valid).toBe(true);
      expect(validateAnswer(question, 101).valid).toBe(false);
    });

    it('should validate email', () => {
      const question: QuestionDefinition = {
        id: 'q1',
        text: 'Email',
        inputType: 'email',
        fieldName: 'email',
      };

      expect(validateAnswer(question, 'invalid').valid).toBe(false);
      expect(validateAnswer(question, 'test@example.com').valid).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('+1 123 456 7890')).toBe(true);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate dates', () => {
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('isValidSSN', () => {
    it('should validate SSN', () => {
      expect(isValidSSN('234-56-7890')).toBe(true);
      expect(isValidSSN('234567890')).toBe(true);
      expect(isValidSSN('000-00-0000')).toBe(false);
      expect(isValidSSN('123-45-6789')).toBe(false); // Invalid pattern
      expect(isValidSSN('123-45-678')).toBe(false); // Too short
      expect(isValidSSN('')).toBe(false);
    });
  });

  describe('isValidZipCode', () => {
    it('should validate ZIP codes', () => {
      expect(isValidZipCode('12345')).toBe(true);
      expect(isValidZipCode('12345-6789')).toBe(true);
      expect(isValidZipCode('1234')).toBe(false);
      expect(isValidZipCode('abcde')).toBe(false);
      expect(isValidZipCode('')).toBe(false);
    });
  });

  describe('formatSSN', () => {
    it('should format SSN', () => {
      expect(formatSSN('123456789')).toBe('123-45-6789');
      expect(formatSSN('12345')).toBe('123-45');
      expect(formatSSN('123')).toBe('123');
    });
  });

  describe('formatPhone', () => {
    it('should format phone numbers', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890');
      expect(formatPhone('11234567890')).toBe('+1 (123) 456-7890');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency strings', () => {
      expect(parseCurrency('$1,000.00')).toBe(1000);
      expect(parseCurrency('1234.56')).toBe(1234.56);
      expect(parseCurrency('invalid')).toBeNull();
    });
  });
});

