/**
 * Enhanced Questionnaire Component
 *
 * Extends the basic questionnaire with dynamic question text updates
 * based on previous answers.
 */

import React, { useState, useEffect } from 'react';
import { QuestionFlowUI } from './QuestionFlowUI';
import type { QuestionFlow, QuestionDefinition } from '../types';

interface EnhancedQuestionnaireProps {
  flow: QuestionFlow;
  onComplete: (answers: Record<string, unknown>) => void;
}

export const EnhancedQuestionnaire: React.FC<EnhancedQuestionnaireProps> = ({
  flow,
  onComplete,
}) => {
  const [dynamicFlow, setDynamicFlow] = useState<QuestionFlow>(flow);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  // Update flow when answers change to modify question text dynamically
  useEffect(() => {
    const updatedFlow = { ...flow };
    const updatedNodes = new Map(updatedFlow.nodes);

    // Find the income question and update its text based on income period selection
    const incomeNode = updatedNodes.get('income');
    if (incomeNode && answers.incomePeriod) {
      const incomePeriod = answers.incomePeriod as string;
      const periodText = incomePeriod === 'monthly' ? 'monthly' : 'annual';
      const periodExample = incomePeriod === 'monthly' ? '$3,000' : '$36,000';

      const updatedQuestion: QuestionDefinition = {
        ...incomeNode.question,
        text: `What is your total ${periodText} household income?`,
        description: `Enter your ${periodText} household income (e.g., ${periodExample})`,
        placeholder: `Enter your ${periodText} household income`,
      };

      const updatedNode = {
        ...incomeNode,
        question: updatedQuestion,
      };

      updatedNodes.set('income', updatedNode);
      updatedFlow.nodes = updatedNodes;
      setDynamicFlow(updatedFlow);
    }
  }, [answers, flow]);

  const handleAnswerChange = (questionId: string, value: unknown): void => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuestionFlowUI
        flow={dynamicFlow}
        onComplete={onComplete}
        onAnswerChange={handleAnswerChange}
        showProgress
        showNavigation
        autoSave
        enableSaveResume
      />
    </div>
  );
};
