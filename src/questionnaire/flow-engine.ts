/**
 * Question Flow Engine
 *
 * Manages dynamic question flows with conditional logic,
 * branching, and skip logic.
 */

import { evaluateRuleSync } from '../rules/core/evaluator';
import type { JsonLogicRule } from '../rules/core/types';
import type {
  QuestionFlow,
  FlowNode,
  FlowBranch,
  QuestionDefinition,
  QuestionContext,
  NavigationResult,
  NavigationOptions,
  ConditionEvaluationResult,
  FlowValidationResult,
} from './types';

// ============================================================================
// FLOW ENGINE CLASS
// ============================================================================

/**
 * Question Flow Engine
 *
 * Manages question flow execution, conditional logic, and navigation.
 */
export class FlowEngine {
  private flow: QuestionFlow;
  private context: QuestionContext;

  constructor(flow: QuestionFlow) {
    this.flow = flow;
    this.context = {};
  }

  /**
   * Get flow definition
   */
  getFlow(): QuestionFlow {
    return this.flow;
  }

  /**
   * Get starting node
   */
  getStartNode(): FlowNode | null {
    return this.flow.nodes.get(this.flow.startNodeId) ?? null;
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): FlowNode | null {
    return this.flow.nodes.get(nodeId) ?? null;
  }

  /**
   * Get question by ID
   */
  getQuestion(nodeId: string): QuestionDefinition | null {
    const node = this.getNode(nodeId);
    return node?.question ?? null;
  }

  /**
   * Update context with answer
   */
  updateContext(fieldName: string, value: unknown): void {
    // Using bracket notation for dynamic field access
    // This is intentional and safe as fieldName comes from trusted question definitions
     
    this.context[fieldName] = value;
  }

  /**
   * Get current context
   */
  getContext(): QuestionContext {
    return { ...this.context };
  }

  /**
   * Set context
   */
  setContext(context: QuestionContext): void {
    this.context = { ...context };
  }

  /**
   * Evaluate condition
   */
  evaluateCondition(condition: JsonLogicRule): ConditionEvaluationResult {
    const startTime = performance.now();

    try {
      const result = evaluateRuleSync(condition, this.context);
      const endTime = performance.now();

      return {
        met: Boolean(result.result),
        rule: condition,
        data: this.context,
        evaluationTime: endTime - startTime,
        error: result.error,
      };
    } catch (error) {
      const endTime = performance.now();

      return {
        met: false,
        rule: condition,
        data: this.context,
        evaluationTime: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if question should be shown
   */
  shouldShowQuestion(question: QuestionDefinition): boolean {
    if (!question.showIf) {
      return true; // No condition = always show
    }

    const result = this.evaluateCondition(question.showIf);
    return result.met;
  }

  /**
   * Find next node based on conditional logic
   */
  findNextNode(currentNodeId: string): NavigationResult {
    const currentNode = this.getNode(currentNodeId);

    if (!currentNode) {
      return {
        success: false,
        error: `Node ${currentNodeId} not found`,
      };
    }

    // Check if terminal node
    if (currentNode.isTerminal) {
      return {
        success: true,
        targetNodeId: undefined,
        previousNodeId: currentNodeId,
      };
    }

    // Evaluate branches (sorted by priority)
    if (currentNode.branches && currentNode.branches.length > 0) {
      const sortedBranches = [...currentNode.branches].sort(
        (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
      );

      for (const branch of sortedBranches) {
        const conditionResult = this.evaluateCondition(branch.condition);

        if (conditionResult.met) {
          return {
            success: true,
            targetNodeId: branch.targetId,
            previousNodeId: currentNodeId,
            branchTaken: true,
            branchId: branch.id,
          };
        }
      }
    }

    // Use default next node
    if (currentNode.nextId) {
      return {
        success: true,
        targetNodeId: currentNode.nextId,
        previousNodeId: currentNodeId,
        branchTaken: false,
      };
    }

    // No next node found
    return {
      success: false,
      error: 'No next node found and not a terminal node',
      previousNodeId: currentNodeId,
    };
  }

  /**
   * Navigate to next node
   */
  navigateNext(currentNodeId: string, _options: NavigationOptions = {}): NavigationResult {
    return this.findNextNode(currentNodeId);
  }

  /**
   * Navigate to previous node
   */
  navigatePrevious(currentNodeId: string): NavigationResult {
    const currentNode = this.getNode(currentNodeId);

    if (!currentNode) {
      return {
        success: false,
        error: `Node ${currentNodeId} not found`,
      };
    }

    if (!currentNode.previousId) {
      return {
        success: false,
        error: 'No previous node available',
        previousNodeId: currentNodeId,
      };
    }

    return {
      success: true,
      targetNodeId: currentNode.previousId,
      previousNodeId: currentNodeId,
    };
  }

  /**
   * Jump to specific node
   */
  jumpToNode(targetNodeId: string): NavigationResult {
    const targetNode = this.getNode(targetNodeId);

    if (!targetNode) {
      return {
        success: false,
        error: `Node ${targetNodeId} not found`,
      };
    }

    return {
      success: true,
      targetNodeId,
    };
  }

  /**
   * Get all visible questions based on current context
   */
  getVisibleQuestions(): QuestionDefinition[] {
    const visible: QuestionDefinition[] = [];

    for (const node of this.flow.nodes.values()) {
      if (this.shouldShowQuestion(node.question)) {
        visible.push(node.question);
      }
    }

    return visible;
  }

  /**
   * Get questions that would be skipped
   */
  getSkippedQuestions(): QuestionDefinition[] {
    const skipped: QuestionDefinition[] = [];

    for (const node of this.flow.nodes.values()) {
      if (!this.shouldShowQuestion(node.question)) {
        skipped.push(node.question);
      }
    }

    return skipped;
  }

  /**
   * Validate flow structure
   */
  validateFlow(): FlowValidationResult {
    const errors: Array<{
      nodeId?: string;
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    const orphanedNodes: string[] = [];
    const circularReferences: string[][] = [];
    const missingBranches: string[] = [];

    // Check start node exists
    this.validateStartNode(errors);

    // Check all nodes
    this.validateAllNodes(errors, missingBranches);

    // Check for orphaned nodes (not reachable from start)
    this.validateReachability(errors, orphanedNodes);

    // Check for circular references
    this.validateCycles(errors, circularReferences);

    return {
      valid: errors.filter((e) => e.severity === 'error').length === 0,
      errors,
      orphanedNodes,
      circularReferences,
      missingBranches,
    };
  }

  /**
   * Validate that start node exists
   */
  private validateStartNode(
    errors: Array<{ nodeId?: string; message: string; severity: 'error' | 'warning' }>
  ): void {
    if (!this.flow.nodes.has(this.flow.startNodeId)) {
      errors.push({
        message: 'Start node not found in flow',
        severity: 'error',
      });
    }
  }

  /**
   * Validate all nodes in the flow
   */
  private validateAllNodes(
    errors: Array<{ nodeId?: string; message: string; severity: 'error' | 'warning' }>,
    missingBranches: string[]
  ): void {
    for (const [nodeId, node] of this.flow.nodes.entries()) {
      // Check next node exists
      if (node.nextId && !this.flow.nodes.has(node.nextId)) {
        errors.push({
          nodeId,
          message: `Next node ${node.nextId} not found`,
          severity: 'error',
        });
        missingBranches.push(node.nextId);
      }

      // Check branch targets exist
      this.validateNodeBranches(nodeId, node, errors, missingBranches);

      // Check for required field
      if (!node.question.fieldName) {
        errors.push({
          nodeId,
          message: 'Question missing fieldName',
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate node branch targets
   */
  private validateNodeBranches(
    nodeId: string,
    node: FlowNode,
    errors: Array<{ nodeId?: string; message: string; severity: 'error' | 'warning' }>,
    missingBranches: string[]
  ): void {
    if (!node.branches) {
      return;
    }

    for (const branch of node.branches) {
      if (!this.flow.nodes.has(branch.targetId)) {
        errors.push({
          nodeId,
          message: `Branch target ${branch.targetId} not found`,
          severity: 'error',
        });
        missingBranches.push(branch.targetId);
      }
    }
  }

  /**
   * Validate node reachability
   */
  private validateReachability(
    errors: Array<{ nodeId?: string; message: string; severity: 'error' | 'warning' }>,
    orphanedNodes: string[]
  ): void {
    const reachable = this.findReachableNodes();
    for (const nodeId of this.flow.nodes.keys()) {
      if (!reachable.has(nodeId)) {
        orphanedNodes.push(nodeId);
        errors.push({
          nodeId,
          message: 'Node is not reachable from start',
          severity: 'warning',
        });
      }
    }
  }

  /**
   * Validate for circular references
   */
  private validateCycles(
    errors: Array<{ nodeId?: string; message: string; severity: 'error' | 'warning' }>,
    circularReferences: string[][]
  ): void {
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      circularReferences.push(...cycles);
      for (const cycle of cycles) {
        errors.push({
          message: `Circular reference detected: ${cycle.join(' -> ')}`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Find all reachable nodes from start
   */
  private findReachableNodes(): Set<string> {
    const reachable = new Set<string>();
    const queue = [this.flow.startNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift();

      // Skip if queue was empty (shouldn't happen due to while condition)
      if (!nodeId) {
        continue;
      }

      if (reachable.has(nodeId)) {
        continue;
      }

      reachable.add(nodeId);

      const node = this.getNode(nodeId);
      if (!node) {
        continue;
      }

      // Add next node
      if (node.nextId) {
        queue.push(node.nextId);
      }

      // Add branch targets
      if (node.branches) {
        for (const branch of node.branches) {
          queue.push(branch.targetId);
        }
      }
    }

    return reachable;
  }

  /**
   * Detect circular references in flow
   */
  private detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart).concat(nodeId));
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = this.getNode(nodeId);
      if (node) {
        if (node.nextId) {
          dfs(node.nextId, [...path]);
        }

        if (node.branches) {
          for (const branch of node.branches) {
            dfs(branch.targetId, [...path]);
          }
        }
      }

      recursionStack.delete(nodeId);
    };

    dfs(this.flow.startNodeId, []);

    return cycles;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new flow
 */
export function createFlow(
  id: string,
  name: string,
  startNodeId: string
): QuestionFlow {
  return {
    id,
    name,
    description: '',
    version: '1.0.0',
    startNodeId,
    nodes: new Map(),
    allowSaveAndResume: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Create a flow node
 */
export function createFlowNode(
  id: string,
  question: QuestionDefinition
): FlowNode {
  return {
    id,
    question,
    branches: [],
  };
}

/**
 * Add node to flow
 * Note: Mutates flow in place for performance and API consistency
 */
export function addNodeToFlow(
  flow: QuestionFlow,
  node: FlowNode
): QuestionFlow {
  flow.nodes.set(node.id, node);
   
  flow.updatedAt = Date.now();
  return flow;
}

/**
 * Link two nodes (create default path)
 * Note: Mutates flow in place for performance and API consistency
 */
export function linkNodes(
  flow: QuestionFlow,
  fromId: string,
  toId: string
): QuestionFlow {
  const fromNode = flow.nodes.get(fromId);
  const toNode = flow.nodes.get(toId);

  if (!fromNode || !toNode) {
    throw new Error('One or both nodes not found');
  }

  fromNode.nextId = toId;
  toNode.previousId = fromId;
   
  flow.updatedAt = Date.now();

  return flow;
}

/**
 * Add conditional branch to node
 * Note: Mutates flow in place for performance and API consistency
 */
export function addBranch(
  flow: QuestionFlow,
  fromNodeId: string,
  branch: FlowBranch
): QuestionFlow {
  const node = flow.nodes.get(fromNodeId);

  if (!node) {
    throw new Error(`Node ${fromNodeId} not found`);
  }

  // Initialize branches array if needed using nullish coalescing assignment
  node.branches ??= [];

  node.branches.push(branch);
   
  flow.updatedAt = Date.now();

  return flow;
}

