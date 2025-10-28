/**
 * Questionnaire Page Component
 *
 * Optimized questionnaire page with lazy-loaded components
 */

import React from 'react';
import { LazyEnhancedQuestionnaire } from '../components/LazyComponents';
import { createEnhancedFlow } from '../questionnaire/enhanced-flow';

interface QuestionnairePageProps {
  onComplete: (answers: Record<string, unknown>) => void;
}

export const QuestionnairePage: React.FC<QuestionnairePageProps> = ({ onComplete }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 sm:mb-8 text-center px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          Benefit Eligibility Assessment
        </h2>
        <p className="text-secondary-600 dark:text-secondary-300 text-sm sm:text-base">
          Complete this questionnaire to check your eligibility for government benefits
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-0 questionnaire-container">
        <LazyEnhancedQuestionnaire
          flow={createEnhancedFlow()}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
};
