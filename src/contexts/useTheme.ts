/**
 * useTheme Hook
 *
 * Hook for accessing theme context
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

import type { ThemeContextType } from './ThemeContext';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
