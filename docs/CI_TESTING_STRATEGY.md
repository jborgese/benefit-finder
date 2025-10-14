# CI Testing Strategy

## Overview

The BenefitFinder CI pipeline uses an optimized testing strategy to balance comprehensive coverage with reasonable execution times.

## Test Execution Strategy

### 1. **Comprehensive E2E Tests (Chromium Only)**
- **What**: All E2E tests (`**/*.e2e.ts`)
- **Where**: Chromium only
- **Why**: Most functionality is browser-agnostic; testing on one modern browser catches 95%+ of issues
- **Time**: ~3-5 minutes

### 2. **Cross-Browser Smoke Tests**
- **What**: Critical path tests tagged with `@smoke`
- **Where**: Chromium, Firefox, WebKit
- **Why**: Ensures core functionality works across all major browser engines
- **Time**: ~2-3 minutes

### 3. **Accessibility Tests**
- **What**: All accessibility tests (`**/*.a11y.ts`)
- **Where**: Chromium with a11y project configuration
- **Why**: Accessibility testing is browser-specific but doesn't need exhaustive coverage
- **Time**: ~2-3 minutes

### 4. **Unit Tests**
- **What**: All Vitest unit tests
- **Where**: Node.js environment
- **Why**: Fast, isolated testing of business logic
- **Time**: <1 minute

## Total CI Time
- **Before optimization**: 13-15 minutes (685 test executions)
- **After optimization**: 6-8 minutes (~150 test executions)
- **Savings**: ~50% reduction in CI time

## Tagging Tests as Smoke Tests

Mark critical path tests with the `@smoke` tag in the test title:

```typescript
// Smoke test - runs on all browsers
test('should load application successfully @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

// Regular test - runs on Chromium only in CI
test('should validate complex form input', async ({ page }) => {
  // ... test implementation
});
```

### What Should Be a Smoke Test?

Tag tests as `@smoke` if they verify:
- ✅ Application loads and renders
- ✅ Critical user flows (start questionnaire, view results)
- ✅ Navigation between major sections
- ✅ Offline functionality basics
- ✅ Data persistence (save/load)

Do NOT tag as smoke if they test:
- ❌ Edge cases or error handling
- ❌ Complex business logic (already covered by unit tests)
- ❌ Visual styling or layout details
- ❌ Performance characteristics
- ❌ Advanced features or optional flows

## Local Development

### Run All Tests Locally
```bash
npm run test:e2e
```
This runs all tests across all browser projects defined in `playwright.config.ts`.

### Run Smoke Tests Only
```bash
npm run test:e2e:core
```

### Run Chromium Tests Only
```bash
npm run test:e2e:chromium
```

### Run Accessibility Tests
```bash
npm run test:a11y
```

## Performance Testing

For performance testing on low-end devices, use the dedicated configuration:

```bash
npx playwright test --config=playwright.config.lowend.ts
```

This is typically run manually or in a separate scheduled workflow, not on every commit.

## Browser Coverage Matrix

| Test Type | Chromium | Firefox | WebKit | Mobile | Tablet |
|-----------|----------|---------|--------|--------|--------|
| **Smoke Tests** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Full E2E Suite** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Accessibility** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Performance (Manual)** | ✅ | ❌ | ❌ | ✅ | ❌ |

## Rationale

### Why Not Test Everything on All Browsers?

1. **Privacy-First, Offline-First Architecture**
   - Core logic runs in JavaScript, not browser-specific APIs
   - Data storage uses standard IndexedDB (well-supported)
   - No external dependencies or APIs to test

2. **Modern Browser Convergence**
   - Chromium, Firefox, and Safari share similar standards compliance
   - Major differences are in experimental features (not used in this app)
   - CSS/rendering differences are minimal with modern frameworks

3. **Time vs. Value Trade-off**
   - Testing 685 times vs. 150 times saves 7+ minutes per CI run
   - Smoke tests catch browser-specific issues efficiently
   - Full Chromium suite catches functional regressions

4. **Resource Efficiency**
   - Faster CI means faster feedback loops
   - Lower costs for hosted CI/CD services
   - More sustainable for open-source contributions

## Monitoring and Adjustment

### When to Expand Cross-Browser Testing
- If browser-specific bugs are discovered in production
- If new features use experimental/non-standard APIs
- If user analytics show significant non-Chromium usage

### When to Add Smoke Tests
- New critical user flows are implemented
- Existing flows become mission-critical
- Browser-specific regressions are discovered

### When to Remove Smoke Tests
- Features are deprecated or removed
- Tests become redundant with better unit tests
- Coverage analysis shows diminishing returns

## Future Optimizations

### Test Sharding (for larger test suites)
```yaml
# .github/workflows/ci.yml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm run test:e2e -- --shard=${{ matrix.shard }}/4
```

### Test Impact Analysis
- Run only tests affected by changed files
- Requires test dependency mapping
- Implementation: `test:e2e:changed` script

### Parallel Browser Installation
```yaml
- name: Install Playwright Browsers
  run: npx playwright install chromium firefox webkit --with-deps
```

## Related Documentation
- [Testing Guide](./tests/e2e/README.md)
- [Accessibility Testing](./ACCESSIBILITY.md)
- [Performance Testing](./PERFORMANCE_TESTING.md)

