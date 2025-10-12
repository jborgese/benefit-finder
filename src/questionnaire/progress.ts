/**
 * Progress Tracking System
 *
 * Tracks questionnaire progress, completion metrics,
 * and time estimates.
 */

import type {
  QuestionFlow,
  QuestionDefinition,
  QuestionState,
  QuestionAnswer,
  ProgressMetrics,
  ProgressCheckpoint,
  FlowSection,
  QuestionContext,
} from './types';
import { FlowEngine } from './flow-engine';

// ============================================================================
// PROGRESS CALCULATOR
// ============================================================================

/**
 * Calculate progress metrics
 *
 * @param flow Question flow
 * @param questionStates Current question states
 * @param context Answer context
 * @returns Progress metrics
 */
export function calculateProgress(
  flow: QuestionFlow,
  questionStates: Map<string, QuestionState>,
  context: QuestionContext
): ProgressMetrics {
  const engine = new FlowEngine(flow);
  engine.setContext(context);

  // Get visible questions based on current context
  const visibleQuestions = engine.getVisibleQuestions();
  const totalQuestions = visibleQuestions.length;

  // Count required questions
  const requiredQuestions = visibleQuestions.filter((q) => q.required).length;

  // Count answered questions
  let answeredQuestions = 0;
  let answeredRequired = 0;
  let skippedQuestions = 0;

  for (const question of visibleQuestions) {
    const state = questionStates.get(question.id);

    if (state?.status === 'answered') {
      answeredQuestions++;
      if (question.required) {
        answeredRequired++;
      }
    } else if (state?.status === 'skipped') {
      skippedQuestions++;
    }
  }

  // Calculate percentages
  const progressPercent = totalQuestions > 0
    ? (answeredQuestions / totalQuestions) * 100
    : 0;

  const requiredProgressPercent = requiredQuestions > 0
    ? (answeredRequired / requiredQuestions) * 100
    : 100; // If no required questions, consider 100% complete

  const remainingQuestions = totalQuestions - answeredQuestions - skippedQuestions;

  return {
    totalQuestions,
    requiredQuestions,
    answeredQuestions,
    skippedQuestions,
    remainingQuestions,
    progressPercent: Math.round(progressPercent),
    requiredProgressPercent: Math.round(requiredProgressPercent),
  };
}

/**
 * Estimate time remaining
 *
 * @param progress Progress metrics
 * @param averageTimePerQuestion Average seconds per question
 * @returns Estimated seconds remaining
 */
export function estimateTimeRemaining(
  progress: ProgressMetrics,
  averageTimePerQuestion = 30
): number {
  return progress.remainingQuestions * averageTimePerQuestion;
}

/**
 * Calculate completion percentage
 *
 * @param answeredQuestions Number of answered questions
 * @param totalQuestions Total questions
 * @returns Percentage (0-100)
 */
export function calculateCompletionPercentage(
  answeredQuestions: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) {
    return 100;
  }

  return Math.round((answeredQuestions / totalQuestions) * 100);
}

// ============================================================================
// CHECKPOINT MANAGEMENT
// ============================================================================

/**
 * Checkpoint manager
 */
export class CheckpointManager {
  private checkpoints: ProgressCheckpoint[] = [];
  private maxCheckpoints = 50;

  /**
   * Create a checkpoint
   */
  createCheckpoint(
    nodeId: string,
    name: string,
    answers: Map<string, QuestionAnswer>,
    description?: string
  ): ProgressCheckpoint {
    const answersSnapshot: Record<string, unknown> = {};

    for (const [_key, answer] of answers.entries()) {
      answersSnapshot[answer.fieldName] = answer.value;
    }

    const checkpoint: ProgressCheckpoint = {
      id: `checkpoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nodeId,
      name,
      description,
      timestamp: Date.now(),
      answersSnapshot,
    };

    this.checkpoints.push(checkpoint);

    // Trim old checkpoints if exceeding limit
    if (this.checkpoints.length > this.maxCheckpoints) {
      this.checkpoints = this.checkpoints.slice(-this.maxCheckpoints);
    }

    return checkpoint;
  }

  /**
   * Get all checkpoints
   */
  getCheckpoints(): ProgressCheckpoint[] {
    return [...this.checkpoints];
  }

  /**
   * Get checkpoint by ID
   */
  getCheckpoint(id: string): ProgressCheckpoint | null {
    return this.checkpoints.find((c) => c.id === id) ?? null;
  }

  /**
   * Get latest checkpoint
   */
  getLatestCheckpoint(): ProgressCheckpoint | null {
    return this.checkpoints[this.checkpoints.length - 1] || null;
  }

  /**
   * Restore from checkpoint
   */
  restoreCheckpoint(id: string): Record<string, unknown> | null {
    const checkpoint = this.getCheckpoint(id);
    return checkpoint ? { ...checkpoint.answersSnapshot } : null;
  }

  /**
   * Clear all checkpoints
   */
  clearCheckpoints(): void {
    this.checkpoints = [];
  }

  /**
   * Set maximum checkpoints to keep
   */
  setMaxCheckpoints(max: number): void {
    this.maxCheckpoints = max;
    if (this.checkpoints.length > max) {
      this.checkpoints = this.checkpoints.slice(-max);
    }
  }
}

// ============================================================================
// SECTION PROGRESS
// ============================================================================

/**
 * Calculate section progress
 *
 * @param section Flow section
 * @param questionStates Question states
 * @returns Section progress metrics
 */
export function calculateSectionProgress(
  section: FlowSection,
  questionStates: Map<string, QuestionState>
): {
  sectionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  progressPercent: number;
  completed: boolean;
} {
  const totalQuestions = section.questionIds.length;
  let answeredQuestions = 0;

  for (const questionId of section.questionIds) {
    const state = questionStates.get(questionId);
    if (state?.status === 'answered') {
      answeredQuestions++;
    }
  }

  const progressPercent = totalQuestions > 0
    ? (answeredQuestions / totalQuestions) * 100
    : 100;

  return {
    sectionId: section.id,
    totalQuestions,
    answeredQuestions,
    progressPercent: Math.round(progressPercent),
    completed: answeredQuestions === totalQuestions,
  };
}

/**
 * Calculate progress for all sections
 */
export function calculateAllSectionsProgress(
  sections: FlowSection[],
  questionStates: Map<string, QuestionState>
): Array<ReturnType<typeof calculateSectionProgress>> {
  return sections.map((section) => calculateSectionProgress(section, questionStates));
}

// ============================================================================
// TIME TRACKING
// ============================================================================

/**
 * Time tracker for questionnaire completion
 */
export class TimeTracker {
  private startTime: number = 0;
  private pausedTime: number = 0;
  private totalPausedDuration: number = 0;
  private questionTimes: Map<string, number> = new Map();

  /**
   * Start tracking
   */
  start(): void {
    this.startTime = Date.now();
  }

  /**
   * Pause tracking
   */
  pause(): void {
    if (this.pausedTime === 0) {
      this.pausedTime = Date.now();
    }
  }

  /**
   * Resume tracking
   */
  resume(): void {
    if (this.pausedTime > 0) {
      this.totalPausedDuration += Date.now() - this.pausedTime;
      this.pausedTime = 0;
    }
  }

  /**
   * Record time spent on a question
   */
  recordQuestionTime(questionId: string, duration: number): void {
    const existing = this.questionTimes.get(questionId) ?? 0;
    this.questionTimes.set(questionId, existing + duration);
  }

  /**
   * Get total elapsed time (excluding pauses)
   */
  getElapsedTime(): number {
    const now = this.pausedTime || Date.now();
    return now - this.startTime - this.totalPausedDuration;
  }

  /**
   * Get average time per question
   */
  getAverageQuestionTime(): number {
    if (this.questionTimes.size === 0) {
      return 0;
    }

    const total = Array.from(this.questionTimes.values()).reduce((a, b) => a + b, 0);
    return total / this.questionTimes.size;
  }

  /**
   * Get time for specific question
   */
  getQuestionTime(questionId: string): number {
    return this.questionTimes.get(questionId) ?? 0;
  }

  /**
   * Get all question times
   */
  getAllQuestionTimes(): Map<string, number> {
    return new Map(this.questionTimes);
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.startTime = 0;
    this.pausedTime = 0;
    this.totalPausedDuration = 0;
    this.questionTimes.clear();
  }
}

// ============================================================================
// COMPLETION TRACKING
// ============================================================================

/**
 * Check if all required questions are answered
 */
function checkRequiredQuestionsAnswered(
  visibleQuestions: QuestionDefinition[],
  questionStates: Map<string, QuestionState>
): boolean {
  for (const question of visibleQuestions) {
    if (question.required) {
      const state = questionStates.get(question.id);
      if (state?.status !== 'answered') {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check if any questions remain pending or current
 */
function checkAnyQuestionsRemaining(
  visibleQuestions: QuestionDefinition[],
  questionStates: Map<string, QuestionState>
): boolean {
  for (const question of visibleQuestions) {
    const state = questionStates.get(question.id);
    if (state?.status === 'pending' || state?.status === 'current') {
      return true;
    }
  }
  return false;
}

/**
 * Check if flow is complete
 *
 * @param flow Question flow
 * @param questionStates Question states
 * @param requireAllRequired Require all required questions to be answered
 * @returns Whether flow is complete
 */
export function isFlowComplete(
  flow: QuestionFlow,
  questionStates: Map<string, QuestionState>,
  requireAllRequired = true
): boolean {
  const engine = new FlowEngine(flow);
  const visibleQuestions = engine.getVisibleQuestions();

  if (requireAllRequired) {
    return checkRequiredQuestionsAnswered(visibleQuestions, questionStates);
  } else {
    return !checkAnyQuestionsRemaining(visibleQuestions, questionStates);
  }
}

/**
 * Get incomplete required questions
 *
 * @param flow Question flow
 * @param questionStates Question states
 * @param context Answer context
 * @returns Array of incomplete required questions
 */
export function getIncompleteRequiredQuestions(
  flow: QuestionFlow,
  questionStates: Map<string, QuestionState>,
  context: QuestionContext
): QuestionDefinition[] {
  const engine = new FlowEngine(flow);
  engine.setContext(context);

  const visibleQuestions = engine.getVisibleQuestions();
  const incomplete: QuestionDefinition[] = [];

  for (const question of visibleQuestions) {
    if (question.required) {
      const state = questionStates.get(question.id);
      if (state?.status !== 'answered') {
        incomplete.push(question);
      }
    }
  }

  return incomplete;
}

