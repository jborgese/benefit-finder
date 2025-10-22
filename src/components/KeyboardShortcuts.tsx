/**
 * Keyboard Shortcuts Component
 *
 * Displays available keyboard shortcuts and handles shortcut registration
 */

import React, { useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/useTheme';
import { useTextSize } from '../contexts/useTextSize';

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

  // Shortcuts are defined but not used in this component
  // They're kept for potential future use in a help modal
  const _shortcuts: Shortcut[] = [
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

  // Helper function to check if user is typing in an input
  const isTypingInInput = (target: EventTarget | null): boolean => {
    if (!target) return false;
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target as HTMLElement).contentEditable === 'true'
    );
  };

  // Helper function to handle Ctrl/Cmd + key combinations
  const handleCtrlKeyCombination = useCallback((key: string, event: KeyboardEvent): boolean => {
    const { ctrlKey, metaKey } = event;
    const isCtrlOrCmd = ctrlKey || metaKey;

    if (!isCtrlOrCmd) return false;

    switch (key) {
      case 'Enter':
        event.preventDefault();
        onStartQuestionnaire?.();
        return true;
      case 't':
        event.preventDefault();
        toggleTheme();
        return true;
      case '+':
        event.preventDefault();
        increaseTextSize();
        return true;
      case '-':
        event.preventDefault();
        decreaseTextSize();
        return true;
      case '0':
        event.preventDefault();
        resetTextSize();
        return true;
      case 'h':
        event.preventDefault();
        onGoHome?.();
        return true;
      case 'r':
        event.preventDefault();
        onViewResults?.();
        return true;
      default:
        return false;
    }
  }, [onStartQuestionnaire, toggleTheme, increaseTextSize, decreaseTextSize, resetTextSize, onGoHome, onViewResults]);

  // Helper function to handle function key combinations
  const handleFunctionKey = useCallback((key: string, event: KeyboardEvent): boolean => {
    switch (key) {
      case 'F1':
        event.preventDefault();
        onToggleTour?.();
        return true;
      case 'F2':
        event.preventDefault();
        onTogglePrivacy?.();
        return true;
      case 'F3':
        event.preventDefault();
        onToggleGuide?.();
        return true;
      default:
        return false;
    }
  }, [onToggleTour, onTogglePrivacy, onToggleGuide]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (isTypingInInput(event.target)) {
      return;
    }

    const { key } = event;

    // Try Ctrl/Cmd combinations first
    if (handleCtrlKeyCombination(key.toLowerCase(), event)) {
      return;
    }

    // Try function keys
    handleFunctionKey(key, event);
  }, [handleCtrlKeyCombination, handleFunctionKey]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // This component doesn't render anything, it just handles shortcuts
};

export default KeyboardShortcuts;
