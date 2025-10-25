/**
 * Keyboard Navigation Utilities
 *
 * Keyboard shortcuts and navigation helpers for questionnaires
 */

import { useEffect, useCallback } from 'react';
import type React from 'react';

/**
 * Key codes for common keyboard actions
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if user is focused on an input field
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      for (const shortcut of shortcuts) {
        const keyMatches = event.key === shortcut.key;
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        // For arrow keys, only trigger if NOT focused on an input field
        const isArrowKey = shortcut.key === Keys.ARROW_LEFT || shortcut.key === Keys.ARROW_RIGHT ||
                          shortcut.key === Keys.ARROW_UP || shortcut.key === Keys.ARROW_DOWN;
        const shouldSkip = isArrowKey && isInputFocused;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches && !shouldSkip) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Default questionnaire keyboard shortcuts
 */
export function useQuestionnaireKeyboard(handlers: {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onHelp?: () => void;
  onSkip?: () => void;
}): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: Keys.ARROW_RIGHT,
      description: 'Go to next question',
      action: () => handlers.onNext?.(),
    },
    {
      key: Keys.ARROW_LEFT,
      description: 'Go to previous question',
      action: () => handlers.onPrevious?.(),
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Save progress',
      action: () => handlers.onSave?.(),
    },
    {
      key: '/',
      ctrlKey: true,
      description: 'Show keyboard shortcuts',
      action: () => handlers.onHelp?.(),
    },
    {
      key: 'n',
      ctrlKey: true,
      shiftKey: true,
      description: 'Skip question (if allowed)',
      action: () => handlers.onSkip?.(),
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

/**
 * Hook for arrow key navigation within a list
 */
export function useArrowNavigation(
  itemCount: number,
  options: {
    currentIndex: number;
    onIndexChange: (index: number) => void;
    loop?: boolean;
    horizontal?: boolean;
    enabled?: boolean;
  }
): void {
  const { currentIndex, onIndexChange, loop = true, horizontal = false, enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const nextKey = horizontal ? Keys.ARROW_RIGHT : Keys.ARROW_DOWN;
      const prevKey = horizontal ? Keys.ARROW_LEFT : Keys.ARROW_UP;

      if (event.key === nextKey) {
        event.preventDefault();
        const newIndex = currentIndex + 1;
        if (newIndex < itemCount) {
          onIndexChange(newIndex);
        } else if (loop) {
          onIndexChange(0);
        }
      } else if (event.key === prevKey) {
        event.preventDefault();
        const newIndex = currentIndex - 1;
        if (newIndex >= 0) {
          onIndexChange(newIndex);
        } else if (loop) {
          onIndexChange(itemCount - 1);
        }
      } else if (event.key === Keys.HOME) {
        event.preventDefault();
        onIndexChange(0);
      } else if (event.key === Keys.END) {
        event.preventDefault();
        onIndexChange(itemCount - 1);
      }
    },
    [currentIndex, itemCount, onIndexChange, loop, horizontal, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Trap focus within a container
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const getFocusableElements = (): HTMLElement[] => {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];

      return Array.from(
        container.querySelectorAll<HTMLElement>(selectors.join(','))
      );
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== Keys.TAB) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        // Tab
        event.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, enabled]);
}

/**
 * Roving tabindex for keyboard navigation in lists
 */
export function useRovingTabIndex(_items: number, activeIndex: number): { getTabIndex: (index: number) => number } {
  const getTabIndex = (index: number): number => {
    return index === activeIndex ? 0 : -1;
  };

  return { getTabIndex };
}

