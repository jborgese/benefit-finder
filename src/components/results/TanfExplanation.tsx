/**
 * TANF-Specific Explanation Component
 *
 * Provides user-friendly, informative explanations for TANF eligibility results
 * with specific guidance for families with children and work requirements.
 */

import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '../../i18n/hooks';

interface TanfExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  userProfile?: {
    state?: string;
    hasChildren?: boolean;
    householdIncome?: number;
    householdSize?: number;
    isEmployed?: boolean;
    [key: string]: unknown;
  };
  onClose: () => void;
}

/**
 * Get TANF-specific status messaging
 */
function getTanfStatusMessage(status: EligibilityStatus, userProfile?: { hasChildren?: boolean; isEmployed?: boolean }, t: (key: string) => string): string {
  switch (status) {
    case 'qualified':
      return t('results.tanf.statusMessages.qualified');
    case 'likely':
      return t('results.tanf.statusMessages.likely');
    case 'maybe':
      return t('results.tanf.statusMessages.maybe');
    case 'unlikely':
      return t('results.tanf.statusMessages.unlikely');
    case 'not-qualified':
      if (userProfile?.hasChildren) {
        return t('results.tanf.statusMessages.notQualified') + ' Contact your local TANF office to discuss your family situation and work requirements.';
      }
      return t('results.tanf.statusMessages.notQualified');
    default:
      return 'Contact your local TANF office to discuss your eligibility.';
  }
}

/**
 * Get TANF-specific next steps based on status and user profile
 */
function getTanfNextSteps(status: EligibilityStatus, userProfile?: { hasChildren?: boolean; isEmployed?: boolean }, t: (key: string) => string): string[] {
  const steps: string[] = [];

  switch (status) {
    case 'qualified':
    case 'likely':
      steps.push(t('results.tanf.nextSteps.contact'));
      steps.push(t('results.tanf.nextSteps.schedule'));
      steps.push(t('results.tanf.nextSteps.documents'));
      if (userProfile?.hasChildren) {
        steps.push(t('results.tanf.nextSteps.familyServices'));
      }
      if (!userProfile?.isEmployed) {
        steps.push(t('results.tanf.nextSteps.workRequirements'));
      }
      break;
    case 'maybe':
    case 'unlikely':
      steps.push(t('results.tanf.nextSteps.discuss'));
      steps.push(t('results.tanf.nextSteps.alternatives'));
      steps.push(t('results.tanf.nextSteps.checkBack'));
      break;
    case 'not-qualified':
      steps.push(t('results.tanf.nextSteps.discuss'));
      steps.push(t('results.tanf.nextSteps.alternatives'));
      steps.push(t('results.tanf.nextSteps.reapply'));
      break;
  }

  return steps;
}

/**
 * Get TANF-specific benefit information
 */
function getTanfBenefitInfo(userProfile?: { hasChildren?: boolean; householdSize?: number }, t: (key: string) => string): string[] {
  const benefits: string[] = [];

  if (userProfile?.hasChildren) {
    benefits.push(t('results.tanf.benefits.cashAssistance'));
    benefits.push(t('results.tanf.benefits.familySupport'));
    benefits.push(t('results.tanf.benefits.childcare'));
  } else {
    benefits.push(t('results.tanf.benefits.generalCash'));
    benefits.push(t('results.tanf.benefits.workSupport'));
    benefits.push(t('results.tanf.benefits.services'));
  }

  benefits.push(t('results.tanf.benefits.timeLimit'));
  benefits.push(t('results.tanf.benefits.workRequirements'));

  return benefits;
}

/**
 * Get TANF-specific requirements explanation
 */
function getTanfRequirementsExplanation(userProfile?: { hasChildren?: boolean; householdSize?: number }, t: (key: string) => string): string[] {
  const requirements: string[] = [];

  requirements.push(t('results.tanf.requirements.citizenship'));
  requirements.push(t('results.tanf.requirements.residence'));
  requirements.push(t('results.tanf.requirements.income'));

  if (userProfile?.hasChildren) {
    requirements.push(t('results.tanf.requirements.children'));
  } else {
    requirements.push(t('results.tanf.requirements.family'));
  }

  requirements.push(t('results.tanf.requirements.work'));
  requirements.push(t('results.tanf.requirements.timeLimit'));

  return requirements;
}

export const TanfExplanation: React.FC<TanfExplanationProps> = ({
  programName,
  status,
  explanation,
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

  const statusMessage = getTanfStatusMessage(status, userProfile, t);
  const nextSteps = getTanfNextSteps(status, userProfile, t);
  const benefits = getTanfBenefitInfo(userProfile, t);
  const requirements = getTanfRequirementsExplanation(userProfile, t);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
            Why this result?
          </Dialog.Title>
          <p className="text-gray-600">{programName}</p>
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

      {/* TANF-Specific Information */}
      <div className="space-y-6">
        {/* What TANF Provides */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">💰</span>
            {t('results.tanf.benefits.title')}
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

        {/* TANF Requirements */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">📋</span>
            {t('results.tanf.requirements.title')}
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
            {t('results.tanf.nextSteps.title')}
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
            <span className="text-lg mr-2">🏛️</span>
            {t('results.tanf.howToApply.title')}
          </h4>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>{t('results.tanf.howToApply.findOffice')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>{t('results.tanf.howToApply.schedule')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>{t('results.tanf.howToApply.bringDocuments')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <span>{t('results.tanf.howToApply.interview')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">5.</span>
              <span>{t('results.tanf.howToApply.workPlan')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">6.</span>
              <span>{t('results.tanf.howToApply.receiveBenefits')}</span>
            </li>
          </ol>
        </div>

        {/* Additional Resources */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="text-lg mr-2">ℹ️</span>
            {t('results.tanf.resources.title')}
          </h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• {t('results.tanf.resources.website')}: <a href="https://www.acf.hhs.gov/ofa" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">acf.hhs.gov/ofa</a></li>
            <li>• {t('results.tanf.resources.hotline')}</li>
            <li>• {t('results.tanf.resources.workServices')}</li>
            <li>• {t('results.tanf.resources.childcare')}</li>
            <li>• {t('results.tanf.resources.statePrograms')}</li>
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

export default TanfExplanation;
