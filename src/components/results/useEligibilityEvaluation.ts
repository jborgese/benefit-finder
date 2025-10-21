/**
 * useEligibilityEvaluation Hook
 *
 * Evaluates user eligibility across programs using rule system
 */

import { useState, useMemo } from 'react';
import type { RulePackage, RuleDefinition } from '../../rules/core/schema';
import { evaluateRuleSync, registerBenefitOperators, unregisterBenefitOperators } from '../../rules/core/evaluator';
import type { JsonLogicRule } from '../../rules/core/types';
import type {
  EligibilityResults,
  ProgramEligibilityResult,
  EligibilityStatus,
  ConfidenceLevel,
  RequiredDocument,
  NextStep,
} from './types';

interface UserProfile {
  // Demographics
  age?: number;
  householdSize?: number;
  citizenship?: string;
  state?: string;

  // Financial
  householdIncome?: number;
  householdAssets?: number;
  allowedDeductions?: number;

  // Status
  isPregnant?: boolean;
  isStudent?: boolean;
  hasChildren?: boolean;
  hasQualifyingDisability?: boolean;
  receivesSSI?: boolean;

  // Program-specific
  [key: string]: unknown;
}

interface EvaluationOptions {
  rulePackages: RulePackage[];
  profile: UserProfile;
  includeNotQualified?: boolean;
}

/**
 * Evaluates user eligibility across multiple programs
 */
export function useEligibilityEvaluation(options: EvaluationOptions): {
  results: EligibilityResults | null;
  isEvaluating: boolean;
  error: Error | null;
} {
  const { rulePackages, profile, includeNotQualified = true } = options;

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Evaluate rules and generate results
  // eslint-disable-next-line sonarjs/cognitive-complexity -- Complex evaluation logic for multi-program eligibility
  const results = useMemo((): EligibilityResults | null => {
    if (!rulePackages.length) {
      return null;
    }

    try {
      setIsEvaluating(true);
      setError(null);

      // Register custom benefit operators for rule evaluation
      if (import.meta.env.DEV) {
        console.warn('🔍 [DEBUG] Registering benefit operators for rule evaluation');
      }
      registerBenefitOperators();

      const programResults: ProgramEligibilityResult[] = [];
      const evaluatedAt = new Date();

      // Process each rule package
      for (const rulePackage of rulePackages) {
        // Group rules by program
        const rulesByProgram = new Map<string, RuleDefinition[]>();

        for (const rule of rulePackage.rules) {
          if (!rule.active || rule.draft) continue;

          const programRules = rulesByProgram.get(rule.programId) ?? [];
          programRules.push(rule);
          rulesByProgram.set(rule.programId, programRules);
        }

        // Evaluate each program
        for (const [programId, rules] of rulesByProgram) {
          const result = evaluateProgram(programId, rules, profile, rulePackage);
          if (result) {
            result.evaluatedAt = evaluatedAt;
            result.rulesVersion = `${rulePackage.metadata.version.major}.${rulePackage.metadata.version.minor}.${rulePackage.metadata.version.patch}`;
            programResults.push(result);
          }
        }
      }

      // Categorize results by status
      const qualified = programResults.filter(r => r.status === 'qualified');
      const likely = programResults.filter(r => r.status === 'likely');
      const maybe = programResults.filter(r => r.status === 'maybe');
      const notQualified = programResults.filter(r => r.status === 'not-qualified' || r.status === 'unlikely');

      setIsEvaluating(false);

      return {
        qualified,
        likely,
        maybe,
        notQualified: includeNotQualified ? notQualified : [],
        totalPrograms: programResults.length,
        evaluatedAt,
      };
    } catch (err) {
      console.error('🚨 [ERROR] Rule evaluation failed:', err);
      setError(err as Error);
      setIsEvaluating(false);
      return null;
    } finally {
      // Clean up custom operators
      if (import.meta.env.DEV) {
        console.warn('🔍 [DEBUG] Unregistering benefit operators');
      }
      unregisterBenefitOperators();
    }
  }, [rulePackages, profile, includeNotQualified]);

  return {
    results,
    isEvaluating,
    error,
  };
}

/**
 * Evaluates eligibility for a single program
 */
function evaluateProgram(
  programId: string,
  rules: RuleDefinition[],
  profile: UserProfile,
  rulePackage: RulePackage
): ProgramEligibilityResult | null {
  // Evaluate all rules and collect results
  const evaluationData = evaluateRules(rules, profile);

  // Determine eligibility status
  const statusData = determineStatus(evaluationData.passedRules, evaluationData.totalRules);

  // Gather program information
  const programInfo = gatherProgramInfo(rulePackage, programId);

  // Collect documents and next steps
  const requirements = collectRequirements(rules, evaluationData.passedRules);

  // Build explanation
  const reason = getReasonText(statusData.status, evaluationData.passedRules, evaluationData.totalRules);

  return {
    programId,
    ...programInfo,
    ...statusData,
    explanation: {
      reason,
      details: evaluationData.details,
      rulesCited: evaluationData.rulesCited,
      calculations: evaluationData.calculations.length > 0 ? evaluationData.calculations : undefined,
    },
    ...requirements,
    evaluatedAt: new Date(),
    rulesVersion: '',
  };
}

/**
 * Debug SNAP income rule calculations
 */
function debugSnapIncomeRule(
  rule: RuleDefinition,
  profile: UserProfile,
  evaluationResult: { result: boolean }
): void {
  if (!import.meta.env.DEV) return;
  if (!rule.id.includes('snap') || !rule.id.includes('income')) return;

  const { householdIncome, householdSize } = profile;

  console.warn(`🔍 [DEBUG] SNAP Income Rule Analysis:`);
  console.warn(`  - Household Income: $${householdIncome?.toLocaleString()}/month`);
  console.warn(`  - Household Size: ${householdSize}`);

  if (householdIncome === undefined || householdSize === undefined) return;

  const currentThreshold = householdSize * 1500;
  console.warn(`  - Current Rule Threshold: $${currentThreshold.toLocaleString()}/month (householdSize * 1500)`);
  console.warn(`  - Current Rule Result: ${householdIncome} <= ${currentThreshold} = ${householdIncome <= currentThreshold}`);

  const correctThresholds: Record<number, number> = {
    1: 1696, 2: 2292, 3: 2888, 4: 3483,
    5: 4079, 6: 4675, 7: 5271, 8: 5867
  };

  const correctThreshold = householdSize <= 8
    // eslint-disable-next-line security/detect-object-injection -- householdSize is validated as a number in questionnaire
    ? correctThresholds[householdSize]
    : correctThresholds[8] + (596 * (householdSize - 8));

  console.warn(`  - Correct Threshold (130% FPL): $${correctThreshold.toLocaleString()}/month`);
  console.warn(`  - Correct Result: ${householdIncome} <= ${correctThreshold} = ${householdIncome <= correctThreshold}`);
  console.warn(`  - DIFFERENCE: Current rule allows ${currentThreshold - correctThreshold > 0 ? 'MORE' : 'LESS'} income by $${Math.abs(currentThreshold - correctThreshold).toLocaleString()}`);

  if (householdIncome > correctThreshold && evaluationResult.result === true) {
    console.error(`🚨 [ERROR] Rule is incorrectly passing! Income $${householdIncome} > Correct threshold $${correctThreshold}`);
  }
}

/**
 * Maps technical field names to user-friendly descriptions
 */
const FIELD_NAME_MAPPINGS: Record<string, string> = {
  // Demographics
  'age': 'your age',
  'isPregnant': 'pregnancy status',
  'hasChildren': 'whether you have children',
  'hasQualifyingDisability': 'qualifying disability status',
  'isCitizen': 'citizenship status',
  'isLegalResident': 'legal residency status',
  'ssn': 'Social Security number',

  // Financial
  'householdIncome': 'your household\'s monthly income',
  'householdSize': 'your household size',
  'income': 'your income',
  'grossIncome': 'your gross income',
  'netIncome': 'your net income',
  'monthlyIncome': 'your monthly income',
  'annualIncome': 'your annual income',
  'assets': 'your household assets',
  'resources': 'your available resources',
  'liquidAssets': 'your liquid assets',
  'vehicleValue': 'your vehicle value',
  'bankBalance': 'your bank account balance',

  // Location & State
  'state': 'your state of residence',
  'stateHasExpanded': 'whether your state has expanded coverage',
  'zipCode': 'your ZIP code',
  'county': 'your county',
  'jurisdiction': 'your location',

  // Program-specific
  'hasHealthInsurance': 'current health insurance coverage',
  'employmentStatus': 'your employment status',
  'isStudent': 'student status',
  'isVeteran': 'veteran status',
  'isSenior': 'senior status (65+)',
  'hasMinorChildren': 'whether you have children under 18',

  // Housing
  'housingCosts': 'your housing costs',
  'rentAmount': 'your monthly rent',
  'mortgageAmount': 'your monthly mortgage',
  'isHomeless': 'housing situation',

  // Benefits
  'receivesSSI': 'Supplemental Security Income (SSI)',
  'receivesSNAP': 'SNAP benefits',
  'receivesTANF': 'TANF benefits',
  'receivesWIC': 'WIC benefits',
  'receivesUnemployment': 'unemployment benefits',
};

/**
 * Format field name to human-readable description
 */
function formatFieldName(fieldName: string): string {
  // Check if we have a specific mapping for this field
  if (Object.prototype.hasOwnProperty.call(FIELD_NAME_MAPPINGS, fieldName)) {
    return FIELD_NAME_MAPPINGS[fieldName]; // eslint-disable-line security/detect-object-injection -- fieldName from known field set, not user input
  }

  // Fall back to converting camelCase or snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Helper to process required fields for rule result
 */
function processRequiredFields(rule: RuleDefinition, profile: UserProfile, details: string[]): void {
  if (!rule.requiredFields?.length) return;

  for (const field of rule.requiredFields) {
    // eslint-disable-next-line security/detect-object-injection -- field from rule definition, not user input
    const fieldValue = profile[field];
    const fieldDescription = formatFieldName(field);
    const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

    // Debug logging to verify the mapping is working
    if (import.meta.env.DEV) {
      console.warn(`🔍 [DEBUG] Field mapping: "${field}" → "${fieldDescription}"`);
    }

    details.push(`${fieldDescription}: ${hasValue ? 'Met' : 'Not provided'}`);
  }
}

/**
 * Helper to add rule explanation to details
 */
function addRuleExplanation(rule: RuleDefinition, passed: boolean, details: string[]): void {
  if (rule.explanation) {
    details.push(`${passed ? '✓' : '✗'} ${rule.explanation}`);
  }
}

/**
 * Process a single rule evaluation result
 */
function processRuleResult(
  rule: RuleDefinition,
  evaluationResult: { result: boolean },
  details: string[],
  profile: UserProfile
): boolean {
  const passed = evaluationResult.result === true;

  if (import.meta.env.DEV) {
    console.warn(`${passed ? '✅' : '❌'} [DEBUG] Rule ${rule.id} ${passed ? 'PASSED' : 'FAILED'}`);
  }

  // Add user-friendly explanation if available
  addRuleExplanation(rule, passed, details);

  // Add user-friendly field status descriptions for required fields
  processRequiredFields(rule, profile, details);

  return passed;
}

/**
 * Log rule evaluation start debug info
 */
function logEvaluationStart(profile: UserProfile): void {
  if (!import.meta.env.DEV) return;
  console.warn('🔍 [DEBUG] Starting rule evaluation with profile:', {
    householdIncome: profile.householdIncome,
    householdSize: profile.householdSize,
    citizenship: profile.citizenship,
    age: profile.age,
  });
}

/**
 * Log rule evaluation summary debug info
 */
function logEvaluationSummary(passedRules: number, totalRules: number, rulesCited: string[]): void {
  if (!import.meta.env.DEV) return;
  console.warn(`🔍 [DEBUG] Rule evaluation summary:`, {
    passedRules,
    totalRules,
    passRate: totalRules > 0 ? (passedRules / totalRules).toFixed(2) : '0',
    rulesCited,
  });
}

/**
 * Log individual rule debug info
 */
function logRuleDebug(rule: RuleDefinition, evaluationResult: { success: boolean; result: boolean; error?: string; executionTime?: number }): void {
  if (!import.meta.env.DEV) return;
  console.warn(`🔍 [DEBUG] Evaluating rule: ${rule.id}`);
  console.warn(`🔍 [DEBUG] Rule logic:`, JSON.stringify(rule.ruleLogic, null, 2));
  console.warn(`🔍 [DEBUG] Rule ${rule.id} evaluation result:`, {
    success: evaluationResult.success,
    result: evaluationResult.result,
    error: evaluationResult.error,
    executionTime: evaluationResult.executionTime,
  });
}

/**
 * Evaluates all rules and returns evaluation data
 */
function evaluateRules(rules: RuleDefinition[], profile: UserProfile): {
  passedRules: number;
  totalRules: number;
  rulesCited: string[];
  details: string[];
  calculations: Array<{ label: string; value: string | number; comparison?: string }>;
} {
  let passedRules = 0;
  let totalRules = 0;
  const rulesCited: string[] = [];
  const details: string[] = [];
  const calculations: Array<{ label: string; value: string | number; comparison?: string }> = [];

  logEvaluationStart(profile);

  for (const rule of rules) {
    if (rule.ruleType !== 'eligibility') continue;

    totalRules++;

    try {
      const evaluationResult = evaluateRuleSync(rule.ruleLogic as JsonLogicRule, profile);
      logRuleDebug(rule, evaluationResult);
      debugSnapIncomeRule(rule, profile, evaluationResult);

      const ruleCalculation = generateRuleCalculation(rule, profile);
      if (ruleCalculation) {
        calculations.push(ruleCalculation);
      }

      if (processRuleResult(rule, evaluationResult, details, profile)) {
        passedRules++;
      }

      rulesCited.push(rule.id);
    } catch (err) {
      console.error(`🚨 [ERROR] Error evaluating rule ${rule.id}:`, err);
    }
  }

  logEvaluationSummary(passedRules, totalRules, rulesCited);

  return { passedRules, totalRules, rulesCited, details, calculations };
}

/**
 * Determines eligibility status based on pass rate
 */
function determineStatus(passedRules: number, totalRules: number): {
  status: EligibilityStatus;
  confidence: ConfidenceLevel;
  confidenceScore: number;
} {
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
 * Gathers program information from rule package
 */
function gatherProgramInfo(rulePackage: RulePackage, _programId: string): {
  programName: string;
  programDescription: string;
  jurisdiction: string;
} {
  return {
    programName: rulePackage.metadata.name,
    programDescription: rulePackage.metadata.description ?? '',
    jurisdiction: rulePackage.metadata.jurisdiction ?? 'US-FEDERAL',
  };
}

/**
 * Collects required documents and next steps from rules
 */
function collectRequirements(rules: RuleDefinition[], passedRules: number): {
  requiredDocuments: RequiredDocument[];
  nextSteps: NextStep[];
} {
  const requiredDocuments = rules
    .filter(() => passedRules > 0)
    .flatMap(r => r.requiredDocuments ?? []);

  const nextSteps = rules
    .filter(() => passedRules > 0)
    .flatMap(r => r.nextSteps ?? []);

  return {
    requiredDocuments: deduplicateDocuments(requiredDocuments),
    nextSteps: deduplicateSteps(nextSteps),
  };
}

/**
 * Generate reason text based on status
 */
function getReasonText(status: EligibilityStatus, passed: number, total: number): string {
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

/**
 * Deduplicate documents by ID
 */
function deduplicateDocuments(documents: RequiredDocument[]): RequiredDocument[] {
  const seen = new Set<string>();
  return documents.filter(doc => {
    if (seen.has(doc.id)) return false;
    seen.add(doc.id);
    return true;
  });
}

/**
 * Deduplicate steps by content
 */
function deduplicateSteps(steps: NextStep[]): NextStep[] {
  const seen = new Set<string>();
  return steps.filter(step => {
    if (seen.has(step.step)) return false;
    seen.add(step.step);
    return true;
  });
}

/**
 * Calculate SNAP income threshold for household size
 */
function calculateSnapIncomeThreshold(householdSize: number): number {
  const snapIncomeLimits: Record<number, number> = {
    1: 1696, 2: 2292, 3: 2888, 4: 3483,
    5: 4079, 6: 4675, 7: 5271, 8: 5867
  };

  return householdSize <= 8
    // eslint-disable-next-line security/detect-object-injection -- householdSize is validated as a number in questionnaire
    ? snapIncomeLimits[householdSize]
    : snapIncomeLimits[8] + (596 * (householdSize - 8));
}

/**
 * Generate SNAP income calculation details
 */
function generateSnapIncomeCalculation(profile: UserProfile): { label: string; value: string; comparison: string } | null {
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
function generateHouseholdCalculation(profile: UserProfile): { label: string; value: number; comparison: string } | null {
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
function generateCitizenshipCalculation(profile: UserProfile): { label: string; value: string; comparison: string } | null {
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
    // eslint-disable-next-line security/detect-object-injection -- citizenship is validated string from questionnaire
    value: citizenshipMap[citizenship] || citizenship,
    comparison: 'Meets program requirements'
  };
}

/**
 * Generate age calculation details
 */
function generateAgeCalculation(profile: UserProfile): { label: string; value: number; comparison: string } | null {
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
function generateRuleCalculation(rule: RuleDefinition, profile: UserProfile): { label: string; value: string | number; comparison?: string } | null {
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

export default useEligibilityEvaluation;

