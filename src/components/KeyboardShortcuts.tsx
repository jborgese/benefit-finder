/**
 * Keyboard Shortcuts Component
 *
 * Displays available keyboard shortcuts and handles shortcut registration
 */

import React, { useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTextSize } from '../contexts/TextSizeContext';

interface KeyboardShortcutsProps {
  onStartQuestionnaire?: () => void;
  onToggleTour?: () => void;
  onTogglePrivacy?: () => void;
  onToggleGuide?: () => void;
  onGoHome?: () => void;
  onViewResults?: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onStartQuestionnaire,
  onToggleTour,
  onTogglePrivacy,
  onToggleGuide,
  onGoHome,
  onViewResults,
}) => {
  const { toggleTheme } = useTheme();
  const { increaseTextSize, decreaseTextSize, resetTextSize } = useTextSize();

  const shortcuts: Shortcut[] = [
    {
      key: 'Ctrl + Enter',
      description: 'Start questionnaire',
      action: () => onStartQuestionnaire?.(),
    },
    {
      key: 'Ctrl + T',
      description: 'Toggle theme',
      action: () => toggleTheme(),
    },
    {
      key: 'Ctrl + +',
      description: 'Increase text size',
      action: () => increaseTextSize(),
    },
    {
      key: 'Ctrl + -',
      description: 'Decrease text size',
      action: () => decreaseTextSize(),
    },
    {
      key: 'Ctrl + 0',
      description: 'Reset text size',
      action: () => resetTextSize(),
    },
    {
      key: 'Ctrl + H',
      description: 'Go to home',
      action: () => onGoHome?.(),
    },
    {
      key: 'Ctrl + R',
      description: 'View results',
      action: () => onViewResults?.(),
    },
    {
      key: 'F1',
      description: 'Show tour',
      action: () => onToggleTour?.(),
    },
    {
      key: 'F2',
      description: 'Show privacy info',
      action: () => onTogglePrivacy?.(),
    },
    {
      key: 'F3',
      description: 'Show quick guide',
      action: () => onToggleGuide?.(),
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }

    const { key, ctrlKey, metaKey, shiftKey } = event;
    const isCtrlOrCmd = ctrlKey || metaKey;

    // Handle different shortcut combinations
    if (isCtrlOrCmd && key === 'Enter') {
      event.preventDefault();
      onStartQuestionnaire?.();
    } else if (isCtrlOrCmd && key.toLowerCase() === 't') {
      event.preventDefault();
      toggleTheme();
    } else if (isCtrlOrCmd && key === '+') {
      event.preventDefault();
      increaseTextSize();
    } else if (isCtrlOrCmd && key === '-') {
      event.preventDefault();
      decreaseTextSize();
    } else if (isCtrlOrCmd && key === '0') {
      event.preventDefault();
      resetTextSize();
    } else if (isCtrlOrCmd && key.toLowerCase() === 'h') {
      event.preventDefault();
      onGoHome?.();
    } else if (isCtrlOrCmd && key.toLowerCase() === 'r') {
      event.preventDefault();
      onViewResults?.();
    } else if (key === 'F1') {
      event.preventDefault();
      onToggleTour?.();
    } else if (key === 'F2') {
      event.preventDefault();
      onTogglePrivacy?.();
    } else if (key === 'F3') {
      event.preventDefault();
      onToggleGuide?.();
    }
  }, [
    onStartQuestionnaire,
    toggleTheme,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    onGoHome,
    onViewResults,
    onToggleTour,
    onTogglePrivacy,
    onToggleGuide,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // This component doesn't render anything, it just handles shortcuts
};

export default KeyboardShortcuts;
