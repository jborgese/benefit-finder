/**
 * Zod Validators for RxDB Collections
 *
 * Runtime validation functions using Zod schemas.
 * Use these to validate data before inserting into RxDB.
 */

import {
  UserProfileZodSchema,
  BenefitProgramZodSchema,
  EligibilityRuleZodSchema,
  EligibilityResultZodSchema,
  AppSettingZodSchema,
  type UserProfile,
  type BenefitProgram,
  type EligibilityRule,
  type EligibilityResult,
  type AppSetting,
} from './schemas';

/**
 * Validate user profile data
 *
 * @param data Data to validate
 * @returns Validated user profile
 * @throws ZodError if validation fails
 */
export function validateUserProfile(data: unknown): UserProfile {
  return UserProfileZodSchema.parse(data);
}

/**
 * Validate user profile data (safe)
 *
 * @param data Data to validate
 * @returns Validation result with success/error
 */
export function validateUserProfileSafe(data: unknown) {
  return UserProfileZodSchema.safeParse(data);
}

/**
 * Validate benefit program data
 *
 * @param data Data to validate
 * @returns Validated benefit program
 * @throws ZodError if validation fails
 */
export function validateBenefitProgram(data: unknown): BenefitProgram {
  return BenefitProgramZodSchema.parse(data);
}

/**
 * Validate benefit program data (safe)
 *
 * @param data Data to validate
 * @returns Validation result with success/error
 */
export function validateBenefitProgramSafe(data: unknown) {
  return BenefitProgramZodSchema.safeParse(data);
}

/**
 * Validate eligibility rule data
 *
 * @param data Data to validate
 * @returns Validated eligibility rule
 * @throws ZodError if validation fails
 */
export function validateEligibilityRule(data: unknown): EligibilityRule {
  return EligibilityRuleZodSchema.parse(data);
}

/**
 * Validate eligibility rule data (safe)
 *
 * @param data Data to validate
 * @returns Validation result with success/error
 */
export function validateEligibilityRuleSafe(data: unknown) {
  return EligibilityRuleZodSchema.safeParse(data);
}

/**
 * Validate eligibility result data
 *
 * @param data Data to validate
 * @returns Validated eligibility result
 * @throws ZodError if validation fails
 */
export function validateEligibilityResult(data: unknown): EligibilityResult {
  return EligibilityResultZodSchema.parse(data);
}

/**
 * Validate eligibility result data (safe)
 *
 * @param data Data to validate
 * @returns Validation result with success/error
 */
export function validateEligibilityResultSafe(data: unknown) {
  return EligibilityResultZodSchema.safeParse(data);
}

/**
 * Validate app setting data
 *
 * @param data Data to validate
 * @returns Validated app setting
 * @throws ZodError if validation fails
 */
export function validateAppSetting(data: unknown): AppSetting {
  return AppSettingZodSchema.parse(data);
}

/**
 * Validate app setting data (safe)
 *
 * @param data Data to validate
 * @returns Validation result with success/error
 */
export function validateAppSettingSafe(data: unknown) {
  return AppSettingZodSchema.safeParse(data);
}

/**
 * Format Zod validation errors for display
 *
 * @param error Zod error object
 * @returns Formatted error message
 */
export function formatZodError(error: any): string {
  if (!error.errors) return String(error);

  return error.errors
    .map((err: any) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    })
    .join(', ');
}

/**
 * Partial validation for updates
 *
 * Creates a partial Zod schema for validating updates
 */
export const PartialUserProfileZodSchema = UserProfileZodSchema.partial().omit({ id: true, createdAt: true });
export const PartialBenefitProgramZodSchema = BenefitProgramZodSchema.partial().omit({ id: true, createdAt: true });
export const PartialEligibilityRuleZodSchema = EligibilityRuleZodSchema.partial().omit({ id: true, createdAt: true });
export const PartialEligibilityResultZodSchema = EligibilityResultZodSchema.partial().omit({ id: true });
export const PartialAppSettingZodSchema = AppSettingZodSchema.partial().omit({ key: true });

