/**
 * Questionnaire Flow Store
 *
 * Zustand store for managing questionnaire flow state,
 * navigation, answers, and progress.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isTestEnvironment } from '../stores/persist-helper';
import { nanoid } from 'nanoid';
import { NavigationManager } from './navigation';
import { CheckpointManager, TimeTracker, calculateProgress, isFlowComplete } from './progress';
import type {
  QuestionFlow,
  QuestionDefinition,
  QuestionState,
  QuestionAnswer,
  QuestionContext,
  ProgressMetrics,
  NavigationResult,
  FlowEvent,
} from './types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update current question state to answered
 */
function updateCurrentQuestionState(
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
function updateNextQuestionState(
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
function markSkippedQuestions(
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

// ============================================================================
// STORE STATE
// ============================================================================

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

export interface QuestionFlowActions {
  /**
   * Start a new flow
   */
  startFlow: (flow: QuestionFlow) => void;

  /**
   * Answer current question
   */
  answerQuestion: (questionId: string, fieldName: string, value: unknown) => void;

  /**
   * Navigate to next question
   */
  next: () => NavigationResult;

  /**
   * Navigate to previous question
   */
  previous: () => NavigationResult;

  /**
   * Jump to specific question
   */
  jumpTo: (questionId: string) => NavigationResult;

  /**
   * Skip current question
   */
  skipQuestion: (questionId: string, reason?: string) => void;

  /**
   * Pause flow
   */
  pause: () => void;

  /**
   * Resume flow
   */
  resume: () => void;


  /**
   * Reset flow
   */
  reset: () => void;

  /**
   * Create checkpoint
   */
  createCheckpoint: (name: string, description?: string) => void;

  /**
   * Restore from checkpoint
   */
  restoreCheckpoint: (checkpointId: string) => boolean;

  /**
   * Get current question
   */
  getCurrentQuestion: () => QuestionDefinition | null;

  /**
   * Get answer context
   */
  getAnswerContext: () => QuestionContext;

  /**
   * Update progress
   */
  updateProgress: () => void;

  /**
   * Check if can navigate forward
   */
  canGoForward: () => boolean;

  /**
   * Check if can navigate backward
   */
  canGoBack: () => boolean;

  /**
   * Complete the questionnaire
   */
  complete: () => void;

  /**
   * Update question definition (for dynamic options)
   */
  updateQuestion: (questionId: string, questionUpdate: Partial<QuestionDefinition>) => void;
}

export type QuestionFlowStore = QuestionFlowState & QuestionFlowActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: QuestionFlowState = {
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

// ============================================================================
// STORE DEFINITION
// ============================================================================

const questionFlowStoreCreator = (
  set: (partial: Partial<QuestionFlowStore> | ((state: QuestionFlowStore) => Partial<QuestionFlowStore>)) => void,
  get: () => QuestionFlowStore
) => ({
  ...initialState,

      // ====================================================================
      // ACTIONS
      // ====================================================================

      startFlow: (flow: QuestionFlow) => {
        const sessionId = nanoid();
        const navigationManager = new NavigationManager(flow);
        const checkpointManager = new CheckpointManager();
        const timeTracker = new TimeTracker();

        timeTracker.start();

        // Debug: Check if functions are preserved in flow
        if (import.meta.env.DEV) {
          for (const [nodeId, node] of flow.nodes.entries()) {
            const hasTextFunction = typeof node.question.text === 'function';
            const hasDescFunction = typeof node.question.description === 'function';
            if (hasTextFunction || hasDescFunction) {
              console.log('[Store] startFlow - Found function in question', {
                nodeId,
                questionId: node.question.id,
                hasTextFunction,
                hasDescFunction,
              });
            }
          }
        }

        // Initialize question states
        const questionStates = new Map<string, QuestionState>();
        for (const node of flow.nodes.values()) {
          questionStates.set(node.question.id, {
            questionId: node.question.id,
            status: 'pending',
            visible: true,
            visited: false,
            visitCount: 0,
          });
        }

        // Set first question as current
        const startNode = flow.nodes.get(flow.startNodeId);
        if (startNode) {
          const state = questionStates.get(startNode.question.id);
          if (state) {
            state.status = 'current';
            state.visited = true;
            state.visitCount = 1;
          }
        }

        const now = Date.now();

        set({
          sessionId,
          flowId: flow.id,
          flow,
          currentNodeId: flow.startNodeId,
          history: [flow.startNodeId],
          questionStates,
          answers: new Map(), // Clear any existing answers
          started: true,
          completed: false,
          paused: false,
          startedAt: now,
          updatedAt: now,
          completedAt: null,
          events: [{
            type: 'start',
            timestamp: now,
            nodeId: flow.startNodeId,
          }],
          _navigationManager: navigationManager,
          _checkpointManager: checkpointManager,
          _timeTracker: timeTracker,
        });

        // Calculate initial progress
        get().updateProgress();
      },

      answerQuestion: (questionId: string, fieldName: string, value: unknown) => {
        const state = get();
        const now = Date.now();

        if (import.meta.env.DEV) {
          console.log('[Store] answerQuestion called', {
            questionId,
            fieldName,
            value,
            currentAnswersSize: state.answers.size,
            currentAnswers: Array.from(state.answers.entries()),
          });
        }

        // Create answer
        const answer: QuestionAnswer = {
          questionId,
          fieldName,
          value,
          answeredAt: now,
          source: 'user',
        };

        // Update answers
        const newAnswers = new Map(state.answers);
        newAnswers.set(questionId, answer);

        if (import.meta.env.DEV) {
          console.log('[Store] answerQuestion updated', {
            questionId,
            fieldName,
            value,
            newAnswersSize: newAnswers.size,
            newAnswers: Array.from(newAnswers.entries()),
            answerContext: (() => {
              const ctx: Record<string, unknown> = {};
              for (const ans of newAnswers.values()) {
                ctx[ans.fieldName] = ans.value;
              }
              return ctx;
            })(),
          });
        }

        // Update question state (keep as 'current' until user navigates away)
        const newQuestionStates = new Map(state.questionStates);
        const questionState = newQuestionStates.get(questionId);
        if (questionState) {
          // Keep status as 'current' until navigation occurs
          // This ensures progress calculation shows correct question position
          questionState.answer = answer;
          questionState.errors = [];
        }

        // Update navigation manager context
        if (state._navigationManager) {
          state._navigationManager.updateContext(fieldName, value);
        }

        set({
          answers: newAnswers,
          questionStates: newQuestionStates,
          updatedAt: now,
          events: [
            ...state.events,
            {
              type: 'question_answered',
              timestamp: now,
              nodeId: questionId,
              data: { fieldName, value },
            },
          ],
        });

        // Update progress
        get().updateProgress();
      },

      next: (): NavigationResult => {
        const state = get();

        if (!state._navigationManager || !state.currentNodeId) {
          return {
            success: false,
            error: 'Flow not initialized',
          };
        }

        const result = state._navigationManager.navigateForward(state.currentNodeId);

        if (result.success && result.targetNodeId) {
          const newQuestionStates = new Map(state.questionStates);

          // Update question states
          // Get question IDs from node IDs
          const currentQuestion = state.flow?.nodes.get(state.currentNodeId)?.question;
          const nextQuestion = state.flow?.nodes.get(result.targetNodeId)?.question;

          if (currentQuestion) {
            updateCurrentQuestionState(newQuestionStates, currentQuestion.id);
          }
          if (nextQuestion) {
            updateNextQuestionState(newQuestionStates, nextQuestion.id);
          }

          // Mark skipped questions
          if (result.questionsSkipped) {
            markSkippedQuestions(newQuestionStates, result.questionsSkipped);
          }

          const now = Date.now();

          set({
            currentNodeId: result.targetNodeId,
            history: state._navigationManager.getHistory(),
            questionStates: newQuestionStates,
            updatedAt: now,
            events: [
              ...state.events,
              {
                type: 'navigation',
                timestamp: now,
                nodeId: result.targetNodeId,
                data: {
                  direction: 'forward',
                  branchTaken: result.branchTaken,
                  skipped: result.questionsSkipped,
                },
              },
            ],
          });

          get().updateProgress();
        }

        return result;
      },

      previous: (): NavigationResult => {
        const state = get();

        // Debug logging helper
        const debugLog = (message: string, data?: Record<string, unknown>): void => {
          if (import.meta.env.DEV || localStorage.getItem('DEBUG_NAVIGATION')) {
            console.log(`[Store] previous() - ${message}`, data ?? '');
          }
        };

        debugLog('previous() called', {
          hasNavigationManager: !!state._navigationManager,
          currentNodeId: state.currentNodeId,
          historyLength: state.history.length,
          history: [...state.history],
        });

        if (!state._navigationManager || !state.currentNodeId) {
          debugLog('Navigation failed - flow not initialized');
          return {
            success: false,
            error: 'Flow not initialized',
          };
        }

        const result = state._navigationManager.navigateBackward(state.currentNodeId);

        debugLog('navigateBackward result', {
          success: result.success,
          targetNodeId: result.targetNodeId,
          error: result.error,
          navigationHistory: state._navigationManager.getHistory(),
        });

        if (result.success && result.targetNodeId) {
          const newQuestionStates = new Map(state.questionStates);

          // Update states
          const currentState = newQuestionStates.get(state.currentNodeId);
          if (currentState) {
            // If the current question has an answer, mark it as answered, otherwise pending
            const hasAnswer = state.answers.has(state.currentNodeId);
            currentState.status = hasAnswer ? 'answered' : 'pending';
            debugLog('Updated current question state', {
              questionId: state.currentNodeId,
              status: currentState.status,
              hasAnswer,
            });
          }

          const prevState = newQuestionStates.get(result.targetNodeId);
          if (prevState) {
            prevState.status = 'current';
            prevState.visited = true;
            prevState.visitCount++;
            debugLog('Updated previous question state', {
              questionId: result.targetNodeId,
              status: prevState.status,
              visitCount: prevState.visitCount,
            });
          }

          const updatedHistory = state._navigationManager.getHistory();
          debugLog('Setting new state', {
            newCurrentNodeId: result.targetNodeId,
            oldCurrentNodeId: state.currentNodeId,
            updatedHistory,
            historyLength: updatedHistory.length,
          });

          set({
            currentNodeId: result.targetNodeId,
            history: updatedHistory,
            questionStates: newQuestionStates,
            updatedAt: Date.now(),
          });

          // Update progress after navigation
          get().updateProgress();

          debugLog('previous() complete', {
            newCurrentNodeId: result.targetNodeId,
            finalHistory: updatedHistory,
          });
        } else {
          debugLog('previous() failed', {
            error: result.error,
          });
        }

        return result;
      },

      jumpTo: (questionId: string): NavigationResult => {
        const state = get();

        if (!state._navigationManager) {
          return {
            success: false,
            error: 'Flow not initialized',
          };
        }

        const result = state._navigationManager.jumpTo(questionId);

        if (result.success && result.targetNodeId) {
          set({
            currentNodeId: result.targetNodeId,
            updatedAt: Date.now(),
          });
        }

        return result;
      },

      skipQuestion: (questionId: string, reason?: string) => {
        const state = get();
        const newQuestionStates = new Map(state.questionStates);

        const questionState = newQuestionStates.get(questionId);
        if (questionState) {
          questionState.status = 'skipped';
        }

        const now = Date.now();

        set({
          questionStates: newQuestionStates,
          updatedAt: now,
          events: [
            ...state.events,
            {
              type: 'skip',
              timestamp: now,
              nodeId: questionId,
              data: { reason },
            },
          ],
        });

        get().updateProgress();
      },

      pause: () => {
        const state = get();

        if (state._timeTracker) {
          state._timeTracker.pause();
        }

        set({
          paused: true,
          updatedAt: Date.now(),
        });
      },

      resume: () => {
        const state = get();

        if (state._timeTracker) {
          state._timeTracker.resume();
        }

        set({
          paused: false,
          updatedAt: Date.now(),
        });
      },


      reset: () => {
        set(initialState);
      },

      createCheckpoint: (name: string, description?: string) => {
        const state = get();

        if (!state._checkpointManager || !state.currentNodeId) {
          return;
        }

        state._checkpointManager.createCheckpoint(
          state.currentNodeId,
          name,
          state.answers,
          description
        );
      },

      restoreCheckpoint: (checkpointId: string): boolean => {
        const state = get();

        if (!state._checkpointManager) {
          return false;
        }

        const data = state._checkpointManager.restoreCheckpoint(checkpointId);

        if (!data) {
          return false;
        }

        // Restore answers
        const newAnswers = new Map<string, QuestionAnswer>();

        for (const [fieldName, value] of Object.entries(data)) {
          // Find question with this field name
          const question = Array.from(state.questionStates.keys())
            .find((qId) => {
              const node = state.flow?.nodes.get(qId);
              return node?.question.fieldName === fieldName;
            });

          if (question) {
            newAnswers.set(question, {
              questionId: question,
              fieldName,
              value,
              answeredAt: Date.now(),
              source: 'prefilled',
            });
          }
        }

        set({
          answers: newAnswers,
          updatedAt: Date.now(),
        });

        return true;
      },

      getCurrentQuestion: (): QuestionDefinition | null => {
        const state = get();

        if (!state.flow || !state.currentNodeId) {
          return null;
        }

        const node = state.flow.nodes.get(state.currentNodeId);
        const question = node?.question ?? null;

        if (import.meta.env.DEV && question) {
          console.log('[Store] getCurrentQuestion', {
            questionId: question.id,
            hasTextFunction: typeof question.text === 'function',
            hasDescriptionFunction: typeof question.description === 'function',
            textType: typeof question.text,
            textIsFunction: question.text instanceof Function,
          });
        }

        return question;
      },

      getAnswerContext: (): QuestionContext => {
        const state = get();
        const context: QuestionContext = {};

        for (const answer of state.answers.values()) {
          context[answer.fieldName] = answer.value;
        }

        if (import.meta.env.DEV) {
          console.log('[Store] getAnswerContext called', {
            answersSize: state.answers.size,
            answers: Array.from(state.answers.entries()),
            context,
            hasIncomePeriod: 'incomePeriod' in context,
            incomePeriodValue: context.incomePeriod,
          });
        }

        return context;
      },

      updateProgress: () => {
        const state = get();

        if (!state.flow) {
          return;
        }

        const context = get().getAnswerContext();
        const progress = calculateProgress(
          state.flow,
          state.questionStates,
          context,
          state.currentNodeId
        );

        // Check if flow is complete
        const complete = isFlowComplete(state.flow, state.questionStates);

        set({
          progress,
          completed: complete,
          updatedAt: Date.now(),
        });
      },

      canGoForward: (): boolean => {
        const state = get();

        if (!state._navigationManager || !state.currentNodeId) {
          return false;
        }

        return state._navigationManager.canGoForward(state.currentNodeId);
      },

      canGoBack: (): boolean => {
        const state = get();

        if (!state._navigationManager) {
          return false;
        }

        return state._navigationManager.canGoBack();
      },

      complete: () => {
        const state = get();

        if (!state.currentNodeId) {
          return;
        }

        const newQuestionStates = new Map(state.questionStates);

        // Mark current question as answered
        const currentQuestion = state.flow?.nodes.get(state.currentNodeId)?.question;
        if (currentQuestion) {
          updateCurrentQuestionState(newQuestionStates, currentQuestion.id);
        }

        const now = Date.now();

        set({
          questionStates: newQuestionStates,
          completed: true,
          completedAt: now,
          updatedAt: now,
          events: [
            ...state.events,
            {
              type: 'complete',
              timestamp: now,
              nodeId: state.currentNodeId,
            },
          ],
        });

        // Update progress to reflect completion
        get().updateProgress();
      },

      updateQuestion: (questionId: string, questionUpdate: Partial<QuestionDefinition>) => {
        const state = get();

        if (!state.flow) {
          return;
        }

        // Find the node containing this question
        const node = Array.from(state.flow.nodes.values()).find(
          n => n.question.id === questionId
        );

        if (!node) {
          console.warn(`Question ${questionId} not found in flow`);
          return;
        }

        // Update the question definition
        const updatedQuestion: QuestionDefinition = {
          ...node.question,
          ...questionUpdate,
        };

        const updatedNode = {
          ...node,
          question: updatedQuestion,
        };

        // Create new flow with updated node
        const updatedFlow = {
          ...state.flow,
          nodes: new Map(state.flow.nodes),
        };
        updatedFlow.nodes.set(node.id, updatedNode);

        const now = Date.now();

        set({
          flow: updatedFlow,
          updatedAt: now,
          events: [
            ...state.events,
            {
              type: 'question_updated',
              timestamp: now,
              nodeId: questionId,
              data: { questionUpdate },
            },
          ],
        });
      },
    });

const isTest = isTestEnvironment();
console.log('[PERSIST DEBUG] questionFlowStore: isTestEnvironment() =', isTest, '-', isTest ? 'persist DISABLED' : 'persist ENABLED');

export const useQuestionFlowStore = create<QuestionFlowStore>()(
  isTest
    ? questionFlowStoreCreator
    : persist(questionFlowStoreCreator, {
        name: 'bf-question-flow-store',
        // Only persist essential data
        partialize: (state) => ({
          sessionId: state.sessionId,
          flowId: state.flowId,
          // Note: flow definition should be loaded fresh, not persisted
          currentNodeId: state.currentNodeId,
          history: state.history,
          // Convert Maps to arrays for persistence
          answers: Array.from(state.answers.entries()),
          started: state.started,
          completed: state.completed,
          paused: state.paused,
          startedAt: state.startedAt,
          updatedAt: state.updatedAt,
          completedAt: state.completedAt,
        }),
        // Hydration function to restore Maps
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.answers)) {
            // Convert persisted array back to Map
            state.answers = new Map(state.answers as Array<[string, QuestionAnswer]>);
          }
          // Reset flow state on rehydration to ensure proper initialization
          if (state) {
            state.flow = null;
            state.questionStates = new Map();
            state.currentNodeId = null;
            state.started = false;
            state.completed = false;
            state._navigationManager = null;
            state._checkpointManager = null;
            state._timeTracker = null;
          }
        },
      })
);

// ============================================================================
// SELECTORS
// ============================================================================

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

