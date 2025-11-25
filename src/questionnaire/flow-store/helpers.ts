/**
 * Helper functions for store
 */

import type { QuestionState } from '../types';

/**
 * Update current question state to answered
 */
export function updateCurrentQuestionState(
  questionStates: Map<string, QuestionState>,
  questionId: string
): void {
  const currentState = questionStates.get(questionId);
  if (currentState && currentState.status === 'current') {
    currentState.status = 'answered';
  }
}

/**
 * Update next question state to current
 */
export function updateNextQuestionState(
  questionStates: Map<string, QuestionState>,
  questionId: string
): void {
  const nextState = questionStates.get(questionId);
  if (nextState) {
    nextState.status = 'current';
    nextState.visited = true;
    nextState.visitCount++;
  }
}

/**
 * Mark skipped questions
 */
export function markSkippedQuestions(
  questionStates: Map<string, QuestionState>,
  skippedIds: string[]
): void {
  for (const skippedId of skippedIds) {
    const skippedState = questionStates.get(skippedId);
    if (skippedState) {
      skippedState.status = 'skipped';
      skippedState.visible = false;
    }
  }
}
