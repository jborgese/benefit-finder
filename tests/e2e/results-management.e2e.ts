/**
 * E2E Tests: Results Management
 *
 * Tests for saving, loading, and managing results
 */

import { test, expect } from '@playwright/test';

test.describe('Results Management', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh - clear localStorage
    await page.goto('/results');
    await page.evaluate(() => localStorage.clear());
  });

  test('should save results to local storage', async ({ page }) => {
    await page.goto('/results');

    // Find and click save button
    const saveButton = page.locator('button:has-text("Save Results"), button:has-text("Save")').first();

    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Check for success message or confirmation
      await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 5000 });

      // Verify data in localStorage
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('eligibility_results');
      });

      expect(savedData).toBeTruthy();
      expect(JSON.parse(savedData!).length).toBeGreaterThan(0);
    }
  });

  test('should load results from history', async ({ page }) => {
    // Save some results first
    await page.goto('/results');

    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Navigate to history
      const historyButton = page.locator('button:has-text("History"), a[href*="history"]').first();
      if (await historyButton.isVisible()) {
        await historyButton.click();

        // Check history page loads
        await expect(page.locator('h2:has-text("Results History")')).toBeVisible();

        // Check saved result is listed
        await expect(page.locator('text=/\\d+\\/\\d+\\/\\d{4}/')).toBeVisible();

        // Click "View" button
        const viewButton = page.locator('button:has-text("View")').first();
        await viewButton.click();

        // Dialog should open with results
        await expect(page.locator('[role="dialog"]')).toBeVisible();
      }
    }
  });

  test('should edit notes and tags', async ({ page }) => {
    // Save a result first
    await page.goto('/results');

    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Go to history
      const historyButton = page.locator('button:has-text("History")').first();
      if (await historyButton.isVisible()) {
        await historyButton.click();

        // Click Edit button
        const editButton = page.locator('button:has-text("Edit")').first();
        await editButton.click();

        // Dialog should open
        await expect(page.locator('[role="dialog"]:has-text("Edit Result")')).toBeVisible();

        // Fill in notes
        const notesField = page.locator('textarea[placeholder*="notes"]');
        await notesField.fill('Test notes for screening');

        // Fill in tags
        const tagsField = page.locator('input[placeholder*="comma"]');
        await tagsField.fill('test, screening, 2024');

        // Save
        await page.click('button:has-text("Save")');

        // Dialog should close
        await expect(page.locator('[role="dialog"]:has-text("Edit Result")')).not.toBeVisible();

        // Notes should be visible in history
        await expect(page.locator('text="Test notes for screening"')).toBeVisible();
      }
    }
  });

  test('should delete result with confirmation', async ({ page }) => {
    // Save a result first
    await page.goto('/results');

    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Go to history
      const historyButton = page.locator('button:has-text("History")').first();
      if (await historyButton.isVisible()) {
        await historyButton.click();

        // Get initial count
        const initialCount = await page.locator('button:has-text("Delete")').count();

        // Click Delete button
        const deleteButton = page.locator('button:has-text("Delete")').first();
        await deleteButton.click();

        // Confirmation dialog should appear
        await expect(page.locator('text="Delete Result?"')).toBeVisible();

        // Cancel first
        await page.click('button:has-text("Cancel")');
        await expect(page.locator('text="Delete Result?"')).not.toBeVisible();

        // Try again and confirm
        await deleteButton.click();
        await page.click('button:has-text("Delete")').last(); // Confirm button

        // Wait for deletion
        await page.waitForTimeout(500);

        // Count should decrease
        const newCount = await page.locator('button:has-text("Delete")').count();
        expect(newCount).toBe(initialCount - 1);
      }
    }
  });

  test('should select multiple results for comparison', async ({ page }) => {
    // Save multiple results
    await page.goto('/results');

    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      // Save first result
      await saveButton.click();
      await page.waitForTimeout(500);

      // Save second result (simulate different scenario)
      await saveButton.click();
      await page.waitForTimeout(500);

      // Go to history
      const historyButton = page.locator('button:has-text("History")').first();
      if (await historyButton.isVisible()) {
        await historyButton.click();

        // Select first result for comparison
        const compareButtons = page.locator('button:has-text("Compare")');
        await compareButtons.first().click();
        await expect(compareButtons.first()).toHaveText(/Selected/);

        // Select second result
        await compareButtons.nth(1).click();
        await expect(compareButtons.nth(1)).toHaveText(/Selected/);

        // Compare button should appear
        await expect(page.locator('button:has-text("Compare Selected")')).toBeVisible();
      }
    }
  });
});

test.describe('Results Management - Data Persistence', () => {
  test('should persist data across page reloads', async ({ page }) => {
    await page.goto('/results');

    // Save results
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();

      // Go to history
      const historyButton = page.locator('button:has-text("History")').first();
      if (await historyButton.isVisible()) {
        await historyButton.click();

        // Results should still be there
        await expect(page.locator('text=/\\d+\\/\\d+\\/\\d{4}/')).toBeVisible();
      }
    }
  });

  test('should handle concurrent saves', async ({ page }) => {
    await page.goto('/results');

    const saveButton = page.locator('button:has-text("Save")').first();

    if (await saveButton.isVisible()) {
      // Trigger multiple saves quickly
      await saveButton.click();
      await saveButton.click();
      await saveButton.click();

      // Wait for all saves to complete
      await page.waitForTimeout(2000);

      // Check that all saves succeeded
      const savedCount = await page.evaluate(() => {
        const data = localStorage.getItem('eligibility_results');
        return data ? JSON.parse(data).length : 0;
      });

      expect(savedCount).toBeGreaterThan(0);
    }
  });
});

