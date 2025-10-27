/**
 * Progress Tracking Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateProgress,
  estimateTimeRemaining,
  calculateCompletionPercentage,
  CheckpointManager,
  TimeTracker,
  isFlowComplete,
} from '../progress';
import { createFlow, createFlowNode, addNodeToFlow, linkNodes } from '../flow-engine';
import type { QuestionState, QuestionAnswer } from '../types';

describe('Progress Tracking', () => {
  describe('calculateProgress', () => {
    it('should calculate progress metrics', () => {
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

      addNodeToFlow(flow, createFlowNode('node3', {
        id: 'q3',
        text: 'Q3',
        inputType: 'text',
        fieldName: 'f3',
        required: false,
      }));

      // Link nodes in sequence
      linkNodes(flow, 'node1', 'node2');
      linkNodes(flow, 'node2', 'node3');

      const questionStates = new Map<string, QuestionState>([
        ['q1', { questionId: 'q1', status: 'answered', visible: true, visited: true, visitCount: 1 }],
        ['q2', { questionId: 'q2', status: 'current', visible: true, visited: true, visitCount: 1 }],
        ['q3', { questionId: 'q3', status: 'pending', visible: true, visited: false, visitCount: 0 }],
      ]);

      const progress = calculateProgress(flow, questionStates, {}, 'node2');

      expect(progress.totalQuestions).toBe(3);
      expect(progress.requiredQuestions).toBe(2);
      expect(progress.answeredQuestions).toBe(1);
      expect(progress.remainingQuestions).toBe(2);
      expect(progress.progressPercent).toBeGreaterThan(0);
      expect(progress.currentQuestionPosition).toBe(2); // q2 is the second question
    });
  });

  describe('estimateTimeRemaining', () => {
    it('should estimate time remaining', () => {
      const progress = {
        totalQuestions: 10,
        requiredQuestions: 5,
        answeredQuestions: 3,
        skippedQuestions: 0,
        remainingQuestions: 7,
        currentQuestionPosition: 3,
        progressPercent: 30,
        requiredProgressPercent: 60,
      };

      const estimate = estimateTimeRemaining(progress, 30);

      expect(estimate).toBe(210); // 7 questions * 30 seconds
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('should calculate percentage', () => {
      expect(calculateCompletionPercentage(5, 10)).toBe(50);
      expect(calculateCompletionPercentage(10, 10)).toBe(100);
      expect(calculateCompletionPercentage(0, 10)).toBe(0);
    });

    it('should handle zero total questions', () => {
      expect(calculateCompletionPercentage(0, 0)).toBe(100);
    });
  });

  describe('CheckpointManager', () => {
    let manager: CheckpointManager;

    beforeEach(() => {
      manager = new CheckpointManager();
    });

    it('should create checkpoint', () => {
      const answers = new Map<string, QuestionAnswer>([
        ['q1', {
          questionId: 'q1',
          fieldName: 'age',
          value: 25,
          answeredAt: Date.now(),
        }],
      ]);

      const checkpoint = manager.createCheckpoint(
        'node1',
        'Section 1 Complete',
        answers
      );

      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.name).toBe('Section 1 Complete');
      expect(checkpoint.answersSnapshot).toHaveProperty('age', 25);
    });

    it('should retrieve checkpoint', () => {
      const answers = new Map();
      const checkpoint = manager.createCheckpoint('node1', 'Test', answers);

      const retrieved = manager.getCheckpoint(checkpoint.id);

      expect(retrieved).toEqual(checkpoint);
    });

    it('should get latest checkpoint', () => {
      const answers = new Map();

      manager.createCheckpoint('node1', 'First', answers);
      manager.createCheckpoint('node2', 'Second', answers);

      const latest = manager.getLatestCheckpoint();

      expect(latest?.name).toBe('Second');
    });

    it('should restore from checkpoint', () => {
      const answers = new Map<string, QuestionAnswer>([
        ['q1', {
          questionId: 'q1',
          fieldName: 'age',
          value: 30,
          answeredAt: Date.now(),
        }],
      ]);

      const checkpoint = manager.createCheckpoint('node1', 'Test', answers);
      const restored = manager.restoreCheckpoint(checkpoint.id);

      expect(restored).toHaveProperty('age', 30);
    });

    it('should clear checkpoints', () => {
      const answers = new Map();
      manager.createCheckpoint('node1', 'Test', answers);

      expect(manager.getCheckpoints().length).toBe(1);

      manager.clearCheckpoints();

      expect(manager.getCheckpoints().length).toBe(0);
    });
  });

  describe('TimeTracker', () => {
    let tracker: TimeTracker;

    beforeEach(() => {
      tracker = new TimeTracker();
    });

    it('should track elapsed time', () => {
      tracker.start();

      // Small delay
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Wait
      }

      const elapsed = tracker.getElapsedTime();

      expect(elapsed).toBeGreaterThan(0);
    });

    it('should pause and resume', () => {
      tracker.start();
      tracker.pause();

      const pausedTime = tracker.getElapsedTime();

      // Wait a bit
      const startWait = Date.now();
      while (Date.now() - startWait < 10) {
        // Wait
      }

      const afterWait = tracker.getElapsedTime();

      // Time should not have advanced during pause
      expect(afterWait).toBe(pausedTime);

      tracker.resume();

      // Wait again
      const startWait2 = Date.now();
      while (Date.now() - startWait2 < 10) {
        // Wait
      }

      const afterResume = tracker.getElapsedTime();

      // Time should advance after resume
      expect(afterResume).toBeGreaterThan(pausedTime);
    });

    it('should record question times', () => {
      tracker.recordQuestionTime('q1', 1500);
      tracker.recordQuestionTime('q2', 2000);
      tracker.recordQuestionTime('q1', 500); // Add more to q1

      expect(tracker.getQuestionTime('q1')).toBe(2000);
      expect(tracker.getQuestionTime('q2')).toBe(2000);
      expect(tracker.getAverageQuestionTime()).toBe(2000);
    });

    it('should reset tracker', () => {
      tracker.start();
      tracker.recordQuestionTime('q1', 1000);

      tracker.reset();

      // After reset, no times should be recorded
      expect(tracker.getQuestionTime('q1')).toBe(0);
      expect(tracker.getAllQuestionTimes().size).toBe(0);
    });
  });

  describe('isFlowComplete', () => {
    it('should detect incomplete flow', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
        required: true,
      }));

      const questionStates = new Map<string, QuestionState>([
        ['q1', { questionId: 'q1', status: 'current', visible: true, visited: true, visitCount: 1 }],
      ]);

      const complete = isFlowComplete(flow, questionStates);

      expect(complete).toBe(false);
    });

    it('should detect complete flow', () => {
      const flow = createFlow('test', 'Test', 'node1');

      addNodeToFlow(flow, createFlowNode('node1', {
        id: 'q1',
        text: 'Q1',
        inputType: 'text',
        fieldName: 'f1',
        required: true,
      }));

      const questionStates = new Map<string, QuestionState>([
        ['q1', { questionId: 'q1', status: 'answered', visible: true, visited: true, visitCount: 1 }],
      ]);

      const complete = isFlowComplete(flow, questionStates);

      expect(complete).toBe(true);
    });
  });
});

