/**
 * Button Component Tests
 *
 * Comprehensive tests for the Button component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Removed unused import React
import { Button } from '../Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>);

      const button = screen.getByRole('button', { name: 'Custom label' });
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should apply default variant (primary)', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-900');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary-700');
    });

    it('should apply success variant', () => {
      render(<Button variant="success">Success</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-success-600');
    });

    it('should apply warning variant', () => {
      render(<Button variant="warning">Warning</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-warning-600');
    });

    it('should apply error variant', () => {
      render(<Button variant="error">Error</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-error-600');
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-base');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-lg');
      expect(button).toHaveClass('min-h-[52px]');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render as disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass('opacity-60');
    });

    it('should render loading state', () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass('cursor-wait');

      // Check for loading spinner
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render loading text with reduced opacity', () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole('button');
      const content = button.querySelector('span.opacity-70');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Loading');
    });

    it('should set button type to submit', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should set button type to reset', () => {
      render(<Button type="reset">Reset</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('should default to button type', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick} loading>Loading</Button>);

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard activation', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Accessible</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();

      handleClick.mockClear();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have minimum touch target size', () => {
      render(<Button>Touch Target</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-touch');
    });

    it('should have focus ring', () => {
      render(<Button>Focusable</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
    });

    it('should have aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have aria-disabled when loading', () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Loading State', () => {
    it('should show spinner when loading', () => {
      render(<Button loading>Save</Button>);

      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      render(<Button loading>Save</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should prevent clicks when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick} loading>Save</Button>);

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button aria-label="Empty button"> </Button>);

      const button = screen.getByRole('button', { name: 'Empty button' });
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined onClick', () => {
      render(<Button>No onClick</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should combine multiple props correctly', () => {
      render(
        <Button
          variant="success"
          size="lg"
          disabled
          className="custom"
          aria-label="Custom button"
        >
          Combined
        </Button>
      );

      const button = screen.getByRole('button', { name: 'Custom button' });
      expect(button).toHaveClass('bg-success-600');
      expect(button).toHaveClass('text-lg');
      expect(button).toHaveClass('custom');
      expect(button).toBeDisabled();
    });
  });
});
