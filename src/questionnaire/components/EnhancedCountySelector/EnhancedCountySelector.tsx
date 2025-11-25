/**
 * Enhanced County Selector Component
 *
 * Advanced county selection with search, geographic context,
 * popular counties first, and mobile optimization.
 */

import React, { useId, useRef } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import type { EnhancedCountySelectorProps } from './types';
import { useCountySelectorState } from './stateHook';
import { useCountySelectorData } from './dataHook';
import { useClickOutside, normalizeErrors } from './utils';
import { MobileCountySelector } from './MobileCountySelector';
import { DesktopCountySelector } from './DesktopCountySelector';
import { LoadingStateSelector } from './LoadingStateSelector';

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

  const deviceInfo = useDeviceDetection();
  const hasError = Boolean(error);
  const errors: string[] = normalizeErrors(error);

  // Use custom hooks for state and data management
  const {
    isOpen,
    isFocused,
    isTouched,
    searchQuery,
    setIsOpen,
    setSearchQuery,
    handleToggle,
    handleCountySelect,
    handleBlur,
    handleFocus,
    handleKeyDown,
    handleSearchChange
  } = useCountySelectorState(question, disabled, selectedState, enableSearch, searchInputRef);

  const {
    popularCounties,
    processedCounties,
    selectedCounty,
    stateName
  } = useCountySelectorData(selectedState, showPopularFirst, searchQuery, value);

  const showError = hasError && isTouched;

  // Handle click outside
  useClickOutside(containerRef, isOpen, setIsOpen, setSearchQuery);

  // Show loading state if no state selected
  if (!selectedState) {
    return <LoadingStateSelector question={question} mobileOptimized={mobileOptimized} />;
  }

  // Mobile-optimized render
  if (mobileOptimized || deviceInfo.isMobile) {
    return (
      <div ref={containerRef}>
        <MobileCountySelector
          question={question}
          id={id}
          descId={descId}
          errorId={errorId}
          stateName={stateName}
          showStateContext={showStateContext}
          handleToggle={handleToggle}
          handleBlur={handleBlur}
          handleFocus={handleFocus}
          handleKeyDown={handleKeyDown}
          onEnterKey={onEnterKey}
          disabled={disabled}
          autoFocus={autoFocus}
          isOpen={isOpen}
          isFocused={isFocused}
          selectedCounty={selectedCounty}
          searchPlaceholder={searchPlaceholder}
          enableSearch={enableSearch}
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          processedCounties={processedCounties}
          value={value}
          handleCountySelect={handleCountySelect}
          onChange={onChange}
          showPopularFirst={showPopularFirst}
          popularCounties={popularCounties}
          noResultsText={noResultsText}
          showError={showError}
          errors={errors}
          dropdownRef={dropdownRef}
        />
      </div>
    );
  }

  // Desktop-optimized render
  return (
    <div ref={containerRef}>
      <DesktopCountySelector
        question={question}
        id={id}
        descId={descId}
        errorId={errorId}
        stateName={stateName}
        showStateContext={showStateContext}
        handleToggle={handleToggle}
        handleBlur={handleBlur}
        handleFocus={handleFocus}
        handleKeyDown={handleKeyDown}
        onEnterKey={onEnterKey}
        disabled={disabled}
        autoFocus={autoFocus}
        isOpen={isOpen}
        isFocused={isFocused}
        selectedCounty={selectedCounty}
        searchPlaceholder={searchPlaceholder}
        enableSearch={enableSearch}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        processedCounties={processedCounties}
        value={value}
        handleCountySelect={handleCountySelect}
        onChange={onChange}
        showPopularFirst={showPopularFirst}
        popularCounties={popularCounties}
        noResultsText={noResultsText}
        maxHeight={maxHeight}
        showError={showError}
        errors={errors}
        dropdownRef={dropdownRef}
      />
    </div>
  );
};

EnhancedCountySelector.displayName = 'EnhancedCountySelector';
