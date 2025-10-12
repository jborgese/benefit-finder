/**
 * Test Utilities Index
 * 
 * Main export file for all test utilities and helpers.
 */

// Test utilities
export {
  renderWithProviders,
  waitFor,
  createMockUserProfile,
  createMockBenefitProgram,
  createMockEligibilityRule,
  createMockEligibilityResult,
  mockFetch,
  mockLocalStorage,
  suppressConsole,
  createDeferred,
  advanceTimersAndFlush,
} from './utils';

// Store mocks
export {
  mockAppSettingsStore,
  mockUIStore,
  mockQuestionnaireStore,
  resetAllStoreMocks,
} from './mocks/zustand';

// Re-export testing library utilities
export { render, screen, fireEvent, waitFor as waitForElement } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { renderHook, act } from '@testing-library/react';

// Re-export vitest utilities
export { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';

