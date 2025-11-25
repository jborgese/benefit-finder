/**
 * Loading State Component for County Selector
 */

import React, { useId } from 'react';
import { resolveQuestionString } from '../../resolveQuestionText';
import type { QuestionDefinition } from '../../types';

interface LoadingStateSelectorProps {
  question: QuestionDefinition;
  mobileOptimized: boolean;
}

export const LoadingStateSelector: React.FC<LoadingStateSelectorProps> = ({
  question,
  mobileOptimized
}) => {
  const id = useId();
  const descId = `${id}-desc`;

  return (
    <div className={`enhanced-county-selector ${mobileOptimized ? 'mobile' : 'desktop'}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-2"
      >
        {resolveQuestionString(question.text)}
        {question.required && (
          <span className="text-red-500 dark:text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {question.description && (
        <p id={descId} className="text-sm text-gray-600 dark:text-secondary-300 mb-3">
          {resolveQuestionString(question.description)}
        </p>
      )}

      <div className="w-full px-4 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-secondary-800 text-gray-500 dark:text-secondary-400 border-gray-300 dark:border-secondary-600">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2" />
          Please select a state first to see available counties
        </div>
      </div>
    </div>
  );
};

LoadingStateSelector.displayName = 'LoadingStateSelector';
