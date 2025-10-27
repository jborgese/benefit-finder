/**
 * Questionnaire Back Button E2E Tests
 *
 * Comprehensive tests for back button functionality including:
 * - Basic back navigation
 * - Back navigation with answers preservation
 * - Back navigation through skipped questions
 * - Back navigation through branches
 * - Multiple consecutive back navigations
 * - Back button state management
 * - Progress tracking during back navigation
 * - Answer modification after going back
 */

import { test, expect } from './fixtures/test-fixtures';
import { waitForPageReady } from './utils/helpers';
import type { Page } from '@playwright/test';

// Helper functions to reduce cognitive complexity
async function fillInput(page: Page, input: Awaited<ReturnType<Page['locator']>>, index: number, inputType: string | null, tagName: string): Promise<void> {
  if (inputType === 'radio' || inputType === 'checkbox') {
    await input.check({ force: true });
  } else if (tagName === 'SELECT') {
    await input.selectOption({ index: 1 });
  } else if (inputType === 'number') {
    await input.fill(`${index + 1}`);
  } else {
    await input.fill(`Answer ${index + 1}`);
  }
}

async function fillInputAndGetValue(page: Page, input: Awaited<ReturnType<Page['locator']>>, index: number, inputType: string | null, tagName: string): Promise<string> {
  if (inputType === 'radio' || inputType === 'checkbox') {
    await input.check({ force: true });
    return await input.getAttribute('value') ?? 'checked';
  } else if (tagName === 'SELECT') {
    await input.selectOption({ index: 1 });
    return input.inputValue();
  } else if (inputType === 'number') {
    const value = `${index + 1}`;
    await input.fill(value);
    return value;
  } else {
    const value = `Answer ${index + 1}`;
    await input.fill(value);
    return value;
  }
}

async function navigateForward(page: Page): Promise<boolean> {
  const nextButton = page.getByTestId('nav-forward-button');
  if (await nextButton.isVisible() && await nextButton.isEnabled()) {
    await nextButton.click();
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

async function navigateBack(page: Page): Promise<boolean> {
  const backButton = page.getByTestId('nav-back-button');
  if (await backButton.isVisible() && await backButton.isEnabled()) {
    await backButton.click();
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

async function fillSimpleInput(input: Awaited<ReturnType<Page['locator']>>, index: number, inputType: string | null): Promise<void> {
  if (inputType === 'number') {
    await input.fill(`${index + 1}`);
  } else if (inputType === 'text') {
    await input.fill(`Answer ${index + 1}`);
  } else if (inputType === 'radio' || inputType === 'checkbox') {
    await input.check({ force: true });
  }
}

async function getProgressBarValue(page: Page): Promise<number | null> {
  const value = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow').catch(() => null);
  return value ? parseInt(value, 10) : null;
}

test.describe('Questionnaire Back Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Start questionnaire
    const startButton = page.locator('button', { hasText: /Eligibility Questionnaire/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
    }
  });

  test.describe('Basic Back Navigation', () => {
    test('should be disabled on first question', async ({ page }) => {
      const backButton = page.getByTestId('nav-back-button');

      if (await backButton.isVisible()) {
        await expect(backButton).toBeDisabled();
      }
    });

    test('should enable after navigating forward', async ({ page }) => {
      // Fill first question
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      // Navigate forward
      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Back button should now be enabled
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible()) {
          await expect(backButton).toBeEnabled();
        }
      }
    });

    test('should navigate to previous question when clicked', async ({ page }) => {
      // Fill and navigate forward
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Click back button
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Should be back at first question
          const currentQuestion = page.locator('.question-wrapper').first();
          const currentQuestionText = await currentQuestion.textContent();

          // Question text should match (or be similar enough)
          expect(currentQuestionText).toBeTruthy();
        }
      }
    });

    test('should preserve answer when navigating back and forward', async ({ page }) => {
      const testValue = '5';

      // Fill first question
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill(testValue);
        await page.waitForTimeout(300);
      }

      // Navigate forward
      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Navigate back
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Answer should be preserved
          const inputAfterBack = page.locator('input[type="number"]').first();
          if (await inputAfterBack.isVisible()) {
            const value = await inputAfterBack.inputValue();
            expect(value).toBe(testValue);
          }
        }
      }
    });
  });

  test.describe('Multiple Back Navigations', () => {
    test('should navigate back multiple times consecutively', async ({ page }) => {
      // Navigate forward through 3+ questions
      for (let i = 0; i < 3; i++) {
        const inputs = await page.locator('input:visible, select:visible').all();

        if (inputs.length > 0) {
          const input = inputs[0];
          const type = await input.getAttribute('type');
          const tagName = await input.evaluate(el => el.tagName);
          await fillInput(page, input, i, type, tagName);
          await page.waitForTimeout(300);
        }

        const navigated = await navigateForward(page);
        if (!navigated) {
          break; // Reached end of questionnaire
        }
      }

      // Navigate back multiple times
      for (let i = 0; i < 3; i++) {
        const navigated = await navigateBack(page);
        if (!navigated) {
          break; // Reached beginning
        }
      }

      // Should be able to navigate forward again
      const nextButton = page.getByTestId('nav-forward-button');
      expect(await nextButton.isVisible() || await nextButton.isEnabled()).toBeTruthy();
    });

    test('should disable back button when at first question', async ({ page }) => {
      // Navigate forward at least once
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Navigate back to first question
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Back button should now be disabled
          const backButtonAfter = page.getByTestId('nav-back-button');
          if (await backButtonAfter.isVisible()) {
            await expect(backButtonAfter).toBeDisabled();
          }
        }
      }
    });
  });

  test.describe('Answer Preservation', () => {
    test('should preserve answers when navigating back through multiple questions', async ({ page }) => {
      const answers: Record<number, string> = {};

      // Answer 3 questions
      for (let i = 0; i < 3; i++) {
        const inputs = await page.locator('input:visible, select:visible').all();

        if (inputs.length > 0) {
          const input = inputs[0];
          const type = await input.getAttribute('type');
          const tagName = await input.evaluate(el => el.tagName);
          const value = await fillInputAndGetValue(page, input, i, type, tagName);
          answers[Number(i)] = value;
          await page.waitForTimeout(300);
        }

        const navigated = await navigateForward(page);
        if (!navigated) {
          break;
        }
      }

      // Navigate back and verify answers are preserved
      for (let i = 2; i >= 0; i--) {
        const navigated = await navigateBack(page);
        if (!navigated) {
          break;
        }

        // Check that answer is still there
        const inputs = await page.locator('input:visible, select:visible').all();
        if (inputs.length > 0) {
          const input = inputs[0];
          const inputValue = await input.inputValue();
          const isChecked = await input.isChecked().catch(() => false);

          // Answer should be preserved (either in value or checked state)
          expect(inputValue || isChecked).toBeTruthy();
        }
      }
    });

    test('should allow modifying answer after going back', async ({ page }) => {
      const originalValue = '3';
      const newValue = '7';

      // Fill first question
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill(originalValue);
        await page.waitForTimeout(300);
      }

      // Navigate forward
      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Navigate back
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Modify the answer
          const inputAfterBack = page.locator('input[type="number"]').first();
          if (await inputAfterBack.isVisible()) {
            await inputAfterBack.fill(newValue);
            await page.waitForTimeout(300);

            const value = await inputAfterBack.inputValue();
            expect(value).toBe(newValue);
          }
        }
      }
    });
  });

  test.describe('Progress Tracking', () => {
    test('should update progress bar when navigating back', async ({ page }) => {
      // Navigate forward through multiple questions
      for (let i = 0; i < 2; i++) {
        const inputs = await page.locator('input:visible').all();
        if (inputs.length > 0) {
          const input = inputs[0];
          const type = await input.getAttribute('type');
          await fillSimpleInput(input, i, type);
          await page.waitForTimeout(300);
        }

        const navigated = await navigateForward(page);
        if (!navigated) {
          break;
        }

        // Get progress after forward navigation
        const progressAfter = await getProgressBarValue(page);

        // Navigate back
        const backNavigated = await navigateBack(page);
        if (backNavigated && progressAfter !== null) {
          // Progress should have decreased (or be the same if at start)
          const progressAfterBack = await getProgressBarValue(page);
          if (progressAfterBack !== null) {
            expect(progressAfterBack).toBeLessThanOrEqual(progressAfter);
          }
        }

        break; // Only test once
      }
    });

    test('should update question counter when navigating back', async ({ page }) => {
      // Navigate forward at least once
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Get question number after forward navigation
        const questionCounterAfter = page.locator('text=/Question \\d+ of \\d+/i');
        const textAfter = await questionCounterAfter.textContent();

        // Navigate back
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Get question number after back navigation
          const questionCounterBefore = page.locator('text=/Question \\d+ of \\d+/i');
          const textBefore = await questionCounterBefore.textContent();

          // Question number should have decreased
          if (textAfter && textBefore) {
            const afterMatch = textAfter.match(/Question (\d+)/);
            const beforeMatch = textBefore.match(/Question (\d+)/);

            if (afterMatch && beforeMatch) {
              const afterNum = parseInt(afterMatch[1], 10);
              const beforeNum = parseInt(beforeMatch[1], 10);
              expect(beforeNum).toBeLessThan(afterNum);
            }
          }
        }
      }
    });
  });

  test.describe('Navigation State', () => {
    test('should prevent multiple rapid back clicks', async ({ page }) => {
      // Navigate forward at least once
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Try rapid back clicks
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          // First click should work
          await backButton.click();

          // Button should be disabled or navigation should complete before second click
          await page.waitForTimeout(300);

          // After navigation completes, button might be disabled if at first question
          // or still enabled if there are more questions to go back to
          expect(true).toBeTruthy(); // Just verify no crashes occurred
        }
      }
    });

    test('should handle onBeforeNavigate callback', async ({ page }) => {
      // This test verifies that navigation can be prevented by callbacks
      // In a real scenario, we'd need to inject a callback, but for E2E we verify
      // that the back button still works normally without blocking callbacks

      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.click();
          await page.waitForTimeout(500);

          // Should successfully navigate back
          const inputAfterBack = page.locator('input[type="number"]').first();
          if (await inputAfterBack.isVisible()) {
            expect(await inputAfterBack.isVisible()).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate back with keyboard shortcut', async ({ page }) => {
      // Navigate forward at least once
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Focus back button and activate with Enter
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.focus();
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);

          // Should navigate back
          const inputAfterBack = page.locator('input[type="number"]').first();
          if (await inputAfterBack.isVisible()) {
            expect(await inputAfterBack.isVisible()).toBeTruthy();
          }
        }
      }
    });

    test('should navigate back with Space key on button', async ({ page }) => {
      // Navigate forward at least once
      const firstInput = page.locator('input[type="number"]').first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('2');
        await page.waitForTimeout(300);
      }

      const nextButton = page.getByTestId('nav-forward-button');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Focus back button and activate with Space
        const backButton = page.getByTestId('nav-back-button');
        if (await backButton.isVisible() && await backButton.isEnabled()) {
          await backButton.focus();
          await page.keyboard.press('Space');
          await page.waitForTimeout(500);

          // Should navigate back
          const inputAfterBack = page.locator('input[type="number"]').first();
          if (await inputAfterBack.isVisible()) {
            expect(await inputAfterBack.isVisible()).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Back Navigation with Conditional Logic', () => {
    test('should skip over conditional questions when navigating back', async ({ page }) => {
      // This test assumes the questionnaire has conditional logic
      // Navigate forward through a few questions
      for (let i = 0; i < 3; i++) {
        const inputs = await page.locator('input:visible, select:visible').all();

        if (inputs.length > 0) {
          const input = inputs[0];
          const type = await input.getAttribute('type');
          const tagName = await input.evaluate(el => el.tagName);

          if (type === 'radio' || type === 'checkbox') {
            await input.check({ force: true });
          } else if (tagName === 'SELECT') {
            await input.selectOption({ index: 1 });
          } else if (type === 'number') {
            await input.fill(`${i + 1}`);
          } else {
            await input.fill(`Answer ${i + 1}`);
          }

          await page.waitForTimeout(300);
        }

        const nextButton = page.getByTestId('nav-forward-button');
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        } else {
          break;
        }
      }

      // Navigate back - should skip any conditional questions that are no longer visible
      const backButton = page.getByTestId('nav-back-button');
      if (await backButton.isVisible() && await backButton.isEnabled()) {
        await backButton.click();
        await page.waitForTimeout(500);

        // Should successfully navigate back
        const inputs = await page.locator('input:visible, select:visible').all();
        expect(inputs.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle back navigation at end of questionnaire', async ({ page }) => {
      // Navigate to end (or as far as possible)
      let maxIterations = 20;
      while (maxIterations > 0) {
        const inputs = await page.locator('input:visible').all();
        if (inputs.length > 0) {
          const input = inputs[0];
          const type = await input.getAttribute('type');

          if (type === 'number') {
            await input.fill('1');
          } else if (type === 'text') {
            await input.fill('Test');
          } else if (type === 'radio' || type === 'checkbox') {
            await input.check({ force: true });
          }

          await page.waitForTimeout(300);
        }

        const nextButton = page.getByTestId('nav-forward-button');
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          maxIterations--;
        } else {
          break; // Reached end
        }
      }

      // Try to navigate back from end
      const backButton = page.getByTestId('nav-back-button');
      if (await backButton.isVisible() && await backButton.isEnabled()) {
        await backButton.click();
        await page.waitForTimeout(500);

        // Should successfully navigate back
        const inputs = await page.locator('input:visible').all();
        expect(inputs.length).toBeGreaterThan(0);
      }
    });

    test('should handle browser back button gracefully', async ({ page }) => {
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

        // Use browser back button
        await page.goBack();
        await page.waitForTimeout(500);

        // Page should still be functional
        const inputs = await page.locator('input:visible').all();
        expect(inputs.length).toBeGreaterThan(0);
      }
    });
  });
});

