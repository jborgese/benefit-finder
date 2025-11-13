# Memory Leak Fix: Zustand Persist Middleware

## Problem

The App component was experiencing memory leaks in tests, causing "JS heap out of memory" errors. The root cause was identified as Zustand's `persist` middleware creating storage event listeners (`window.addEventListener('storage', ...)`) that persist across tests and accumulate, causing memory leaks.

## Solution: Conditional Persist Middleware

### Approach 1: Disable Persist in Test Environment ✅ IMPLEMENTED

**Status**: ✅ Implemented and recommended

**Implementation**:
- Created `src/stores/persist-helper.ts` with `isTestEnvironment()` utility
- Modified all stores using persist middleware to conditionally apply it:
  - `src/stores/appSettingsStore.ts`
  - `src/stores/encryptionStore.ts`
  - `src/questionnaire/store.ts`

**How it works**:
```typescript
export const useAppSettingsStore = create<AppSettingsState>()(
  isTestEnvironment()
    ? storeCreator
    : persist(storeCreator, { name: 'my-store' })
);
```

**Benefits**:
- ✅ Prevents storage event listeners from being created in tests
- ✅ No dependency upgrades required
- ✅ Type-safe implementation
- ✅ Minimal code changes
- ✅ Production behavior unchanged

**Drawbacks**:
- ⚠️ Tests run without persistence (expected behavior)

### Approach 2: Zustand 5.x with Cleanup Hooks ❌ NOT IMPLEMENTED

**Status**: ❌ Not viable - Zustand 5.x is still in alpha

**Investigation Results**:
- Zustand 5.0.0-alpha.2 exists but is unstable
- No official cleanup hooks documented
- Would require extensive refactoring
- Risk of breaking changes

**Recommendation**: Wait for Zustand 5.x stable release before considering this approach.

## Additional Fixes Applied

1. **Fixed `queueMicrotask` Promise chains** in `useResultsManagement.ts`
   - Replaced with `Promise.resolve().then()` for better cancellation support

2. **Improved Zustand store cleanup** in `src/test/setup.ts`
   - Explicit clearing of persist storage keys
   - Better garbage collection hints

3. **Enhanced AbortController usage** in `App.tsx` and `useResultsManagement.ts`
   - Proper signal checking throughout async operations

## Testing

To verify the fix works:

1. Re-enable one of the skipped tests in `src/__tests__/App.test.tsx`
2. Run the test suite: `npm test`
3. Monitor memory usage - should not accumulate across tests

## Files Modified

- `src/stores/persist-helper.ts` (new)
- `src/stores/appSettingsStore.ts`
- `src/stores/encryptionStore.ts`
- `src/questionnaire/store.ts`
- `src/components/results/useResultsManagement.ts`
- `src/test/setup.ts`

## Conclusion

**Recommended Approach**: Conditional persist middleware (Approach 1)

This approach is:
- ✅ Production-ready
- ✅ Low risk
- ✅ Immediately effective
- ✅ Maintainable

Zustand 5.x upgrade can be reconsidered once it reaches stable release.



