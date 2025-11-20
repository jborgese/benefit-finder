/**
 * Questionnaire Store
 *
 * Manages the state of the eligibility questionnaire flow.
 * Handles question progression, answers, and conditional logic.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface QuestionAnswer {
  questionId: string;
  value: string | number | boolean | string[] | null;
  timestamp: number;
}

export interface QuestionnaireProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  percentComplete: number;
  skippedQuestions: string[];
  answeredQuestions: string[];
}

export interface QuestionnaireState {
  // Session State
  sessionId: string | null;
  isActive: boolean;
  startedAt: number | null;
  lastUpdatedAt: number | null;

  // Answers
  answers: Record<string, QuestionAnswer>;

  // Navigation
  currentQuestionId: string | null;
  visitedQuestionIds: string[];
  questionHistory: string[]; // For back navigation

  // Progress
  progress: QuestionnaireProgress;

  // Validation
  validationErrors: Record<string, string>;

  // Actions - Session Management
  startQuestionnaire: (sessionId: string) => void;
  endQuestionnaire: () => void;
  pauseQuestionnaire: () => void;
  resumeQuestionnaire: () => void;

  // Actions - Navigation
  setCurrentQuestion: (questionId: string) => void;
  goToNextQuestion: (nextQuestionId: string) => void;
  goToPreviousQuestion: () => void;
  skipQuestion: (questionId: string, reason?: string) => void;

  // Actions - Answers
  setAnswer: (
    questionId: string,
    value: QuestionAnswer['value']
  ) => void;
  updateAnswer: (
    questionId: string,
    value: QuestionAnswer['value']
  ) => void;
  clearAnswer: (questionId: string) => void;
  clearAllAnswers: () => void;

  // Actions - Progress
  updateProgress: (progress: Partial<QuestionnaireProgress>) => void;

  // Actions - Validation
  setValidationError: (questionId: string, error: string) => void;
  clearValidationError: (questionId: string) => void;
  clearAllValidationErrors: () => void;

  // Actions - Bulk Operations
  loadSavedAnswers: (answers: Record<string, QuestionAnswer>) => void;
  exportAnswers: () => Record<string, QuestionAnswer>;

  // Reset
  resetQuestionnaire: () => void;
}

const initialState = {
  sessionId: null,
  isActive: false,
  startedAt: null,
  lastUpdatedAt: null,
  answers: {},
  currentQuestionId: null,
  visitedQuestionIds: [],
  questionHistory: [],
  progress: {
    currentQuestionIndex: 0,
    totalQuestions: 0,
    percentComplete: 0,
    skippedQuestions: [],
    answeredQuestions: [],
  },
  validationErrors: {},
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Session Management
      startQuestionnaire: (sessionId) =>
        set((state) => {
          state.sessionId = sessionId;
          state.isActive = true;
          state.startedAt = Date.now();
          state.lastUpdatedAt = Date.now();
        }),

      endQuestionnaire: () =>
        set((state) => {
          state.isActive = false;
          state.lastUpdatedAt = Date.now();
        }),

      pauseQuestionnaire: () =>
        set((state) => {
          state.isActive = false;
          state.lastUpdatedAt = Date.now();
        }),

      resumeQuestionnaire: () =>
        set((state) => {
          state.isActive = true;
          state.lastUpdatedAt = Date.now();
        }),

      // Navigation
      setCurrentQuestion: (questionId) =>
        set((state) => {
          state.currentQuestionId = questionId;

          if (!state.visitedQuestionIds.includes(questionId)) {
            state.visitedQuestionIds.push(questionId);
          }

          state.lastUpdatedAt = Date.now();
        }),

      goToNextQuestion: (nextQuestionId) =>
        set((state) => {
          if (state.currentQuestionId) {
            state.questionHistory.push(state.currentQuestionId);
          }

          state.currentQuestionId = nextQuestionId;

          if (!state.visitedQuestionIds.includes(nextQuestionId)) {
            state.visitedQuestionIds.push(nextQuestionId);
          }

          state.progress.currentQuestionIndex += 1;
          state.lastUpdatedAt = Date.now();
        }),

      goToPreviousQuestion: () =>
        set((state) => {
          const previousId = state.questionHistory.pop();

          if (previousId) {
            state.currentQuestionId = previousId;
            state.progress.currentQuestionIndex = Math.max(
              0,
              state.progress.currentQuestionIndex - 1
            );
          }

          state.lastUpdatedAt = Date.now();
        }),

      skipQuestion: (questionId) =>
        set((state) => {
          if (!state.progress.skippedQuestions.includes(questionId)) {
            state.progress.skippedQuestions.push(questionId);
          }

          state.lastUpdatedAt = Date.now();
        }),

      // Answers
      setAnswer: (questionId, value) =>
        set((state) => {
           
          state.answers[questionId] = {
            questionId,
            value,
            timestamp: Date.now(),
          };

          // Update progress
          if (!state.progress.answeredQuestions.includes(questionId)) {
            state.progress.answeredQuestions.push(questionId);
          }

          // Remove from skipped if it was skipped
          const skippedIndex = state.progress.skippedQuestions.indexOf(questionId);
          if (skippedIndex > -1) {
            state.progress.skippedQuestions.splice(skippedIndex, 1);
          }

          // Recalculate progress percentage
          if (state.progress.totalQuestions > 0) {
            state.progress.percentComplete = Math.round(
              (state.progress.answeredQuestions.length / state.progress.totalQuestions) * 100
            );
          }

          state.lastUpdatedAt = Date.now();
        }),

      updateAnswer: (questionId, value) =>
        set((state) => {
           
          state.answers[questionId] = {
            questionId,
            value,
            timestamp: Date.now(),
          };

          state.lastUpdatedAt = Date.now();
        }),

      clearAnswer: (questionId) =>
        set((state) => {
           
          delete state.answers[questionId];

          const answeredIndex = state.progress.answeredQuestions.indexOf(questionId);
          if (answeredIndex > -1) {
            state.progress.answeredQuestions.splice(answeredIndex, 1);
          }

          // Recalculate progress percentage
          if (state.progress.totalQuestions > 0) {
            state.progress.percentComplete = Math.round(
              (state.progress.answeredQuestions.length / state.progress.totalQuestions) * 100
            );
          }

          state.lastUpdatedAt = Date.now();
        }),

      clearAllAnswers: () =>
        set((state) => {
          state.answers = {};
          state.progress.answeredQuestions = [];
          state.progress.percentComplete = 0;
          state.lastUpdatedAt = Date.now();
        }),

      // Progress
      updateProgress: (progress) =>
        set((state) => {
          state.progress = { ...state.progress, ...progress };
          state.lastUpdatedAt = Date.now();
        }),

      // Validation
      setValidationError: (questionId, error) =>
        set((state) => {
           
          state.validationErrors[questionId] = error;
        }),

      clearValidationError: (questionId) =>
        set((state) => {
           
          delete state.validationErrors[questionId];
        }),

      clearAllValidationErrors: () =>
        set((state) => {
          state.validationErrors = {};
        }),

      // Bulk Operations
      loadSavedAnswers: (answers) =>
        set((state) => {
          state.answers = answers;
          state.progress.answeredQuestions = Object.keys(answers);

          if (state.progress.totalQuestions > 0) {
            state.progress.percentComplete = Math.round(
              (state.progress.answeredQuestions.length / state.progress.totalQuestions) * 100
            );
          }

          state.lastUpdatedAt = Date.now();
        }),

      exportAnswers: () => {
        return get().answers;
      },

      // Reset
      resetQuestionnaire: () => set(initialState),
    })),
    { name: 'QuestionnaireStore' }
  )
);

