/**
 * Results Display Components
 *
 * This module provides components for displaying benefit eligibility results
 * with user-friendly confidence indicators and clear explanations.
 */

# Results Display System

## Overview

The results display system has been updated to use **context-aware confidence labels** instead of confusing percentage-based confidence scores.

## Before vs After

### ❌ Old System (Confusing)
- "High 95%" on a "Not Qualified" result
- Users interpreted this as "95% chance I qualify"
- Actually meant "95% confident you DON'T qualify"

### ✅ New System (Clear)
- **For Qualified Results**: "Strong Match 👍", "Good Match ✓", "Possible Match ?"
- **For Not Qualified Results**: "Clear Mismatch", "Likely Ineligible", "Insufficient Data ?"
- **For Uncertain Results**: "Needs Verification ?", "More Info Required ❓"

## Components

### ConfidenceScore

Displays context-aware confidence labels for eligibility determination.

**Updated Props:**
```tsx
import { ConfidenceScore } from '@/components/results';

<ConfidenceScore
  level="high"
  score={95}
  status="qualified"  // NEW: Required for context-aware labels
  showLabel={true}
  size="md"
/>
```

**Output Examples:**
- `status="qualified" + level="high"` → "Strong Match 👍"
- `status="not-qualified" + level="high"` → "Clear Mismatch"
- `status="maybe" + level="medium"` → "Needs Verification ?"

### Context-Aware Label Mapping

| Eligibility Status | Confidence Level | Display Label |
|-------------------|------------------|---------------|
| `qualified` | `high` | Strong Match 👍 |
| `qualified` | `medium` | Good Match ✓ |
| `qualified` | `low` | Possible Match ? |
| `not-qualified` | `high` | Clear Mismatch |
| `not-qualified` | `medium` | Likely Ineligible |
| `not-qualified` | `low` | Insufficient Data ? |
| `likely` | `high` | Strong Match 👍 |
| `likely` | `medium` | Good Match ✓ |
| `likely` | `low` | Needs Verification ? |
| `maybe` | `high/medium` | Needs Verification ? |
| `maybe` | `low` | More Info Required ❓ |
| `unlikely` | `high/medium` | Likely Ineligible |
| `unlikely` | `low` | Insufficient Data ? |

### Utility Function

For components using basic eligibility data (without detailed status):

```tsx
import { getContextualLabelFromBasicData } from '@/components/results';

const label = getContextualLabelFromBasicData(
  eligible: true,     // boolean
  confidence: 95,     // 0-100
  incomplete: false   // optional
);

// Returns: { text: "Strong Match", icon: "👍" }
```

### Tooltip Explanations

The new system provides context-aware tooltip explanations:

- **For Qualified Results**: "You meet all the requirements we can verify. This is a reliable match."
- **For Not Qualified Results**: "Based on the information provided, you clearly do not meet the requirements."
- **For Uncertain Results**: "Your eligibility is uncertain. Consider contacting the program for clarification."

## Updated Components

The following components have been updated to use the new system:

1. **ConfidenceScore** - Main component with context-aware labels
2. **ProgramCard** - Uses ConfidenceScore with status prop
3. **EligibilityResultExplanation** - Uses utility function for basic data
4. **DatabaseUsageExample** - Updated confidence display

## Benefits

✅ **User-Friendly**: Labels match user expectations
✅ **Clear Intent**: No more "High 95%" confusion
✅ **Actionable**: Suggests next steps when appropriate
✅ **Accessible**: Plain language for all reading levels
✅ **Consistent**: Works across all eligibility statuses

## Migration Guide

### For Components Using `ConfidenceScore`

**Before:**
```tsx
<ConfidenceScore level="high" score={95} />
```

**After:**
```tsx
<ConfidenceScore
  level="high"
  score={95}
  status="qualified"  // Add this required prop
/>
```

### For Components Using Basic Eligibility Data

**Before:**
```tsx
<span>Confidence: {result.confidence}%</span>
```

**After:**
```tsx
import { getContextualLabelFromBasicData } from '@/components/results';

const label = getContextualLabelFromBasicData(
  result.eligible,
  result.confidence,
  result.incomplete
);

<span>{label.text} {label.icon}</span>
```

## Testing

All existing tests should continue to work. The new system maintains backward compatibility for the underlying data structures while changing only the display layer.

---

### DocumentChecklist

Interactive checklist of required documents.

```tsx
import { DocumentChecklist } from '@/components/results';

<DocumentChecklist
  documents={requiredDocuments}
  onToggle={(docId, obtained) => handleDocumentToggle(docId, obtained)}
/>
```

### NextStepsList

Displays actionable next steps with priority indicators.

```tsx
import { NextStepsList } from '@/components/results';

<NextStepsList
  steps={nextSteps}
  onToggle={(stepIndex, completed) => handleStepToggle(stepIndex, completed)}
/>
```

### WhyExplanation

Modal dialog explaining eligibility determinations.

```tsx
import { WhyExplanation } from '@/components/results';

<WhyExplanation
  programName="SNAP"
  status="qualified"
  explanation={detailedExplanation}
  onClose={() => setShowModal(false)}
/>
```

### ResultsSummary

High-level overview of all eligibility results.

```tsx
import { ResultsSummary } from '@/components/results';

<ResultsSummary
  results={allResults}
  filter={currentFilter}
  sortOptions={sortPreferences}
/>
```

### ProgramCard

Detailed card for individual program results with expandable sections.

```tsx
import { ProgramCard } from '@/components/results';

<ProgramCard
  result={programResult}
  onDocumentToggle={handleDocumentToggle}
  onStepToggle={handleStepToggle}
/>
```

## Hooks

### useEligibilityEvaluation

Hook for evaluating eligibility and managing evaluation state.

```tsx
import { useEligibilityEvaluation } from '@/components/results';

const {
  evaluateEligibility,
  results,
  isEvaluating,
  error
} = useEligibilityEvaluation();
```

### useResultsManagement

Hook for managing results (save, load, export, compare).

```tsx
import { useResultsManagement } from '@/components/results';

const {
  saveResults,
  loadResults,
  exportResults,
  compareResults
} = useResultsManagement();
```

## Export Utilities

### PDF Export

```tsx
import { exportToPDF } from '@/components/results';

await exportToPDF(results, {
  includeExplanations: true,
  includeDocuments: true
});
```

### Encrypted Export/Import

```tsx
import { exportEncrypted, importEncrypted } from '@/components/results';

// Export
const encryptedData = await exportEncrypted(results, password);

// Import
const decryptedResults = await importEncrypted(encryptedData, password);
```

## Print Support

All components include print-optimized styles via `print.css`. Results automatically format appropriately for printing.

## Accessibility

- All interactive elements are keyboard accessible
- Proper ARIA labels and roles
- High contrast color schemes
- Screen reader friendly descriptions
- Semantic HTML structure

## Performance

- Components use React.memo() for optimization
- Expensive calculations are memoized
- Large lists use virtualization where appropriate
- Database queries are optimized with proper indexing
