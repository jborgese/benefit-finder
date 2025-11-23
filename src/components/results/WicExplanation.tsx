/**
 * WIC-Specific Explanation Component
 *
 * Provides user-friendly, informative explanations for WIC eligibility results
 * with specific guidance for pregnant women, new mothers, and families with children.
 */

import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '../../i18n/hooks';
import { SpecificReasonsSection } from './SpecificReasonsSection';

interface WicExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  userProfile?: {
    state?: string;
    isPregnant?: boolean;
    hasChildren?: boolean;
    householdIncome?: number;
    householdSize?: number;
    citizenship?: string;
    [key: string]: unknown;
  };
  onClose: () => void;
}

/**
 * Get WIC-specific status messaging
 */
function getWicStatusMessage(status: EligibilityStatus, userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t?: (key: string) => string): string {
  const tr = t ?? ((k: string) => k);
  switch (status) {
    case 'qualified':
      return tr('results.wic.statusMessages.qualified');
    case 'likely':
      return tr('results.wic.statusMessages.likely');
    case 'maybe':
      return tr('results.wic.statusMessages.maybe');
    case 'unlikely':
      return tr('results.wic.statusMessages.unlikely');
    case 'not-qualified':
      if (userProfile?.isPregnant) {
        return `${tr('results.wic.statusMessages.notQualified')} Contact your local WIC office to discuss your pregnancy and nutritional needs.`;
      } else if (userProfile?.hasChildren) {
        return `${tr('results.wic.statusMessages.notQualified')} Contact your local WIC office to discuss your children and nutritional needs.`;
      }
      return tr('results.wic.statusMessages.notQualified');
    default:
      return 'Contact your local WIC office to discuss your eligibility.';
  }
}

/**
 * Get WIC-specific next steps based on status and user profile
 */
function getWicNextSteps(status: EligibilityStatus, userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t?: (key: string) => string): string[] {
  const tr = t ?? ((k: string) => k);
  const steps: string[] = [];

  switch (status) {
    case 'qualified':
    case 'likely':
      steps.push(tr('results.wic.nextSteps.contact'));
      steps.push(tr('results.wic.nextSteps.schedule'));
      steps.push(tr('results.wic.nextSteps.documents'));
      if (userProfile?.isPregnant) {
        steps.push(tr('results.wic.nextSteps.prenatalCounseling'));
      }
      if (userProfile?.hasChildren) {
        steps.push(tr('results.wic.nextSteps.childGuidance'));
      }
      break;
    case 'maybe':
    case 'unlikely':
      steps.push(tr('results.wic.nextSteps.discuss'));
      steps.push(tr('results.wic.nextSteps.alternatives'));
      steps.push(tr('results.wic.nextSteps.checkBack'));
      break;
    case 'not-qualified':
      steps.push(tr('results.wic.nextSteps.discuss'));
      steps.push(tr('results.wic.nextSteps.alternatives'));
      steps.push(tr('results.wic.nextSteps.reapply'));
      break;
  }

  return steps;
}

/**
 * Get WIC-specific benefit information
 */
function getWicBenefitInfo(userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t?: (key: string) => string): string[] {
  const tr = t ?? ((k: string) => k);
  const benefits: string[] = [];

  if (userProfile?.isPregnant) {
    benefits.push(tr('results.wic.benefits.prenatal'));
    benefits.push(tr('results.wic.benefits.monthlyFood'));
    benefits.push(tr('results.wic.benefits.foods'));
  } else if (userProfile?.hasChildren) {
    benefits.push(tr('results.wic.benefits.childNutrition'));
    benefits.push(tr('results.wic.benefits.childFood'));
    benefits.push(tr('results.wic.benefits.foods'));
  } else {
    benefits.push(tr('results.wic.benefits.generalNutrition'));
    benefits.push(tr('results.wic.benefits.generalFood'));
    benefits.push(tr('results.wic.benefits.referrals'));
  }

  return benefits;
}

/**
 * Get WIC-specific requirements explanation
 */
function getWicRequirementsExplanation(userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t?: (key: string) => string): string[] {
  const tr = t ?? ((k: string) => k);
  const requirements: string[] = [];

  requirements.push(tr('results.wic.requirements.citizenship'));
  requirements.push(tr('results.wic.requirements.residence'));
  requirements.push(tr('results.wic.requirements.nutritionalRisk'));

  if (userProfile?.isPregnant) {
    requirements.push(tr('results.wic.requirements.pregnant'));
  } else if (userProfile?.hasChildren) {
    requirements.push(tr('results.wic.requirements.children'));
  } else {
    requirements.push(tr('results.wic.requirements.category'));
  }

  requirements.push(tr('results.wic.requirements.income'));

  return requirements;
}


export const WicExplanation: React.FC<WicExplanationProps> = ({
  programName: _programName,
  status,
  explanation: _explanation,
  userProfile,
  onClose,
}) => {
  const { t } = useI18n();
  const getStatusColor = (): string => {
    switch (status) {
      case 'qualified':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'likely':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'maybe':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'unlikely':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'not-qualified':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (): string => {
    switch (status) {
      case 'qualified':
        return '✅';
      case 'likely':
        return '✔️';
      case 'maybe':
        return '❓';
      case 'unlikely':
        return '⚠️';
      case 'not-qualified':
        return '❌';
      default:
        return '❔';
    }
  };

  const statusMessage = getWicStatusMessage(status, userProfile, t);
  const nextSteps = getWicNextSteps(status, userProfile, t);
  const benefits = getWicBenefitInfo(userProfile, t);
  const requirements = getWicRequirementsExplanation(userProfile, t);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
            Why this result?
          </Dialog.Title>
          <p className="text-gray-600">{t('benefits.wic')}</p>
        </div>
        <Dialog.Close asChild>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close explanation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </Dialog.Close>
      </div>

      {/* Status Badge */}
      <div className={`p-4 rounded-lg border mb-6 ${getStatusColor()}`}>
        <div className="flex items-center">
          <span className="text-3xl mr-3">{getStatusIcon()}</span>
          <div>
            <h3 className="font-semibold text-lg capitalize">{status.replace('-', ' ')}</h3>
            <p className="text-sm">{statusMessage}</p>
          </div>
        </div>
      </div>

      {/* WIC-Specific Information */}
      <div className="space-y-6">
        {/* Specific Reasons for Not Qualifying */}
        <SpecificReasonsSection
          programId="wic-federal"
          status={status}
          userProfile={userProfile}
        />

        {/* What WIC Provides */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">🍎</span>
            {t('results.wic.benefits.title')}
          </h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5">•</span>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WIC Requirements */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">📋</span>
            {t('results.wic.requirements.title')}
          </h4>
          <ul className="space-y-2">
            {requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 mt-0.5">•</span>
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">📞</span>
            {t('results.wic.nextSteps.title')}
          </h4>
          <ul className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 mt-0.5">•</span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How to Apply */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <span className="text-lg mr-2">🏥</span>
            {t('results.wic.howToApply.title')}
          </h4>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>{t('results.wic.howToApply.findOffice')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>{t('results.wic.howToApply.schedule')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>{t('results.wic.howToApply.bringDocuments')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <span>{t('results.wic.howToApply.assessment')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">5.</span>
              <span>{t('results.wic.howToApply.receiveBenefits')}</span>
            </li>
          </ol>
        </div>

        {/* Additional Resources */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="text-lg mr-2">ℹ️</span>
            {t('results.wic.resources.title')}
          </h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• {t('results.wic.resources.website')}: <a href="https://www.fns.usda.gov/wic" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" aria-label="Visit USDA WIC program website">fns.usda.gov/wic</a></li>
            <li>• {t('results.wic.resources.hotline')}</li>
            <li>• {t('results.wic.resources.education')}</li>
            <li>• {t('results.wic.resources.locations')}</li>
          </ul>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <span className="text-lg">🔒</span>
          <p>
            <strong>Privacy Note:</strong> All eligibility calculations happen locally on your device.
            No information is sent to external servers. This determination is based on official program
            rules and the information you provided.
          </p>
        </div>
      </div>

      {/* Close Button */}
      <div className="mt-6 flex justify-end">
        <Dialog.Close asChild>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </Dialog.Close>
      </div>
    </div>
  );
};

export default WicExplanation;
