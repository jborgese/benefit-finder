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

