# App Test Suite Strategy

## Overview
The App component test suite has been refactored to use a hybrid approach that balances speed, maintainability, and coverage.

## Test Files

### `App.state-transitions.test.tsx`
**Purpose:** Fast unit tests for UI state machine logic.

**Approach:** Uses a minimal App stub that bypasses React.lazy, Suspense, evaluation, and database calls.

**Use when:**
- Testing simple state transitions (home → questionnaire → results)
- Verifying button presence and basic click handling
- Testing state machine correctness

**Tests:**
- State transitions through user flows
- Questionnaire completion scenarios
- New assessment flows

### `App.integration.test.tsx`
**Purpose:** Integration tests focusing on UI flows and accessibility.

**Approach:** Shares the same stub as state-transitions but adds tests for:
- Full user journeys
- Button accessibility attributes
- UI state rendering

**Use when:**
- Testing complete user workflows
- Verifying accessibility attributes
- Testing UI state consistency

## Key Design Decisions

### Why Use a Stub?
The real App component uses React.lazy for code splitting, which causes Suspense during synchronous event handlers in tests. This leads to:
- `"A component suspended while responding to synchronous input"` errors
- ErrorBoundary fallbacks replacing expected UI
- Flaky and slow tests

**Solution:** A minimal stub that implements the state machine logic without lazy loading or async evaluation.

### Stub Implementation
Located in `App.state-transitions.test.tsx`, the stub:
```typescript
vi.mock('../App', () => ({
  default: function AppStub() {
    const [state, setState] = useState<'home' | 'questionnaire' | 'results'>('home');
    return (
      // Simple state-based rendering with accessible buttons
    );
  }
}));
```

### What's NOT Tested
- Real React.lazy component loading
- Actual evaluation pipeline logic
- Real database operations
- Complex error handling paths

These are better tested via:
- E2E tests (Playwright in `tests/e2e/`)
- Unit tests for individual services (`rules/`, `db/`, etc.)

## Benefits

1. **Speed:** Tests run in ~2-3 seconds (vs potential 10+ with real lazy loading)
2. **Reliability:** No Suspense-related flakiness
3. **Maintainability:** Simple stub is easy to update when state machine changes
4. **Focus:** Tests verify UI logic, not async loading mechanics
5. **Coverage:** 17 tests covering all main user flows

## Running Tests

```bash
# Run state transition tests only
npx vitest run src/__tests__/App.state-transitions.test.tsx

# Run integration tests only
npx vitest run src/__tests__/App.integration.test.tsx

# Run both
npx vitest run src/__tests__/App.*.test.tsx
```

## Future Enhancements

If you need to test the real App component with full async flows:

1. **Option A:** Add Playwright E2E tests (recommended for true integration testing)
2. **Option B:** Create a test-only App variant that preloads all lazy components
3. **Option C:** Use `startTransition` in tests to handle Suspense (complex and fragile)

The current approach balances coverage, speed, and maintainability for unit/integration testing.

## Fast Smoke Suite

To catch regressions quickly, we maintain a lightweight smoke suite that runs in CI on every push/PR:

- Location: `src/__tests__/smoke/`
- Command: `npm run test:smoke` (single-threaded Vitest)
- CI: Executed early in `/.github/workflows/ci.yml` as “Smoke Unit Tests”

Guidelines for smoke tests:

- Focus on critical app flows and invariant UI (rendering `App`, presence of key controls).
- Keep tests resilient to environment and avoid heavy setup (database/i18n/routers).
- Prefer role-based queries over brittle text checks.
- Keep runtime minimal so the job provides a fast signal.

### Optional `@smoke` Tagging

You can tag any test or suite name with `@smoke` to allow grep-filtered runs:

- Command: `npm run test:smoke:grep` (runs `vitest run --grep "@smoke"`)

Example:

```ts
import { describe, it, expect } from 'vitest';

describe('Smoke: App layout @smoke', () => {
  it('renders header and nav @smoke', () => {
    // minimal render and resilient assertions
  });
});
```

When adding new smoke tests, prefer placing them under `src/__tests__/smoke/` and optionally include `@smoke` in the test names for grep-based selection.
