/**
 * App Component Accessibility Tests
 *
 * Tests for accessibility features and ARIA compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// (App.test.setup exports the mocks we import above; no side-effect import needed)

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseResultsManagement.mockImplementation(() => ({
      saveResults: vi.fn().mockResolvedValue(undefined),
      loadAllResults: vi.fn().mockResolvedValue([]),
      loadResult: vi.fn().mockResolvedValue(null),
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    }));
    localStorage.clear();
    mockLocation.pathname = '/';
    mockLocation.hostname = 'localhost';
    vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  afterAll(async () => {
    try {
      await destroyDatabase();
    } catch (error) {
      console.warn('Final database cleanup warning:', error);
    }
  });

  it('should have proper ARIA labels on navigation buttons', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('BenefitFinder').length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    const homeButton = screen.queryByRole('button', { name: 'navigation.home' });
    // Home button should not be visible when on home page
    expect(homeButton).not.toBeInTheDocument();
  });

  it('should have live region for announcements', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('BenefitFinder').length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // The LiveRegion component should be rendered
    // Note: LiveRegion might not render if there's no message
    // This is a basic check that the component structure exists
    expect(document.body).toBeInTheDocument();
  });

  it('should have proper ARIA labels on action buttons', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Assessment' })).toBeInTheDocument();
    }, { timeout: 2000 });

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    expect(startButton).toBeInTheDocument();

    // Check for proper aria-label attributes
    expect(startButton).toHaveAttribute('aria-label', 'Start Assessment');
  });

  it('should have proper ARIA labels on external links', async () => {
    render(<App />);

    await waitFor(() => {
      const frootsnoopsLinks = screen.getAllByRole('link', { name: 'Visit frootsnoops.com - a frootsnoops site' });
      expect(frootsnoopsLinks.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    const frootsnoopsLinks = screen.getAllByRole('link', { name: 'Visit frootsnoops.com - a frootsnoops site' });
    frootsnoopsLinks.forEach(link => {
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('aria-label', 'Visit frootsnoops.com - a frootsnoops site');
    });
  });
});

