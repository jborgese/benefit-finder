import { CriterionResult } from '@/types/eligibility';
import { getSNAPGrossIncomeLimit, formatIncomeThreshold } from './benefitThresholds';
import { formatFieldName } from './fieldNameMappings';
import { formatComparison, formatCriteriaValue } from './formatCriteriaValues';

/**
 * Format criteria results into user-friendly explanations
 * Shows meaningful details for both passing and failing criteria
 *
 * @param _criteriaResults Array of criteria evaluation results
 * @param isEligible Overall eligibility status
 * @param programId Optional program identifier to show program-specific thresholds
 */
export function formatCriteriaDetails(
  _criteriaResults: Array<CriterionResult> | undefined,
  isEligible: boolean,
  programId?: string
): string[] {
  if (!_criteriaResults || _criteriaResults.length === 0) {
    return [];
  }
  console.log('[DEBUG] formatCriteriaDetails - criteriaResults', _criteriaResults);
  console.log('[DEBUG] formatCriteriaDetails - programId', programId);

  // Extract household size for benefit threshold calculations
  const householdSizeCriteria = _criteriaResults.find(cr =>
    cr.criterion.toLowerCase().includes('household') &&
    cr.criterion.toLowerCase().includes('size')
  );
  const householdSize = householdSizeCriteria?.value
    ? (typeof householdSizeCriteria.value === 'number'
        ? householdSizeCriteria.value
        : Number(householdSizeCriteria.value))
    : 1;

  // Extract SNAP income eligibility status for SNAP evaluations
  const householdIncomeCriteria = _criteriaResults.find(cr =>
    cr.criterion.toLowerCase().includes('income') &&
    !cr.criterion.toLowerCase().includes('size')
  );
  const metSNAPIncome = householdIncomeCriteria?.met ?? false;

  // Determine if this is a SNAP evaluation
  const isSNAPProgram = programId?.toLowerCase().includes('snap');

  return _criteriaResults.map(cr => {
    const fieldName = formatFieldName(cr.criterion);
    const value = cr.value;

    // Special handling for SNAP income criteria - CHECK THIS FIRST
    // Only apply SNAP logic to actual income criteria, not household size
    const criterionLower = cr.criterion.toLowerCase();
    const isIncomeCriterion = criterionLower.includes('income') && !criterionLower.includes('size');

    if (isSNAPProgram && isIncomeCriterion) {
      const snapLimit = getSNAPGrossIncomeLimit(
        Number.isFinite(householdSize) && householdSize > 0 ? householdSize : 1
      );
      const formattedIncome = formatCriteriaValue(value, cr.criterion);
      const formattedLimit = formatIncomeThreshold(snapLimit, 'monthly');

      console.log('[DEBUG] formatCriteriaDetails - SNAP income - metSNAPIncome:', metSNAPIncome, 'formattedIncome:', formattedIncome, 'formattedLimit:', formattedLimit);

      if (metSNAPIncome) {
        return `${fieldName}: ${formattedIncome} (within SNAP limit of ${formattedLimit} for ${householdSize} ${householdSize === 1 ? 'person' : 'people'})`;
      } else {
        return `${fieldName}: ${formattedIncome} exceeds SNAP limit of ${formattedLimit} for ${householdSize} ${householdSize === 1 ? 'person' : 'people'}`;
      }
    }

    // If we have specific comparison details, use them

    if (cr.value !== undefined && cr.threshold !== undefined) {
      const comparisonStr = formatComparison(
        cr.value,
        cr.threshold,
        cr.criterion,
        cr.met,
        isEligible
      );
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

