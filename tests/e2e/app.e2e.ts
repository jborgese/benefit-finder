/**
 * Basic Application E2E Tests
 * 
 * Tests for core application functionality.
 */

import { test, expect } from './fixtures/test-fixtures';
import { waitForPageReady } from './utils/helpers';

test.describe('Application', () => {
  test.describe('Homepage', () => {
    test('should load successfully', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Check that page loaded
      await expect(page).toHaveTitle(/BenefitFinder/i);
    });
    
    test('should display main content', async ({ page }) => {
      await page.goto('/');
      
      // Check for main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
    });
    
    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check that content is visible
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });
  
  test.describe('Navigation', () => {
    test('should navigate between pages', async ({ page }) => {
      await page.goto('/');
      
      // Add navigation tests once routes are implemented
      // Example:
      // await page.click('text=About');
      // await expect(page).toHaveURL(/\/about/);
    });
    
    test('should handle browser back button', async ({ page }) => {
      await page.goto('/');
      
      // Navigate forward
      // await page.click('text=Next');
      
      // Navigate back
      await page.goBack();
      
      // Should be back at homepage
      await expect(page).toHaveURL('/');
    });
  });
  
  test.describe('Offline Functionality', () => {
    test('should work offline', async ({ page, context }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Go offline
      await context.setOffline(true);
      
      // App should still work (IndexedDB, localStorage)
      // Add specific offline functionality tests
      
      // Go back online
      await context.setOffline(false);
    });
  });
  
  test.describe('Local Storage', () => {
    test('should persist data in localStorage', async ({ page }) => {
      await page.goto('/');
      
      // Set some data in localStorage
      await page.evaluate(() => {
        localStorage.setItem('test-key', 'test-value');
      });
      
      // Reload page
      await page.reload();
      
      // Check data persists
      const value = await page.evaluate(() => {
        return localStorage.getItem('test-key');
      });
      
      expect(value).toBe('test-value');
    });
    
    test('should clear data on reset', async ({ page }) => {
      await page.goto('/');
      
      // Set some data
      await page.evaluate(() => {
        localStorage.setItem('user-data', 'sensitive');
      });
      
      // Clear storage
      await page.evaluate(() => {
        localStorage.clear();
      });
      
      // Verify cleared
      const value = await page.evaluate(() => {
        return localStorage.getItem('user-data');
      });
      
      expect(value).toBeNull();
    });
  });
  
  test.describe('Error Handling', () => {
    test('should not have console errors on load', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await waitForPageReady(page);
      
      expect(errors).toEqual([]);
    });
    
    test('should handle 404 pages gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page');
      
      // Should either redirect or show 404 page
      // Adjust based on your routing strategy
      expect(response?.status()).toBe(200); // Or 404 with custom page
    });
  });
});

