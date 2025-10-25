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
  }, [touched, onValidationChange]);

  // Validate when value changes, but only if field has been touched
  React.useEffect(() => {
    if (touched) {
      validateValue(value);
    }
  }, [value, touched]);

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
        return (
          <SelectInput
            {...commonProps}
            value={value as string | number}
            options={question.options ?? []}
            variant={question.inputType === 'radio' ? 'radio' : 'dropdown'}
          />
        );

      case 'searchable-select':
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
        // Use enhanced DateOfBirthInput for birth date questions
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

