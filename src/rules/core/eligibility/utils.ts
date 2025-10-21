/**
 * Eligibility Utilities
 *
 * Utility functions for eligibility evaluation including field mappings,
 * formatting, and criteria breakdown generation.
 */

import type { EligibilityRuleDocument } from '../../../db/schemas';
import type { JsonLogicData, RuleEvaluationResult } from '../types';
import type { CriteriaBreakdownItem, FieldNameMapping } from './types';

// Global debug log utility
function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Eligibility Utils Debug]', ...args);
  }
}

/**
 * Maps technical field names to user-friendly descriptions
 */
export const FIELD_NAME_MAPPINGS: FieldNameMapping = {
  'age': 'Your age',
  'isPregnant': 'Pregnancy status',
  'hasChildren': 'Whether you have children',
  'hasQualifyingDisability': 'Qualifying disability status',
  'isCitizen': 'Citizenship status',
  'isLegalResident': 'Legal residency status',
  'ssn': 'Social Security number',
  'householdIncome': 'Your household\'s monthly income',
  'householdSize': 'Your household size',
  'income': 'Your income',
  'grossIncome': 'your gross income',
  'netIncome': 'your net income',
  'monthlyIncome': 'your monthly income',
  'annualIncome': 'your annual income',
  'assets': 'your household assets',
  'resources': 'your available resources',
  'liquidAssets': 'your liquid assets',
  'vehicleValue': 'your vehicle value',
  'bankBalance': 'your bank account balance',
  'state': 'your state of residence',
  'stateHasExpanded': 'whether your state has expanded coverage',
  'zipCode': 'your ZIP code',
  'county': 'your county',
  'jurisdiction': 'your location',
  'hasHealthInsurance': 'current health insurance coverage',
  'employmentStatus': 'your employment status',
  'isStudent': 'student status',
  'isVeteran': 'veteran status',
  'isSenior': 'senior status (65+)',
  'hasMinorChildren': 'whether you have children under 18',
  'housingCosts': 'your housing costs',
  'rentAmount': 'your monthly rent',
  'mortgageAmount': 'your monthly mortgage',
  'isHomeless': 'housing situation',
  'receivesSSI': 'Supplemental Security Income (SSI)',
  'receivesSNAP': 'SNAP benefits',
  'receivesTANF': 'TANF benefits',
  'receivesWIC': 'WIC benefits',
  'receivesUnemployment': 'unemployment benefits',
  'livesInState': 'state residency',
};

/**
 * Format field name to human-readable description
 */
export function formatFieldName(fieldName: string): string {
  debugLog('Formatting field name', fieldName);
  if (Object.prototype.hasOwnProperty.call(FIELD_NAME_MAPPINGS, fieldName)) {
    debugLog('Field mapping found', fieldName, FIELD_NAME_MAPPINGS[fieldName]);
    return FIELD_NAME_MAPPINGS[fieldName];
  }
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Generate detailed criteria breakdown
 */
export function generateCriteriaBreakdown(
  rule: EligibilityRuleDocument | { requiredFields?: string[] },
  data: JsonLogicData,
  _evalResult: RuleEvaluationResult
): CriteriaBreakdownItem[] {
  debugLog('Generating criteria breakdown', { rule, data });
  const breakdown: CriteriaBreakdownItem[] = [];

  if (rule.requiredFields) {
    for (const field of rule.requiredFields) {
      const fieldValue = data[field];
      const fieldDescription = formatFieldName(field);
      const hasValue = fieldValue !== undefined && fieldValue !== null;

      let criterionMet = hasValue;
      let status = hasValue ? 'Met' : 'Not provided';

      if (!hasValue) {
        debugLog('Field not provided in breakdown', field);
        continue;
      } else if (typeof fieldValue === 'boolean') {
        criterionMet = fieldValue === true;
        status = fieldValue === true ? 'Met' : 'Not applicable';
      }

      debugLog('Adding to breakdown', { field, criterionMet, fieldValue, status });

      breakdown.push({
        criterion: field,
        met: criterionMet,
        value: fieldValue,
        description: `${fieldDescription}: ${status}`,
      });
    }
  }

  debugLog('Criteria breakdown generated', breakdown);
  return breakdown;
}
