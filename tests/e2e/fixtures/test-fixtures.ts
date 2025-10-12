/**
 * Playwright Test Fixtures
 *
 * Custom fixtures for BenefitFinder testing.
 * Provides reusable setup and utilities for tests.
 */

import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

// Extended test context with custom fixtures
type TestFixtures = {
  // Authenticated user page (if auth is added later)
  authenticatedPage: Page;

  // Page with cleared storage
  cleanPage: Page;

  // Page with mock data
  pageWithData: Page;
};

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<TestFixtures>({
  /**
   * Clean page fixture - starts with cleared storage
   */
  cleanPage: async ({ page }, use) => {
    // Clear all storage before test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },

  /**
   * Page with mock data fixture
   */
  pageWithData: async ({ page }, use) => {
    // Set up mock data in localStorage
    await page.goto('/');

    await page.evaluate(() => {
      // Add mock settings
      localStorage.setItem('benefit-finder-settings', JSON.stringify({
        theme: 'light',
        language: 'en',
        state: {
          theme: 'light',
          fontSize: 'medium',
          language: 'en',
          autoSaveEnabled: true,
          encryptionEnabled: true,
        },
      }));
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },

  /**
   * Authenticated page fixture (for future use)
   */
  authenticatedPage: async ({ page }, use) => {
    // For now, just a regular page
    // Later, add authentication logic here
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from '@playwright/test';

