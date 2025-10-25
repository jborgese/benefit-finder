/**
 * Program Card Component
 *
 * Displays detailed eligibility information for a single program
 */

import React, { useState, useMemo } from 'react';
import { ProgramEligibilityResult } from './types';
import * as Accordion from '@radix-ui/react-accordion';
import * as Dialog from '@radix-ui/react-dialog';
import { WhyExplanation } from './WhyExplanation';
import { WicExplanation } from './WicExplanation';
import { MedicaidExplanation } from './MedicaidExplanation';
import { SnapExplanation } from './SnapExplanation';
import { TanfExplanation } from './TanfExplanation';
import { SsiExplanation } from './SsiExplanation';
import { Section8Explanation } from './Section8Explanation';
import { LihtcExplanation } from './LihtcExplanation';
import { ConfidenceScore } from './ConfidenceScore';
import { DocumentChecklist } from './DocumentChecklist';
import { NextStepsList } from './NextStepsList';
import { useI18n } from '../../i18n/hooks';
import { getProgramNameKey, getProgramDescriptionKey } from '../../utils/programHelpers';

interface ProgramCardProps {
  result: ProgramEligibilityResult;
  userProfile?: {
    state?: string;
    [key: string]: unknown;
  };
  onDocumentToggle?: (documentId: string, obtained: boolean) => void;
  onStepToggle?: (stepIndex: number, completed: boolean) => void;
  className?: string;
}

// Helper function to get status badge configuration
const getStatusBadgeConfig = (status: string, t: (key: string) => string): { classes: string; text: string; icon: string } => {
  const badgeConfigs = {
    'qualified': {
      classes: 'bg-green-100 text-green-800 border-green-300',
      text: t('results.status.qualified'),
      icon: '✓'
    },
    'likely': {
      classes: 'bg-blue-100 text-blue-800 border-blue-300',
      text: t('results.status.likely'),
      icon: '◐'
    },
    'maybe': {
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      text: t('results.status.maybe'),
      icon: '?'
    },
    'unlikely': {
      classes: 'bg-orange-100 text-orange-800 border-orange-300',
      text: t('results.status.unlikely'),
      icon: '◔'
    },
    'not-qualified': {
      classes: 'bg-gray-100 text-gray-800 border-gray-300',
      text: t('results.status.notQualified'),
      icon: '✗'
    }
  };

  // Use a safer approach to avoid object injection
  switch (status) {
    case 'qualified':
      return badgeConfigs.qualified;
    case 'likely':
      return badgeConfigs.likely;
    case 'maybe':
      return badgeConfigs.maybe;
    case 'unlikely':
      return badgeConfigs.unlikely;
    case 'not-qualified':
      return badgeConfigs['not-qualified'];
    default:
      return badgeConfigs['not-qualified'];
  }
};

// Helper function to render status badge
const renderStatusBadge = (status: string, t: (key: string) => string): React.ReactElement => {
  const config = getStatusBadgeConfig(status, t);

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2
        ${config.classes}
      `}
    >
      <span className="mr-1.5">{config.icon}</span>
      {config.text}
    </span>
  );
};

// Helper function to get explanation component
const getExplanationComponent = (programId: string, result: ProgramEligibilityResult, userProfile: { [key: string]: unknown; state?: string } | undefined, onClose: () => void): React.ReactElement => {
  const commonProps = {
    programName: result.programName,
    status: result.status,
    explanation: result.explanation,
    userProfile,
    onClose
  };

  // Use a safer approach to avoid object injection
  let Component = WhyExplanation;
  switch (programId) {
    case 'wic-federal':
      Component = WicExplanation;
      break;
    case 'medicaid-federal':
      Component = MedicaidExplanation;
      break;
    case 'snap-federal':
      Component = SnapExplanation;
      break;
    case 'tanf-federal':
      Component = TanfExplanation;
      break;
    case 'ssi-federal':
      Component = SsiExplanation;
      break;
    case 'section8-federal':
      Component = Section8Explanation;
      break;
    case 'lihtc-federal':
      Component = LihtcExplanation;
      break;
    default:
      Component = WhyExplanation;
      break;
  }
  return <Component {...commonProps} />;
};

export const ProgramCard: React.FC<ProgramCardProps> = React.memo(({
  result,
  userProfile,
  onDocumentToggle,
  onStepToggle,
  className = '',
}) => {
  const { t } = useI18n();
  const [showExplanation, setShowExplanation] = useState(false);


  const { shouldShowDocuments, shouldShowNextSteps, jurisdictionLabel, formattedBenefit } = useMemo(() => {
    const showDocs = result.status === 'qualified' || result.status === 'likely';
    const showSteps = result.status !== 'not-qualified';

    // Memoize jurisdiction label computation
    const jurisdictionMap: Record<string, string> = {
      'US-FEDERAL': '🇺🇸 Federal Program',
      'US-GA': '🍑 Georgia',
      'US-CA': '☀️ California',
      'US-NY': '🗽 New York',
      'US-TX': '⭐ Texas',
      'US-FL': '🌴 Florida',
    };
    const jurisdiction = jurisdictionMap[result.jurisdiction] ?? result.jurisdiction;

    // Memoize benefit formatting
    let benefit = null;
    if (result.estimatedBenefit) {
      benefit = `$${result.estimatedBenefit.amount.toLocaleString()}/${result.estimatedBenefit.frequency}`;
    }

    return {
      shouldShowDocuments: showDocs,
      shouldShowNextSteps: showSteps,
      jurisdictionLabel: jurisdiction,
      formattedBenefit: benefit
    };
  }, [result.status, result.jurisdiction, result.estimatedBenefit]);

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden
        print:shadow-none print:border print:break-inside-avoid
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 print:p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {t(getProgramNameKey(result.programId))}
              </h3>
              {renderStatusBadge(result.status, t)}
            </div>
            <p className="text-sm text-gray-600">{jurisdictionLabel}</p>
          </div>

          <ConfidenceScore
            level={result.confidence}
            score={result.confidenceScore}
            status={result.status}
          />
        </div>

        <p className="text-gray-700 leading-relaxed">{t(getProgramDescriptionKey(result.programId))}</p>

        {/* Estimated Benefit */}
        {result.estimatedBenefit && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Estimated Benefit:
              </span>
              <span className="text-lg font-bold text-blue-700">
                {formattedBenefit}
              </span>
            </div>
            {result.estimatedBenefit.description && (
              <p className="text-xs text-blue-700 mt-1">
                {result.estimatedBenefit.description}
              </p>
            )}
          </div>
        )}

        {/* Why Button */}
        <div className="mt-4 print:hidden">
          <button
            onClick={() => setShowExplanation(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
          >
            <span className="mr-1">❓</span>
            {t('results.actions.whyThisResult')}
          </button>
        </div>
      </div>

      {/* Expandable Sections */}
      <Accordion.Root type="multiple" defaultValue={shouldShowDocuments ? ['documents', 'steps'] : []}>
        {/* Required Documents */}
        {shouldShowDocuments && result.requiredDocuments.length > 0 && (
          <Accordion.Item value="documents" className="border-b border-gray-200">
            <Accordion.Header>
              <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors print:bg-transparent print:p-4">
                <div className="flex items-center">
                  <span className="text-lg mr-2">📄</span>
                  <span className="font-semibold text-gray-900">
                    Required Documents ({result.requiredDocuments.filter(d => d.required).length})
                  </span>
                </div>
                <span className="text-gray-400 print:hidden">▼</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-6 py-4 print:p-4">
              <DocumentChecklist
                documents={result.requiredDocuments}
                onToggle={onDocumentToggle}
              />
            </Accordion.Content>
          </Accordion.Item>
        )}

        {/* Next Steps */}
        {shouldShowNextSteps && result.nextSteps.length > 0 && (
          <Accordion.Item value="steps" className="border-b border-gray-200">
            <Accordion.Header>
              <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors print:bg-transparent print:p-4">
                <div className="flex items-center">
                  <span className="text-lg mr-2">✅</span>
                  <span className="font-semibold text-gray-900">
                    Next Steps ({result.nextSteps.length})
                  </span>
                </div>
                <span className="text-gray-400 print:hidden">▼</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-6 py-4 print:p-4">
              <NextStepsList
                steps={result.nextSteps}
                onToggle={onStepToggle}
              />
            </Accordion.Content>
          </Accordion.Item>
        )}

        {/* Additional Information */}
        {(result.processingTime ?? result.applicationDeadline) && (
          <Accordion.Item value="info">
            <Accordion.Header>
              <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors print:bg-transparent print:p-4">
                <div className="flex items-center">
                  <span className="text-lg mr-2">ℹ️</span>
                  <span className="font-semibold text-gray-900">
                    Additional Information
                  </span>
                </div>
                <span className="text-gray-400 print:hidden">▼</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-6 py-4 space-y-3 print:p-4">
              {result.processingTime && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Processing Time:</span>
                  <p className="text-sm text-gray-600 mt-1">{result.processingTime}</p>
                </div>
              )}
              {result.applicationDeadline && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Application Deadline:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {result.applicationDeadline.toLocaleDateString()}
                  </p>
                </div>
              )}
            </Accordion.Content>
          </Accordion.Item>
        )}
      </Accordion.Root>

      {/* Explanation Dialog */}
      <Dialog.Root open={showExplanation} onOpenChange={setShowExplanation}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 print:hidden" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50 print:hidden"
          >
            {getExplanationComponent(result.programId, result, userProfile, () => setShowExplanation(false))}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
});

ProgramCard.displayName = 'ProgramCard';

export default ProgramCard;

