/**
 * Initial state for the store
 */

import type { QuestionFlowState } from './types';

export const initialState: QuestionFlowState = {
  sessionId: null,
  flowId: null,
  flow: null,
  currentNodeId: null,
  history: [],
  questionStates: new Map(),
  answers: new Map(),
  progress: null,
  started: false,
  completed: false,
  paused: false,
  startedAt: null,
  updatedAt: null,
  completedAt: null,
  events: [],
  _navigationManager: null,
  _checkpointManager: null,
  _timeTracker: null,
};
