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
 * Criterion type handlers for generating descriptions
 */
const criterionHandlers = {
  income: (fieldName: string, met: boolean) =>
    met
      ? `${fieldName}: Too high for program eligibility`
      : `${fieldName}: Income information processed, but exceeds program limits`,

  householdSize: (fieldName: string, met: boolean) =>
    met
      ? `${fieldName}: Household size contributes to income limit calculation`
      : `${fieldName}: Household size affects your eligibility determination`,

  citizenship: (fieldName: string, met: boolean) =>
    met
      ? `${fieldName}: Citizenship verified but other factors affect eligibility`
      : `${fieldName}: Does not meet citizenship requirements`,

  asset: (fieldName: string, met: boolean) =>
    met
      ? `${fieldName}: Assets within limits`
      : `${fieldName}: Assets exceed program limits`,

  work: (fieldName: string, met: boolean) =>
    met
      ? `${fieldName}: Work requirements verified`
      : `${fieldName}: Does not meet work requirements`,

  default: (fieldName: string, met: boolean) =>
    met
      ? `${fieldName}: Information verified, but other factors prevent qualification`
      : `${fieldName}: Does not meet program requirements`
};

/**
 * Determine criterion type from criterion name
 */
function getCriterionType(criterion: string): keyof typeof criterionHandlers {
  const lowerCriterion = criterion.toLowerCase();

  if (lowerCriterion.includes('income')) return 'income';
  if (lowerCriterion.includes('household') && lowerCriterion.includes('size')) return 'householdSize';
  if (lowerCriterion.includes('citizenship') || lowerCriterion.includes('immigration')) return 'citizenship';
  if (lowerCriterion.includes('asset') || lowerCriterion.includes('resource')) return 'asset';
  if (lowerCriterion.includes('work') || lowerCriterion.includes('employment')) return 'work';

  return 'default';
}

/**
 * Generate context-aware description for failed criteria
 */
function generateFailedCriteriaDescription(cr: CriterionResult, fieldName: string): string {
  const criterionType = getCriterionType(cr.criterion);
  let handler = criterionHandlers.default;
  if (Object.prototype.hasOwnProperty.call(criterionHandlers, criterionType)) {
    handler = criterionHandlers[criterionType];
  }
  return handler(fieldName, cr.met);
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
 * Determine formatting strategy for a criterion
 */
function determineFormattingStrategy(
  cr: CriterionResult,
  isSNAPProgram: boolean
): 'snap_income' | 'comparison' | 'message' | 'context' {
  const criterionLower = cr.criterion.toLowerCase();
  const isIncomeCriterion = criterionLower.includes('income') && !criterionLower.includes('size');

  if (isSNAPProgram && isIncomeCriterion) {
    return 'snap_income';
  }

  if (cr.value !== undefined && cr.threshold !== undefined) {
    return 'comparison';
  }

  if (cr.message) {
    return 'message';
  }

  return 'context';
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
  const strategy = determineFormattingStrategy(cr, isSNAPProgram);

  switch (strategy) {
    case 'snap_income':
      return formatSNAPIncomeCriteria(cr, fieldName, householdSize, metSNAPIncome);

    case 'comparison': {
      const comparisonStr = formatComparison(cr.value, cr.threshold, cr.criterion, cr.met, isEligible);
      return `${fieldName}: ${comparisonStr}`;
    }

    case 'message':
      return `${fieldName}: ${cr.message}`;

    case 'context':
      return isEligible
        ? `${fieldName}: Meets requirements`
        : generateFailedCriteriaDescription(cr, fieldName);
  }
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

