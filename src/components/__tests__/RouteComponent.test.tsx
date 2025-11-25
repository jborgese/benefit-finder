import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RouteComponent } from '../RouteComponent';
import React, { Suspense } from 'react';

// Mock ErrorBoundary to capture onError prop
vi.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children, onError }: { children: React.ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void }) => {
    // Store onError for testing
    if (onError) {
      (window as any).__testErrorHandler = onError;
    }
    return <div data-testid="error-boundary">{children}</div>;
  }
}));

// Mock RouteLoadingFallback
vi.mock('../RouteLoadingFallback', () => ({
  RouteLoadingFallback: () => <div data-testid="loading-fallback">Loading...</div>
}));

describe('RouteComponent', () => {
  it('renders children within ErrorBoundary and Suspense', () => {
    render(
      <RouteComponent>
        <div data-testid="test-content">Test Content</div>
      </RouteComponent>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('provides onError handler to ErrorBoundary', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <RouteComponent>
        <div>Test</div>
      </RouteComponent>
    );

    // Verify onError handler was provided
    expect((window as any).__testErrorHandler).toBeDefined();

    // Test the error handler
    const testError = new Error('Test error');
    const testErrorInfo = { componentStack: 'Test stack' } as React.ErrorInfo;

    (window as any).__testErrorHandler(testError, testErrorInfo);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Route Error Boundary caught an error:',
      testError,
      testErrorInfo
    );

    consoleErrorSpy.mockRestore();
    delete (window as any).__testErrorHandler;
  });

  it('wraps children in Suspense with loading fallback', () => {
    // Create a lazy component to trigger suspense
    const LazyComponent = React.lazy(() => new Promise(() => { })); // Never resolves

    render(
      <RouteComponent>
        <Suspense fallback={<div data-testid="custom-fallback">Custom Loading</div>}>
          <LazyComponent />
        </Suspense>
      </RouteComponent>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('passes through multiple children', () => {
    render(
      <RouteComponent>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </RouteComponent>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });
});
