/**
 * Why Explanation Component
 *
 * Displays detailed explanation for eligibility determination
 */

import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';

/**
 * Medicaid expansion status by state code (as of 2024)
 * Source: https://www.kff.org/medicaid/issue-brief/status-of-state-medicaid-expansion-decisions-interactive-map/
 */
const MEDICAID_EXPANSION_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MO', 'MT', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SD', 'UT', 'VT', 'VA', 'WA', 'WV'
]);

/**
 * Determine if a state has expanded Medicaid under the ACA
 */
function isMedicaidExpansionState(stateCode: string): boolean {
  return MEDICAID_EXPANSION_STATE_CODES.has(stateCode);
}

interface WhyExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  userProfile?: {
    state?: string;
    [key: string]: unknown;
  };
  onClose: () => void;
}

/**
 * Get program identifier mappings
 */
function getProgramIdentifierMappings(): Record<string, string> {
  return {
    'medicaid federal': 'Federal Medicaid eligibility requirements including income limits, household size requirements, and citizenship status',
    'snap federal': 'Federal SNAP (Food Stamps) eligibility requirements including income limits, asset limits, work requirements, and household composition',
    'medicaid': 'Medicaid eligibility requirements including income limits, household size requirements, and citizenship status',
    'snap': 'SNAP (Food Stamps) eligibility requirements including income limits, asset limits, work requirements, and household composition',
    'wic federal': 'Federal WIC eligibility requirements including income limits, nutritional risk assessment, and participant category requirements',
    'wic': 'WIC eligibility requirements including income limits, nutritional risk assessment, and participant category requirements',
    'tanf federal': 'Federal TANF eligibility requirements including income limits, asset limits, work participation requirements, and time limits',
    'tanf': 'TANF eligibility requirements including income limits, asset limits, work participation requirements, and time limits',
    'housing federal': 'Federal housing assistance eligibility requirements including income limits, household size requirements, and citizenship status',
    'housing': 'Housing assistance eligibility requirements including income limits, household size requirements, and citizenship status',
    'liheap federal': 'Federal LIHEAP eligibility requirements including income limits and household composition',
    'liheap': 'LIHEAP eligibility requirements including income limits and household composition',
    'childcare federal': 'Federal childcare assistance eligibility requirements including income limits and work/education requirements',
    'childcare': 'Childcare assistance eligibility requirements including income limits and work/education requirements',

    // Handle actual Medicaid rule IDs from the JSON file
    'medicaid-federal-expansion-income': 'Federal Medicaid expansion income eligibility (138% of federal poverty level for adults under 65 in expansion states)',
    'medicaid-federal-children': 'Federal Medicaid eligibility for children (up to 200% FPL for children under 19)',
    'medicaid-federal-pregnant-women': 'Federal Medicaid eligibility for pregnant women (up to 200% FPL minimum)',
    'medicaid-federal-disability': 'Federal Medicaid eligibility for people with disabilities (SSI recipients and others meeting disability criteria)',
    'medicaid-federal-citizenship': 'Federal Medicaid citizenship and immigration status requirements',
    'medicaid-federal-residence-requirement': 'Federal Medicaid state residence requirements',

    // Handle actual SNAP rule IDs from the JSON file
    'snap-federal-gross-income': 'Federal SNAP gross income eligibility (130% of federal poverty level for most households)',
    'snap-federal-net-income': 'Federal SNAP net income eligibility (100% of federal poverty level after deductions)',
    'snap-federal-citizenship': 'Federal SNAP citizenship and immigration status requirements',
    'snap-federal-asset-limit': 'Federal SNAP asset limits ($2,750 for most households, $4,250 for elderly/disabled)',
    'snap-federal-work-requirement': 'Federal SNAP work requirements for able-bodied adults without dependents (ABAWD)',
    'snap-federal-social-security': 'Federal SNAP Social Security Number requirements for all household members',
    'snap-federal-residence': 'Federal SNAP state residence requirements',
  };
}

/**
 * Get rule descriptions for common patterns
 */
function getRuleDescriptions(): Record<string, string> {
  return {
    // SNAP rules
    'SNAP-INCOME-001': 'Gross monthly income must be below 130% of federal poverty level',
    'SNAP-INCOME-002': 'Net monthly income must be below 100% of federal poverty level',
    'SNAP-INCOME-003': 'Gross income limits (130% of poverty)',
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
}

/**
 * Handle state-specific Medicaid expansion messaging
 */
function handleMedicaidExpansionMessaging(ruleCode: string, userProfile?: { state?: string }): string | null {
  if (ruleCode !== 'medicaid-federal-residence-requirement' || !userProfile?.state) {
    return null;
  }

  const stateName = userProfile.state;
  const isExpansionState = isMedicaidExpansionState(stateName);

  if (isExpansionState) {
    return `Federal Medicaid state residence requirements (${stateName} has expanded Medicaid under the ACA)`;
  }
  return `Federal Medicaid state residence requirements (${stateName} has NOT expanded Medicaid under the ACA - this limits adult eligibility)`;
}

/**
 * Try to find relevant calculation for rule
 */
function findRelevantCalculation(
  calculations?: Array<{ label: string; value: string | number; comparison?: string }>
): string | null {
  if (!calculations || calculations.length === 0) {
    return null;
  }

  const relevantCalc = calculations.find(calc =>
    calc.label.toLowerCase().includes('income') ||
    calc.label.toLowerCase().includes('threshold') ||
    calc.label.toLowerCase().includes('limit')
  );

  if (!relevantCalc) {
    return null;
  }

  return `${relevantCalc.label}: ${relevantCalc.value}${relevantCalc.comparison ? ` (${relevantCalc.comparison})` : ''}`;
}

/**
 * Parse common rule patterns for fallback descriptions
 */
function parseRulePattern(ruleCode: string): string {
  const parts = ruleCode.split('-');
  if (parts.length < 3) {
    return `Program eligibility requirement (${ruleCode})`;
  }

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

    ? programDescriptions[program]
    : program;
  const categoryDesc = Object.prototype.hasOwnProperty.call(categoryDescriptions, category)

    ? categoryDescriptions[category]
    : category.toLowerCase();

  return `${programName} ${categoryDesc}`;
}

/**
 * Convert technical rule codes to user-friendly descriptions with specific values
 */
function getUserFriendlyRuleDescription(
  ruleCode: string,
  calculations?: Array<{ label: string; value: string | number; comparison?: string }>,
  userProfile?: { state?: string;[key: string]: unknown }
): string {
  // Try to find specific calculation for this rule
  const calculationResult = findRelevantCalculation(calculations);
  if (calculationResult) {
    return calculationResult;
  }

  // Handle state-specific Medicaid expansion messaging
  const expansionResult = handleMedicaidExpansionMessaging(ruleCode, userProfile);
  if (expansionResult) {
    return expansionResult;
  }

  const lowerRuleCode = ruleCode.toLowerCase().trim();
  const programMappings = getProgramIdentifierMappings();

  // Direct match first
  if (Object.prototype.hasOwnProperty.call(programMappings, lowerRuleCode)) {

    return programMappings[lowerRuleCode];
  }

  // Partial matching only for simple program names (not rule codes with dashes)
  if (!lowerRuleCode.includes('-') && !lowerRuleCode.includes('_')) {
    for (const [key, value] of Object.entries(programMappings)) {
      if (lowerRuleCode.includes(key) || key.includes(lowerRuleCode)) {
        return value;
      }
    }
  }

  // Check for exact match in rule descriptions
  const ruleDescriptions = getRuleDescriptions();
  if (Object.prototype.hasOwnProperty.call(ruleDescriptions, ruleCode)) {

    return ruleDescriptions[ruleCode];
  }

  // Parse common patterns for fallback descriptions
  return parseRulePattern(ruleCode);
}

export const WhyExplanation: React.FC<WhyExplanationProps> = ({
  programName,
  status,
  explanation,
  userProfile,
  onClose,
}) => {
  // Debug logging to see what rulesCited are being passed to the component
  if (import.meta.env.DEV) {
    console.log(`🔍 [DEBUG] WhyExplanation rulesCited:`, explanation.rulesCited);
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
      {(explanation.details?.length ?? 0) > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">How we determined this:</h4>
          <ul className="space-y-2">
            {(explanation.details ?? []).map((detail, index) => (
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

      {/* Program Requirements */}
      {(explanation.rulesCited?.length ?? 0) > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Program requirements:</h4>
          <div className="space-y-2">
            {(explanation.rulesCited ?? []).map((rule, index) => (
              <div
                key={index}
                className="text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded border border-blue-200"
              >
                {getUserFriendlyRuleDescription(rule, explanation.calculations, userProfile)}
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

