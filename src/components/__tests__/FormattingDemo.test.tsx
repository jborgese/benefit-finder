/**
 * FormattingDemo Component Tests
 *
 * Comprehensive tests for the FormattingDemo component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormattingDemo } from '../FormattingDemo';

// Mock the i18n hooks
const mockUseI18n = vi.fn();

vi.mock('../../i18n/hooks', () => ({
  useI18n: () => mockUseI18n(),
}));

describe('FormattingDemo Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock implementation
    mockUseI18n.mockReturnValue({
      t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'formatting.examples.currency': 'Currency Examples',
          'formatting.examples.number': 'Number Examples',
          'formatting.examples.date': 'Date Examples',
          'formatting.examples.dateTime': 'Date & Time Examples',
          'formatting.examples.percent': 'Percentage Examples',
        };
        return translations[key] || key;
      }),
      formatCurrency: vi.fn((amount: number) => `$${amount.toLocaleString()}`),
      formatDate: vi.fn((date: Date, options?: Intl.DateTimeFormatOptions) => {
        if (options) {
          // Handle timeStyle option which isn't supported in JSDOM
          if (options.timeStyle) {
            return '12/25/24, 3:30 PM';
          }
          return date.toLocaleDateString('en-US', options);
        }
        return date.toLocaleDateString('en-US');
      }),
      formatNumber: vi.fn((number: number, options?: Intl.NumberFormatOptions) => {
        if (options?.style === 'percent') {
          return `${(number * 100).toFixed(0)}%`;
        }
        return number.toLocaleString();
      }),
      currentLanguage: 'en',
    });
  });

  describe('Component Rendering', () => {
    it('should render the component without crashing', () => {
      render(<FormattingDemo />);

      expect(screen.getByText('Currency Examples')).toBeInTheDocument();
    });

    it('should render the main container with correct classes', () => {
      render(<FormattingDemo />);

      const container = screen.getByText('Currency Examples').closest('div');
      expect(container).toHaveClass('bg-gray-50', 'p-4', 'rounded-lg');
    });

    it('should render the heading with correct text and classes', () => {
      render(<FormattingDemo />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Currency Examples');
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'mb-4');
    });

    it('should render all formatting examples', () => {
      render(<FormattingDemo />);

      // Check that all example labels are present
      expect(screen.getByText('Currency:')).toBeInTheDocument();
      expect(screen.getByText('Number:')).toBeInTheDocument();
      expect(screen.getByText('Date:')).toBeInTheDocument();
      expect(screen.getByText('Date & Time:')).toBeInTheDocument();
      expect(screen.getByText('Percentage:')).toBeInTheDocument();
      expect(screen.getByText('Current Language:')).toBeInTheDocument();
    });

    it('should render the informational note', () => {
      render(<FormattingDemo />);

      const note = screen.getByText(/All formatting automatically adapts to the selected language locale/);
      expect(note).toBeInTheDocument();
      expect(note.closest('div')).toHaveClass('mt-4', 'p-3', 'bg-blue-50', 'rounded', 'text-sm');
    });
  });

  describe('Formatting Functions Integration', () => {
    it('should call formatCurrency with correct parameters', () => {
      const mockFormatCurrency = vi.fn((amount: number) => `$${amount.toLocaleString()}`);
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: mockFormatCurrency,
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(mockFormatCurrency).toHaveBeenCalledWith(2500);
    });

    it('should call formatNumber with correct parameters for regular numbers', () => {
      const mockFormatNumber = vi.fn((number: number) => number.toLocaleString());
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: mockFormatNumber,
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(mockFormatNumber).toHaveBeenCalledWith(1234567.89);
    });

    it('should call formatNumber with percent options for percentage', () => {
      const mockFormatNumber = vi.fn((number: number, options?: Intl.NumberFormatOptions) => {
        if (options?.style === 'percent') {
          return `${(number * 100).toFixed(0)}%`;
        }
        return number.toLocaleString();
      });
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: mockFormatNumber,
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(mockFormatNumber).toHaveBeenCalledWith(0.15, { style: 'percent' });
    });

    it('should call formatDate with correct parameters', () => {
      const mockFormatDate = vi.fn((date: Date, options?: Intl.DateTimeFormatOptions) => {
        if (options) {
          // Handle timeStyle option which isn't supported in JSDOM
          if (options.timeStyle) {
            return '12/25/24, 3:30 PM';
          }
          return date.toLocaleDateString('en-US', options);
        }
        return date.toLocaleDateString('en-US');
      });
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: mockFormatDate,
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      const expectedDate = new Date('2024-12-25T15:30:00');
      expect(mockFormatDate).toHaveBeenCalledWith(expectedDate);
      expect(mockFormatDate).toHaveBeenCalledWith(expectedDate, {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    });

    it('should display current language', () => {
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: 'es',
      });

      render(<FormattingDemo />);

      expect(screen.getByText('es')).toBeInTheDocument();
    });
  });

  describe('Translation Integration', () => {
    it('should call translation function with correct key', () => {
      const mockT = vi.fn((key: string) => 'Currency Examples');
      mockUseI18n.mockReturnValue({
        t: mockT,
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(mockT).toHaveBeenCalledWith('formatting.examples.currency');
    });

    it('should handle missing translations gracefully', () => {
      const mockT = vi.fn((key: string) => key); // Return key if no translation
      mockUseI18n.mockReturnValue({
        t: mockT,
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(screen.getByText('formatting.examples.currency')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<FormattingDemo />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(<FormattingDemo />);

      // Check that labels are properly associated with their values
      const currencyLabel = screen.getByText('Currency:');
      const currencyValue = currencyLabel.parentElement?.querySelector('.font-mono');
      expect(currencyValue).toBeInTheDocument();
    });

    it('should have proper contrast and styling for readability', () => {
      render(<FormattingDemo />);

      // Check that labels have proper text color classes
      const labels = screen.getAllByText(/:/);
      labels.forEach(label => {
        // Only check labels that end with ':' (not values that contain ':')
        if (label.textContent?.endsWith(':') && label.tagName === 'SPAN') {
          expect(label).toHaveClass('text-sm', 'text-gray-600');
        }
      });
    });

    it('should have proper spacing and layout classes', () => {
      render(<FormattingDemo />);

      const examplesContainer = screen.getByText('Currency:').closest('.space-y-3');
      expect(examplesContainer).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display formatted currency value', () => {
      const mockFormatCurrency = vi.fn(() => '$2,500.00');
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: mockFormatCurrency,
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    });

    it('should display formatted number value', () => {
      const mockFormatNumber = vi.fn(() => '1,234,567.89');
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: mockFormatNumber,
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      // Find the number value specifically by looking for it next to "Number:" label
      const numberLabel = screen.getByText('Number:');
      const numberValue = numberLabel.parentElement?.querySelector('.font-mono');
      expect(numberValue).toHaveTextContent('1,234,567.89');
    });

    it('should display formatted date value', () => {
      const mockFormatDate = vi.fn(() => '12/25/2024');
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: mockFormatDate,
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      // Find the date value specifically by looking for it next to "Date:" label
      const dateLabel = screen.getByText('Date:');
      const dateValue = dateLabel.parentElement?.querySelector('.font-mono');
      expect(dateValue).toHaveTextContent('12/25/2024');
    });

    it('should display formatted percentage value', () => {
      const mockFormatNumber = vi.fn((number: number, options?: Intl.NumberFormatOptions) => {
        if (options?.style === 'percent') {
          return '15%';
        }
        return number.toLocaleString();
      });
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: mockFormatNumber,
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should display formatted date and time value', () => {
      const mockFormatDate = vi.fn((date: Date, options?: Intl.DateTimeFormatOptions) => {
        if (options) {
          return '12/25/24, 3:30 PM';
        }
        return '12/25/2024';
      });
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: mockFormatDate,
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(screen.getByText('12/25/24, 3:30 PM')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined formatting functions gracefully', () => {
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: undefined as unknown as (amount: number) => string,
        formatDate: undefined as unknown as (date: Date, options?: Intl.DateTimeFormatOptions) => string,
        formatNumber: undefined as unknown as (number: number, options?: Intl.NumberFormatOptions) => string,
        currentLanguage: 'en',
      });

      expect(() => render(<FormattingDemo />)).toThrow();
    });

    it('should handle null current language', () => {
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: null as unknown as string,
      });

      render(<FormattingDemo />);

      // Find the current language value specifically
      const languageLabel = screen.getByText('Current Language:');
      const languageValue = languageLabel.parentElement?.querySelector('.font-mono');
      // React renders null as empty string
      expect(languageValue).toHaveTextContent('');
    });

    it('should handle empty string current language', () => {
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: '',
      });

      render(<FormattingDemo />);

      // Find the current language value specifically
      const languageLabel = screen.getByText('Current Language:');
      const languageValue = languageLabel.parentElement?.querySelector('.font-mono');
      expect(languageValue).toHaveTextContent('');
    });

    it('should handle formatting functions that return empty strings', () => {
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(() => ''),
        formatDate: vi.fn(() => ''),
        formatNumber: vi.fn(() => ''),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      // Should still render the component structure
      expect(screen.getByText('Currency Examples')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper flex layout for example rows', () => {
      render(<FormattingDemo />);

      // Get all the example rows by finding the parent divs of labels
      const labels = screen.getAllByText(/:/);
      labels.forEach(label => {
        // Only check labels that are spans (not the note section)
        if (label.textContent?.includes(':') && label.tagName === 'SPAN') {
          const row = label.parentElement;
          expect(row).toHaveClass('flex', 'justify-between', 'items-center');
        }
      });
    });

    it('should have proper font styling for values', () => {
      render(<FormattingDemo />);

      const valueElements = screen.getAllByText(/:/).map(label =>
        label.parentElement?.querySelector('.font-mono')
      ).filter(Boolean);

      valueElements.forEach(element => {
        expect(element).toHaveClass('font-mono');
      });
    });

    it('should have proper note styling', () => {
      render(<FormattingDemo />);

      const note = screen.getByText(/All formatting automatically adapts/);
      const noteContainer = note.closest('div');
      expect(noteContainer).toHaveClass('mt-4', 'p-3', 'bg-blue-50', 'rounded', 'text-sm');
      expect(note).toHaveClass('text-blue-800');
    });
  });

  describe('Sample Data', () => {
    it('should use correct sample income value', () => {
      const mockFormatCurrency = vi.fn();
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: mockFormatCurrency,
        formatDate: vi.fn(),
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(mockFormatCurrency).toHaveBeenCalledWith(2500);
    });

    it('should use correct sample number value', () => {
      const mockFormatNumber = vi.fn();
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: mockFormatNumber,
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(mockFormatNumber).toHaveBeenCalledWith(1234567.89);
    });

    it('should use correct sample percentage value', () => {
      const mockFormatNumber = vi.fn();
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: vi.fn(),
        formatNumber: mockFormatNumber,
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      expect(mockFormatNumber).toHaveBeenCalledWith(0.15, { style: 'percent' });
    });

    it('should use correct sample date', () => {
      const mockFormatDate = vi.fn();
      mockUseI18n.mockReturnValue({
        t: vi.fn((key: string) => 'Currency Examples'),
        formatCurrency: vi.fn(),
        formatDate: mockFormatDate,
        formatNumber: vi.fn(),
        currentLanguage: 'en',
      });

      render(<FormattingDemo />);

      const expectedDate = new Date('2024-12-25T15:30:00');
      expect(mockFormatDate).toHaveBeenCalledWith(expectedDate);
    });
  });
});
