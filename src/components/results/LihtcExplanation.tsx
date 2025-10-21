import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '../../i18n/hooks';

// Status helper functions
const getStatusColor = (status: EligibilityStatus): string => {
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

const getStatusIcon = (status: EligibilityStatus): string => {
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
      return '❓';
  }
};

interface LihtcExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  userProfile?: {
    state?: string;
    age?: number;
    householdSize?: number;
    householdIncome?: number;
    isDisabled?: boolean;
    isElderly?: boolean;
    hasChildren?: boolean;
    [key: string]: unknown;
  };
  onClose: () => void;
}

const getLihtcStatusMessage = (status: EligibilityStatus, t: (key: string) => string) => {
  return t(`results.lihtc.statusMessages.${status}`);
};

const getLihtcBenefitInfo = (t: (key: string) => string, userProfile?: LihtcExplanationProps['userProfile']) => {
  const benefits = [
    t('results.lihtc.benefits.affordableHousing'),
    t('results.lihtc.benefits.reducedRent'),
    t('results.lihtc.benefits.qualityHousing'),
    t('results.lihtc.benefits.locationChoice'),
    t('results.lihtc.benefits.longTermStability'),
  ];

  if (userProfile?.isElderly) {
    benefits.push(t('results.lihtc.benefits.elderly'));
  }
  if (userProfile?.isDisabled) {
    benefits.push(t('results.lihtc.benefits.disability'));
  }
  if (userProfile?.hasChildren) {
    benefits.push(t('results.lihtc.benefits.families'));
  }

  return benefits;
};

const getLihtcRequirementsExplanation = (t: (key: string) => string) => {
  return [
    t('results.lihtc.requirements.income'),
    t('results.lihtc.requirements.familySize'),
    t('results.lihtc.requirements.citizenship'),
    t('results.lihtc.requirements.backgroundCheck'),
    t('results.lihtc.requirements.rentalHistory'),
    t('results.lihtc.requirements.application'),
  ];
};

const getLihtcNextSteps = (t: (key: string) => string) => {
  return [
    t('results.lihtc.nextSteps.contact'),
    t('results.lihtc.nextSteps.waitlist'),
    t('results.lihtc.nextSteps.documentation'),
    t('results.lihtc.nextSteps.interview'),
    t('results.lihtc.nextSteps.lease'),
  ];
};

const getLihtcHowToApply = (t: (key: string) => string) => {
  return [
    t('results.lihtc.howToApply.step1'),
    t('results.lihtc.howToApply.step2'),
    t('results.lihtc.howToApply.step3'),
    t('results.lihtc.howToApply.step4'),
    t('results.lihtc.howToApply.step5'),
  ];
};

const getLihtcResources = (t: (key: string) => string) => {
  return [
    t('results.lihtc.resources.website'),
    t('results.lihtc.resources.hotline'),
    t('results.lihtc.resources.localOffice'),
    t('results.lihtc.resources.housingAuthority'),
  ];
};

export const LihtcExplanation: React.FC<LihtcExplanationProps> = ({
  programName,
  status,
  explanation,
  userProfile,
  onClose,
}) => {
  const { t } = useI18n();

  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const statusMessage = getLihtcStatusMessage(status, t);
  const benefits = getLihtcBenefitInfo(t, userProfile);
  const requirements = getLihtcRequirementsExplanation(t);
  const nextSteps = getLihtcNextSteps(t);
  const howToApplySteps = getLihtcHowToApply(t);
  const resources = getLihtcResources(t);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
            Why this result?
          </Dialog.Title>
          <p className="text-gray-600">{programName}</p>
        </div>
        <Dialog.Close asChild>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close explanation">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </Dialog.Close>
      </div>

      <div className={`p-4 rounded-lg border mb-6 ${statusColor}`}>
        <div className="flex items-center">
          <span className="text-3xl mr-3">{statusIcon}</span>
          <div>
            <h3 className="font-semibold text-lg capitalize">{status.replace('-', ' ')}</h3>
            <p className="text-sm">{statusMessage}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-lg mr-2">🏠</span>
          {t('results.lihtc.benefits.title')}
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

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-lg mr-2">📋</span>
          {t('results.lihtc.requirements.title')}
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

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-lg mr-2">📞</span>
          {t('results.lihtc.nextSteps.title')}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <span className="text-lg mr-2">🏠</span>
          {t('results.lihtc.howToApply.title')}
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

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <span className="text-lg mr-2">ℹ️</span>
          {t('results.lihtc.resources.title')}
        </h4>
        <ul className="space-y-1 text-sm text-gray-700">
          {resources.map((resource, index) => (
            <li key={index}>• {resource}</li>
          ))}
        </ul>
      </div>

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
