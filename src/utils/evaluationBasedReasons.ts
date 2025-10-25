/**
 * Evaluation-Based Reasons Utility
 *
 * Generates specific disqualification reasons based on actual evaluation results
 * and user assessment data, rather than generic profile checks.
 */

import type { EligibilityStatus } from '../components/results/types';
import type { UserProfile } from './specificReasons';

export interface EvaluationResult {
  result: boolean;
  criteriaResults?: Array<{
    criterion: string;
    met: boolean;
    value?: unknown;
    threshold?: unknown;
    comparison?: string;
    message?: string;
  }>;
  calculations?: Array<{
    label: string;
    value: string | number;
    comparison?: string;
  }>;
  rulesCited?: string[];
  details?: string[];
}

export interface EvaluationBasedReason {
  key: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  actionable: boolean;
  suggestion?: string;
}

/**
 * Generate specific reasons based on actual evaluation results
 */
export function generateEvaluationBasedReasons(
  programId: string,
  status: EligibilityStatus,
  evaluationResult: EvaluationResult,
  userProfile?: UserProfile
): EvaluationBasedReason[] {
  // Only generate reasons for not-qualified status
  if (status !== 'not-qualified') {
    return [];
  }

  const reasons: EvaluationBasedReason[] = [];

  // Process all evaluation components
  processCriteriaResults(evaluationResult, programId, userProfile, reasons);
  processCalculations(evaluationResult, programId, userProfile, reasons);
  processRulesCited(evaluationResult, programId, userProfile, reasons);

  // If no specific reasons found, add generic fallback
  if (reasons.length === 0) {
    reasons.push({
      key: 'generic',
      message: 'You may not meet the specific eligibility requirements for this program',
      severity: 'major',
      actionable: false
    });
  }

  return reasons;
}

/**
 * Process criteria results to find specific failures
 */
function processCriteriaResults(
  evaluationResult: EvaluationResult,
  programId: string,
  userProfile: UserProfile | undefined,
  reasons: EvaluationBasedReason[]
): void {
  if (!evaluationResult.criteriaResults) {
    return;
  }

  for (const criterion of evaluationResult.criteriaResults) {
    if (!criterion.met) {
      const reason = generateReasonFromCriterion(criterion, programId, userProfile);
      if (reason) {
        reasons.push(reason);
      }
    }
  }
}

/**
 * Process calculations to find income/asset issues
 */
function processCalculations(
  evaluationResult: EvaluationResult,
  programId: string,
  userProfile: UserProfile | undefined,
  reasons: EvaluationBasedReason[]
): void {
  if (!evaluationResult.calculations) {
    return;
  }

  for (const calc of evaluationResult.calculations) {
    const reason = generateReasonFromCalculation(calc, programId, userProfile);
    if (reason) {
      reasons.push(reason);
    }
  }
}

/**
 * Process rules cited to find specific rule failures
 */
function processRulesCited(
  evaluationResult: EvaluationResult,
  programId: string,
  userProfile: UserProfile | undefined,
  reasons: EvaluationBasedReason[]
): void {
  if (!evaluationResult.rulesCited) {
    return;
  }

  for (const ruleId of evaluationResult.rulesCited) {
    const reason = generateReasonFromRule(ruleId, programId, userProfile);
    if (reason) {
      reasons.push(reason);
    }
  }
}

/**
 * Generate reason from a failed criterion
 */
function generateReasonFromCriterion(
  criterion: { criterion: string; met: boolean; value?: unknown; threshold?: unknown; comparison?: string; message?: string },
  programId: string,
  _userProfile?: UserProfile
): EvaluationBasedReason | null {
  const { criterion: criterionName, value, threshold, comparison, message } = criterion;

  // Income-related criteria
  if (criterionName.toLowerCase().includes('income')) {
    return {
      key: 'income',
      message: generateIncomeReason(value, threshold, comparison, programId),
      severity: 'critical',
      actionable: true,
      suggestion: 'Consider reapplying if your income changes or if you have additional expenses that qualify for deductions'
    };
  }

  // Asset-related criteria
  if (criterionName.toLowerCase().includes('asset')) {
    return {
      key: 'assets',
      message: generateAssetReason(value, threshold, comparison, programId),
      severity: 'critical',
      actionable: true,
      suggestion: 'Some assets may be excluded from eligibility calculations - check with the program office'
    };
  }

  // Age-related criteria
  if (criterionName.toLowerCase().includes('age')) {
    return {
      key: 'age',
      message: generateAgeReason(value, threshold, programId),
      severity: 'critical',
      actionable: false
    };
  }

  // Disability-related criteria
  if (criterionName.toLowerCase().includes('disability')) {
    return {
      key: 'disability',
      message: generateDisabilityReason(programId),
      severity: 'critical',
      actionable: false
    };
  }

  // Citizenship-related criteria
  if (criterionName.toLowerCase().includes('citizenship') || criterionName.toLowerCase().includes('immigration')) {
    return {
      key: 'citizenship',
      message: generateCitizenshipReason(programId),
      severity: 'critical',
      actionable: false
    };
  }

  // Use custom message if available
  if (message) {
    return {
      key: 'custom',
      message,
      severity: 'major',
      actionable: true
    };
  }

  return null;
}

/**
 * Generate reason from calculation results
 */
function generateReasonFromCalculation(
  calc: { label: string; value: string | number; comparison?: string },
  _programId: string,
  _userProfile?: UserProfile
): EvaluationBasedReason | null {
  const { label, value, comparison } = calc;

  // Income calculations
  if (label.toLowerCase().includes('income')) {
    return {
      key: 'income_calculation',
      message: `Your ${label.toLowerCase()} ($${formatNumber(value)}) ${comparison ?? 'exceeds'} the program limit`,
      severity: 'critical',
      actionable: true,
      suggestion: 'Income limits vary by household size and may include deductions for certain expenses'
    };
  }

  // Asset calculations
  if (label.toLowerCase().includes('asset')) {
    return {
      key: 'asset_calculation',
      message: `Your ${label.toLowerCase()} ($${formatNumber(value)}) ${comparison ?? 'exceeds'} the program limit`,
      severity: 'critical',
      actionable: true,
      suggestion: 'Some assets may be excluded from eligibility calculations'
    };
  }

  return null;
}

/**
 * Generate reason from rule ID
 */
function generateReasonFromRule(
  ruleId: string,
  programId: string,
  userProfile?: UserProfile
): EvaluationBasedReason | null {
  // Parse rule ID to understand what failed
  const ruleParts = ruleId.toLowerCase().split('-');

  if (ruleParts.includes('income')) {
    return {
      key: 'income_rule',
      message: generateIncomeRuleReason(programId, userProfile),
      severity: 'critical',
      actionable: true,
      suggestion: 'Income limits vary by household size and may include deductions'
    };
  }

  if (ruleParts.includes('asset')) {
    return {
      key: 'asset_rule',
      message: generateAssetRuleReason(programId, userProfile),
      severity: 'critical',
      actionable: true,
      suggestion: 'Some assets may be excluded from eligibility calculations'
    };
  }

  if (ruleParts.includes('age')) {
    return {
      key: 'age_rule',
      message: generateAgeRuleReason(programId, userProfile),
      severity: 'critical',
      actionable: false
    };
  }

  if (ruleParts.includes('disability')) {
    return {
      key: 'disability_rule',
      message: generateDisabilityRuleReason(programId, userProfile),
      severity: 'critical',
      actionable: false
    };
  }

  return null;
}

/**
 * Generate income-specific reason
 */
function generateIncomeReason(
  value: unknown,
  threshold: unknown,
  comparison: string | undefined,
  programId: string
): string {
  const programName = getProgramDisplayName(programId);
  const userIncome = formatNumber(value);
  const limit = formatNumber(threshold);

  if (comparison === '>') {
    return `Your household income ($${userIncome}) is above the ${programName} income limit ($${limit}). ${programName} has strict income guidelines that vary by household size.`;
  }

  return `Your household income ($${userIncome}) does not meet the ${programName} income requirements ($${limit}).`;
}

/**
 * Generate asset-specific reason
 */
function generateAssetReason(
  value: unknown,
  threshold: unknown,
  comparison: string | undefined,
  programId: string
): string {
  const programName = getProgramDisplayName(programId);
  const userAssets = formatNumber(value);
  const limit = formatNumber(threshold);

  if (comparison === '>') {
    return `Your household assets ($${userAssets}) exceed the ${programName} asset limit ($${limit}). Some assets may be excluded from eligibility calculations.`;
  }

  return `Your household assets ($${userAssets}) do not meet the ${programName} asset requirements ($${limit}).`;
}

/**
 * Generate age-specific reason
 */
function generateAgeReason(
  value: unknown,
  threshold: unknown,
  programId: string
): string {
  const programName = getProgramDisplayName(programId);
  const userAge = value as number;
  const requiredAge = threshold as number;

  if (userAge < requiredAge) {
    return `You are ${userAge} years old, but ${programName} requires applicants to be at least ${requiredAge} years old.`;
  }

  return `Your age (${userAge}) does not meet the ${programName} age requirements.`;
}

/**
 * Generate disability-specific reason
 */
function generateDisabilityReason(programId: string): string {
  const programName = getProgramDisplayName(programId);
  return `You indicated you don't have a qualifying disability. ${programName} requires documented disability status for eligibility.`;
}

/**
 * Generate citizenship-specific reason
 */
function generateCitizenshipReason(programId: string): string {
  const programName = getProgramDisplayName(programId);
  return `You indicated you are not a U.S. citizen or qualified immigrant. ${programName} requires U.S. citizenship or eligible immigration status.`;
}

/**
 * Generate income rule reason
 */
function generateIncomeRuleReason(programId: string, userProfile?: UserProfile): string {
  const programName = getProgramDisplayName(programId);
  const income = userProfile?.householdIncome;

  if (income) {
    return `Your household income ($${formatNumber(income)}) appears to be above the ${programName} income guidelines. Income limits vary by household size and may include deductions for certain expenses.`;
  }

  return `Your household income may be above the ${programName} income guidelines. Income limits vary by household size.`;
}

/**
 * Generate asset rule reason
 */
function generateAssetRuleReason(programId: string, userProfile?: UserProfile): string {
  const programName = getProgramDisplayName(programId);
  const assets = userProfile?.householdAssets;

  if (assets) {
    return `Your household assets ($${formatNumber(assets)}) appear to exceed the ${programName} asset guidelines. Some assets may be excluded from eligibility calculations.`;
  }

  return `Your household assets may exceed the ${programName} asset guidelines. Some assets may be excluded from eligibility calculations.`;
}

/**
 * Generate age rule reason
 */
function generateAgeRuleReason(programId: string, userProfile?: UserProfile): string {
  const programName = getProgramDisplayName(programId);
  const age = userProfile?.age;

  if (age) {
    return `Your age (${age}) may not meet the ${programName} age requirements. Age requirements vary by program and may have exceptions.`;
  }

  return `You may not meet the ${programName} age requirements. Age requirements vary by program.`;
}

/**
 * Generate disability rule reason
 */
function generateDisabilityRuleReason(programId: string, _userProfile?: UserProfile): string {
  const programName = getProgramDisplayName(programId);
  return `You indicated you don't have a qualifying disability. ${programName} requires documented disability status for eligibility.`;
}

/**
 * Get program display name
 */
function getProgramDisplayName(programId: string): string {
  // Use a switch statement to avoid object injection warnings
  switch (programId) {
    case 'wic-federal':
      return 'WIC';
    case 'medicaid-federal':
      return 'Medicaid';
    case 'snap-federal':
      return 'SNAP';
    case 'tanf-federal':
      return 'TANF';
    case 'ssi-federal':
      return 'SSI';
    case 'section8-federal':
      return 'Section 8';
    case 'lihtc-federal':
      return 'LIHTC';
    default:
      return programId;
  }
}

/**
 * Format number for display
 */
function formatNumber(value: unknown): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num.toLocaleString();
    }
  }
  return String(value);
}
