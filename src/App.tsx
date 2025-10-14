import React, { useState } from 'react';
import { EnhancedQuestionnaire } from './questionnaire/ui';
import { ResultsSummary, ProgramCard, ResultsExport, QuestionnaireAnswersCard } from './components/results';
import { useResultsManagement } from './components/results/useResultsManagement';
import { Button } from './components/Button';
import { LiveRegion } from './questionnaire/accessibility';
import type { QuestionFlow, FlowNode } from './questionnaire/types';

// Import database functions statically to avoid dynamic import issues
import { initializeDatabase, getDatabase, clearDatabase } from './db';
import { createBenefitProgram, createUserProfile } from './db/utils';
import { importRulePackage } from './rules/import-export';
import { evaluateAllPrograms, type EligibilityEvaluationResult } from './rules';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';


// Types for evaluation results
// Removed local type definitions - using types from eligibility module instead

// Initialize database and load sample data
async function initializeApp(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();

    const db = getDatabase();

    // Check if we already have programs loaded
    const existingPrograms = await db.benefit_programs.find().exec();
    if (existingPrograms.length > 0) {
      return; // Already initialized
    }

    // Load sample benefit programs

    // Create SNAP program
    await createBenefitProgram({
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
    });

    // Create Medicaid program
    await createBenefitProgram({
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
    });

    // Load sample rules

    // Import SNAP rules
    const snapRules = await import('./rules/examples/snap-rules.json');
    await importRulePackage(snapRules.default);

    // Import Medicaid rules
    const medicaidRules = await import('./rules/examples/medicaid-federal-rules.json');
    await importRulePackage(medicaidRules.default);

  } catch (error) {
    console.error('Error initializing app:', error);

    // If it's a database initialization error, try clearing and retrying once
    if (error instanceof Error && error.message.includes('Database initialization failed')) {
      console.warn('Attempting to clear database and retry initialization...');
      try {
        await clearDatabase();
        await initializeDatabase();

        const db = getDatabase();
        const existingPrograms = await db.benefit_programs.find().exec();
        if (existingPrograms.length > 0) {
          return; // Already initialized
        }

        // Load sample data after successful initialization
        await createBenefitProgram({
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
        });

        await createBenefitProgram({
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
        });

        // Load sample rules
        const snapRules = await import('./rules/examples/snap-rules.json');
        await importRulePackage(snapRules.default);

        const medicaidRules = await import('./rules/examples/medicaid-federal-rules.json');
        await importRulePackage(medicaidRules.default);

        console.warn('Database initialized successfully after clearing');
        return;
      } catch (retryError) {
        console.error('Failed to initialize database after clearing:', retryError);
        throw retryError;
      }
    }

    throw error;
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

// Sample results for testing
const sampleResults = {
  qualified: [
    {
      programId: 'snap',
      programName: 'Supplemental Nutrition Assistance Program (SNAP)',
      programDescription: 'SNAP helps low-income individuals and families buy food',
      jurisdiction: US_FEDERAL_JURISDICTION,
      status: 'qualified' as const,
      confidence: 'high' as const,
      confidenceScore: 95,
      explanation: {
        reason: 'You qualify based on your household size and income',
        details: ['Income is below the threshold', 'Household size qualifies'],
        rulesCited: ['SNAP-INCOME-001', 'SNAP-HOUSEHOLD-001']
      },
      requiredDocuments: [
        {
          id: 'snap-doc-1',
          name: 'Proof of income',
          required: true
        },
        {
          id: 'snap-doc-2',
          name: 'Social Security card',
          required: true
        },
        {
          id: 'snap-doc-3',
          name: 'Proof of residency',
          required: true
        }
      ],
      nextSteps: [
        {
          step: 'Contact your local SNAP office',
          priority: 'high' as const
        },
        {
          step: 'Schedule an interview',
          priority: 'high' as const
        },
        {
          step: 'Gather required documents',
          priority: 'medium' as const
        }
      ],
      estimatedBenefit: {
        amount: 194,
        frequency: 'monthly' as const,
        description: 'Based on household size and income'
      },
      evaluatedAt: new Date(),
      rulesVersion: '1.0.0'
    },
    {
      programId: 'medicaid',
      programName: 'Medicaid',
      programDescription: 'Health coverage for low-income individuals and families',
      jurisdiction: US_FEDERAL_JURISDICTION,
      status: 'qualified' as const,
      confidence: 'medium' as const,
      confidenceScore: 75,
      explanation: {
        reason: 'You may qualify for Medicaid coverage',
        details: ['Income is within Medicaid threshold', 'State eligibility requirements met'],
        rulesCited: ['MEDICAID-INCOME-001']
      },
      requiredDocuments: [
        {
          id: 'medicaid-doc-1',
          name: 'Proof of income',
          required: true
        },
        {
          id: 'medicaid-doc-2',
          name: 'Birth certificate',
          required: true
        },
        {
          id: 'medicaid-doc-3',
          name: 'Social Security card',
          required: true
        }
      ],
      nextSteps: [
        {
          step: 'Apply online at healthcare.gov',
          url: 'https://www.healthcare.gov',
          priority: 'high' as const
        },
        {
          step: 'Contact state Medicaid office',
          priority: 'medium' as const
        }
      ],
      evaluatedAt: new Date(),
      rulesVersion: '1.0.0'
    }
  ],
  likely: [],
  maybe: [],
  notQualified: [],
  totalPrograms: 2,
  evaluatedAt: new Date()
};

type AppState = 'home' | 'questionnaire' | 'results' | 'error';

function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>('home');
  const [hasResults, setHasResults] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { saveResults } = useResultsManagement();

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
    setErrorMessage('');
    setAnnouncementMessage('');
  };

  const handleCompleteQuestionnaire = async (answers: Record<string, unknown>): Promise<void> => {
    try {
      // Initialize database and load sample data if needed
      await initializeApp();
    } catch (dbError) {
      console.error('Database initialization failed:', dbError);

      // Show error message to user instead of continuing with broken state
      setErrorMessage('Unable to initialize the application database. Please try refreshing the page or contact support if the issue persists.');
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
        hasChildren: false,
        hasDisability: false,
        isVeteran: false,
        isPregnant: false,
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
            details: result.criteriaResults?.map(cr => `${cr.criterion}: ${cr.met ? 'Met' : 'Not met'}`) ?? [],
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

      const likelyResults = evaluationResults
        .filter((result: EligibilityEvaluationResult) => !result.eligible && result.confidence > 50)
        .map((result: EligibilityEvaluationResult) => ({
          programId: result.programId,
          programName: getProgramName(result.programId),
          programDescription: getProgramDescription(result.programId),
          jurisdiction: US_FEDERAL_JURISDICTION,
          status: 'likely' as const,
          confidence: 'medium' as const,
          confidenceScore: result.confidence,
          explanation: {
            reason: result.reason,
            details: result.criteriaResults?.map(cr => `${cr.criterion}: ${cr.met ? 'Met' : 'Not met'}`) ?? [],
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
        .filter((result: EligibilityEvaluationResult) => !result.eligible && result.confidence <= 50)
        .map((result: EligibilityEvaluationResult) => ({
          programId: result.programId,
          programName: getProgramName(result.programId),
          programDescription: getProgramDescription(result.programId),
          jurisdiction: US_FEDERAL_JURISDICTION,
          status: 'not-qualified' as const,
          confidence: 'low' as const,
          confidenceScore: result.confidence,
          explanation: {
            reason: result.reason,
            details: result.criteriaResults?.map(cr => `${cr.criterion}: ${cr.met ? 'Met' : 'Not met'}`) ?? [],
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
        likely: likelyResults,
        maybe: [], // Could add logic for "maybe" results based on incomplete data
        notQualified: notQualifiedResults,
        totalPrograms: evaluationResults.length,
        evaluatedAt: new Date()
      };

      await saveResults({ results });
      setHasResults(true);
      setAppState('results');
      setAnnouncementMessage('Assessment completed. Results are ready.');
    } catch (error) {
      console.error('Error evaluating eligibility:', error);
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
    setAppState('questionnaire');
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
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Benefit Eligibility Results</h2>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleNewAssessment}
                    aria-label="Start new assessment"
                  >
                    New Assessment
                  </Button>
                  <ResultsExport results={sampleResults} />
                </div>
              </div>
            </div>

            <ResultsSummary results={sampleResults} />

            <QuestionnaireAnswersCard />

            <div className="mt-8 space-y-6">
              {sampleResults.qualified.map((result) => (
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
        )}
      </main>
    </div>
  );
}

export default App;
