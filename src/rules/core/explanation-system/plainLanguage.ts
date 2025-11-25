/**
 * Plain Language Generation
 */

import type { EligibilityEvaluationResult } from '../eligibility';
import { formatFieldName } from './formatting';

/**
 * Generate plain language explanation of result
 */
export function generatePlainLanguageExplanation(
  result: EligibilityEvaluationResult,
  reasoning: string[],
  languageLevel: 'simple' | 'standard' | 'technical'
): string {
  const parts: string[] = [];

  // Main status message
  parts.push(getStatusMessage(result, languageLevel));

  // Add reasoning details
  addReasoningDetails(parts, reasoning, languageLevel);

  // Add next steps if eligible
  addNextSteps(parts, result, languageLevel);

  // Add missing information if incomplete
  addMissingInformation(parts, result, languageLevel);

  return parts.join('\n');
}

/**
 * Get status message based on result
 */
function getStatusMessage(
  result: EligibilityEvaluationResult,
  languageLevel: 'simple' | 'standard' | 'technical'
): string {
  if (result.eligible) {
    return languageLevel === 'simple'
      ? 'Good news! You qualify for this program.'
      : 'Based on the information you provided, you appear to be eligible for this benefit program.';
  }

  if (result.incomplete) {
    return languageLevel === 'simple'
      ? 'We need more information to check if you qualify.'
      : 'We need additional information to complete your eligibility evaluation.';
  }

  return languageLevel === 'simple'
    ? 'Unfortunately, you do not qualify for this program right now.'
    : 'Based on the information provided, you do not currently meet the eligibility requirements for this program.';
}

/**
 * Add reasoning details to explanation
 */
function addReasoningDetails(
  parts: string[],
  reasoning: string[],
  languageLevel: 'simple' | 'standard' | 'technical'
): void {
  if (reasoning.length > 0 && languageLevel !== 'simple') {
    parts.push('');
    parts.push(...reasoning);
  }
}

/**
 * Add next steps for eligible results
 */
function addNextSteps(
  parts: string[],
  result: EligibilityEvaluationResult,
  languageLevel: 'simple' | 'standard' | 'technical'
): void {
  if (!result.eligible || !result.nextSteps || result.nextSteps.length === 0) {
    return;
  }

  parts.push('');
  parts.push(
    languageLevel === 'simple'
      ? 'Here\'s what to do next:'
      : 'Recommended next steps:'
  );

  for (const step of result.nextSteps) {
    parts.push(`• ${step.step}`);
  }
}

/**
 * Add missing information for incomplete results
 */
function addMissingInformation(
  parts: string[],
  result: EligibilityEvaluationResult,
  languageLevel: 'simple' | 'standard' | 'technical'
): void {
  if (!result.incomplete || !result.missingFields || result.missingFields.length === 0) {
    return;
  }

  parts.push('');
  parts.push(
    languageLevel === 'simple'
      ? 'We need to know:'
      : 'Please provide the following information:'
  );

  for (const field of result.missingFields) {
    parts.push(`• ${formatFieldName(field)}`);
  }
}
