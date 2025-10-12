import React, { useState } from 'react';
import { SimpleQuestionnaire } from './questionnaire/ui';
import { ResultsSummary, ProgramCard, ResultsExport } from './components/results';
import { useQuestionFlowStore } from './questionnaire/store';
import { useResultsManagement } from './components/results/useResultsManagement';
import { Button } from './components/Button';

// Sample questionnaire flow for testing
const sampleFlow = {
  id: 'benefit-eligibility',
  name: 'Benefit Eligibility Assessment',
  version: '1.0.0',
  description: 'Complete assessment to check eligibility for government benefits',
  nodes: [
    {
      id: 'start',
      type: 'start',
      title: 'Welcome',
      description: 'Let\'s check your eligibility for government benefits',
      next: 'household-size'
    },
    {
      id: 'household-size',
      type: 'question',
      title: 'Household Size',
      question: 'How many people are in your household?',
      inputType: 'number',
      required: true,
      validation: { min: 1, max: 20 },
      next: 'income'
    },
    {
      id: 'income',
      type: 'question',
      title: 'Monthly Income',
      question: 'What is your total monthly household income?',
      inputType: 'currency',
      required: true,
      validation: { min: 0 },
      next: 'age'
    },
    {
      id: 'age',
      type: 'question',
      title: 'Age',
      question: 'What is your age?',
      inputType: 'number',
      required: true,
      validation: { min: 0, max: 120 },
      next: 'end'
    },
    {
      id: 'end',
      type: 'end',
      title: 'Assessment Complete',
      description: 'Thank you for completing the assessment'
    }
  ]
};

// Sample results for testing
const sampleResults = {
  id: 'sample-results-1',
  timestamp: new Date().toISOString(),
  programs: [
    {
      id: 'snap',
      name: 'Supplemental Nutrition Assistance Program (SNAP)',
      status: 'qualified' as const,
      confidence: 'high' as const,
      estimatedAmount: '$194',
      explanation: 'You qualify based on your household size and income',
      requiredDocuments: [
        'Proof of income',
        'Social Security card',
        'Proof of residency'
      ],
      nextSteps: [
        'Contact your local SNAP office',
        'Schedule an interview',
        'Gather required documents'
      ]
    },
    {
      id: 'medicaid',
      name: 'Medicaid',
      status: 'qualified' as const,
      confidence: 'medium' as const,
      estimatedAmount: 'Coverage',
      explanation: 'You may qualify for Medicaid coverage',
      requiredDocuments: [
        'Proof of income',
        'Birth certificate',
        'Social Security card'
      ],
      nextSteps: [
        'Apply online at healthcare.gov',
        'Contact state Medicaid office'
      ]
    }
  ],
  summary: {
    totalPrograms: 2,
    qualified: 2,
    maybeQualified: 0,
    notQualified: 0
  }
};

type AppState = 'home' | 'questionnaire' | 'results';

function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>('home');
  const [hasResults, setHasResults] = useState(false);

  const { isComplete, answers } = useQuestionFlowStore();
  const { saveResults, loadResults } = useResultsManagement();

  const handleStartQuestionnaire = () => {
    setAppState('questionnaire');
  };

  const handleCompleteQuestionnaire = () => {
    // Generate sample results based on answers
    const results = {
      ...sampleResults,
      id: `results-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    saveResults(results);
    setHasResults(true);
    setAppState('results');
  };

  const handleViewResults = () => {
    setAppState('results');
  };

  const handleBackToHome = () => {
    setAppState('home');
  };

  const handleNewAssessment = () => {
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
              className="max-w-2xl mx-auto"
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
              {sampleResults.programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
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
