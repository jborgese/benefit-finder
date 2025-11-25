/**
 * Shared Props for State Selector Components
 */

import type { QuestionDefinition } from '../../types';
import type { StateData } from './data';

export interface StateSelectorCommonProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className: string;
  question: QuestionDefinition;
  questionText: string;
  questionDescription: string | undefined;
  id: string;
  descId: string;
  placeholder: string;
  selectedState: StateData | undefined;
  isOpen: boolean;
  isFocused: boolean;
  showError: boolean;
  disabled: boolean;
  autoFocus: boolean;
  onToggle: () => void;
  onBlur: () => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  enableSearch: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  groupedStates: Array<{ region: string; states: StateData[] }> | null;
  processedStates: StateData[];
  value: string;
  onStateSelect: (stateValue: string) => void;
  showPopulation: boolean;
  helpText: string | undefined;
  errorId: string;
  errors: string[];
  showLocationButton: boolean;
  isLocationLoading: boolean;
  hasRequestedLocation: boolean;
  onLocationRequest: () => void;
  showLocationError: boolean;
  locationError: string | null | undefined;
  locationDetected: boolean;
  coordinates: GeolocationCoordinates | null;
}

export interface DesktopStateSelectorProps extends StateSelectorCommonProps {
  maxHeight: string;
}
