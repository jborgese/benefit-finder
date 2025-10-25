/**
 * SNAP-Specific Explanation Component
 *
 * Provides user-friendly, informative explanations for SNAP eligibility results
 * with specific guidance for food assistance and EBT benefits.
 */

import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '../../i18n/hooks';
import { SpecificReasonsSection } from './SpecificReasonsSection';

interface SnapExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  userProfile?: {
    state?: string;
    isPregnant?: boolean;
    hasChildren?: boolean;
    householdIncome?: number;
    householdSize?: number;
    age?: number;
    [key: string]: unknown;
  };
  onClose: () => void;
}

/**
 * Get SNAP-specific status messaging
 */
function getSnapStatusMessage(status: EligibilityStatus, userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t: (key: string) => string): string {
  switch (status) {
    case 'qualified':
      return t('results.snap.statusMessages.qualified');
    case 'likely':
      return t('results.snap.statusMessages.likely');
    case 'maybe':
      return t('results.snap.statusMessages.maybe');
    case 'unlikely':
      return t('results.snap.statusMessages.unlikely');
    case 'not-qualified':
      if (userProfile?.isPregnant) {
        return `${t('results.snap.statusMessages.notQualified')} Contact your local SNAP office to discuss your pregnancy and food assistance needs.`;
      } else if (userProfile?.hasChildren) {
        return `${t('results.snap.statusMessages.notQualified')} Contact your local SNAP office to discuss your children and food assistance needs.`;
      }
      return t('results.snap.statusMessages.notQualified');
    default:
      return 'Contact your local SNAP office to discuss your eligibility.';
  }
}

/**
 * Get SNAP-specific next steps based on status and user profile
 */
function getSnapNextSteps(status: EligibilityStatus, userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t: (key: string) => string): string[] {
  const steps: string[] = [];

  switch (status) {
    case 'qualified':
    case 'likely':
      steps.push(t('results.snap.nextSteps.contact'));
      steps.push(t('results.snap.nextSteps.online'));
      steps.push(t('results.snap.nextSteps.documents'));
      if (userProfile?.isPregnant) {
        steps.push(t('results.snap.additionalSteps.prenatalNutrition'));
      }
      if (userProfile?.hasChildren) {
        steps.push(t('results.snap.additionalSteps.familyNutrition'));
      }
      steps.push(t('results.snap.nextSteps.ebtCard'));
      break;
    case 'maybe':
    case 'unlikely':
      steps.push(t('results.snap.nextSteps.contact'));
      steps.push(t('results.snap.additionalSteps.alternativeFood'));
      steps.push('Check back if your situation changes');
      break;
    case 'not-qualified':
      steps.push(t('results.snap.nextSteps.contact'));
      steps.push(t('results.snap.additionalSteps.otherFood'));
      steps.push('Consider reapplying if your situation changes');
      break;
  }

  return steps;
}

/**
 * Get SNAP-specific benefit information
 */
function getSnapBenefitInfo(userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t: (key: string) => string): string[] {
  const benefits: string[] = [];

  benefits.push(t('results.snap.benefits.monthlyBenefits'));
  benefits.push(t('results.snap.benefits.ebtCard'));
  benefits.push(t('results.snap.benefits.foodItems'));
  benefits.push(t('results.snap.benefits.farmerMarkets'));
  benefits.push(t('results.snap.benefits.onlineShopping'));

  if (userProfile?.isPregnant) {
    benefits.push('Nutrition education for pregnant women');
    benefits.push('Prenatal nutrition counseling');
  }

  if (userProfile?.hasChildren) {
    benefits.push('Nutrition education for families with children');
    benefits.push('Children\'s nutrition programs');
  }

  benefits.push(t('results.snap.benefits.nutritionEducation'));
  benefits.push(t('results.snap.benefits.workSupport'));

  return benefits;
}

/**
 * Get SNAP-specific requirements explanation
 */
function getSnapRequirementsExplanation(userProfile?: { isPregnant?: boolean; hasChildren?: boolean }, t: (key: string) => string): string[] {
  const requirements: string[] = [];

  requirements.push(t('results.snap.requirements.citizenship'));
  requirements.push(t('results.snap.requirements.residence'));
  requirements.push(t('results.snap.requirements.income'));
  requirements.push(t('results.snap.requirements.assets'));
  requirements.push(t('results.snap.requirements.work'));
  requirements.push(t('results.snap.requirements.socialSecurity'));

  return requirements;
}

export const SnapExplanation: React.FC<SnapExplanationProps> = ({
  programName,
  status,
  explanation: _explanation,
  userProfile,
  onClose,
}) => {
  const { t } = useI18n();

  // Add SNAP-specific debug logging
  if (import.meta.env.DEV) {
    console.warn(`🔍 [SNAP DEBUG] SnapExplanation rendering:`);
    console.warn(`  - Program Name: ${programName}`);
    console.warn(`  - Status: ${status}`);
    console.warn(`  - User Profile:`, userProfile);
    console.warn(`  - Explanation:`, _explanation);
  }

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

  const statusMessage = getSnapStatusMessage(status, userProfile, t);
  const nextSteps = getSnapNextSteps(status, userProfile, t);
  const benefits = getSnapBenefitInfo(userProfile, t);
  const requirements = getSnapRequirementsExplanation(userProfile, t);

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

      {/* SNAP-Specific Information */}
      <div className="space-y-6">
        {/* Specific Reasons for Not Qualifying */}
        <SpecificReasonsSection
          programId="snap-federal"
          status={status}
          userProfile={userProfile}
        />

        {/* What SNAP Provides */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">🛒</span>
            {t('results.snap.benefits.title')}
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

        {/* SNAP Requirements */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">📋</span>
            {t('results.snap.requirements.title')}
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
            {t('results.snap.nextSteps.title')}
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
            <span className="text-lg mr-2">🏪</span>
            {t('results.snap.howToApply.title')}
          </h4>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>{t('results.snap.howToApply.findOffice')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>{t('results.snap.howToApply.gatherDocuments')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>{t('results.snap.howToApply.completeApplication')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <span>{t('results.snap.howToApply.interview')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">5.</span>
              <span>{t('results.snap.howToApply.verification')}</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">6.</span>
              <span>{t('results.snap.howToApply.ebtCard')}</span>
            </li>
          </ol>
        </div>

        {/* Additional Resources */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="text-lg mr-2">ℹ️</span>
            {t('results.snap.resources.title')}
          </h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• {t('results.snap.resources.website')}: <a href="https://www.fns.usda.gov/snap" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">fns.usda.gov/snap</a></li>
            <li>• {t('results.snap.resources.hotline')}</li>
            <li>• {t('results.snap.resources.nutrition')}</li>
            <li>• {t('results.snap.resources.ebt')}</li>
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

export default SnapExplanation;
