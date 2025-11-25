/**
 * State management hook for EnhancedCountySelector
 */

import { useState, useEffect } from 'react';
import type { QuestionDefinition } from '../../types';

export const useCountySelectorState = (
  question: QuestionDefinition,
  disabled: boolean,
  selectedState: string | undefined,
  enableSearch: boolean,
  searchInputRef: React.RefObject<HTMLInputElement>
): {
  isOpen: boolean;
  isFocused: boolean;
  isTouched: boolean;
  hasUserInteracted: boolean;
  searchQuery: string;
  setIsOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  handleToggle: () => void;
  handleCountySelect: (countyValue: string, onChange: (value: string | null) => void) => void;
  handleBlur: (dropdownRef: React.RefObject<HTMLDivElement>) => void;
  handleFocus: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>, onEnterKey?: () => void) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset touched state when question changes
  useEffect(() => {
    setIsTouched(false);
    setHasUserInteracted(false);
  }, [question.id]);

  const handleToggle = (): void => {
    if (!disabled && selectedState) {
      setIsOpen(!isOpen);
      if (!isOpen && enableSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  };

  const handleCountySelect = (countyValue: string, onChange: (value: string | null) => void): void => {
    setHasUserInteracted(true);
    onChange(countyValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleBlur = (dropdownRef: React.RefObject<HTMLDivElement>): void => {
    setTimeout(() => {
      setIsFocused(false);
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
      if (hasUserInteracted) {
        setIsTouched(true);
      }
    }, 150);
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, onEnterKey?: () => void): void => {
    if (e.key === 'Enter' && onEnterKey) {
      e.preventDefault();
      onEnterKey();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return {
    isOpen,
    isFocused,
    isTouched,
    hasUserInteracted,
    searchQuery,
    setIsOpen,
    setSearchQuery,
    handleToggle,
    handleCountySelect,
    handleBlur,
    handleFocus,
    handleKeyDown,
    handleSearchChange
  };
};
