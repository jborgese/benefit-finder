/**
 * California Questionnaire Integration Example
 *
 * This file demonstrates how to use the California-specific questions
 * in the questionnaire system.
 */

import { createEnhancedFlow } from './enhanced-flow';
import {
  updateFlowForState,
  getNextQuestionId,
  getPreviousQuestionId,
  shouldShowQuestion,
  getVisibleQuestions
} from './flow-dynamic';
import {
  getCaliforniaNextSteps,
  validateCaliforniaAnswers,
  getCaliforniaFieldMappings
} from './california-integration';
import type { QuestionContext } from './types';

/**
 * Example: Using California questions in the questionnaire
 */
export function demonstrateCaliforniaIntegration() {
  // Create the enhanced flow with California questions
  const flow = createEnhancedFlow();

  // Example context with California selected
  const context: QuestionContext = {
    answers: new Map([
      ['state', 'CA'],
      ['householdSize', 2],
      ['householdIncome', 3000],
      ['citizenship', 'us_citizen']
    ]),
    currentQuestionId: 'state',
    progress: 0.1
  };

  // Update flow for California
  const updatedFlow = updateFlowForState(flow, 'CA', context);

  // Get visible questions for California
  const visibleQuestions = getVisibleQuestions(updatedFlow, 'CA', context.answers);
  console.log('Visible questions for California:', visibleQuestions);

  // Check if California questions should be shown
  const shouldShowImmigration = shouldShowQuestion('immigration-status-ca', 'CA', context.answers);
  console.log('Should show immigration question:', shouldShowImmigration);

  // Get next question after state selection
  const nextQuestion = getNextQuestionId('state', 'CA', context.answers);
  console.log('Next question after state:', nextQuestion);

  // Get previous question from disability status
  const prevQuestion = getPreviousQuestionId('disability-status', 'CA', context.answers);
  console.log('Previous question from disability:', prevQuestion);

  return {
    flow: updatedFlow,
    visibleQuestions,
    shouldShowImmigration,
    nextQuestion,
    prevQuestion
  };
}

/**
 * Example: California-specific validation and next steps
 */
export function demonstrateCaliforniaValidation() {
  // Example answers for a California resident
  const answers = new Map([
    ['state', 'CA'],
    ['immigration_status', 'daca'],
    ['hasValidDACA', true],
    ['californiaResidencyDuration', '2_to_5_years'],
    ['californiaCounty', 'los_angeles'],
    ['isStudent', true],
    ['expectedFamilyContributionZero', true],
    ['preferredLanguage', 'spanish'],
    ['hasEmergencyMedicalCondition', false],
    ['isPostpartum', false]
  ]);

  // Validate California answers
  const validationErrors = validateCaliforniaAnswers(answers);
  console.log('Validation errors:', validationErrors);

  // Get California-specific next steps
  const nextSteps = getCaliforniaNextSteps(answers);
  console.log('California next steps:', nextSteps);

  // Get field mappings for California questions
  const fieldMappings = getCaliforniaFieldMappings();
  console.log('California field mappings:', fieldMappings);

  return {
    validationErrors,
    nextSteps,
    fieldMappings
  };
}

/**
 * Example: Handling state changes in the questionnaire
 */
export function demonstrateStateChanges() {
  const flow = createEnhancedFlow();

  // User initially selects Georgia
  let currentFlow = updateFlowForState(flow, 'GA', {
    answers: new Map([['state', 'GA']]),
    currentQuestionId: 'state',
    progress: 0.1
  });

  console.log('Flow for Georgia:', currentFlow.nodes.size, 'nodes');

  // User changes to California
  currentFlow = updateFlowForState(flow, 'CA', {
    answers: new Map([['state', 'CA']]),
    currentQuestionId: 'state',
    progress: 0.1
  });

  console.log('Flow for California:', currentFlow.nodes.size, 'nodes');

  // User changes back to Georgia
  currentFlow = updateFlowForState(flow, 'GA', {
    answers: new Map([['state', 'GA']]),
    currentQuestionId: 'state',
    progress: 0.1
  });

  console.log('Flow back to Georgia:', currentFlow.nodes.size, 'nodes');

  return currentFlow;
}

/**
 * Example: California-specific question flow
 */
export function demonstrateCaliforniaFlow() {
  const flow = createEnhancedFlow();
  const answers = new Map([
    ['state', 'CA'],
    ['householdSize', 1],
    ['householdIncome', 2000]
  ]);

  // Simulate going through California questions
  const californiaQuestions = [
    'immigration-status-ca',
    'years-in-us-ca',
    'daca-status-ca',
    'student-efc-ca',
    'california-residency-ca',
    'language-preference-ca',
    'emergency-medical-condition-ca',
    'postpartum-status-ca',
    'california-county-ca',
    'california-assistance-preferences-ca'
  ];

  const flowPath: string[] = [];
  let currentQuestion = 'state';

  // Navigate through California questions
  for (const questionId of californiaQuestions) {
    const nextQuestion = getNextQuestionId(currentQuestion, 'CA', answers);
    if (nextQuestion) {
      flowPath.push(nextQuestion);
      currentQuestion = nextQuestion;
    }
  }

  console.log('California question flow path:', flowPath);

  return flowPath;
}

// Export examples for use in other files
export const californiaExamples = {
  demonstrateCaliforniaIntegration,
  demonstrateCaliforniaValidation,
  demonstrateStateChanges,
  demonstrateCaliforniaFlow
};
