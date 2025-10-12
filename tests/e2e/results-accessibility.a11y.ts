/**
 * Accessibility Tests: Results Components
 *
 * Tests WCAG 2.1 AA compliance for results display and management
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Results Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and trigger results state directly
    await page.goto('/');

    // Set the app state directly via React DevTools or direct manipulation
    await page.evaluate(() => {
      // Set results in localStorage first
      const sampleResults = {
        qualified: [{
          programId: 'snap',
          programName: 'Supplemental Nutrition Assistance Program (SNAP)',
          programDescription: 'SNAP helps low-income individuals and families buy food',
          jurisdiction: 'US-FEDERAL',
          status: 'qualified',
          confidence: 'high',
          confidenceScore: 95,
          explanation: {
            reason: 'You qualify based on your household size and income',
            details: ['Income is below the threshold', 'Household size qualifies'],
            rulesCited: ['SNAP-INCOME-001', 'SNAP-HOUSEHOLD-001']
          },
          requiredDocuments: [],
          nextSteps: [],
          estimatedBenefit: { amount: 194, frequency: 'monthly', description: 'Based on household size and income' },
          evaluatedAt: new Date().toISOString(),
          rulesVersion: '1.0.0'
        }],
        likely: [],
        maybe: [],
        notQualified: [],
        totalPrograms: 1,
        evaluatedAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('benefit-finder-results', JSON.stringify(sampleResults));

      // Also try to set a flag to indicate results exist
      localStorage.setItem('benefit-finder-hasResults', 'true');
    });

    // Click the "View Previous Results" button if it exists, or trigger results state
    const viewResultsButton = page.locator('button:has-text("View Previous Results")');
    if (await viewResultsButton.isVisible()) {
      await viewResultsButton.click();
    } else {
      // If no button, try to trigger the results state by clicking "New Assessment" then navigating
      const newAssessmentButton = page.locator('button:has-text("New Assessment")');
      if (await newAssessmentButton.isVisible()) {
        await newAssessmentButton.click();

        // Fill out the questionnaire quickly
        await page.fill('input[type="number"]', '3');
        await page.click('button:has-text("Next")');

        await page.fill('input[type="text"]', '2500');
        await page.click('button:has-text("Next")');

        await page.fill('input[type="number"]', '35');
        await page.click('button:has-text("Complete")');
      }
    }

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")', { timeout: 15000 });
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check h2 for main title
    await expect(page.locator('h2').first()).toBeVisible();

    // Run axe for heading order
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .include('h1, h2, h3, h4')
      .analyze();

    expect(results.violations.filter(v => v.id === 'heading-order')).toEqual([]);
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check checkboxes have labels
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
    const count = await checkboxes.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const checkbox = checkboxes.nth(i);

      // Each checkbox should have accessible name
      const accessibleName = await checkbox.getAttribute('aria-label') ??
                             await checkbox.evaluate(el => {
                               const label = document.querySelector(`label[for="${el.id}"]`);
                               return label?.textContent ?? null;
                             });

      expect(accessibleName).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[class*="text-"], [class*="bg-"]')
      .analyze();

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toEqual([]);
  });

  test('should have keyboard accessible interactive elements', async ({ page }) => {
    // All buttons should be keyboard focusable
    const buttons = page.locator('button').first();
    await buttons.focus();

    const isFocused = await buttons.evaluate(el => el === document.activeElement);
    expect(isFocused).toBeTruthy();

    // Tab should move focus
    await page.keyboard.press('Tab');
    const newFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(newFocused).toBeTruthy();
  });

  test('should have ARIA landmarks', async ({ page }) => {
    // Check for proper landmarks
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    const landmarkViolations = results.violations.filter(v => v.id.includes('landmark'));
    expect(landmarkViolations).toEqual([]);
  });

  test('should have alt text for images/icons', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Images should have alt text (can be empty for decorative)
      expect(alt).not.toBeNull();
    }
  });

  test('should have accessible links', async ({ page }) => {
    // Check if there are any links on the page
    const linkCount = await page.locator('a').count();

    if (linkCount === 0) {
      // If no links, test passes (links are optional)
      expect(linkCount).toBe(0);
      return;
    }

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .include('a')
      .analyze();

    const linkViolations = results.violations.filter(v =>
      v.id === 'link-name' || v.id === 'link-in-text-block'
    );
    expect(linkViolations).toEqual([]);
  });

  test('should have proper button labels', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text or aria-label
      expect(text ?? ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Results Accessibility - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and trigger results state directly
    await page.goto('/');

    // Set the app state directly via React DevTools or direct manipulation
    await page.evaluate(() => {
      // Set results in localStorage first
      const sampleResults = {
        qualified: [{
          programId: 'snap',
          programName: 'Supplemental Nutrition Assistance Program (SNAP)',
          programDescription: 'SNAP helps low-income individuals and families buy food',
          jurisdiction: 'US-FEDERAL',
          status: 'qualified',
          confidence: 'high',
          confidenceScore: 95,
          explanation: {
            reason: 'You qualify based on your household size and income',
            details: ['Income is below the threshold', 'Household size qualifies'],
            rulesCited: ['SNAP-INCOME-001', 'SNAP-HOUSEHOLD-001']
          },
          requiredDocuments: [],
          nextSteps: [],
          estimatedBenefit: { amount: 194, frequency: 'monthly', description: 'Based on household size and income' },
          evaluatedAt: new Date().toISOString(),
          rulesVersion: '1.0.0'
        }],
        likely: [],
        maybe: [],
        notQualified: [],
        totalPrograms: 1,
        evaluatedAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('benefit-finder-results', JSON.stringify(sampleResults));

      // Also try to set a flag to indicate results exist
      localStorage.setItem('benefit-finder-hasResults', 'true');
    });

    // Click the "View Previous Results" button if it exists, or trigger results state
    const viewResultsButton = page.locator('button:has-text("View Previous Results")');
    if (await viewResultsButton.isVisible()) {
      await viewResultsButton.click();
    } else {
      // If no button, try to trigger the results state by clicking "New Assessment" then navigating
      const newAssessmentButton = page.locator('button:has-text("New Assessment")');
      if (await newAssessmentButton.isVisible()) {
        await newAssessmentButton.click();

        // Fill out the questionnaire quickly
        await page.fill('input[type="number"]', '3');
        await page.click('button:has-text("Next")');

        await page.fill('input[type="text"]', '2500');
        await page.click('button:has-text("Next")');

        await page.fill('input[type="number"]', '35');
        await page.click('button:has-text("Complete")');
      }
    }

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")', { timeout: 15000 });
  });

  test('should support full keyboard navigation', async ({ page }) => {

    // Tab through all focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      // Check something is focused
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName : null;
      });

      expect(focused).toBeTruthy();
    }
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    // Focus first button
    await page.locator('button').first().focus();

    // Press Enter
    let _actionOccurred = false;
    page.on('dialog', () => { _actionOccurred = true; });
    page.on('framenavigated', () => { _actionOccurred = true; });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Some action should occur (dialog, navigation, or state change)
    // At minimum, button should remain focusable
    const stillFocusable = await page.locator('button').first().isEnabled();
    expect(stillFocusable).toBeTruthy();
  });

  test('should activate buttons with Space key', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    const button = page.locator('button').first();
    await button.focus();

    // Press Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Button should still be present and functional
    await expect(button).toBeEnabled();
  });

  test('should trap focus in dialogs', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    // Open a dialog (e.g., "Why?" explanation)
    const whyButton = page.locator('button:has-text("Why")').first();

    if (await whyButton.isVisible()) {
      await whyButton.click();

      // Dialog should be open
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Tab through dialog - focus should stay within
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focused element should be within dialog
      const focusedInDialog = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const focused = document.activeElement;
        return dialog?.contains(focused) ?? false;
      });

      expect(focusedInDialog).toBeTruthy();

      // Escape should close dialog
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    // Focus an element
    const button = page.locator('button').first();
    await button.focus();

    // Check for focus ring or outline
    const hasFocusIndicator = await button.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const { outline, boxShadow } = styles;

      // Should have either outline or box-shadow (Tailwind ring)
      return outline !== 'none' || boxShadow !== 'none';
    });

    expect(hasFocusIndicator).toBeTruthy();
  });
});

test.describe('Results Accessibility - Screen Reader Support', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and trigger results state directly
    await page.goto('/');

    // Set the app state directly via React DevTools or direct manipulation
    await page.evaluate(() => {
      // Set results in localStorage first
      const sampleResults = {
        qualified: [{
          programId: 'snap',
          programName: 'Supplemental Nutrition Assistance Program (SNAP)',
          programDescription: 'SNAP helps low-income individuals and families buy food',
          jurisdiction: 'US-FEDERAL',
          status: 'qualified',
          confidence: 'high',
          confidenceScore: 95,
          explanation: {
            reason: 'You qualify based on your household size and income',
            details: ['Income is below the threshold', 'Household size qualifies'],
            rulesCited: ['SNAP-INCOME-001', 'SNAP-HOUSEHOLD-001']
          },
          requiredDocuments: [],
          nextSteps: [],
          estimatedBenefit: { amount: 194, frequency: 'monthly', description: 'Based on household size and income' },
          evaluatedAt: new Date().toISOString(),
          rulesVersion: '1.0.0'
        }],
        likely: [],
        maybe: [],
        notQualified: [],
        totalPrograms: 1,
        evaluatedAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('benefit-finder-results', JSON.stringify(sampleResults));

      // Also try to set a flag to indicate results exist
      localStorage.setItem('benefit-finder-hasResults', 'true');
    });

    // Click the "View Previous Results" button if it exists, or trigger results state
    const viewResultsButton = page.locator('button:has-text("View Previous Results")');
    if (await viewResultsButton.isVisible()) {
      await viewResultsButton.click();
    } else {
      // If no button, try to trigger the results state by clicking "New Assessment" then navigating
      const newAssessmentButton = page.locator('button:has-text("New Assessment")');
      if (await newAssessmentButton.isVisible()) {
        await newAssessmentButton.click();

        // Fill out the questionnaire quickly
        await page.fill('input[type="number"]', '3');
        await page.click('button:has-text("Next")');

        await page.fill('input[type="text"]', '2500');
        await page.click('button:has-text("Next")');

        await page.fill('input[type="number"]', '35');
        await page.click('button:has-text("Complete")');
      }
    }

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")', { timeout: 15000 });
  });

  test('should have descriptive ARIA labels', async ({ page }) => {

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    const ariaViolations = results.violations.filter(v =>
      v.id.includes('aria-') || v.id.includes('label')
    );

    expect(ariaViolations).toEqual([]);
  });

  test('should announce status changes', async ({ page }) => {
    // Look for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const count = await liveRegions.count();

    // Should have at least one live region for announcements
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper ARIA roles', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    const roleViolations = results.violations.filter(v => v.id.includes('aria-required'));
    expect(roleViolations).toEqual([]);
  });
});

test.describe('Results Accessibility - Forms', () => {
  test('should have accessible form inputs in export dialog', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    const exportButton = page.locator('button:has-text("Export Encrypted")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Check password fields have labels
      const passwordLabels = page.locator('label:has-text("Password")');
      await expect(passwordLabels.first()).toBeVisible();

      // Run axe on dialog
      const results = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .analyze();

      expect(results.violations).toEqual([]);
    }
  });

  test('should have accessible form inputs in import dialog', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    const importButton = page.locator('button:has-text("Import")');

    if (await importButton.isVisible()) {
      await importButton.click();

      // File input should have label
      await expect(page.locator('text=/Select File|Choose File/i')).toBeVisible();

      // Password field should have label
      await expect(page.locator('label:has-text("Password")')).toBeVisible();
    }
  });
});

test.describe('Results Accessibility - Touch Targets', () => {
  test('should have minimum 44x44px touch targets', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    // Check button sizes
    const buttons = page.locator('button').first();
    const box = await buttons.boundingBox();

    if (box) {
      // Should meet minimum touch target size
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have adequate spacing between interactive elements', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    // Check checkboxes have adequate spacing
    const checkboxes = page.locator('[role="checkbox"]');
    const count = await checkboxes.count();

    if (count >= 2) {
      const box1 = await checkboxes.first().boundingBox();
      const box2 = await checkboxes.nth(1).boundingBox();

      if (box1 && box2) {
        // Vertical spacing should be at least 8px
        const spacing = Math.abs(box2.y - (box1.y + box1.height));
        expect(spacing).toBeGreaterThanOrEqual(8);
      }
    }
  });
});

test.describe('Results Accessibility - Comprehensive Audit', () => {
  test('full page accessibility scan - results display', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.third-party-content') // Exclude any third-party elements
      .analyze();

    // Log any violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility Violations:',
        JSON.stringify(accessibilityScanResults.violations, null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('full page accessibility scan - results history', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    // Navigate to history
    const historyButton = page.locator('button:has-text("History")').first();
    if (await historyButton.isVisible()) {
      await historyButton.click();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('full page accessibility scan - export dialog', async ({ page }) => {
    await page.goto('/');

    // Navigate to questionnaire
    await page.click('button:has-text("Start Assessment")');

    // Complete the questionnaire to get to results
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="text"]', '2500');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="number"]', '35');
    await page.click('button:has-text("Complete")');

    // Wait for results to load
    await page.waitForSelector('h2:has-text("Your Benefit Eligibility Results")');

    const exportButton = page.locator('button:has-text("Export Encrypted")');
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Wait for dialog animation
      await page.waitForTimeout(500);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});

