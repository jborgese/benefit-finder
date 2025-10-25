/**
 * Housing-Specific Types
 *
 * Types for housing programs including LIHTC (Low-Income Housing Tax Credit)
 * and other housing assistance programs.
 */

import type { HouseholdProfile } from './household';

/**
 * Student Status for Housing Programs
 */
export type StudentStatus =
  | 'none'
  | 'single_parent'
  | 'married_student'
  | 'full_time_student';

/**
 * Unit Size Options
 */
export type UnitSize = 'studio' | '1br' | '2br' | '3br' | '4br';

/**
 * Housing History Types
 */
export type HousingHistoryType =
  | 'market_rate'
  | 'subsidized'
  | 'public_housing'
  | 'lihtc'
  | 'section8'
  | 'other';

/**
 * Area Median Income (AMI) Data
 */
export interface AMIData {
  state: string;
  county: string;
  year: number;
  householdSize: number;
  amiAmount: number;
  incomeLimit50: number;
  incomeLimit60: number;
  incomeLimit80: number;
  lastUpdated: number;
}

/**
 * LIHTC-Specific Profile Extension
 */
export interface LIHTCProfile extends HouseholdProfile {
  // Student status information
  studentStatus?: StudentStatus;
  studentHouseholdMembers?: number;

  // Housing preferences
  preferredUnitSize?: UnitSize;
  maxRentAffordable?: number;

  // Housing history
  hasLivedInSubsidizedHousing?: boolean;
  previousHousingType?: HousingHistoryType;

  // Income sources breakdown for LIHTC
  incomeSources?: {
    wages?: number;
    benefits?: number;
    childSupport?: number;
    other?: number;
  };

  // AMI calculations (computed)
  amiData?: AMIData;
}

/**
 * LIHTC Unit Information
 */
export interface LIHTCUnit {
  id: string;
  propertyName: string;
  address: string;
  unitSize: UnitSize;
  maxOccupancy: number;
  rentAmount: number;
  incomeLimit: number;
  available: boolean;
  waitingListPosition?: number;
}

/**
 * LIHTC Property Information
 */
export interface LIHTCProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  totalUnits: number;
  availableUnits: number;
  units: LIHTCUnit[];
  propertyManager: {
    name: string;
    phone: string;
    email: string;
  };
  applicationUrl?: string;
  lastUpdated: number;
}

/**
 * LIHTC Eligibility Result
 */
export interface LIHTCEligibilityResult {
  eligible: boolean;
  reasons: string[];
  incomeEligible: boolean;
  studentEligible: boolean;
  unitSizeEligible: boolean;
  rentAffordable: boolean;
  amiPercentage: number;
  maxAffordableRent: number;
  recommendedUnitSizes: UnitSize[];
  nextSteps: string[];
}

/**
 * Housing Program Categories
 */
export type HousingProgramCategory =
  | 'lihtc'
  | 'section8'
  | 'public_housing'
  | 'affordable_housing'
  | 'senior_housing'
  | 'disability_housing';

/**
 * Housing Program Information
 */
export interface HousingProgram {
  id: string;
  name: string;
  category: HousingProgramCategory;
  description: string;
  eligibilityRequirements: string[];
  applicationProcess: string[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  jurisdiction: {
    level: 'federal' | 'state' | 'county' | 'city';
    state?: string;
    county?: string;
    city?: string;
  };
  active: boolean;
  lastUpdated: number;
}
