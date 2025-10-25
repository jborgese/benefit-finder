/**
 * Maybe Reasons Section Component
 *
 * Generic component for displaying specific reasons for Maybe status
 * that shows users what they need to address for potential eligibility.
 */

import React from 'react';
import { getMaybeReasons, type UserProfile } from '../../utils/specificReasons';
import { EligibilityStatus } from './types';
import { useI18n } from '../../i18n/hooks';

interface MaybeReasonsSectionProps {
  programId: string;
  status: EligibilityStatus;
  userProfile?: UserProfile;
}

export const MaybeReasonsSection: React.FC<MaybeReasonsSectionProps> = ({
  programId,
  status,
  userProfile,
}) => {
  const { t } = useI18n();

  const maybeReasons = getMaybeReasons(programId, status, userProfile);

  // Don't render if no maybe reasons or not maybe status
  if (maybeReasons.length === 0) {
    return null;
  }

  return (
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
  );
};

export default MaybeReasonsSection;
