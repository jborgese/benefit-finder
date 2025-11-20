/**
 * Store Usage Examples
 *
 * This file demonstrates how to use the Zustand stores in React components.
 * These examples showcase best practices for state management in BenefitFinder.
 */

import React from 'react';
import { useAppSettingsStore, useQuestionnaireStore, useUIStore } from '../index';

/**
 * Example 1: Theme Switcher Component
 * Demonstrates using app settings store for theme management
 */
export function ThemeSwitcher(): React.JSX.Element {
  const theme = useAppSettingsStore((state) => state.theme);
  const setTheme = useAppSettingsStore((state) => state.setTheme);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`px-4 py-2 rounded ${
          theme === 'light' ? 'bg-primary-600 text-white' : 'bg-neutral-200'
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-4 py-2 rounded ${
          theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-neutral-200'
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-4 py-2 rounded ${
          theme === 'system' ? 'bg-primary-600 text-white' : 'bg-neutral-200'
        }`}
      >
        System
      </button>
    </div>
  );
}

/**
 * Example 2: Language Selector
 * Shows multi-language support implementation
 */
export function LanguageSelector(): React.JSX.Element {
  const { language, setLanguage } = useAppSettingsStore((state) => ({
    language: state.language,
    setLanguage: state.setLanguage,
  }));

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
      className="px-4 py-2 border rounded-lg"
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}

/**
 * Example 3: Questionnaire Progress Bar
 * Demonstrates questionnaire state tracking
 */
export function QuestionnaireProgress(): React.JSX.Element {
  const progress = useQuestionnaireStore((state) => state.progress);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-secondary-600 mb-2">
        <span>Progress</span>
        <span>{progress.percentComplete}%</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.percentComplete}%` }}
          role="progressbar"
          aria-valuenow={progress.percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="mt-2 text-xs text-secondary-500">
        {progress.answeredQuestions.length} of {progress.totalQuestions} questions answered
      </div>
    </div>
  );
}

/**
 * Example 4: Toast Notification Trigger
 * Shows how to display toast messages
 */
export function SaveButton(): React.JSX.Element {
  const addToast = useUIStore((state) => state.addToast);

  const handleSave = async (): Promise<void> => {
    try {
      // Simulate async save operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addToast({
        type: 'success',
        message: 'Your information has been saved successfully.',
        duration: 3000,
      });
    } catch {
      addToast({
        type: 'error',
        message: 'Failed to save. Please try again.',
        duration: 5000,
      });
    }
  };

  return (
    <button
      onClick={() => { void handleSave(); }}
      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-touch"
    >
      Save Progress
    </button>
  );
}

/**
 * Example 5: Modal Opener
 * Demonstrates modal management
 */
export function DeleteProfileButton(): React.JSX.Element {
  const { openModal, closeModal, addToast } = useUIStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal,
    addToast: state.addToast,
  }));

  const handleDelete = (): void => {
    const modalId = openModal({
      type: 'confirm',
      title: 'Delete Profile?',
      data: {
        message: 'This action cannot be undone. All your information will be permanently deleted.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        onConfirm: () => {
          // Simulate delete operation
          addToast({
            type: 'success',
            message: 'Profile deleted successfully.',
            duration: 3000,
          });
          closeModal(modalId);
        },
      },
    });
  };

  return (
    <button
      onClick={handleDelete}
      className="px-6 py-3 bg-error-600 text-white rounded-lg hover:bg-error-700 min-h-touch"
    >
      Delete Profile
    </button>
  );
}

/**
 * Example 6: Loading Overlay
 * Shows loading state management
 */
export function AsyncOperationButton(): React.JSX.Element {
  const { isLoading, setLoading } = useUIStore((state) => ({
    isLoading: state.isLoading,
    setLoading: state.setLoading,
  }));

  const handleOperation = async (): Promise<void> => {
    setLoading(true, 'Processing your request...', 0);

    try {
      // Simulate work with progress updates
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoading(true, 'Processing your request...', i);
      }

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => { void handleOperation(); }}
      disabled={isLoading}
      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-touch"
    >
      {isLoading ? 'Processing...' : 'Start Process'}
    </button>
  );
}

/**
 * Example 7: Accessibility Settings Panel
 * Demonstrates accessibility preferences management
 */
export function AccessibilitySettings(): React.JSX.Element {
  const {
    highContrast,
    reduceMotion,
    fontSize,
    setHighContrast,
    setReduceMotion,
    setFontSize,
  } = useAppSettingsStore((state) => ({
    highContrast: state.highContrast,
    reduceMotion: state.reduceMotion,
    fontSize: state.fontSize,
    setHighContrast: state.setHighContrast,
    setReduceMotion: state.setReduceMotion,
    setFontSize: state.setFontSize,
  }));

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Accessibility Settings</h3>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={highContrast}
          onChange={(e) => setHighContrast(e.target.checked)}
          className="w-5 h-5"
        />
        <span>High Contrast Mode</span>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
          className="w-5 h-5"
        />
        <span>Reduce Motion</span>
      </label>

      <div>
        <label htmlFor="font-size" className="block mb-2">
          Font Size
        </label>
        <select
          id="font-size"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Example 8: Questionnaire Question Component
 * Shows complete questionnaire flow integration
 */
export function QuestionComponent(): React.JSX.Element {
  const {
    currentQuestionId,
    answers,
    setAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    validationErrors,
  } = useQuestionnaireStore((state) => ({
    currentQuestionId: state.currentQuestionId,
    answers: state.answers,
    setAnswer: state.setAnswer,
    goToNextQuestion: state.goToNextQuestion,
    goToPreviousQuestion: state.goToPreviousQuestion,
    validationErrors: state.validationErrors,
  }));

  // Safe: currentQuestionId is validated before use
  const currentAnswer = currentQuestionId
    ?  
      (answers[currentQuestionId].value ?? null)
    : null;

  const handleSubmit = (): void => {
    if (currentQuestionId) {
      goToNextQuestion('next-question-id');
    }
  };

  // Safe: currentQuestionId is validated before use
   
  const currentValidationError = currentQuestionId ? validationErrors[currentQuestionId] : undefined;
  const hasValidationError = currentQuestionId ? currentQuestionId in validationErrors : false;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Question</h2>

      <div>
        <label htmlFor="answer" className="block mb-2">
          Your Answer:
        </label>
        <input
          id="answer"
          type="text"
          value={currentAnswer?.toString() ?? ''}
          onChange={(e) => currentQuestionId && setAnswer(currentQuestionId, e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          aria-invalid={hasValidationError}
          aria-describedby={hasValidationError ? 'error' : undefined}
        />
        {hasValidationError && (
          <p id="error" className="mt-1 text-sm text-error-600">
            {currentValidationError}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={goToPreviousQuestion}
          className="px-6 py-3 bg-secondary-200 text-secondary-900 rounded-lg hover:bg-secondary-300 min-h-touch"
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-touch"
        >
          Next
        </button>
      </div>
    </div>
  );
}

