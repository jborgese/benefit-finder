/**
 * useEligibilityEvaluation Hook - Public API
 *
 * Re-exports all functionality for backward compatibility
 */

import { useEligibilityEvaluation } from './main';

export { useEligibilityEvaluation };
export type {
  UserProfile,
  EvaluationOptions,
  EvaluationState,
  EvaluationData,
  StatusData,
  ProgramInfo,
  Requirements,
  EligibilityStatus,
  ConfidenceLevel,
  RequiredDocument,
  NextStep,
} from './types';

export default useEligibilityEvaluation;
