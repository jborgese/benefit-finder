import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/Button';
import { LiveRegion } from './questionnaire/accessibility';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useI18n } from './i18n/hooks';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { TextSizeProvider } from './contexts/TextSizeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { TextSizeControls } from './components/TextSizeControls';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';

// Import new route system
import { Routes } from './components/Routes';
import { RoutePreloader } from './components/RoutePreloader';

// Lazy load heavy components (keeping these for onboarding and results components)
const WelcomeTour = React.lazy(() => import('./components/onboarding').then(m => ({ default: m.WelcomeTour })));
const HelpTooltip = React.lazy(() => import('./components/onboarding').then(m => ({ default: m.HelpTooltip })));
const PrivacyExplainer = React.lazy(() => import('./components/onboarding').then(m => ({ default: m.PrivacyExplainer })));
const QuickStartGuide = React.lazy(() => import('./components/onboarding').then(m => ({ default: m.QuickStartGuide })));
const ShortcutsHelp = React.lazy(() => import('./components/onboarding').then(m => ({ default: m.ShortcutsHelp })));

// Import ultra-optimized database functions
import { clearDatabase } from './db/ultra-optimized-database';
import { createUserProfile } from './db/utils';
import { clearAndReinitialize } from './utils/clearAndReinitialize';
import { forceFixProgramNames } from './utils/forceFixProgramNames';
import { evaluateAllPrograms, getAllProgramRuleIds, importRulesDynamically, type EligibilityEvaluationResult } from './rules';

// Import utilities
import { initializeApp } from './utils/initializeApp';
import { formatCriteriaDetails } from './utils/formatCriteriaDetails';
import { getProgramName, getProgramDescription } from './utils/programHelpers';
import { createSampleResults as createSampleResultsData } from './utils/createSampleResults';

// Import types
import type { EligibilityResults } from './components/results';
import { useResultsManagement } from './components/results/useResultsManagement';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';
const NAVIGATION_HOME_KEY = 'navigation.home';

// Helper functions to reduce cognitive complexity
const convertAnswersToProfileData = (answers: Record<string, unknown>): {
  profileData: {
    householdSize: number;
    householdIncome: number;
    incomePeriod: 'monthly' | 'annual';
    dateOfBirth: string;
    citizenship: 'us_citizen' | 'permanent_resident' | 'refugee' | 'asylee' | 'other';
    employmentStatus: 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'disabled' | 'student';
    state: string;
    county: string;
    hasDisability: boolean;
    isPregnant: boolean;
    hasChildren: boolean;
  };
  userProfile: {
    state: string;
    householdSize: number;
    householdIncome: number;
    incomePeriod: 'monthly' | 'annual';
    citizenship: string;
    employmentStatus: string;
    hasDisability: boolean;
    isPregnant: boolean;
    hasChildren: boolean;
  };
} => {
  const householdIncome = answers.householdIncome as number;
  const incomePeriod = answers.incomePeriod as string;
  const householdSize = answers.householdSize as number;
  const dateOfBirth = answers.dateOfBirth as string;
  const state = answers.state as string;
  const county = answers.county as string;
  const citizenship = answers.citizenship as string;
  const employmentStatus = answers.employmentStatus as string;

  // Convert string boolean values to actual booleans
  const hasQualifyingDisability = answers.hasQualifyingDisability === 'true' || answers.hasQualifyingDisability === true;
  const isPregnant = answers.isPregnant === 'true' || answers.isPregnant === true;
  const hasChildren = answers.hasChildren === 'true' || answers.hasChildren === true;

  // Convert income to annual amount based on user's selection
  const annualIncome = incomePeriod === 'monthly' ? householdIncome * 12 : householdIncome;

  // Add SNAP-specific debug logging for income conversion
  if (import.meta.env.DEV && typeof householdIncome === 'number') {
    console.warn(`🔍 [SNAP DEBUG] Income conversion in convertAnswersToProfileData:`);
    console.warn(`  - Original Income: $${householdIncome.toLocaleString()}`);
    console.warn(`  - Income Period: ${incomePeriod}`);
    console.warn(`  - Converted Annual Income: $${annualIncome.toLocaleString()}`);
    console.warn(`  - Household Size: ${householdSize}`);
    console.warn(`  - State: ${state}`);
  }

  return {
    profileData: {
      householdSize,
      householdIncome: annualIncome,
      incomePeriod: incomePeriod as 'monthly' | 'annual',
      dateOfBirth,
      citizenship: citizenship as 'us_citizen' | 'permanent_resident' | 'refugee' | 'asylee' | 'other',
      employmentStatus: employmentStatus as 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'disabled' | 'student',
      state,
      county,
      hasDisability: hasQualifyingDisability,
      isPregnant,
      hasChildren,
    },
    userProfile: {
      state,
      householdSize,
      householdIncome: annualIncome,
      incomePeriod: incomePeriod as 'monthly' | 'annual',
      citizenship,
      employmentStatus,
      hasDisability: hasQualifyingDisability,
      isPregnant,
      hasChildren
    }
  };
};

const importRulesWithLogging = async (state?: string): Promise<void> => {
  console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Starting dynamic rule import');

  try {
    const result = await importRulesDynamically(state, {
      force: false,
      retryOnFailure: true,
      maxRetries: 2,
      timeout: 15000
    });

    if (result.success) {
      console.log(`✅ [DEBUG] Dynamic rule import completed successfully:`, {
        imported: result.imported,
        loadTime: `${result.loadTime.toFixed(2)}ms`,
        state: state ?? 'federal-only'
      });
    } else {
      console.warn(`⚠️ [DEBUG] Dynamic rule import completed with errors:`, {
        imported: result.imported,
        errors: result.errors,
        loadTime: `${result.loadTime.toFixed(2)}ms`,
        state: state ?? 'federal-only'
      });
    }
  } catch (error) {
    console.error('❌ [DEBUG] Dynamic rule import failed:', error);
    // Don't throw - this shouldn't block the user's experience
  }
};

const createResultFromEvaluation = (result: EligibilityEvaluationResult, programRulesMap: Map<string, string[]>): {
  programId: string;
  programName: string;
  programDescription: string;
  jurisdiction: string;
  confidenceScore: number;
  explanation: {
    reason: string;
    details: string[];
    rulesCited: string[];
  };
  requiredDocuments: Array<{
    id: string;
    name: string;
    required: boolean;
    description?: string;
    where?: string;
  }>;
  nextSteps: Array<{
    step: string;
    url?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  evaluatedAt: Date;
  rulesVersion: string;
  estimatedBenefit?: {
    amount: number;
    frequency: 'monthly' | 'annual' | 'one-time';
    description?: string;
  };
} => {
  const baseResult = {
    programId: result.programId,
    programName: getProgramName(result.programId),
    programDescription: getProgramDescription(result.programId),
    jurisdiction: US_FEDERAL_JURISDICTION,
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
  };

  if (result.estimatedBenefit) {
    return {
      ...baseResult,
      estimatedBenefit: {
        amount: result.estimatedBenefit.amount ?? 0,
        frequency: ((): 'monthly' | 'annual' | 'one-time' => {
          const freq = result.estimatedBenefit.frequency;
          if (freq === 'one_time') return 'one-time';
          if (freq === 'quarterly') return 'monthly';
          if (freq === 'annual') return 'annual';
          return 'monthly';
        })(),
        description: result.estimatedBenefit.description
      }
    };
  }

  return baseResult;
};

type AppState = 'home' | 'questionnaire' | 'results' | 'error';


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

  // Intelligent route preloading based on current state
  useEffect(() => {
    RoutePreloader.preloadUserJourney(appState);
  }, [appState]);

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
    // Preload questionnaire route for instant navigation
    RoutePreloader.preloadRoute('questionnaire');
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
      setErrorMessage('Unable to initialize the application database. Please try refreshing the page or contact support if the issue persists.');
      setIsProcessingResults(false);
      setAppState('error');
      return;
    }

    try {
      // Convert questionnaire answers to user profile format
      const { profileData, userProfile } = convertAnswersToProfileData(answers);
      const { state } = profileData;

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

        // Add SNAP-specific debug logging for profile creation
        if (import.meta.env.DEV) {
          console.warn(`🔍 [SNAP DEBUG] User profile created:`);
          console.warn(`  - Profile ID: ${profile.id}`);
          console.warn(`  - Household Income: $${profile.householdIncome?.toLocaleString()}/year`);
          console.warn(`  - Household Size: ${profile.householdSize}`);
          console.warn(`  - Income Period: ${profileData.incomePeriod}`);
          console.warn(`  - State: ${profile.state}`);
          console.warn(`  - Citizenship: ${profile.citizenship}`);
        }

        // Store current user profile for passing to components
        setCurrentUserProfile(userProfile);

        // Import rules with logging
        await importRulesWithLogging(state);

        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: About to evaluate all programs for profile:', profile.id);
        batchResult = await evaluateAllPrograms(profile.id);
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Program evaluation completed');
      } catch (dbError) {
        console.error('Database operations failed:', dbError);
        setErrorMessage('Unable to calculate eligibility results at this time. Please try refreshing the page or contact support if the issue persists.');
        setIsProcessingResults(false);
        setAppState('error');
        return;
      }

      console.log('[DEBUG] App.tsx - batchResult', batchResult);

      // Convert batch results to array for easier processing
      const evaluationResults = Array.from(batchResult.programResults.values());
      console.log('[DEBUG] App.tsx - evaluationResults', evaluationResults);

      // Add SNAP-specific debug logging for evaluation results
      if (import.meta.env.DEV) {
        const snapResults = evaluationResults.filter(result => result.programId.includes('snap'));
        if (snapResults.length > 0) {
          console.warn(`🔍 [SNAP DEBUG] Evaluation results for SNAP:`);
          snapResults.forEach(result => {
            console.warn(`  - Program ID: ${result.programId}`);
            console.warn(`  - Eligible: ${result.eligible}`);
            console.warn(`  - Confidence: ${result.confidence}`);
            console.warn(`  - Reason: ${result.reason}`);
          });
        } else {
          console.warn(`🔍 [SNAP DEBUG] No SNAP results found in evaluation`);
        }
      }

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
          ...createResultFromEvaluation(result, programRulesMap),
          status: 'qualified' as const,
          confidence: result.confidence > 80 ? 'high' as const : 'medium' as const,
        }));

      // Handle ineligible results based on confidence and completeness
      // Check for income hard stops first - these should always be "not-qualified"
      const incomeHardStopResults = evaluationResults
        .filter((result: EligibilityEvaluationResult) => {
          if (!result.eligible) {
            // Check if this is an income hard stop by looking at the reason and rule ID
            const isIncomeHardStop = result.reason.includes('income') ||
              result.reason.includes('Income') ||
              result.reason.includes('hard stop') ||
              result.reason.includes('disqualified due to income') ||
              result.ruleId.includes('income') ||
              result.ruleId.includes('Income') ||
              result.ruleId.includes('income-limits') ||
              result.ruleId.includes('income-limit') ||
              result.ruleId === 'lihtc-federal-income-limits' ||
              result.ruleId === 'section8-federal-income-limits' ||
              result.ruleId === 'tanf-federal-income-test' ||
              result.ruleId === 'medicaid-federal-expansion-income' ||
              result.ruleId === 'wic-federal-income-limit' ||
              (result.confidence >= 90 && result.ruleId.includes('income'));

            console.log('🔍 [UI CATEGORIZATION] Checking income hard stop for:', {
              programId: result.programId,
              ruleId: result.ruleId,
              reason: result.reason,
              eligible: result.eligible,
              confidence: result.confidence,
              isIncomeHardStop
            });

            return isIncomeHardStop;
          }
          return false;
        })
        .map((result: EligibilityEvaluationResult) => {
          console.log('🔍 [UI CATEGORIZATION] Categorizing as income hard stop:', {
            programId: result.programId,
            ruleId: result.ruleId,
            reason: result.reason,
            eligible: result.eligible,
            confidence: result.confidence
          });

          return {
            ...createResultFromEvaluation(result, programRulesMap),
            status: 'not-qualified' as const,
            confidence: 'high' as const,
          };
        });

      const maybeResults = evaluationResults
        .filter((result: EligibilityEvaluationResult) => {
          if (!result.eligible) {
            // Skip income hard stops (already handled above)
            const isIncomeHardStop = result.reason.includes('income') ||
              result.reason.includes('Income') ||
              result.reason.includes('hard stop') ||
              result.reason.includes('disqualified due to income') ||
              result.ruleId.includes('income') ||
              result.ruleId.includes('Income') ||
              result.ruleId.includes('income-limits') ||
              result.ruleId.includes('income-limit') ||
              result.ruleId === 'lihtc-federal-income-limits' ||
              result.ruleId === 'section8-federal-income-limits' ||
              result.ruleId === 'tanf-federal-income-test' ||
              result.ruleId === 'medicaid-federal-expansion-income' ||
              result.ruleId === 'wic-federal-income-limit' ||
              (result.confidence >= 90 && result.ruleId.includes('income'));
            if (isIncomeHardStop) return false;

            // Other ineligible results go to maybe if incomplete or low confidence
            return (result.incomplete ?? false) || result.confidence < 70;
          }
          return false;
        })
        .map((result: EligibilityEvaluationResult) => ({
          ...createResultFromEvaluation(result, programRulesMap),
          status: 'maybe' as const,
          confidence: result.confidence < 50 ? 'low' as const : 'medium' as const,
        }));

      const notQualifiedResults = evaluationResults
        .filter((result: EligibilityEvaluationResult) => {
          if (!result.eligible) {
            // Skip income hard stops (already handled above)
            const isIncomeHardStop = result.reason.includes('income') ||
              result.reason.includes('Income') ||
              result.reason.includes('hard stop') ||
              result.reason.includes('disqualified due to income') ||
              result.ruleId.includes('income') ||
              result.ruleId.includes('Income') ||
              result.ruleId.includes('income-limits') ||
              result.ruleId.includes('income-limit') ||
              result.ruleId === 'lihtc-federal-income-limits' ||
              result.ruleId === 'section8-federal-income-limits' ||
              result.ruleId === 'tanf-federal-income-test' ||
              result.ruleId === 'medicaid-federal-expansion-income' ||
              result.ruleId === 'wic-federal-income-limit' ||
              (result.confidence >= 90 && result.ruleId.includes('income'));
            if (isIncomeHardStop) return false;

            // Other ineligible results go to not-qualified if complete and high confidence
            return !result.incomplete && result.confidence >= 70;
          }
          return false;
        })
        .map((result: EligibilityEvaluationResult) => ({
          ...createResultFromEvaluation(result, programRulesMap),
          status: 'not-qualified' as const,
          confidence: result.confidence >= 90 ? 'high' as const : 'medium' as const,
        }));

      const results = {
        qualified: qualifiedResults,
        likely: [], // No "likely" category - either qualified, maybe, or not qualified
        maybe: maybeResults,
        notQualified: [...incomeHardStopResults, ...notQualifiedResults],
        totalPrograms: evaluationResults.length,
        evaluatedAt: new Date()
      };

      console.log('🔍 [UI CATEGORIZATION] Final categorization results:', {
        qualified: qualifiedResults.length,
        maybe: maybeResults.length,
        incomeHardStops: incomeHardStopResults.length,
        notQualified: notQualifiedResults.length,
        totalNotQualified: results.notQualified.length,
        totalPrograms: evaluationResults.length,
        incomeHardStopPrograms: incomeHardStopResults.map(r => r.programId),
        maybePrograms: maybeResults.map(r => r.programId),
        notQualifiedPrograms: notQualifiedResults.map(r => r.programId)
      });

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
    // Preload results route for instant navigation
    RoutePreloader.preloadRoute('results');
    setAppState('results');
    setAnnouncementMessage('Viewing benefit eligibility results.');
  };

  const handleBackToHome = (): void => {
    setAppState('home');
  };

  const handleNewAssessment = (): void => {
    // Preload questionnaire route for instant navigation
    RoutePreloader.preloadRoute('questionnaire');
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
                      aria-label="Visit frootsnoops.com - a frootsnoops site"
                    >
                      <div className="w-11 h-11 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
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
                        aria-label={t(NAVIGATION_HOME_KEY)}
                        className="animate-slide-in-right"
                      >
                        {t(NAVIGATION_HOME_KEY)}
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
                    <h2 className="text-base font-display font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                      {t('app.title')}
                    </h2>
                    <a
                      href="https://frootsnoops.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
                      aria-label="Visit frootsnoops.com - a frootsnoops site"
                    >
                      <div className="w-11 h-11 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
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
                        aria-label={t(NAVIGATION_HOME_KEY)}
                        className="animate-slide-in-right flex-shrink-0 text-xs px-2"
                      >
                        {t(NAVIGATION_HOME_KEY)}
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
                    <h2 className="text-lg font-display font-semibold text-secondary-900 dark:text-secondary-100">
                      {t('app.title')}
                    </h2>
                    <a
                      href="https://frootsnoops.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:opacity-80 transition-opacity duration-200"
                      aria-label="Visit frootsnoops.com - a frootsnoops site"
                    >
                      <div className="w-11 h-11 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
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
                        aria-label={t(NAVIGATION_HOME_KEY)}
                        className="animate-slide-in-right"
                      >
                        {t(NAVIGATION_HOME_KEY)}
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
              {/* Use new route system */}
              {appState === 'home' && (
                <Routes.Home
                  onStartQuestionnaire={handleStartQuestionnaire}
                  onViewResults={handleViewResults}
                  hasResults={hasResults}
                  onStartWelcomeTour={handleStartWelcomeTour}
                  onStartPrivacyExplainer={() => setShowPrivacyExplainer(true)}
                  onStartQuickStartGuide={handleStartQuickStartGuide}
                  onStartShortcutsHelp={() => setShowShortcutsHelp(true)}
                />
              )}
              {appState === 'questionnaire' && (
                <Routes.Questionnaire
                  onComplete={(answers): void => {
                    void handleCompleteQuestionnaire(answers);
                  }}
                />
              )}
              {appState === 'results' && (
                <Routes.Results
                  currentResults={currentResults}
                  currentUserProfile={currentUserProfile}
                  isProcessingResults={isProcessingResults}
                  onNewAssessment={handleNewAssessment}
                  onImportResults={(results): void => {
                    void handleImportResults(results);
                  }}
                />
              )}
              {appState === 'error' && (
                <Routes.Error
                  errorMessage={errorMessage}
                  onGoHome={handleGoHome}
                />
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
