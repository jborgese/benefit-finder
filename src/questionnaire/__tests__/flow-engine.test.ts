/**
 * Flow Engine Tests
 */

import { describe, it, expect } from 'vitest';
import {
  FlowEngine,
  createFlow,
  createFlowNode,
  addNodeToFlow,
  linkNodes,
  addBranch,
} from '../flow-engine';
import type { QuestionDefinition, FlowBranch } from '../types';

describe('FlowEngine', () => {
  describe('Flow Creation', () => {
    it('should create a new flow', () => {
      const flow = createFlow('test-flow', 'Test Flow', 'start');

      expect(flow.id).toBe('test-flow');
      expect(flow.name).toBe('Test Flow');
      expect(flow.startNodeId).toBe('start');
      expect(flow.nodes.size).toBe(0);
    });

    it('should create a flow node', () => {
      const question: QuestionDefinition = {
        id: 'q1',
        text: 'What is your age?',
        inputType: 'number',
        fieldName: 'age',
      };

      const node = createFlowNode('node1', question);

      expect(node.id).toBe('node1');
      expect(node.question).toEqual(question);
    });

    it('should add node to flow', () => {
      const flow = createFlow('test', 'Test', 'start');
      const question: QuestionDefinition = {
        id: 'q1',
        text: 'Test?',
        inputType: 'text',
        fieldName: 'test',
      };
      const node = createFlowNode('node1', question);

      addNodeToFlow(flow, node);

      expect(flow.nodes.size).toBe(1);
      expect(flow.nodes.get('node1')).toEqual(node);
    });

    it('should link two nodes', () => {
      const flow = createFlow('test', 'Test', 'node1');

      const q1: QuestionDefinition = {
        id: 'q1',
        text: 'Question 1',
        inputType: 'text',
        fieldName: 'field1',
      };

      const q2: QuestionDefinition = {
        id: 'q2',
        text: 'Question 2',
        inputType: 'text',
        fieldName: 'field2',
      };

      addNodeToFlow(flow, createFlowNode('node1', q1));
      addNodeToFlow(flow, createFlowNode('node2', q2));

      linkNodes(flow, 'node1', 'node2');

      const node1 = flow.nodes.get('node1');
      const node2 = flow.nodes.get('node2');

      expect(node1?.nextId).toBe('node2');
      expect(node2?.previousId).toBe('node1');
    });
  });

  describe('FlowEngine Navigation', () => {
    it('should get start node', () => {
      const flow = createFlow('test', 'Test', 'start');
      const question: QuestionDefinition = {
        id: 'q1',
        text: 'Start question',
        inputType: 'text',
        fieldName: 'start',
      };

      addNodeToFlow(flow, createFlowNode('start', question));

      const engine = new FlowEngine(flow);
      const startNode = engine.getStartNode();

      expect(startNode).toBeDefined();
      expect(startNode?.id).toBe('start');
    });

    it('should find next node', () => {
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

      const engine = new FlowEngine(flow);
      const result = engine.findNextNode('node1');

      expect(result.success).toBe(true);
      expect(result.targetNodeId).toBe('node2');
    });

    it('should evaluate conditional branches', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Are you over 18?',
        inputType: 'boolean',
        fieldName: 'over18',
      }));

      addNodeToFlow(flow, createFlowNode('node-adult', {
        id: 'q-adult',
        text: 'Adult question',
        inputType: 'text',
        fieldName: 'adultField',
      }));

      addNodeToFlow(flow, createFlowNode('node-minor', {
        id: 'q-minor',
        text: 'Minor question',
        inputType: 'text',
        fieldName: 'minorField',
      }));

      // Add branch
      const branch: FlowBranch = {
        id: 'adult-branch',
        condition: { '==': [{ var: 'over18' }, true] },
        targetId: 'node-adult',
        priority: 1,
      };

      addBranch(flow, 'node1', branch);
      flow.nodes.get('node1')!.nextId = 'node-minor'; // Default path

      const engine = new FlowEngine(flow);

      // Test with over18 = true
      engine.updateContext('over18', true);
      const result1 = engine.findNextNode('node1');

      expect(result1.success).toBe(true);
      expect(result1.targetNodeId).toBe('node-adult');
      expect(result1.branchTaken).toBe(true);

      // Test with over18 = false
      engine.updateContext('over18', false);
      const result2 = engine.findNextNode('node1');

      expect(result2.success).toBe(true);
      expect(result2.targetNodeId).toBe('node-minor');
      expect(result2.branchTaken).toBe(false);
    });
  });

  describe('Conditional Logic', () => {
    it('should evaluate show conditions', () => {
      const flow = createFlow('test', 'Test', 'node1');

      const question: QuestionDefinition = {
        id: 'q1',
        text: 'Do you have children?',
        inputType: 'boolean',
        fieldName: 'hasChildren',
        showIf: { '==': [{ var: 'over18' }, true] },
      };

      addNodeToFlow(flow, createFlowNode('node1', question));

      const engine = new FlowEngine(flow);

      // Should not show if over18 is false
      engine.updateContext('over18', false);
      expect(engine.shouldShowQuestion(question)).toBe(false);

      // Should show if over18 is true
      engine.updateContext('over18', true);
      expect(engine.shouldShowQuestion(question)).toBe(true);
    });

    it('should get visible questions', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Q2 - only if over 18',
        inputType: 'text',
        fieldName: 'f2',
        showIf: { '>': [{ var: 'age' }, 18] },
      }));

      const engine = new FlowEngine(flow);

      // With age < 18
      engine.updateContext('age', 15);
      let visible = engine.getVisibleQuestions();
      expect(visible.length).toBe(1);
      expect(visible[0].id).toBe('q1');

      // With age > 18
      engine.updateContext('age', 25);
      visible = engine.getVisibleQuestions();
      expect(visible.length).toBe(2);
    });
  });

  describe('Flow Validation', () => {
    it('should validate a valid flow', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      const engine = new FlowEngine(flow);
      const validation = engine.validateFlow();

      expect(validation.valid).toBe(true);
      expect(validation.errors.filter((e) => e.severity === 'error').length).toBe(0);
    });

    it('should detect missing start node', () => {
      const flow = createFlow('test', 'Test', 'nonexistent');

      const engine = new FlowEngine(flow);
      const validation = engine.validateFlow();

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.message.includes('Start node'))).toBe(true);
    });

    it('should detect orphaned nodes', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Q2 - orphaned',
        inputType: 'text',
        fieldName: 'f2',
      }));

      // node2 is not linked, so it's orphaned

      const engine = new FlowEngine(flow);
      const validation = engine.validateFlow();

      expect(validation.orphanedNodes).toContain('node2');
    });
  });
});

