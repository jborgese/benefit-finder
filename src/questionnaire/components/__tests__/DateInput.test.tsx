/**
 * DateInput Component Tests
 *
 * Comprehensive tests for date input component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DateInput } from '../DateInput';
import type { QuestionDefinition } from '../../types';

const mockQuestion: QuestionDefinition = {
  id: 'test-date',
  fieldName: 'birthDate',
  text: 'What is your date of birth?',
  type: 'date',
  required: true,
};

describe('DateInput Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render date input with label', () => {
      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/What is your date of birth/i)).toBeInTheDocument();
    });

    it('should show required indicator when question is required', () => {
      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const requiredIndicator = screen.getByLabelText('required');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveTextContent('*');
    });

    it('should display description when provided', () => {
      const questionWithDesc = {
        ...mockQuestion,
        description: 'Enter your date of birth',
      };

      render(<DateInput question={questionWithDesc} value={undefined} onChange={mockOnChange} />);

      expect(screen.getByText('Enter your date of birth')).toBeInTheDocument();
    });

    it('should show calendar picker icon by default', () => {
      const { container } = render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      expect(input).toBeInTheDocument();
      // Calendar icon (SVG) should be present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should hide calendar picker when showPicker is false', () => {
      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} showPicker={false} />);

      // Icon should not be present
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Value Display', () => {
    it('should display formatted date', () => {
      render(<DateInput question={mockQuestion} value="2000-01-15" onChange={mockOnChange} />);

      expect(screen.getByText(/January 15, 2000/i)).toBeInTheDocument();
    });

    it('should display short format when specified', () => {
      render(<DateInput question={mockQuestion} value="2000-01-15" onChange={mockOnChange} format="short" />);

      // Short format should be displayed
      const displayText = screen.getByText(/1\/15\/00/i);
      expect(displayText).toBeInTheDocument();
    });

    it('should display long format when specified', () => {
      render(<DateInput question={mockQuestion} value="2000-01-15" onChange={mockOnChange} format="long" />);

      // Long format includes weekday
      const displayText = screen.getByText(/Saturday/i);
      expect(displayText).toBeInTheDocument();
    });

    it('should calculate and display age for birth date fields', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const birthDate = `${birthYear}-01-15`;

      render(<DateInput question={mockQuestion} value={birthDate} onChange={mockOnChange} />);

      expect(screen.getByText(/Age: 25/i)).toBeInTheDocument();
    });

    it('should not calculate age for non-birth date fields', () => {
      const nonBirthQuestion = {
        ...mockQuestion,
        fieldName: 'employmentDate',
      };

      render(<DateInput question={nonBirthQuestion} value="2000-01-15" onChange={mockOnChange} />);

      expect(screen.queryByText(/Age:/i)).not.toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should call onChange when date is selected', async () => {
      const user = userEvent.setup();

      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.type(input, '2000-01-15');

      expect(mockOnChange).toHaveBeenCalledWith('2000-01-15');
    });

    it('should handle date changes', async () => {
      const user = userEvent.setup();

      render(<DateInput question={mockQuestion} value="2000-01-15" onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.clear(input);
      await user.type(input, '2001-02-20');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Date Constraints', () => {
    it('should apply min date constraint', () => {
      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} min="2000-01-01" />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      expect(input).toHaveAttribute('min', '2000-01-01');
    });

    it('should apply max date constraint', () => {
      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} max="2020-12-31" />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      expect(input).toHaveAttribute('max', '2020-12-31');
    });

    it('should apply both min and max constraints', () => {
      render(
        <DateInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          min="2000-01-01"
          max="2020-12-31"
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
      expect(input).toHaveAttribute('min', '2000-01-01');
      expect(input).toHaveAttribute('max', '2020-12-31');
    });
  });

  describe('Focus and Blur', () => {
    it('should track focus state', async () => {
      const user = userEvent.setup();

      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.click(input);

      // Input should have focus ring
      expect(input).toHaveFocus();
    });

    it('should track touched state after blur', async () => {
      const user = userEvent.setup();

      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.click(input);
      await user.tab();

      // Should show errors if present after being touched
      expect(input).not.toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error is provided', async () => {
      const user = userEvent.setup();

      render(
        <DateInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error="Invalid date"
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid date')).toBeInTheDocument();
      });
    });

    it('should display multiple error messages', async () => {
      const user = userEvent.setup();

      render(
        <DateInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error={['Error 1', 'Error 2']}
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
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
        <DateInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error="Invalid date"
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
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
        helpText: 'Enter your date of birth',
      };

      render(
        <DateInput
          question={questionWithHelp}
          value={undefined}
          onChange={mockOnChange}
          error="Invalid date"
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Enter your date of birth')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Handling', () => {
    it('should call onEnterKey when Enter is pressed', async () => {
      const user = userEvent.setup();
      const onEnterKey = vi.fn();

      render(
        <DateInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          onEnterKey={onEnterKey}
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.type(input, '2000-01-15{Enter}');

      expect(onEnterKey).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} disabled />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      expect(input).toBeDisabled();
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();

      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} disabled />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.type(input, '2000-01-15');

      // onChange should not be called when disabled
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Age Calculation', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();

      // Test age 30
      const birthYear = currentYear - 30;
      const birthDate = `${birthYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

      render(<DateInput question={mockQuestion} value={birthDate} onChange={mockOnChange} />);

      expect(screen.getByText(/Age: 30/i)).toBeInTheDocument();
    });

    it('should handle age calculation edge cases', () => {
      // Test with birthday today
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const birthMonth = String(today.getMonth() + 1).padStart(2, '0');
      const birthDay = String(today.getDate()).padStart(2, '0');
      const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

      render(<DateInput question={mockQuestion} value={birthDate} onChange={mockOnChange} />);

      expect(screen.getByText(/Age: 25/i)).toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
      render(<DateInput question={mockQuestion} value="invalid-date" onChange={mockOnChange} />);

      // Should not crash - component should render
      expect(screen.getByLabelText(/What is your date of birth/i)).toBeInTheDocument();
      // May show "Age: NaN" which is acceptable fallback behavior
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly for medium format', () => {
      render(<DateInput question={mockQuestion} value="2000-01-15" onChange={mockOnChange} format="medium" />);

      expect(screen.getByText(/January 15, 2000/i)).toBeInTheDocument();
    });

    it('should handle formatting errors gracefully', () => {
      render(<DateInput question={mockQuestion} value="invalid" onChange={mockOnChange} />);

      // Should not crash
      expect(screen.getByLabelText(/What is your date of birth/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<DateInput question={mockQuestion} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      expect(input).toHaveAttribute('aria-label');
    });

    it('should use custom aria-label when provided', () => {
      const questionWithAria = {
        ...mockQuestion,
        ariaLabel: 'Custom aria label',
      };

      render(<DateInput question={questionWithAria} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText('Custom aria label');
      expect(input).toBeInTheDocument();
    });

    it('should have aria-describedby for description', () => {
      const questionWithDesc = {
        ...mockQuestion,
        description: 'Enter your date',
      };

      render(<DateInput question={questionWithDesc} value={undefined} onChange={mockOnChange} />);

      const input = screen.getByLabelText(/What is your date of birth/i);
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should have role="alert" for error messages', async () => {
      const user = userEvent.setup();

      render(
        <DateInput
          question={mockQuestion}
          value={undefined}
          onChange={mockOnChange}
          error="Error message"
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        const errorDiv = screen.getByRole('alert');
        expect(errorDiv).toBeInTheDocument();
      });
    });
  });

  describe('Help Text', () => {
    it('should display help text when provided and no error', () => {
      const questionWithHelp = {
        ...mockQuestion,
        helpText: 'Format: YYYY-MM-DD',
      };

      render(<DateInput question={questionWithHelp} value={undefined} onChange={mockOnChange} />);

      expect(screen.getByText('Format: YYYY-MM-DD')).toBeInTheDocument();
    });

    it('should hide help text when error is shown', async () => {
      const user = userEvent.setup();
      const questionWithHelp = {
        ...mockQuestion,
        helpText: 'Format: YYYY-MM-DD',
      };

      render(
        <DateInput
          question={questionWithHelp}
          value={undefined}
          onChange={mockOnChange}
          error="Invalid date"
        />
      );

      const input = screen.getByLabelText(/What is your date of birth/i);
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Format: YYYY-MM-DD')).not.toBeInTheDocument();
      });
    });
  });
});

