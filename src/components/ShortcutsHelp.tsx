/**
 * Shortcuts Help Modal
 *
 * Displays available keyboard shortcuts in a modal
 */

import React from 'react';
import { Button } from './Button';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  isOpen,
  onClose,
}) => {

  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Navigation',
      shortcuts: [
        { key: 'Ctrl + Enter', description: 'Start questionnaire' },
        { key: 'Ctrl + Shift + H', description: 'Go to home' },
        { key: 'Ctrl + Shift + R', description: 'View results' },
      ],
    },
    {
      category: 'Questionnaire',
      shortcuts: [
        { key: '→', description: 'Next question' },
        { key: '←', description: 'Previous question' },
        { key: 'Ctrl + S', description: 'Save progress' },
        { key: 'Ctrl + /', description: 'Show keyboard shortcuts' },
        { key: 'Ctrl + Shift + N', description: 'Skip question (if allowed)' },
      ],
    },
    {
      category: 'Accessibility',
      shortcuts: [
        { key: 'Ctrl + Shift + T', description: 'Toggle theme (light/dark)' },
        { key: 'Ctrl + Shift + =', description: 'Increase text size' },
        { key: 'Ctrl + Shift + -', description: 'Decrease text size' },
        { key: 'Ctrl + Shift + 0', description: 'Reset text size' },
      ],
    },
    {
      category: 'Help & Guides',
      shortcuts: [
        { key: 'F1', description: 'Show welcome tour' },
        { key: 'F2', description: 'Show privacy info' },
        { key: 'F3', description: 'Show quick start guide' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-200 dark:border-secondary-600 max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="border-b border-secondary-200 dark:border-secondary-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mt-1">
                Use these shortcuts to navigate faster
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-2 px-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
                    >
                      <span className="text-secondary-700 dark:text-secondary-200">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200 rounded border border-secondary-300 dark:border-secondary-500">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile shortcuts note */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📱 Mobile Shortcuts
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              On mobile devices, you can use long-press gestures and accessibility features
              to navigate quickly. The text size controls and theme switcher are available
              in the navigation bar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-200 dark:border-secondary-600 p-6">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="primary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelp;
