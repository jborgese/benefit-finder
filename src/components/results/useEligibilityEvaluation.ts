/**
 * useEligibilityEvaluation Hook
 *
 * Evaluates user eligibility across programs using rule system
 */

import { useState, useMemo } from 'react';
import type { RulePackage, RuleDefinition } from '../../rules/schema';
import { evaluateRuleSync } from '../../rules/evaluator';
import type { JsonLogicRule } from '../../rules/types';
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
  const results = useMemo((): EligibilityResults | null => {
    if (!rulePackages.length) {
      return null;
    }

    try {
      setIsEvaluating(true);
      setError(null);

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
      setError(err as Error);
      setIsEvaluating(false);
      return null;
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

  for (const rule of rules) {
    if (rule.ruleType !== 'eligibility') continue;

    totalRules++;

    try {
      const evaluationResult = evaluateRuleSync(rule.ruleLogic as JsonLogicRule, profile);

      // Generate calculation details for specific rule types
      const ruleCalculation = generateRuleCalculation(rule, profile);
      if (ruleCalculation) {
        calculations.push(ruleCalculation);
      }

      if (evaluationResult.result === true) {
        passedRules++;
        if (rule.explanation) {
          details.push(`✓ ${rule.explanation}`);
        }
      } else if (rule.explanation) {
        details.push(`✗ ${rule.explanation}`);
      }

      rulesCited.push(rule.id);
    } catch (err) {
      console.error(`Error evaluating rule ${rule.id}:`, err);
    }
  }

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
 * Generate calculation details for specific rule types
 */
function generateRuleCalculation(rule: RuleDefinition, profile: UserProfile): { label: string; value: string | number; comparison?: string } | null {
  const ruleLogic = rule.ruleLogic as JsonLogicRule;

  // Handle SNAP income rules
  if (rule.id.includes('snap') && rule.id.includes('income')) {
    const householdIncome = profile.householdIncome;
    const householdSize = profile.householdSize;

    if (householdIncome !== undefined && householdSize !== undefined) {
      // Use actual USDA 2026 SNAP income limits (130% of poverty level)
      const snapIncomeLimits: Record<number, number> = {
        1: 1696,
        2: 2292,
        3: 2888,
        4: 3483,
        5: 4079,
        6: 4675,
        7: 5271,
        8: 5867
      };

      // For households larger than 8, add $596 per additional member
      const threshold = householdSize <= 8
        ? snapIncomeLimits[householdSize]
        : snapIncomeLimits[8] + (596 * (householdSize - 8));

      const meetsThreshold = householdIncome <= threshold;

      return {
        label: 'Monthly income limit (130% of poverty)',
        value: `$${threshold.toLocaleString()}`,
        comparison: `Your income: $${householdIncome.toLocaleString()} (${meetsThreshold ? 'qualifies' : 'exceeds limit'})`
      };
    }
  }

  // Handle household size requirements
  if (rule.id.includes('household')) {
    const householdSize = profile.householdSize;

    if (householdSize !== undefined) {
      return {
        label: 'Household size',
        value: householdSize,
        comparison: `${householdSize} ${householdSize === 1 ? 'person' : 'people'}`
      };
    }
  }

  // Handle citizenship rules
  if (rule.id.includes('citizenship')) {
    const citizenship = profile.citizenship;

    if (citizenship) {
      const citizenshipMap: Record<string, string> = {
        'us_citizen': 'U.S. Citizen',
        'permanent_resident': 'Permanent Resident',
        'refugee': 'Refugee',
        'asylee': 'Asylee'
      };

      return {
        label: 'Citizenship status',
        value: citizenshipMap[citizenship] || citizenship,
        comparison: 'Meets program requirements'
      };
    }
  }

  // Handle age-based rules
  if (rule.id.includes('age')) {
    const age = profile.age;

    if (age !== undefined) {
      return {
        label: 'Age',
        value: age,
        comparison: `${age} years old`
      };
    }
  }

  return null;
}

export default useEligibilityEvaluation;

