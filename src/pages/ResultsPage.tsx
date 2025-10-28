/**
 * Results Page Component
 *
 * Optimized results page with lazy-loaded components
 */

import React from 'react';
import { Button } from '../components/Button';
import {
  LazyResultsSummary,
  LazyProgramCard,
  LazyResultsExport,
  LazyResultsImport,
  LazyQuestionnaireAnswersCard
} from '../components/LazyComponents';
import { useI18n } from '../i18n/hooks';
import type { EligibilityResults } from '../components/results';

interface ResultsPageProps {
  currentResults: EligibilityResults | null;
  currentUserProfile: { state?: string;[key: string]: unknown } | null;
  isProcessingResults: boolean;
  onNewAssessment: () => void;
  onImportResults: (results: EligibilityResults) => Promise<void>;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  currentResults,
  currentUserProfile,
  isProcessingResults,
  onNewAssessment,
  onImportResults,
}) => {
  const { t } = useI18n();

  if (isProcessingResults) {
    return (
      <div className="bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 p-12 text-center max-w-2xl mx-auto animate-scale-in">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute top-0 left-0"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
        </div>
        <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          {t('results.processing.title')}
        </h2>
        <p className="text-secondary-600 dark:text-secondary-300 mb-8 text-lg">
          {t('results.processing.description')}
        </p>
        <div className="flex items-center justify-center text-primary-600 text-lg">
          <div className="animate-pulse-soft">•</div>
          <div className="animate-pulse-soft mx-3" style={{ animationDelay: '0.2s' }}>•</div>
          <div className="animate-pulse-soft" style={{ animationDelay: '0.4s' }}>•</div>
        </div>
      </div>
    );
  }

  if (!currentResults || (
    currentResults.qualified.length === 0 &&
    currentResults.maybe.length === 0 &&
    currentResults.likely.length === 0 &&
    currentResults.notQualified.length === 0
  )) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-8 text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-4" aria-hidden="true">📝</div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">
          {t('results.noResults.title')}
        </h2>
        <p className="text-slate-300 mb-6">
          {t('results.noResults.description')}
        </p>
        <Button
          onClick={onNewAssessment}
          variant="primary"
          className="inline-flex items-center gap-2"
        >
          {t('results.noResults.startAssessment')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 animate-fade-in-up px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              {t('results.summary.title')}
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300 text-sm sm:text-base">
              Your personalized benefit eligibility results
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewAssessment}
              aria-label="Start new assessment"
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {t('results.actions.newAssessment')}
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
              <LazyResultsExport results={currentResults} />
              <LazyResultsImport onImport={onImportResults} />
            </div>
          </div>
        </div>
      </div>

      <LazyResultsSummary results={currentResults} />
      <LazyQuestionnaireAnswersCard />

      <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Qualified Programs */}
        {currentResults.qualified.map((result) => (
          <LazyProgramCard
            key={result.programId}
            result={result}
            userProfile={currentUserProfile ?? undefined}
            className="max-w-4xl mx-auto animate-fade-in-up"
          />
        ))}

        {/* Maybe Programs */}
        {currentResults.maybe.map((result) => (
          <LazyProgramCard
            key={result.programId}
            result={result}
            userProfile={currentUserProfile ?? undefined}
            className="max-w-4xl mx-auto animate-fade-in-up"
          />
        ))}

        {/* Likely Programs */}
        {currentResults.likely.map((result) => (
          <LazyProgramCard
            key={result.programId}
            result={result}
            userProfile={currentUserProfile ?? undefined}
            className="max-w-4xl mx-auto animate-fade-in-up"
          />
        ))}

        {/* Not Qualified Programs */}
        {currentResults.notQualified.map((result) => (
          <LazyProgramCard
            key={result.programId}
            result={result}
            userProfile={currentUserProfile ?? undefined}
            className="max-w-4xl mx-auto animate-fade-in-up"
          />
        ))}
      </div>

      {/* Helpful links for accessibility */}
      <div className="mt-6 sm:mt-8 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-secondary-200 dark:border-secondary-700 max-w-4xl mx-auto mx-4 sm:mx-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-secondary-900 dark:text-secondary-100">{t('results.resources.title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-medium mb-2">{t('results.resources.government')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.benefits.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                  aria-label="Visit Benefits.gov to learn about federal benefits"
                >
                  {t('results.resources.benefitsGov')}
                </a>
              </li>
              <li>
                <a
                  href="https://www.usa.gov/benefits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                  aria-label="Visit USA.gov benefits page for comprehensive benefit information"
                >
                  {t('results.resources.usaGov')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">{t('results.resources.support')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="tel:211"
                  className="text-blue-400 hover:text-blue-300 underline"
                  aria-label="Call 211 for local assistance with benefits and services"
                >
                  {t('results.resources.localAssistance')}
                </a>
              </li>
              <li>
                <a
                  href="https://www.healthcare.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                  aria-label="Visit Healthcare.gov for health insurance information"
                >
                  {t('results.resources.healthcareGov')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
