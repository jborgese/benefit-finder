/**
 * useEligibilityEvaluation Hook - Main Implementation
 *
 * Evaluates user eligibility across programs using rule system
 */

import { useState, useEffect } from 'react';
import type { EligibilityResults, ProgramEligibilityResult } from '../types';
import type { EvaluationOptions } from './types';
import { evaluateProgram } from './programEvaluation';

/**
 * Evaluates user eligibility across multiple programs (async, dynamic evaluator import)
 */
export function useEligibilityEvaluation(options: EvaluationOptions): {
  results: EligibilityResults | null;
  isEvaluating: boolean;
  error: Error | null;
} {
  const { rulePackages, profile, includeNotQualified = true } = options;

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<EligibilityResults | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runEvaluation() {
      if (!rulePackages || rulePackages.length === 0) {
        setResults(null);
        return;
      }

      setIsEvaluating(true);
      setError(null);

      // Dynamically import evaluator to avoid bundling heavy evaluator into main chunk
      const evaluator = await import('../../../rules/core/evaluator');

      try {
        if (import.meta.env.DEV) {
          console.warn('🔍 [DEBUG] Registering benefit operators for rule evaluation (dynamic import)');
        }
        evaluator.registerBenefitOperators();

        const programResults: ProgramEligibilityResult[] = [];
        const evaluatedAt = new Date();

        for (const rulePackage of rulePackages) {
          const rulesByProgram = new Map<string, import('../../../rules/core/schema').RuleDefinition[]>();

          for (const rule of rulePackage.rules) {
            if (!rule.active || rule.draft) continue;
            const programRules = rulesByProgram.get(rule.programId) ?? [];
            programRules.push(rule);
            rulesByProgram.set(rule.programId, programRules);
          }

          Array.from(rulesByProgram.entries()).forEach(([programId, rules]) => {
            const result = evaluateProgram(programId, rules, profile, rulePackage);
            if (result) {
              result.evaluatedAt = evaluatedAt;
              result.rulesVersion = `${rulePackage.metadata.version.major}.${rulePackage.metadata.version.minor}.${rulePackage.metadata.version.patch}`;
              programResults.push(result);
            }
          });
        }

        if (cancelled) return;

        const qualified = programResults.filter(r => r.status === 'qualified');
        const likely = programResults.filter(r => r.status === 'likely');
        const maybe = programResults.filter(r => r.status === 'maybe');
        const notQualified = programResults.filter(r => r.status === 'not-qualified' || r.status === 'unlikely');

        setResults({
          qualified,
          likely,
          maybe,
          notQualified: includeNotQualified ? notQualified : [],
          totalPrograms: programResults.length,
          evaluatedAt,
        });

      } catch (err) {
        console.error('🚨 [ERROR] Rule evaluation failed:', err);
        if (!cancelled) setError(err as Error);
        setResults(null);
      } finally {
        try {
          if (import.meta.env.DEV) {
            console.warn('🔍 [DEBUG] Unregistering benefit operators (dynamic import)');
          }
          evaluator.unregisterBenefitOperators();
        } catch (e) {
          console.warn('Error during unregisterBenefitOperators', e);
        }
        if (!cancelled) setIsEvaluating(false);
      }
    }

    void runEvaluation();

    return () => { cancelled = true; };
  }, [rulePackages, profile, includeNotQualified]);

  return {
    results,
    isEvaluating,
    error,
  };
}

export default useEligibilityEvaluation;
