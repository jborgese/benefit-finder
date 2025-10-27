/**
 * ErrorBoundary Component Tests
 *
 * Tests for error boundary component that catches React errors
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }): React.ReactElement => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress console.error for tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

describe('ErrorBoundary Component', () => {
  describe('Normal Rendering', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First</div>
          <div>Second</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
    });

    it('should display error details in development mode', () => {
      // Mock development environment
      const originalEnv = import.meta.env.DEV;
      Object.defineProperty(import.meta, 'env', {
        value: { ...import.meta.env, DEV: true },
        writable: true,
        configurable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const detailsButton = screen.getByText(/Technical Details/i);
      expect(detailsButton).toBeInTheDocument();

      // Restore
      Object.defineProperty(import.meta, 'env', {
        value: { ...import.meta.env, DEV: originalEnv },
        writable: true,
        configurable: true,
      });
    });

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(onError.mock.calls[0][1]).toHaveProperty('componentStack');
    });

    it('should use custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('should handle retry button click', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      await user.click(retryButton);

      // Component should try to render children again
      // Since ThrowError still throws, it will show error again
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle reload button click', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => { });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Page/i });
      await user.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalled();

      reloadSpy.mockRestore();
    });

    it('should display help text', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/If this problem persists/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should recover when child stops throwing', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render without error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Static Methods', () => {
    it('should call getDerivedStateFromError when error occurs', () => {
      const spy = vi.spyOn(ErrorBoundary, 'getDerivedStateFromError');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // getDerivedStateFromError is called during error handling
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { name: /Something went wrong/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      const reloadButton = screen.getByRole('button', { name: /Reload Page/i });

      expect(retryButton).toBeInTheDocument();
      expect(reloadButton).toBeInTheDocument();
    });
  });
});

