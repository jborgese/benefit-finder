/**
 * ARIA Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  buildAriaDescribedBy,
  ariaLabels,
  getFieldAriaProps,
  getNavigationAriaProps,
  getProgressAriaProps,
} from '../aria';

describe('ARIA Utilities', () => {
  describe('buildAriaDescribedBy', () => {
    it('should combine multiple IDs', () => {
      const result = buildAriaDescribedBy('id1', 'id2', 'id3');
      expect(result).toBe('id1 id2 id3');
    });

    it('should filter out undefined values', () => {
      const result = buildAriaDescribedBy('id1', undefined, 'id3');
      expect(result).toBe('id1 id3');
    });

    it('should return undefined for empty list', () => {
      const result = buildAriaDescribedBy();
      expect(result).toBeUndefined();
    });
  });

  describe('ariaLabels', () => {
    it('should generate question label', () => {
      const label = ariaLabels.question(2, 10, 'What is your age?');
      expect(label).toContain('Question 2 of 10');
      expect(label).toContain('What is your age?');
    });

    it('should generate progress label', () => {
      const label = ariaLabels.progress(5, 10);
      expect(label).toContain('5 of 10');
      expect(label).toContain('completed');
    });

    it('should generate button labels', () => {
      expect(ariaLabels.button.next(false)).toContain('Next');
      expect(ariaLabels.button.next(true)).toContain('Submit');
      expect(ariaLabels.button.previous()).toContain('Previous');
    });
  });

  describe('getFieldAriaProps', () => {
    it('should return basic ARIA props', () => {
      const props = getFieldAriaProps({
        labelId: 'label-1',
        hasError: false,
        isRequired: true,
      });

      expect(props['aria-labelledby']).toBe('label-1');
      expect(props['aria-required']).toBe(true);
    });

    it('should include error ID when has error', () => {
      const props = getFieldAriaProps({
        labelId: 'label-1',
        errorId: 'error-1',
        hasError: true,
      });

      expect(props['aria-describedby']).toContain('error-1');
      expect(props['aria-invalid']).toBe(true);
    });
  });

  describe('getNavigationAriaProps', () => {
    it('should generate next button label', () => {
      const props = getNavigationAriaProps({
        direction: 'next',
        currentQuestion: 2,
        totalQuestions: 10,
      });

      expect(props['aria-label']).toContain('Next');
    });

    it('should generate submit label for last question', () => {
      const props = getNavigationAriaProps({
        direction: 'next',
        isLastQuestion: true,
      });

      expect(props['aria-label']).toContain('Submit');
    });
  });

  describe('getProgressAriaProps', () => {
    it('should return progress ARIA attributes', () => {
      const props = getProgressAriaProps(5, 10, 50);

      expect(props.role).toBe('progressbar');
      expect(props['aria-valuemin']).toBe(0);
      expect(props['aria-valuemax']).toBe(10);
      expect(props['aria-valuenow']).toBe(5);
      expect(props['aria-valuetext']).toContain('50%');
    });
  });
});

