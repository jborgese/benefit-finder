/**
 * Question Component
 *
 * Universal question component that renders appropriate input
 * based on question type, with Radix UI integration
 */

import React from 'react';
import {
  TextInput,
  NumberInput,
  CurrencyInput,
  SelectInput,
  MultiSelectInput,
  DateInput,
} from '../components';
import { SearchableSelectInput } from '../components/SearchableSelectInput';
import { DateOfBirthInput } from '../components/DateOfBirthInput';
import { EnhancedStateSelector } from '../components/EnhancedStateSelector';
import { EnhancedCountySelector } from '../components/EnhancedCountySelector';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { useQuestionFlowStore } from '../store';
import type { QuestionDefinition, QuestionContext } from '../types';
import { createSchemaFromQuestion, validateWithSchema } from '../validation/schemas';

export interface QuestionProps {
  /** Question definition */
  question: QuestionDefinition;
  /** Current value */
  value?: unknown;
  /** Change handler */
  onChange: (value: unknown) => void;
  /** Is disabled */
  disabled?: boolean;
  /** Auto-focus */
  autoFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Validation state change handler */
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  /** Enter key handler */
  onEnterKey?: () => void;
  /** Answer context for dynamic question text */
  context?: QuestionContext;
}

export const Question: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  className = '',
  onValidationChange,
  onEnterKey,
  context,
}) => {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);
  const deviceInfo = useDeviceDetection();
  const store = useQuestionFlowStore();

  // Subscribe to answers changes to trigger re-render when context changes
  // This ensures dynamic question text updates when previous answers change
  const answersSize = store.answers.size;
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Question] Answers changed, re-rendering', {
        questionId: question.id,
        answersSize,
        currentAnswers: Array.from(store.answers.entries()),
      });
    }
  }, [answersSize, question.id, store]);

  // Resolve dynamic question text and description
  const questionContext = context ?? store.getAnswerContext();

  const fieldName = question.fieldName ?? '';

  // Debug logging for dynamic question text
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Question Debug]', {
        questionId: question.id,
        questionFieldName: question.fieldName,
        hasTextFunction: typeof question.text === 'function',
        hasDescriptionFunction: typeof question.description === 'function',
        contextKeys: Object.keys(questionContext),
        contextValues: questionContext,
        incomePeriodValue: questionContext.incomePeriod,
        allAnswers: Object.fromEntries(store.answers),
      });
    }
  }, [question.id, question.fieldName, question.text, question.description, questionContext, store]);

  const questionText = React.useMemo(() => {
    const resolved = typeof question.text === 'function'
      ? question.text(questionContext)
      : question.text;

    if (import.meta.env.DEV) {
      console.log('[Question Text Resolved]', {
        questionId: question.id,
        isFunction: typeof question.text === 'function',
        resolvedText: resolved,
        contextIncomePeriod: questionContext.incomePeriod,
      });
    }

    return resolved;
  }, [question, questionContext]);

  const questionDescription = React.useMemo(() => {
    const resolved = typeof question.description === 'function'
      ? question.description(questionContext)
      : question.description;

    if (import.meta.env.DEV) {
      console.log('[Question Description Resolved]', {
        questionId: question.id,
        isFunction: typeof question.description === 'function',
        resolvedDescription: resolved,
        contextIncomePeriod: questionContext.incomePeriod,
      });
    }

    return resolved;
  }, [question, questionContext]);

  // Create a modified question object with resolved text for input components
  const resolvedQuestion: QuestionDefinition = React.useMemo(() => ({
    ...question,
    text: questionText,
    description: questionDescription,
  }), [question, questionText, questionDescription]);

  // Validate value
  const validateValue = React.useCallback((val: unknown): void => {
    // Only validate if the field has been touched by the user
    if (!touched) {
      setErrors([]);
      onValidationChange?.(true, []);
      return;
    }

    const schema = createSchemaFromQuestion({
      inputType: question.inputType ?? 'text',
      fieldName: question.fieldName,
      required: question.required,
      min: question.min,
      max: question.max,
      validations: question.validations,
    });
    const result = validateWithSchema(schema, val);

    if (!result.success) {
      const validationErrors = result.errors ?? [];
      setErrors(validationErrors);
      onValidationChange?.(false, validationErrors);
    } else {
      setErrors([]);
      onValidationChange?.(true, []);
    }
  }, [question, onValidationChange, touched]);

  // Debug logging for radio buttons
  React.useEffect(() => {
    if (question.inputType === 'radio') {
      console.log('Question Debug:', {
        questionId: question.id,
        touched,
        errors,
        value,
        hasErrors: errors.length > 0
      });
    }
  }, [question.id, question.inputType, touched, errors, value]);

  // Initialize validation state - only validate if touched
  React.useEffect(() => {
    if (touched) {
      validateValue(value);
    } else {
      // Clear errors when not touched to prevent showing validation errors on mount
      setErrors([]);
      onValidationChange?.(true, []);
    }
  }, [touched, onValidationChange, validateValue, value]);

  // Validate when value changes, but only if field has been touched
  React.useEffect(() => {
    if (touched) {
      validateValue(value);
    }
  }, [value, touched, validateValue]);

  // Validate on change
  const handleChange = (newValue: unknown): void => {
    onChange(newValue);

    // Mark as touched when user first interacts with the field
    if (!touched) {
      setTouched(true);
      // Validate immediately after marking as touched
      validateValue(newValue);
    } else {
      // Only validate if the field has been touched by the user
      validateValue(newValue);
    }
  };

  // Mark as touched on blur
  const handleBlur = (): void => {
    setTouched(true);
    validateValue(value);
  };

  // Helper function to render state selector
  const renderStateSelector = (commonProps: {
    question: QuestionDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string[];
    disabled: boolean;
    autoFocus: boolean;
    onEnterKey?: () => void;
  }): React.ReactNode => {
    console.log('[Question] renderStateSelector called', {
      questionId: commonProps.question.id,
      questionText: commonProps.question.text,
      questionDescription: commonProps.question.description,
      value: commonProps.value,
      deviceIsMobile: deviceInfo.isMobile,
      resolvedQuestionText: resolvedQuestion.text,
      resolvedQuestionDescription: resolvedQuestion.description,
    });

    return (
      <EnhancedStateSelector
        {...commonProps}
        question={resolvedQuestion}
        value={commonProps.value as string | null}
        placeholder="Search for your state..."
        showPopularFirst
        groupByRegion={!deviceInfo.isMobile}
        enableSearch
        mobileOptimized={deviceInfo.isMobile}
        enableAutoDetection
        maxHeight={deviceInfo.isMobile ? '60vh' : '300px'}
      />
    );
  };

  // Helper function to extract state value from answer
  const extractStateValue = (stateAnswer: unknown): string | null => {
    if (typeof stateAnswer === 'string') {
      return stateAnswer;
    }

    if (stateAnswer && typeof stateAnswer === 'object') {
      const stateObj = stateAnswer as Record<string, unknown>;
      if ('value' in stateObj) {
        return stateObj.value as string;
      }

      if ('label' in stateObj) {
        const stateLabel = stateObj.label as string;
        const stateOptions = [
          { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
          { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
          { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
          { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
          { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
          { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
          { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
          { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
          { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
          { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
          { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
          { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
          { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
          { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
          { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
          { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
          { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
        ];
        const matchingState = stateOptions.find(state => state.label === stateLabel);
        return matchingState?.value ?? null;
      }
    }

    return null;
  };

  // Helper function to render county selector
  const renderCountySelector = (commonProps: {
    question: QuestionDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string[];
    disabled: boolean;
    autoFocus: boolean;
    onEnterKey?: () => void;
  }): React.ReactNode => {
    const stateAnswer = store.answers.get('state');
    const selectedState = extractStateValue(stateAnswer);

    console.log('🔍 Question: Rendering EnhancedCountySelector', {
      questionId: question.id,
      questionText,
      fieldName: question.fieldName,
      rawStateAnswer: stateAnswer,
      selectedState,
      hasSelectedState: !!selectedState,
      allAnswers: Object.fromEntries(store.answers),
      value,
      hasOptions: question.options?.length ?? 0
    });

    return (
      <EnhancedCountySelector
        {...commonProps}
        value={value as string | null}
        selectedState={selectedState ?? undefined}
        searchPlaceholder={question.placeholder ?? 'Search for your county...'}
        showPopularFirst
        showStateContext
        enableSearch
        mobileOptimized={deviceInfo.isMobile}
        maxHeight={deviceInfo.isMobile ? '60vh' : '300px'}
      />
    );
  };

  // Helper to check if question is about state
  const isStateQuestion = (): boolean => {
    return fieldName === 'state' || questionText.toLowerCase().includes('state');
  };

  // Helper to check if question is about county
  const isCountyQuestion = (): boolean => {
    return fieldName === 'county' || questionText.toLowerCase().includes('county');
  };

  // Helper to check if question is about birth date
  const isBirthDateQuestion = (): boolean => {
    return fieldName.toLowerCase().includes('birth') ||
      fieldName.toLowerCase().includes('dob') ||
      questionText.toLowerCase().includes('birth');
  };

  // Render select or radio input
  const renderSelectOrRadioInput = (commonProps: {
    question: QuestionDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string[];
    disabled: boolean;
    autoFocus: boolean;
    onEnterKey?: () => void;
  }): React.ReactNode => {
    if (isStateQuestion()) {
      if (import.meta.env.DEV) {
        console.log('[Question] Rendering EnhancedStateSelector', {
          questionId: question.id,
          fieldName: question.fieldName,
          questionText,
          resolvedQuestion,
        });
      }
      return renderStateSelector(commonProps);
    }
    return (
      <SelectInput
        {...commonProps}
        value={value as string | number}
        options={question.options ?? []}
        variant={question.inputType === 'radio' ? 'radio' : 'dropdown'}
      />
    );
  };

  // Render searchable select input
  const renderSearchableSelectInput = (commonProps: {
    question: QuestionDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string[];
    disabled: boolean;
    autoFocus: boolean;
    onEnterKey?: () => void;
  }): React.ReactNode => {
    if (isStateQuestion()) {
      console.log('[Question] Rendering EnhancedStateSelector for searchable-select state question', {
        questionId: question.id,
        fieldName: question.fieldName,
        questionText,
        resolvedQuestionText: resolvedQuestion.text,
        resolvedQuestionDescription: resolvedQuestion.description,
      });
      return renderStateSelector(commonProps);
    }
    if (isCountyQuestion()) {
      return renderCountySelector(commonProps);
    }
    return (
      <SearchableSelectInput
        {...commonProps}
        value={value as string | null}
        options={question.options ?? []}
        searchPlaceholder={question.placeholder}
      />
    );
  };

  // Render date input
  const renderDateInput = (commonProps: {
    question: QuestionDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string[];
    disabled: boolean;
    autoFocus: boolean;
    onEnterKey?: () => void;
  }): React.ReactNode => {
    if (isBirthDateQuestion()) {
      return (
        <DateOfBirthInput
          {...commonProps}
          value={value as string}
          showAge
          showAgeInWords
        />
      );
    }
    return <DateInput {...commonProps} value={value as string} />;
  };

  // Render appropriate input component
  const renderInput = (): React.ReactNode => {
    const commonProps = {
      question: resolvedQuestion,
      value,
      onChange: handleChange,
      error: errors.length > 0 ? errors : undefined,
      disabled,
      autoFocus,
      onEnterKey,
    };

    switch (question.inputType) {
      case 'email':
      case 'phone':
      case 'text':
        return <TextInput {...commonProps} value={value as string} />;

      case 'number':
        return <NumberInput {...commonProps} value={value as number} />;

      case 'currency':
        return <CurrencyInput {...commonProps} value={value as number} />;

      case 'select':
      case 'radio':
        return renderSelectOrRadioInput(commonProps);

      case 'searchable-select':
        return renderSearchableSelectInput(commonProps);

      case 'multiselect':
      case 'checkbox':
        return (
          <MultiSelectInput
            {...commonProps}
            value={value as (string | number)[]}
            options={question.options ?? []}
            variant={question.inputType === 'checkbox' ? 'checkbox' : 'pills'}
          />
        );

      case 'date':
        return renderDateInput(commonProps);

      case 'boolean':
        return (
          <SelectInput
            {...commonProps}
            value={value as string}
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            variant="radio"
          />
        );

      default:
        return <TextInput {...commonProps} value={value as string} />;
    }
  };

  return (
    <div
      className={`question-wrapper ${className}`}
      onBlur={handleBlur}
      role="group"
      aria-label={`Question: ${questionText}`}
    >
      {renderInput()}
    </div>
  );
};

Question.displayName = 'Question';

