## E2E Testing Guide

Comprehensive guide for end-to-end testing with Playwright in BenefitFinder.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Scripts](#test-scripts)
- [Writing Tests](#writing-tests)
- [Test Fixtures](#test-fixtures)
- [Accessibility Testing](#accessibility-testing)
- [Best Practices](#best-practices)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)

## Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run specific browser
npm run test:e2e -- --project=chromium

# Run accessibility tests only
npm run test:e2e -- --project=a11y
```

## Test Scripts

### `npm run test:e2e`
Runs all E2E tests across all configured browsers.

### `npm run test:e2e:ui`
Opens Playwright UI for interactive test development and debugging.

### `npm run test:e2e:headed`
Runs tests in headed mode (visible browser window).

### `npm run test:e2e:debug`
Runs tests in debug mode with Playwright Inspector.

### `npm run test:e2e:report`
Opens the HTML test report.

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from './fixtures/test-fixtures';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toHaveText('Welcome');
  });
});
```

### Using Test Fixtures

```typescript
import { test, expect } from './fixtures/test-fixtures';

test('with clean storage', async ({ cleanPage }) => {
  // Page starts with cleared localStorage/sessionStorage
  await cleanPage.goto('/');
  
  // Your test code
});

test('with mock data', async ({ pageWithData }) => {
  // Page starts with pre-populated data
  await pageWithData.goto('/');
  
  // Your test code
});
```

### Using Helper Functions

```typescript
import { test, expect } from './fixtures/test-fixtures';
import {
  waitForPageReady,
  fillFormField,
  clearAllStorage,
} from './utils/helpers';

test('form submission', async ({ page }) => {
  await page.goto('/form');
  await waitForPageReady(page);
  
  await fillFormField(page, 'Name', 'John Doe');
  await fillFormField(page, 'Email', 'john@example.com');
  
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.success')).toBeVisible();
});
```

## Test Fixtures

### Built-in Fixtures

#### `page`
Standard Playwright page object.

```typescript
test('basic test', async ({ page }) => {
  await page.goto('/');
});
```

#### `cleanPage`
Page with cleared storage (localStorage, sessionStorage, IndexedDB).

```typescript
test('fresh start', async ({ cleanPage }) => {
  await cleanPage.goto('/');
  // Storage is empty
});
```

#### `pageWithData`
Page with pre-populated mock data in localStorage.

```typescript
test('with existing data', async ({ pageWithData }) => {
  await pageWithData.goto('/');
  // Data is already loaded
});
```

### Custom Fixtures

Add your own fixtures in `tests/e2e/fixtures/test-fixtures.ts`:

```typescript
export const test = base.extend<TestFixtures>({
  myCustomFixture: async ({ page }, use) => {
    // Setup
    await page.goto('/');
    
    // Provide fixture
    await use(page);
    
    // Teardown (if needed)
  },
});
```

## Accessibility Testing

### Running Accessibility Tests

```bash
# Run accessibility tests only
npm run test:e2e -- --project=a11y

# Run specific a11y test file
npm run test:e2e -- accessibility.a11y.ts
```

### Writing Accessibility Tests

```typescript
import { test, expect } from './fixtures/test-fixtures';
import {
  expectNoA11yViolations,
  checkKeyboardNavigation,
  checkColorContrast,
} from './utils/accessibility';

test('accessibility compliance', async ({ page }) => {
  await page.goto('/');
  
  // Check for any violations
  await expectNoA11yViolations(page);
  
  // Check keyboard navigation
  await checkKeyboardNavigation(page);
  
  // Check color contrast
  await checkColorContrast(page);
});
```

### Accessibility Utilities

All utilities are in `tests/e2e/utils/accessibility.ts`:

- `runA11yScan()` - Run axe scan with options
- `expectNoA11yViolations()` - Assert no violations
- `checkKeyboardNavigation()` - Test keyboard accessibility
- `checkColorContrast()` - Verify WCAG contrast ratios
- `checkFormLabels()` - Ensure all inputs have labels
- `checkLandmarks()` - Verify semantic HTML landmarks
- `checkHeadingHierarchy()` - Validate heading structure
- `formatViolations()` - Pretty-print violations

## Best Practices

### 1. **Use Semantic Selectors**

```typescript
// ✅ Good - semantic and stable
await page.getByRole('button', { name: 'Submit' })
await page.getByLabel('Email address')
await page.getByText('Welcome')

// ❌ Avoid - fragile
await page.locator('.btn-primary')
await page.locator('#submit-btn')
```

### 2. **Wait for Elements Properly**

```typescript
// ✅ Good - wait for visibility
await expect(page.getByText('Success')).toBeVisible();

// ✅ Good - wait for specific state
await page.getByRole('button').waitFor({ state: 'visible' });

// ❌ Avoid - arbitrary timeouts
await page.waitForTimeout(1000);
```

### 3. **Test User Workflows**

```typescript
// ✅ Good - test complete workflow
test('user can create profile', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  await page.fill('input[name="name"]', 'Jane Doe');
  await page.click('button[type="submit"]');
  await expect(page.getByText('Profile created')).toBeVisible();
});

// ❌ Avoid - testing implementation details
test('form submits correctly', async ({ page }) => {
  await page.evaluate(() => submitForm());
});
```

### 4. **Keep Tests Independent**

```typescript
// ✅ Good - each test is independent
test('test A', async ({ cleanPage }) => {
  // Start fresh
});

test('test B', async ({ cleanPage }) => {
  // Start fresh
});

// ❌ Avoid - tests depend on each other
let globalState: any;
test('test A', async ({ page }) => {
  globalState = await setup();
});
test('test B', async ({ page }) => {
  // Depends on test A
  await doSomethingWith(globalState);
});
```

### 5. **Test Responsive Design**

```typescript
test('works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Test mobile-specific behavior
});

// Or use device presets
test('works on iPhone', async ({ page }) => {
  await page.goto('/', { 
    viewport: devices['iPhone 14'].viewport 
  });
});
```

### 6. **Handle Async Operations**

```typescript
// ✅ Good - wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('text=Next'),
]);

// ✅ Good - wait for API response
await Promise.all([
  page.waitForResponse(response => response.url().includes('/api/')),
  page.click('button[type="submit"]'),
]);
```

### 7. **Test Error States**

```typescript
test('shows error on invalid input', async ({ page }) => {
  await page.goto('/form');
  
  // Submit without filling required fields
  await page.click('button[type="submit"]');
  
  // Check error message
  await expect(page.getByText('This field is required')).toBeVisible();
});
```

## Debugging

### Debug Mode

```bash
# Run in debug mode with Playwright Inspector
npm run test:e2e:debug

# Debug specific test
npm run test:e2e:debug -- app.e2e.ts
```

### Headed Mode

```bash
# Watch tests run in browser
npm run test:e2e:headed
```

### Screenshots on Failure

Screenshots are automatically saved to `test-results/` on failure.

### Video Recording

Videos are recorded on failure. Find them in `test-results/`.

### Trace Files

Traces are saved on failure. View with:

```bash
npx playwright show-trace test-results/trace.zip
```

### Console Output

```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('/');
});
```

### Pause Execution

```typescript
test('pause test', async ({ page }) => {
  await page.goto('/');
  
  await page.pause(); // Opens Playwright Inspector
  
  // Continue with test
});
```

## Test Organization

### File Naming

- E2E tests: `*.e2e.ts`
- Accessibility tests: `*.a11y.ts`
- Helper utilities: `utils/*.ts`
- Fixtures: `fixtures/*.ts`

### Test Structure

```
tests/e2e/
├── app.e2e.ts              # Core app tests
├── questionnaire.e2e.ts    # Questionnaire tests
├── results.e2e.ts          # Results display tests
├── accessibility.a11y.ts   # A11y tests
├── fixtures/
│   └── test-fixtures.ts    # Custom fixtures
├── utils/
│   ├── helpers.ts          # Helper functions
│   └── accessibility.ts    # A11y utilities
└── setup/
    └── global-setup.ts     # Global setup
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Browsers not installed

```bash
npx playwright install
```

### Tests timing out

Increase timeout in `playwright.config.ts`:

```typescript
timeout: 60 * 1000, // 60 seconds
```

### Element not found

Use proper waiting:

```typescript
// Wait for element
await page.waitForSelector('text=Content');

// Or use expect
await expect(page.locator('text=Content')).toBeVisible();
```

### Flaky tests

1. Add explicit waits
2. Use `waitForLoadState('networkidle')`
3. Increase timeouts
4. Check for race conditions

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

