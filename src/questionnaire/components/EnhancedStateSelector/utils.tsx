/**
 * Utility functions for EnhancedStateSelector
 */

import React from 'react';
import { coordinatesToState, coordinatesToCounty } from '../../hooks/useGeolocation';
import type { StateData } from './data';
import type { StoreWithAnswerQuestion } from './types';
import {
  STATE_BUTTON_BASE_CLASSES,
  REGION_HEADER_CLASSES,
  POPULAR_BADGE_CLASSES,
  POPULAR_LABEL,
  PEOPLE_TEXT,
} from './constants';

export const debugLog = (message: string, data?: unknown): void => {
  if (import.meta.env.DEV) {
    console.log(message, data ?? '');
  }
};

export const handleCountyDetection = (
  coordinates: GeolocationCoordinates,
  store: readonly [StoreWithAnswerQuestion]
): void => {
  const detectedCounty = coordinatesToCounty(coordinates);
  if (detectedCounty) {
    debugLog(`🏘️ Detected county: ${detectedCounty}`);
    store[0].answerQuestion('county', 'county', detectedCounty);
  }
};

export const handleStateUpdate = (
  detectedStateCode: string,
  value: string,
  onChange: readonly [(value: string) => void],
  setDetectedState: (state: string | null) => void,
  setLocationDetected: (detected: boolean) => void,
  coordinates: GeolocationCoordinates,
  store: readonly [StoreWithAnswerQuestion]
): void => {
  debugLog(`🔄 Updating state from "${value}" to "${detectedStateCode}"`);
  onChange[0](detectedStateCode);
  setDetectedState(detectedStateCode);
  setLocationDetected(true);
  handleCountyDetection(coordinates, store);
};

export const processLocationResult = (
  coordinates: GeolocationCoordinates | null,
  detectedState: string | null,
  value: string,
  onChange: readonly [(value: string) => void],
  store: readonly [StoreWithAnswerQuestion],
  setDetectedState: (state: string | null) => void,
  setLocationDetected: (detected: boolean) => void
): void => {
  if (!coordinates || detectedState) {
    return;
  }

  const detectedStateCode = coordinatesToState(coordinates);
  debugLog('🌍 Location detected:', {
    coordinates: { lat: coordinates.latitude, lon: coordinates.longitude },
    detectedStateCode,
    currentValue: value
  });

  if (detectedStateCode && detectedStateCode !== value) {
    handleStateUpdate(detectedStateCode, value, onChange, setDetectedState, setLocationDetected, coordinates, store);
  } else if (detectedStateCode === value) {
    debugLog(`✅ State already matches detected state: ${detectedStateCode}`);
    setLocationDetected(true);
  } else {
    debugLog(`❌ No state detected from coordinates`);
  }
};

export const createStateGroups = (
  states: StateData[]
): Array<{ region: string; states: StateData[] }> => {
  const groups = new Map<string, StateData[]>();

  for (const state of states) {
    const { region } = state;
    if (!groups.has(region)) {
      groups.set(region, []);
    }
    const regionStates = groups.get(region);
    if (regionStates) {
      regionStates.push(state);
    }
  }

  return Array.from(groups.entries()).map(([region, regionStates]) => ({
    region,
    states: regionStates.sort((a, b) => a.label.localeCompare(b.label))
  }));
};

export const createStateButtonClasses = (isSelected: boolean, baseClasses: string): string => {
  const selectedClasses = isSelected
    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
    : 'text-secondary-900 dark:text-secondary-100';
  return `${baseClasses} ${selectedClasses}`;
};

export const renderStateButtonContent = (
  state: StateData,
  showPopulation: boolean
): React.ReactNode => (
  <>
    <div className="flex items-center justify-between">
      <span className="font-medium">{state.label}</span>
      {state.priority === 'high' && (
        <span className={POPULAR_BADGE_CLASSES}>{POPULAR_LABEL}</span>
      )}
    </div>
    {showPopulation && (
      <div className="text-xs text-secondary-500 dark:text-secondary-400">
        {state.population.toLocaleString()} {PEOPLE_TEXT}
      </div>
    )}
  </>
);

export const renderStateList = (
  states: StateData[],
  value: string,
  onStateSelect: (stateValue: string) => void,
  showPopulation: boolean
): React.ReactNode => (
  states.map((state) => (
    <button
      key={state.value}
      type="button"
      onClick={() => onStateSelect(state.value)}
      className={createStateButtonClasses(value === state.value, STATE_BUTTON_BASE_CLASSES)}
    >
      {renderStateButtonContent(state, showPopulation)}
    </button>
  ))
);

export const renderGroupedStates = (
  groupedStates: Array<{ region: string; states: StateData[] }>,
  value: string,
  onStateSelect: (stateValue: string) => void,
  showPopulation: boolean
): React.ReactNode => (
  groupedStates.map(({ region, states }) => (
    <div key={region}>
      <div className={REGION_HEADER_CLASSES}>
        {region}
      </div>
      {renderStateList(states, value, onStateSelect, showPopulation)}
    </div>
  ))
);

export const renderStateListContent = (
  processedStates: StateData[],
  groupedStates: Array<{ region: string; states: StateData[] }> | null,
  value: string,
  onStateSelect: (stateValue: string) => void,
  showPopulation: boolean
): React.ReactNode => {
  if (processedStates.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-secondary-500 dark:text-secondary-400">
        <p className="text-sm">No states found</p>
      </div>
    );
  }

  if (groupedStates) {
    return renderGroupedStates(groupedStates, value, onStateSelect, showPopulation);
  }

  return renderStateList(processedStates, value, onStateSelect, showPopulation);
};
