/**
 * ARIA Utilities
 *
 * Helper functions and hooks for ARIA attributes
 */

import { useId, type MouseEvent } from 'react';

/**
 * Generate unique IDs for ARIA relationships
 */
export function useAriaIds(prefix = 'aria'): {
  labelId: string;
  descriptionId: string;
  errorId: string;
  helpId: string;
} {
  const baseId = useId();

  return {
    labelId: `${prefix}-label-${baseId}`,
    descriptionId: `${prefix}-desc-${baseId}`,
    errorId: `${prefix}-error-${baseId}`,
    helpId: `${prefix}-help-${baseId}`,
  };
}

/**
 * Build aria-describedby string from multiple IDs
 */
export function buildAriaDescribedBy(...ids: (string | undefined | false)[]): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined;
}

/**
 * ARIA live region announcer
 */
export class AriaAnnouncer {
  private static instance: AriaAnnouncer | undefined;
  private politeRegion: HTMLDivElement | null = null;
  private assertiveRegion: HTMLDivElement | null = null;

  private constructor() {
    this.createRegions();
  }

  static getInstance(): AriaAnnouncer {
    if (!AriaAnnouncer.instance) {
      AriaAnnouncer.instance = new AriaAnnouncer();
    }
    return AriaAnnouncer.instance;
  }

  private createRegions(): void {
    // Create polite region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    document.body.appendChild(this.politeRegion);

    // Create assertive region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite', clearAfter = 1000): void {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

    if (!region) return;

    // Clear and set new message
    region.textContent = '';

    // Small delay to ensure screen readers detect the change
    setTimeout(() => {
      region.textContent = message;

      // Clear after delay
      if (clearAfter > 0) {
        setTimeout(() => {
          region.textContent = '';
        }, clearAfter);
      }
    }, 100);
  }

  clear(): void {
    if (this.politeRegion) this.politeRegion.textContent = '';
    if (this.assertiveRegion) this.assertiveRegion.textContent = '';
  }
}

/**
 * Hook for screen reader announcements
 */
export function useAnnouncer(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clear: () => void;
} {
  const announcer = AriaAnnouncer.getInstance();

  return {
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announcer.announce(message, priority);
    },
    clear: () => {
      announcer.clear();
    },
  };
}

/**
 * ARIA label generators for common patterns
 */
export const ariaLabels = {
  question: (questionNumber: number, totalQuestions: number, text: string) =>
    `Question ${questionNumber} of ${totalQuestions}: ${text}`,

  progress: (current: number, total: number) =>
    `Progress: ${current} of ${total} questions completed`,

  required: (fieldName: string) =>
    `${fieldName}, required field`,

  error: (fieldName: string, error: string) =>
    `Error in ${fieldName}: ${error}`,

  button: {
    next: (isLast: boolean) => isLast ? 'Submit questionnaire' : 'Next question',
    previous: () => 'Previous question',
    save: () => 'Save progress',
    skip: () => 'Skip this question',
    help: () => 'Show help',
  },
};

/**
 * Get ARIA props for form field
 */
export function getFieldAriaProps(options: {
  labelId?: string;
  descriptionId?: string;
  errorId?: string;
  helpId?: string;
  hasError?: boolean;
  isRequired?: boolean;
}): {
  'aria-labelledby': string | undefined;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
} {
  const { labelId, descriptionId, errorId, helpId, hasError, isRequired } = options;

  const describedByIds = [];
  if (descriptionId) describedByIds.push(descriptionId);
  if (helpId) describedByIds.push(helpId);
  if (hasError && errorId) describedByIds.push(errorId);

  return {
    'aria-labelledby': labelId,
    'aria-describedby': describedByIds.length > 0 ? describedByIds.join(' ') : undefined,
    'aria-invalid': hasError ? true : undefined,
    'aria-required': isRequired ? true : undefined,
  };
}

/**
 * ARIA props for navigation buttons
 */
export function getNavigationAriaProps(options: {
  direction: 'next' | 'previous';
  isLastQuestion?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}): {
  'aria-label': string;
} {
  const { direction, isLastQuestion, currentQuestion, totalQuestions } = options;

  if (direction === 'next') {
    return {
      'aria-label': isLastQuestion
        ? 'Submit questionnaire'
        : `Next question${currentQuestion && totalQuestions ? ` (${currentQuestion + 1} of ${totalQuestions})` : ''}`,
    };
  }

  return {
    'aria-label': `Previous question${currentQuestion && totalQuestions && currentQuestion > 1 ? ` (back to ${currentQuestion - 1} of ${totalQuestions})` : ''}`,
  };
}

/**
 * ARIA props for progress indicator
 */
export function getProgressAriaProps(current: number, total: number, percent: number): {
  role: 'progressbar';
  'aria-valuemin': number;
  'aria-valuemax': number;
  'aria-valuenow': number;
  'aria-valuetext': string;
} {
  return {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': total,
    'aria-valuenow': current,
    'aria-valuetext': `${current} of ${total} questions completed, ${percent}% complete`,
  };
}

/**
 * Get landmark roles for questionnaire sections
 */
export const landmarkRoles = {
  questionnaire: 'main',
  navigation: 'navigation',
  progress: 'region',
  help: 'complementary',
  error: 'alert',
  status: 'status',
} as const;

/**
 * Create skip link
 */
export function createSkipLink(targetId: string, label: string): {
  href: string;
  className: string;
  onClick: (e: MouseEvent) => void;
  children: string;
} {
  return {
    href: `#${targetId}`,
    className: 'skip-link',
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    children: label,
  };
}

