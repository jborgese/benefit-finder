/**
 * Store selectors
 */

import type {
  QuestionDefinition,
  ProgressMetrics,
  QuestionContext,
} from '../types';
import type { QuestionFlowStore } from './types';

export const selectCurrentQuestion = (state: QuestionFlowStore): QuestionDefinition | null =>
  state.getCurrentQuestion();

export const selectProgress = (state: QuestionFlowStore): ProgressMetrics | null =>
  state.progress;

export const selectIsComplete = (state: QuestionFlowStore): boolean =>
  state.completed;

export const selectCanGoForward = (state: QuestionFlowStore): boolean =>
  state.canGoForward();

export const selectCanGoBack = (state: QuestionFlowStore): boolean =>
  state.canGoBack();

export const selectAnswerContext = (state: QuestionFlowStore): QuestionContext =>
  state.getAnswerContext();
