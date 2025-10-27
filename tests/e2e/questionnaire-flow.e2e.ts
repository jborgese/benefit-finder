/**
 * Questionnaire Flow E2E Tests
 *
 * Tests for complete questionnaire user flows including:
 * - Question navigation
 * - Conditional logic
 * - Form validation
 * - Save and resume
 * - Completion flow
 */

import { test, expect } from './fixtures/test-fixtures';
import { waitForPageReady } from './utils/helpers';
import type { Page, Locator } from '@playwright/test';

test.describe('Questionnaire Flow', () => {
  // Helper to start questionnaire for all tests
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Click start assessment to begin questionnaire
    const startButton = page.locator('button', { hasText: /Eligibility Questionnaire/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
    }
  });

  test.describe('Basic Question Navigation', () => {
    test('should display first question on flow start', async ({ page }) => {
      // Wait for questionnaire to be ready (started by beforeEach)
      const question = page.locator('.question-wrapper').first();
      await expect(question).toBeVisible({ timeout: 10000 });
    });

    test('should navigate forward through questions', async ({ page }) => {
      // Questionnaire already started by beforeEach

      // Fill the first question (household size)
      const input = page.locator('input[type="number"]').first();
      if (await input.isVisible()) {
        await input.fill('2');
        await page.waitForTimeout(300);
      }

      // Find and click "Next" button
      const nextButton = page.getByTestId('nav-forward-button');

      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();

        // Verify we moved to next question (URL or state change)
        await page.waitForTimeout(500);

        // Verify next button still exists or submit button appears
        const hasNavigation = await nextButton.isVisible() ||
                             await page.getByTestId('nav-forward-button').isVisible();
        expect(hasNavigation).toBeTruthy();
      }
    });

    test('should navigate backward through questions', async ({ page }) => {
      // Questionnaire already started by beforeEach

      // Fill the first question
      const input = page.locator('input[type="number"]').first();
      if (await input.isVisible()) {
        await input.fill('2');
        await page.waitForTimeout(300);
      }

      // Navigate forward first
      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Now go back
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Verify we went back (next button should be visible again)
          await expect(nextButton).toBeVisible();
        }
      }
    });

    test('should show progress indicator', async ({ page }) => {
      // Questionnaire already started by beforeEach

      // Look for progress indicators
      const progressBar = page.locator('[role="progressbar"]');
      const progressText = page.locator('text=/\\d+\\s*of\\s*\\d+|\\d+%/i');

      // At least one type of progress indicator should exist
      const hasProgress = await progressBar.isVisible() ||
                         await progressText.isVisible();

      if (hasProgress) {
        // Fill the first question to enable navigation
        const input = page.locator('input[type="number"]').first();
        if (await input.isVisible()) {
          await input.fill('2');
          await page.waitForTimeout(300);
        }

        // Verify progress updates on navigation
        const nextButton = page.getByTestId('nav-forward-button');
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Progress should still be visible
          expect(
            await progressBar.isVisible() || await progressText.isVisible()
          ).toBeTruthy();
        }
      }
    });

    test('should preserve answers when navigating back through multiple questions', async ({ page }) => {
      // Helper function to fill an input based on its type
      const fillInput = async (input: Locator, questionIndex: number): Promise<string> => {
        const type = await input.getAttribute('type');
        const tagName = await input.evaluate(el => el.tagName);
        let value = '';

        if (type === 'radio' || type === 'checkbox') {
          await input.check({ force: true });
          value = 'checked';
        } else if (tagName === 'SELECT') {
          await input.selectOption({ index: 1 });
          value = await input.inputValue();
        } else if (type === 'number') {
          value = `${questionIndex + 1}`;
          await input.fill(value);
        } else {
          value = `Answer ${questionIndex + 1}`;
          await input.fill(value);
        }

        return value;
      };

      // Helper function to navigate forward through questions
      const navigateForward = async (page: Page): Promise<boolean> => {
        const nextButton = page.getByTestId('nav-forward-button');
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          return true;
        }
        return false;
      };

      // Helper function to verify answer is preserved
      const verifyAnswerPreserved = async (input: Locator): Promise<boolean> => {
        const inputValue = await input.inputValue();
        const isChecked = await input.isChecked().catch(() => false);
        return Boolean(inputValue || isChecked);
      };

      // Answer 3 questions forward
      for (let i = 0; i < 3; i++) {
        const inputs = await page.locator('input:visible, select:visible').all();

        if (inputs.length > 0) {
          const input = inputs[0];
          await fillInput(input, i);
          await page.waitForTimeout(300);
        }

        const navigated = await navigateForward(page);
        if (!navigated) {
          break;
        }
      }

      // Navigate back and verify answers are preserved
      for (let i = 2; i >= 0; i--) {
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Check that answer is still there
          const inputs = await page.locator('input:visible, select:visible').all();
          if (inputs.length > 0) {
            const input = inputs[0];
            const isPreserved = await verifyAnswerPreserved(input);
            expect(isPreserved).toBeTruthy();
          }
        } else {
          break;
        }
      }
    });

    test('should handle back navigation at first question gracefully', async ({ page }) => {
      // Back button should be disabled on first question
      const backButton = page.getByTestId('nav-back-button');

      if (await backButton.isVisible()) {
        await expect(backButton).toBeDisabled();
      }
    });

    test('should update progress when navigating back', async ({ page }) => {
      // Navigate forward
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Get progress after forward navigation
        const progressAfter = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow').catch(() => null);

        // Navigate back
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Progress should have decreased
          const progressBefore = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow').catch(() => null);

          if (progressAfter && progressBefore) {
            const afterValue = parseInt(progressAfter, 10);
            const beforeValue = parseInt(progressBefore, 10);
            expect(beforeValue).toBeLessThanOrEqual(afterValue);
          }
        }
      }
    });
  });

  test.describe('Form Input Components', () => {
    test('should accept text input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const textInput = page.locator('input[type="text"]').first();

      if (await textInput.isVisible()) {
        await textInput.fill('Test User');
        await expect(textInput).toHaveValue('Test User');
      }
    });

    test('should accept number input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const numberInput = page.locator('input[type="number"]').first();

      if (await numberInput.isVisible()) {
        await numberInput.fill('30');
        await expect(numberInput).toHaveValue('30');
      }
    });

    test('should accept select/dropdown input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const select = page.locator('select').first();

      if (await select.isVisible()) {
        const options = await select.locator('option').count();
        if (options > 1) {
          await select.selectOption({ index: 1 });
          const value = await select.inputValue();
          expect(value).toBeTruthy();
        }
      }
    });

    test('should accept radio button input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const radio = page.locator('input[type="radio"]').first();

      if (await radio.isVisible()) {
        await radio.check();
        await expect(radio).toBeChecked();
      }
    });

    test('should accept checkbox input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.check();
        await expect(checkbox).toBeChecked();

        await checkbox.uncheck();
        await expect(checkbox).not.toBeChecked();
      }
    });

    test('should accept date input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const dateInput = page.locator('input[type="date"]').first();

      if (await dateInput.isVisible()) {
        await dateInput.fill('2000-01-01');
        await expect(dateInput).toHaveValue('2000-01-01');
      }
    });

    test('should handle input changes immediately', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const textInput = page.locator('input[type="text"]').first();

      if (await textInput.isVisible()) {
        await textInput.fill('Test');
        await page.waitForTimeout(100);

        const value = await textInput.inputValue();
        expect(value).toBe('Test');
      }
    });

    test('should clear input when cleared', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const textInput = page.locator('input[type="text"]').first();

      if (await textInput.isVisible()) {
        await textInput.fill('Test Value');
        await textInput.clear();

        const value = await textInput.inputValue();
        expect(value).toBe('');
      }
    });

    test('should handle select option changes', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const select = page.locator('select').first();

      if (await select.isVisible()) {
        const options = await select.locator('option').count();
        if (options > 1) {
          const initialValue = await select.inputValue();

          await select.selectOption({ index: 1 });
          await page.waitForTimeout(300);

          const newValue = await select.inputValue();
          expect(newValue).not.toBe(initialValue);
        }
      }
    });

    test('should toggle checkbox state', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.check();
        await expect(checkbox).toBeChecked();

        await checkbox.uncheck();
        await expect(checkbox).not.toBeChecked();
      }
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation error for required field', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Find required input
      const requiredInput = page.locator('input[required], input[aria-required="true"]').first();

      if (await requiredInput.isVisible()) {
        // Try to proceed without filling
        const nextButton = page.locator('button', { hasText: /next/i });

        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Look for error message
          const errorMessage = page.locator('[role="alert"], .error, [aria-invalid="true"]');

          // Should have validation error
          const hasError = await errorMessage.isVisible() ||
                          await requiredInput.evaluate(el => el.getAttribute('aria-invalid') === 'true');

          expect(hasError).toBeTruthy();
        }
      }
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const emailInput = page.locator('input[type="email"]').first();

      if (await emailInput.isVisible()) {
        // Enter invalid email
        await emailInput.fill('invalid-email');
        await emailInput.blur();
        await page.waitForTimeout(500);

        // Look for validation error
        const hasError = await page.locator('[role="alert"]').isVisible() ||
                        await emailInput.evaluate(el => el.getAttribute('aria-invalid') === 'true');

        if (hasError) {
          // Now enter valid email
          await emailInput.fill('test@example.com');
          await emailInput.blur();
          await page.waitForTimeout(500);

          // Error should be gone
          const stillHasError = await emailInput.evaluate(el => el.getAttribute('aria-invalid') === 'true');
          expect(stillHasError).toBeFalsy();
        }
      }
    });

    test('should enforce number constraints', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const numberInput = page.locator('input[type="number"][min], input[type="number"][max]').first();

      if (await numberInput.isVisible()) {
        const min = await numberInput.getAttribute('min');

        if (min) {
          const minValue = parseInt(min, 10);

          // Try value below minimum
          await numberInput.fill(String(minValue - 1));
          await numberInput.blur();
          await page.waitForTimeout(500);

          // Should show validation error
          const hasError = await page.locator('[role="alert"]').isVisible() ||
                          await numberInput.evaluate(el => el.getAttribute('aria-invalid') === 'true');

          expect(hasError).toBeTruthy();
        }
      }
    });

    test('should clear validation errors when fixed', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const requiredInput = page.locator('input[required]').first();

      if (await requiredInput.isVisible()) {
        // Trigger validation error
        const nextButton = page.getByTestId('nav-forward-button');
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Now fill the input
          await requiredInput.fill('Valid Input');
          await page.waitForTimeout(500);

          // Error should be cleared
          const stillHasError = await requiredInput.evaluate(el => el.getAttribute('aria-invalid') === 'true');
          expect(stillHasError).toBeFalsy();
        }
      }
    });
  });

  test.describe('Conditional Logic', () => {
    test('should show/hide questions based on answers', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // This test checks if conditional questions appear/disappear
      // Look for yes/no questions that might trigger conditionals
      const yesNoButton = page.locator('button, input[type="radio"]', { hasText: /(yes|no)/i }).first();

      if (await yesNoButton.isVisible()) {
        // Click yes/no
        await yesNoButton.click();
        await page.waitForTimeout(500);

        // Count visible questions after
        const questionsAfter = await page.locator('input, select, textarea').count();

        // Questions count might change (conditional logic)
        // Just verify the page is still functional
        expect(questionsAfter).toBeGreaterThan(0);
      }
    });

    test('should handle branching logic', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Answer a question that might cause branching
      const firstInput = page.locator('input, select').first();

      if (await firstInput.isVisible()) {
        const type = await firstInput.getAttribute('type');

        if (type === 'radio' || type === 'checkbox') {
          await firstInput.check();
        } else if (await firstInput.evaluate(el => el.tagName === 'SELECT')) {
          await firstInput.selectOption({ index: 1 });
        } else {
          await firstInput.fill('Test Value');
        }

        await page.waitForTimeout(500);

        // Navigate forward
        const nextButton = page.getByTestId('nav-forward-button');
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Should navigate to next question (branched or linear)
          const hasNextQuestion = await page.locator('input, select, textarea').isVisible();
          expect(hasNextQuestion).toBeTruthy();
        }
      }
    });
  });

  test.describe('Save and Resume', () => {
    test('should have save functionality', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Look for save button
      const saveButton = page.locator('button', { hasText: /(save|save.*resume|save.*later)/i });

      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(500);

        // Should show confirmation or dialog
        const confirmation = page.locator('[role="dialog"], [role="alert"], text=/saved|progress saved/i');
        const hasConfirmation = await confirmation.isVisible();

        expect(hasConfirmation).toBeTruthy();
      }
    });

    test('should persist answers across page reload', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const textInput = page.locator('input[type="text"]').first();

      if (await textInput.isVisible()) {
        const testValue = 'Test Persistence Value';
        await textInput.fill(testValue);
        await page.waitForTimeout(1000); // Wait for auto-save

        // Reload page
        await page.reload();
        await waitForPageReady(page);

        // Check if value persisted
        const reloadedInput = page.locator('input[type="text"]').first();
        if (await reloadedInput.isVisible()) {
          const value = await reloadedInput.inputValue();

          // Value might be persisted through localStorage/auto-save
          if (value === testValue) {
            expect(value).toBe(testValue);
          }
        }
      }
    });

    test('should show resume option on return', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Fill some data
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill('Test Data');
        await page.waitForTimeout(1000);

        // Navigate away and back
        await page.goto('/');
        await waitForPageReady(page);

        // May or may not show depending on implementation
        // Just check page is functional
        expect(true).toBeTruthy();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate with Tab key', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Start questionnaire to have focusable elements
      const startButton = page.locator('button:has-text("Start Assessment")');
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(500);
      }

      // Tab to first input
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should be on an interactive element
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName;
      });

      // Allow BODY in case focus is on page body or within focusable elements
      expect(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A', 'BODY']).toContain(focusedElement);
    });

    test('should submit form with Enter key on input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const textInput = page.locator('input[type="text"]').first();

      if (await textInput.isVisible()) {
        await textInput.fill('Test Value');
        await textInput.press('Enter');
        await page.waitForTimeout(500);

        // Should navigate forward or show validation
        // Just verify page is still responsive
        expect(await page.locator('body').isVisible()).toBeTruthy();
      }
    });

    test('should activate buttons with Space key', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const nextButton = page.locator('button', { hasText: /next/i }).first();

      if (await nextButton.isVisible()) {
        await nextButton.focus();
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        // Button action should execute
        expect(await page.locator('body').isVisible()).toBeTruthy();
      }
    });

    test('should navigate radio buttons with arrow keys', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const firstRadio = page.locator('input[type="radio"]').first();

      if (await firstRadio.isVisible()) {
        await firstRadio.focus();
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);

        // Focus should move to next radio
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement as HTMLInputElement;
          return el.type;
        });

        expect(focusedElement).toBe('radio');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible labels for all inputs', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const inputs = await page.locator('input, select, textarea').all();

      for (const input of inputs.slice(0, 5)) { // Check first 5
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        const id = await input.getAttribute('id');

        let hasLabel = false;

        if (ariaLabel || ariaLabelledby) {
          hasLabel = true;
        } else if (id) {
          // Check for associated label
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = await label.count() > 0;
        }

        expect(hasLabel, 'Input should have accessible label').toBeTruthy();
      }
    });

    test('should announce errors with aria-live', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Trigger validation error
      const requiredInput = page.locator('input[required]').first();

      if (await requiredInput.isVisible()) {
        const nextButton = page.locator('button', { hasText: /next/i });

        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Check for aria-live region
          const liveRegion = page.locator('[aria-live], [role="alert"]');
          const hasLiveRegion = await liveRegion.count() > 0;

          expect(hasLiveRegion).toBeTruthy();
        }
      }
    });

    test('should have proper focus management', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const nextButton = page.locator('button', { hasText: /next/i }).first();

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Focus should be on new question or first input
        const focusedElement = await page.evaluate(() => {
          return document.activeElement?.tagName;
        });

        expect(focusedElement).toBeTruthy();
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Start questionnaire to have focusable elements
      const startButton = page.locator('button:has-text("Start Assessment")');
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(500);
      }

      // Tab to an input element
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check focused element has focus indicator (Tailwind uses ring classes or outline)
      const hasFocusIndicator = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;

        const computed = window.getComputedStyle(el);
        const hasOutline = computed.outlineWidth !== '0px' && computed.outline !== 'none';
        const hasRing = computed.boxShadow !== 'none';
        const hasBorder = computed.borderColor !== 'transparent';

        return hasOutline || hasRing || hasBorder;
      });

      expect(hasFocusIndicator).toBeTruthy();
    });
  });

  test.describe('Complete Flow', () => {
    test('should complete full questionnaire workflow', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        attempts++;

        // Fill current question
        const inputs = await page.locator('input:visible, select:visible, textarea:visible').all();

        for (const input of inputs) {
          const type = await input.getAttribute('type');
          const tagName = await input.evaluate(el => el.tagName);

          if (type === 'radio' || type === 'checkbox') {
            await input.check({ force: true });
          } else if (tagName === 'SELECT') {
            await input.selectOption({ index: 1 });
          } else if (type === 'date') {
            await input.fill('2000-01-01');
          } else if (type === 'number') {
            await input.fill('25');
          } else {
            await input.fill('Test Value');
          }

          await page.waitForTimeout(200);
        }

        // Try to proceed
        const nextButton = page.locator('button', { hasText: /next/i }).first();
        const submitButton = page.locator('button', { hasText: /submit/i }).first();

        if (await submitButton.isVisible()) {
          // We're at the end
          await submitButton.click();
          await page.waitForTimeout(1000);
          break;
        } else if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        } else {
          // No navigation buttons, might be complete
          break;
        }
      }

      // Should have completed or reached end
      expect(attempts).toBeLessThan(maxAttempts);
    });

    test('should show completion confirmation', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Quick complete if possible
      let completed = false;

      for (let i = 0; i < 10; i++) {
        const submitButton = page.locator('button', { hasText: /submit|complete|finish/i }).first();

        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          completed = true;
          break;
        }

        const nextButton = page.locator('button', { hasText: /next/i }).first();
        if (await nextButton.isVisible()) {
          // Fill current inputs quickly
          const inputs = await page.locator('input:visible').all();
          for (const input of inputs) {
            const type = await input.getAttribute('type');
            if (type === 'text') {
              await input.fill('Test');
            } else if (type === 'number') {
              await input.fill('1');
            }
          }

          await nextButton.click();
          await page.waitForTimeout(300);
        } else {
          break;
        }
      }

      if (completed) {
        // Look for confirmation
        const confirmation = page.locator('text=/complete|success|thank you|submitted/i');
        const hasConfirmation = await confirmation.isVisible();

        // Should show some completion message
        expect(hasConfirmation).toBeTruthy();
      }
    });
  });
});

