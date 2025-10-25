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
import type { QuestionDefinition } from '../types';
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
}) => {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);
  const deviceInfo = useDeviceDetection();
  const store = useQuestionFlowStore();

  // Validate value
  const validateValue = React.useCallback((val: unknown): void => {
    // Only validate if the field has been touched by the user
    if (!touched) {
      setErrors([]);
      onValidationChange?.(true, []);
      return;
    }

    const schema = createSchemaFromQuestion(question);
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
    return (
      <EnhancedStateSelector
        {...commonProps}
        value={value as string}
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
      questionText: question.text,
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
        selectedState={selectedState}
        placeholder={question.placeholder ?? 'Search for your county...'}
        showPopularFirst
        showStateContext
        enableSearch
        mobileOptimized={deviceInfo.isMobile}
        maxHeight={deviceInfo.isMobile ? '60vh' : '300px'}
      />
    );
  };

  // Render appropriate input component
  const renderInput = (): React.ReactNode => {
    const commonProps = {
      question,
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
        if (question.fieldName === 'state' || question.text.toLowerCase().includes('state')) {
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

      case 'searchable-select':
        if (question.fieldName === 'county' || question.text.toLowerCase().includes('county')) {
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
        if (question.fieldName.toLowerCase().includes('birth') ||
          question.fieldName.toLowerCase().includes('dob') ||
          question.text.toLowerCase().includes('birth')) {
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
      aria-label={`Question: ${question.text}`}
    >
      {renderInput()}
    </div>
  );
};

Question.displayName = 'Question';

