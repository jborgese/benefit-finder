import React, { useState, useEffect } from 'react';
import { EnhancedQuestionnaire } from './questionnaire/ui';
import { ResultsSummary, ProgramCard, ResultsExport, ResultsImport, QuestionnaireAnswersCard, type EligibilityResults } from './components/results';
import { useResultsManagement } from './components/results/useResultsManagement';
import { Button } from './components/Button';
import { LiveRegion } from './questionnaire/accessibility';

// Import database functions
import { clearDatabase } from './db';
import { createUserProfile } from './db/utils';
import { evaluateAllPrograms, getAllProgramRuleIds, type EligibilityEvaluationResult } from './rules';

// Import utilities
import { initializeApp } from './utils/initializeApp';
import { formatCriteriaDetails } from './utils/formatCriteriaDetails';
import { getProgramName, getProgramDescription } from './utils/programHelpers';
import { createSampleResults as createSampleResultsData } from './utils/createSampleResults';
import { sampleFlow } from './questionnaire/sampleFlow';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';

type AppState = 'home' | 'questionnaire' | 'results' | 'error';

function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('results')) {
        return 'results';
      }
    } catch {
      // no-op
    }
    return 'home';
  });
  const [hasResults, setHasResults] = useState(false);
  const [currentResults, setCurrentResults] = useState<EligibilityResults | null>(null);
  const [isProcessingResults, setIsProcessingResults] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { saveResults, loadAllResults, loadResult } = useResultsManagement();

  // Check for existing results on app startup
  useEffect(() => {
    const checkExistingResults = async (): Promise<void> => {
      try {
        const results = await loadAllResults();
        if (results.length > 0) {
          setHasResults(true);
          // Load the most recent results for display
          const mostRecent = results[0]; // loadAllResults should return sorted by date
          const actualResults = await loadResult(mostRecent.id);
          if (actualResults) {
            setCurrentResults(actualResults);
          }
        }
      } catch (error) {
        console.error('Failed to check for existing results:', error);
      }
    };

    void checkExistingResults();
  }, [loadAllResults, loadResult]);

  // Lightweight routing: if URL path includes "results", show results view immediately
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('results')) {
        setAppState('results');

        // For E2E testing ONLY: create sample results if URL has explicit testing parameter
        // This should NEVER be shown to real users in development or production
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'true' && (
          // Only allow in test environments with explicit user agent or host indicators
          (typeof navigator !== 'undefined' && navigator.userAgent.includes('HeadlessChrome')) ||
          (typeof window !== 'undefined' && window.location.hostname === 'localhost' && urlParams.has('playwright'))
        )) {
          createSampleResults();
        }
      }
    } catch {
      // no-op: defensive for non-browser environments
    }
  }, []);

  // Development helper - make clearDatabase available globally
  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).clearBenefitFinderDatabase = async () => {
      try {
        await clearDatabase();
        console.warn('Database cleared successfully. Please refresh the page.');
        // In dev mode, we use window.location.reload() instead of alert
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear database:', error);
      }
    };
  }

  const handleStartQuestionnaire = (): void => {
    setAppState('questionnaire');
  };

  const handleGoHome = (): void => {
    setAppState('home');
    setIsProcessingResults(false);
    setErrorMessage('');
    setAnnouncementMessage('');
  };

  const handleCompleteQuestionnaire = async (answers: Record<string, unknown>): Promise<void> => {
    try {
      // Immediately transition to results UI; perform work in background
      setAppState('results');
      setIsProcessingResults(true);
      setAnnouncementMessage('Assessment completed. Preparing results...');

      // Initialize database and load sample data if needed (background)
      await initializeApp();
    } catch (dbError) {
      console.error('Database initialization failed:', dbError);

      // Show error message to user instead of continuing with broken state
      setErrorMessage('Unable to initialize the application database. Please try refreshing the page or contact support if the issue persists.');
      setIsProcessingResults(false);
      setAppState('error');
      return;
    }

    try {
      // Convert questionnaire answers to user profile format
      const householdIncome = answers.householdIncome as number;
      const incomePeriod = answers.incomePeriod as string;
      const householdSize = answers.householdSize as number;
      const age = answers.age as number;

      // Convert income to annual amount based on user's selection
      const annualIncome = incomePeriod === 'monthly' ? householdIncome * 12 : householdIncome;

      // Create user profile from answers
      const profileData = {
        householdSize,
        householdIncome: annualIncome,
        incomePeriod: incomePeriod as 'monthly' | 'annual',
        // Set age from date of birth (approximate)
        dateOfBirth: new Date(new Date().getFullYear() - age, 0, 1).toISOString().split('T')[0],
        citizenship: 'us_citizen' as const,
        employmentStatus: 'employed' as const,
        // Only include fields that were actually collected from the user
        // Don't set defaults for fields not asked in questionnaire
      };

      // Create user profile and evaluate eligibility
      let profile;
      let batchResult;

      try {
        profile = await createUserProfile(profileData);
        batchResult = await evaluateAllPrograms(profile.id);
      } catch (dbError) {
        console.error('Database operations failed:', dbError);

        // Show error message to user instead of fallback results
        setErrorMessage('Unable to calculate eligibility results at this time. Please try refreshing the page or contact support if the issue persists.');
        setIsProcessingResults(false);
        setAppState('error');
        return;
      }

      // Convert batch results to array for easier processing
      const evaluationResults = Array.from(batchResult.programResults.values());

      // Get all program rules for each program (for comprehensive requirements display)
      const programRulesMap = new Map<string, string[]>();
      for (const result of evaluationResults) {
        if (!programRulesMap.has(result.programId)) {
          const allRules = await getAllProgramRuleIds(result.programId);
          programRulesMap.set(result.programId, allRules);
        }
      }

      // Convert evaluation results to the expected format
      const qualifiedResults = evaluationResults
        .filter((result: EligibilityEvaluationResult) => result.eligible)
        .map((result: EligibilityEvaluationResult) => ({
          programId: result.programId,
          programName: getProgramName(result.programId),
          programDescription: getProgramDescription(result.programId),
          jurisdiction: US_FEDERAL_JURISDICTION,
          status: 'qualified' as const,
          confidence: result.confidence > 80 ? 'high' as const : 'medium' as const,
          confidenceScore: result.confidence,
          explanation: {
            reason: result.reason,
            details: formatCriteriaDetails(result.criteriaResults, result.eligible),
            rulesCited: programRulesMap.get(result.programId) ?? [result.ruleId]
          },
          requiredDocuments: result.requiredDocuments?.map(doc => ({
            id: `doc-${Math.random().toString(36).substr(2, 9)}`,
            name: doc.document,
            required: true, // All documents from the rule engine are required
            description: doc.description,
            where: doc.where
          })) ?? [],
          nextSteps: result.nextSteps?.map(step => ({
            step: step.step,
            url: step.url,
            priority: step.priority ?? 'medium' as const
          })) ?? [],
          estimatedBenefit: result.estimatedBenefit ? {
            amount: result.estimatedBenefit.amount ?? 0,
            frequency: ((): 'monthly' | 'annual' | 'one-time' => {
              const freq = result.estimatedBenefit.frequency;
              if (freq === 'one_time') return 'one-time';
              if (freq === 'quarterly') return 'monthly';
              if (freq === 'annual') return 'annual';
              return 'monthly';
            })(),
            description: result.estimatedBenefit.description
          } : undefined,
          evaluatedAt: new Date(result.evaluatedAt),
          rulesVersion: result.ruleVersion ?? '1.0.0'
        }));

      // Handle ineligible results based on confidence and completeness
      const maybeResults = evaluationResults
        .filter((result: EligibilityEvaluationResult) => !result.eligible && ((result.incomplete ?? false) || result.confidence < 70))
        .map((result: EligibilityEvaluationResult) => ({
          programId: result.programId,
          programName: getProgramName(result.programId),
          programDescription: getProgramDescription(result.programId),
          jurisdiction: US_FEDERAL_JURISDICTION,
          status: 'maybe' as const,
          confidence: result.confidence < 50 ? 'low' as const : 'medium' as const,
          confidenceScore: result.confidence,
          explanation: {
            reason: result.reason,
            details: formatCriteriaDetails(result.criteriaResults, result.eligible),
            rulesCited: programRulesMap.get(result.programId) ?? [result.ruleId]
          },
          requiredDocuments: result.requiredDocuments?.map(doc => ({
            id: `doc-${Math.random().toString(36).substr(2, 9)}`,
            name: doc.document,
            required: true,
            description: doc.description,
            where: doc.where
          })) ?? [],
          nextSteps: result.nextSteps?.map(step => ({
            step: step.step,
            url: step.url,
            priority: step.priority ?? 'medium' as const
          })) ?? [],
          evaluatedAt: new Date(result.evaluatedAt),
          rulesVersion: result.ruleVersion ?? '1.0.0'
        }));

      const notQualifiedResults = evaluationResults
        .filter((result: EligibilityEvaluationResult) => !result.eligible && !result.incomplete && result.confidence >= 70)
        .map((result: EligibilityEvaluationResult) => ({
          programId: result.programId,
          programName: getProgramName(result.programId),
          programDescription: getProgramDescription(result.programId),
          jurisdiction: US_FEDERAL_JURISDICTION,
          status: 'not-qualified' as const,
          confidence: result.confidence >= 90 ? 'high' as const : 'medium' as const,
          confidenceScore: result.confidence,
          explanation: {
            reason: result.reason,
            details: formatCriteriaDetails(result.criteriaResults, result.eligible),
            rulesCited: programRulesMap.get(result.programId) ?? [result.ruleId]
          },
          requiredDocuments: result.requiredDocuments?.map(doc => ({
            id: `doc-${Math.random().toString(36).substr(2, 9)}`,
            name: doc.document,
            required: true,
            description: doc.description,
            where: doc.where
          })) ?? [],
          nextSteps: result.nextSteps?.map(step => ({
            step: step.step,
            url: step.url,
            priority: step.priority ?? 'medium' as const
          })) ?? [],
          evaluatedAt: new Date(result.evaluatedAt),
          rulesVersion: result.ruleVersion ?? '1.0.0'
        }));

      const results = {
        qualified: qualifiedResults,
        likely: [], // No "likely" category - either qualified, maybe, or not qualified
        maybe: maybeResults,
        notQualified: notQualifiedResults,
        totalPrograms: evaluationResults.length,
        evaluatedAt: new Date()
      };

      await saveResults({ results });
      setCurrentResults(results);
      setHasResults(true);
      setIsProcessingResults(false);
      setAnnouncementMessage('Results are ready.');
    } catch (error) {
      console.error('Error evaluating eligibility:', error);
      setIsProcessingResults(false);
      setAnnouncementMessage('Error evaluating eligibility. Please try again.');
    }
  };

  const handleViewResults = (): void => {
    setAppState('results');
    setAnnouncementMessage('Viewing benefit eligibility results.');
  };

  const handleBackToHome = (): void => {
    setAppState('home');
  };

  const handleNewAssessment = (): void => {
    setHasResults(false);
    setIsProcessingResults(false);
    setAppState('questionnaire');
  };

  const handleImportResults = async (results: EligibilityResults): Promise<void> => {
    try {
      await saveResults({ results });
      setCurrentResults(results);
      setHasResults(true);
      setAnnouncementMessage('Results imported successfully.');
    } catch (error) {
      console.error('Failed to import results:', error);
      setAnnouncementMessage('Failed to import results. Please try again.');
    }
  };

  // Create sample results for testing
  const createSampleResults = (): void => {
    const sampleResults = createSampleResultsData();
    setCurrentResults(sampleResults);
    setHasResults(true);

    // Also save to localStorage for persistence
    void saveResults({ results: sampleResults });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Screen reader announcements */}
      <LiveRegion
        message={announcementMessage}
        priority="polite"
        clearAfter={3000}
      />

      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">BenefitFinder</h1>
          <div className="flex items-center space-x-4">
            {appState !== 'home' && (
              <Button
                variant="secondary"
                onClick={handleBackToHome}
                aria-label="Back to home"
              >
                Home
              </Button>
            )}
            {hasResults && appState !== 'results' && (
              <Button
                variant="secondary"
                onClick={handleViewResults}
                aria-label="View results"
              >
                View Results
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {appState === 'home' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              {hasResults ? 'Your Benefit Eligibility Results' : 'Benefit Eligibility Assessment'}
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Check your eligibility for government benefits with our privacy-preserving assessment tool.
              All processing happens locally in your browser.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartQuestionnaire}
                className="px-8 py-3"
                aria-label="Start new benefit assessment"
              >
                {hasResults ? 'New Assessment' : 'Start Assessment'}
              </Button>

              {hasResults && (
                <Button
                  variant="secondary"
                  onClick={handleViewResults}
                  className="px-8 py-3"
                  aria-label="View previous results"
                >
                  View Previous Results
                </Button>
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
                <p className="text-slate-300 text-sm">
                  All data processing happens locally in your browser. No data is sent to external servers.
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Offline Ready</h3>
                <p className="text-slate-300 text-sm">
                  Works completely offline. No internet connection required for assessments.
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Accessible</h3>
                <p className="text-slate-300 text-sm">
                  Built with accessibility in mind, supporting screen readers and keyboard navigation.
                </p>
              </div>
            </div>
          </div>
        )}

        {appState === 'questionnaire' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Benefit Eligibility Assessment</h2>
            </div>

            <EnhancedQuestionnaire
              flow={sampleFlow}
              onComplete={(answers): void => {
                void handleCompleteQuestionnaire(answers);
              }}
            />
          </div>
        )}

        {appState === 'error' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-red-400">Error</h2>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Unable to Process Request</h3>
                  <p className="text-slate-300 mb-4">{errorMessage}</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleGoHome}
                      variant="primary"
                      aria-label="Return to home page"
                    >
                      Return to Home
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="secondary"
                      aria-label="Refresh the page"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {appState === 'results' && (
          <div>
            {/* Avoid nested ternary by early return pattern */}
            {isProcessingResults && (
              <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-8 text-center max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-4">
                  Processing Your Results
                </h2>
                <p className="text-slate-300 mb-6">
                  We&apos;re analyzing your eligibility for government benefit programs. This will only take a moment...
                </p>
                <div className="flex items-center justify-center text-slate-400 text-sm">
                  <div className="animate-pulse">•</div>
                  <div className="animate-pulse mx-2" style={{ animationDelay: '0.2s' }}>•</div>
                  <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>•</div>
                </div>
              </div>
            )}
            {!isProcessingResults && currentResults ? (
              <div>
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold">Your Benefit Eligibility Results</h2>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                      <Button
                        variant="secondary"
                        onClick={handleNewAssessment}
                        aria-label="Start new assessment"
                        className="w-full sm:w-auto"
                      >
                        New Assessment
                      </Button>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <ResultsExport results={currentResults} />
                        <ResultsImport onImport={(results) => void handleImportResults(results)} />
                      </div>
                    </div>
                  </div>
                </div>

                <ResultsSummary results={currentResults} />

                <QuestionnaireAnswersCard />

                <div className="mt-8 space-y-6">
                  {/* Qualified Programs */}
                  {currentResults.qualified.map((result) => (
                    <ProgramCard
                      key={result.programId}
                      result={result}
                      className="max-w-4xl mx-auto"
                    />
                  ))}

                  {/* Maybe Programs */}
                  {currentResults.maybe.map((result) => (
                    <ProgramCard
                      key={result.programId}
                      result={result}
                      className="max-w-4xl mx-auto"
                    />
                  ))}

                  {/* Likely Programs */}
                  {currentResults.likely.map((result) => (
                    <ProgramCard
                      key={result.programId}
                      result={result}
                      className="max-w-4xl mx-auto"
                    />
                  ))}

                  {/* Not Qualified Programs */}
                  {currentResults.notQualified.map((result) => (
                    <ProgramCard
                      key={result.programId}
                      result={result}
                      className="max-w-4xl mx-auto"
                    />
                  ))}
                </div>

                {/* Helpful links for accessibility */}
                <div className="mt-8 bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Government Resources</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a
                            href="https://www.benefits.gov"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                            aria-label="Visit Benefits.gov to learn about federal benefits"
                          >
                            Benefits.gov - Federal Benefits Information
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
                            USA.gov - Government Benefits Guide
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Support & Assistance</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a
                            href="tel:211"
                            className="text-blue-400 hover:text-blue-300 underline"
                            aria-label="Call 211 for local assistance with benefits and services"
                          >
                            211 - Local Assistance Hotline
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
                            Healthcare.gov - Health Insurance
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-8 text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-4" aria-hidden="true">📝</div>
                <h2 className="text-2xl font-bold text-slate-100 mb-4">
                  No Results Available
                </h2>
                <p className="text-slate-300 mb-6">
                  Complete the eligibility questionnaire to see which government benefit programs you may qualify for.
                </p>
                <Button
                  onClick={handleNewAssessment}
                  variant="primary"
                  className="inline-flex items-center gap-2"
                >
                  Start Assessment
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
