/**
 * CountySelectorDemo Component Tests
 *
 * Comprehensive tests for the CountySelectorDemo component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CountySelectorDemo } from '../components/CountySelectorDemo';

// Mock the EnhancedCountySelector component
vi.mock('../questionnaire/components/EnhancedCountySelector', () => ({
  EnhancedCountySelector: vi.fn(({ onChange, value, selectedState }) => (
    <div data-testid="enhanced-county-selector">
      <div data-testid="selected-state">{selectedState}</div>
      <div data-testid="selected-county">{value ?? 'None'}</div>
      <button
        data-testid="select-county-button"
        onClick={() => onChange('Los Angeles County')}
      >
        Select Los Angeles County
      </button>
      <button
        data-testid="clear-county-button"
        onClick={() => onChange(null)}
      >
        Clear Selection
      </button>
    </div>
  )),
}));

// Mock the useDeviceDetection hook
const mockDeviceInfo = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenWidth: 1024,
  screenHeight: 768,
  isTouchDevice: false,
};

const mockUseDeviceDetection = vi.fn(() => mockDeviceInfo);

vi.mock('../questionnaire/hooks/useDeviceDetection', () => ({
  useDeviceDetection: () => mockUseDeviceDetection(),
}));

describe('CountySelectorDemo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeviceDetection.mockReturnValue(mockDeviceInfo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the main title and description', () => {
      render(<CountySelectorDemo />);

      expect(screen.getByText('Enhanced County Selector Demo')).toBeInTheDocument();
      expect(screen.getByText(/Experience improved county selection/)).toBeInTheDocument();
    });

    it('should render all demo states', () => {
      render(<CountySelectorDemo />);

      // Use getAllByText to handle multiple instances
      expect(screen.getAllByText('California')).toHaveLength(2); // Button and heading
      expect(screen.getByRole('button', { name: 'Texas' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Florida' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'New York' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Georgia' })).toBeInTheDocument();
    });

    it('should render configuration options', () => {
      render(<CountySelectorDemo />);

      expect(screen.getByText('Configuration Options')).toBeInTheDocument();
      expect(screen.getByText('Popular Counties First')).toBeInTheDocument();
      expect(screen.getByText('Show State Context')).toBeInTheDocument();
      expect(screen.getByText('Enable Search')).toBeInTheDocument();
      // Use getAllByText for Mobile Optimized since it appears multiple times
      expect(screen.getAllByText('Mobile Optimized')).toHaveLength(2);
    });

    it('should render device detection information', () => {
      render(<CountySelectorDemo />);

      expect(screen.getByText('Device Detection')).toBeInTheDocument();
      expect(screen.getByText('Screen: 1024x768')).toBeInTheDocument();
      expect(screen.getByText('Device: Desktop')).toBeInTheDocument();
      expect(screen.getByText('Touch: No')).toBeInTheDocument();
    });

    it('should render features showcase sections', () => {
      render(<CountySelectorDemo />);

      expect(screen.getByText('🚀 Key Improvements')).toBeInTheDocument();
      expect(screen.getByText('📊 Performance Benefits')).toBeInTheDocument();
      expect(screen.getByText('💻 Usage Examples')).toBeInTheDocument();
      expect(screen.getByText('🏙️ Popular Counties by State')).toBeInTheDocument();
    });

    it('should show placeholder when no state is selected', () => {
      render(<CountySelectorDemo />);

      expect(screen.getByText('Please select a state above to see the county selector')).toBeInTheDocument();
      expect(screen.getByText('🗺️')).toBeInTheDocument();
    });
  });

  describe('State Selection', () => {
    it('should handle state selection and update UI', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      expect(californiaButton).toHaveClass('bg-primary-500');
      expect(screen.getByTestId('enhanced-county-selector')).toBeInTheDocument();
      expect(screen.getByTestId('selected-state')).toHaveTextContent('CA');
    });

    it('should reset county selection when state changes', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      // Select California first
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      // Select a county
      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      expect(screen.getByTestId('selected-county')).toHaveTextContent('Los Angeles County');

      // Change to Texas
      const texasButton = screen.getByRole('button', { name: 'Texas' });
      await user.click(texasButton);

      // County should be reset
      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');
    });

    it('should handle multiple state selections', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      // Select California
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);
      expect(californiaButton).toHaveClass('bg-primary-500');

      // Select Texas
      const texasButton = screen.getByRole('button', { name: 'Texas' });
      await user.click(texasButton);
      expect(texasButton).toHaveClass('bg-primary-500');
      expect(californiaButton).not.toHaveClass('bg-primary-500');
    });
  });

  describe('Configuration Options', () => {
    it('should toggle showPopularFirst configuration', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      const checkbox = screen.getByRole('checkbox', { name: 'Popular Counties First' });
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle showStateContext configuration', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      const checkbox = screen.getByRole('checkbox', { name: 'Show State Context' });
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle enableSearch configuration', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      const checkbox = screen.getByRole('checkbox', { name: 'Enable Search' });
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle mobileOptimized configuration', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      const checkbox = screen.getByRole('checkbox', { name: 'Mobile Optimized' });
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should pass configuration to EnhancedCountySelector', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      // Select a state first
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      // Toggle mobile optimization
      const mobileCheckbox = screen.getByRole('checkbox', { name: 'Mobile Optimized' });
      await user.click(mobileCheckbox);

      // Check that EnhancedCountySelector was called with correct props
      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');
      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          showPopularFirst: true,
          showStateContext: true,
          enableSearch: true,
          mobileOptimized: true, // Should be true after toggle
        }),
        expect.anything()
      );
    });
  });

  describe('Device Detection', () => {
    it('should display mobile device information', () => {
      mockUseDeviceDetection.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 375,
        screenHeight: 667,
        isTouchDevice: true,
      });

      render(<CountySelectorDemo />);

      expect(screen.getByText('Screen: 375x667')).toBeInTheDocument();
      expect(screen.getByText('Device: Mobile')).toBeInTheDocument();
      expect(screen.getByText('Touch: Yes')).toBeInTheDocument();
    });

    it('should display tablet device information', () => {
      mockUseDeviceDetection.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        screenWidth: 768,
        screenHeight: 1024,
        isTouchDevice: true,
      });

      render(<CountySelectorDemo />);

      expect(screen.getByText('Screen: 768x1024')).toBeInTheDocument();
      expect(screen.getByText('Device: Tablet')).toBeInTheDocument();
      expect(screen.getByText('Touch: Yes')).toBeInTheDocument();
    });

    it('should use mobile optimization when device is mobile', async () => {
      const user = userEvent.setup();
      mockUseDeviceDetection.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 375,
        screenHeight: 667,
        isTouchDevice: true,
      });

      render(<CountySelectorDemo />);

      // Select a state
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      // Check that EnhancedCountySelector was called with mobile optimization
      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');
      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          mobileOptimized: true, // Should be true because device is mobile
          maxHeight: '60vh', // Should use mobile max height
        }),
        expect.anything()
      );
    });
  });

  describe('County Selection', () => {
    it('should handle county selection and display result', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      // Select a state first
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      // Select a county
      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      // Check that selected county is displayed
      expect(screen.getByText('Selected County')).toBeInTheDocument();
      expect(screen.getAllByText('Los Angeles County')).toHaveLength(2); // Mock component and display
    });

    it('should clear county selection', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      // Select a state and county
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      // Clear the selection
      const clearCountyButton = screen.getByTestId('clear-county-button');
      await user.click(clearCountyButton);

      // Selected county section should not be visible
      expect(screen.queryByText('Selected County')).not.toBeInTheDocument();
    });
  });

  describe('Usage Examples', () => {
    it('should display code examples', () => {
      render(<CountySelectorDemo />);

      expect(screen.getByText('Basic Usage')).toBeInTheDocument();
      expect(screen.getAllByText('Mobile Optimized')).toHaveLength(2); // Configuration and usage example
      expect(screen.getByText('Full Featured')).toBeInTheDocument();

      // Check that code blocks contain expected content
      const codeBlocks = screen.getAllByRole('generic');
      const codeContent = codeBlocks
        .filter(block => block.className.includes('bg-gray-100'))
        .map(block => block.textContent);

      expect(codeContent.some(content => content.includes('EnhancedCountySelector'))).toBe(true);
    });
  });

  describe('Popular Counties Display', () => {
    it('should display popular counties for demo states', () => {
      render(<CountySelectorDemo />);

      // Use getAllByText for states that appear multiple times
      expect(screen.getAllByText('California')).toHaveLength(2);
      expect(screen.getAllByText('Texas')).toHaveLength(2); // Button and heading
      expect(screen.getAllByText('Florida')).toHaveLength(2); // Button and heading
      expect(screen.getAllByText('New York')).toHaveLength(2); // Button and heading

      // Check that popular counties are listed (some appear multiple times across states)
      expect(screen.getAllByText('Los Angeles')).toHaveLength(4); // Appears in CA, TX, FL, NY
      expect(screen.getAllByText('San Diego')).toHaveLength(4); // Appears in CA, TX, FL, NY
      expect(screen.getAllByText('Orange')).toHaveLength(4); // Appears in CA, TX, FL, NY
      expect(screen.getAllByText('Riverside')).toHaveLength(4); // Appears in CA, TX, FL, NY
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<CountySelectorDemo />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Enhanced County Selector Demo');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have proper button labels', () => {
      render(<CountySelectorDemo />);

      const stateButtons = screen.getAllByRole('button');
      const stateButtonLabels = stateButtons
        .filter(button => ['California', 'Texas', 'Florida', 'New York', 'Georgia'].includes(button.textContent || ''))
        .map(button => button.textContent);

      expect(stateButtonLabels).toContain('California');
      expect(stateButtonLabels).toContain('Texas');
    });

    it('should have proper checkbox labels', () => {
      render(<CountySelectorDemo />);

      const checkboxes = screen.getAllByRole('checkbox');
      const checkboxLabels = checkboxes.map(checkbox => {
        const label = checkbox.closest('label');
        return label?.textContent.trim() ?? '';
      });

      expect(checkboxLabels).toContain('Popular Counties First');
      expect(checkboxLabels).toContain('Show State Context');
      expect(checkboxLabels).toContain('Enable Search');
      expect(checkboxLabels).toContain('Mobile Optimized');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      const californiaButton = screen.getByRole('button', { name: 'California' });
      const texasButton = screen.getByRole('button', { name: 'Texas' });
      const floridaButton = screen.getByRole('button', { name: 'Florida' });

      // Rapidly click different states
      await user.click(californiaButton);
      await user.click(texasButton);
      await user.click(floridaButton);

      // Only the last selected state should be highlighted
      expect(floridaButton).toHaveClass('bg-primary-500');
      expect(californiaButton).not.toHaveClass('bg-primary-500');
      expect(texasButton).not.toHaveClass('bg-primary-500');
    });

    it('should handle rapid configuration changes', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      const popularFirstCheckbox = screen.getByRole('checkbox', { name: 'Popular Counties First' });
      const stateContextCheckbox = screen.getByRole('checkbox', { name: 'Show State Context' });

      // Rapidly toggle checkboxes
      await user.click(popularFirstCheckbox);
      await user.click(stateContextCheckbox);
      await user.click(popularFirstCheckbox);

      // Checkboxes should reflect final state
      expect(popularFirstCheckbox).toBeChecked();
      expect(stateContextCheckbox).not.toBeChecked();
    });

    it('should handle device detection changes', () => {
      // Test with different device configurations
      const deviceConfigs = [
        { isMobile: true, isTablet: false, isDesktop: false, screenWidth: 375, screenHeight: 667, isTouchDevice: true },
        { isMobile: false, isTablet: true, isDesktop: false, screenWidth: 768, screenHeight: 1024, isTouchDevice: true },
        { isMobile: false, isTablet: false, isDesktop: true, screenWidth: 1920, screenHeight: 1080, isTouchDevice: false },
      ];

      deviceConfigs.forEach(config => {
        mockUseDeviceDetection.mockReturnValue(config);
        const { unmount } = render(<CountySelectorDemo />);

        expect(screen.getByText(`Screen: ${config.screenWidth}x${config.screenHeight}`)).toBeInTheDocument();
        expect(screen.getByText(`Touch: ${config.isTouchDevice ? 'Yes' : 'No'}`)).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Component Integration', () => {
    it('should integrate properly with EnhancedCountySelector', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      // Select a state
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      // Verify EnhancedCountySelector is rendered with correct props
      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');
      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          question: expect.objectContaining({
            id: 'demo-county',
            text: 'What county do you live in?',
            fieldName: 'county',
            required: true,
          }),
          selectedState: 'CA',
          placeholder: 'Search for your county...',
          showPopularFirst: true,
          showStateContext: true,
          enableSearch: true,
          mobileOptimized: false,
          maxHeight: '300px',
        }),
        expect.anything()
      );
    });

    it('should handle all configuration combinations', async () => {
      const user = userEvent.setup();
      render(<CountySelectorDemo />);

      // Select a state
      const californiaButton = screen.getByRole('button', { name: 'California' });
      await user.click(californiaButton);

      // Toggle all configuration options
      const popularFirstCheckbox = screen.getByRole('checkbox', { name: 'Popular Counties First' });
      const stateContextCheckbox = screen.getByRole('checkbox', { name: 'Show State Context' });
      const enableSearchCheckbox = screen.getByRole('checkbox', { name: 'Enable Search' });
      const mobileOptimizedCheckbox = screen.getByRole('checkbox', { name: 'Mobile Optimized' });

      await user.click(popularFirstCheckbox);
      await user.click(stateContextCheckbox);
      await user.click(enableSearchCheckbox);
      await user.click(mobileOptimizedCheckbox);

      // Verify EnhancedCountySelector was called with updated configuration
      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');
      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          showPopularFirst: false,
          showStateContext: false,
          enableSearch: false,
          mobileOptimized: true,
        }),
        expect.anything()
      );
    });
  });
});
