/**
 * Keyboard Navigation Hook
 *
 * Standardized keyboard navigation for questionnaire input components
 * Provides arrow key navigation, Enter key handling, and focus management
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';

export interface KeyboardNavigationOptions {
  /** Total number of options */
  itemCount: number;
  /** Whether navigation is enabled */
  enabled?: boolean;
  /** Whether to wrap around at boundaries */
  wrap?: boolean;
  /** Callback when Enter is pressed on a focused item */
  onItemSelect?: (index: number) => void;
  /** Callback when Enter is pressed but no item is focused */
  onEnterKey?: () => void;
  /** Callback when selection changes */
  onSelectionChange?: (index: number) => void;
}

export interface KeyboardNavigationReturn {
  /** Currently focused item index */
  focusedIndex: number;
  /** Set focused index */
  setFocusedIndex: (index: number) => void;
  /** Handle keyboard events */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Get ref for an item */
  getItemRef: (index: number) => (el: HTMLElement | null) => void;
  /** Focus an item */
  focusItem: (index: number) => void;
  /** Reset focus */
  resetFocus: () => void;
}

export function useKeyboardNavigation({
  itemCount,
  enabled = true,
  wrap = true,
  onItemSelect,
  onEnterKey,
  onSelectionChange,
}: KeyboardNavigationOptions): KeyboardNavigationReturn {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount);
  }, [itemCount]);

  const focusItem = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      // eslint-disable-next-line security/detect-object-injection
      const element = itemRefs.current[index];
      if (element) {
        element.focus();
      }
    }
  }, [itemCount]);

  const resetFocus = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  const getItemRef = useCallback((index: number) => {
    return (el: HTMLElement | null) => {
      // eslint-disable-next-line security/detect-object-injection
      itemRefs.current[index] = el;
    };
  }, []);

  // Helper function to navigate to a specific index
  const navigateToIndex = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      setFocusedIndex(index);
      focusItem(index);
      onSelectionChange?.(index);
    }
  }, [itemCount, focusItem, onSelectionChange]);

  // Helper function to handle ArrowDown navigation
  const handleArrowDown = useCallback(() => {
    const nextIndex = focusedIndex + 1;
    if (nextIndex < itemCount) {
      navigateToIndex(nextIndex);
    } else if (wrap && itemCount > 0) {
      navigateToIndex(0);
    }
  }, [focusedIndex, itemCount, wrap, navigateToIndex]);

  // Helper function to handle ArrowUp navigation
  const handleArrowUp = useCallback(() => {
    const prevIndex = focusedIndex - 1;
    if (prevIndex >= 0) {
      navigateToIndex(prevIndex);
    } else if (wrap && itemCount > 0) {
      const lastIndex = itemCount - 1;
      navigateToIndex(lastIndex);
    }
  }, [focusedIndex, itemCount, wrap, navigateToIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled) {return;}

    const { key } = e;

    switch (key) {
      case 'Enter': {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < itemCount) {
          onItemSelect?.(focusedIndex);
        } else {
          onEnterKey?.();
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        handleArrowDown();
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        handleArrowUp();
        break;
      }

      case 'Home': {
        e.preventDefault();
        if (itemCount > 0) {
          navigateToIndex(0);
        }
        break;
      }

      case 'End': {
        e.preventDefault();
        if (itemCount > 0) {
          const lastIndex = itemCount - 1;
          navigateToIndex(lastIndex);
        }
        break;
      }
    }
  }, [enabled, focusedIndex, itemCount, onItemSelect, onEnterKey, handleArrowDown, handleArrowUp, navigateToIndex]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getItemRef,
    focusItem,
    resetFocus,
  };
}
