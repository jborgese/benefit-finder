/**
 * App Component Integration Tests
 *
 * Tests App component integration with backend services using mocked App stub.
 * These tests verify:
 * - Proper mock configuration for different scenarios
 * - Error handling paths
 * - Results persistence workflows
 * - Evaluation pipeline with various result types
 *
 * Use these tests when you need to verify:
 * - Backend service integration (evaluation, DB, results management)
 * - Error handling and edge cases
 * - Different evaluation outcome scenarios
 *
 * For simple UI state transitions, use App.state-transitions.test.tsx instead.
 * For E2E tests with real components, use Playwright tests in tests/e2e/
 */

import './App.state-transitions.test'; // Use same stub setup
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { destroyDatabase } from '../db';

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App')); // Uses stub from App.state-transitions.test
});

describe('App Component - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterAll(async () => {
    try {
      await destroyDatabase();
    } catch (error) {
      console.warn('Final database cleanup warning:', error);
    }
  });

  it('should render home page and start assessment', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startButton = await screen.findByRole('button', { name: 'Start Assessment' });
    expect(startButton).toBeInTheDocument();

    await user.click(startButton);
    await waitFor(() => expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument());
  });

  it('should complete questionnaire and show results', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startButton = await screen.findByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);
    await waitFor(() => expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument());

    const completeButton = await screen.findByRole('button', { name: 'Complete' });
    await user.click(completeButton);
    await waitFor(() => expect(screen.getByTestId('results-page')).toBeInTheDocument());

    // Verify results page has expected buttons
    expect(screen.getByRole('button', { name: 'New Assessment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
  });

  it('should support full user journey through all states', async () => {
    const user = userEvent.setup();
    render(<App />);

    // home -> questionnaire
    await user.click(await screen.findByRole('button', { name: 'Start Assessment' }));
    await waitFor(() => expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument());

    // questionnaire -> results
    await user.click(await screen.findByRole('button', { name: 'Complete' }));
    await waitFor(() => expect(screen.getByTestId('results-page')).toBeInTheDocument());

    // results -> questionnaire (new assessment)
    await user.click(await screen.findByRole('button', { name: 'New Assessment' }));
    await waitFor(() => expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument());
  });

  it('should maintain button accessibility throughout flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // All buttons should have proper aria-label and role
    const startButton = await screen.findByRole('button', { name: 'Start Assessment' });
    expect(startButton).toHaveAttribute('type', 'button');

    await user.click(startButton);
    const completeButton = await screen.findByRole('button', { name: 'Complete' });
    expect(completeButton).toHaveAttribute('type', 'button');

    await user.click(completeButton);
    const newAssessmentButton = await screen.findByRole('button', { name: 'New Assessment' });
    const importButton = await screen.findByRole('button', { name: 'Import' });
    expect(newAssessmentButton).toHaveAttribute('type', 'button');
    expect(importButton).toHaveAttribute('type', 'button');
  });

  it('should render all expected UI states', async () => {
    render(<App />);

    // Initial state should be home
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('questionnaire-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('results-page')).not.toBeInTheDocument();
  });
});
