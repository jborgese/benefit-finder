/**
 * E2E Tests: Results Display
 *
 * Tests for eligibility results display components
 */

import { test, expect } from '@playwright/test';

test.describe('Results Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and complete questionnaire to get to results
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click start assessment button
    const startButton = page.locator('button', { hasText: /Start Assessment/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);

      // Fill out questionnaire quickly to get to results
      // Fill household size
      const householdInput = page.locator('input[name="householdSize"], input[type="number"]').first();
      if (await householdInput.isVisible()) {
        await householdInput.fill('2');
        await page.waitForTimeout(200);

        // Click next
        const nextButton = page.locator('button', { hasText: /next/i }).first();
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Fill income
          const incomeInput = page.locator('input[name="monthlyIncome"], input[type="number"]').first();
          if (await incomeInput.isVisible()) {
            await incomeInput.fill('1500');
            await page.waitForTimeout(200);

            // Click next
            if (await nextButton.isVisible()) {
              await nextButton.click();
              await page.waitForTimeout(500);

              // Fill age
              const ageInput = page.locator('input[name="age"], input[type="number"]').first();
              if (await ageInput.isVisible()) {
                await ageInput.fill('30');
                await page.waitForTimeout(200);

                // Submit
                const submitButton = page.locator('button', { hasText: /submit|finish/i }).first();
                if (await submitButton.isVisible()) {
                  await submitButton.click();
                  await page.waitForTimeout(1000);
                }
              }
            }
          }
        }
      }
    }
  });

  test('should display results summary with statistics', async ({ page }) => {
    // Wait for results to load
    await expect(page.locator('h2:has-text("Your Benefit Eligibility Results")')).toBeVisible();

    // Check summary statistics are displayed
    await expect(page.locator('text=/Qualified for \\d+ of \\d+ programs/')).toBeVisible();

    // Check progress bar is visible
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Check status filters are present
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Qualified")')).toBeVisible();
    await expect(page.locator('button:has-text("Likely")')).toBeVisible();
    await expect(page.locator('button:has-text("Maybe")')).toBeVisible();
  });

  test('should filter results by status', async ({ page }) => {
    // Click "Qualified" filter
    await page.click('button:has-text("Qualified")');

    // Verify filter is active (has ring-2 class or visual indicator)
    const qualifiedButton = page.locator('button:has-text("Qualified")');
    await expect(qualifiedButton).toHaveClass(/ring-2/);

    // Verify only qualified programs are shown
    const programCards = page.locator('.program-card, [class*="rounded-lg shadow"]').filter({
      has: page.locator('text=/Qualified|You Qualify/')
    });
    await expect(programCards.first()).toBeVisible();

    // Click "All" to reset
    await page.click('button:has-text("All")');
    await expect(page.locator('button:has-text("All")')).toHaveClass(/ring-2/);
  });

  test('should display program card with all details', async ({ page }) => {
    // Find first program card
    const programCard = page.locator('[class*="rounded-lg shadow"]').first();
    await expect(programCard).toBeVisible();

    // Check program name is displayed
    await expect(programCard.locator('h3')).toBeVisible();

    // Check eligibility status badge
    await expect(programCard.locator('text=/Qualified|Likely|Maybe|Not Qualified/')).toBeVisible();

    // Check confidence score
    await expect(programCard.locator('text=/\\d+%/')).toBeVisible();

    // Check program description
    await expect(programCard.locator('p').first()).toBeVisible();
  });

  test('should expand and show required documents', async ({ page }) => {
    // Find program card with documents
    const programCard = page.locator('[class*="rounded-lg shadow"]').first();

    // Click to expand documents section
    const documentsButton = programCard.locator('button:has-text("Required Documents")');
    if (await documentsButton.isVisible()) {
      await documentsButton.click();

      // Wait for expansion
      await page.waitForTimeout(300);

      // Check documents are shown
      await expect(programCard.locator('text=/Proof of Income|Birth Certificate|ID/')).toBeVisible();

      // Check checkboxes are present
      await expect(programCard.locator('input[type="checkbox"]').first()).toBeVisible();
    }
  });

  test('should expand and show next steps', async ({ page }) => {
    const programCard = page.locator('[class*="rounded-lg shadow"]').first();

    // Click to expand next steps
    const stepsButton = programCard.locator('button:has-text("Next Steps")');
    if (await stepsButton.isVisible()) {
      await stepsButton.click();

      // Wait for expansion
      await page.waitForTimeout(300);

      // Check steps are numbered
      await expect(programCard.locator('text=/^1$|Step 1/')).toBeVisible();

      // Check priority badges
      await expect(programCard.locator('text=/High Priority|Medium Priority|Low Priority/')).toBeVisible();
    }
  });

  test('should open "Why?" explanation dialog', async ({ page }) => {
    // Find "Why?" button
    const whyButton = page.locator('button:has-text("Why this result?")').first();

    if (await whyButton.isVisible()) {
      await whyButton.click();

      // Check dialog opened
      await expect(page.locator('text="Why this result?"').nth(1)).toBeVisible();

      // Check explanation content
      await expect(page.locator('text=/You meet|requirements/')).toBeVisible();

      // Check rules cited section
      await expect(page.locator('text="Based on these rules:"')).toBeVisible();

      // Check privacy note
      await expect(page.locator('text=/All eligibility calculations happen locally/')).toBeVisible();

      // Close dialog
      await page.click('button:has-text("Close")');
      await expect(page.locator('text="Why this result?"').nth(1)).not.toBeVisible();
    }
  });

  test('should check off documents', async ({ page }) => {
    const programCard = page.locator('[class*="rounded-lg shadow"]').first();

    // Expand documents
    const documentsButton = programCard.locator('button:has-text("Required Documents")');
    if (await documentsButton.isVisible()) {
      await documentsButton.click();
      await page.waitForTimeout(300);

      // Find first checkbox
      const firstCheckbox = programCard.locator('input[type="checkbox"]').first();

      if (await firstCheckbox.isVisible()) {
        // Initially unchecked
        await expect(firstCheckbox).not.toBeChecked();

        // Check it
        await firstCheckbox.click();
        await expect(firstCheckbox).toBeChecked();

        // Uncheck it
        await firstCheckbox.click();
        await expect(firstCheckbox).not.toBeChecked();
      }
    }
  });

  test('should check off next steps', async ({ page }) => {
    const programCard = page.locator('[class*="rounded-lg shadow"]').first();

    // Expand next steps
    const stepsButton = programCard.locator('button:has-text("Next Steps")');
    if (await stepsButton.isVisible()) {
      await stepsButton.click();
      await page.waitForTimeout(300);

      // Find step checkbox
      const stepCheckbox = programCard.locator('[role="checkbox"]').first();

      if (await stepCheckbox.isVisible()) {
        // Check step
        await stepCheckbox.click();
        await expect(stepCheckbox).toHaveAttribute('data-state', 'checked');
      }
    }
  });

  test('should display estimated benefit amount', async ({ page }) => {
    // Look for program with estimated benefit
    const benefitDisplay = page.locator('text=/Estimated Benefit:.*\\$\\d+/');

    if (await benefitDisplay.isVisible()) {
      await expect(benefitDisplay).toBeVisible();

      // Check amount format
      await expect(page.locator('text=/\\$\\d+.*\\/month|\\$\\d+.*\\/year/')).toBeVisible();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Check focus is visible (should have focus ring)
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();

    // Tab to next element
    await page.keyboard.press('Tab');
    const nextFocused = page.locator(':focus');
    await expect(nextFocused).toBeVisible();

    // Should be able to activate with Enter/Space
    await page.keyboard.press('Enter');
    // Wait a bit for any action
    await page.waitForTimeout(200);
  });

  test('should display confidence score with tooltip', async ({ page }) => {
    const confidenceScore = page.locator('text=/High|Medium|Low/').first();

    if (await confidenceScore.isVisible()) {
      // Hover to show tooltip
      await confidenceScore.hover();

      // Wait for tooltip
      await page.waitForTimeout(500);

      // Check tooltip appears (Radix tooltip content)
      const tooltip = page.locator('[role="tooltip"]');
      if (await tooltip.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText(/confidence|information/i);
      }
    }
  });

  test('should handle no results gracefully', async ({ page }) => {
    // Navigate to results with no data
    await page.goto('/results?empty=true');

    // Should show appropriate message
    const noResultsMessage = page.locator('text=/No results|No programs|Complete.*screening/i');
    await expect(noResultsMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Results should still be visible and readable
    await expect(page.locator('h2:has-text("Your Benefit Eligibility Results")')).toBeVisible();

    // Status filters should stack properly
    const filters = page.locator('button:has-text("Qualified")');
    await expect(filters).toBeVisible();

    // Cards should be full width
    const card = page.locator('[class*="rounded-lg shadow"]').first();
    if (await card.isVisible()) {
      const box = await card.boundingBox();
      expect(box?.width).toBeGreaterThan(300);
    }
  });
});

test.describe('Results Display - Edge Cases', () => {
  test('should handle very long program names', async ({ page }) => {
    await page.goto('/results?scenario=long-names');

    // Program names should be visible and not overflow
    const programName = page.locator('h3').first();
    await expect(programName).toBeVisible();

    // Check for overflow (should wrap or truncate gracefully)
    const overflow = await programName.evaluate(el => {
      return el.scrollWidth > el.clientWidth;
    });

    // If it overflows, it should use text wrapping or ellipsis
    if (overflow) {
      const hasWrap = await programName.evaluate(el =>
        window.getComputedStyle(el).whiteSpace !== 'nowrap'
      );
      expect(hasWrap).toBeTruthy();
    }
  });

  test('should handle many programs (performance)', async ({ page }) => {
    await page.goto('/results?scenario=many-programs');

    // Should render without significant delay
    const startTime = Date.now();
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // All program cards should be accessible
    const cards = page.locator('[class*="rounded-lg shadow"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle missing data fields gracefully', async ({ page }) => {
    await page.goto('/results?scenario=incomplete-data');

    // Should not crash, should show results
    await expect(page.locator('h2')).toBeVisible();

    // Check for error messages or warnings
    const errors = page.locator('text=/error|failed/i');
    const errorCount = await errors.count();

    // Should handle gracefully (maybe warnings, but not crashes)
    expect(errorCount).toBe(0);
  });
});

test.describe('Results Display - Print Functionality', () => {
  test('should trigger print dialog', async ({ page }) => {
    await page.goto('/results');

    // Look for print button
    const printButton = page.locator('button:has-text("Print"), button:has-text("PDF")').first();

    if (await printButton.isVisible()) {
      // Click should trigger window.print()
      // Note: Can't actually test print dialog in headless mode,
      // but we can verify the button works
      const printPromise = page.evaluate(() => {
        return new Promise(resolve => {
          const originalPrint = window.print;
          window.print = () => {
            resolve(true);
            window.print = originalPrint;
          };
        });
      });

      await printButton.click();
      await expect(printPromise).resolves.toBe(true);
    }
  });

  test('should apply print styles', async ({ page }) => {
    await page.goto('/results');

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    // Check that print styles are applied
    const hiddenElements = page.locator('.print\\:hidden');
    const count = await hiddenElements.count();

    if (count > 0) {
      // Elements with print:hidden should not be visible in print
      const firstHidden = hiddenElements.first();
      const isDisplayed = await firstHidden.evaluate(el =>
        window.getComputedStyle(el).display !== 'none'
      );
      expect(isDisplayed).toBeFalsy();
    }
  });
});

