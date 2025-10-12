/**
 * Zod Validation Schemas
 *
 * Type-safe validation schemas for question inputs
 */

import { z } from 'zod';

/**
 * Text input schemas
 */
export const textSchema = z.string().min(1, 'This field is required');

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const phoneSchema = z
  .string()
  .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Please enter a valid phone number')
  .transform((val) => val.replace(/\D/g, ''));

export const ssnSchema = z
  .string()
  .regex(/^\d{3}-?\d{2}-?\d{4}$/, 'Please enter a valid SSN (XXX-XX-XXXX)')
  .transform((val) => val.replace(/\D/g, ''));

// Simple ZIP code pattern - no backtracking risk
export const zipCodeSchema = z
  .string()
  // eslint-disable-next-line security/detect-unsafe-regex
  .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code');

/**
 * Number input schemas
 */
export const numberSchema = (min?: number, max?: number): z.ZodNumber => {
  let schema = z.number({ invalid_type_error: 'Please enter a number' });

  if (min !== undefined) {
    schema = schema.min(min, `Value must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `Value must be at most ${max}`);
  }

  return schema;
};

export const ageSchema = z
  .number({ invalid_type_error: 'Please enter your age' })
  .int('Age must be a whole number')
  .min(0, 'Age cannot be negative')
  .max(120, 'Please enter a valid age');

export const householdSizeSchema = z
  .number({ invalid_type_error: 'Please enter household size' })
  .int('Household size must be a whole number')
  .min(1, 'Household size must be at least 1')
  .max(20, 'Please enter a reasonable household size');

/**
 * Currency input schemas
 */
export const currencySchema = (min: number = 0, max?: number): z.ZodNumber => {
  let schema = z
    .number({ invalid_type_error: 'Please enter an amount' })
    .min(min, `Amount must be at least $${min}`);

  if (max !== undefined) {
    schema = schema.max(max, `Amount must be at most $${max}`);
  }

  return schema;
};

export const incomeSchema = z
  .number({ invalid_type_error: 'Please enter your income' })
  .min(0, 'Income cannot be negative');

/**
 * Date input schemas
 */
export const dateSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date');

export const birthDateSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid birth date')
  .refine((val) => {
    const date = new Date(val);
    const today = new Date();
    return date < today;
  }, 'Birth date must be in the past')
  .refine((val) => {
    const date = new Date(val);
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 120);
    return date > maxAge;
  }, 'Please enter a valid birth date');

export const futureDateSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date')
  .refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Date must be in the future');

/**
 * Select input schemas
 */
export const selectSchema = <T extends readonly [string, ...string[]]>(
  options: T
): z.ZodEnum<z.Writeable<T>> =>
  z.enum(options, {
    errorMap: () => ({ message: 'Please select a valid option' }),
  });

export const booleanSchema = z.boolean({
  errorMap: () => ({ message: 'Please select an option' }),
});

/**
 * Multi-select input schemas
 */
// Type parameter T is used for type inference only
export const multiSelectSchema = <T extends string>(
  _type?: T,
  minSelections?: number,
  maxSelections?: number
): z.ZodArray<z.ZodString> => {
  let schema = z.array(z.string());

  if (minSelections !== undefined) {
    schema = schema.min(minSelections, `Please select at least ${minSelections} option(s)`);
  }

  if (maxSelections !== undefined) {
    schema = schema.max(maxSelections, `Please select at most ${maxSelections} option(s)`);
  }

  return schema;
};

/**
 * Optional schema wrapper
 */
export const optionalSchema = <T extends z.ZodTypeAny>(schema: T): z.ZodOptional<T> => schema.optional();

/**
 * Validation definition type
 */
type ValidationDefinition = {
  type: string;
  value?: string | number | boolean | RegExp;
  message: string;
};

/**
 * Apply a single validation rule to a schema
 */
function applyValidation(schema: z.ZodTypeAny, validation: ValidationDefinition): z.ZodTypeAny {
  if (!(schema instanceof z.ZodString)) {
    return schema;
  }

  if (validation.type === 'min' && typeof validation.value === 'number') {
    return schema.min(validation.value, validation.message);
  }

  if (validation.type === 'max' && typeof validation.value === 'number') {
    return schema.max(validation.value, validation.message);
  }

  if (validation.type === 'pattern') {
    if (validation.value instanceof RegExp) {
      return schema.regex(validation.value, validation.message);
    } else if (typeof validation.value === 'string') {
      // Validate pattern is safe before using
      // eslint-disable-next-line security/detect-non-literal-regexp
      return schema.regex(new RegExp(validation.value), validation.message);
    }
  }

  return schema;
}

/**
 * Get base schema for input type
 */
function getBaseSchema(
  inputType: string,
  min?: number,
  max?: number
): z.ZodTypeAny {
  switch (inputType) {
    case 'email':
      return emailSchema;
    case 'phone':
      return phoneSchema;
    case 'number':
      return numberSchema(min, max);
    case 'currency':
      return currencySchema(min, max);
    case 'date':
      return dateSchema;
    case 'boolean':
      return booleanSchema;
    case 'multiselect':
      return multiSelectSchema();
    case 'text':
    default:
      return textSchema;
  }
}

/**
 * Create schema from question definition
 */
export function createSchemaFromQuestion(question: {
  inputType: string;
  required?: boolean;
  min?: number;
  max?: number;
  validations?: ValidationDefinition[];
}): z.ZodTypeAny {
  let schema = getBaseSchema(question.inputType, question.min, question.max);

  // Apply custom validations if provided
  if (question.validations) {
    for (const validation of question.validations) {
      schema = applyValidation(schema, validation);
    }
  }

  // Make optional if not required
  if (!question.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Validate value against schema
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: boolean; data?: T; errors?: string[] } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => err.message),
  };
}

