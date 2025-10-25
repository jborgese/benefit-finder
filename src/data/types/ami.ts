/**
 * Area Median Income (AMI) Data Types
 *
 * Type definitions for HUD Area Median Income data used in housing
 * benefit eligibility calculations.
 */

/**
 * AMI data for a specific household size
 */
export interface AMIAmounts {
  [householdSize: string]: number;
}

/**
 * County AMI data
 */
export interface CountyAMIData {
  ami: AMIAmounts;
}

/**
 * State AMI data structure
 */
export interface StateAMIData {
  year: number;
  state: string;
  counties: Record<string, CountyAMIData>;
}

/**
 * Processed AMI data for eligibility calculations
 */
export interface ProcessedAMIData {
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
 * AMI metadata
 */
export interface AMIMetadata {
  version: string;
  lastUpdated: string;
  source: string;
  description: string;
  availableYears: number[];
  availableStates: string[];
  totalCounties: number;
}

/**
 * AMI cache entry
 */
export interface AMICacheEntry {
  data: ProcessedAMIData;
  timestamp: number;
  ttl: number;
}

/**
 * AMI service configuration
 */
export interface AMIServiceConfig {
  cacheTtl: number;
  maxCacheSize: number;
  enableValidation: boolean;
}
