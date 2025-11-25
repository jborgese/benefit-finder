/**
 * useEligibilityEvaluation Hook - Main Implementation
 *
 * Evaluates user eligibility across programs using rule system
 */

import { useState, useMemo } from 'react';
import { registerBenefitOperators, unregisterBenefitOperators } from '../../../rules/core/evaluator';
import type { EligibilityResults, ProgramEligibilityResult } from '../types';
import type { EvaluationOptions } from './types';
import { evaluateProgram } from './programEvaluation';

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
        const rulesByProgram = new Map<string, import('../../../rules/core/schema').RuleDefinition[]>();

        for (const rule of rulePackage.rules) {
          if (!rule.active || rule.draft) continue;

          const programRules = rulesByProgram.get(rule.programId) ?? [];
          programRules.push(rule);
          rulesByProgram.set(rule.programId, programRules);
        }

        // Evaluate each program
        Array.from(rulesByProgram.entries()).forEach(([programId, rules]) => {
          const result = evaluateProgram(programId, rules, profile, rulePackage);
          if (result) {
            result.evaluatedAt = evaluatedAt;
            result.rulesVersion = `${rulePackage.metadata.version.major}.${rulePackage.metadata.version.minor}.${rulePackage.metadata.version.patch}`;
            programResults.push(result);
          }
        });
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

export default useEligibilityEvaluation;
