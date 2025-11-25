/**
 * Type definitions for eligibility evaluation
 */

export interface UserProfile {
  // Demographics
  age?: number;
  householdSize?: number;
  citizenship?: string;
  state?: string;

  // Financial
  householdIncome?: number;
  householdAssets?: number;
  allowedDeductions?: number;
  incomePeriod?: 'monthly' | 'annual';

  // Status
  isPregnant?: boolean;
  isStudent?: boolean;
  hasChildren?: boolean;
  hasQualifyingDisability?: boolean;
  receivesSSI?: boolean;

  // Program-specific
  [key: string]: unknown;
}

export interface EvaluationOptions {
  rulePackages: import('../../../rules/core/schema').RulePackage[];
  profile: UserProfile;
  includeNotQualified?: boolean;
}

export interface EvaluationState {
  passedRules: number;
  totalRules: number;
  hasIncomeFailure: boolean;
  rulesCited: string[];
  details: string[];
  calculations: Array<{ label: string; value: string | number; comparison?: string }>;
}

export interface EvaluationData {
  passedRules: number;
  totalRules: number;
  rulesCited: string[];
  details: string[];
  calculations: Array<{ label: string; value: string | number; comparison?: string }>;
  hasIncomeFailure: boolean;
}

export interface StatusData {
  status: import('./types').EligibilityStatus;
  confidence: import('./types').ConfidenceLevel;
  confidenceScore: number;
}

export interface ProgramInfo {
  programName: string;
  programDescription: string;
  jurisdiction: string;
}

export interface Requirements {
  requiredDocuments: import('./types').RequiredDocument[];
  nextSteps: import('./types').NextStep[];
}

export type { EligibilityStatus, ConfidenceLevel, RequiredDocument, NextStep } from '../types';
