/**
 * State-Specific Messaging Utilities
 *
 * Provides helper functions for retrieving state-specific messaging
 * with fallbacks to general program messaging.
 */

/**
 * Get state-specific message with fallback to general message
 *
 * @param programId - The program ID (e.g., 'medicaid-federal', 'snap-federal')
 * @param state - The state code (e.g., 'CA', 'TX', 'NY')
 * @param messageKey - The message key (e.g., 'statusMessages.qualified')
 * @param t - Translation function
 * @returns State-specific message or fallback to general message
 *
 * @example
 * ```typescript
 * const statusMessage = getStateSpecificMessage(
 *   'medicaid-federal',
 *   'CA',
 *   'statusMessages.qualified',
 *   t
 * );
 * // Returns: "You are eligible for Medi-Cal! California's Medicaid program provides comprehensive health coverage."
 * ```
 */
export function getStateSpecificMessage(
  programId: string,
  state: string,
  messageKey: string,
  t: (key: string) => string
): string {
  const stateKey = `results.${programId}.stateSpecific.${state}.${messageKey}`;
  const fallbackKey = `results.${programId}.${messageKey}`;

  // Try state-specific first, fallback to general
  const stateMessage = t(stateKey);
  return stateMessage !== stateKey ? stateMessage : t(fallbackKey);
}

/**
 * Get state-specific benefits with fallback to general benefits
 *
 * @param programId - The program ID
 * @param state - The state code
 * @param benefitKey - The benefit key
 * @param t - Translation function
 * @returns State-specific benefit or fallback to general benefit
 */
export function getStateSpecificBenefit(
  programId: string,
  state: string,
  benefitKey: string,
  t: (key: string) => string
): string {
  return getStateSpecificMessage(programId, state, `benefits.${benefitKey}`, t);
}

/**
 * Get state-specific requirement with fallback to general requirement
 *
 * @param programId - The program ID
 * @param state - The state code
 * @param requirementKey - The requirement key
 * @param t - Translation function
 * @returns State-specific requirement or fallback to general requirement
 */
export function getStateSpecificRequirement(
  programId: string,
  state: string,
  requirementKey: string,
  t: (key: string) => string
): string {
  return getStateSpecificMessage(programId, state, `requirements.${requirementKey}`, t);
}

/**
 * Get state-specific next step with fallback to general next step
 *
 * @param programId - The program ID
 * @param state - The state code
 * @param stepKey - The step key
 * @param t - Translation function
 * @returns State-specific next step or fallback to general next step
 */
export function getStateSpecificNextStep(
  programId: string,
  state: string,
  stepKey: string,
  t: (key: string) => string
): string {
  return getStateSpecificMessage(programId, state, `nextSteps.${stepKey}`, t);
}

/**
 * Get state-specific resource with fallback to general resource
 *
 * @param programId - The program ID
 * @param state - The state code
 * @param resourceKey - The resource key
 * @param t - Translation function
 * @returns State-specific resource or fallback to general resource
 */
export function getStateSpecificResource(
  programId: string,
  state: string,
  resourceKey: string,
  t: (key: string) => string
): string {
  return getStateSpecificMessage(programId, state, `resources.${resourceKey}`, t);
}

/**
 * Get state-specific how to apply step with fallback to general step
 *
 * @param programId - The program ID
 * @param state - The state code
 * @param stepKey - The step key
 * @param t - Translation function
 * @returns State-specific how to apply step or fallback to general step
 */
export function getStateSpecificHowToApplyStep(
  programId: string,
  state: string,
  stepKey: string,
  t: (key: string) => string
): string {
  return getStateSpecificMessage(programId, state, `howToApply.${stepKey}`, t);
}

/**
 * Check if state-specific messaging exists for a program
 *
 * @param programId - The program ID
 * @param state - The state code
 * @param t - Translation function
 * @returns True if state-specific messaging exists
 */
export function hasStateSpecificMessaging(
  programId: string,
  state: string,
  t: (key: string) => string
): boolean {
  const stateKey = `results.${programId}.stateSpecific.${state}`;
  return t(stateKey) !== stateKey;
}

/**
 * Get all available states for a program
 *
 * @param programId - The program ID
 * @param t - Translation function
 * @returns Array of state codes that have specific messaging
 */
export function getAvailableStates(
  programId: string,
  t: (key: string) => string
): string[] {
  // This would need to be implemented based on how states are defined in translations
  // For now, return common states
  const commonStates = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

  return commonStates.filter(state =>
    hasStateSpecificMessaging(programId, state, t)
  );
}
