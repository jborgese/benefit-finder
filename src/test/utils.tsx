/**
 * Test Utilities
 * 
 * Helper functions and utilities for writing tests.
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

/**
 * Custom render function that wraps components with providers
 * 
 * Usage:
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Create a wrapper with all necessary providers
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <>
        {/* Add global providers here when needed */}
        {/* <ThemeProvider> */}
        {/* <I18nProvider> */}
        {children}
        {/* </I18nProvider> */}
        {/* </ThemeProvider> */}
      </>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Wait for a condition to be true
 * 
 * @param condition Function that returns true when ready
 * @param timeout Maximum wait time in ms
 * @param interval Check interval in ms
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Create a mock user profile for testing
 */
export function createMockUserProfile(overrides = {}) {
  return {
    id: 'test-profile-123',
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1985-03-15',
    householdSize: 3,
    householdIncome: 35000,
    state: 'GA',
    zipCode: '30301',
    citizenship: 'US Citizen',
    employmentStatus: 'Employed',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create a mock benefit program for testing
 */
export function createMockBenefitProgram(overrides = {}) {
  return {
    id: 'test-program-123',
    name: 'SNAP (Food Stamps)',
    shortName: 'SNAP',
    description: 'Supplemental Nutrition Assistance Program',
    category: 'food' as const,
    jurisdiction: 'US-GA',
    website: 'https://dhs.georgia.gov',
    phoneNumber: '1-877-423-4746',
    applicationUrl: 'https://gateway.ga.gov',
    active: true,
    lastUpdated: Date.now(),
    createdAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create a mock eligibility rule for testing
 */
export function createMockEligibilityRule(overrides = {}) {
  return {
    id: 'test-rule-123',
    programId: 'test-program-123',
    name: 'Income Test',
    description: 'Test household income',
    ruleLogic: {
      '<=': [{ var: 'householdIncome' }, 50000],
    },
    requiredDocuments: ['Proof of income', 'ID'],
    version: '1.0',
    effectiveDate: Date.now(),
    expirationDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
    source: 'Federal guidelines',
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create a mock eligibility result for testing
 */
export function createMockEligibilityResult(overrides = {}) {
  return {
    id: 'test-result-123',
    userProfileId: 'test-profile-123',
    programId: 'test-program-123',
    ruleId: 'test-rule-123',
    eligible: true,
    confidence: 95,
    reason: 'Meets all criteria',
    nextSteps: ['Apply online at gateway.ga.gov', 'Gather required documents'],
    requiredDocuments: ['Proof of income', 'ID', 'Proof of residence'],
    evaluatedAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    ...overrides,
  };
}

/**
 * Mock fetch API responses
 * 
 * Usage:
 * ```tsx
 * mockFetch({ data: 'response' });
 * ```
 */
export function mockFetch(response: any, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as Response)
  );
}

/**
 * Mock localStorage for tests
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
}

/**
 * Suppress console methods for specific tests
 * 
 * Usage:
 * ```tsx
 * const restore = suppressConsole('error', 'warn');
 * // ... test code that produces warnings/errors
 * restore();
 * ```
 */
export function suppressConsole(...methods: Array<keyof Console>) {
  const original: Partial<Console> = {};
  
  methods.forEach((method) => {
    original[method] = console[method];
    console[method] = vi.fn();
  });
  
  return () => {
    methods.forEach((method) => {
      if (original[method]) {
        console[method] = original[method] as any;
      }
    });
  };
}

/**
 * Create a deferred promise for async testing
 * 
 * Usage:
 * ```tsx
 * const deferred = createDeferred();
 * someAsyncFunction().then(deferred.resolve);
 * await deferred.promise;
 * ```
 */
export function createDeferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return { promise, resolve, reject };
}

/**
 * Advance timers and flush promises
 * 
 * Useful when testing code with setTimeout/setInterval
 */
export async function advanceTimersAndFlush(ms: number) {
  vi.advanceTimersByTime(ms);
  await Promise.resolve();
}

