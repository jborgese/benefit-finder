/**
 * Questionnaire Answers Card Component
 *
 * Displays the entered questionnaire values for reference on the results page
 */

import React, { useMemo } from 'react';
import { useQuestionFlowStore } from '../../questionnaire/store';
import type { QuestionDefinition } from '../../questionnaire/types';

interface QuestionnaireAnswersCardProps {
  className?: string;
}

export const QuestionnaireAnswersCard: React.FC<QuestionnaireAnswersCardProps> = ({
  className = '',
}) => {
  const { answers, flow, getAnswerContext } = useQuestionFlowStore();

  // Get answer context for resolving dynamic question text
  // Recalculate when answers change to ensure dynamic question text is updated
  const questionContext = useMemo(() => getAnswerContext(), [getAnswerContext]);

  // Memoize the expensive filtering operations
  const answeredQuestions = useMemo(() => {
    if (!flow) return [];

    // Get all questions from the flow to display them in order
    const questions = Array.from(flow.nodes.values());

    // Filter to only show questions that have answers
    return questions.filter((node: { question: QuestionDefinition }) => {
      const answer = answers.get(node.question.id);
      return answer && answer.value !== null && answer.value !== undefined && answer.value !== '';
    });
  }, [answers, flow]);

  if (answeredQuestions.length === 0) {
    return null;
  }

  // Helper function to format boolean values
  const formatBoolean = (value: unknown): string => {
    if (value === true) {
      return 'Yes';
    }
    if (value === false) {
      return 'No';
    }
    return String(value);
  };

  // Helper function to format select/radio values
  const formatSelectValue = (value: unknown, question: QuestionDefinition): string => {
    const option = question.options?.find(opt => opt.value === value);
    return option ? option.label : String(value);
  };

  // Helper function to format multiselect/checkbox values
  const formatMultiValue = (value: unknown, question: QuestionDefinition): string => {
    if (Array.isArray(value)) {
      return value.map(val => {
        const option = question.options?.find(opt => opt.value === val);
        return option ? option.label : String(val);
      }).join(', ');
    }
    return String(value);
  };

  // Helper function to format date values
  const formatDateValue = (value: unknown): string => {
    if (typeof value === 'string') {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const formatValue = (value: unknown, question: QuestionDefinition): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not answered';
    }

    switch (question.inputType) {
      case 'currency':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : String(value);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case 'boolean':
        return formatBoolean(value);
      case 'select':
      case 'radio': {
        return formatSelectValue(value, question);
      }
      case 'multiselect':
      case 'checkbox':
        return formatMultiValue(value, question);
      case 'date':
        return formatDateValue(value);
      default:
        return String(value);
    }
  };

  const getQuestionLabel = (question: QuestionDefinition): string => {
    // Resolve question text if it's a function
    const resolvedText = typeof question.text === 'function'
      ? question.text(questionContext)
      : question.text;

    // Use the question text, but make it more concise for display
    return typeof resolvedText === 'string'
      ? resolvedText.replace(/\?$/, '').trim()
      : String(resolvedText);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <span className="mr-2">📝</span>
          Your Assessment Information
        </h3>
        <p className="text-sm text-gray-600">
          Here are the answers you provided during the assessment. This information was used to determine your eligibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {answeredQuestions.map(({ question }: { question: QuestionDefinition }) => {
          const answer = answers.get(question.id);

          if (!answer) return null;

          return (
            <div key={question.id} className="bg-gray-50 rounded-lg p-4 print:border print:bg-white">
              <dt className="text-sm font-medium text-gray-700 mb-1">
                {getQuestionLabel(question)}
              </dt>
              <dd className="text-sm text-gray-900 font-medium">
                {formatValue(answer.value, question)}
              </dd>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 print:border-t print:mt-2">
        <p className="text-xs text-gray-500">
          Assessment completed on{' '}
          {new Date().toLocaleDateString()} at{' '}
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default QuestionnaireAnswersCard;
