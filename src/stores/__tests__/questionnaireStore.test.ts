/**
 * Questionnaire Store Tests
 * 
 * Example test suite for the questionnaireStore.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuestionnaireStore } from '../questionnaireStore';

describe('questionnaireStore', () => {
  beforeEach(() => {
    useQuestionnaireStore.getState().resetQuestionnaire();
  });
  
  describe('Session Management', () => {
    it('should start a questionnaire session', () => {
      const { startQuestionnaire } = useQuestionnaireStore.getState();
      
      startQuestionnaire('session-123');
      
      const { sessionId, isActive, startedAt } = useQuestionnaireStore.getState();
      expect(sessionId).toBe('session-123');
      expect(isActive).toBe(true);
      expect(startedAt).toBeGreaterThan(0);
    });
    
    it('should end a questionnaire session', () => {
      const { startQuestionnaire, endQuestionnaire } = useQuestionnaireStore.getState();
      
      startQuestionnaire('session-123');
      endQuestionnaire();
      
      const { isActive } = useQuestionnaireStore.getState();
      expect(isActive).toBe(false);
    });
    
    it('should pause and resume questionnaire', () => {
      const { startQuestionnaire, pauseQuestionnaire, resumeQuestionnaire } = 
        useQuestionnaireStore.getState();
      
      startQuestionnaire('session-123');
      
      pauseQuestionnaire();
      expect(useQuestionnaireStore.getState().isActive).toBe(false);
      
      resumeQuestionnaire();
      expect(useQuestionnaireStore.getState().isActive).toBe(true);
    });
  });
  
  describe('Answer Management', () => {
    it('should set an answer', () => {
      const { setAnswer } = useQuestionnaireStore.getState();
      
      setAnswer('q1', 'answer-value');
      
      const { answers } = useQuestionnaireStore.getState();
      expect(answers.q1).toBeDefined();
      expect(answers.q1.value).toBe('answer-value');
      expect(answers.q1.questionId).toBe('q1');
    });
    
    it('should update an existing answer', () => {
      const { setAnswer, updateAnswer } = useQuestionnaireStore.getState();
      
      setAnswer('q1', 'old-value');
      updateAnswer('q1', 'new-value');
      
      const { answers } = useQuestionnaireStore.getState();
      expect(answers.q1.value).toBe('new-value');
    });
    
    it('should clear an answer', () => {
      const { setAnswer, clearAnswer } = useQuestionnaireStore.getState();
      
      setAnswer('q1', 'answer-value');
      clearAnswer('q1');
      
      const { answers } = useQuestionnaireStore.getState();
      expect(answers.q1).toBeUndefined();
    });
    
    it('should clear all answers', () => {
      const { setAnswer, clearAllAnswers } = useQuestionnaireStore.getState();
      
      setAnswer('q1', 'answer1');
      setAnswer('q2', 'answer2');
      setAnswer('q3', 'answer3');
      
      clearAllAnswers();
      
      const { answers } = useQuestionnaireStore.getState();
      expect(Object.keys(answers)).toHaveLength(0);
    });
  });
  
  describe('Navigation', () => {
    it('should set current question', () => {
      const { setCurrentQuestion } = useQuestionnaireStore.getState();
      
      setCurrentQuestion('q1');
      
      const { currentQuestionId, visitedQuestionIds } = useQuestionnaireStore.getState();
      expect(currentQuestionId).toBe('q1');
      expect(visitedQuestionIds).toContain('q1');
    });
    
    it('should navigate to next question', () => {
      const { setCurrentQuestion, goToNextQuestion } = useQuestionnaireStore.getState();
      
      setCurrentQuestion('q1');
      goToNextQuestion('q2');
      
      const { currentQuestionId, questionHistory } = useQuestionnaireStore.getState();
      expect(currentQuestionId).toBe('q2');
      expect(questionHistory).toContain('q1');
    });
    
    it('should navigate back to previous question', () => {
      const { setCurrentQuestion, goToNextQuestion, goToPreviousQuestion } = 
        useQuestionnaireStore.getState();
      
      setCurrentQuestion('q1');
      goToNextQuestion('q2');
      goToPreviousQuestion();
      
      const { currentQuestionId } = useQuestionnaireStore.getState();
      expect(currentQuestionId).toBe('q1');
    });
  });
  
  describe('Progress Tracking', () => {
    it('should track answered questions', () => {
      const { setAnswer, updateProgress } = useQuestionnaireStore.getState();
      
      updateProgress({ totalQuestions: 5 });
      
      setAnswer('q1', 'answer1');
      setAnswer('q2', 'answer2');
      
      const { progress } = useQuestionnaireStore.getState();
      expect(progress.answeredQuestions).toHaveLength(2);
      expect(progress.percentComplete).toBe(40); // 2/5 = 40%
    });
    
    it('should track skipped questions', () => {
      const { skipQuestion } = useQuestionnaireStore.getState();
      
      skipQuestion('q3');
      
      const { progress } = useQuestionnaireStore.getState();
      expect(progress.skippedQuestions).toContain('q3');
    });
  });
  
  describe('Validation', () => {
    it('should set validation error', () => {
      const { setValidationError } = useQuestionnaireStore.getState();
      
      setValidationError('q1', 'This field is required');
      
      const { validationErrors } = useQuestionnaireStore.getState();
      expect(validationErrors.q1).toBe('This field is required');
    });
    
    it('should clear validation error', () => {
      const { setValidationError, clearValidationError } = useQuestionnaireStore.getState();
      
      setValidationError('q1', 'Error message');
      clearValidationError('q1');
      
      const { validationErrors } = useQuestionnaireStore.getState();
      expect(validationErrors.q1).toBeUndefined();
    });
  });
  
  describe('Bulk Operations', () => {
    it('should load saved answers', () => {
      const savedAnswers = {
        q1: { questionId: 'q1', value: 'answer1', timestamp: Date.now() },
        q2: { questionId: 'q2', value: 'answer2', timestamp: Date.now() },
      };
      
      const { loadSavedAnswers } = useQuestionnaireStore.getState();
      loadSavedAnswers(savedAnswers);
      
      const { answers } = useQuestionnaireStore.getState();
      expect(answers).toEqual(savedAnswers);
    });
    
    it('should export answers', () => {
      const { setAnswer, exportAnswers } = useQuestionnaireStore.getState();
      
      setAnswer('q1', 'answer1');
      setAnswer('q2', 'answer2');
      
      const exported = exportAnswers();
      expect(Object.keys(exported)).toHaveLength(2);
      expect(exported.q1.value).toBe('answer1');
    });
  });
});

