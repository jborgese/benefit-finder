/**
 * Validation Utilities Tests
 * 
 * Example tests for utility functions.
 */

import { describe, it, expect } from 'vitest';

// Example validation functions for testing
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
  return phoneRegex.test(phone);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });
    
    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
      expect(isValidEmail('invalid @domain.com')).toBe(false);
    });
  });
  
  describe('isValidZipCode', () => {
    it('should validate 5-digit zip codes', () => {
      expect(isValidZipCode('12345')).toBe(true);
      expect(isValidZipCode('90210')).toBe(true);
    });
    
    it('should validate ZIP+4 format', () => {
      expect(isValidZipCode('12345-6789')).toBe(true);
    });
    
    it('should reject invalid zip codes', () => {
      expect(isValidZipCode('1234')).toBe(false);
      expect(isValidZipCode('123456')).toBe(false);
      expect(isValidZipCode('abcde')).toBe(false);
      expect(isValidZipCode('12345-678')).toBe(false);
    });
  });
  
  describe('isValidPhoneNumber', () => {
    it('should validate various phone number formats', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('123-456-7890')).toBe(true);
      expect(isValidPhoneNumber('123 456 7890')).toBe(true);
      expect(isValidPhoneNumber('(123)456-7890')).toBe(true);
      expect(isValidPhoneNumber('(123) 456-7890')).toBe(true);
    });
    
    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('12345678901')).toBe(false);
      expect(isValidPhoneNumber('abc-def-ghij')).toBe(false);
    });
  });
  
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });
    
    it('should handle negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });
    
    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });
  
  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      // Test with a date that makes the person clearly an adult
      const birthDate = '2000-01-01';
      const age = calculateAge(birthDate);
      
      expect(age).toBeGreaterThanOrEqual(24);
      expect(age).toBeLessThanOrEqual(25);
    });
    
    it('should handle leap years', () => {
      const birthDate = '2000-02-29';
      const age = calculateAge(birthDate);
      
      expect(age).toBeGreaterThan(0);
    });
  });
});

