# Results Display Components

Comprehensive UI components for displaying benefit eligibility results.

---

## Overview

The Results Display system provides a complete solution for showing users their eligibility status across multiple benefit programs, including:

- **Visual summary** of results
- **Detailed program cards** with eligibility status, confidence scores, required documents, and next steps
- **"Why?" explanations** for transparency
- **Print-friendly views** for documentation
- **Integration with rule engine** for accurate eligibility determination

---

## Component Overview

**15 Components Total:**
- **Display Components (8)**: ResultsSummary, ProgramCard, ConfidenceScore, DocumentChecklist, NextStepsList, WhyExplanation, PrintView, useEligibilityEvaluation
- **Management Components (7)**: ResultsHistory, ResultsExport, ResultsImport, ResultsComparison, useResultsManagement, resultsSchema, exportUtils

---

## Display Components

### ResultsSummary

Displays overview of eligibility results with status filters and quick statistics.

```tsx
import { ResultsSummary } from '@/components/results';

<ResultsSummary
  results={eligibilityResults}
  onFilterChange={(status) => setFilter(status)}
  activeFilter={currentFilter}
/>
```

**Features:**
- Visual progress indicator
- Status breakdown (qualified, likely, maybe, not qualified)
- Interactive filters
- Quick tips based on results

### ProgramCard

Detailed card for individual program eligibility information.

```tsx
import { ProgramCard } from '@/components/results';

<ProgramCard
  result={programResult}
  onDocumentToggle={(docId, obtained) => handleDocumentCheck(docId, obtained)}
  onStepToggle={(stepIndex, completed) => handleStepCheck(stepIndex, completed)}
/>
```

**Features:**
- Eligibility status badge
- Confidence score display
- Expandable sections for documents and next steps
- "Why?" explanation dialog
- Estimated benefit amount (if available)
- Processing time and deadline info

### ConfidenceScore

Displays confidence level and percentage for eligibility determination.

```tsx
import { ConfidenceScore } from '@/components/results';

<ConfidenceScore
  level="high"
  score={95}
  showLabel={true}
  size="md"
/>
```

### DocumentChecklist

Interactive checklist of required documents.

```tsx
import { DocumentChecklist } from '@/components/results';

<DocumentChecklist
  documents={result.requiredDocuments}
  onToggle={(docId, obtained) => handleDocumentCheck(docId, obtained)}
/>
```

**Features:**
- Checkbox tracking
- Required vs optional documents
- Document alternatives
- "Where to get it" information
- Print-friendly formatting

### NextStepsList

Step-by-step application instructions with progress tracking.

```tsx
import { NextStepsList } from '@/components/results';

<NextStepsList
  steps={result.nextSteps}
  onToggle={(stepIndex, completed) => handleStepComplete(stepIndex, completed)}
/>
```

**Features:**
- Priority-based sorting
- Progress tracking
- Links to application portals
- Estimated time for each step

### WhyExplanation

Detailed explanation dialog showing why a determination was made.

```tsx
import { WhyExplanation } from '@/components/results';

<WhyExplanation
  programName="SNAP"
  status="qualified"
  explanation={result.explanation}
  onClose={() => setShowExplanation(false)}
/>
```

**Features:**
- Rule-by-rule breakdown
- Calculations shown
- Citations to rules
- Privacy transparency

### PrintView

Optimized layout for printing results.

```tsx
import { PrintView } from '@/components/results';

<PrintView
  results={eligibilityResults}
  userInfo={{ name: "John Doe", evaluationDate: new Date() }}
/>
```

---

## Hooks

### useEligibilityEvaluation

Hook for evaluating eligibility using rule packages.

```tsx
import { useEligibilityEvaluation } from '@/components/results';

const { results, isEvaluating, error } = useEligibilityEvaluation({
  rulePackages: [snapRules, medicaidRules, wicRules],
  profile: userProfile,
  includeNotQualified: true,
});
```

**Parameters:**
- `rulePackages`: Array of rule packages to evaluate
- `profile`: User profile data
- `includeNotQualified`: Whether to include programs user doesn't qualify for

**Returns:**
- `results`: `EligibilityResults` object with categorized programs
- `isEvaluating`: Loading state
- `error`: Error if evaluation failed

---

## Complete Example

```tsx
import React, { useState } from 'react';
import {
  ResultsSummary,
  ProgramCard,
  PrintView,
  useEligibilityEvaluation,
  type EligibilityStatus,
} from '@/components/results';

// Import rule packages
import snapFederalRules from '@/rules/examples/snap-federal-rules.json';
import medicaidFederalRules from '@/rules/examples/medicaid-federal-rules.json';
import wicFederalRules from '@/rules/examples/wic-federal-rules.json';

function ResultsPage() {
  const [activeFilter, setActiveFilter] = useState<EligibilityStatus | 'all'>('all');
  const [isPrintView, setIsPrintView] = useState(false);

  // Get user profile from your state management
  const userProfile = {
    age: 35,
    householdSize: 3,
    householdIncome: 2500,
    householdAssets: 1500,
    citizenship: 'us_citizen',
    state: 'GA',
    isPregnant: false,
    hasChildren: true,
  };

  // Evaluate eligibility
  const { results, isEvaluating, error } = useEligibilityEvaluation({
    rulePackages: [
      snapFederalRules,
      medicaidFederalRules,
      wicFederalRules,
    ],
    profile: userProfile,
    includeNotQualified: true,
  });

  if (isEvaluating) {
    return <div>Evaluating eligibility...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!results) {
    return <div>No results available</div>;
  }

  // Filter programs based on active filter
  const filteredPrograms = activeFilter === 'all'
    ? [...results.qualified, ...results.likely, ...results.maybe, ...results.notQualified]
    : results[activeFilter === 'not-qualified' ? 'notQualified' : activeFilter];

  // Print view
  if (isPrintView) {
    return <PrintView results={results} userInfo={{ name: 'User' }} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Print Button */}
      <div className="mb-6 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🖨️ Print Results
        </button>
      </div>

      {/* Summary */}
      <ResultsSummary
        results={results}
        onFilterChange={setActiveFilter}
        activeFilter={activeFilter}
      />

      {/* Program Cards */}
      <div className="space-y-6">
        {filteredPrograms.map((program) => (
          <ProgramCard
            key={program.programId}
            result={program}
            onDocumentToggle={(docId, obtained) => {
              console.log(`Document ${docId} obtained: ${obtained}`);
            }}
            onStepToggle={(stepIndex, completed) => {
              console.log(`Step ${stepIndex} completed: ${completed}`);
            }}
          />
        ))}
      </div>

      {/* No Results Message */}
      {filteredPrograms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No programs match the current filter.</p>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
```

---

## Types

All TypeScript types are exported from the main index:

```tsx
import type {
  EligibilityStatus,      // 'qualified' | 'likely' | 'maybe' | 'unlikely' | 'not-qualified'
  ConfidenceLevel,        // 'high' | 'medium' | 'low'
  RequiredDocument,       // Document with alternatives, where to get it, etc.
  NextStep,               // Step with priority, URL, estimated time
  EligibilityExplanation, // Reason, details, rules cited, calculations
  ProgramEligibilityResult, // Complete result for one program
  EligibilityResults,     // Results for all programs
  ResultsFilter,          // Filter options
  ResultsSortBy,          // Sort options
  ResultsSortOptions,     // Sort configuration
} from '@/components/results';
```

---

## Styling

### Tailwind Classes

All components use Tailwind CSS with the project's theme configuration. Key classes:

- Status colors: `green-*` (qualified), `blue-*` (likely), `yellow-*` (maybe), `gray-*` (not qualified)
- Interactive elements: Radix UI components for accessibility
- Responsive: Mobile-first design with `md:` and `lg:` breakpoints

### Print Styles

Print-friendly styles are automatically loaded. To trigger print:

```tsx
<button onClick={() => window.print()}>
  Print Results
</button>
```

Print styles:
- Remove shadows and unnecessary styling
- Show all accordion content
- Page break management
- Include URLs after links
- Optimize typography

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Keyboard navigation (all interactive elements)
- ✅ Screen reader support (ARIA labels)
- ✅ Color contrast (4.5:1 minimum)
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ Status announcements

---

## Integration with Rule System

The components integrate directly with the rule system:

1. **Rule Packages** → Loaded from JSON files
2. **useEligibilityEvaluation** → Evaluates rules against user profile
3. **Results** → Mapped to UI components
4. **Citations** → Shown in "Why?" explanations

**Rule data used:**
- `requiredDocuments` → DocumentChecklist
- `nextSteps` → NextStepsList
- `explanation` → WhyExplanation
- `citations` → Source transparency

---

## Privacy & Security

- ✅ All evaluation happens **locally** (no server calls)
- ✅ No data sent to external services
- ✅ Results only stored in local state (not persisted by default)
- ✅ Print view includes privacy notice
- ✅ Transparency about calculations in "Why?" dialog

---

## Testing

Components can be tested with mock data:

```tsx
import { render, screen } from '@testing-library/react';
import { ProgramCard } from '@/components/results';

const mockResult = {
  programId: 'snap-federal',
  programName: 'SNAP',
  programDescription: 'Food assistance program',
  jurisdiction: 'US-FEDERAL',
  status: 'qualified' as const,
  confidence: 'high' as const,
  confidenceScore: 95,
  explanation: {
    reason: 'You meet all requirements',
    details: ['Income below limit', 'Citizenship verified'],
    rulesCited: ['snap-federal-income', 'snap-federal-citizenship'],
  },
  requiredDocuments: [],
  nextSteps: [],
  evaluatedAt: new Date(),
  rulesVersion: '1.0.0',
};

test('displays program name', () => {
  render(<ProgramCard result={mockResult} />);
  expect(screen.getByText('SNAP')).toBeInTheDocument();
});
```

---

## Future Enhancements

Potential improvements:

- [ ] Save/resume application progress
- [ ] Email results (with encryption)
- [ ] Generate PDF reports
- [ ] Multi-language support
- [ ] Benefit amount calculator integration
- [ ] Application deadline reminders
- [ ] Comparison mode (compare programs side-by-side)
- [ ] Export to calendar (deadlines)

---

## Support

For questions or issues:
1. Check this README
2. Review example code above
3. Check component source code
4. Open a GitHub issue

---

**Phase 1.6 Complete!** Results Display System ready for use. 🎉

