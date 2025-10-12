/**
 * Zod Schema Tests
 */

import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  phoneSchema,
  ssnSchema,
  zipCodeSchema,
  ageSchema,
  householdSizeSchema,
  birthDateSchema,
  currencySchema,
  validateWithSchema,
  createSchemaFromQuestion,
} from '../schemas';

describe('Zod Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate valid emails', () => {
      const result = validateWithSchema(emailSchema, 'test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    it('should reject invalid emails', () => {
      const result = validateWithSchema(emailSchema, 'invalid-email');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('phoneSchema', () => {
    it('should validate and transform phone numbers', () => {
      const result = validateWithSchema(phoneSchema, '(123) 456-7890');
      expect(result.success).toBe(true);
      expect(result.data).toBe('1234567890'); // Transformed
    });

    it('should reject invalid phone numbers', () => {
      const result = validateWithSchema(phoneSchema, '123');
      expect(result.success).toBe(false);
    });
  });

  describe('ssnSchema', () => {
    it('should validate and transform SSN', () => {
      const result = validateWithSchema(ssnSchema, '123-45-6789');
      expect(result.success).toBe(true);
      expect(result.data).toBe('123456789'); // Transformed
    });

    it('should accept SSN without dashes', () => {
      const result = validateWithSchema(ssnSchema, '123456789');
      expect(result.success).toBe(true);
    });
  });

  describe('zipCodeSchema', () => {
    it('should validate 5-digit ZIP', () => {
      const result = validateWithSchema(zipCodeSchema, '12345');
      expect(result.success).toBe(true);
    });

    it('should validate ZIP+4', () => {
      const result = validateWithSchema(zipCodeSchema, '12345-6789');
      expect(result.success).toBe(true);
    });
  });

  describe('ageSchema', () => {
    it('should validate valid ages', () => {
      expect(validateWithSchema(ageSchema, 25).success).toBe(true);
      expect(validateWithSchema(ageSchema, 0).success).toBe(true);
      expect(validateWithSchema(ageSchema, 120).success).toBe(true);
    });

    it('should reject invalid ages', () => {
      expect(validateWithSchema(ageSchema, -1).success).toBe(false);
      expect(validateWithSchema(ageSchema, 121).success).toBe(false);
      expect(validateWithSchema(ageSchema, 25.5).success).toBe(false);
    });
  });

  describe('householdSizeSchema', () => {
    it('should validate household size', () => {
      expect(validateWithSchema(householdSizeSchema, 1).success).toBe(true);
      expect(validateWithSchema(householdSizeSchema, 5).success).toBe(true);
    });

    it('should reject invalid sizes', () => {
      expect(validateWithSchema(householdSizeSchema, 0).success).toBe(false);
      expect(validateWithSchema(householdSizeSchema, 21).success).toBe(false);
    });
  });

  describe('currencySchema', () => {
    it('should validate currency amounts', () => {
      const schema = currencySchema(0, 1000000);
      expect(validateWithSchema(schema, 1000).success).toBe(true);
      expect(validateWithSchema(schema, 0).success).toBe(true);
    });

    it('should reject out of range amounts', () => {
      const schema = currencySchema(0, 1000);
      expect(validateWithSchema(schema, -1).success).toBe(false);
      expect(validateWithSchema(schema, 1001).success).toBe(false);
    });
  });

  describe('birthDateSchema', () => {
    it('should validate past dates', () => {
      const result = validateWithSchema(birthDateSchema, '1990-01-01');
      expect(result.success).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = validateWithSchema(birthDateSchema, futureDate.toISOString().split('T')[0]);
      expect(result.success).toBe(false);
    });
  });

  describe('createSchemaFromQuestion', () => {
    it('should create email schema', () => {
      const schema = createSchemaFromQuestion({
        inputType: 'email',
        required: true,
      });

      const result = schema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should create number schema with constraints', () => {
      const schema = createSchemaFromQuestion({
        inputType: 'number',
        required: true,
        min: 0,
        max: 100,
      });

      expect(schema.safeParse(50).success).toBe(true);
      expect(schema.safeParse(-1).success).toBe(false);
      expect(schema.safeParse(101).success).toBe(false);
    });

    it('should make schema optional if not required', () => {
      const schema = createSchemaFromQuestion({
        inputType: 'text',
        required: false,
      });

      const result = schema.safeParse(undefined);
      expect(result.success).toBe(true);
    });
  });
});

