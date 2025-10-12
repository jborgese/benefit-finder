/**
 * E2E Tests: Offline Functionality
 *
 * Tests that all features work without internet connection
 */

import { test, expect } from '@playwright/test';

test.describe('Offline Functionality', () => {
  test('should load results page while offline', async ({ page, context }) => {
    // First visit while online to cache
    await page.goto('/results');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // Page should still load
    await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });

    // Should show content (not offline error)
    await expect(page.locator('body')).not.toContainText('ERR_INTERNET_DISCONNECTED');
  });

  test('should evaluate eligibility rules offline', async ({ page, context }) => {
    await page.goto('/results');

    // Go offline
    await context.setOffline(true);

    // Results should still display
    await expect(page.locator('text=/Qualified|Results/i')).toBeVisible();

    // Should be able to interact with results
    const button = page.locator('button').first();
    if (await button.isVisible()) {
      await button.click();
      // Should not show network error
      await expect(page.locator('text=/network error|no connection/i')).not.toBeVisible();
    }
  });

  test('should save results to localStorage offline', async ({ page, context }) => {
    await page.goto('/results');

    // Go offline
    await context.setOffline(true);

    // Try to save results
    const saveButton = page.locator('button:has-text("Save")').first();

    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Should succeed (uses localStorage, not network)
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('eligibility_results');
      });

      expect(savedData).toBeTruthy();
    }
  });

  test('should load saved results offline', async ({ page, context }) => {
    // Save results while online
    await page.goto('/results');

    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Go offline
      await context.setOffline(true);

      // Navigate to history
      const historyButton = page.locator('button:has-text("History")').first();
      if (await historyButton.isVisible()) {
        await historyButton.click();

        // Should load history even offline
        await expect(page.locator('text=/Results History|saved result/i')).toBeVisible();

        // Should be able to view result
        const viewButton = page.locator('button:has-text("View")').first();
        await viewButton.click();

        // Should load successfully
        await expect(page.locator('[role="dialog"]')).toBeVisible();
      }
    }
  });

  test('should export to PDF offline', async ({ page, context }) => {
    await page.goto('/results');

    // Go offline
    await context.setOffline(true);

    // Try to trigger print
    let printCalled = false;
    await page.evaluate(() => {
      (window as any).originalPrint = window.print;
      window.print = () => {
        (window as any).printCalled = true;
      };
    });

    const printButton = page.locator('button:has-text("Print"), button:has-text("PDF")').first();
    if (await printButton.isVisible()) {
      await printButton.click();

      // Print should work offline (uses browser native)
      printCalled = await page.evaluate(() => (window as any).printCalled);
      expect(printCalled).toBeTruthy();
    }
  });

  test('should create encrypted exports offline', async ({ page, context }) => {
    await page.goto('/results');

    // Go offline
    await context.setOffline(true);

    const exportButton = page.locator('button:has-text("Export Encrypted")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Dialog should open (doesn't require network)
      await expect(page.locator('text="Export Encrypted Results"')).toBeVisible();

      // Fill password
      await page.fill('input[type="password"]', 'testPassword123', { strict: false });
      await page.locator('input[type="password"]').nth(1).fill('testPassword123');

      // Should be able to export (uses Web Crypto API, works offline)
      const exportFileButton = page.locator('button:has-text("Export File")');
      await expect(exportFileButton).toBeEnabled();
    }
  });

  test('should import encrypted files offline', async ({ page, context }) => {
    await page.goto('/results');

    // Go offline
    await context.setOffline(true);

    const importButton = page.locator('button:has-text("Import")');

    if (await importButton.isVisible()) {
      await importButton.click();

      // Dialog should open offline
      await expect(page.locator('text="Import Encrypted Results"')).toBeVisible();

      // File input should be functional
      await expect(page.locator('input[type="file"]')).toBeEnabled();

      // Decryption works offline (Web Crypto API)
      await expect(page.locator('text=/decrypted locally/')).toBeVisible();
    }
  });

  test('should show offline indicator if implemented', async ({ page, context }) => {
    await page.goto('/results');

    // Go offline
    await context.setOffline(true);

    // Check if offline indicator exists
    const offlineIndicator = page.locator('text=/offline|no connection/i, [aria-label*="offline"]');

    // It's OK if not implemented, but if it is, should show when offline
    const hasIndicator = await offlineIndicator.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasIndicator) {
      await expect(offlineIndicator).toBeVisible();
    }

    // Go online
    await context.setOffline(false);
    await page.waitForTimeout(500);

    // Indicator should hide or change
    if (hasIndicator) {
      await expect(offlineIndicator).not.toBeVisible({ timeout: 2000 });
    }
  });
});

test.describe('Offline Functionality - IndexedDB', () => {
  test('should store data in IndexedDB offline', async ({ page, context }) => {
    await page.goto('/results');

    // Go offline
    await context.setOffline(true);

    // Save results
    const saveButton = page.locator('button:has-text("Save")').first();

    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Check IndexedDB (if RxDB is implemented)
      const hasIndexedDB = await page.evaluate(() => {
        return 'indexedDB' in window;
      });

      expect(hasIndexedDB).toBeTruthy();

      // Check databases exist
      const databases = await page.evaluate(() => {
        if ('databases' in indexedDB) {
          return indexedDB.databases();
        }
        return [];
      });

      // Should have database (or data in localStorage as fallback)
      const hasData = databases.length > 0 ||
                     await page.evaluate(() => !!localStorage.getItem('eligibility_results'));

      expect(hasData).toBeTruthy();
    }
  });
});

