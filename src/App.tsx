import React, { useState, useEffect, useCallback } from 'react';
import { EnhancedQuestionnaire } from './questionnaire/ui';
import { ResultsSummary, ProgramCard, ResultsExport, ResultsImport, QuestionnaireAnswersCard, type EligibilityResults } from './components/results';
import { useResultsManagement } from './components/results/useResultsManagement';
import { Button } from './components/Button';
import { LiveRegion } from './questionnaire/accessibility';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useI18n } from './i18n/hooks';
import { WelcomeTour, HelpTooltip, PrivacyExplainer, QuickStartGuide } from './components/onboarding';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { TextSizeProvider } from './contexts/TextSizeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { TextSizeControls } from './components/TextSizeControls';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { ShortcutsHelp } from './components/ShortcutsHelp';

// Import database functions
import { clearDatabase } from './db';
import { createUserProfile } from './db/utils';
import { clearAndReinitialize } from './utils/clearAndReinitialize';
import { forceFixProgramNames } from './utils/forceFixProgramNames';
import { evaluateAllPrograms, getAllProgramRuleIds, type EligibilityEvaluationResult } from './rules';
import { importRules } from './rules/core/import-export';

// Import utilities
import { initializeApp } from './utils/initializeApp';
import { formatCriteriaDetails } from './utils/formatCriteriaDetails';
import { getProgramName, getProgramDescription } from './utils/programHelpers';
import { createSampleResults as createSampleResultsData } from './utils/createSampleResults';
import { sampleFlow } from './questionnaire/sampleFlow';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';

type AppState = 'home' | 'questionnaire' | 'results' | 'error';

/**
 * Import federal rules that apply to all states
 */
async function importFederalRules(): Promise<void> {
  console.log(`🔍 [DEBUG] importFederalRules: Function called successfully`);
  try {
    console.log(`🔍 [DEBUG] importFederalRules: Starting federal rules import...`);

    // Import SNAP federal rules
    const { default: snapFederalRules } = await import('./rules/federal/snap/snap-federal-rules.json');
    const snapResult = await importRules(snapFederalRules.rules, {
      validate: true,
      skipTests: false,
      mode: 'upsert',
      overwriteExisting: true
    });
    console.log(`[DEBUG] SNAP federal rules import result:`, snapResult);
    console.log(`[DEBUG] SNAP rules imported:`, snapResult.imported, 'errors:', snapResult.errors?.length || 0);

    // Import SSI federal rules
    const { default: ssiFederalRules } = await import('./rules/federal/ssi/ssi-federal-rules.json');
    const ssiResult = await importRules(ssiFederalRules.rules, {
      validate: true,
      skipTests: false,
      mode: 'upsert',
      overwriteExisting: true
    });
    console.log(`[DEBUG] SSI federal rules import result:`, ssiResult);
    console.log(`[DEBUG] SSI rules imported:`, ssiResult.imported, 'errors:', ssiResult.errors?.length || 0);

    // Import Section 8 federal rules
    const { default: section8FederalRules } = await import('./rules/federal/section8/section8-federal-rules.json');
    const section8Result = await importRules(section8FederalRules.rules, {
      validate: true,
      skipTests: false,
      mode: 'upsert',
      overwriteExisting: true
    });
    console.log(`[DEBUG] Section 8 federal rules import result:`, section8Result);
    console.log(`[DEBUG] Section 8 rules imported:`, section8Result.imported, 'errors:', section8Result.errors?.length || 0);

    // Import LIHTC federal rules
    const { default: lihtcFederalRules } = await import('./rules/federal/lihtc/lihtc-federal-rules.json');
    const lihtcResult = await importRules(lihtcFederalRules.rules, {
      validate: true,
      skipTests: false,
      mode: 'upsert',
      overwriteExisting: true
    });
    console.log(`[DEBUG] LIHTC federal rules import result:`, lihtcResult);
    console.log(`[DEBUG] LIHTC rules imported:`, lihtcResult.imported, 'errors:', lihtcResult.errors?.length || 0);

    // Import TANF federal rules
    const { default: tanfFederalRules } = await import('./rules/federal/tanf/tanf-federal-rules.json');
    const tanfResult = await importRules(tanfFederalRules.rules, {
      validate: true,
      skipTests: false,
      mode: 'upsert',
      overwriteExisting: true
    });
    console.log(`[DEBUG] TANF federal rules import result:`, tanfResult);
    console.log(`[DEBUG] TANF rules imported:`, tanfResult.imported, 'errors:', tanfResult.errors?.length || 0);

    console.log(`🔍 [DEBUG] importFederalRules: All federal rules imported successfully`);
    return; // Explicit return to ensure function completes
  } catch (error) {
    console.error(`🔍 [DEBUG] importFederalRules: Failed to import federal rules:`, error);
    console.error(`🔍 [DEBUG] importFederalRules: Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    // Don't throw - this shouldn't block the user's experience
    return;
  }
}

/**
 * Import state-specific rules based on the user's state
 */
async function importStateSpecificRules(stateCode: string): Promise<void> {
  try {
    console.log(`[DEBUG] Importing rules for state: ${stateCode}`);

    // Import state-specific rules based on state code
    switch (stateCode) {
      case 'GA': {
        // Import Georgia Medicaid rules
        const { default: medicaidGeorgiaRules } = await import('./rules/state/georgia/medicaid/medicaid-georgia-rules.json');
        const georgiaResult = await importRules(medicaidGeorgiaRules.rules, {
          validate: true,
          skipTests: false,
          mode: 'upsert',
          overwriteExisting: true
        });
        console.log(`[DEBUG] Georgia rules import result:`, georgiaResult);
        break;
      }

      // Add other states as needed
      // case 'CA':
      //   const { default: californiaRules } = await import('./rules/state/california/medicaid/medicaid-california-rules.json');
      //   await importRules(californiaRules, { validate: true, skipTests: false, mode: 'upsert', overwriteExisting: true });
      //   break;

      default:
        console.log(`[DEBUG] No specific rules to import for state: ${stateCode}`);
        break;
    }
  } catch (error) {
    console.error(`[DEBUG] Failed to import rules for state ${stateCode}:`, error);
    // Don't throw - this shouldn't block the user's experience
  }
}

function App(): React.ReactElement {
  const { t } = useI18n();

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
  const [currentUserProfile, setCurrentUserProfile] = useState<{ state?: string;[key: string]: unknown } | null>(null);
  const [isProcessingResults, setIsProcessingResults] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Onboarding state
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [showPrivacyExplainer, setShowPrivacyExplainer] = useState(false);
  const [showQuickStartGuide, setShowQuickStartGuide] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const { saveResults, loadAllResults, loadResult } = useResultsManagement();

  // Create sample results for testing
  const createSampleResults = useCallback((): void => {
    const sampleResults = createSampleResultsData();
    setCurrentResults(sampleResults);
    setHasResults(true);

    // Also save to localStorage for persistence
    void saveResults({ results: sampleResults });
  }, [saveResults]);

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
  }, [createSampleResults]);

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

    // Helper to clear and reinitialize with proper program names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fixProgramNames = async () => {
      try {
        await clearAndReinitialize();
        console.warn('Database reinitialized with user-friendly program names. Please refresh the page.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to reinitialize database:', error);
      }
    };

    // Force fix program names - more aggressive approach
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).forceFixProgramNames = async () => {
      try {
        await forceFixProgramNames();
        console.warn('Program names force fixed! Please refresh the page.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to force fix program names:', error);
      }
    };
  }

  const handleStartQuestionnaire = (): void => {
    setAppState('questionnaire');
  };

  // Onboarding handlers
  const handleStartWelcomeTour = (): void => {
    setShowWelcomeTour(true);
  };

  const handleCompleteWelcomeTour = (): void => {
    setShowWelcomeTour(false);
    // Mark tour as completed in localStorage
    localStorage.setItem('bf-welcome-tour-completed', 'true');
  };

  const handleStartQuickStartGuide = (): void => {
    setShowQuickStartGuide(true);
  };

  const handleStartAssessmentFromGuide = (): void => {
    setShowQuickStartGuide(false);
    setAppState('questionnaire');
  };

  const handleGoHome = (): void => {
    setAppState('home');
    setIsProcessingResults(false);
    setErrorMessage('');
    setAnnouncementMessage('');
  };

  const handleCompleteQuestionnaire = async (answers: Record<string, unknown>): Promise<void> => {
    console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Function called with answers:', answers);
    try {
      // Immediately transition to results UI; perform work in background
      console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Setting app state to results');
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
      const dateOfBirth = answers.dateOfBirth as string;
      const state = answers.state as string;
      const citizenship = answers.citizenship as string;
      const employmentStatus = answers.employmentStatus as string;
      // Convert string boolean values to actual booleans
      const hasQualifyingDisability = answers.hasQualifyingDisability === 'true' || answers.hasQualifyingDisability === true;
      const isPregnant = answers.isPregnant === 'true' || answers.isPregnant === true;
      const hasChildren = answers.hasChildren === 'true' || answers.hasChildren === true;

      // Convert income to annual amount based on user's selection
      const annualIncome = incomePeriod === 'monthly' ? householdIncome * 12 : householdIncome;

      // Create user profile from answers
      const profileData = {
        householdSize,
        householdIncome: annualIncome,
        incomePeriod: incomePeriod as 'monthly' | 'annual',
        // Use the date of birth directly from the questionnaire
        dateOfBirth,
        citizenship: citizenship as 'us_citizen' | 'permanent_resident' | 'refugee' | 'asylee' | 'other',
        employmentStatus: employmentStatus as 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'disabled' | 'student',
        // Include state field - this is critical for state-specific eligibility
        state,
        // Include other collected fields
        hasDisability: hasQualifyingDisability,
        isPregnant,
        hasChildren,
      };

      // Create user profile and evaluate eligibility
      let profile;
      let batchResult;

      try {
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Creating user profile with data:', profileData);
        profile = await createUserProfile(profileData);
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: User profile created successfully:', {
          id: profile.id,
          householdIncome: profile.householdIncome,
          householdSize: profile.householdSize,
          state: profile.state
        });

        // Store current user profile for passing to components
        setCurrentUserProfile({
          state,
          householdSize,
          householdIncome: annualIncome,
          citizenship,
          employmentStatus,
          hasDisability: hasQualifyingDisability,
          isPregnant,
          hasChildren
        });

        // Import federal rules first (apply to all states)
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: About to import federal rules...');
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: importFederalRules function exists:', typeof importFederalRules);
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Current profile data:', {
          profileId: profile.id,
          householdIncome: profile.householdIncome,
          householdSize: profile.householdSize,
          state: profile.state
        });

        const importStartTime = Date.now();
        try {
          console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Calling importFederalRules()...');
          const importResult = await importFederalRules();
          const importDuration = Date.now() - importStartTime;
          console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Federal rules import completed successfully');
          console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Import duration:', importDuration + 'ms');
          console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Import result:', importResult);
        } catch (error) {
          const importDuration = Date.now() - importStartTime;
          console.error('🔍 [DEBUG] handleCompleteQuestionnaire: Federal rules import failed after', importDuration + 'ms');
          console.error('🔍 [DEBUG] handleCompleteQuestionnaire: Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            name: error instanceof Error ? error.name : 'Unknown error type'
          });
          throw error; // Re-throw to ensure we don't continue with missing rules
        }

        // Import state-specific rules if state is provided
        if (state) {
          console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Importing state-specific rules for:', state);
          await importStateSpecificRules(state);
          console.log('🔍 [DEBUG] handleCompleteQuestionnaire: State-specific rules import completed');
        } else {
          console.log('🔍 [DEBUG] handleCompleteQuestionnaire: No state provided, skipping state-specific rules');
        }

        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: About to evaluate all programs for profile:', profile.id);
        batchResult = await evaluateAllPrograms(profile.id);
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Program evaluation completed');
      } catch (dbError) {
        console.error('Database operations failed:', dbError);

        // Show error message to user instead of fallback results
        setErrorMessage('Unable to calculate eligibility results at this time. Please try refreshing the page or contact support if the issue persists.');
        setIsProcessingResults(false);
        setAppState('error');
        return;
      }

      console.log('[DEBUG] App.tsx - batchResult', batchResult);

      // Convert batch results to array for easier processing
      const evaluationResults = Array.from(batchResult.programResults.values());

      console.log('[DEBUG] App.tsx - evaluationResults', evaluationResults);

      // Get all program rules for each program (for comprehensive requirements display)
      const programRulesMap = new Map<string, string[]>();
      for (const result of evaluationResults) {
        if (!programRulesMap.has(result.programId)) {
          const allRules = await getAllProgramRuleIds(result.programId);
          programRulesMap.set(result.programId, allRules);
        }
      }

      console.log('[DEBUG] App.tsx - programRulesMap', programRulesMap);

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
            details: formatCriteriaDetails(result.criteriaResults, result.eligible, result.programId),
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
            details: formatCriteriaDetails(result.criteriaResults, result.eligible, result.programId),
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
            details: formatCriteriaDetails(result.criteriaResults, result.eligible, result.programId),
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


  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error Boundary caught an error:', error, errorInfo);
        // You could send this to an error reporting service here
      }}
    >
      <ThemeProvider>
        <TextSizeProvider>
          <KeyboardShortcuts
            onStartQuestionnaire={handleStartQuestionnaire}
            onToggleTour={() => setShowWelcomeTour(true)}
            onTogglePrivacy={() => setShowPrivacyExplainer(true)}
            onToggleGuide={() => setShowQuickStartGuide(true)}
            onGoHome={handleBackToHome}
            onViewResults={handleViewResults}
          />
          <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-primary-900 text-secondary-900 dark:text-secondary-100">
            {/* Screen reader announcements */}
            <LiveRegion
              message={announcementMessage}
              priority="polite"
              clearAfter={3000}
            />

            <nav className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md border-b border-secondary-200 dark:border-secondary-700 px-4 py-4 shadow-sm overflow-hidden">
              <div className="max-w-7xl mx-auto">
                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-display font-semibold text-secondary-900 dark:text-secondary-100">
                      {t('app.title')}
                    </h1>
                    <a
                      href="https://frootsnoops.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
                      aria-label="Visit frootsnoops.com"
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
                        <img
                          src="/frootsnoops_mascot.png"
                          alt="Frootsnoops mascot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-secondary-600 dark:text-secondary-400 font-medium">
                        a frootsnoops site
                      </span>
                    </a>
                  </div>
                  <div className="flex items-center space-x-4">
                    {appState !== 'home' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToHome}
                        aria-label={t('navigation.home')}
                        className="animate-slide-in-right"
                      >
                        {t('navigation.home')}
                      </Button>
                    )}

                    {/* Onboarding buttons for home page */}
                    {appState === 'home' && (
                      <div className="flex items-center space-x-2">
                        <HelpTooltip
                          content="Take a guided tour of the app to learn about key features"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartWelcomeTour}
                            className="text-xs"
                          >
                            🎯 {t('navigation.tour')}
                          </Button>
                        </HelpTooltip>
                        <HelpTooltip
                          content="Learn about how we protect your privacy and data"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPrivacyExplainer(true)}
                            className="text-xs"
                          >
                            🔒 {t('navigation.privacy')}
                          </Button>
                        </HelpTooltip>
                        <HelpTooltip
                          content="Get a quick start guide to using the app"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartQuickStartGuide}
                            className="text-xs"
                          >
                            📖 {t('navigation.guide')}
                          </Button>
                        </HelpTooltip>
                        <HelpTooltip
                          content="View keyboard shortcuts for faster navigation"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowShortcutsHelp(true)}
                            className="text-xs"
                          >
                            ⌨️ {t('navigation.shortcuts')}
                          </Button>
                        </HelpTooltip>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <TextSizeControls size="sm" variant="minimal" />
                      <ThemeSwitcher size="sm" variant="minimal" />
                      <LanguageSwitcher size="sm" />
                    </div>
                  </div>
                </div>

                {/* Tablet/Desktop Portrait Layout */}
                <div className="hidden md:flex lg:hidden items-center justify-between px-2">
                  <div className="flex items-center gap-1 min-w-0 flex-shrink">
                    <h1 className="text-base font-display font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                      {t('app.title')}
                    </h1>
                    <a
                      href="https://frootsnoops.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
                      aria-label="Visit frootsnoops.com"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
                        <img
                          src="/frootsnoops_mascot.png"
                          alt="Frootsnoops mascot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </a>
                  </div>

                  <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
                    {/* Navigation buttons - only show Home when not on home page */}
                    {appState !== 'home' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToHome}
                        aria-label={t('navigation.home')}
                        className="animate-slide-in-right flex-shrink-0 text-xs px-2"
                      >
                        {t('navigation.home')}
                      </Button>
                    )}

                    {/* Onboarding buttons for tablet - show when on home page */}
                    {appState === 'home' && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <HelpTooltip
                          content="Take a guided tour of the app to learn about key features"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartWelcomeTour}
                            className="text-xs px-1.5"
                          >
                            🎯 Tour
                          </Button>
                        </HelpTooltip>
                        <HelpTooltip
                          content="Learn about how we protect your privacy and data"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPrivacyExplainer(true)}
                            className="text-xs px-1.5"
                          >
                            🔒 Privacy
                          </Button>
                        </HelpTooltip>
                        <HelpTooltip
                          content="Get a quick start guide to using the app"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartQuickStartGuide}
                            className="text-xs px-1.5"
                          >
                            📖 Guide
                          </Button>
                        </HelpTooltip>
                        <HelpTooltip
                          content="View keyboard shortcuts for faster navigation"
                          trigger="hover"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowShortcutsHelp(true)}
                            className="text-xs px-1.5"
                          >
                            ⌨️ Shortcuts
                          </Button>
                        </HelpTooltip>
                      </div>
                    )}

                    {/* Controls - more space available now */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <TextSizeControls size="sm" variant="minimal" />
                      <ThemeSwitcher size="sm" variant="minimal" />
                      <LanguageSwitcher size="sm" variant="minimal" />
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="flex md:hidden items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-display font-semibold text-secondary-900 dark:text-secondary-100">
                      {t('app.title')}
                    </h1>
                    <a
                      href="https://frootsnoops.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:opacity-80 transition-opacity duration-200"
                      aria-label="Visit frootsnoops.com"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
                        <img
                          src="/frootsnoops_mascot.png"
                          alt="Frootsnoops mascot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appState !== 'home' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToHome}
                        aria-label={t('navigation.home')}
                        className="animate-slide-in-right"
                      >
                        {t('navigation.home')}
                      </Button>
                    )}

                    <div className="flex items-center gap-1">
                      <TextSizeControls size="sm" variant="minimal" />
                      <ThemeSwitcher size="sm" variant="minimal" />
                      <LanguageSwitcher size="sm" />
                    </div>
                  </div>
                </div>

                {/* Mobile onboarding row for home page */}
                {appState === 'home' && (
                  <div className="flex md:hidden items-center justify-center mt-3 space-x-1">
                    <HelpTooltip
                      content="Take a guided tour of the app to learn about key features"
                      trigger="hover"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartWelcomeTour}
                        className="text-xs px-2"
                      >
                        🎯 Tour
                      </Button>
                    </HelpTooltip>
                    <HelpTooltip
                      content="Learn about how we protect your privacy and data"
                      trigger="hover"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPrivacyExplainer(true)}
                        className="text-xs px-2"
                      >
                        🔒 Privacy
                      </Button>
                    </HelpTooltip>
                    <HelpTooltip
                      content="Get a quick start guide to using the app"
                      trigger="hover"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartQuickStartGuide}
                        className="text-xs px-2"
                      >
                        📖 Guide
                      </Button>
                    </HelpTooltip>
                    <HelpTooltip
                      content="View keyboard shortcuts for faster navigation"
                      trigger="hover"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowShortcutsHelp(true)}
                        className="text-xs px-2"
                      >
                        ⌨️ Shortcuts
                      </Button>
                    </HelpTooltip>
                  </div>
                )}
              </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {appState === 'home' && (
                <div className="text-center animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-secondary-900 dark:text-secondary-100 px-4">
                    {t('app.subtitle')}
                  </h2>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-8 sm:mb-12 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed px-4">
                    {t('app.description')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
                    <HelpTooltip
                      content="Click here to start the benefit eligibility assessment. It takes about 5-10 minutes to complete."
                      trigger="hover"
                      position="bottom"
                    >
                      <Button
                        onClick={handleStartQuestionnaire}
                        size="lg"
                        className="animate-bounce-gentle"
                        aria-label={t('questionnaire.title')}
                        data-tour="start-button"
                      >
                        {hasResults ? t('common.continue') : t('questionnaire.title')}
                      </Button>
                    </HelpTooltip>

                    {hasResults && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleViewResults}
                        className="animate-slide-in-right"
                        aria-label={t('navigation.results')}
                      >
                        {t('navigation.results')}
                      </Button>
                    )}

                  </div>


                  <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
                    <div
                      className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      data-tour="privacy-card"
                    >
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-secondary-900 dark:text-secondary-100">{t('privacy.title')}</h3>
                      <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
                        {t('privacy.description')}
                      </p>
                    </div>
                    <div
                      className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      data-tour="offline-card"
                    >
                      <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📱</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-secondary-900 dark:text-secondary-100">{t('privacy.offline')}</h3>
                      <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
                        {t('privacy.localStorage')}
                      </p>
                    </div>
                    <div
                      className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
                      data-tour="encryption-card"
                    >
                      <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🛡️</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-secondary-900 dark:text-secondary-100">{t('app.encryption')}</h3>
                      <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
                        {t('privacy.encryption')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {appState === 'questionnaire' && (
                <div className="animate-fade-in">
                  <div className="mb-6 sm:mb-8 text-center px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                      Benefit Eligibility Assessment
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-300 text-sm sm:text-base">
                      Complete this questionnaire to check your eligibility for government benefits
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto px-4 sm:px-0 questionnaire-container">
                    <EnhancedQuestionnaire
                      flow={sampleFlow}
                      onComplete={(answers): void => {
                        void handleCompleteQuestionnaire(answers);
                      }}
                    />
                  </div>
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
                    <div className="bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 p-12 text-center max-w-2xl mx-auto animate-scale-in">
                      <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200" />
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
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
                  )}
                  {(() => {
                    if (!isProcessingResults && currentResults && (
                      currentResults.qualified.length > 0 ||
                      currentResults.maybe.length > 0 ||
                      currentResults.likely.length > 0 ||
                      currentResults.notQualified.length > 0
                    )) {
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
                                  onClick={handleNewAssessment}
                                  aria-label="Start new assessment"
                                  className="w-full sm:w-auto order-2 sm:order-1"
                                >
                                  {t('results.actions.newAssessment')}
                                </Button>
                                <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                                  <ResultsExport results={currentResults} />
                                  <ResultsImport onImport={(results) => void handleImportResults(results)} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <ResultsSummary results={currentResults} />

                          <QuestionnaireAnswersCard />

                          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 px-4 sm:px-0">
                            {/* Qualified Programs */}
                            {currentResults.qualified.map((result) => (
                              <ProgramCard
                                key={result.programId}
                                result={result}
                                userProfile={currentUserProfile ?? undefined}
                                className="max-w-4xl mx-auto animate-fade-in-up"
                              />
                            ))}

                            {/* Maybe Programs */}
                            {currentResults.maybe.map((result) => (
                              <ProgramCard
                                key={result.programId}
                                result={result}
                                userProfile={currentUserProfile ?? undefined}
                                className="max-w-4xl mx-auto animate-fade-in-up"
                              />
                            ))}

                            {/* Likely Programs */}
                            {currentResults.likely.map((result) => (
                              <ProgramCard
                                key={result.programId}
                                result={result}
                                userProfile={currentUserProfile ?? undefined}
                                className="max-w-4xl mx-auto animate-fade-in-up"
                              />
                            ))}

                            {/* Not Qualified Programs */}
                            {currentResults.notQualified.map((result) => (
                              <ProgramCard
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
                    }

                    if (!isProcessingResults) {
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
                            onClick={handleNewAssessment}
                            variant="primary"
                            className="inline-flex items-center gap-2"
                          >
                            {t('results.noResults.startAssessment')}
                          </Button>
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              )}
            </main>

            {/* Onboarding Components */}
            <WelcomeTour
              isOpen={showWelcomeTour}
              onClose={() => setShowWelcomeTour(false)}
              onComplete={handleCompleteWelcomeTour}
              onStartAssessment={handleStartQuestionnaire}
            />

            <PrivacyExplainer
              isOpen={showPrivacyExplainer}
              onClose={() => setShowPrivacyExplainer(false)}
            />

            <QuickStartGuide
              isOpen={showQuickStartGuide}
              onClose={() => setShowQuickStartGuide(false)}
              onStartAssessment={handleStartAssessmentFromGuide}
            />

            <ShortcutsHelp
              isOpen={showShortcutsHelp}
              onClose={() => setShowShortcutsHelp(false)}
            />
          </div>
        </TextSizeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
