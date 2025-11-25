/**
 * Types for EnhancedStateSelector
 */

import type { SelectProps } from '../types';

export interface EnhancedStateSelectorProps extends Omit<SelectProps, 'options'> {
  /** Show popular states first */
  showPopularFirst?: boolean;
  /** Group states by region */
  groupByRegion?: boolean;
  /** Show search functionality */
  enableSearch?: boolean;
  /** Mobile-optimized interface */
  mobileOptimized?: boolean;
  /** Auto-detect user's state */
  enableAutoDetection?: boolean;
  /** Show state population */
  showPopulation?: boolean;
  /** Maximum height for dropdown */
  maxHeight?: string;
}

export interface StoreWithAnswerQuestion {
  answerQuestion: (questionId: string, fieldName: string, value: unknown) => void;
}
