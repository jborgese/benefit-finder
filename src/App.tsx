import React, { useState } from 'react';
import { EnhancedQuestionnaire } from './questionnaire/ui';
import { ResultsSummary, ProgramCard, ResultsExport, ResultsImport, QuestionnaireAnswersCard, type EligibilityResults } from './components/results';
import { useResultsManagement } from './components/results/useResultsManagement';
import { useEffect } from 'react';
import { Button } from './components/Button';
import { LiveRegion } from './questionnaire/accessibility';
import type { QuestionFlow, FlowNode } from './questionnaire/types';

// Import database functions statically to avoid dynamic import issues
import { initializeDatabase, getDatabase, clearDatabase } from './db';
import { createUserProfile } from './db/utils';
import { importRulePackage } from './rules/import-export';
import { evaluateAllPrograms, type EligibilityEvaluationResult } from './rules';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';

// ============================================================================
// FIELD NAME MAPPINGS
// ============================================================================

/**
 * Maps technical field names to user-friendly descriptions
 */
const FIELD_NAME_MAPPINGS: Record<string, string> = {
  // Demographics
  'age': 'Your age',
  'isPregnant': 'Pregnancy status',
  'hasChildren': 'Whether you have children',
  'hasQualifyingDisability': 'Qualifying disability status',
  'isCitizen': 'Citizenship status',
  'isLegalResident': 'Legal residency status',
  'ssn': 'Social Security number',

  // Financial
  'householdIncome': 'Your household\'s monthly income',
  'householdSize': 'Your household size',
  'income': 'Your income',
  'grossIncome': 'Your gross income',
  'netIncome': 'Your net income',
  'monthlyIncome': 'Your monthly income',
  'annualIncome': 'Your annual income',
  'assets': 'Your household assets',
  'resources': 'Your available resources',
  'liquidAssets': 'Your liquid assets',
  'vehicleValue': 'Your vehicle value',
  'bankBalance': 'Your bank account balance',

  // Location & State
  'state': 'Your state of residence',
  'stateHasExpanded': 'Whether your state has expanded coverage',
  'zipCode': 'Your ZIP code',
  'county': 'Your county',
  'jurisdiction': 'Your location',

  // Program-specific
  'hasHealthInsurance': 'Current health insurance coverage',
  'employmentStatus': 'Your employment status',
  'isStudent': 'Student status',
  'isVeteran': 'Veteran status',
  'isSenior': 'Senior status (65+)',
  'hasMinorChildren': 'Whether you have children under 18',

  // Housing
  'housingCosts': 'Your housing costs',
  'rentAmount': 'Your monthly rent',
  'mortgageAmount': 'Your monthly mortgage',
  'isHomeless': 'Housing situation',

  // Benefits
  'receivesSSI': 'Supplemental Security Income (SSI)',
  'receivesSNAP': 'SNAP benefits',
  'receivesTANF': 'TANF benefits',
  'receivesWIC': 'WIC benefits',
  'receivesUnemployment': 'Unemployment benefits',
  'livesInState': 'State residency',
};

/**
 * Format field name to human-readable description
 */
function formatFieldName(fieldName: string): string {
  // Check if we have a specific mapping for this field
  if (Object.prototype.hasOwnProperty.call(FIELD_NAME_MAPPINGS, fieldName)) {
    return FIELD_NAME_MAPPINGS[fieldName]; // eslint-disable-line security/detect-object-injection -- fieldName from known field set, not user input
  }

  // Fall back to converting camelCase or snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

// Types for evaluation results
// Removed local type definitions - using types from eligibility module instead

// Flag to prevent multiple simultaneous initializations
let isInitializing = false;

// Initialize database and load sample data
// eslint-disable-next-line sonarjs/cognitive-complexity -- Complex initialization logic needed for error handling
async function initializeApp(): Promise<void> {
  if (import.meta.env.DEV) {
    console.warn('[DEBUG] initializeApp: Starting app initialization');
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.warn('[DEBUG] initializeApp: App initialization already in progress, waiting...');
    // Wait for the current initialization to complete
    // Poll until the flag is cleared by the other initialization
    const maxAttempts = 100; // 10 seconds max wait (100ms * 100)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- isInitializing is modified asynchronously
    for (let attempt = 0; attempt < maxAttempts && isInitializing; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  isInitializing = true;
  try {
    if (import.meta.env.DEV) {
      console.warn('[DEBUG] initializeApp: Initializing database...');
    }
    // Initialize database
    await initializeDatabase();

    const db = getDatabase();

    // Check if we already have programs loaded
    const existingPrograms = await db.benefit_programs.find().exec();
    if (existingPrograms.length > 0) {
      isInitializing = false;
      return; // Already initialized
    }

    // Load sample benefit programs

    // Create SNAP program with explicit ID to match rules
    await db.benefit_programs.insert({
      id: 'snap-federal',
      name: 'Supplemental Nutrition Assistance Program (SNAP)',
      shortName: 'SNAP',
      description: 'SNAP helps low-income individuals and families buy food',
      category: 'food',
      jurisdiction: US_FEDERAL_JURISDICTION,
      jurisdictionLevel: 'federal',
      website: 'https://www.fns.usda.gov/snap',
      phoneNumber: '1-800-221-5689',
      applicationUrl: 'https://www.benefits.gov/benefit/361',
      active: true,
      tags: ['food', 'nutrition', 'ebt'],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });

    // Create Medicaid program with explicit ID to match rules
    await db.benefit_programs.insert({
      id: 'medicaid-federal',
      name: 'Medicaid',
      shortName: 'Medicaid',
      description: 'Health coverage for low-income individuals and families',
      category: 'healthcare',
      jurisdiction: US_FEDERAL_JURISDICTION,
      jurisdictionLevel: 'federal',
      website: 'https://www.medicaid.gov',
      phoneNumber: '1-800-318-2596',
      applicationUrl: 'https://www.healthcare.gov',
      active: true,
      tags: ['healthcare', 'insurance', 'medical'],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });

    // Load sample rules

    // Import SNAP rules
    const snapRules = await import('./rules/examples/snap-rules.json');
    await importRulePackage(snapRules.default);

    // Import Medicaid rules
    const medicaidRules = await import('./rules/examples/medicaid-federal-rules.json');
    await importRulePackage(medicaidRules.default);

  } catch (error) {
    console.error('[DEBUG] initializeApp: Error initializing app:', error);

    // If it's a database initialization error, try clearing and retrying once
    if (error instanceof Error && error.message.includes('Database initialization failed')) {
      console.warn('[DEBUG] initializeApp: Attempting to clear database and retry initialization...');
      try {
        if (import.meta.env.DEV) {
          console.warn('[DEBUG] initializeApp: Clearing database...');
        }
        await clearDatabase();

        if (import.meta.env.DEV) {
          console.warn('[DEBUG] initializeApp: Re-initializing database...');
        }
        await initializeDatabase();

        const db = getDatabase();
        const existingPrograms = await db.benefit_programs.find().exec();
        if (existingPrograms.length > 0) {
          return; // Already initialized
        }

        // Load sample data after successful initialization
        const retryDb = getDatabase();
        await retryDb.benefit_programs.insert({
          id: 'snap-federal',
          name: 'Supplemental Nutrition Assistance Program (SNAP)',
          shortName: 'SNAP',
          description: 'SNAP helps low-income individuals and families buy food',
          category: 'food',
          jurisdiction: US_FEDERAL_JURISDICTION,
          jurisdictionLevel: 'federal',
          website: 'https://www.fns.usda.gov/snap',
          phoneNumber: '1-800-221-5689',
          applicationUrl: 'https://www.benefits.gov/benefit/361',
          active: true,
          tags: ['food', 'nutrition', 'ebt'],
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        });

        await retryDb.benefit_programs.insert({
          id: 'medicaid-federal',
          name: 'Medicaid',
          shortName: 'Medicaid',
          description: 'Health coverage for low-income individuals and families',
          category: 'healthcare',
          jurisdiction: US_FEDERAL_JURISDICTION,
          jurisdictionLevel: 'federal',
          website: 'https://www.medicaid.gov',
          phoneNumber: '1-800-318-2596',
          applicationUrl: 'https://www.healthcare.gov',
          active: true,
          tags: ['healthcare', 'insurance', 'medical'],
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        });

        // Load sample rules
        const snapRules = await import('./rules/examples/snap-rules.json');
        await importRulePackage(snapRules.default);

        const medicaidRules = await import('./rules/examples/medicaid-federal-rules.json');
        await importRulePackage(medicaidRules.default);

        console.warn('Database initialized successfully after clearing');
        isInitializing = false;
        return;
      } catch (retryError) {
        console.error('Failed to initialize database after clearing:', retryError);
        isInitializing = false;
        throw retryError;
      }
    }

    throw error;
  } finally {
    // Always reset the initialization flag
    isInitializing = false;
  }
}

// Sample questionnaire flow for testing - helper nodes
const nodes: FlowNode[] = [
  {
    id: 'household-size',
    question: {
      id: 'household-size',
      text: 'How many people are in your household?',
      inputType: 'number',
      fieldName: 'householdSize',
      required: true,
      min: 1,
      max: 20
    },
    nextId: 'income-period'
  },
  {
    id: 'income-period',
    question: {
      id: 'income-period',
      text: 'How would you like to enter your household income?',
      description: 'You can enter your income either monthly or annually - whichever is easier for you.',
      inputType: 'select',
      fieldName: 'incomePeriod',
      required: true,
      options: [
        { value: 'monthly', label: 'Monthly income (e.g., $3,000/month)' },
        { value: 'annual', label: 'Annual income (e.g., $36,000/year)' }
      ]
    },
    nextId: 'income'
  },
  {
    id: 'income',
    question: {
      id: 'income',
      text: 'What is your total household income?',
      inputType: 'currency',
      fieldName: 'householdIncome',
      required: true,
      min: 0
    },
    nextId: 'age'
  },
  {
    id: 'age',
    question: {
      id: 'age',
      text: 'What is your age?',
      inputType: 'number',
      fieldName: 'age',
      required: true,
      min: 0,
      max: 120
    },
    isTerminal: true
  }
];

const sampleFlow: QuestionFlow = {
  id: 'benefit-eligibility',
  name: 'Benefit Eligibility Assessment',
  version: '1.0.0',
  description: 'Complete assessment to check eligibility for government benefits',
  startNodeId: 'household-size',
  nodes: new Map(nodes.map(node => [node.id, node]))
};


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
            details: result.criteriaResults?.map(cr => `${formatFieldName(cr.criterion)}: ${cr.met ? 'Met' : 'Not met'}`) ?? [],
            rulesCited: [result.ruleId]
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
            details: result.criteriaResults?.map(cr => `${formatFieldName(cr.criterion)}: ${cr.met ? 'Met' : 'Not met'}`) ?? [],
            rulesCited: [result.ruleId]
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
            details: result.criteriaResults?.map(cr => `${formatFieldName(cr.criterion)}: ${cr.met ? 'Met' : 'Not met'}`) ?? [],
            rulesCited: [result.ruleId]
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

  // Helper functions to get program names and descriptions
  const getProgramName = (programId: string): string => {
    const names = new Map<string, string>([
      ['snap-federal', 'Supplemental Nutrition Assistance Program (SNAP)'],
      ['medicaid-federal', 'Medicaid'],
      ['wic-federal', 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)'],
    ]);
    return names.get(programId) ?? programId;
  };

  const getProgramDescription = (programId: string): string => {
    const descriptions = new Map<string, string>([
      ['snap-federal', 'SNAP helps low-income individuals and families buy food'],
      ['medicaid-federal', 'Health coverage for low-income individuals and families'],
      ['wic-federal', 'Provides nutrition assistance to pregnant women, new mothers, and young children'],
    ]);
    return descriptions.get(programId) ?? 'Government benefit program';
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
