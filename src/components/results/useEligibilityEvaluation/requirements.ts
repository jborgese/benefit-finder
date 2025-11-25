/**
 * Requirements collection and deduplication
 */

import type { RuleDefinition } from '../../../rules/core/schema';
import type { RequiredDocument, NextStep } from '../types';
import type { Requirements } from './types';

/**
 * Collects required documents and next steps from rules
 */
export function collectRequirements(rules: RuleDefinition[], passedRules: number): Requirements {
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
 * Deduplicate documents by ID
 */
export function deduplicateDocuments(documents: RequiredDocument[]): RequiredDocument[] {
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
export function deduplicateSteps(steps: NextStep[]): NextStep[] {
  const seen = new Set<string>();
  return steps.filter(step => {
    if (seen.has(step.step)) return false;
    seen.add(step.step);
    return true;
  });
}
