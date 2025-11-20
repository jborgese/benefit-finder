/**
 * Focus Management Utilities
 *
 * Focus management for accessible navigation and interactions
 */

import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to auto-focus an element on mount
 */
export function useAutoFocus<T extends HTMLElement>(enabled = true): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (enabled && ref.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        ref.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return ref;
}

/**
 * Hook to restore focus when unmounting
 */
export function useRestoreFocus<T extends HTMLElement>(): React.RefObject<T> {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const currentRef = useRef<T>(null);

  useEffect(() => {
    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus new element
    if (currentRef.current) {
      currentRef.current.focus();
    }

    // Restore on unmount
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  return currentRef;
}

/**
 * Focus visible management (keyboard vs mouse)
 */
export function useFocusVisible(): boolean {
  const [focusVisible, setFocusVisible] = React.useState(false);

  useEffect(() => {
    let hadKeyboardEvent = false;

    const handleKeyDown = (): void => {
      hadKeyboardEvent = true;
    };

    const handleMouseDown = (): void => {
      hadKeyboardEvent = false;
    };

    const handleFocus = (): void => {
      if (hadKeyboardEvent) {
        setFocusVisible(true);
      }
    };

    const handleBlur = (): void => {
      setFocusVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  return focusVisible;
}

/**
 * Focus management for modal/dialog
 */
export function useModalFocus<T extends HTMLElement>(): React.RefObject<T> {
  const modalRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length > 0) {
        focusable[0]?.focus();
      }
    }

    // Restore on unmount
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  return modalRef;
}

/**
 * Focus first error field
 */
export function useFocusError(errors: Record<string, unknown>): void {
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) {return;}

    // Find first error field
    const firstErrorField = document.querySelector<HTMLElement>(
      `[name="${errorKeys[0]}"], [id="${errorKeys[0]}"], [data-field="${errorKeys[0]}"]`
    );

    if (firstErrorField) {
      firstErrorField.focus();
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors]);
}

/**
 * Scroll element into view and focus
 */
export function scrollIntoViewAndFocus(element: HTMLElement | null, options?: ScrollIntoViewOptions): void {
  if (!element) {return;}

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    ...options,
  });

  // Focus after scroll completes
  setTimeout(() => {
    element.focus();
  }, 300);
}

/**
 * Get next focusable element
 */
export function getNextFocusable(current: HTMLElement, reverse = false): HTMLElement | null {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  const focusableElements = Array.from(
    document.querySelectorAll<HTMLElement>(focusableSelector)
  );

  const currentIndex = focusableElements.indexOf(current);
  if (currentIndex === -1) {return null;}

  if (reverse) {
    return focusableElements[currentIndex - 1] ?? null;
  } else {
    return focusableElements[currentIndex + 1] ?? null;
  }
}

/**
 * Focus manager for questionnaire flow
 */
export class FocusManager {
  private history: HTMLElement[] = [];

  push(element: HTMLElement): void {
    this.history.push(element);
  }

  pop(): HTMLElement | undefined {
    return this.history.pop();
  }

  restore(): void {
    const element = this.pop();
    if (element) {
      element.focus();
    }
  }

  clear(): void {
    this.history = [];
  }
}

/**
 * Hook for focus history management
 */
export function useFocusHistory(): {
  pushFocus: (element: HTMLElement) => void;
  popFocus: () => HTMLElement | undefined;
  restoreFocus: () => void;
  clearFocus: () => void;
} {
  const managerRef = useRef(new FocusManager());

  const pushFocus = useCallback((element: HTMLElement) => {
    managerRef.current.push(element);
  }, []);

  const popFocus = useCallback(() => {
    return managerRef.current.pop();
  }, []);

  const restoreFocus = useCallback(() => {
    managerRef.current.restore();
  }, []);

  const clearFocus = useCallback(() => {
    managerRef.current.clear();
  }, []);

  return {
    pushFocus,
    popFocus,
    restoreFocus,
    clearFocus,
  };
}

// (React imported at top)

