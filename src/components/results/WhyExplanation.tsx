/**
 * Why Explanation Component
 *
 * Displays detailed explanation for eligibility determination
 */

import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';

interface WhyExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  onClose: () => void;
}

/**
 * Convert technical rule codes to user-friendly descriptions
 */
function getUserFriendlyRuleDescription(ruleCode: string): string {
  // Common rule patterns and their user-friendly descriptions
  const ruleDescriptions: Record<string, string> = {
    // SNAP rules
    'SNAP-INCOME-001': 'Income must be below the program threshold',
    'SNAP-INCOME-002': 'Net income calculation requirements',
    'SNAP-INCOME-003': 'Gross income limits',
    'SNAP-HOUSEHOLD-001': 'Household size eligibility requirements',
    'SNAP-HOUSEHOLD-002': 'Household composition rules',
    'SNAP-ASSETS-001': 'Asset limits for eligibility',
    'SNAP-WORK-001': 'Work requirements and exemptions',
    'SNAP-CITIZENSHIP-001': 'Citizenship and immigration status requirements',

    // Medicaid rules
    'MEDICAID-INCOME-001': 'Income eligibility limits',
    'MEDICAID-ASSETS-001': 'Asset eligibility limits',
    'MEDICAID-HOUSEHOLD-001': 'Household size requirements',
    'MEDICAID-AGE-001': 'Age-based eligibility criteria',
    'MEDICAID-DISABILITY-001': 'Disability status requirements',
    'MEDICAID-PREGNANCY-001': 'Pregnancy-related eligibility',

    // WIC rules
    'WIC-INCOME-001': 'Income eligibility for WIC benefits',
    'WIC-HOUSEHOLD-001': 'Household composition requirements',
    'WIC-NUTRITION-001': 'Nutritional risk assessment',
    'WIC-CATEGORY-001': 'Participant category requirements (pregnant, postpartum, infant, child)',

    // TANF rules
    'TANF-INCOME-001': 'Income limits for cash assistance',
    'TANF-ASSETS-001': 'Asset limits for assistance',
    'TANF-WORK-001': 'Work participation requirements',
    'TANF-TIME-001': 'Time limits for assistance',

    // Housing assistance rules
    'HOUSING-INCOME-001': 'Income limits for housing assistance',
    'HOUSING-HOUSEHOLD-001': 'Household size for housing units',
    'HOUSING-CITIZENSHIP-001': 'Citizenship requirements for housing assistance',

    // General eligibility rules
    'GENERAL-AGE-001': 'Age requirements',
    'GENERAL-INCOME-001': 'Income eligibility requirements',
    'GENERAL-ASSETS-001': 'Asset eligibility requirements',
    'GENERAL-HOUSEHOLD-001': 'Household size requirements',
    'GENERAL-CITIZENSHIP-001': 'Citizenship or immigration status requirements',
    'GENERAL-RESIDENCE-001': 'Residency requirements',
    'GENERAL-DISABILITY-001': 'Disability status requirements',
  };

  // Check for exact match first
  if (Object.prototype.hasOwnProperty.call(ruleDescriptions, ruleCode)) {
    // eslint-disable-next-line security/detect-object-injection -- ruleCode is validated via hasOwnProperty check
    return ruleDescriptions[ruleCode];
  }

  // Parse common patterns for fallback descriptions
  const parts = ruleCode.split('-');
  if (parts.length >= 3) {
    const program = parts[0];
    const category = parts[1];

    const categoryDescriptions: Record<string, string> = {
      'INCOME': 'income eligibility requirements',
      'ASSETS': 'asset eligibility requirements',
      'HOUSEHOLD': 'household size and composition requirements',
      'AGE': 'age-based eligibility criteria',
      'CITIZENSHIP': 'citizenship and immigration status requirements',
      'WORK': 'work participation requirements',
      'DISABILITY': 'disability status requirements',
      'RESIDENCE': 'residency requirements',
      'NUTRITION': 'nutritional risk requirements',
      'CATEGORY': 'participant category requirements',
      'TIME': 'time limit requirements',
    };

    const programDescriptions: Record<string, string> = {
      'SNAP': 'Supplemental Nutrition Assistance Program',
      'MEDICAID': 'Medicaid health insurance',
      'WIC': 'Women, Infants, and Children nutrition program',
      'TANF': 'Temporary Assistance for Needy Families',
      'HOUSING': 'Housing assistance',
      'GENERAL': 'general program',
    };

    const programName = Object.prototype.hasOwnProperty.call(programDescriptions, program)
      // eslint-disable-next-line security/detect-object-injection -- program is validated via hasOwnProperty check
      ? programDescriptions[program]
      : program;
    const categoryDesc = Object.prototype.hasOwnProperty.call(categoryDescriptions, category)
      // eslint-disable-next-line security/detect-object-injection -- category is validated via hasOwnProperty check
      ? categoryDescriptions[category]
      : category.toLowerCase();

    return `${programName} ${categoryDesc}`;
  }

  // Fallback for unrecognized rule codes
  return `Program eligibility requirement (${ruleCode})`;
}

export const WhyExplanation: React.FC<WhyExplanationProps> = ({
  programName,
  status,
  explanation,
  onClose,
}) => {
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
            <p className="text-sm">{explanation.reason}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      {explanation.details.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">How we determined this:</h4>
          <ul className="space-y-2">
            {explanation.details.map((detail, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 mt-0.5">•</span>
                <span className="text-gray-700">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Calculations */}
      {explanation.calculations && explanation.calculations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Calculations:</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            {explanation.calculations.map((calc, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{calc.label}:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-gray-900">
                    {calc.value}
                  </span>
                  {calc.comparison && (
                    <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                      {calc.comparison}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Cited */}
      {explanation.rulesCited.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Based on these requirements:</h4>
          <div className="space-y-2">
            {explanation.rulesCited.map((rule, index) => (
              <div
                key={index}
                className="text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded border border-blue-200"
              >
                {getUserFriendlyRuleDescription(rule)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparency Note */}
      <div className="border-t border-gray-200 pt-4">
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

export default WhyExplanation;

