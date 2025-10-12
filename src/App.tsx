import React, { useState } from 'react';
import { SimpleQuestionnaire } from './questionnaire/ui';
import { ResultsSummary, ProgramCard, ResultsExport } from './components/results';
import { useResultsManagement } from './components/results/useResultsManagement';
import { Button } from './components/Button';
import type { QuestionFlow, FlowNode } from './questionnaire/types';

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
    nextId: 'income'
  },
  {
    id: 'income',
    question: {
      id: 'income',
      text: 'What is your total monthly household income?',
      inputType: 'currency',
      fieldName: 'monthlyIncome',
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
      jurisdiction: 'US-FEDERAL',
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
      jurisdiction: 'US-FEDERAL',
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

type AppState = 'home' | 'questionnaire' | 'results';

function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>('home');
  const [hasResults, setHasResults] = useState(false);

  const { saveResults } = useResultsManagement();

  const handleStartQuestionnaire = (): void => {
    setAppState('questionnaire');
  };

  const handleCompleteQuestionnaire = (_answers: Record<string, unknown>): void => {
    // Generate sample results based on answers
    const results = {
      ...sampleResults,
      evaluatedAt: new Date()
    };

    void saveResults({ results });
    setHasResults(true);
    setAppState('results');
  };

  const handleViewResults = (): void => {
    setAppState('results');
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
            <h2 className="text-3xl font-bold mb-4">Your Benefit Eligibility Results</h2>
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
              <Button
                variant="secondary"
                onClick={handleBackToHome}
                className="mb-4"
                aria-label="Back to home"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold">Benefit Eligibility Assessment</h2>
            </div>

            <SimpleQuestionnaire
              flow={sampleFlow}
              onComplete={handleCompleteQuestionnaire}
            />
          </div>
        )}

        {appState === 'results' && (
          <div>
            <div className="mb-6">
              <Button
                variant="secondary"
                onClick={handleBackToHome}
                className="mb-4"
                aria-label="Back to home"
              >
                ← Back to Home
              </Button>
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

            <div className="mt-8 space-y-6">
              {sampleResults.qualified.map((result) => (
                <ProgramCard
                  key={result.programId}
                  result={result}
                  className="max-w-4xl mx-auto"
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
/ /   T e s t   c o m m e n t   f o r   l i n t - s t a g e d  
 