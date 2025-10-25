/**
 * Enhanced County Selector Component
 *
 * Advanced county selection with search, geographic context,
 * popular counties first, and mobile optimization.
 */

import React, { useState, useId, useMemo, useRef, useEffect } from 'react';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { getCountiesForState, getStateName, searchCounties } from '../../services/location-data';
import type { QuestionDefinition } from '../types';

// Popular counties by state (major metropolitan areas)
const POPULAR_COUNTIES: Record<string, string[]> = {
  'CA': ['Los Angeles', 'San Diego', 'Orange', 'Riverside', 'San Bernardino', 'Santa Clara', 'Alameda', 'Sacramento', 'Contra Costa', 'Fresno'],
  'TX': ['Harris', 'Dallas', 'Tarrant', 'Bexar', 'Travis', 'Collin', 'Fort Bend', 'Hidalgo', 'El Paso', 'Denton'],
  'FL': ['Miami-Dade', 'Broward', 'Palm Beach', 'Hillsborough', 'Orange', 'Pinellas', 'Duval', 'Lee', 'Polk', 'Volusia'],
  'NY': ['Kings', 'Queens', 'New York', 'Suffolk', 'Bronx', 'Nassau', 'Westchester', 'Erie', 'Monroe', 'Onondaga'],
  'PA': ['Philadelphia', 'Allegheny', 'Montgomery', 'Bucks', 'Delaware', 'Lancaster', 'Chester', 'York', 'Dauphin', 'Lehigh'],
  'IL': ['Cook', 'DuPage', 'Lake', 'Will', 'Kane', 'McHenry', 'Winnebago', 'St. Clair', 'Sangamon', 'Peoria'],
  'OH': ['Franklin', 'Cuyahoga', 'Hamilton', 'Summit', 'Montgomery', 'Lucas', 'Stark', 'Butler', 'Lorain', 'Mahoning'],
  'GA': ['Fulton', 'Gwinnett', 'DeKalb', 'Cobb', 'Clayton', 'Cherokee', 'Forsyth', 'Henry', 'Paulding', 'Douglas'],
  'NC': ['Mecklenburg', 'Wake', 'Guilford', 'Forsyth', 'Durham', 'Buncombe', 'Cumberland', 'Union', 'Gaston', 'Cabarrus'],
  'MI': ['Wayne', 'Oakland', 'Macomb', 'Kent', 'Genesee', 'Washtenaw', 'Ingham', 'Kalamazoo', 'Saginaw', 'Ottawa']
};

interface EnhancedCountySelectorProps {
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

interface CountyOption {
  value: string;
  label: string;
}

// Helper function to get counties for a state
const useCountiesForState = (selectedState: string | undefined): CountyOption[] => {
  return useMemo(() => {
    if (!selectedState) return [];
    return getCountiesForState(selectedState);
  }, [selectedState]);
};

// Helper function to get popular counties
const usePopularCounties = (selectedState: string | undefined, allCounties: CountyOption[], showPopularFirst: boolean): CountyOption[] => {
  return useMemo(() => {
    if (!selectedState || !showPopularFirst) return [];
    const popular = selectedState in POPULAR_COUNTIES ? POPULAR_COUNTIES[selectedState] ?? [] : [];
    return allCounties.filter(county =>
      popular.some(popularName =>
        county.label.toLowerCase().includes(popularName.toLowerCase()) ||
        popularName.toLowerCase().includes(county.label.toLowerCase())
      )
    );
  }, [selectedState, allCounties, showPopularFirst]);
};

// Helper function to process counties based on search
const useProcessedCounties = (
  allCounties: CountyOption[],
  searchQuery: string,
  selectedState: string | undefined,
  showPopularFirst: boolean,
  popularCounties: CountyOption[]
): CountyOption[] => {
  return useMemo(() => {
    let counties = allCounties;

    if (searchQuery.trim()) {
      if (!selectedState) return [];
      counties = searchCounties(selectedState, searchQuery);
    }

    if (showPopularFirst && !searchQuery.trim()) {
      const popular = popularCounties;
      const other = counties.filter(county =>
        !popular.some(popularCounty => popularCounty.value === county.value)
      );
      return [...popular, ...other.sort((a, b) => a.label.localeCompare(b.label))];
    }

    return counties.sort((a, b) => a.label.localeCompare(b.label));
  }, [allCounties, searchQuery, selectedState, showPopularFirst, popularCounties]);
};

// Helper function to handle click outside
const useClickOutside = (containerRef: React.RefObject<HTMLDivElement>, isOpen: boolean, setIsOpen: (open: boolean) => void, setSearchQuery: (query: string) => void): void => {
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

// Helper function to render county list item
const renderCountyItem = (
  county: CountyOption,
  value: string | null,
  handleCountySelect: (countyValue: string) => void,
  isPopular: boolean
): React.JSX.Element => {
  return (
    <button
      key={county.value}
      type="button"
      onClick={() => handleCountySelect(county.value)}
      className={`
        w-full px-3 py-2 text-left hover:bg-secondary-50 dark:hover:bg-secondary-600
        ${value === county.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-secondary-900 dark:text-secondary-100'}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{county.label}</span>
        {isPopular && (
          <span className="text-xs text-primary-500 dark:text-primary-400">Popular</span>
        )}
      </div>
    </button>
  );
};

// Helper function to render county list
const renderCountyList = (
  processedCounties: CountyOption[],
  value: string | null,
  handleCountySelect: (countyValue: string) => void,
  searchQuery: string,
  showPopularFirst: boolean,
  popularCounties: CountyOption[],
  noResultsText: string
): React.JSX.Element => {
  if (processedCounties.length > 0) {
    return (
      <>
        {showPopularFirst && !searchQuery && popularCounties.length > 0 && (
          <div className="px-3 py-2 text-xs font-semibold text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 uppercase tracking-wide">
            Popular Counties
          </div>
        )}
        {processedCounties.map((county) => {
          const isPopular = popularCounties.some(p => p.value === county.value);
          return renderCountyItem(county, value, handleCountySelect, isPopular);
        })}
      </>
    );
  }

  return (
    <div className="px-3 py-4 text-center text-secondary-500 dark:text-secondary-400">
      <div className="text-4xl mb-2">🔍</div>
      <p className="text-sm">{noResultsText}</p>
      {searchQuery && (
        <p className="text-xs mt-1">Try a different search term</p>
      )}
    </div>
  );
};

// Helper function to render label section
const renderLabelSection = (
  question: QuestionDefinition,
  id: string,
  descId: string
): React.JSX.Element => {
  return (
    <>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-2"
      >
        {question.text}
        {question.required && (
          <span className="text-red-500 dark:text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {question.description && (
        <p id={descId} className="text-sm text-gray-600 dark:text-secondary-300 mb-3">
          {question.description}
        </p>
      )}
    </>
  );
};

// Helper function to render state context banner
const renderStateContext = (stateName: string | null, showStateContext: boolean): React.JSX.Element | null => {
  if (!showStateContext || !stateName) return null;

  return (
    <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <span className="font-medium">State:</span> {stateName}
      </p>
    </div>
  );
};

// Helper function to render desktop state context
const renderDesktopStateContext = (stateName: string | null, showStateContext: boolean): React.JSX.Element | null => {
  if (!showStateContext || !stateName) return null;

  return (
    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center">
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-medium">Selected State:</span> {stateName}
        </p>
      </div>
    </div>
  );
};

// Helper function to render error messages
const renderErrors = (errorId: string, errors: string[]): React.JSX.Element => {
  return (
    <div
      id={errorId}
      role="alert"
      aria-live="polite"
      className="mt-2"
    >
      {errors.map((err, idx) => (
        <p key={idx} className="text-sm text-red-600 dark:text-red-400">
          {err}
        </p>
      ))}
    </div>
  );
};

// Helper function to render help text
const renderHelpText = (question: QuestionDefinition, showError: boolean): React.JSX.Element | null => {
  if (!question.helpText || showError) return null;

  return (
    <p className="mt-2 text-xs text-gray-500 dark:text-secondary-400">
      {question.helpText}
    </p>
  );
};

export const EnhancedCountySelector: React.FC<EnhancedCountySelectorProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = false,
  onEnterKey,
  selectedState,
  showPopularFirst = true,
  showStateContext = true,
  enableSearch = true,
  mobileOptimized = false,
  maxHeight = '300px',
  noResultsText = 'No counties found',
  searchPlaceholder = 'Search for your county...',
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const deviceInfo = useDeviceDetection();

  // Reset touched state when question changes
  useEffect(() => {
    setIsTouched(false);
    setHasUserInteracted(false);
  }, [question.id]);

  // Helper function to normalize errors array
  const normalizeErrors = (errorValue: string | string[] | undefined): string[] => {
    if (Array.isArray(errorValue)) {
      return errorValue;
    }
    if (errorValue) {
      return [errorValue];
    }
    return [];
  };

  const hasError = Boolean(error);
  const showError = hasError && isTouched;
  const errors: string[] = normalizeErrors(error);

  // Use helper hooks
  const allCounties = useCountiesForState(selectedState);
  const popularCounties = usePopularCounties(selectedState, allCounties, showPopularFirst);
  const processedCounties = useProcessedCounties(allCounties, searchQuery, selectedState, showPopularFirst, popularCounties);

  const selectedCounty = allCounties.find(county => county.value === value);
  const stateName = selectedState ? getStateName(selectedState) : null;

  // Event handlers
  const handleToggle = (): void => {
    if (!disabled && selectedState) {
      setIsOpen(!isOpen);
      if (!isOpen && enableSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  };

  const handleCountySelect = (countyValue: string): void => {
    setHasUserInteracted(true);
    onChange(countyValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleBlur = (): void => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
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

  // Handle click outside
  useClickOutside(containerRef, isOpen, setIsOpen, setSearchQuery);

  // Show loading state if no state selected
  if (!selectedState) {
    return (
      <div className={`enhanced-county-selector ${mobileOptimized ? 'mobile' : 'desktop'}`}>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-2"
        >
          {question.text}
          {question.required && (
            <span className="text-red-500 dark:text-red-400 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {question.description && (
          <p id={descId} className="text-sm text-gray-600 dark:text-secondary-300 mb-3">
            {question.description}
          </p>
        )}

        <div className="w-full px-4 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-secondary-800 text-gray-500 dark:text-secondary-400 border-gray-300 dark:border-secondary-600">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2" />
            Please select a state first to see available counties
          </div>
        </div>
      </div>
    );
  }

  // Mobile-optimized render
  if (mobileOptimized || deviceInfo.isMobile) {
    return (
      <div ref={containerRef} className="enhanced-county-selector-mobile">
        {renderLabelSection(question, id, descId)}

        {renderStateContext(stateName, showStateContext)}

        <button
          type="button"
          onClick={handleToggle}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={question.description ? descId : undefined}
          className={`
            w-full px-4 py-3 text-left border rounded-lg shadow-sm
            bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100
            border-secondary-300 dark:border-secondary-600
            focus:outline-none transition-all duration-200 ease-smooth
            ${showError ? 'border-error-400 ring-2 ring-error-400/20' : ''}
            ${isFocused ? 'ring-2 ring-primary-400/20 border-primary-400' : ''}
            ${!showError && !isFocused ? 'hover:border-secondary-400 dark:hover:border-secondary-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={selectedCounty ? 'text-secondary-900 dark:text-secondary-100' : 'text-secondary-500'}>
              {selectedCounty ? selectedCounty.label : searchPlaceholder}
            </span>
            <svg
              className={`w-5 h-5 text-secondary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            className="absolute z-[99999] w-full mt-1 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-lg max-h-80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {enableSearch && (
              <div className="p-3 border-b border-secondary-200 dark:border-secondary-600">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border-secondary-300 dark:border-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400"
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {renderCountyList(processedCounties, value, handleCountySelect, searchQuery, showPopularFirst, popularCounties, noResultsText)}
            </div>
          </div>
        )}

        {renderHelpText(question, showError)}
        {renderErrors(errorId, errors)}
      </div>
    );
  }

  // Desktop-optimized render
  return (
    <div ref={containerRef} className="enhanced-county-selector-desktop relative">
      {renderLabelSection(question, id, descId)}

      {renderDesktopStateContext(stateName, showStateContext)}

      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={question.description ? descId : undefined}
          className={`
            w-full px-4 py-3 text-left border rounded-lg shadow-sm
            bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100
            border-secondary-300 dark:border-secondary-600
            focus:outline-none transition-all duration-200 ease-smooth
            ${showError ? 'border-error-400 ring-2 ring-error-400/20' : ''}
            ${isFocused ? 'ring-2 ring-primary-400/20 border-primary-400' : ''}
            ${!showError && !isFocused ? 'hover:border-secondary-400 dark:hover:border-secondary-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={selectedCounty ? 'text-secondary-900 dark:text-secondary-100' : 'text-secondary-500'}>
              {selectedCounty ? selectedCounty.label : searchPlaceholder}
            </span>
            <svg
              className={`w-5 h-5 text-secondary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-[99999] w-full mt-1 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-lg"
            style={{ maxHeight }}
            onClick={(e) => e.stopPropagation()}
          >
            {enableSearch && (
              <div className="p-3 border-b border-secondary-200 dark:border-secondary-600">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border-secondary-300 dark:border-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {renderCountyList(processedCounties, value, handleCountySelect, searchQuery, showPopularFirst, popularCounties, noResultsText)}
            </div>
          </div>
        )}
      </div>

      {renderHelpText(question, showError)}
      {renderErrors(errorId, errors)}
    </div>
  );
};

EnhancedCountySelector.displayName = 'EnhancedCountySelector';
