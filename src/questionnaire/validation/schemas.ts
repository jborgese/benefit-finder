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

export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code');

/**
 * Number input schemas
 */
export const numberSchema = (min?: number, max?: number) => {
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
export const currencySchema = (min: number = 0, max?: number) => {
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
export const selectSchema = <T extends readonly [string, ...string[]]>(options: T) =>
  z.enum(options, {
    errorMap: () => ({ message: 'Please select a valid option' }),
  });

export const booleanSchema = z.boolean({
  errorMap: () => ({ message: 'Please select an option' }),
});

/**
 * Multi-select input schemas
 */
export const multiSelectSchema = <T extends string>(
  minSelections?: number,
  maxSelections?: number
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type _ = T;
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
export const optionalSchema = <T extends z.ZodTypeAny>(schema: T) => schema.optional();

/**
 * Create schema from question definition
 */
export function createSchemaFromQuestion(question: {
  inputType: string;
  required?: boolean;
  min?: number;
  max?: number;
  validations?: Array<{ type: string; value?: any; message: string }>;
}): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (question.inputType) {
    case 'email':
      schema = emailSchema;
      break;

    case 'phone':
      schema = phoneSchema;
      break;

    case 'number':
      schema = numberSchema(question.min, question.max);
      break;

    case 'currency':
      schema = currencySchema(question.min, question.max);
      break;

    case 'date':
      schema = dateSchema;
      break;

    case 'boolean':
      schema = booleanSchema;
      break;

    case 'multiselect':
      schema = multiSelectSchema();
      break;

    case 'text':
    default:
      schema = textSchema;
      break;
  }

  // Apply custom validations if provided
  if (question.validations) {
    for (const validation of question.validations) {
      if (validation.type === 'min' && typeof validation.value === 'number') {
        if (schema instanceof z.ZodString) {
          schema = schema.min(validation.value, validation.message);
        }
      } else if (validation.type === 'max' && typeof validation.value === 'number') {
        if (schema instanceof z.ZodString) {
          schema = schema.max(validation.value, validation.message);
        }
      } else if (validation.type === 'pattern' && typeof validation.value === 'string') {
        if (schema instanceof z.ZodString) {
          schema = schema.regex(new RegExp(validation.value), validation.message);
        }
      }
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

