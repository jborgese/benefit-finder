import { CriterionResult } from '../types/eligibility';
import { getSNAPGrossIncomeLimit, formatIncomeThreshold } from './benefitThresholds';
import { formatFieldName } from './fieldNameMappings';
import { formatComparison, formatCriteriaValue } from './formatCriteriaValues';

/**
 * Handle SNAP income criteria formatting
 */
function formatSNAPIncomeCriteria(
  cr: CriterionResult,
  fieldName: string,
  householdSize: number,
  metSNAPIncome: boolean
): string {
  const snapLimit = getSNAPGrossIncomeLimit(
    Number.isFinite(householdSize) && householdSize > 0 ? householdSize : 1
  );
  const formattedIncome = formatCriteriaValue(cr.value, cr.criterion);
  const formattedLimit = formatIncomeThreshold(snapLimit, 'monthly');
  const peopleText = householdSize === 1 ? 'person' : 'people';

  console.log('[DEBUG] formatCriteriaDetails - SNAP income - metSNAPIncome:', metSNAPIncome, 'formattedIncome:', formattedIncome, 'formattedLimit:', formattedLimit);

  if (metSNAPIncome) {
    return `${fieldName}: ${formattedIncome} (within SNAP limit of ${formattedLimit} for ${householdSize} ${peopleText})`;
  }
  return `${fieldName}: ${formattedIncome} exceeds SNAP limit of ${formattedLimit} for ${householdSize} ${peopleText}`;
}

/**
 * Generate context-aware description for failed criteria
 */
function generateFailedCriteriaDescription(cr: CriterionResult, fieldName: string): string {
  const criterion = cr.criterion.toLowerCase();

  if (criterion.includes('income')) {
    return cr.met
      ? `${fieldName}: Too high for program eligibility`
      : `${fieldName}: Income information processed, but exceeds program limits`;
  }

  if (criterion.includes('household') && criterion.includes('size')) {
    return cr.met
      ? `${fieldName}: Household size contributes to income limit calculation`
      : `${fieldName}: Household size affects your eligibility determination`;
  }

  if (criterion.includes('citizenship') || criterion.includes('immigration')) {
    return cr.met
      ? `${fieldName}: Citizenship verified but other factors affect eligibility`
      : `${fieldName}: Does not meet citizenship requirements`;
  }

  if (criterion.includes('asset') || criterion.includes('resource')) {
    return cr.met
      ? `${fieldName}: Assets within limits`
      : `${fieldName}: Assets exceed program limits`;
  }

  if (criterion.includes('work') || criterion.includes('employment')) {
    return cr.met
      ? `${fieldName}: Work requirements verified`
      : `${fieldName}: Does not meet work requirements`;
  }

  // Generic fallback with more helpful context
  return cr.met
    ? `${fieldName}: Information verified, but other factors prevent qualification`
    : `${fieldName}: Does not meet program requirements`;
}

/**
 * Extract household size from criteria results
 */
function extractHouseholdSize(criteriaResults: Array<CriterionResult>): number {
  const householdSizeCriteria = criteriaResults.find(cr =>
    cr.criterion.toLowerCase().includes('household') &&
    cr.criterion.toLowerCase().includes('size')
  );

  if (!householdSizeCriteria?.value) {
    return 1;
  }

  if (typeof householdSizeCriteria.value === 'number') {
    return householdSizeCriteria.value;
  }
  return Number(householdSizeCriteria.value);
}

/**
 * Extract SNAP income eligibility status
 */
function extractSNAPIncomeStatus(criteriaResults: Array<CriterionResult>): boolean {
  const householdIncomeCriteria = criteriaResults.find(cr =>
    cr.criterion.toLowerCase().includes('income') &&
    !cr.criterion.toLowerCase().includes('size')
  );
  return householdIncomeCriteria?.met ?? false;
}

/**
 * Format a single criterion result
 */
function formatSingleCriterion(
  cr: CriterionResult,
  fieldName: string,
  isEligible: boolean,
  isSNAPProgram: boolean,
  householdSize: number,
  metSNAPIncome: boolean
): string {
  const { criterion, value, threshold, message } = cr;
  const criterionLower = criterion.toLowerCase();
  const isIncomeCriterion = criterionLower.includes('income') && !criterionLower.includes('size');

  // Special handling for SNAP income criteria
  if (isSNAPProgram && isIncomeCriterion) {
    return formatSNAPIncomeCriteria(cr, fieldName, householdSize, metSNAPIncome);
  }

  // If we have specific comparison details, use them
  if (value !== undefined && threshold !== undefined) {
    const comparisonStr = formatComparison(value, threshold, criterion, cr.met, isEligible);
    return `${fieldName}: ${comparisonStr}`;
  }

  // If we have a specific message, use it
  if (message) {
    return `${fieldName}: ${message}`;
  }

  // Enhanced context-aware descriptions based on field type and eligibility
  return isEligible
    ? `${fieldName}: Meets requirements`
    : generateFailedCriteriaDescription(cr, fieldName);
}

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

  const householdSize = extractHouseholdSize(_criteriaResults);
  const metSNAPIncome = extractSNAPIncomeStatus(_criteriaResults);
  const isSNAPProgram = programId?.toLowerCase().includes('snap') ?? false;

  return _criteriaResults.map(cr => {
    const fieldName = formatFieldName(cr.criterion);
    return formatSingleCriterion(cr, fieldName, isEligible, isSNAPProgram, householdSize, metSNAPIncome);
  });
}

