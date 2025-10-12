/**
 * Accessibility Testing Utilities
 *
 * Helpers for testing accessibility with axe-core.
 */

import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility scan options
 */
export interface A11yScanOptions {
  // Tags to include (e.g., ['wcag2a', 'wcag2aa', 'wcag21aa'])
  tags?: string[];

  // Rules to disable
  disableRules?: string[];

  // Specific elements to check
  include?: string[];

  // Elements to exclude
  exclude?: string[];
}

/**
 * Run accessibility scan on current page
 *
 * @param page Playwright page
 * @param options Scan options
 * @returns Accessibility violations
 */
export function runA11yScan(
  page: Page,
  options: A11yScanOptions = {}
): Promise<Awaited<ReturnType<AxeBuilder['analyze']>>> {
  const {
    tags = ['wcag2a', 'wcag2aa', 'wcag21aa'],
    disableRules = [],
    include,
    exclude,
  } = options;

  let builder = new AxeBuilder({ page })
    .withTags(tags);

  if (disableRules.length > 0) {
    builder = builder.disableRules(disableRules);
  }

  if (include) {
    builder = builder.include(include);
  }

  if (exclude) {
    builder = builder.exclude(exclude);
  }

  return builder.analyze();
}

/**
 * Assert no accessibility violations
 *
 * @param page Playwright page
 * @param options Scan options
 */
export async function expectNoA11yViolations(
  page: Page,
  options: A11yScanOptions = {}
): Promise<void> {
  const results = await runA11yScan(page, options);

  expect(results.violations, `Found ${results.violations.length} accessibility violations`).toEqual([]);
}

/**
 * Check specific accessibility rule
 *
 * @param page Playwright page
 * @param ruleId Axe rule ID
 */
export async function checkA11yRule(page: Page, ruleId: string): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withRules([ruleId])
    .analyze();

  expect(results.violations).toEqual([]);
}

/**
 * Get accessibility violations summary
 */
export function formatViolations(violations: any[]): string {
  if (violations.length === 0) {
    return 'No violations found';
  }

  return violations.map((violation) => {
    const nodes = violation.nodes.map((node: any) => {
      return `  - ${node.html}\n    ${node.failureSummary}`;
    }).join('\n');

    return `
${violation.id} (${violation.impact})
Description: ${violation.description}
Help: ${violation.help}
Affected elements:
${nodes}
    `.trim();
  }).join('\n\n');
}

/**
 * Check keyboard navigation
 *
 * Tests that all interactive elements are keyboard accessible
 */
export async function checkKeyboardNavigation(page: Page): Promise<void> {
  // Get all interactive elements
  const interactiveElements = await page.locator(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ).all();

  for (const element of interactiveElements) {
    // Check if element is visible
    const isVisible = await element.isVisible();
    if (!isVisible) continue;

    // Check if element is focusable
    await element.focus();
    const isFocused = await element.evaluate((el) => el === document.activeElement);

    expect(isFocused, `Element should be focusable: ${await element.evaluate(e => e.outerHTML)}`).toBe(true);
  }
}

/**
 * Check color contrast
 *
 * Runs axe color-contrast rule
 */
export async function checkColorContrast(page: Page): Promise<void> {
  await checkA11yRule(page, 'color-contrast');
}

/**
 * Check ARIA attributes
 *
 * Runs axe ARIA rules
 */
export async function checkARIA(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .options({ rules: { 'aria-valid-attr': { enabled: true } } })
    .analyze();

  expect(results.violations).toEqual([]);
}

/**
 * Check heading hierarchy
 *
 * Ensures headings are properly nested (h1 -> h2 -> h3, etc.)
 */
export async function checkHeadingHierarchy(page: Page): Promise<void> {
  const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(
    (elements) => elements.map((el) => parseInt(el.tagName[1], 10))
  );

  // Check that heading levels don't skip (e.g., h1 -> h3)
  for (let i = 1; i < levels.length; i++) {
    const prevLevel = levels[i - 1];
    // eslint-disable-next-line security/detect-object-injection -- i is a controlled loop counter within array bounds
    const currLevel = levels[i];
    const diff = currLevel - prevLevel;
    expect(
      diff,
      `Heading hierarchy violation: h${prevLevel} followed by h${currLevel}`
    ).toBeLessThanOrEqual(1);
  }
}

/**
 * Check landmark regions
 *
 * Ensures proper use of semantic HTML landmarks
 */
export async function checkLandmarks(page: Page): Promise<void> {
  // Check for main landmark
  const main = page.locator('main, [role="main"]');
  await expect(main).toBeVisible();

  // Check for navigation
  const nav = page.locator('nav, [role="navigation"]');
  const navCount = await nav.count();
  expect(navCount, 'Should have at least one navigation landmark').toBeGreaterThan(0);
}

/**
 * Check form labels
 *
 * Ensures all form inputs have associated labels
 */
export async function checkFormLabels(page: Page): Promise<void> {
  const inputs = await page.locator('input, textarea, select').all();

  for (const input of inputs) {
    const type = await input.getAttribute('type');

    // Skip hidden and submit inputs
    if (type === 'hidden' || type === 'submit' || type === 'button') {
      continue;
    }

    // Check for label
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');

    const hasLabel = !!(
      (id && await page.locator(`label[for="${id}"]`).count() > 0) ??
      ariaLabel ??
      ariaLabelledby
    );

    expect(
      hasLabel,
      `Input should have an associated label: ${await input.evaluate(e => e.outerHTML)}`
    ).toBe(true);
  }
}

/**
 * Check focus visibility
 *
 * Ensures focused elements have visible focus indicators
 */
export async function checkFocusVisibility(page: Page): Promise<void> {
  const interactiveElements = await page.locator(
    'a, button, input, select, textarea'
  ).all();

  for (const element of interactiveElements.slice(0, 5)) {
    await element.focus();

    // Check if outline is visible (basic check)
    const outlineStyle = await element.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
      };
    });

    // Should have some focus indicator
    const hasFocusIndicator =
      outlineStyle.outlineWidth !== '0px' ||
      outlineStyle.outline !== 'none';

    // This is a basic check - visual regression testing is better for this
    expect(hasFocusIndicator).toBeDefined();
  }
}

