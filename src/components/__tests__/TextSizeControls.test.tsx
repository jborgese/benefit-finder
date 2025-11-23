/**
 * TextSizeControls Component Tests
 *
 * Tests for text size controls component with context mocking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextSizeControls } from '../TextSizeControls';
import * as useTextSizeModule from '../../contexts/useTextSize';

// Mock the useTextSize hook
const mockIncreaseTextSize = vi.fn();
const mockDecreaseTextSize = vi.fn();
const mockResetTextSize = vi.fn();
const mockSetTextSize = vi.fn();

vi.mock('../../contexts/useTextSize', () => ({
  useTextSize: vi.fn(),
}));

describe('TextSizeControls Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
      textSize: 'medium',
      increaseTextSize: mockIncreaseTextSize,
      decreaseTextSize: mockDecreaseTextSize,
      resetTextSize: mockResetTextSize,
      setTextSize: mockSetTextSize,
    });
  });

  describe('Rendering', () => {
    it('should render text size controls', () => {
      render(<TextSizeControls />);

      expect(screen.getByRole('button', { name: /Decrease text size/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Increase text size/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset text size/i })).toBeInTheDocument();
    });

    it('should display current text size', () => {
      render(<TextSizeControls />);

      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('should display label when showLabels is true', () => {
      render(<TextSizeControls showLabels />);

      expect(screen.getByText('Text Size:')).toBeInTheDocument();
    });

    it('should not display label by default', () => {
      render(<TextSizeControls />);

      expect(screen.queryByText('Text Size:')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<TextSizeControls className="custom-class" />);

      const container = screen.getByRole('button', { name: /Decrease text size/i }).parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      render(<TextSizeControls size="sm" />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      expect(decreaseButton).toHaveClass('h-11');
      expect(decreaseButton).toHaveClass('text-sm');
    });

    it('should apply medium size classes by default', () => {
      render(<TextSizeControls />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      expect(decreaseButton).toHaveClass('h-11');
      expect(decreaseButton).toHaveClass('text-base');
    });

    it('should apply large size classes', () => {
      render(<TextSizeControls size="lg" />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      expect(decreaseButton).toHaveClass('h-12');
      expect(decreaseButton).toHaveClass('text-lg');
    });
  });

  describe('Variant Styles', () => {
    it('should apply default variant styles', () => {
      render(<TextSizeControls variant="default" />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      expect(decreaseButton).toHaveClass('bg-white');
    });

    it('should apply minimal variant styles', () => {
      render(<TextSizeControls variant="minimal" />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      expect(decreaseButton).toHaveClass('bg-transparent');
    });
  });

  describe('Button Interactions', () => {
    it('should call decreaseTextSize when decrease button is clicked', async () => {
      const user = userEvent.setup();

      render(<TextSizeControls />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      await user.click(decreaseButton);

      expect(mockDecreaseTextSize).toHaveBeenCalledOnce();
    });

    it('should call increaseTextSize when increase button is clicked', async () => {
      const user = userEvent.setup();

      render(<TextSizeControls />);

      const increaseButton = screen.getByRole('button', { name: /Increase text size/i });
      await user.click(increaseButton);

      expect(mockIncreaseTextSize).toHaveBeenCalledOnce();
    });

    it('should call resetTextSize when reset button is clicked', async () => {
      const user = userEvent.setup();

      render(<TextSizeControls />);

      const resetButton = screen.getByRole('button', { name: /Reset text size/i });
      await user.click(resetButton);

      expect(mockResetTextSize).toHaveBeenCalledOnce();
    });
  });

  describe('Disabled States', () => {
    it('should disable decrease button when at minimum size', () => {
      (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
        textSize: 'small',
        increaseTextSize: mockIncreaseTextSize,
        decreaseTextSize: mockDecreaseTextSize,
        resetTextSize: mockResetTextSize,
        setTextSize: mockSetTextSize,
      });

      render(<TextSizeControls />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      expect(decreaseButton).toBeDisabled();
    });

    it('should disable increase button when at maximum size', () => {
      (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
        textSize: 'extra-large',
        increaseTextSize: mockIncreaseTextSize,
        decreaseTextSize: mockDecreaseTextSize,
        resetTextSize: mockResetTextSize,
        setTextSize: mockSetTextSize,
      });

      render(<TextSizeControls />);

      const increaseButton = screen.getByRole('button', { name: /Increase text size/i });
      expect(increaseButton).toBeDisabled();
    });

    it('should enable both buttons when not at limits', () => {
      (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
        textSize: 'large',
        increaseTextSize: mockIncreaseTextSize,
        decreaseTextSize: mockDecreaseTextSize,
        resetTextSize: mockResetTextSize,
        setTextSize: mockSetTextSize,
      });

      render(<TextSizeControls />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      const increaseButton = screen.getByRole('button', { name: /Increase text size/i });

      expect(decreaseButton).not.toBeDisabled();
      expect(increaseButton).not.toBeDisabled();
    });
  });

  describe('Text Size Display', () => {
    it('should display small text size', () => {
      (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
        textSize: 'small',
        increaseTextSize: mockIncreaseTextSize,
        decreaseTextSize: mockDecreaseTextSize,
        resetTextSize: mockResetTextSize,
        setTextSize: mockSetTextSize,
      });

      render(<TextSizeControls />);

      expect(screen.getByText('small')).toBeInTheDocument();
    });

    it('should display large text size', () => {
      (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
        textSize: 'large',
        increaseTextSize: mockIncreaseTextSize,
        decreaseTextSize: mockDecreaseTextSize,
        resetTextSize: mockResetTextSize,
        setTextSize: mockSetTextSize,
      });

      render(<TextSizeControls />);

      expect(screen.getByText('large')).toBeInTheDocument();
    });

    it('should display extra-large text size', () => {
      (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
        textSize: 'extra-large',
        increaseTextSize: mockIncreaseTextSize,
        decreaseTextSize: mockDecreaseTextSize,
        resetTextSize: mockResetTextSize,
        setTextSize: mockSetTextSize,
      });

      render(<TextSizeControls />);

      expect(screen.getByText('extra-large')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels on buttons', () => {
      render(<TextSizeControls />);

      expect(screen.getByRole('button', { name: /Decrease text size/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Increase text size/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset text size/i })).toBeInTheDocument();
    });

    it('should have keyboard accessible buttons', async () => {
      const user = userEvent.setup();

      render(<TextSizeControls />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease text size/i });
      await user.tab();

      expect(decreaseButton).toHaveFocus();
    });
  });
});

