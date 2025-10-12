/**
 * Playwright Configuration for Low-End Device Testing
 *
 * Simulates low-end Android devices and slow networks for performance testing
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  fullyParallel: false, // Run sequentially for performance tests
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for performance tests
  workers: 1, // Single worker for consistent results

  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/performance-results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'low-end-android',
      use: {
        ...devices['Galaxy S5'], // Low-end Android simulation

        // CPU throttling (4x slowdown - simulates budget phone)
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
          ],
        },

        // Network throttling (Slow 3G)
        offline: false,

        // Viewport
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'low-end-desktop',
      use: {
        // Simulates older desktop with slow CPU
        viewport: { width: 1280, height: 720 },

        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
          ],
        },
      },
    },

    {
      name: 'slow-network',
      use: {
        ...devices['Pixel 5'],

        // Simulate slow 3G network
        // Note: Playwright doesn't have built-in network throttling,
        // but we can use CDP (Chrome DevTools Protocol)
        launchOptions: {
          slowMo: 100, // Slow down actions by 100ms
        },
      },
    },

    {
      name: 'offline-mode',
      use: {
        ...devices['iPhone 12'],
        offline: true, // Test complete offline functionality
      },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

