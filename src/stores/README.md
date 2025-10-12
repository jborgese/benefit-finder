# Zustand Store Architecture

This directory contains the Zustand state management stores for BenefitFinder.

## Store Organization

### **appSettingsStore.ts**
Manages user preferences and application settings.

- Theme, font size, language
- Privacy and security preferences
- Accessibility settings
- Feature flags

**Persistence:** ✅ localStorage (via Zustand persist middleware)

### **questionnaireStore.ts**
Manages the eligibility questionnaire flow and state.

- Session management
- Question navigation and history
- User answers and validation
- Progress tracking

**Persistence:** ❌ Ephemeral (RxDB handles long-term persistence)

### **uiStore.ts**
Manages ephemeral UI state.

- Loading states and progress
- Modal management
- Toast notifications
- Sidebar/navigation state

**Persistence:** ❌ Ephemeral (resets on reload)

## Usage Examples

### Basic Usage

```tsx
import { useAppSettingsStore, useUIStore } from '@/stores';

function MyComponent() {
  // Select specific state
  const theme = useAppSettingsStore((state) => state.theme);
  const setTheme = useAppSettingsStore((state) => state.setTheme);
  
  // Or select multiple values
  const { isLoading, addToast } = useUIStore((state) => ({
    isLoading: state.isLoading,
    addToast: state.addToast,
  }));
  
  return (
    <button onClick={() => addToast({ type: 'success', message: 'Saved!' })}>
      Save
    </button>
  );
}
```

### Composite Hook

```tsx
import { useCommonState } from '@/stores';

function Header() {
  const { theme, language, isLoading } = useCommonState();
  
  return <header>...</header>;
}
```

### Questionnaire Flow

```tsx
import { useQuestionnaireStore } from '@/stores';

function QuestionPage() {
  const {
    currentQuestionId,
    setAnswer,
    goToNextQuestion,
    progress,
  } = useQuestionnaireStore((state) => ({
    currentQuestionId: state.currentQuestionId,
    setAnswer: state.setAnswer,
    goToNextQuestion: state.goToNextQuestion,
    progress: state.progress,
  }));
  
  const handleAnswer = (value: string) => {
    setAnswer(currentQuestionId!, value);
    goToNextQuestion('next-question-id');
  };
  
  return (
    <div>
      <ProgressBar percent={progress.percentComplete} />
      {/* Question UI */}
    </div>
  );
}
```

### Toast Notifications

```tsx
import { useUIStore } from '@/stores';

function SaveButton() {
  const addToast = useUIStore((state) => state.addToast);
  
  const handleSave = async () => {
    try {
      await saveData();
      addToast({
        type: 'success',
        message: 'Your information has been saved.',
        duration: 3000,
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to save. Please try again.',
        duration: 5000,
      });
    }
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### Modal Management

```tsx
import { useUIStore } from '@/stores';

function DeleteButton() {
  const { openModal, closeModal } = useUIStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal,
  }));
  
  const handleDelete = () => {
    const modalId = openModal({
      type: 'confirm',
      title: 'Delete Profile?',
      data: { 
        message: 'This action cannot be undone.',
        onConfirm: () => {
          deleteProfile();
          closeModal(modalId);
        },
      },
    });
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

## Best Practices

### 1. **Use Selectors**
Always use selectors to subscribe only to the state you need:

```tsx
// ✅ Good - only re-renders when theme changes
const theme = useAppSettingsStore((state) => state.theme);

// ❌ Bad - re-renders on any settings change
const settings = useAppSettingsStore();
```

### 2. **Separate Actions from State**
For better performance, separate state selectors from action selectors:

```tsx
// ✅ Good
const theme = useAppSettingsStore((state) => state.theme);
const setTheme = useAppSettingsStore((state) => state.setTheme);

// ⚠️ Less optimal but acceptable
const { theme, setTheme } = useAppSettingsStore();
```

### 3. **Type Safety**
Always use TypeScript types for store values:

```tsx
import type { AppSettingsState } from '@/stores';

const theme: AppSettingsState['theme'] = useAppSettingsStore((state) => state.theme);
```

### 4. **Immer for Complex Updates**
The questionnaire store uses Immer for safe, immutable updates:

```tsx
// Immer allows direct mutation syntax
set((state) => {
  state.answers[questionId] = newAnswer; // Looks like mutation
  state.progress.percentComplete = 50;    // But produces immutable result
});
```

### 5. **Avoid Storing Derived State**
Don't store values that can be computed from existing state:

```tsx
// ❌ Bad - storing derived state
percentComplete: number;

// ✅ Good - compute on demand or in selector
const percentComplete = (answeredCount / totalCount) * 100;
```

## Testing Stores

```tsx
import { renderHook, act } from '@testing-library/react';
import { useAppSettingsStore } from '@/stores';

describe('appSettingsStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppSettingsStore.getState().resetSettings();
  });
  
  it('should update theme', () => {
    const { result } = renderHook(() => useAppSettingsStore());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.theme).toBe('dark');
  });
});
```

## DevTools

The stores use Zustand DevTools middleware for debugging. Install the Redux DevTools browser extension to inspect state changes.

## Performance Tips

1. **Use shallow equality** for object/array selectors:
   ```tsx
   import { shallow } from 'zustand/shallow';
   
   const { theme, language } = useAppSettingsStore(
     (state) => ({ theme: state.theme, language: state.language }),
     shallow
   );
   ```

2. **Memoize complex selectors** with `useMemo`:
   ```tsx
   const eligiblePrograms = useMemo(() => 
     answers.filter(/* complex logic */),
     [answers]
   );
   ```

3. **Split large stores** - Each store should have a single responsibility

## Future Enhancements

- [ ] Add store persistence to IndexedDB for large datasets
- [ ] Implement store hydration from RxDB
- [ ] Add middleware for audit logging (privacy-safe)
- [ ] Create dev tools for questionnaire flow visualization

