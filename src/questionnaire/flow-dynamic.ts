/**
 * Dynamic Flow Logic for State-Specific Questions
 *
 * Handles the dynamic insertion and removal of state-specific questions
 * based on user selections.
 */

import type { QuestionFlow, FlowNode, QuestionContext } from './types';
import { getCaliforniaQuestions } from './california-questions';

/**
 * Update flow based on state selection
 *
 * @param flow - The current questionnaire flow
 * @param state - The selected state
 * @param context - Current question context
 * @returns Updated flow with state-specific questions
 */
export function updateFlowForState(
  flow: QuestionFlow,
  state: string,
  context: QuestionContext
): QuestionFlow {
  if (state === 'CA') {
    return addCaliforniaQuestionsToFlow(flow, context);
  } else {
    return removeCaliforniaQuestionsFromFlow(flow);
  }
}

/**
 * Add California questions to the flow
 */
function addCaliforniaQuestionsToFlow(
  flow: QuestionFlow,
  context: QuestionContext
): QuestionFlow {
  const californiaQuestions = getCaliforniaQuestions();

  // Find the state node
  const stateNode = flow.nodes.get('state');
  if (!stateNode) {
    return flow; // No state node found
  }

  // Create updated flow
  const updatedFlow: QuestionFlow = {
    ...flow,
    nodes: new Map(flow.nodes)
  };

  // Add California questions
  californiaQuestions.forEach((node, index) => {
    const updatedNode: FlowNode = {
      ...node,
      previousId: index === 0 ? 'state' : californiaQuestions[index - 1].id,
      nextId: index === californiaQuestions.length - 1 ? 'disability-status' : californiaQuestions[index + 1].id
    };

    updatedFlow.nodes.set(node.id, updatedNode);
  });

  // Update state node to point to first California question
  const updatedStateNode = {
    ...stateNode,
    nextId: californiaQuestions[0].id
  };
  updatedFlow.nodes.set('state', updatedStateNode);

  // Update disability status to point back from last California question
  const disabilityNode = updatedFlow.nodes.get('disability-status');
  if (disabilityNode) {
    const updatedDisabilityNode = {
      ...disabilityNode,
      previousId: californiaQuestions[californiaQuestions.length - 1].id
    };
    updatedFlow.nodes.set('disability-status', updatedDisabilityNode);
  }

  return updatedFlow;
}

/**
 * Remove California questions from the flow
 */
function removeCaliforniaQuestionsFromFlow(flow: QuestionFlow): QuestionFlow {
  const californiaQuestions = getCaliforniaQuestions();

  // Create updated flow
  const updatedFlow: QuestionFlow = {
    ...flow,
    nodes: new Map(flow.nodes)
  };

  // Remove California questions
  californiaQuestions.forEach(node => {
    updatedFlow.nodes.delete(node.id);
  });

  // Update state node to point directly to disability status
  const stateNode = updatedFlow.nodes.get('state');
  const disabilityNode = updatedFlow.nodes.get('disability-status');

  if (stateNode && disabilityNode) {
    const updatedStateNode = {
      ...stateNode,
      nextId: 'disability-status'
    };
    const updatedDisabilityNode = {
      ...disabilityNode,
      previousId: 'state'
    };

    updatedFlow.nodes.set('state', updatedStateNode);
    updatedFlow.nodes.set('disability-status', updatedDisabilityNode);
  }

  return updatedFlow;
}

/**
 * Get the next question ID based on current state and answers
 *
 * @param currentNodeId - Current question ID
 * @param state - Selected state
 * @param answers - Current answers
 * @returns Next question ID
 */
export function getNextQuestionId(
  currentNodeId: string,
  state: string,
  answers: Map<string, any>
): string | null {
  // Handle state selection
  if (currentNodeId === 'state') {
    if (state === 'CA') {
      // Return first California question
      const californiaQuestions = getCaliforniaQuestions();
      return californiaQuestions[0]?.id || 'disability-status';
    } else {
      // Skip California questions, go to disability status
      return 'disability-status';
    }
  }

  // Handle California questions
  const californiaQuestions = getCaliforniaQuestions();
  const californiaQuestionIds = californiaQuestions.map(node => node.id);

  if (californiaQuestionIds.includes(currentNodeId)) {
    const currentIndex = californiaQuestionIds.indexOf(currentNodeId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < californiaQuestionIds.length) {
      return californiaQuestionIds[nextIndex];
    } else {
      // Last California question, go to disability status
      return 'disability-status';
    }
  }

  // Default flow logic for other questions
  return null;
}

/**
 * Get the previous question ID based on current state and answers
 *
 * @param currentNodeId - Current question ID
 * @param state - Selected state
 * @param answers - Current answers
 * @returns Previous question ID
 */
export function getPreviousQuestionId(
  currentNodeId: string,
  state: string,
  answers: Map<string, any>
): string | null {
  // Handle disability status
  if (currentNodeId === 'disability-status') {
    if (state === 'CA') {
      // Return last California question
      const californiaQuestions = getCaliforniaQuestions();
      return californiaQuestions[californiaQuestions.length - 1]?.id || 'state';
    } else {
      // Go back to state
      return 'state';
    }
  }

  // Handle California questions
  const californiaQuestions = getCaliforniaQuestions();
  const californiaQuestionIds = californiaQuestions.map(node => node.id);

  if (californiaQuestionIds.includes(currentNodeId)) {
    const currentIndex = californiaQuestionIds.indexOf(currentNodeId);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      return californiaQuestionIds[prevIndex];
    } else {
      // First California question, go back to state
      return 'state';
    }
  }

  // Default flow logic for other questions
  return null;
}

/**
 * Check if a question should be visible based on current state
 *
 * @param questionId - Question ID to check
 * @param state - Selected state
 * @param answers - Current answers
 * @returns True if question should be visible
 */
export function shouldShowQuestion(
  questionId: string,
  state: string,
  answers: Map<string, any>
): boolean {
  const californiaQuestions = getCaliforniaQuestions();
  const californiaQuestionIds = californiaQuestions.map(node => node.id);

  // California questions only show for California residents
  if (californiaQuestionIds.includes(questionId)) {
    return state === 'CA';
  }

  // All other questions are always visible
  return true;
}

/**
 * Get all visible questions for the current state
 *
 * @param flow - The questionnaire flow
 * @param state - Selected state
 * @param answers - Current answers
 * @returns Array of visible question IDs
 */
export function getVisibleQuestions(
  flow: QuestionFlow,
  state: string,
  answers: Map<string, any>
): string[] {
  const visibleQuestions: string[] = [];

  // Add all non-California questions
  flow.nodes.forEach((node, nodeId) => {
    const californiaQuestions = getCaliforniaQuestions();
    const californiaQuestionIds = californiaQuestions.map(node => node.id);

    if (!californiaQuestionIds.includes(nodeId)) {
      visibleQuestions.push(nodeId);
    }
  });

  // Add California questions if state is CA
  if (state === 'CA') {
    const californiaQuestions = getCaliforniaQuestions();
    californiaQuestions.forEach(node => {
      visibleQuestions.push(node.id);
    });
  }

  return visibleQuestions;
}
