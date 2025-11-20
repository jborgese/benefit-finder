/**
 * Eligibility Result Explanation Component
 *
 * Displays human-readable explanations of eligibility results
 * with expandable details and accessibility support.
 */

import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { explainResult } from '../rules/core/explanation';
import { getContextualLabelFromBasicData } from './results/confidenceUtils';
import type { EligibilityEvaluationResult } from '../rules/core/eligibility';
import type { JsonLogicRule, JsonLogicData } from '../rules/core/types';

// ============================================================================
// TYPES
// ============================================================================

export interface EligibilityResultExplanationProps {
  /** Evaluation result to explain */
  result: EligibilityEvaluationResult;
  /** Rule used for evaluation */
  rule: JsonLogicRule;
  /** Data context used */
  data: JsonLogicData;
  /** Language level */
  languageLevel?: 'simple' | 'standard' | 'technical';
  /** Show detailed breakdown */
  showDetails?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Eligibility Result Explanation component
 *
 * @example
 * ```tsx
 * <EligibilityResultExplanation
 *   result={evaluationResult}
 *   rule={ruleLogic}
 *   data={userData}
 *   languageLevel="simple"
 * />
 * ```
 */
export const EligibilityResultExplanation: React.FC<
  EligibilityResultExplanationProps
> = ({
  result,
  rule,
  data,
  languageLevel = 'standard',
  showDetails = true,
  className = '',
}) => {
    const [expanded, setExpanded] = useState<string[]>([]);

    // Generate explanation
    const explanation = explainResult(result, rule, data, {
      languageLevel,
      includeSuggestions: true,
    });

    // Get status color
    const statusColor = getStatusColor(result.eligible, result.incomplete ?? false);
    const statusIcon = getStatusIcon(result.eligible, result.incomplete ?? false);

    return (
      <div
        className={`
        rounded-lg border p-6 space-y-4
        ${statusColor}
        ${className}
      `}
        role="region"
        aria-label="Eligibility result explanation"
      >
        {/* Status Header */}
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            {statusIcon}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {getStatusHeading(result.eligible, result.incomplete ?? false)}
            </h3>
            <p className="text-sm opacity-90">{explanation.summary}</p>
          </div>
        </div>

        {/* Plain Language Explanation */}
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-line">{explanation.plainLanguage}</p>
        </div>

        {/* Detailed Breakdown (Accordion) */}
        {showDetails && (
          <Accordion.Root
            type="multiple"
            value={expanded}
            onValueChange={setExpanded}
            className="space-y-2"
          >
            {/* Reasoning */}
            {explanation.reasoning.length > 0 && (
              <AccordionItem value="reasoning" title="Why This Result?">
                <ul className="list-disc list-inside space-y-1">
                  {explanation.reasoning.map((reason, idx) => (
                    <li key={idx} className="text-sm">
                      {reason}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            )}

            {/* Criteria Checked */}
            {explanation.criteriaChecked.length > 0 && (
              <AccordionItem value="criteria" title="What Was Checked">
                <div className="space-y-2">
                  {explanation.criteriaPassed.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">
                        Requirements You Meet:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {explanation.criteriaPassed.map((criterion, idx) => (
                          <li key={idx} className="text-green-600">
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {explanation.criteriaFailed.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">
                        Requirements Not Yet Met:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {explanation.criteriaFailed.map((criterion, idx) => (
                          <li key={idx} className="text-red-600">
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionItem>
            )}

            {/* Missing Information */}
            {explanation.missingInformation.length > 0 && (
              <AccordionItem value="missing" title="Information We Still Need">
                <ul className="list-disc list-inside text-sm space-y-1">
                  {explanation.missingInformation.map((field, idx) => (
                    <li key={idx} className="text-yellow-700">
                      {formatFieldName(field)}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            )}

            {/* What Would Change */}
            {explanation.whatWouldChange && explanation.whatWouldChange.length > 0 && (
              <AccordionItem value="changes" title="What Would Change the Result?">
                <ul className="list-disc list-inside text-sm space-y-1">
                  {explanation.whatWouldChange.map((change, idx) => (
                    <li key={idx} className="text-blue-700">
                      {change}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            )}

            {/* Required Documents */}
            {result.requiredDocuments && result.requiredDocuments.length > 0 && (
              <AccordionItem value="documents" title="Required Documents">
                <ul className="list-disc list-inside text-sm space-y-1">
                  {result.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{doc.document}</span>
                      {doc.description && (
                        <span className="text-gray-600"> - {doc.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            )}
          </Accordion.Root>
        )}

        {/* Confidence Indicator */}
        <div className="flex items-center gap-2 text-xs opacity-75">
          {(() => {
            const confidenceLabel = getContextualLabelFromBasicData(result.eligible, result.confidence, result.incomplete);
            return (
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">{confidenceLabel.text}</span>
                {confidenceLabel.icon && <span>{confidenceLabel.icon}</span>}
              </span>
            );
          })()}
          {result.executionTime && (
            <span>• Evaluated in {result.executionTime.toFixed(0)}ms</span>
          )}
          {result.needsReview && (
            <span className="text-yellow-700">• Needs Manual Review</span>
          )}
        </div>
      </div>
    );
  };

/**
 * Accordion item component
 */
const AccordionItem: React.FC<{
  value: string;
  title: string;
  children: React.ReactNode;
}> = ({ value, title, children }) => {
  return (
    <Accordion.Item
      value={value}
      className="border border-gray-300 rounded-md overflow-hidden bg-white"
    >
      <Accordion.Header>
        <Accordion.Trigger className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between group">
          <span>{title}</span>
          <span
            className="transform transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          >
            ▼
          </span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="px-4 py-3 text-sm bg-gray-50">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  );
};

/**
 * Compact result summary (no details)
 */
export const EligibilityResultSummary: React.FC<{
  result: EligibilityEvaluationResult;
  className?: string;
}> = ({ result, className = '' }) => {
  const statusColor = getStatusColor(result.eligible, result.incomplete ?? false);
  const statusIcon = getStatusIcon(result.eligible, result.incomplete ?? false);
  const statusLabel = getStatusLabel(result.eligible, result.incomplete ?? false);

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-md border
        ${statusColor}
        ${className}
      `}
      role="status"
      aria-label={`Eligibility status: ${result.eligible ? 'Eligible' : 'Not eligible'}`}
    >
      <span className="text-lg" aria-hidden="true">
        {statusIcon}
      </span>
      <div>
        <p className="font-medium text-sm">{statusLabel}</p>
        <p className="text-xs opacity-75">
          {getContextualLabelFromBasicData(result.eligible, result.confidence, result.incomplete).text}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status color classes based on eligibility state
 */
function getStatusColor(eligible: boolean, incomplete: boolean): string {
  if (eligible) {
    return 'text-green-700 bg-green-50 border-green-200';
  }
  if (incomplete) {
    return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  }
  return 'text-red-700 bg-red-50 border-red-200';
}

/**
 * Get status icon based on eligibility state
 */
function getStatusIcon(eligible: boolean, incomplete: boolean): string {
  if (eligible) {
    return '✓';
  }
  if (incomplete) {
    return '⚠';
  }
  return '✗';
}

/**
 * Get status heading based on eligibility state
 */
function getStatusHeading(eligible: boolean, incomplete: boolean): string {
  if (eligible) {
    return 'You May Be Eligible';
  }
  if (incomplete) {
    return 'More Information Needed';
  }
  return 'Not Eligible at This Time';
}

/**
 * Get status label based on eligibility state
 */
function getStatusLabel(eligible: boolean, incomplete: boolean): string {
  if (eligible) {
    return 'Eligible';
  }
  if (incomplete) {
    return 'Incomplete';
  }
  return 'Not Eligible';
}

/**
 * Maps technical field names to user-friendly descriptions
 */
const FIELD_NAME_MAPPINGS: Record<string, string> = {
  // Demographics
  'age': 'your age',
  'isPregnant': 'pregnancy status',
  'hasChildren': 'whether you have children',
  'hasQualifyingDisability': 'qualifying disability status',
  'isCitizen': 'citizenship status',
  'isLegalResident': 'legal residency status',
  'ssn': 'Social Security number',

  // Financial
  'householdIncome': 'your household\'s monthly income',
  'householdSize': 'your household size',
  'income': 'your income',
  'grossIncome': 'your gross income',
  'netIncome': 'your net income',
  'monthlyIncome': 'your monthly income',
  'annualIncome': 'your annual income',
  'assets': 'your household assets',
  'resources': 'your available resources',
  'liquidAssets': 'your liquid assets',
  'vehicleValue': 'your vehicle value',
  'bankBalance': 'your bank account balance',

  // Location & State
  'state': 'your state of residence',
  'stateHasExpanded': 'whether your state has expanded coverage',
  'zipCode': 'your ZIP code',
  'county': 'your county',
  'jurisdiction': 'your location',

  // Program-specific
  'hasHealthInsurance': 'current health insurance coverage',
  'employmentStatus': 'your employment status',
  'isStudent': 'student status',
  'isVeteran': 'veteran status',
  'isSenior': 'senior status (65+)',
  'hasMinorChildren': 'whether you have children under 18',

  // Housing
  'housingCosts': 'your housing costs',
  'rentAmount': 'your monthly rent',
  'mortgageAmount': 'your monthly mortgage',
  'isHomeless': 'housing situation',

  // Benefits
  'receivesSSI': 'Supplemental Security Income (SSI)',
  'receivesSNAP': 'SNAP benefits',
  'receivesTANF': 'TANF benefits',
  'receivesWIC': 'WIC benefits',
  'receivesUnemployment': 'unemployment benefits',
};

/**
 * Format field name to human-readable description
 */
function formatFieldName(fieldName: string): string {
  // Check if we have a specific mapping for this field
  if (Object.prototype.hasOwnProperty.call(FIELD_NAME_MAPPINGS, fieldName)) {
    return FIELD_NAME_MAPPINGS[fieldName];  
  }

  // Fall back to converting camelCase or snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

export default EligibilityResultExplanation;

