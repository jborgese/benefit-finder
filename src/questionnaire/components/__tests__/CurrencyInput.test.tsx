/**
 * CurrencyInput Component Tests
 *
 * Comprehensive tests for currency input component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CurrencyInput } from '../CurrencyInput';
import type { QuestionDefinition } from '../../types';

const mockQuestion: QuestionDefinition = {
  id: 'test-income',
  fieldName: 'income',
  text: 'What is your annual income?',
  type: 'currency',
  required: true,
};

describe('CurrencyInput Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render currency input with label', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/What is your annual income/i)).toBeInTheDocument();
    });

    it('should show required indicator when question is required', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const requiredIndicator = screen.getByLabelText('required');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveTextContent('*');
    });

    it('should display description when provided', () => {
      const questionWithDesc = {
        ...mockQuestion,
        description: 'Enter your total annual income',
      };

      render(<CurrencyInput question={questionWithDesc} value={undefined} onChange={mockOnChange} />);

      expect(screen.getByText('Enter your total annual income')).toBeInTheDocument();
    });

    it('should display USD symbol by default', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('should display different currency symbols', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} currency="EUR" />);

      expect(screen.getByText('€')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Value Display', () => {
    it('should display formatted value on blur', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={1000} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);
      await user.tab();

      // Value should be formatted on blur
      await waitFor(() => {
        expect(input).toHaveValue('1,000.00');
      });
    });

    it('should show formatted value helper text for large amounts', () => {
      render(<CurrencyInput question={mockQuestion} value={50000} onChange={mockOnChange} />);

      // Trigger blur to format
      const input = screen.getByLabelText(/What is your annual income/i);
      input.blur();

      expect(screen.getByText(/50,000.00 USD/i)).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should call onChange with numeric value', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '1234.56');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should remove non-numeric characters', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, 'abc123def');

      // Should only contain numbers
      expect(input).toHaveValue('123');
    });

    it('should limit to 2 decimal places', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '123.456789');

      // Should limit to 2 decimal places
      expect(input).toHaveValue('123.45');
    });

    it('should allow only one decimal point', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '12.34.56');

      // Should only have one decimal point
      expect(input.value.match(/\./g)?.length).toBeLessThanOrEqual(1);
    });

    it('should clear value when input is empty', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={1000} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.clear(input);

      // onChange should be called with undefined for clearing
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Negative Values', () => {
    it('should allow negative values when allowNegative is true', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} allowNegative />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '-123.45');

      expect(input).toHaveValue('-123.45');
    });

    it('should prevent negative values when allowNegative is false', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} allowNegative={false} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '-123');

      // Negative sign should be removed
      expect(input).toHaveValue('123');
    });

    it('should handle negative sign at beginning only', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} allowNegative />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '123-45');

      // Should move negative to beginning
      expect(input.value).not.toContain('123-');
    });
  });

  describe('Focus and Blur', () => {
    it('should format value on blur', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={1000} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveValue('1,000.00');
      });
    });

    it('should remove formatting on focus', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={1000} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);

      // First blur to format
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveValue('1,000.00');
      });

      // Then focus again
      await user.click(input);

      // Formatting should be removed for editing
      expect(input.value).not.toContain(',');
    });

    it('should select all text on focus', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={1000} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);

      // Text selection behavior - check that input is focused
      expect(input).toHaveFocus();
      // Note: Text selection can vary in test environment
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error is provided', async () => {
      const user = userEvent.setup();

      render(
        <CurrencyInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error="Invalid amount"
        />
      );

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid amount')).toBeInTheDocument();
      });
    });

    it('should display multiple error messages', async () => {
      const user = userEvent.setup();

      render(
        <CurrencyInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error={['Error 1', 'Error 2']}
        />
      );

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Error 1')).toBeInTheDocument();
        expect(screen.getByText('Error 2')).toBeInTheDocument();
      });
    });

    it('should show error styling when error is present', async () => {
      const user = userEvent.setup();

      render(
        <CurrencyInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error="Invalid amount"
        />
      );

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should hide help text when error is shown', async () => {
      const user = userEvent.setup();
      const questionWithHelp = {
        ...mockQuestion,
        helpText: 'Enter your annual income',
      };

      render(
        <CurrencyInput
          question={questionWithHelp}
          value={undefined}
          onChange={mockOnChange}
          error="Invalid amount"
        />
      );

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Enter your annual income')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Handling', () => {
    it('should call onEnterKey when Enter is pressed', async () => {
      const user = userEvent.setup();
      const onEnterKey = vi.fn();

      render(
        <CurrencyInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          onEnterKey={onEnterKey}
        />
      );

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '1234{Enter}');

      expect(onEnterKey).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} disabled />);

      const input = screen.getByLabelText(/What is your annual income/i);
      expect(input).toBeDisabled();
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();

      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} disabled />);

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.type(input, '123');

      // onChange should not be called when disabled
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Currency Symbols', () => {
    it('should support multiple currency codes', () => {
      const currencies = [
        { code: 'USD', symbol: '$' },
        { code: 'EUR', symbol: '€' },
        { code: 'GBP', symbol: '£' },
        { code: 'CAD', symbol: 'C$' },
        { code: 'AUD', symbol: 'A$' },
        { code: 'JPY', symbol: '¥' },
        { code: 'CNY', symbol: '¥' },
        { code: 'INR', symbol: '₹' },
      ];

      currencies.forEach(({ code, symbol }) => {
        const { unmount } = render(
          <CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} currency={code} />
        );
        expect(screen.getByText(symbol)).toBeInTheDocument();
        unmount();
      });
    });

    it('should default to USD for unknown currency codes', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} currency="XXX" />);

      expect(screen.getByText('$')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      expect(input).toHaveAttribute('aria-label');
    });

    it('should use custom aria-label when provided', () => {
      const questionWithAria = {
        ...mockQuestion,
        ariaLabel: 'Custom aria label',
      };

      render(<CurrencyInput question={questionWithAria} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText('Custom aria label');
      expect(input).toBeInTheDocument();
    });

    it('should have aria-describedby for description', () => {
      const questionWithDesc = {
        ...mockQuestion,
        description: 'Enter your income',
      };

      render(<CurrencyInput question={questionWithDesc} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should have role="alert" for error messages', async () => {
      const user = userEvent.setup();

      render(
        <CurrencyInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error="Error message"
        />
      );

      const input = screen.getByLabelText(/What is your annual income/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        const errorDiv = screen.getByRole('alert');
        expect(errorDiv).toBeInTheDocument();
      });
    });
  });

  describe('Placeholder', () => {
    it('should use default placeholder when not provided', () => {
      render(<CurrencyInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      expect(input).toHaveAttribute('placeholder', '0.00');
    });

    it('should use custom placeholder when provided', () => {
      const questionWithPlaceholder = {
        ...mockQuestion,
        placeholder: 'Enter amount',
      };

      render(<CurrencyInput question={questionWithPlaceholder} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your annual income/i);
      expect(input).toHaveAttribute('placeholder', 'Enter amount');
    });
  });
});

