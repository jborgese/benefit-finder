/**
 * Type definitions for EnhancedCountySelector
 */

import type { QuestionDefinition } from '../../types';

export interface CountyOption {
  value: string;
  label: string;
}

export interface EnhancedCountySelectorProps {
  question: QuestionDefinition;
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string[];
  disabled?: boolean;
  autoFocus?: boolean;
  onEnterKey?: () => void;
  selectedState?: string;
  showPopularFirst?: boolean;
  showStateContext?: boolean;
  enableSearch?: boolean;
  mobileOptimized?: boolean;
  maxHeight?: string;
  noResultsText?: string;
  searchPlaceholder?: string;
}
