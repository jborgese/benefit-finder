/**
 * E2E Test Helpers
 * 
 * Utility functions for Playwright tests.
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded and hydrated
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for React to be ready
  await page.waitForFunction(() => {
    return document.readyState === 'complete';
  });
}

/**
 * Clear all storage (localStorage, sessionStorage, IndexedDB)
 */
export async function clearAllStorage(page: Page): Promise<void> {
  await page.context().clearCookies();
  
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB
    const databases = await window.indexedDB.databases();
    for (const db of databases) {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    }
  });
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * Wait for an element to be visible and stable
 */
export async function waitForStable(locator: Locator): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  
  // Wait for animations to complete
  await locator.evaluate((element) => {
    return Promise.all(
      element.getAnimations().map((animation) => animation.finished)
    );
  });
}

/**
 * Fill form field with validation
 */
export async function fillFormField(
  page: Page,
  label: string,
  value: string
): Promise<void> {
  const input = page.getByLabel(label, { exact: false });
  await input.fill(value);
  
  // Verify value was set
  await expect(input).toHaveValue(value);
}

/**
 * Click button and wait for navigation or action
 */
export async function clickAndWait(
  locator: Locator,
  waitFor: 'navigation' | 'response' | 'load' = 'load'
): Promise<void> {
  const page = locator.page();
  
  if (waitFor === 'navigation') {
    await Promise.all([
      page.waitForNavigation(),
      locator.click(),
    ]);
  } else if (waitFor === 'response') {
    await Promise.all([
      page.waitForResponse((response) => response.ok()),
      locator.click(),
    ]);
  } else {
    await locator.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Check if element is visible in viewport
 */
export async function isInViewport(locator: Locator): Promise<boolean> {
  return await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
}

/**
 * Scroll element into view smoothly
 */
export async function scrollIntoView(locator: Locator): Promise<void> {
  await locator.evaluate((element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  
  // Wait for scroll to complete
  await locator.page().waitForTimeout(500);
}

/**
 * Get localStorage data
 */
export async function getLocalStorage(page: Page): Promise<Record<string, string>> {
  return await page.evaluate(() => {
    const items: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items[key] = localStorage.getItem(key) || '';
      }
    }
    return items;
  });
}

/**
 * Set localStorage data
 */
export async function setLocalStorage(
  page: Page,
  data: Record<string, string>
): Promise<void> {
  await page.evaluate((storageData) => {
    Object.entries(storageData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }, data);
}

/**
 * Check console for errors
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Mock IndexedDB operations for testing
 */
export async function mockIndexedDB(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Mock IndexedDB if needed for specific tests
    // This is already handled by fake-indexeddb in the app
  });
}

/**
 * Simulate slow network
 */
export async function simulateSlowNetwork(page: Page): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 50 * 1024 / 8, // 50 KB/s
    uploadThroughput: 20 * 1024 / 8,   // 20 KB/s
    latency: 500, // 500ms
  });
}

/**
 * Wait for all images to load
 */
export async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        });
      })
    );
  });
}

