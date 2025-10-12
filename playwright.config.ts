/**
 * Playwright E2E Testing Configuration
 *
 * Comprehensive configuration for end-to-end and accessibility testing.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Test matching patterns
  testMatch: '**/*.e2e.{ts,tsx}',

  // Timeouts
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5 * 1000, // 5 seconds for assertions
  },

  // Parallel execution
  fullyParallel: true,

  // CI settings
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Global settings
  use: {
    // Base URL
    baseURL: 'http://localhost:5173',

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Browser context options
    ignoreHTTPSErrors: true,

    // Artifacts
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Color scheme
    colorScheme: 'light',
  },

  // Development server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Test projects (different browsers and viewports)
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        // Safari doesn't support clipboard-write permission
      },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        // Safari doesn't support clipboard-write permission
      },
    },

    // Tablet
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },

    // Accessibility testing project
    {
      name: 'a11y',
      testMatch: '**/*.a11y.{ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },
  ],
});
