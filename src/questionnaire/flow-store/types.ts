/**
 * Question Flow Store Types
 */

import type {
  QuestionFlow,
  QuestionDefinition,
  QuestionState,
  QuestionAnswer,
  QuestionContext,
  ProgressMetrics,
  NavigationResult,
  FlowEvent,
} from '../types';
import type { NavigationManager } from '../navigation';
import type { CheckpointManager, TimeTracker } from '../progress';

/**
 * Store state
 */
export interface QuestionFlowState {
  // Session
  sessionId: string | null;
  flowId: string | null;
  flow: QuestionFlow | null;

  // Navigation
  currentNodeId: string | null;
  history: string[];

  // State
  questionStates: Map<string, QuestionState>;
  answers: Map<string, QuestionAnswer>;

  // Progress
  progress: ProgressMetrics | null;

  // Status
  started: boolean;
  completed: boolean;
  paused: boolean;

  // Timestamps
  startedAt: number | null;
  updatedAt: number | null;
  completedAt: number | null;

  // Events
  events: FlowEvent[];

  // Managers (not persisted)
  _navigationManager: NavigationManager | null;
  _checkpointManager: CheckpointManager | null;
  _timeTracker: TimeTracker | null;
}

/**
 * Store actions
 */
export interface QuestionFlowActions {
  startFlow: (flow: QuestionFlow) => void;
  answerQuestion: (questionId: string, fieldName: string, value: unknown) => void;
  next: () => NavigationResult;
  previous: () => NavigationResult;
  jumpTo: (questionId: string) => NavigationResult;
  skipQuestion: (questionId: string, reason?: string) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  createCheckpoint: (name: string, description?: string) => void;
  restoreCheckpoint: (checkpointId: string) => boolean;
  getCurrentQuestion: () => QuestionDefinition | null;
  getAnswerContext: () => QuestionContext;
  updateProgress: () => void;
  canGoForward: () => boolean;
  canGoBack: () => boolean;
  complete: () => void;
  updateQuestion: (questionId: string, questionUpdate: Partial<QuestionDefinition>) => void;
}

/**
 * Combined store type
 */
export type QuestionFlowStore = QuestionFlowState & QuestionFlowActions;
