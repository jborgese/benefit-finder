/**
 * Question Component Types
 *
 * Shared types for question input components
 */

import type { QuestionDefinition, QuestionOption } from '../types';

/**
 * Base props for all question components
 */
export interface BaseQuestionProps<T = unknown> {
  /** Question definition */
  question: QuestionDefinition;
  /** Current value */
  value?: T | null;
  /** Change handler */
  onChange: (value: T | null) => void;
  /** Error message(s) */
  error?: string | string[];
  /** Is the field disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Enter key handler */
  onEnterKey?: () => void;
}

/**
 * Text input props
 */
export interface TextInputProps extends BaseQuestionProps<string> {
  /** Input type */
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  /** Maximum length */
  maxLength?: number;
  /** Pattern for validation */
  pattern?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
}

/**
 * Number input props
 */
export interface NumberInputProps extends BaseQuestionProps<number> {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Show step buttons */
  showSteppers?: boolean;
}

/**
 * Currency input props
 */
export interface CurrencyInputProps extends BaseQuestionProps<number> {
  /** Currency code (ISO 4217) */
  currency?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Allow negative values */
  allowNegative?: boolean;
}

/**
 * Select props (single selection)
 */
export interface SelectProps extends BaseQuestionProps<string | number> {
  /** Options */
  options: QuestionOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Allow search/filter */
  searchable?: boolean;
  /** Display as radio buttons instead of dropdown */
  variant?: 'dropdown' | 'radio';
}

/**
 * Multi-select props
 */
export interface MultiSelectProps extends BaseQuestionProps<(string | number)[]> {
  /** Options */
  options: QuestionOption[];
  /** Minimum selections required */
  minSelections?: number;
  /** Maximum selections allowed */
  maxSelections?: number;
  /** Display variant */
  variant?: 'checkbox' | 'pills';
}

/**
 * Date input props
 */
export interface DateInputProps extends BaseQuestionProps<string> {
  /** Minimum date (ISO string) */
  min?: string;
  /** Maximum date (ISO string) */
  max?: string;
  /** Date format for display */
  format?: 'short' | 'medium' | 'long';
  /** Show calendar picker */
  showPicker?: boolean;
}

/**
 * Boolean/Yes-No props
 */
export interface BooleanInputProps extends BaseQuestionProps<boolean> {
  /** Display variant */
  variant?: 'toggle' | 'radio' | 'checkbox';
  /** Labels for true/false */
  labels?: {
    true: string;
    false: string;
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Input state for internal use
 */
export interface InputState {
  isFocused: boolean;
  isDirty: boolean;
  isTouched: boolean;
}

