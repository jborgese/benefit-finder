import { getSNAPGrossIncomeLimit } from './benefitThresholds';
import { formatFieldName } from './fieldNameMappings';
import { formatComparison } from './formatCriteriaValues';

/**
 * Format criteria results into user-friendly explanations
 * Shows meaningful details for both passing and failing criteria
 */
export function formatCriteriaDetails(
  criteriaResults: Array<{
    criterion: string;
    met: boolean;
    value?: unknown;
    threshold?: unknown;
    comparison?: string;
    message?: string;
  }> | undefined,
  isEligible: boolean
): string[] {
  if (!criteriaResults || criteriaResults.length === 0) {
    return [];
  }
  console.log('[DEBUG] criteriaResults', criteriaResults);

  return criteriaResults.map(cr => {
    const fieldName = formatFieldName(cr.criterion);
    console.log('[DEBUG] fieldName', fieldName);

    // If we have specific comparison details, use them
    const comparison = cr.comparison;
    console.log('[DEBUG] comparison', comparison);

    const value = cr.value;
    console.log('[DEBUG] value', value);

    if (fieldName.includes('household') && fieldName.includes('size')) {
      // Only use householdSize as a number for SNAP income limit lookup, fallback to 1 if invalid
      const householdSize = typeof value === 'number' ? value : Number(value);
      const grossIncomeLimit = getSNAPGrossIncomeLimit(
        Number.isFinite(householdSize) && householdSize > 0 ? householdSize : 1
      );
      console.log('[DEBUG] grossIncomeLimit', grossIncomeLimit);
    }
    if (cr.value !== undefined && cr.threshold !== undefined) {
      console.log('[DEBUG] cr.value', cr.value);
      console.log('[DEBUG] cr.threshold', cr.threshold);
      const comparisonStr = formatComparison(
        cr.value,
        cr.threshold,
        cr.criterion,
        cr.met,
        isEligible
      );
      console.log('[DEBUG] comparisonStr', comparisonStr);
      return `${fieldName}: ${comparisonStr}`;
    }

    // If we have a specific message, use it
    if (cr.message) {
      return `${fieldName}: ${cr.message}`;
    }

    // Enhanced context-aware descriptions based on field type and eligibility
    if (isEligible) {
      return `${fieldName}: Meets requirements`;
    } else {
      // For failed cases, provide more specific guidance based on field name
      const criterion = cr.criterion.toLowerCase();

      if (criterion.includes('income')) {
        if (cr.met) {
          return `${fieldName}: Too high for program eligibility`;
        } else {
          return `${fieldName}: Income information processed, but exceeds program limits`;
        }
      } else if (criterion.includes('household') && criterion.includes('size')) {
        if (cr.met) {
          return `${fieldName}: Household size contributes to income limit calculation`;
        } else {
          return `${fieldName}: Household size affects your eligibility determination`;
        }
      } else if (criterion.includes('citizenship') || criterion.includes('immigration')) {
        if (cr.met) {
          return `${fieldName}: Citizenship verified but other factors affect eligibility`;
        } else {
          return `${fieldName}: Does not meet citizenship requirements`;
        }
      } else if (criterion.includes('asset') || criterion.includes('resource')) {
        if (cr.met) {
          return `${fieldName}: Assets within limits`;
        } else {
          return `${fieldName}: Assets exceed program limits`;
        }
      } else if (criterion.includes('work') || criterion.includes('employment')) {
        if (cr.met) {
          return `${fieldName}: Work requirements verified`;
        } else {
          return `${fieldName}: Does not meet work requirements`;
        }
      } else {
        // Generic fallback with more helpful context
        if (cr.met) {
          return `${fieldName}: Information verified, but other factors prevent qualification`;
        } else {
          return `${fieldName}: Does not meet program requirements`;
        }
      }
    }
  });
}

