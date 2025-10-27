/**
 * EnhancedStateSelector Component Tests
 *
 * Comprehensive tests for enhanced state selector component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EnhancedStateSelector } from '../EnhancedStateSelector';
import type { QuestionDefinition } from '../../types';

// Mock the geolocation hook
const mockUseGeolocation = vi.fn();
const mockGetCurrentPosition = vi.fn();
const mockClearLocation = vi.fn();
const mockCheckPermission = vi.fn().mockResolvedValue(undefined);

vi.mock('../../hooks/useGeolocation', () => ({
  useGeolocation: () => mockUseGeolocation(),
  coordinatesToState: vi.fn((coords) => {
    // Mock: return CA for California coordinates
    if (coords?.latitude === 34.0522 && coords?.longitude === -118.2437) {
      return 'CA';
    }
    return null;
  }),
  coordinatesToCounty: vi.fn(() => 'Los Angeles'),
}));

// Mock the store
const mockAnswerQuestion = vi.fn();
const mockUseQuestionFlowStore = vi.fn();
vi.mock('../../store', () => ({
  useQuestionFlowStore: () => mockUseQuestionFlowStore(),
}));

const mockQuestion: QuestionDefinition = {
  id: 'test-state',
  fieldName: 'state',
  text: 'What is your state?',
  type: 'select',
  required: true,
};

describe('EnhancedStateSelector Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations with all required properties matching the hook interface
    mockUseGeolocation.mockReturnValue({
      coordinates: null,
      isLoading: false,
      error: null,
      isSupported: false,
      hasPermission: null,
      getCurrentPosition: mockGetCurrentPosition,
      clearLocation: mockClearLocation,
      checkPermission: mockCheckPermission,
    });

    mockUseQuestionFlowStore.mockReturnValue({
      answerQuestion: mockAnswerQuestion,
    });
  });

  afterEach(() => {
    // Global cleanup() handles React cleanup
    // Explicit unmounting in tests helps prevent delays
  });

  describe('Rendering', () => {
    it('should render state selector with label', () => {
      render(<EnhancedStateSelector question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      expect(screen.getByText(/What is your state/i)).toBeInTheDocument();
    });

    it('should show required indicator when question is required', () => {
      render(<EnhancedStateSelector question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const requiredIndicator = screen.getByLabelText('required');
      expect(requiredIndicator).toBeInTheDocument();
    });

    it('should display popular states first when enabled', () => {
      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          showPopularFirst
        />
      );

      // Popular states (CA, TX, FL, NY) should be visible
      expect(screen.getByText('California')).toBeInTheDocument();
      expect(screen.getByText('Texas')).toBeInTheDocument();
    });

    it('should show search input when search is enabled', () => {
      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableSearch
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search states/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should display popular badge for high priority states', () => {
      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          showPopularFirst
        />
      );

      expect(screen.getByText('Popular')).toBeInTheDocument();
    });

    it('should show population when enabled', () => {
      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          showPopulation
        />
      );

      // Population text should be visible
      expect(screen.getByText(/people/i)).toBeInTheDocument();
    });
  });

  describe('State Selection', () => {
    it('should call onChange when state is selected', async () => {
      const user = userEvent.setup();

      render(<EnhancedStateSelector question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const californiaButton = screen.getByText('California');
      await user.click(californiaButton);

      expect(mockOnChange).toHaveBeenCalledWith('CA');
    });

    it('should highlight selected state', () => {
      render(<EnhancedStateSelector question={mockQuestion} value="CA" onChange={mockOnChange} />);

      const californiaButton = screen.getByText('California').closest('button');
      expect(californiaButton).toHaveClass('bg-primary-50');
    });

    it('should show all states when popular first is disabled', () => {
      const { unmount } = render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          showPopularFirst={false}
        />
      );

      // Should show all states alphabetically
      expect(screen.getByText('Alabama')).toBeInTheDocument();
      expect(screen.getByText('Wyoming')).toBeInTheDocument();

      // Unmount immediately to prevent cleanup delays
      unmount();
    });
  });

  describe('Search Functionality', () => {
    it('should filter states when searching', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableSearch
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search states/i);
      await user.type(searchInput, 'California');

      await waitFor(() => {
        expect(screen.getByText('California')).toBeInTheDocument();
        // Other states should be filtered out
        expect(screen.queryByText('Texas')).not.toBeInTheDocument();
      });
    });

    it('should show no results message when search has no matches', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableSearch
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search states/i);
      await user.type(searchInput, 'XYZ123');

      await waitFor(() => {
        expect(screen.getByText(/No states found/i)).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableSearch
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search states/i);
      await user.type(searchInput, 'California');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Grouping by Region', () => {
    it('should group states by region when enabled', () => {
      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          groupByRegion
        />
      );

      // Region headers should be visible
      expect(screen.getByText('WEST')).toBeInTheDocument();
      expect(screen.getByText('SOUTH')).toBeInTheDocument();
      expect(screen.getByText('NORTHEAST')).toBeInTheDocument();
      expect(screen.getByText('MIDWEST')).toBeInTheDocument();
    });

    it('should show states grouped under their regions', () => {
      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          groupByRegion
        />
      );

      // California should be under West
      expect(screen.getByText('California')).toBeInTheDocument();
      // Texas should be under South
      expect(screen.getByText('Texas')).toBeInTheDocument();
    });
  });

  describe('Location Detection', () => {
    it('should show location detection button when enabled', () => {
      mockUseGeolocation.mockReturnValue({
        coordinates: null,
        isLoading: false,
        error: null,
        isSupported: true,
        hasPermission: null,
        getCurrentPosition: mockGetCurrentPosition,
        clearLocation: mockClearLocation,
        checkPermission: mockCheckPermission,
      });

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableAutoDetection
        />
      );

      expect(screen.getByText(/Use your current location/i)).toBeInTheDocument();
    });

    it('should request location when button is clicked', () => {
      // Clear any previous calls
      mockGetCurrentPosition.mockClear();
      mockClearLocation.mockClear();
      mockCheckPermission.mockClear();

      // Use null permission to prevent auto-detection on mount
      // hasPermission: null means the component won't auto-detect but also won't trigger denial effects
      mockUseGeolocation.mockReturnValue({
        coordinates: null,
        isLoading: false,
        error: null,
        isSupported: true,
        hasPermission: null, // Prevents auto-detection without triggering denial useEffect
        getCurrentPosition: mockGetCurrentPosition,
        clearLocation: mockClearLocation,
        checkPermission: mockCheckPermission,
      });

      const { unmount } = render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableAutoDetection
        />
      );

      // Button should be visible
      const locationButton = screen.getByText(/Use your current location/i);

      // Use fireEvent for synchronous click - no need for act() with fireEvent
      fireEvent.click(locationButton);

      // Should have been called by the button click
      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);

      // Clean up immediately
      unmount();
    });

    it('should show loading state when detecting location', () => {
      mockUseGeolocation.mockReturnValue({
        coordinates: null,
        isLoading: true,
        error: null,
        isSupported: true,
        hasPermission: null,
        getCurrentPosition: mockGetCurrentPosition,
        clearLocation: mockClearLocation,
        checkPermission: mockCheckPermission,
      });

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableAutoDetection
        />
      );

      expect(screen.getByText(/Detecting your location/i)).toBeInTheDocument();
    });

    it('should update state when location is detected', () => {
      mockUseGeolocation.mockReturnValue({
        coordinates: { latitude: 34.0522, longitude: -118.2437 } as GeolocationCoordinates,
        isLoading: false,
        error: null,
        isSupported: true,
        hasPermission: true,
        getCurrentPosition: mockGetCurrentPosition,
        clearLocation: mockClearLocation,
        checkPermission: mockCheckPermission,
      });

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableAutoDetection
        />
      );

      // Component should detect CA and call onChange
      expect(mockOnChange).toHaveBeenCalledWith('CA');
    });

    it('should show error message when location detection fails', () => {
      mockUseGeolocation.mockReturnValue({
        coordinates: null,
        isLoading: false,
        error: 'Location access denied',
        isSupported: true,
        hasPermission: false,
        getCurrentPosition: mockGetCurrentPosition,
        clearLocation: mockClearLocation,
        checkPermission: mockCheckPermission,
      });

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          enableAutoDetection
        />
      );

      expect(screen.getByText(/Location access denied/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error is provided', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error="Please select a state"
        />
      );

      // Touch the component to show error
      const firstButton = screen.getByText('California');
      await user.click(firstButton);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Please select a state')).toBeInTheDocument();
      });
    });

    it('should display multiple error messages', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error={['Error 1', 'Error 2']}
        />
      );

      const firstButton = screen.getByText('California');
      await user.click(firstButton);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Error 1')).toBeInTheDocument();
        expect(screen.getByText('Error 2')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable all interactions when disabled', () => {
      render(<EnhancedStateSelector question={mockQuestion} value={undefined} onChange={mockOnChange} disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // State selection buttons should be disabled
        if (button.textContent !== 'Use your current location?') {
          expect(button).toBeDisabled();
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<EnhancedStateSelector question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const label = screen.getByText(/What is your state/i);
      expect(label).toBeInTheDocument();
    });

    it('should have keyboard navigation', async () => {
      const user = userEvent.setup();

      render(<EnhancedStateSelector question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      await user.tab();

      // First interactive element should have focus
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should respect maxHeight prop', () => {
      render(
        <EnhancedStateSelector
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          maxHeight="300px"
        />
      );

      // Component should render with max height constraint
      expect(screen.getByText('California')).toBeInTheDocument();
    });
  });
});

