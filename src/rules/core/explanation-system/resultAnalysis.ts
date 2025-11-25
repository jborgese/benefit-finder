/**
 * Result Analysis Functions
 */

import type { EligibilityEvaluationResult } from '../eligibility';
import { formatFieldName, formatValue } from './formatting';

/**
 * Analyze eligibility result to extract reasoning and criteria
 */
export function analyzeEligibilityResult(
  result: EligibilityEvaluationResult,
  criteriaChecked: string[]
): {
  reasoning: string[];
  criteriaPassed: string[];
  criteriaFailed: string[];
} {
  const reasoning: string[] = [];
  const criteriaPassed: string[] = [];
  const criteriaFailed: string[] = [];

  if (result.eligible) {
    reasoning.push('You meet all the eligibility requirements for this program.');
    // Process individual criteria for eligible results too
    if (result.criteriaResults) {
      for (const criterion of result.criteriaResults) {
        const fieldDescription = formatFieldName(criterion.criterion);
        criteriaPassed.push(`✓ We verified ${fieldDescription} and you meet this requirement`);
      }
    } else {
      // Fallback for when we don't have detailed criteria results
      for (const criterion of criteriaChecked) {
        const fieldDescription = formatFieldName(criterion);
        criteriaPassed.push(`✓ We verified ${fieldDescription} and you meet this requirement`);
      }
    }
  } else if (result.incomplete) {
    processIncompleteResult(result, reasoning, criteriaFailed);
  } else {
    processIneligibleResult(result, reasoning, criteriaPassed, criteriaFailed);
  }

  return { reasoning, criteriaPassed, criteriaFailed };
}

/**
 * Process incomplete evaluation result
 */
function processIncompleteResult(
  result: EligibilityEvaluationResult,
  reasoning: string[],
  criteriaFailed: string[]
): void {
  reasoning.push('We need more information to determine your eligibility.');

  if (result.missingFields) {
    for (const field of result.missingFields) {
      const fieldDescription = formatFieldName(field);
      reasoning.push(`Please provide information about ${fieldDescription}`);
      criteriaFailed.push(`? We need information about ${fieldDescription} to continue`);
    }
  }
}

/**
 * Process ineligible evaluation result
 */
function processIneligibleResult(
  result: EligibilityEvaluationResult,
  reasoning: string[],
  criteriaPassed: string[],
  criteriaFailed: string[]
): void {
  reasoning.push('Based on the information provided, you do not currently meet the eligibility requirements.');

  if (result.criteriaResults) {
    for (const criterion of result.criteriaResults) {
      const fieldDescription = formatFieldName(criterion.criterion);
      const criterionDescription = criterion.description ?? fieldDescription;

      if (criterion.met) {
        criteriaPassed.push(`✓ We verified ${fieldDescription} and you meet this requirement`);
      } else {
        criteriaFailed.push(`✗ ${criterionDescription} does not meet the program requirements`);
        reasoning.push(`• ${criterionDescription} does not meet the program requirements`);
      }
    }
  }
}

/**
 * Generate suggestions for what would change the result
 */
export function generateChangeSuggestions(result: EligibilityEvaluationResult): string[] {
  const suggestions: string[] = [];

  if (result.missingFields && result.missingFields.length > 0) {
    suggestions.push('Complete your profile by providing the missing information');
  }

  if (result.criteriaResults) {
    for (const criterion of result.criteriaResults) {
      if (!criterion.met && criterion.threshold !== undefined) {
        const fieldDescription = formatFieldName(criterion.criterion);
        const currentValue = formatValue(criterion.value);
        const requiredValue = formatValue(criterion.threshold);

        // Make suggestions more specific based on field type
        if (criterion.criterion.toLowerCase().includes('income')) {
          suggestions.push(`If ${fieldDescription} changes from ${currentValue} to ${requiredValue} or below, you may qualify`);
        } else if (criterion.criterion.toLowerCase().includes('age')) {
          // Age can't be changed, so provide different guidance
          suggestions.push(`This program requires a different age range than your current age of ${currentValue}`);
        } else {
          suggestions.push(`If ${fieldDescription} changes from ${currentValue} to meet the requirement of ${requiredValue}, you may qualify`);
        }
      }
    }
  }

  return suggestions;
}
