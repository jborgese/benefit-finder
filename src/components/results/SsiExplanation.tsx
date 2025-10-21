import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '../../i18n/hooks';

interface SsiExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  userProfile?: {
    age?: number;
    disability?: boolean;
    income?: number;
    assets?: number;
    state?: string;
    [key: string]: unknown;
  };
  onClose: () => void;
}

export const SsiExplanation: React.FC<SsiExplanationProps> = ({
  programName,
  status,
  explanation,
  userProfile,
  onClose,
}) => {
  const { t } = useI18n();

  // Helper function to get status-specific message
  const getStatusMessage = (status: EligibilityStatus): string => {
    const statusKey = `results.ssi.statusMessages.${status}`;
    return t(statusKey);
  };

  // Helper function to get status color classes
  const getStatusColor = (status: EligibilityStatus): string => {
    const colorMap = {
      'qualified': 'text-green-700 bg-green-50 border-green-200',
      'likely': 'text-blue-700 bg-blue-50 border-blue-200',
      'maybe': 'text-yellow-700 bg-yellow-50 border-yellow-200',
      'unlikely': 'text-orange-700 bg-orange-50 border-orange-200',
      'not-qualified': 'text-gray-700 bg-gray-50 border-gray-200'
    };
    return colorMap[status] || colorMap['not-qualified'];
  };

  // Helper function to get status icon
  const getStatusIcon = (status: EligibilityStatus): string => {
    const iconMap = {
      'qualified': '✅',
      'likely': '✔️',
      'maybe': '❓',
      'unlikely': '⚠️',
      'not-qualified': '❌'
    };
    return iconMap[status] || iconMap['not-qualified'];
  };

  // Get benefits based on user profile
  const getBenefits = (): string[] => {
    const benefits = [
      t('results.ssi.benefits.monthlyCash'),
      t('results.ssi.benefits.medicaid'),
      t('results.ssi.benefits.snap'),
      t('results.ssi.benefits.housing'),
      t('results.ssi.benefits.workIncentives')
    ];

    // Add age-specific benefits
    if (userProfile?.age && userProfile.age >= 65) {
      benefits.push(t('results.ssi.benefits.elderly'));
    }

    // Add disability-specific benefits
    if (userProfile?.disability) {
      benefits.push(t('results.ssi.benefits.disability'));
    }

    return benefits;
  };

  // Get requirements based on user profile
  const getRequirements = (): string[] => {
    const requirements = [
      t('results.ssi.requirements.age'),
      t('results.ssi.requirements.disability'),
      t('results.ssi.requirements.income'),
      t('results.ssi.requirements.assets'),
      t('results.ssi.requirements.citizenship'),
      t('results.ssi.requirements.residence')
    ];

    return requirements;
  };

  // Get next steps based on status
  const getNextSteps = (): string[] => {
    const baseSteps = [
      t('results.ssi.nextSteps.contact'),
      t('results.ssi.nextSteps.gather'),
      t('results.ssi.nextSteps.apply')
    ];

    if (status === 'qualified' || status === 'likely') {
      baseSteps.push(t('results.ssi.nextSteps.urgent'));
    }

    if (status === 'maybe' || status === 'unlikely') {
      baseSteps.push(t('results.ssi.nextSteps.review'));
    }

    return baseSteps;
  };

  // Get how to apply steps
  const getHowToApplySteps = (): string[] => {
    return [
      t('results.ssi.howToApply.step1'),
      t('results.ssi.howToApply.step2'),
      t('results.ssi.howToApply.step3'),
      t('results.ssi.howToApply.step4'),
      t('results.ssi.howToApply.step5')
    ];
  };

  // Get additional resources
  const getResources = (): string[] => {
    return [
      t('results.ssi.resources.website'),
      t('results.ssi.resources.hotline'),
      t('results.ssi.resources.localOffice'),
      t('results.ssi.resources.advocacy')
    ];
  };

  const statusMessage = getStatusMessage(status);
  const benefits = getBenefits();
  const requirements = getRequirements();
  const nextSteps = getNextSteps();
  const howToApplySteps = getHowToApplySteps();
  const resources = getResources();

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Dialog.Close>
      </div>

      {/* Status Badge */}
      <div className={`p-4 rounded-lg border mb-6 ${getStatusColor(status)}`}>
        <div className="flex items-center">
          <span className="text-3xl mr-3">{getStatusIcon(status)}</span>
          <div>
            <h3 className="font-semibold text-lg capitalize">{status.replace('-', ' ')}</h3>
            <p className="text-sm">{statusMessage}</p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-lg mr-2">💰</span>
          {t('results.ssi.benefits.title')}
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

      {/* Requirements Section */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-lg mr-2">📋</span>
          {t('results.ssi.requirements.title')}
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

      {/* Next Steps Section */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-lg mr-2">📞</span>
          {t('results.ssi.nextSteps.title')}
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

      {/* How to Apply Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <span className="text-lg mr-2">💰</span>
          {t('results.ssi.howToApply.title')}
        </h4>
        <ol className="space-y-2 text-sm text-blue-800">
          {howToApplySteps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="font-semibold mr-2">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Additional Resources Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <span className="text-lg mr-2">ℹ️</span>
          {t('results.ssi.resources.title')}
        </h4>
        <ul className="space-y-1 text-sm text-gray-700">
          {resources.map((resource, index) => (
            <li key={index}>• {resource}</li>
          ))}
        </ul>
      </div>

      {/* Privacy Note */}
      <div className="border-t border-gray-200 pt-4 mb-6">
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
