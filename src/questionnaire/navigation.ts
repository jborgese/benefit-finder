/**
 * Question Navigation & Skip Logic
 *
 * Handles navigation through question flows with skip and branch logic.
 */

import { FlowEngine } from './flow-engine';
import type {
  QuestionFlow,
  FlowNode,
  FlowBranch,
  QuestionContext,
  NavigationResult,
  SkipRule,
} from './types';

// ============================================================================
// SKIP LOGIC
// ============================================================================

/**
 * Skip logic manager
 */
export class SkipLogicManager {
  private skipRules: SkipRule[] = [];
  private engine: FlowEngine;

  constructor(flow: QuestionFlow) {
    this.engine = new FlowEngine(flow);
  }

  /**
   * Add a skip rule
   */
  addSkipRule(rule: SkipRule): void {
    this.skipRules.push(rule);
    // Sort by priority (higher first)
    this.skipRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Remove a skip rule
   */
  removeSkipRule(ruleId: string): boolean {
    const initialLength = this.skipRules.length;
    this.skipRules = this.skipRules.filter((r) => r.id !== ruleId);
    return this.skipRules.length < initialLength;
  }

  /**
   * Get all skip rules
   */
  getSkipRules(): SkipRule[] {
    return [...this.skipRules];
  }

  /**
   * Check if questions should be skipped
   *
   * @param context Current answer context
   * @returns Array of question IDs to skip
   */
  getQuestionsToSkip(context: QuestionContext): string[] {
    this.engine.setContext(context);
    const toSkip = new Set<string>();

    for (const rule of this.skipRules) {
      const conditionResult = this.engine.evaluateCondition(rule.condition);

      if (conditionResult.met) {
        for (const questionId of rule.questionIds) {
          toSkip.add(questionId);
        }
      }
    }

    return Array.from(toSkip);
  }

  /**
   * Check if a specific question should be skipped
   */
  shouldSkipQuestion(questionId: string, context: QuestionContext): boolean {
    const toSkip = this.getQuestionsToSkip(context);
    return toSkip.includes(questionId);
  }
}

// ============================================================================
// NAVIGATION MANAGER
// ============================================================================

/**
 * Navigation manager with skip logic
 */
export class NavigationManager {
  private engine: FlowEngine;
  private skipManager: SkipLogicManager;
  private history: string[] = [];

  constructor(flow: QuestionFlow) {
    this.engine = new FlowEngine(flow);
    this.skipManager = new SkipLogicManager(flow);
  }

  /**
   * Get flow engine
   */
  getEngine(): FlowEngine {
    return this.engine;
  }

  /**
   * Get skip manager
   */
  getSkipManager(): SkipLogicManager {
    return this.skipManager;
  }

  /**
   * Update context
   */
  updateContext(fieldName: string, value: unknown): void {
    this.engine.updateContext(fieldName, value);
  }

  /**
   * Get context
   */
  getContext(): QuestionContext {
    return this.engine.getContext();
  }

  /**
   * Navigate forward with skip logic
   */
  navigateForward(currentNodeId: string): NavigationResult {
    const context = this.engine.getContext();
    const questionsToSkip = new Set(this.skipManager.getQuestionsToSkip(context));
    const skippedQuestions: string[] = [];

    let result = this.engine.navigateNext(currentNodeId);

    // Skip nodes that should be skipped
    while (result.success && result.targetNodeId) {
      const question = this.engine.getQuestion(result.targetNodeId);

      if (!question) {
        break;
      }

      // Check if should be skipped
      const shouldSkip = questionsToSkip.has(question.id) ||
                        !this.engine.shouldShowQuestion(question);

      if (!shouldSkip) {
        break; // Found next visible question
      }

      skippedQuestions.push(question.id);
      result = this.engine.navigateNext(result.targetNodeId);
    }

    // Add to history
    if (result.success && result.targetNodeId) {
      this.history.push(result.targetNodeId);
    }

    return {
      ...result,
      questionsSkipped: skippedQuestions.length > 0 ? skippedQuestions : undefined,
    };
  }

  /**
   * Navigate backward
   */
  navigateBackward(currentNodeId: string): NavigationResult {
    const result = this.engine.navigatePrevious(currentNodeId);

    // Remove from history
    if (result.success) {
      this.history.pop();
    }

    return result;
  }

  /**
   * Jump to node
   */
  jumpTo(targetNodeId: string): NavigationResult {
    const result = this.engine.jumpToNode(targetNodeId);

    if (result.success && result.targetNodeId) {
      this.history.push(result.targetNodeId);
    }

    return result;
  }

  /**
   * Get navigation history
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Can navigate backward
   */
  canGoBack(): boolean {
    return this.history.length > 1;
  }

  /**
   * Can navigate forward
   */
  canGoForward(currentNodeId: string): boolean {
    const result = this.engine.findNextNode(currentNodeId);
    return result.success && result.targetNodeId !== undefined;
  }
}

// ============================================================================
// BRANCH EVALUATION
// ============================================================================

/**
 * Evaluate all branches for a node
 *
 * @param node Flow node
 * @param context Answer context
 * @returns Matching branch or null
 */
export function evaluateBranches(
  node: FlowNode,
  context: QuestionContext
): FlowBranch | null {
  if (!node.branches || node.branches.length === 0) {
    return null;
  }

  const engine = new FlowEngine({
    id: 'temp',
    name: 'temp',
    startNodeId: node.id,
    nodes: new Map([[node.id, node]]),
    version: '1.0.0',
    allowSaveAndResume: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  engine.setContext(context);

  // Sort by priority
  const sortedBranches = [...node.branches].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  for (const branch of sortedBranches) {
    const result = engine.evaluateCondition(branch.condition);

    if (result.met) {
      return branch;
    }
  }

  return null;
}

/**
 * Find path through flow based on context
 *
 * @param flow Question flow
 * @param context Answer context
 * @returns Array of node IDs representing the path
 */
export function findFlowPath(
  flow: QuestionFlow,
  context: QuestionContext
): string[] {
  const engine = new FlowEngine(flow);
  engine.setContext(context);

  const path: string[] = [];
  let currentNodeId: string | undefined = flow.startNodeId;
  const visited = new Set<string>();
  const maxSteps = 1000; // Prevent infinite loops
  let steps = 0;

  while (currentNodeId && steps < maxSteps) {
    if (visited.has(currentNodeId)) {
      // Circular reference detected
      break;
    }

    visited.add(currentNodeId);
    path.push(currentNodeId);

    const result = engine.findNextNode(currentNodeId);

    if (!result.success || !result.targetNodeId) {
      break; // End of flow or error
    }

    currentNodeId = result.targetNodeId;
    steps++;
  }

  return path;
}

