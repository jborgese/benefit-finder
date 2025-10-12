/**
 * Household Profile Types
 *
 * Types for household and personal information.
 * All sensitive data in these types should be encrypted at rest.
 */

import type { UserProfile as DbUserProfile } from '../db/schemas';

/**
 * Citizenship Status
 */
export type CitizenshipStatus =
  | 'us_citizen'
  | 'permanent_resident'
  | 'refugee'
  | 'asylee'
  | 'other';

/**
 * Employment Status
 */
export type EmploymentStatus =
  | 'employed'
  | 'unemployed'
  | 'self_employed'
  | 'retired'
  | 'disabled'
  | 'student';

/**
 * Household Member
 *
 * Information about an individual household member.
 */
export interface HouseholdMember {
  id: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  age: number;
  hasDisability?: boolean;
  isStudent?: boolean;
  income?: number;
}

/**
 * Address
 *
 * Physical address information.
 */
export interface Address {
  street1?: string;
  street2?: string;
  city?: string;
  state: string; // 2-letter state code
  zipCode: string; // 5 or 9-digit ZIP
  county?: string;
}

/**
 * Contact Information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  preferredContactMethod?: 'email' | 'phone' | 'mail' | 'none';
}

/**
 * Household Profile
 *
 * Complete household information for eligibility determination.
 * This is the main interface for user/household data.
 *
 * Extends the database UserProfile type with additional
 * computed fields and helper methods.
 */
export interface HouseholdProfile extends Omit<DbUserProfile, 'citizenship' | 'employmentStatus'> {
  // Override with specific enum types
  citizenship?: CitizenshipStatus;
  employmentStatus?: EmploymentStatus;

  // Extended fields (not in database)
  members?: HouseholdMember[];
  address?: Address;
  contact?: ContactInfo;

  // Computed fields
  age?: number; // Calculated from dateOfBirth
  fullName?: string; // Computed from firstName + lastName

  // Questionnaire metadata
  completionPercentage?: number;
  lastQuestionnaireDate?: number;
}

/**
 * Household Income Details
 *
 * Breakdown of household income sources.
 */
export interface IncomeDetails {
  employment?: number;
  selfEmployment?: number;
  socialSecurity?: number;
  disability?: number;
  pension?: number;
  childSupport?: number;
  alimony?: number;
  unemployment?: number;
  other?: number;
  total: number;
}

/**
 * Asset Information
 *
 * Household assets (some programs have asset limits).
 */
export interface AssetInfo {
  bankAccounts?: number;
  retirement?: number;
  property?: number;
  vehicles?: number;
  other?: number;
  total: number;
}

/**
 * Expense Information
 *
 * Monthly household expenses (for some calculations).
 */
export interface ExpenseInfo {
  rent?: number;
  mortgage?: number;
  utilities?: number;
  childcare?: number;
  medicalExpenses?: number;
  other?: number;
  total: number;
}

/**
 * Extended Household Profile
 *
 * Complete household profile with income, assets, and expenses.
 */
export interface ExtendedHouseholdProfile extends HouseholdProfile {
  income?: IncomeDetails;
  assets?: AssetInfo;
  expenses?: ExpenseInfo;
}

/**
 * Profile Validation Error
 */
export interface ProfileValidationError {
  field: keyof HouseholdProfile;
  message: string;
  severity: 'error' | 'warning';
}

