/**
 * Utility functions for EnhancedCountySelector
 */

import { useEffect } from 'react';

// Helper function to handle click outside
export const useClickOutside = (
  containerRef: React.RefObject<HTMLDivElement>,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  setSearchQuery: (query: string) => void
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, containerRef, setIsOpen, setSearchQuery]);
};

// Helper function to normalize errors array
export const normalizeErrors = (errorValue: string | string[] | undefined): string[] => {
  if (Array.isArray(errorValue)) {
    return errorValue;
  }
  if (errorValue) {
    return [errorValue];
  }
  return [];
};
