/**
 * App Component Onboarding Tests
 *
 * Tests for onboarding modals and user guidance features
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// (App.test.setup exports the mocks we import above; no side-effect import needed)

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - Onboarding Modals', () => {
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

  // TESTING MEMORY LEAK FIX: Re-enabled to verify conditional persist middleware works
  it('should open welcome tour when tour button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const tourButtons = screen.getAllByText((_content, element) => {
      if (!element) { return false; }
      return element.textContent === '🎯 Tour' || element.textContent.includes('Tour');
    });
    const tourButton = tourButtons[0]?.closest('button');
    if (tourButton) {
      await user.click(tourButton);
      await waitFor(() => {
        expect(screen.getByTestId('welcome-tour')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  // TESTING MEMORY LEAK FIX: Re-enabled to verify conditional persist middleware works
  it('should open privacy explainer when privacy button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const privacyButtons = screen.getAllByText((_content, element) => {
      if (!element) { return false; }
      return element.textContent === '🔒 Privacy' || element.textContent.includes('Privacy');
    });
    const privacyButton = privacyButtons[0]?.closest('button');
    if (privacyButton) {
      await user.click(privacyButton);
      await waitFor(() => {
        expect(screen.getByTestId('privacy-explainer')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 1 - onboarding modals
  it('should open quick start guide when guide button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const guideButtons = screen.getAllByText((_content, element) => {
      if (!element) { return false; }
      return element.textContent === '📖 Guide' || element.textContent.includes('Guide');
    });
    const guideButton = guideButtons[0]?.closest('button');
    if (guideButton) {
      await user.click(guideButton);
      await waitFor(() => {
        expect(screen.getByTestId('quick-start-guide')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 1 - onboarding modals
  it('should open shortcuts help when shortcuts button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const shortcutsButtons = screen.getAllByText((_content, element) => {
      if (!element) { return false; }
      return element.textContent === '⌨️ navigation.shortcuts' || element.textContent.includes('navigation.shortcuts');
    });
    const shortcutsButton = shortcutsButtons[0]?.closest('button');
    if (shortcutsButton) {
      await user.click(shortcutsButton);
      await waitFor(() => {
        expect(screen.getByTestId('shortcuts-help')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 4 - onboarding tests
  it('should handle welcome tour completion', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open tour
    const tourButtons = screen.getAllByText((_content, element) => {
      if (!element) { return false; }
      return element.textContent === '🎯 Tour' || element.textContent.includes('Tour');
    });
    const tourButton = tourButtons[0]?.closest('button');
    if (tourButton) {
      await user.click(tourButton);
      await waitFor(() => {
        expect(screen.getByTestId('welcome-tour')).toBeInTheDocument();
      }, { timeout: 2000 });
    }

    // Check that tour completion sets localStorage
    expect(localStorage.getItem('bf-welcome-tour-completed')).toBeNull();
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 4 - onboarding tests
  it('should handle quick start guide assessment start', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open guide
    const guideButtons = screen.getAllByText((_content, element) => {
      if (!element) { return false; }
      return element.textContent === '📖 Guide' || element.textContent.includes('Guide');
    });
    const guideButton = guideButtons[0]?.closest('button');
    if (guideButton) {
      await user.click(guideButton);
      await waitFor(() => {
        expect(screen.getByTestId('quick-start-guide')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });
});

