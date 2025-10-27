/**
 * California Questionnaire Integration
 *
 * Functions to integrate California-specific questions into the main questionnaire flow.
 * These questions only appear when the user selects California as their resident state.
 */

import type { QuestionFlow, FlowNode } from './types';
import { getCaliforniaQuestions } from './california-questions';

/**
 * Add California-specific questions to an existing questionnaire flow
 *
 * @param flow - The existing questionnaire flow
 * @param insertAfterNodeId - The node ID after which to insert California questions
 * @returns Updated flow with California questions integrated
 */
export function addCaliforniaQuestionsToFlow(
  flow: QuestionFlow,
  insertAfterNodeId: string
): QuestionFlow {
  const californiaQuestions = getCaliforniaQuestions();

  // Find the insertion point
  const insertAfterNode = flow.nodes.get(insertAfterNodeId);
  if (!insertAfterNode) {
    throw new Error(`Node ${insertAfterNodeId} not found in flow`);
  }

  // Get the next node after insertion point
  const nextNodeId = insertAfterNode.nextId;

  // Create updated flow
  const updatedFlow: QuestionFlow = {
    ...flow,
    nodes: new Map(flow.nodes)
  };

  // Add California questions to the flow
  californiaQuestions.forEach((node, index) => {
    // Set up proper linking
    const updatedNode: FlowNode = {
      ...node,
      previousId: index === 0 ? insertAfterNodeId : californiaQuestions[index - 1].id,
      nextId: index === californiaQuestions.length - 1 ? nextNodeId : californiaQuestions[index + 1].id
    };

    updatedFlow.nodes.set(node.id, updatedNode);
  });

  // Update the original node to point to first California question
  const updatedInsertAfterNode = {
    ...insertAfterNode,
    nextId: californiaQuestions[0].id
  };
  updatedFlow.nodes.set(insertAfterNodeId, updatedInsertAfterNode);

  // Update the next node to point back from last California question
  if (nextNodeId) {
    const nextNode = updatedFlow.nodes.get(nextNodeId);
    if (nextNode) {
      const updatedNextNode = {
        ...nextNode,
        previousId: californiaQuestions[californiaQuestions.length - 1].id
      };
      updatedFlow.nodes.set(nextNodeId, updatedNextNode);
    }
  }

  return updatedFlow;
}

/**
 * Create a California-specific questionnaire flow
 *
 * @param baseFlow - The base questionnaire flow
 * @returns Flow with California questions integrated
 */
export function createCaliforniaQuestionnaireFlow(baseFlow: QuestionFlow): QuestionFlow {
  // Insert California questions after the state selection question
  // Assuming the state question has ID 'state' - adjust as needed
  const stateNodeId = 'state';

  try {
    return addCaliforniaQuestionsToFlow(baseFlow, stateNodeId);
  } catch {
    console.warn('Could not find state node, inserting California questions at end of flow');
    // Fallback: add at the end
    const lastNode = Array.from(baseFlow.nodes.values()).find(node => !node.nextId);
    if (lastNode) {
      return addCaliforniaQuestionsToFlow(baseFlow, lastNode.id);
    }
    return baseFlow;
  }
}

/**
 * Get California-specific questions that should be shown based on current answers
 *
 * @param answers - Current questionnaire answers
 * @returns Array of California question IDs that should be shown
 */
export function getVisibleCaliforniaQuestions(answers: Map<string, unknown>): string[] {
  const state = answers.get('state');
  if (state !== 'CA') {
    return [];
  }

  const californiaQuestions = getCaliforniaQuestions();
  const visibleQuestions: string[] = [];

  californiaQuestions.forEach(node => {
    const { question } = node;

    // Check if question should be shown based on showIf condition
    if (question.showIf) {
      // This would need to be evaluated using the rule engine
      // For now, we'll assume all California questions are shown if state is CA
      visibleQuestions.push(question.id);
    } else {
      visibleQuestions.push(question.id);
    }
  });

  return visibleQuestions;
}

/**
 * Check if a question is a California-specific question
 *
 * @param questionId - The question ID to check
 * @returns True if this is a California-specific question
 */
export function isCaliforniaQuestion(questionId: string): boolean {
  const californiaQuestions = getCaliforniaQuestions();
  return californiaQuestions.some(node => node.id === questionId);
}

/**
 * Get California-specific field mappings for the questionnaire
 *
 * @returns Object mapping California question IDs to their field names
 */
export function getCaliforniaFieldMappings(): Record<string, string> {
  const californiaQuestions = getCaliforniaQuestions();
  const mappings: Record<string, string> = {};

  californiaQuestions.forEach(node => {
    mappings[node.id] = node.question.fieldName;
  });

  return mappings;
}

/**
 * Validate California-specific answers
 *
 * @param answers - Current questionnaire answers
 * @returns Array of validation errors
 */
export function validateCaliforniaAnswers(answers: Map<string, unknown>): string[] {
  const errors: string[] = [];
  const state = answers.get('state');

  if (state !== 'CA') {
    return errors; // No validation needed for non-California residents
  }

  // Validate immigration status
  const immigrationStatus = answers.get('immigration_status');
  if (!immigrationStatus) {
    errors.push('Immigration status is required for California residents');
  }

  // Validate California residency
  const californiaResidency = answers.get('californiaResidencyDuration');
  if (!californiaResidency) {
    errors.push('California residency duration is required');
  }

  // Validate county selection (using standard 'county' field name)
  const county = answers.get('county');
  if (!county) {
    errors.push('County selection is required');
  }

  return errors;
}

/**
 * Get California-specific next steps based on answers
 *
 * @param answers - Current questionnaire answers
 * @returns Array of next steps for California residents
 */
export function getCaliforniaNextSteps(answers: Map<string, unknown>): string[] {
  const steps: string[] = [];
  const state = answers.get('state');

  if (state !== 'CA') {
    return steps;
  }

  const immigrationStatus = answers.get('immigration_status');
  const isStudent = answers.get('isStudent');
  const hasEmergencyCondition = answers.get('hasEmergencyMedicalCondition');

  // Immigration-specific steps
  if (immigrationStatus === 'daca') {
    steps.push('Apply for state-funded Medi-Cal at Covered California');
    steps.push('Contact an immigration-friendly community health center for assistance');
  } else if (immigrationStatus === 'lawfully_present') {
    steps.push('Apply for state-funded Medi-Cal at Covered California');
    steps.push('No 5-year waiting period required in California');
  }

  // Student-specific steps
  if (isStudent && answers.get('expectedFamilyContributionZero')) {
    steps.push('Apply for CalFresh at GetCalFresh.org with your $0 EFC documentation');
  }

  // Emergency condition steps
  if (hasEmergencyCondition) {
    steps.push('Apply for Emergency Medi-Cal at your hospital or emergency room');
    steps.push('Emergency Medi-Cal covers all immigrants regardless of status');
  }

  // General California steps
  steps.push('Apply online at Covered California (recommended for Medi-Cal)');
  steps.push('Alternative: Apply at BenefitsCal.com (state benefits portal)');

  return steps;
}
