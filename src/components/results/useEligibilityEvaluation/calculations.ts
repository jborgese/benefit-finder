/**
 * Calculation generators for eligibility evaluation
 */

import type { UserProfile } from './types';

/**
 * Calculate SNAP income threshold for household size
 */
export function calculateSnapIncomeThreshold(householdSize: number): number {
  const snapIncomeLimits: Record<number, number> = {
    1: 1696, 2: 2292, 3: 2888, 4: 3483,
    5: 4079, 6: 4675, 7: 5271, 8: 5867
  };

  return householdSize <= 8
    ? snapIncomeLimits[householdSize]
    : snapIncomeLimits[8] + (596 * (householdSize - 8));
}

/**
 * Generate SNAP income calculation details
 */
export function generateSnapIncomeCalculation(profile: UserProfile): { label: string; value: string; comparison: string } | null {
  const { householdIncome, householdSize } = profile;
  if (householdIncome === undefined || householdSize === undefined) return null;

  const threshold = calculateSnapIncomeThreshold(householdSize);
  const meetsThreshold = householdIncome <= threshold;

  if (import.meta.env.DEV) {
    console.warn(`🔍 [DEBUG] SNAP Calculation Display:`, {
      householdIncome, householdSize, threshold, meetsThreshold
    });
  }

  return {
    label: 'Monthly income limit (130% of poverty)',
    value: `$${threshold.toLocaleString()}`,
    comparison: `Your income: $${householdIncome.toLocaleString()}/month (${meetsThreshold ? 'qualifies' : 'exceeds limit'})`
  };
}

/**
 * Generate household size calculation details
 */
export function generateHouseholdCalculation(profile: UserProfile): { label: string; value: number; comparison: string } | null {
  const { householdSize } = profile;
  if (householdSize === undefined) return null;

  return {
    label: 'Household size',
    value: householdSize,
    comparison: `${householdSize} ${householdSize === 1 ? 'person' : 'people'}`
  };
}

/**
 * Generate citizenship calculation details
 */
export function generateCitizenshipCalculation(profile: UserProfile): { label: string; value: string; comparison: string } | null {
  const { citizenship } = profile;
  if (!citizenship) return null;

  const citizenshipMap: Record<string, string> = {
    'us_citizen': 'U.S. Citizen',
    'permanent_resident': 'Permanent Resident',
    'refugee': 'Refugee',
    'asylee': 'Asylee'
  };

  return {
    label: 'Citizenship status',
    value: citizenshipMap[citizenship] || citizenship,
    comparison: 'Meets program requirements'
  };
}

/**
 * Generate age calculation details
 */
export function generateAgeCalculation(profile: UserProfile): { label: string; value: number; comparison: string } | null {
  const { age } = profile;
  if (age === undefined) return null;

  return {
    label: 'Age',
    value: age,
    comparison: `${age} years old`
  };
}

/**
 * Generate calculation details for specific rule types
 */
export function generateRuleCalculation(
  rule: import('../../../rules/core/schema').RuleDefinition,
  profile: UserProfile
): { label: string; value: string | number; comparison?: string } | null {
  if (rule.id.includes('snap') && rule.id.includes('income')) {
    return generateSnapIncomeCalculation(profile);
  }
  if (rule.id.includes('household')) {
    return generateHouseholdCalculation(profile);
  }
  if (rule.id.includes('citizenship')) {
    return generateCitizenshipCalculation(profile);
  }
  if (rule.id.includes('age')) {
    return generateAgeCalculation(profile);
  }
  return null;
}
