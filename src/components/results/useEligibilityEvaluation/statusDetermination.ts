/**
 * Status determination and reason text generation
 */

import type { EligibilityStatus } from '../types';
import type { StatusData } from './types';

/**
 * Determines eligibility status based on pass rate and income failures
 */
export function determineStatus(passedRules: number, totalRules: number, hasIncomeFailure: boolean): StatusData {
  // Income failure is a hard stop - immediate disqualification
  if (hasIncomeFailure) {
    return { status: 'not-qualified', confidence: 'high', confidenceScore: 95 };
  }

  const passRate = totalRules > 0 ? passedRules / totalRules : 0;

  if (passRate >= 1.0) {
    return { status: 'qualified', confidence: 'high', confidenceScore: 95 };
  } else if (passRate >= 0.8) {
    return { status: 'likely', confidence: 'medium', confidenceScore: 75 };
  } else if (passRate >= 0.5) {
    return { status: 'maybe', confidence: 'medium', confidenceScore: 60 };
  } else if (passRate >= 0.3) {
    return { status: 'unlikely', confidence: 'low', confidenceScore: 40 };
  } else {
    return { status: 'not-qualified', confidence: 'high', confidenceScore: 90 };
  }
}

/**
 * Generate reason text based on status
 */
export function getReasonText(status: EligibilityStatus, passed: number, total: number): string {
  switch (status) {
    case 'qualified':
      return `You meet all ${total} eligibility requirements for this program.`;
    case 'likely':
      return `You meet ${passed} of ${total} eligibility requirements. You likely qualify for this program.`;
    case 'maybe':
      return `You meet ${passed} of ${total} requirements. Additional verification may be needed.`;
    case 'unlikely':
      return `You meet only ${passed} of ${total} requirements. It's unlikely you qualify.`;
    case 'not-qualified':
      return `You do not meet the eligibility requirements for this program at this time.`;
    default:
      return 'Eligibility could not be determined.';
  }
}
