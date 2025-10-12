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
}

export const Question: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  className = '',
}) => {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);

  // Validate on change
  const handleChange = (newValue: unknown): void => {
    onChange(newValue);

    // Validate if touched
    if (touched) {
      validateValue(newValue);
    }
  };

  // Validate value
  const validateValue = (val: unknown): void => {
    const schema = createSchemaFromQuestion(question);
    const result = validateWithSchema(schema, val);

    if (!result.success) {
      setErrors(result.errors ?? []);
    } else {
      setErrors([]);
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
    <div className={`question-wrapper ${className}`} onBlur={handleBlur}>
      {renderInput()}
    </div>
  );
};

Question.displayName = 'Question';

