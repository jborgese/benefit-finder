/**
 * CountySelectorFixDemo Component Tests
 *
 * Comprehensive tests for the CountySelectorFixDemo component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CountySelectorFixDemo } from '../components/CountySelectorFixDemo';

// Mock the EnhancedCountySelector component
vi.mock('../questionnaire/components/EnhancedCountySelector', () => ({
  EnhancedCountySelector: vi.fn(({ onChange, value, selectedState, question }) => (
    <div data-testid="enhanced-county-selector">
      <div data-testid="selected-state">{selectedState}</div>
      <div data-testid="selected-county">{value ?? 'None'}</div>
      <div data-testid="question-text">{question.text}</div>
      <div data-testid="question-field">{question.fieldName}</div>
      <button
        data-testid="select-county-button"
        onClick={() => onChange('Fulton County')}
      >
        Select Fulton County
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

describe('CountySelectorFixDemo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the main title and description', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByText('County Selector Fix Demo')).toBeInTheDocument();
      expect(screen.getByText(/Testing the fix for the dropdown closing immediately issue/)).toBeInTheDocument();
    });

    it('should render the current state section', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByText('Current State: Georgia')).toBeInTheDocument();
      expect(screen.getByText(/The county selector should now stay open when you click on it/)).toBeInTheDocument();
    });

    it('should render the enhanced county selector section', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByText('Enhanced County Selector (Fixed)')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-county-selector')).toBeInTheDocument();
    });

    it('should render the fixes applied section', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByText('🔧 Fixes Applied')).toBeInTheDocument();
      expect(screen.getByText('✅ Improved blur handling to prevent immediate closing')).toBeInTheDocument();
      expect(screen.getByText('✅ Added click outside detection with proper event handling')).toBeInTheDocument();
      expect(screen.getByText('✅ Added click event propagation prevention')).toBeInTheDocument();
      expect(screen.getByText('✅ Increased focus timeout for better interaction')).toBeInTheDocument();
      expect(screen.getByText('✅ Added container refs for proper event delegation')).toBeInTheDocument();
    });

    it('should render the testing instructions section', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByText('🧪 Testing Instructions')).toBeInTheDocument();
      expect(screen.getByText('1. Click on the county dropdown - it should stay open')).toBeInTheDocument();
      expect(screen.getByText('2. Try typing in the search box - results should appear')).toBeInTheDocument();
      expect(screen.getByText('3. Click on a county option - it should select and close')).toBeInTheDocument();
      expect(screen.getByText('4. Click outside the dropdown - it should close')).toBeInTheDocument();
      expect(screen.getByText('5. Try the keyboard navigation (arrow keys) - it should work')).toBeInTheDocument();
    });
  });

  describe('EnhancedCountySelector Integration', () => {
    it('should pass correct props to EnhancedCountySelector', async () => {
      render(<CountySelectorFixDemo />);

      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');

      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          question: expect.objectContaining({
            id: 'demo-county-fix',
            text: 'What county do you live in?',
            description: 'County information helps us provide accurate Area Median Income (AMI) data for housing programs.',
            fieldName: 'county',
            required: true,
            helpText: 'Select your county to see available benefits and programs.',
          }),
          value: null,
          onChange: expect.any(Function),
          selectedState: 'GA',
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

    it('should display the demo question text', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByTestId('question-text')).toHaveTextContent('What county do you live in?');
      expect(screen.getByTestId('question-field')).toHaveTextContent('county');
    });

    it('should show Georgia as the selected state', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByTestId('selected-state')).toHaveTextContent('GA');
    });
  });

  describe('County Selection', () => {
    it('should handle county selection and display result', async () => {
      const user = userEvent.setup();
      render(<CountySelectorFixDemo />);

      // Initially no county should be selected
      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');
      expect(screen.queryByText('Selected County')).not.toBeInTheDocument();

      // Select a county
      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      // Check that selected county is displayed
      expect(screen.getByText('Selected County')).toBeInTheDocument();
      expect(screen.getByText('You selected:')).toBeInTheDocument();
      expect(screen.getAllByText('Fulton County')).toHaveLength(2); // Mock component and display
    });

    it('should clear county selection', async () => {
      const user = userEvent.setup();
      render(<CountySelectorFixDemo />);

      // Select a county first
      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      // Verify county is selected
      expect(screen.getByText('Selected County')).toBeInTheDocument();

      // Clear the selection
      const clearCountyButton = screen.getByTestId('clear-county-button');
      await user.click(clearCountyButton);

      // Selected county section should not be visible
      expect(screen.queryByText('Selected County')).not.toBeInTheDocument();
      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');
    });

    it('should update county selection state correctly', async () => {
      const user = userEvent.setup();
      render(<CountySelectorFixDemo />);

      // Test multiple selections
      const selectCountyButton = screen.getByTestId('select-county-button');
      const clearCountyButton = screen.getByTestId('clear-county-button');

      // Select county
      await user.click(selectCountyButton);
      expect(screen.getByTestId('selected-county')).toHaveTextContent('Fulton County');

      // Clear selection
      await user.click(clearCountyButton);
      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');

      // Select again
      await user.click(selectCountyButton);
      expect(screen.getByTestId('selected-county')).toHaveTextContent('Fulton County');
    });
  });

  describe('State Management', () => {
    it('should maintain selectedState as Georgia', () => {
      render(<CountySelectorFixDemo />);

      // The selectedState should always be 'GA' and not change
      expect(screen.getByTestId('selected-state')).toHaveTextContent('GA');
    });

    it('should initialize with no selected county', () => {
      render(<CountySelectorFixDemo />);

      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');
      expect(screen.queryByText('Selected County')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct CSS classes to main container', () => {
      const { container } = render(<CountySelectorFixDemo />);
      const mainDiv = container.firstChild as HTMLElement;

      expect(mainDiv).toHaveClass('max-w-2xl', 'mx-auto', 'p-6', 'space-y-6');
    });

    it('should apply correct styling to sections', () => {
      render(<CountySelectorFixDemo />);

      // Check that sections have proper styling classes
      const sections = screen.getAllByRole('generic');
      const styledSections = sections.filter(section =>
        section.className.includes('bg-white') ||
        section.className.includes('bg-blue-50') ||
        section.className.includes('bg-yellow-50')
      );

      expect(styledSections.length).toBeGreaterThan(0);
    });

    it('should display selected county with proper styling when selected', async () => {
      const user = userEvent.setup();
      render(<CountySelectorFixDemo />);

      // Select a county
      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      // Check that the selected county section has proper styling
      const selectedCountySection = screen.getByText('Selected County').closest('div');
      expect(selectedCountySection).toHaveClass('bg-green-50', 'dark:bg-green-900/20', 'rounded-lg');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<CountySelectorFixDemo />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('County Selector Fix Demo');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);

      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('should have proper semantic structure', () => {
      render(<CountySelectorFixDemo />);

      // Check for proper list structure in fixes and instructions
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should have accessible button elements', () => {
      render(<CountySelectorFixDemo />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check that buttons have accessible text
      buttons.forEach(button => {
        expect(button.textContent).toBeTruthy();
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode classes', () => {
      const { container } = render(<CountySelectorFixDemo />);

      // Check for dark mode classes in the DOM
      const htmlContent = container.innerHTML;
      expect(htmlContent).toContain('dark:text-white');
      expect(htmlContent).toContain('dark:bg-gray-800');
      expect(htmlContent).toContain('dark:bg-blue-900');
      expect(htmlContent).toContain('dark:bg-yellow-900');
      expect(htmlContent).toContain('dark:text-gray-300');
    });

    it('should have proper dark mode styling for sections', () => {
      render(<CountySelectorFixDemo />);

      // Check that sections include dark mode classes
      const sections = screen.getAllByRole('generic');
      const darkModeSections = sections.filter(section =>
        section.className.includes('dark:bg-gray-800') ||
        section.className.includes('dark:text-white') ||
        section.className.includes('dark:bg-green-900') ||
        section.className.includes('dark:bg-blue-900') ||
        section.className.includes('dark:bg-yellow-900')
      );

      expect(darkModeSections.length).toBeGreaterThan(0);
    });
  });

  describe('Component Props and Configuration', () => {
    it('should use correct demo question configuration', async () => {
      render(<CountySelectorFixDemo />);

      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');

      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          question: expect.objectContaining({
            id: 'demo-county-fix',
            text: 'What county do you live in?',
            description: 'County information helps us provide accurate Area Median Income (AMI) data for housing programs.',
            fieldName: 'county',
            required: true,
            helpText: 'Select your county to see available benefits and programs.',
          }),
        }),
        expect.anything()
      );
    });

    it('should configure EnhancedCountySelector with all features enabled', async () => {
      render(<CountySelectorFixDemo />);

      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');

      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          showPopularFirst: true,
          showStateContext: true,
          enableSearch: true,
          mobileOptimized: false,
          maxHeight: '300px',
        }),
        expect.anything()
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid county selection changes', async () => {
      const user = userEvent.setup();
      render(<CountySelectorFixDemo />);

      const selectCountyButton = screen.getByTestId('select-county-button');
      const clearCountyButton = screen.getByTestId('clear-county-button');

      // Rapidly toggle selection
      await user.click(selectCountyButton);
      await user.click(clearCountyButton);
      await user.click(selectCountyButton);
      await user.click(clearCountyButton);

      // Should end up with no selection
      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');
      expect(screen.queryByText('Selected County')).not.toBeInTheDocument();
    });

    it('should maintain state consistency during interactions', async () => {
      const user = userEvent.setup();
      render(<CountySelectorFixDemo />);

      // Verify initial state
      expect(screen.getByTestId('selected-state')).toHaveTextContent('GA');
      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');

      // Select county
      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      // State should remain consistent
      expect(screen.getByTestId('selected-state')).toHaveTextContent('GA');
      expect(screen.getByTestId('selected-county')).toHaveTextContent('Fulton County');
    });
  });

  describe('Component Integration', () => {
    it('should integrate properly with EnhancedCountySelector', async () => {
      render(<CountySelectorFixDemo />);

      const { EnhancedCountySelector } = await import('../questionnaire/components/EnhancedCountySelector');

      // Verify the component was called exactly once
      expect(EnhancedCountySelector).toHaveBeenCalledTimes(1);

      // Verify all required props are passed
      expect(EnhancedCountySelector).toHaveBeenCalledWith(
        expect.objectContaining({
          question: expect.objectContaining({
            id: 'demo-county-fix',
            text: 'What county do you live in?',
            fieldName: 'county',
            required: true,
          }),
          value: null,
          onChange: expect.any(Function),
          selectedState: 'GA',
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

    it('should handle onChange callback correctly', async () => {
      const user = userEvent.setup();
      render(<CountySelectorFixDemo />);

      // Initially no county should be selected
      expect(screen.getByTestId('selected-county')).toHaveTextContent('None');

      // Use the button to trigger the onChange callback
      const selectCountyButton = screen.getByTestId('select-county-button');
      await user.click(selectCountyButton);

      // Verify the state was updated
      expect(screen.getByTestId('selected-county')).toHaveTextContent('Fulton County');
    });
  });
});
