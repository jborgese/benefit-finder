/**
 * Specific Reasons Section Component
 *
 * Displays specific disqualification reasons based on actual evaluation results
 * and user assessment data, providing personalized explanations.
 */

import React from 'react';
import { getSpecificReasons, getMaybeReasons, type UserProfile } from '../../utils/specificReasons';
import { generateEvaluationBasedReasons, type EvaluationResult } from '../../utils/evaluationBasedReasons';
import { EligibilityStatus } from './types';
import { useI18n } from '../../i18n/hooks';

interface SpecificReasonsSectionProps {
  programId: string;
  status: EligibilityStatus;
  userProfile?: UserProfile;
  evaluationResult?: EvaluationResult | undefined; // Accept evaluation shapes during migration
}

export const SpecificReasonsSection: React.FC<SpecificReasonsSectionProps> = ({
  programId,
  status,
  userProfile,
  evaluationResult,
}) => {
  const { t } = useI18n();

  // Use evaluation-based reasons if available, otherwise fall back to generic reasons
  const evaluationBasedReasons = evaluationResult
    ? generateEvaluationBasedReasons(programId, status, evaluationResult, userProfile)
    : [];

  const specificReasons = evaluationBasedReasons.length > 0
    ? evaluationBasedReasons.map(reason => reason.message)
    : getSpecificReasons(programId, status, userProfile);

  const maybeReasons = getMaybeReasons(programId, status, userProfile);

  // Don't render if no reasons for either status
  if (specificReasons.length === 0 && maybeReasons.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Not Qualified Reasons */}
      {specificReasons.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">❌</span>
            {t('results.specificReasons.title')}
          </h4>
          <ul className="space-y-2">
            {specificReasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-600 mr-2 mt-0.5">•</span>
                <span className="text-gray-700">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Maybe Reasons */}
      {maybeReasons.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            {t('results.maybeReasons.title')}
          </h4>
          <ul className="space-y-2">
            {maybeReasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                <span className="text-gray-700">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpecificReasonsSection;
