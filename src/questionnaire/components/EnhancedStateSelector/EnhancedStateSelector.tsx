/**
 * Enhanced State Selector Component
 *
 * Advanced state selection with search, popular states first,
 * geographic grouping, and mobile optimization.
 */

import React, { useState, useId, useMemo, useRef, useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useQuestionFlowStore } from '../../store';
import type { QuestionContext } from '../../types';
import { US_STATES_ENHANCED } from './data';
import type { EnhancedStateSelectorProps } from './types';
import { processLocationResult, createStateGroups } from './utils';
import { MobileStateSelector } from './MobileStateSelector';
import { DesktopStateSelector } from './DesktopStateSelector';

export const EnhancedStateSelector: React.FC<EnhancedStateSelectorProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  autoFocus = false,
  placeholder = 'Search for your state...',
  showPopularFirst = true,
  groupByRegion = false,
  enableSearch = true,
  mobileOptimized = false,
  enableAutoDetection = false,
  showPopulation = false,
  maxHeight = '300px',
  onEnterKey,
}) => {
  // DEBUG: Log component mount immediately (only in dev mode)
  if (import.meta.env.DEV) {
    console.log('[EnhancedStateSelector] Component mounting', {
      questionId: question.id,
      questionText: question.text,
      questionDescription: question.description,
      inputType: question.inputType,
      fieldName: question.fieldName,
    });
  }

  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedCoordsRef = useRef<string | null>(null);

  // Resolve question text if it's a function
  const resolvedQuestionText = useMemo(() => {
    if (typeof question.text === 'function') {
      // If text is a function, we need context - but EnhancedStateSelector doesn't receive context
      // This should have been resolved by the Question component already
      console.warn('[EnhancedStateSelector] Question text is a function but no context provided', {
        questionId: question.id,
      });
      return question.text({} as QuestionContext);
    }
    return question.text || '';
  }, [question]);

  // Resolve question description if it's a function
  const resolvedQuestionDescription = useMemo(() => {
    if (typeof question.description === 'function') {
      console.warn('[EnhancedStateSelector] Question description is a function but no context provided', {
        questionId: question.id,
      });
      return question.description({} as QuestionContext);
    }
    return question.description ?? undefined;
  }, [question]);

  // Comprehensive debugging for question rendering (only in dev mode)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[EnhancedStateSelector] Component rendered', {
        questionId: question.id,
        questionFieldName: question.fieldName,
        questionText: question.text,
        questionTextType: typeof question.text,
        questionDescription: question.description,
        questionDescriptionType: typeof question.description,
        hasText: Boolean(question.text),
        hasDescription: Boolean(question.description),
        textLength: typeof question.text === 'string' ? question.text.length : 0,
        descriptionLength: typeof question.description === 'string' ? question.description.length : 0,
        questionRequired: question.required,
        value,
        disabled,
        className,
        resolvedQuestionText,
        resolvedQuestionDescription,
        mobileOptimized,
      });
    }
  }, [question, value, disabled, className, resolvedQuestionText, resolvedQuestionDescription, mobileOptimized]);

  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedState, setDetectedState] = useState<string | null>(null);
  const [_highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const store = useQuestionFlowStore();

  // Use refs to store stable references to prevent useEffect loops
  const onChangeRef = useRef(onChange);
  const storeRef = useRef(store);

  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    storeRef.current = store;
  }, [onChange, store]);

  const {
    coordinates,
    isLoading: isLocationLoading,
    error: locationError,
    isSupported,
    hasPermission,
    getCurrentPosition,
    clearLocation,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
  });

  // Debug state changes (only in dev mode to reduce overhead)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 State change:', { locationDetected, hasRequestedLocation, coordinates: !!coordinates });
    }
  }, [locationDetected, hasRequestedLocation, coordinates]);

  // Debug coordinates changes (only in dev mode to reduce overhead)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🌍 Coordinates changed:', {
        hasCoordinates: !!coordinates,
        lat: coordinates?.latitude,
        lon: coordinates?.longitude,
        locationDetected
      });
    }
  }, [coordinates, locationDetected]);

  // Auto-detect user's state when component mounts
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 EnhancedStateSelector: Auto-detection check', {
        enableAutoDetection,
        hasRequestedLocation,
        isSupported,
        hasPermission,
        questionId: question.id,
        fieldName: question.fieldName
      });
    }

    if (enableAutoDetection && !hasRequestedLocation && isSupported && hasPermission !== false) {
      if (import.meta.env.DEV) {
        console.log('🚀 Starting location detection...');
      }
      setHasRequestedLocation(true);
      getCurrentPosition();
    }

  }, [enableAutoDetection, hasRequestedLocation, isSupported, hasPermission, question.id, question.fieldName]);

  // Handle location detection result
  useEffect(() => {
    // Early return if conditions aren't met - prevents unnecessary processing
    if (!coordinates || locationDetected || detectedState) {
      return;
    }

    // Use a ref to track if we've already processed these coordinates
    const coordsKey = `${coordinates.latitude}-${coordinates.longitude}`;

    if (lastProcessedCoordsRef.current === coordsKey) {
      return; // Already processed these coordinates
    }

    if (import.meta.env.DEV) {
      console.log('DEBUG: Coordinates useEffect triggered', { coordinates, locationDetected, value, detectedState });
    }

    lastProcessedCoordsRef.current = coordsKey;

    // Use refs to avoid dependency on onChange/store which might change
    processLocationResult(
      coordinates,
      detectedState,
      String(value ?? ''),
      [onChangeRef.current] as const,
      [storeRef.current] as const,
      setDetectedState,
      setLocationDetected
    );
  }, [coordinates, detectedState, value, locationDetected]);

  // Handle manual state changes after location detection
  useEffect(() => {
    if (locationDetected && detectedState && value !== detectedState) {
      // User manually changed state after location detection
      if (import.meta.env.DEV) {
        console.log('User manually changed state after location detection. County may need to be cleared.');
      }
      setLocationDetected(false); // Reset location detection state
      setDetectedState(null); // Clear detected state
    }
  }, [locationDetected, detectedState, value]);

  // Handle location permission denial - only after we've confirmed it's permanently denied
  // Don't set locationDetected prematurely as it blocks coordinate processing
  useEffect(() => {
    // Only mark as detected if permission is definitively denied AND we have an error
    // This prevents premature blocking when hasPermission is temporarily false during initial request
    if (hasPermission === false && locationError && !locationDetected && !coordinates) {
      setLocationDetected(true); // Prevent repeated requests only if definitely denied
    }
  }, [hasPermission, locationError, locationDetected, coordinates]);

  // Reset touched state when question changes
  useEffect(() => {
    setIsTouched(false);
    setHasUserInteracted(false);
  }, [question.id]);

  // Convert error to array format (must be declared before showError calculation)
  const errors: string[] = (() => {
    if (Array.isArray(error)) { return error; }
    if (error) { return [error]; }
    return [];
  })();

  // Calculate error state (must be declared before useEffect that uses it)
  const hasError = Boolean(error);
  const showError = hasError && isTouched;

  // Debug validation state
  useEffect(() => {
    if (import.meta.env.DEV) {
      const isValid = !question.required || (value && String(value).length > 0);
      console.log('[EnhancedStateSelector] Validation state', {
        questionId: question.id,
        value,
        required: question.required,
        isTouched,
        hasUserInteracted,
        hasError: Boolean(error),
        showError,
        isValid,
        errorMessages: errors,
      });
    }
  }, [question.id, question.required, value, isTouched, hasUserInteracted, error, showError, errors]);

  // Process states based on configuration
  const processedStates = useMemo(() => {
    let states = [...US_STATES_ENHANCED];

    // Filter by search query
    if (searchQuery) {
      states = states.filter(state =>
        state.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        state.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by priority if enabled
    if (showPopularFirst) {
      states.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') { return -1; }
        if (b.priority === 'high' && a.priority !== 'high') { return 1; }
        return a.label.localeCompare(b.label);
      });
    }

    return states;
  }, [searchQuery, showPopularFirst]);

  // Group states by region if enabled
  const groupedStates = useMemo(() => {
    if (!groupByRegion) { return null; }
    return createStateGroups(processedStates);
  }, [processedStates, groupByRegion]);

  const selectedState = US_STATES_ENHANCED.find(state => state.value === value);

  const handleToggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && enableSearch) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Focus search input when opening
        timeoutRef.current = setTimeout(() => {
          searchInputRef.current?.focus();
          timeoutRef.current = null;
        }, 100);
      }
    }
  };

  const handleStateSelect = (stateValue: string): void => {
    if (import.meta.env.DEV) {
      console.log('[EnhancedStateSelector] State selected', {
        questionId: question.id,
        stateValue,
        previousValue: value,
        required: question.required,
      });
    }

    setHasUserInteracted(true);
    setIsTouched(true); // Mark as touched when user selects a state
    onChange(stateValue);
    setIsOpen(false);
    setSearchQuery('');

    // Trigger validation immediately after selection
    if (import.meta.env.DEV) {
      console.log('[EnhancedStateSelector] Validation triggered after selection', {
        questionId: question.id,
        stateValue,
        isValid: Boolean(stateValue && stateValue.length > 0),
      });
    }
  };

  const handleBlur = (): void => {
    // Clear any existing blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    // Delay to allow for option clicks
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      // Only close if not clicking on dropdown content and search input is not focused
      const isSearchInputFocused = searchInputRef.current === document.activeElement;
      const isWithinContainer = containerRef.current?.contains(document.activeElement);
      if (!isWithinContainer && !isSearchInputFocused) {
        setIsOpen(false);
      }
      if (hasUserInteracted || value) {
        setIsTouched(true);
        if (import.meta.env.DEV) {
          console.log('[EnhancedStateSelector] Field blurred and marked as touched', {
            questionId: question.id,
            value,
            hasUserInteracted,
            required: question.required,
            isValid: Boolean(value && String(value).length > 0),
          });
        }
      }
      blurTimeoutRef.current = null;
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
    setSearchQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleClearSearch = (e?: React.MouseEvent<HTMLButtonElement>): void => {
    e?.stopPropagation(); // Prevent event from bubbling and closing dropdown
    e?.preventDefault(); // Prevent default behavior
    // Clear any existing blur timeout to prevent dropdown from closing
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setSearchQuery('');
    // Ensure dropdown stays open when clearing search
    setIsOpen(true);
    // Focus the search input after clearing
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleLocationRequest = (): void => {
    if (isLocationLoading) { return; }

    clearLocation();
    setLocationDetected(false);
    setHasRequestedLocation(true);
    getCurrentPosition();
  };

  const LOCATION_DETECTION_AVAILABLE = enableAutoDetection && isSupported && hasPermission !== false && !locationDetected;
  const showLocationButton = LOCATION_DETECTION_AVAILABLE;
  const showLocationError = Boolean(locationError && hasRequestedLocation);

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
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };
  }, []);

  // Use extracted components for cleaner code
  const commonProps = {
    containerRef,
    className,
    question,
    questionText: resolvedQuestionText,
    questionDescription: resolvedQuestionDescription,
    id,
    descId,
    placeholder,
    selectedState,
    isOpen,
    isFocused,
    showError,
    disabled,
    autoFocus,
    onToggle: handleToggle,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    enableSearch,
    searchInputRef,
    searchQuery,
    onSearchChange: handleSearchChange,
    onClearSearch: handleClearSearch,
    groupedStates,
    processedStates,
    value: String(value ?? ''),
    onStateSelect: handleStateSelect,
    showPopulation,
    helpText: question.helpText,
    errorId,
    errors,
    showLocationButton,
    isLocationLoading,
    hasRequestedLocation,
    onLocationRequest: handleLocationRequest,
    showLocationError,
    locationError,
    locationDetected,
    coordinates
  };

  if (mobileOptimized) {
    return <MobileStateSelector {...commonProps} />;
  }

  return <DesktopStateSelector {...commonProps} maxHeight={maxHeight} />;
};

EnhancedStateSelector.displayName = 'EnhancedStateSelector';
