## Testing Guide

Comprehensive guide for writing and running tests in BenefitFinder.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Scripts](#test-scripts)
- [Writing Tests](#writing-tests)
- [Testing Utilities](#testing-utilities)
- [Mocking](#mocking)
- [Best Practices](#best-practices)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Scripts

### `npm test` (or `npm run test:watch`)
Runs tests in watch mode. Tests automatically re-run when files change.

### `npm run test:run`
Runs all tests once and exits. Useful for CI/CD pipelines.

### `npm run test:coverage`
Runs tests and generates a coverage report.
- HTML report: `coverage/index.html`
- Text summary in terminal

### `npm run test:ui`
Opens Vitest UI in the browser for interactive testing.

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Component Tests

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Async Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Async Operations', () => {
  it('should handle async operations', async () => {
    const result = await fetchData();
    
    expect(result).toBeDefined();
  });
  
  it('should wait for element to appear', async () => {
    render(<AsyncComponent />);
    
    const element = await screen.findByText('Loaded');
    
    expect(element).toBeInTheDocument();
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useMyHook());
    
    expect(result.current.value).toBe(0);
  });
  
  it('should update value', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.value).toBe(1);
  });
});
```

## Testing Utilities

### `renderWithProviders`

Renders components with all necessary providers.

```tsx
import { renderWithProviders } from '@/test/utils';

test('component with providers', () => {
  renderWithProviders(<MyComponent />);
  // Component has access to all global providers
});
```

### Mock Data Generators

```typescript
import {
  createMockUserProfile,
  createMockBenefitProgram,
  createMockEligibilityResult,
} from '@/test/utils';

const profile = createMockUserProfile({
  firstName: 'Custom',
  householdIncome: 50000,
});

const program = createMockBenefitProgram({
  name: 'Custom Program',
});
```

### Suppressing Console

```typescript
import { suppressConsole } from '@/test/utils';

test('component that logs errors', () => {
  const restore = suppressConsole('error', 'warn');
  
  // Test code that produces console.error/warn
  
  restore();
});
```

## Mocking

### Mocking Functions

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();

mockFn('arg');

expect(mockFn).toHaveBeenCalledWith('arg');
expect(mockFn).toHaveBeenCalledOnce();
```

### Mocking Modules

```typescript
vi.mock('../myModule', () => ({
  myFunction: vi.fn(() => 'mocked result'),
}));
```

### Mocking Zustand Stores

```typescript
import { mockAppSettingsStore, mockUIStore } from '@/test/mocks/zustand';

vi.mock('@/stores/useStore', () => ({
  useAppSettingsStore: () => mockAppSettingsStore,
  useUIStore: () => mockUIStore,
}));
```

### Mocking RxDB

```typescript
// fake-indexeddb is automatically set up in setup.ts
import { initializeDatabase } from '@/db';

// Database operations work normally in tests
const db = await initializeDatabase('test-password');
```

### Mocking Fetch

```typescript
import { mockFetch } from '@/test/utils';

mockFetch({ data: 'test' }, 200);

const response = await fetch('/api/test');
const data = await response.json();

expect(data).toEqual({ data: 'test' });
```

## Best Practices

### 1. **Use Testing Library Queries**

Follow the priority order:
1. `getByRole` (preferred)
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

```tsx
// ✅ Good - accessible
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email address')

// ❌ Avoid - implementation details
screen.getByClassName('submit-btn')
```

### 2. **Test User Behavior, Not Implementation**

```tsx
// ✅ Good - tests user behavior
it('should add item to cart', async () => {
  const user = userEvent.setup();
  render(<ProductPage />);
  
  await user.click(screen.getByRole('button', { name: 'Add to Cart' }));
  
  expect(screen.getByText('1 item in cart')).toBeInTheDocument();
});

// ❌ Avoid - tests implementation
it('should call addToCart function', () => {
  const addToCart = vi.fn();
  render(<ProductPage addToCart={addToCart} />);
  
  fireEvent.click(screen.getByTestId('add-btn'));
  
  expect(addToCart).toHaveBeenCalled();
});
```

### 3. **Prefer `userEvent` over `fireEvent`**

```tsx
import userEvent from '@testing-library/user-event';

// ✅ Good - simulates real user interaction
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');

// ❌ Less realistic
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'text' } });
```

### 4. **Use `describe` Blocks for Organization**

```typescript
describe('MyComponent', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {});
  });
  
  describe('Interactions', () => {
    it('should handle clicks', () => {});
  });
  
  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {});
  });
});
```

### 5. **Clean Up After Tests**

```typescript
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
```

### 6. **Test Accessibility**

```tsx
it('should be keyboard accessible', async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  // Tab through form
  await user.tab();
  expect(screen.getByLabelText('Name')).toHaveFocus();
  
  await user.tab();
  expect(screen.getByLabelText('Email')).toHaveFocus();
});

it('should have proper ARIA labels', () => {
  render(<Dialog />);
  
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
});
```

### 7. **Don't Test Third-Party Libraries**

```tsx
// ❌ Don't test Zustand
it('should update store', () => {
  const { result } = renderHook(() => useMyStore());
  
  act(() => result.current.setValue(5));
  
  expect(result.current.value).toBe(5);
});

// ✅ Test your component that uses the store
it('should display updated value', () => {
  render(<MyComponent />);
  
  userEvent.click(screen.getByRole('button', { name: 'Increment' }));
  
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

## Coverage

### Viewing Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI tools

### Coverage Thresholds

Current thresholds (in `vitest.config.ts`):
- Lines: 70%
- Functions: 70%
- Branches: 65%
- Statements: 70%

Tests will fail if coverage drops below these thresholds.

### Excluding Files from Coverage

Already excluded:
- Config files
- Test files
- Type definitions
- Example files

## Troubleshooting

### "Cannot find module" errors

Make sure you're using path aliases correctly:

```typescript
// ✅ Use @ alias
import { something } from '@/utils';

// ❌ Avoid relative paths
import { something } from '../../../utils';
```

### "Element not found" errors

Use `findBy` queries for async content:

```typescript
// ✅ Wait for element
const element = await screen.findByText('Loaded');

// ❌ Immediate query may fail
const element = screen.getByText('Loaded');
```

### Tests timing out

Increase timeout in `vitest.config.ts` or for specific tests:

```typescript
it('slow test', async () => {
  // Test code
}, 15000); // 15 second timeout
```

### RxDB tests failing

Ensure fake-indexeddb is imported:

```typescript
import 'fake-indexeddb/auto';
```

This is already done in `setup.ts`, so it should work automatically.

### localStorage not persisting

localStorage is cleared after each test. If you need persistence:

```typescript
beforeEach(() => {
  localStorage.setItem('key', 'value');
});
```

## Example Test Files

- `src/components/__tests__/Button.test.tsx` - Component testing example
- `src/utils/__tests__/validation.test.ts` - Utility function testing
- `src/stores/__tests__/*.test.ts` - Store testing examples
- `src/db/__tests__/*.test.ts` - Database testing examples

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [@testing-library/user-event](https://testing-library.com/docs/user-event/intro)

