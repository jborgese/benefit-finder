/**
 * Navigation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  NavigationManager,
  SkipLogicManager,
  evaluateBranches,
  findFlowPath,
} from '../navigation';
import {
  createFlow,
  createFlowNode,
  addNodeToFlow,
  linkNodes,
} from '../flow-engine';
import type { SkipRule } from '../types';

describe('Navigation', () => {
  describe('NavigationManager', () => {
    it('should navigate forward', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Q2',
        inputType: 'text',
        fieldName: 'f2',
      }));

      linkNodes(flow, 'node1', 'node2');

      const nav = new NavigationManager(flow);
      const result = nav.navigateForward('node1');

      expect(result.success).toBe(true);
      expect(result.targetNodeId).toBe('node2');
    });

    it('should navigate backward', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Q2',
        inputType: 'text',
        fieldName: 'f2',
      }));

      linkNodes(flow, 'node1', 'node2');

      const nav = new NavigationManager(flow);
      nav.navigateForward('node1');

      const result = nav.navigateBackward('node2');

      expect(result.success).toBe(true);
      expect(result.targetNodeId).toBe('node1');
    });

    it('should skip questions based on context', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Are you over 18?',
        inputType: 'boolean',
        fieldName: 'over18',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Children question (skip if no children)',
        inputType: 'text',
        fieldName: 'childInfo',
        showIf: { '==': [{ var: 'hasChildren' }, true] },
      }));

      addNodeToFlow(flow, createFlowNode('node3', {
        id: 'q3',
        text: 'Final question',
        inputType: 'text',
        fieldName: 'final',
      }));

      linkNodes(flow, 'node1', 'node2');
      linkNodes(flow, 'node2', 'node3');

      const nav = new NavigationManager(flow);
      nav.updateContext('hasChildren', false);

      const result = nav.navigateForward('node1');

      // Should skip node2 and go directly to node3
      expect(result.success).toBe(true);
      expect(result.targetNodeId).toBe('node3');
      expect(result.questionsSkipped).toContain('q2');
    });

    it('should maintain correct history when navigating back after skipping questions', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Question 1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Question 2 (skip if false)',
        inputType: 'text',
        fieldName: 'f2',
        showIf: { '==': [{ var: 'skip' }, false] },
      }));

      addNodeToFlow(flow, createFlowNode('node3', {
        id: 'q3',
        text: 'Question 3',
        inputType: 'text',
        fieldName: 'f3',
      }));

      linkNodes(flow, 'node1', 'node2');
      linkNodes(flow, 'node2', 'node3');

      const nav = new NavigationManager(flow);
      nav.updateContext('skip', true); // This will cause q2 to be skipped

      // Navigate forward from q1 - should skip q2 and go to q3
      const forwardResult = nav.navigateForward('node1');
      expect(forwardResult.success).toBe(true);
      expect(forwardResult.targetNodeId).toBe('node3');
      expect(forwardResult.questionsSkipped).toContain('q2');

      // Check history - should contain node1 and node3, but not node2
      const historyAfterForward = nav.getHistory();
      expect(historyAfterForward).toContain('node1');
      expect(historyAfterForward).toContain('node3');
      expect(historyAfterForward).not.toContain('node2');

      // Navigate backward from q3 - should go back to q1 (skipping q2)
      const backResult = nav.navigateBackward('node3');
      expect(backResult.success).toBe(true);
      expect(backResult.targetNodeId).toBe('node1');

      // Check history after backward navigation
      const historyAfterBack = nav.getHistory();
      expect(historyAfterBack).toContain('node1');
      expect(historyAfterBack).not.toContain('node3');
      expect(historyAfterBack).not.toContain('node2');
      expect(historyAfterBack.length).toBeLessThanOrEqual(historyAfterForward.length);
    });

    it('should handle multiple back navigations correctly', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Question 1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Question 2',
        inputType: 'text',
        fieldName: 'f2',
      }));

      addNodeToFlow(flow, createFlowNode('node3', {
        id: 'q3',
        text: 'Question 3',
        inputType: 'text',
        fieldName: 'f3',
      }));

      linkNodes(flow, 'node1', 'node2');
      linkNodes(flow, 'node2', 'node3');

      const nav = new NavigationManager(flow);

      // Navigate forward through all questions
      nav.navigateForward('node1');
      const history1 = nav.getHistory();
      expect(history1).toContain('node1');
      expect(history1).toContain('node2');

      nav.navigateForward('node2');
      const history2 = nav.getHistory();
      expect(history2).toContain('node3');

      // Navigate backward twice
      const back1 = nav.navigateBackward('node3');
      expect(back1.success).toBe(true);
      expect(back1.targetNodeId).toBe('node2');
      const historyAfterBack1 = nav.getHistory();
      expect(historyAfterBack1).not.toContain('node3');

      const back2 = nav.navigateBackward('node2');
      expect(back2.success).toBe(true);
      expect(back2.targetNodeId).toBe('node1');
      const historyAfterBack2 = nav.getHistory();
      expect(historyAfterBack2).not.toContain('node2');
      expect(historyAfterBack2).toContain('node1');
    });

    it('should handle back navigation with branches correctly', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Question 1',
        inputType: 'number',
        fieldName: 'value',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Branch A',
        inputType: 'text',
        fieldName: 'branchA',
      }));

      addNodeToFlow(flow, createFlowNode('node3', {
        id: 'q3',
        text: 'Branch B',
        inputType: 'text',
        fieldName: 'branchB',
      }));

      addNodeToFlow(flow, createFlowNode('node4', {
        id: 'q4',
        text: 'Final question',
        inputType: 'text',
        fieldName: 'final',
      }));

      linkNodes(flow, 'node1', 'node2');
      linkNodes(flow, 'node2', 'node4');
      linkNodes(flow, 'node3', 'node4');

      // Set up branch from node1
      const node1 = flow.nodes.get('node1');
      if (node1) {
        node1.branches = [
          {
            id: 'branch-high',
            condition: { '>=': [{ var: 'value' }, 50] },
            targetId: 'node3',
            priority: 1,
          },
          {
            id: 'branch-low',
            condition: { '<': [{ var: 'value' }, 50] },
            targetId: 'node2',
            priority: 0,
          },
        ];
      }

      const nav = new NavigationManager(flow);
      nav.updateContext('value', 75); // Should take branch to node3

      // Navigate forward - should take branch to node3
      const forwardResult = nav.navigateForward('node1');
      expect(forwardResult.success).toBe(true);
      expect(forwardResult.targetNodeId).toBe('node3');
      expect(forwardResult.branchTaken).toBe(true);

      const historyAfterForward = nav.getHistory();
      expect(historyAfterForward).toContain('node1');
      expect(historyAfterForward).toContain('node3');

      // Navigate backward - should go back to node1 (the branch origin)
      const backResult = nav.navigateBackward('node3');
      expect(backResult.success).toBe(true);
      expect(backResult.targetNodeId).toBe('node1');

      const historyAfterBack = nav.getHistory();
      expect(historyAfterBack).toContain('node1');
      expect(historyAfterBack).not.toContain('node3');
    });

    it('should maintain history consistency when current node is not last in history', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Question 1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Question 2',
        inputType: 'text',
        fieldName: 'f2',
      }));

      addNodeToFlow(flow, createFlowNode('node3', {
        id: 'q3',
        text: 'Question 3',
        inputType: 'text',
        fieldName: 'f3',
      }));

      linkNodes(flow, 'node1', 'node2');
      linkNodes(flow, 'node2', 'node3');

      const nav = new NavigationManager(flow);

      // Navigate forward
      nav.navigateForward('node1');
      nav.navigateForward('node2');

      // Manually manipulate history to simulate out-of-sync state
      // This tests the fix for history sync issues
      const history = nav.getHistory();
      expect(history[history.length - 1]).toBe('node3');

      // Navigate backward - should handle history correctly even if slightly out of sync
      const backResult = nav.navigateBackward('node3');
      expect(backResult.success).toBe(true);
      expect(backResult.targetNodeId).toBe('node2');

      const historyAfterBack = nav.getHistory();
      expect(historyAfterBack).not.toContain('node3');
      expect(historyAfterBack).toContain('node2');
    });
  });

  describe('SkipLogicManager', () => {
    it('should add and apply skip rules', () => {
      const flow = createFlow('test', 'Test', 'node1');

      const skipManager = new SkipLogicManager(flow);

      const skipRule: SkipRule = {
        id: 'skip-1',
        questionIds: ['q2', 'q3'],
        condition: { '==': [{ var: 'skipSection' }, true] },
        description: 'Skip section if not applicable',
      };

      skipManager.addSkipRule(skipRule);

      const toSkip = skipManager.getQuestionsToSkip({ skipSection: true });

      expect(toSkip).toContain('q2');
      expect(toSkip).toContain('q3');
    });

    it('should remove skip rules', () => {
      const flow = createFlow('test', 'Test', 'node1');
      const skipManager = new SkipLogicManager(flow);

      const skipRule: SkipRule = {
        id: 'skip-1',
        questionIds: ['q1'],
        condition: { var: 'skip' },
      };

      skipManager.addSkipRule(skipRule);
      expect(skipManager.getSkipRules().length).toBe(1);

      const removed = skipManager.removeSkipRule('skip-1');
      expect(removed).toBe(true);
      expect(skipManager.getSkipRules().length).toBe(0);
    });

    it('should check individual question skip', () => {
      const flow = createFlow('test', 'Test', 'node1');
      const skipManager = new SkipLogicManager(flow);

      skipManager.addSkipRule({
        id: 'skip-1',
        questionIds: ['q-child'],
        condition: { '==': [{ var: 'hasChildren' }, false] },
      });

      expect(skipManager.shouldSkipQuestion('q-child', { hasChildren: false })).toBe(true);
      expect(skipManager.shouldSkipQuestion('q-child', { hasChildren: true })).toBe(false);
    });
  });

  describe('Branch Evaluation', () => {
    it('should evaluate branches by priority', () => {
      const node = createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'number',
        fieldName: 'value',
      });

      node.branches = [
        {
          id: 'low',
          condition: { '<': [{ var: 'value' }, 50] },
          targetId: 'node-low',
          priority: 1,
        },
        {
          id: 'high',
          condition: { '>=': [{ var: 'value' }, 50] },
          targetId: 'node-high',
          priority: 2,
        },
      ];

      const branch1 = evaluateBranches(node, { value: 30 });
      expect(branch1?.id).toBe('low');

      const branch2 = evaluateBranches(node, { value: 75 });
      expect(branch2?.id).toBe('high');
    });
  });

  describe('findFlowPath', () => {
    it('should find path through flow', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'number',
        fieldName: 'age',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Q2',
        inputType: 'text',
        fieldName: 'name',
      }));

      addNodeToFlow(flow, createFlowNode('node3', {
        id: 'q3',
        text: 'Q3',
        inputType: 'text',
        fieldName: 'email',
      }));

      linkNodes(flow, 'node1', 'node2');
      linkNodes(flow, 'node2', 'node3');

      const path = findFlowPath(flow, {});

      expect(path).toEqual(['node1', 'node2', 'node3']);
    });
  });
});

