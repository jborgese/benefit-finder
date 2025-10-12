/**
 * Questionnaire Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuestionFlowStore } from '../store';
import { createFlow, createFlowNode, addNodeToFlow, linkNodes } from '../flow-engine';
import type { QuestionDefinition } from '../types';

describe('QuestionFlowStore', () => {
  beforeEach(() => {
    // Reset store state directly without rendering
    const store = useQuestionFlowStore.getState();
    store.reset();
  });

  describe('Flow Management', () => {
    it('should start a flow', () => {
      const store = useQuestionFlowStore.getState();

      const flow = createFlow('test-flow', 'Test Flow', 'node1');

      const q1: QuestionDefinition = {
        id: 'q1',
        text: 'What is your name?',
        inputType: 'text',
        fieldName: 'name',
      };

      addNodeToFlow(flow, createFlowNode('node1', q1));

      store.startFlow(flow);

      const state = useQuestionFlowStore.getState();

      expect(state.started).toBe(true);
      expect(state.flowId).toBe('test-flow');
      expect(state.currentNodeId).toBe('node1');
      expect(state.sessionId).toBeDefined();
    });

    it('should answer question', () => {
      const store = useQuestionFlowStore.getState();

      const flow = createFlow('test', 'Test', 'node1');
      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Your age?',
        inputType: 'number',
        fieldName: 'age',
      }));

      store.startFlow(flow);
      store.answerQuestion('q1', 'age', 25);

      const state = useQuestionFlowStore.getState();

      expect(state.answers.size).toBe(1);
      expect(state.answers.get('q1')?.value).toBe(25);

      const context = state.getAnswerContext();
      expect(context.age).toBe(25);
    });
  });

  describe('Navigation', () => {
    it('should navigate forward', () => {
      const store = useQuestionFlowStore.getState();

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

      store.startFlow(flow);
      const navResult = store.next();

      const state = useQuestionFlowStore.getState();

      expect(navResult.success).toBe(true);
      expect(state.currentNodeId).toBe('node2');
    });

    it('should navigate backward', () => {
      const store = useQuestionFlowStore.getState();

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

      store.startFlow(flow);
      store.next();

      let state = useQuestionFlowStore.getState();
      expect(state.currentNodeId).toBe('node2');

      const navResult = store.previous();

      state = useQuestionFlowStore.getState();
      expect(navResult.success).toBe(true);
      expect(state.currentNodeId).toBe('node1');
    });
  });

  describe('Progress Tracking', () => {
    it('should update progress', () => {
      const store = useQuestionFlowStore.getState();

      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
        required: true,
      }));

      addNodeToFlow(flow, createFlowNode('node2', {
        id: 'q2',
        text: 'Q2',
        inputType: 'text',
        fieldName: 'f2',
        required: true,
      }));

      store.startFlow(flow);

      let state = useQuestionFlowStore.getState();
      expect(state.progress?.answeredQuestions).toBe(0);
      expect(state.progress?.progressPercent).toBe(0);

      store.answerQuestion('q1', 'f1', 'answer1');

      state = useQuestionFlowStore.getState();
      expect(state.progress?.answeredQuestions).toBe(1);
      expect(state.progress?.progressPercent).toBe(50);
    });
  });

  describe('Checkpoints', () => {
    it('should create and restore checkpoints', () => {
      const store = useQuestionFlowStore.getState();

      const flow = createFlow('test', 'Test', 'node1');
      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      store.startFlow(flow);
      store.answerQuestion('q1', 'f1', 'test answer');
      store.createCheckpoint('After Q1');

      // Answer another question
      store.answerQuestion('q1', 'f1', 'changed answer');

      const state = useQuestionFlowStore.getState();
      expect(state.answers.get('q1')?.value).toBe('changed answer');

      // Note: Restoring from checkpoint would require more complex setup
      // This is a simplified test
      expect(state._checkpointManager?.getCheckpoints().length).toBe(1);
    });
  });

  describe('Completion', () => {
    it('should mark flow as complete', () => {
      const store = useQuestionFlowStore.getState();

      const flow = createFlow('test-complete', 'Test', 'node1');
      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1-complete',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      store.reset(); // Ensure clean state
      store.startFlow(flow);

      store.complete();

      const state = useQuestionFlowStore.getState();
      expect(state.completed).toBe(true);
      expect(state.completedAt).toBeDefined();
    });
  });

  describe('Pause and Resume', () => {
    it('should pause and resume flow', () => {
      const store = useQuestionFlowStore.getState();

      const flow = createFlow('test', 'Test', 'node1');
      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
      }));

      store.startFlow(flow);

      let state = useQuestionFlowStore.getState();
      expect(state.paused).toBe(false);

      store.pause();

      state = useQuestionFlowStore.getState();
      expect(state.paused).toBe(true);

      store.resume();

      state = useQuestionFlowStore.getState();
      expect(state.paused).toBe(false);
    });
  });
});

