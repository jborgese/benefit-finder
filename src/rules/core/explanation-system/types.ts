/**
 * Explanation System Types
 */

/**
 * Detailed explanation of evaluation result
 */
export interface ResultExplanation {
  /** Overall summary */
  summary: string;
  /** Why the result is what it is */
  reasoning: string[];
  /** What criteria were checked */
  criteriaChecked: string[];
  /** What criteria passed */
  criteriaPassed: string[];
  /** What criteria failed */
  criteriaFailed: string[];
  /** Missing information */
  missingInformation: string[];
  /** What would change the result */
  whatWouldChange?: string[];
  /** Plain language explanation */
  plainLanguage: string;
}

/**
 * Explanation options
 */
export interface ExplanationOptions {
  /** Include technical details */
  includeTechnical?: boolean;
  /** Language level (simple/standard/technical) */
  languageLevel?: 'simple' | 'standard' | 'technical';
  /** Include suggestions for changing result */
  includeSuggestions?: boolean;
  /** Maximum length of explanation */
  maxLength?: number;
}
