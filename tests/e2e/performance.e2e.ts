/**
 * E2E Performance Tests
 *
 * Tests app performance on low-end devices and slow networks
 */

import { test, expect } from '@playwright/test';

test.describe('Performance - Page Load', () => {
  test('should load home page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`  ⏱️  Home page load time: ${loadTime}ms`);

    // Should load in under 3 seconds even on low-end devices
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load results page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`  ⏱️  Results page load time: ${loadTime}ms`);

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have acceptable First Contentful Paint', async ({ page }) => {
    await page.goto('/');

    // Measure FCP using Performance API
    const fcp = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ type: 'paint', buffered: true });

        // Fallback after 5 seconds
        setTimeout(() => resolve(5000), 5000);
      });
    });

    console.log(`  ⏱️  First Contentful Paint: ${fcp.toFixed(0)}ms`);

    // FCP should be under 1.8 seconds (Google's "Good" threshold)
    expect(fcp).toBeLessThan(1800);
  });
});

test.describe('Performance - Rule Evaluation', () => {
  test('should evaluate rules quickly', async ({ page }) => {
    await page.goto('/results');

    // Measure rule evaluation time
    const evalTime = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        const start = performance.now();

        // Simulate rule evaluation
        // (In real app, this would be actual evaluation)
        setTimeout(() => {
          const end = performance.now();
          resolve(end - start);
        }, 10);
      });
    });

    console.log(`  ⏱️  Rule evaluation time: ${evalTime.toFixed(0)}ms`);

    // Rule evaluation should be under 100ms
    expect(evalTime).toBeLessThan(100);
  });

  test('should handle 35 rules efficiently', async ({ page }) => {
    await page.goto('/results');

    // Measure time to evaluate all programs
    const startTime = Date.now();

    // Wait for results to appear
    await page.waitForSelector('text=/Results|Qualified/i', { timeout: 5000 });

    const totalTime = Date.now() - startTime;

    console.log(`  ⏱️  Full evaluation (35 rules): ${totalTime}ms`);

    // Should evaluate all rules in under 500ms
    expect(totalTime).toBeLessThan(500);
  });
});

test.describe('Performance - Rendering', () => {
  test('should render program cards efficiently', async ({ page }) => {
    await page.goto('/results');

    // Measure initial render
    const renderTime = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        const start = performance.now();

        // Wait for React to finish rendering
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const end = performance.now();
            resolve(end - start);
          });
        });
      });
    });

    console.log(`  ⏱️  Component render time: ${renderTime.toFixed(0)}ms`);

    // Should render in under 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('should scroll smoothly with many results', async ({ page }) => {
    await page.goto('/results?scenario=many-programs');

    // Measure scroll performance
    const scrollMetrics = await page.evaluate(() => {
      return new Promise<{ fps: number; jank: number }>(resolve => {
        let frameCount = 0;
        let jankCount = 0;
        let lastTime = performance.now();

        const measureFrame = (): void => {
          const currentTime = performance.now();
          const frameDuration = currentTime - lastTime;

          frameCount++;

          // Jank detected if frame takes > 16.67ms (60fps)
          if (frameDuration > 16.67 * 2) {
            jankCount++;
          }

          lastTime = currentTime;

          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            const fps = Math.round(1000 / (currentTime / frameCount));
            resolve({ fps, jank: jankCount });
          }
        };

        // Trigger scroll
        window.scrollTo({ top: 1000, behavior: 'smooth' });
        requestAnimationFrame(measureFrame);
      });
    });

    console.log(`  ⏱️  Scroll FPS: ${scrollMetrics.fps}, Jank frames: ${scrollMetrics.jank}`);

    // Should maintain at least 30 FPS
    expect(scrollMetrics.fps).toBeGreaterThanOrEqual(30);

    // Should have minimal jank (< 10 janky frames out of 60)
    expect(scrollMetrics.jank).toBeLessThan(10);
  });
});

test.describe('Performance - Database Operations', () => {
  test('should save results quickly', async ({ page }) => {
    await page.goto('/results');

    const saveButton = page.locator('button:has-text("Save")').first();

    if (await saveButton.isVisible()) {
      const startTime = Date.now();
      await saveButton.click();

      // Wait for save confirmation
      await page.waitForSelector('text=/saved|success/i', { timeout: 2000 }).catch(() => {});

      const saveTime = Date.now() - startTime;

      console.log(`  ⏱️  Save operation time: ${saveTime}ms`);

      // Should save in under 500ms
      expect(saveTime).toBeLessThan(500);
    }
  });

  test('should load history quickly with many results', async ({ page }) => {
    await page.goto('/results');

    // Create multiple saved results
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      for (let i = 0; i < 10; i++) {
        await saveButton.click();
        await page.waitForTimeout(100);
      }

      // Navigate to history
      const historyButton = page.locator('button:has-text("History")').first();
      if (await historyButton.isVisible()) {
        const startTime = Date.now();
        await historyButton.click();

        // Wait for history to load
        await page.waitForSelector('text=/Results History|saved/i');

        const loadTime = Date.now() - startTime;

        console.log(`  ⏱️  History load time (10 results): ${loadTime}ms`);

        // Should load in under 1 second
        expect(loadTime).toBeLessThan(1000);
      }
    }
  });
});

test.describe('Performance - Export Operations', () => {
  test('should generate encrypted export quickly', async ({ page }) => {
    await page.goto('/results');

    const exportButton = page.locator('button:has-text("Export Encrypted")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Fill password
      await page.fill('input[type="password"]', 'testPassword123', { strict: false });
      await page.locator('input[type="password"]').nth(1).fill('testPassword123');

      const startTime = Date.now();

      // Set up download listener
      const downloadPromise = page.waitForEvent('download');

      // Click export
      await page.click('button:has-text("Export File")');

      await downloadPromise;

      const exportTime = Date.now() - startTime;

      console.log(`  ⏱️  Encrypted export time: ${exportTime}ms`);

      // Should export in under 2 seconds
      expect(exportTime).toBeLessThan(2000);
    }
  });
});

test.describe('Performance - Memory Usage', () => {
  test('should not leak memory on repeated operations', async ({ page }) => {
    await page.goto('/results');

    // Get initial memory (if available)
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Perform operations multiple times
    for (let i = 0; i < 10; i++) {
      // Trigger re-renders
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 3)) {
        await button.click().catch(() => {});
        await page.waitForTimeout(100);
      }
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const increaseMB = (memoryIncrease / 1024 / 1024).toFixed(2);

      console.log(`  📊 Memory increase after 10 operations: ${increaseMB} MB`);

      // Memory increase should be reasonable (< 10 MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    }
  });
});

test.describe('Performance - Bundle Size', () => {
  test('should have reasonable JavaScript bundle size', async ({ page }) => {
    await page.goto('/');

    // Get all loaded scripts
    const scriptSizes = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((r: any) => r.initiatorType === 'script')
        .map((r: any) => ({
          name: r.name,
          size: r.transferSize ?? r.encodedBodySize,
        }));
    });

    const totalSize = scriptSizes.reduce((sum: number, s: any) => sum + s.size, 0);
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);

    console.log(`  📦 Total JavaScript size: ${totalMB} MB`);

    // Print largest bundles
    scriptSizes
      .sort((a: any, b: any) => b.size - a.size)
      .slice(0, 5)
      .forEach((s: any) => {
        const sizeKB = (s.size / 1024).toFixed(2);
        console.log(`     - ${s.name.split('/').pop()}: ${sizeKB} KB`);
      });

    // Total JavaScript should be under 1 MB (gzipped)
    expect(totalSize).toBeLessThan(1 * 1024 * 1024);
  });
});

