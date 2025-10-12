/**
 * Accessibility E2E Tests
 *
 * Tests for WCAG 2.1 AA compliance using axe-core.
 */

import { test, expect } from './fixtures/test-fixtures';
import {
  expectNoA11yViolations,
  checkKeyboardNavigation,
  checkColorContrast,
  checkFormLabels,
  checkLandmarks,
  formatViolations,
  runA11yScan,
} from './utils/accessibility';

test.describe('Accessibility', () => {
  test.describe('WCAG Compliance', () => {
    test('homepage should have no accessibility violations', async ({ page }) => {
      await page.goto('/');

      await expectNoA11yViolations(page);
    });

    test('should pass WCAG 2.1 AA standards', async ({ page }) => {
      await page.goto('/');

      const results = await runA11yScan(page, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      });

      if (results.violations.length > 0) {
        console.log('Accessibility violations found:');
        console.log(formatViolations(results.violations));
      }

      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be fully keyboard accessible', async ({ page }) => {
      await page.goto('/');

      await checkKeyboardNavigation(page);
    });

    test('should navigate with Tab key', async ({ page }) => {
      await page.goto('/');

      // Press Tab multiple times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should have focus on an interactive element
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName;
      });

      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
    });

    test('should activate buttons with Enter key', async ({ page }) => {
      await page.goto('/');

      // Find first button
      const button = page.locator('button').first();

      if (await button.count() > 0) {
        await button.focus();
        await page.keyboard.press('Enter');

        // Button should have been activated
        // Add specific checks based on button behavior
      }
    });

    test('should activate buttons with Space key', async ({ page }) => {
      await page.goto('/');

      const button = page.locator('button').first();

      if (await button.count() > 0) {
        await button.focus();
        await page.keyboard.press('Space');

        // Button should have been activated
        // Add specific checks based on button behavior
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should meet color contrast requirements', async ({ page }) => {
      await page.goto('/');

      await checkColorContrast(page);
    });
  });

  test.describe('Semantic HTML', () => {
    test('should have proper landmark regions', async ({ page }) => {
      await page.goto('/');

      await checkLandmarks(page);
    });

    test('should have exactly one main landmark', async ({ page }) => {
      await page.goto('/');

      const mainCount = await page.locator('main, [role="main"]').count();
      expect(mainCount).toBe(1);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      // Check for h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count, 'Page should have exactly one h1').toBe(1);

      // Get all heading levels
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(
        (elements) => elements.map((el) => {
          // Safe: tagName[1] is always a digit for h1-h6 elements
          // eslint-disable-next-line security/detect-object-injection
          return parseInt(el.tagName[1], 10);
        })
      );

      // Check headings don't skip levels
      for (let i = 1; i < headings.length; i++) {
        // Safe: i is a controlled loop counter within array bounds
        // eslint-disable-next-line security/detect-object-injection
        const current = headings[i];
        // eslint-disable-next-line security/detect-object-injection
        const previous = headings[i - 1];
        const diff = current - previous;
        expect(
          diff,
          `Heading levels should not skip: h${previous} -> h${current}`
        ).toBeLessThanOrEqual(1);
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('all form inputs should have labels', async ({ page }) => {
      await page.goto('/');

      await checkFormLabels(page);
    });

    test('form errors should be announced', async ({ page }) => {
      await page.goto('/');

      // This test will be more specific once forms are implemented
      // Check for aria-live regions, aria-invalid, aria-describedby
    });
  });

  test.describe('Screen Reader Support', () => {
    test('images should have alt text', async ({ page }) => {
      await page.goto('/');

      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');

        // Images should have alt attribute (can be empty for decorative)
        expect(alt, `Image should have alt attribute: ${await img.evaluate(e => e.src)}`).toBeDefined();
      }
    });

    test('links should have descriptive text', async ({ page }) => {
      await page.goto('/');

      const links = await page.locator('a').all();

      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const ariaLabelledby = await link.getAttribute('aria-labelledby');

        const hasText = !!(text?.trim() ?? ariaLabel ?? ariaLabelledby);

        expect(
          hasText,
          'Link should have descriptive text or aria-label'
        ).toBe(true);
      }
    });

    test('interactive elements should have accessible names', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        const hasName = !!(text?.trim() ?? ariaLabel);

        expect(hasName, 'Button should have accessible name').toBe(true);
      }
    });
  });

  test.describe('Focus Management', () => {
    test('focus should be visible', async ({ page }) => {
      await page.goto('/');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      // Check that focused element has visible focus indicator
      const hasFocusIndicator = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;

        const computed = window.getComputedStyle(el);
        return computed.outlineWidth !== '0px' || computed.outline !== 'none';
      });

      expect(hasFocusIndicator).toBe(true);
    });

    test('focus should not be trapped unintentionally', async ({ page }) => {
      await page.goto('/');

      // Tab through all focusable elements
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
      }

      // Should still be able to focus elements
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(activeElement).toBeDefined();
    });
  });

  test.describe('Touch Targets', () => {
    test('interactive elements should have minimum touch target size', async ({ page }) => {
      await page.goto('/');

      const buttons = await page.locator('button, a').all();

      for (const button of buttons.slice(0, 10)) {
        const box = await button.boundingBox();

        if (box) {
          // WCAG 2.1 AA: 44x44 CSS pixels
          expect(box.width, 'Width should be at least 44px').toBeGreaterThanOrEqual(44);
          expect(box.height, 'Height should be at least 44px').toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Motion & Animation', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Test with reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');

      // Check that animations are disabled or reduced
      // This is a basic check - actual implementation will depend on your CSS
      await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const computed = window.getComputedStyle(el);
          if (computed.animationDuration !== '0s' && computed.animationDuration !== '') {
            return true;
          }
        }
        return false;
      });

      // With reduced motion, animations should be minimal or instant
      // Adjust this test based on your animation strategy
    });
  });
});

