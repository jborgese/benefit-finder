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
  // COMPREHENSIVE DEBUG LOGGING
  console.log('🔍 EnhancedCountySelector: Component Rendered', {
    questionId: question.id,
    questionText: question.text,
    selectedState,
    value,
    hasError: !!error,
    disabled,
    enableSearch,
    searchPlaceholder
  });

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
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const deviceInfo = useDeviceDetection();

  // Reset touched state when question changes
  useEffect(() => {
    setIsTouched(false);
    setHasUserInteracted(false);
  }, [question.id]);

  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Convert error to array format
  const errors: string[] = (() => {
    if (Array.isArray(error)) return error;
    if (error) return [error];
    return [];
  })();

  // Get counties for the selected state
  const allCounties = useMemo(() => {
    console.log('🔍 EnhancedCountySelector: Getting counties for state', {
      selectedState,
      hasSelectedState: !!selectedState
    });

    if (!selectedState) {
      console.log('🔍 EnhancedCountySelector: No selectedState, returning empty array');
      return [];
    }

    const counties = getCountiesForState(selectedState);
    console.log('🔍 EnhancedCountySelector: Counties retrieved', {
      selectedState,
      countyCount: counties.length,
      firstFiveCounties: counties.slice(0, 5).map(c => c.label)
    });

    return counties;
  }, [selectedState]);

  // Get popular counties for the selected state
  const popularCounties = useMemo(() => {
    if (!selectedState || !showPopularFirst) return [];
    const popular = POPULAR_COUNTIES[selectedState] || [];
    return allCounties.filter(county =>
      popular.some(popularName =>
        county.label.toLowerCase().includes(popularName.toLowerCase()) ||
        popularName.toLowerCase().includes(county.label.toLowerCase())
      )
    );
  }, [selectedState, allCounties, showPopularFirst]);

  // Process counties based on search and configuration
  const processedCounties = useMemo(() => {
    console.log('🔍 EnhancedCountySelector: Processing counties', {
      searchQuery,
      searchQueryTrimmed: searchQuery.trim(),
      allCountiesLength: allCounties.length,
      selectedState,
      hasSearchQuery: !!searchQuery.trim()
    });

    let counties = allCounties;

    // Filter by search query
    if (searchQuery.trim()) {
      console.log('🔍 EnhancedCountySelector: Filtering by search query', {
        searchQuery,
        selectedState,
        allCountiesLength: allCounties.length
      });

      if (!selectedState) {
        console.warn('🔍 EnhancedCountySelector: No selectedState provided, cannot search counties');
        return [];
      }

      const searchResults = searchCounties(selectedState, searchQuery);
      console.log('🔍 EnhancedCountySelector: Search results', {
        selectedState,
        searchQuery,
        resultsCount: searchResults.length,
        results: searchResults.map(c => c.label)
      });

      counties = searchResults;
    }

    // Sort by priority if enabled
    if (showPopularFirst && !searchQuery.trim()) {
      const popular = popularCounties;
      const other = counties.filter(county =>
        !popular.some(popularCounty => popularCounty.value === county.value)
      );
      return [...popular, ...other.sort((a, b) => a.label.localeCompare(b.label))];
    }

    const finalCounties = counties.sort((a, b) => a.label.localeCompare(b.label));

    console.log('🔍 EnhancedCountySelector: Final processed counties', {
      finalCount: finalCounties.length,
      finalCounties: finalCounties.map(c => c.label)
    });

    return finalCounties;
  }, [allCounties, searchQuery, selectedState, showPopularFirst, popularCounties]);

  const selectedCounty = allCounties.find(county => county.value === value);
  const stateName = selectedState ? getStateName(selectedState) : null;

  const handleToggle = (): void => {
    if (!disabled && selectedState) {
      setIsOpen(!isOpen);
      if (!isOpen && enableSearch) {
        // Focus search input when opening
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
    // Delay to allow for option clicks
    setTimeout(() => {
      setIsFocused(false);
      // Only close if not clicking on dropdown content
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
    console.log('🔍 EnhancedCountySelector: Search input changed', {
      newSearchQuery,
      previousSearchQuery: searchQuery,
      selectedState,
      isOpen
    });

    setSearchQuery(newSearchQuery);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
            Please select a state first to see available counties
          </div>
        </div>
      </div>
    );
  }

  // Mobile-optimized render
  if (mobileOptimized || deviceInfo.isMobile) {
    return (
      <div ref={containerRef} className={`enhanced-county-selector-mobile`}>
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

        {showStateContext && stateName && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">State:</span> {stateName}
            </p>
          </div>
        )}

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
              {processedCounties.length > 0 ? (
                <>
                  {showPopularFirst && !searchQuery && popularCounties.length > 0 && (
                    <div className="px-3 py-2 text-xs font-semibold text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 uppercase tracking-wide">
                      Popular Counties
                    </div>
                  )}
                  {processedCounties.map((county) => {
                    const isPopular = popularCounties.some(p => p.value === county.value);
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
                  })}
                </>
              ) : (
                <div className="px-3 py-4 text-center text-secondary-500 dark:text-secondary-400">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm">{noResultsText}</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {question.helpText && !showError && (
          <p className="mt-2 text-xs text-gray-500 dark:text-secondary-400">
            {question.helpText}
          </p>
        )}

        {showError && (
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
        )}
      </div>
    );
  }

  // Desktop-optimized render
  return (
    <div ref={containerRef} className={`enhanced-county-selector-desktop relative`}>
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

      {showStateContext && stateName && (
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
      )}

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
              {processedCounties.length > 0 ? (
                <>
                  {showPopularFirst && !searchQuery && popularCounties.length > 0 && (
                    <div className="px-3 py-2 text-xs font-semibold text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 uppercase tracking-wide">
                      Popular Counties
                    </div>
                  )}
                  {processedCounties.map((county) => {
                    const isPopular = popularCounties.some(p => p.value === county.value);
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
                  })}
                </>
              ) : (
                <div className="px-3 py-4 text-center text-secondary-500 dark:text-secondary-400">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm">{noResultsText}</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {question.helpText && !showError && (
        <p className="mt-2 text-xs text-gray-500 dark:text-secondary-400">
          {question.helpText}
        </p>
      )}

      {showError && (
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
      )}
    </div>
  );
};

EnhancedCountySelector.displayName = 'EnhancedCountySelector';
