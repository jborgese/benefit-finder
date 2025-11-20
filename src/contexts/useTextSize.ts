/**
 * useTextSize Hook
 *
 * Hook for accessing text size context
 */

import { useContext } from 'react';
import { TextSizeContext, type TextSizeContextType } from './TextSizeContext';

export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};
