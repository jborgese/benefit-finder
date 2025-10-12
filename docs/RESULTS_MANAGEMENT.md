# Results Management Guide

**Version:** 1.0
**Last Updated:** October 12, 2025

Complete guide for managing, saving, exporting, and sharing eligibility results.

---

## Table of Contents

1. [Overview](#overview)
2. [Saving Results](#saving-results)
3. [Results History](#results-history)
4. [Export to PDF](#export-to-pdf)
5. [Encrypted Export & Import](#encrypted-export--import)
6. [Results Comparison](#results-comparison)
7. [Privacy & Security](#privacy--security)
8. [API Reference](#api-reference)

---

## Overview

The Results Management system provides comprehensive tools for:

- ✅ **Saving results** to encrypted local database (RxDB)
- ✅ **Viewing history** of past eligibility screenings
- ✅ **Exporting to PDF** for printing and documentation
- ✅ **Encrypted file export** for secure sharing and backup
- ✅ **Comparing results** over time to track changes
- ✅ **Complete privacy** - all data stays on device

---

## Saving Results

### Using the Hook

```tsx
import { useResultsManagement } from '@/components/results';

function ResultsPage() {
  const { saveResults, isLoading } = useResultsManagement();

  const handleSave = async () => {
    const resultId = await saveResults({
      results: eligibilityResults,
      profileSnapshot: userProfile,
      userId: 'user-123',
      userName: 'John Doe',
      state: 'GA',
      tags: ['initial-screening', '2024'],
      notes: 'First time applying',
    });

    console.log('Saved with ID:', resultId);
  };

  return (
    <button onClick={handleSave} disabled={isLoading}>
      Save Results
    </button>
  );
}
```

### What Gets Saved

**Encrypted** (AES-256):
- User name
- Complete results data (all programs)
- Profile snapshot (income, household info, etc.)
- Personal notes

**Not Encrypted** (for searching/filtering):
- Evaluation timestamp
- State
- Program count
- Qualified count
- Tags

### Storage Location

- **Local database** (RxDB with IndexedDB)
- **Encrypted at rest** using AES-256-GCM
- **Never sent to servers**
- **User controls retention**

---

## Results History

### Viewing Saved Results

```tsx
import { ResultsHistory } from '@/components/results';

function HistoryPage() {
  return (
    <ResultsHistory
      onLoadResult={(id) => {
        // Navigate to detailed view
        router.push(`/results/${id}`);
      }}
      onCompareResults={(ids) => {
        // Open comparison view
        setCompareIds(ids);
      }}
    />
  );
}
```

### Features

- **List all saved results** with summary info
- **Filter by date, state, tags**
- **Search notes** and metadata
- **View detailed results** in dialog
- **Edit notes and tags**
- **Delete results** with confirmation
- **Compare multiple results** side-by-side

### Managing Results

```tsx
const {
  savedResults,      // Array of saved result summaries
  loadResult,        // Load full result by ID
  deleteResult,      // Delete a result
  updateResult,      // Update notes/tags
} = useResultsManagement();

// Load a specific result
const fullResult = await loadResult('result-id-123');

// Update notes
await updateResult('result-id-123', {
  notes: 'Updated information',
  tags: ['recheck', 'income-changed'],
});

// Delete a result
await deleteResult('result-id-123');
```

---

## Export to PDF

### Using the Export Component

```tsx
import { ResultsExport } from '@/components/results';

function ResultsPage({ results, userProfile }) {
  return (
    <div>
      <ResultsExport
        results={results}
        profileSnapshot={userProfile}
        userInfo={{
          name: 'John Doe',
          state: 'GA',
        }}
      />
    </div>
  );
}
```

### Direct PDF Export

```tsx
import { exportToPDF } from '@/components/results';

// Trigger PDF export programmatically
await exportToPDF(results, {
  userInfo: {
    name: 'John Doe',
    evaluationDate: new Date(),
  },
  includeNotQualified: false, // Exclude programs not qualified for
});
```

### PDF Features

- **Browser-native** print dialog (user can save as PDF)
- **Print-optimized** styling automatically applied
- **Includes**:
  - Summary statistics
  - Qualified programs with details
  - Required documents lists
  - Next steps with links
  - Privacy notice
  - Timestamp and attribution

### Print Customization

The PDF uses dedicated print styles from `print.css`:
- Optimized typography (11pt body text)
- Page break management
- URLs shown after links
- Margins set to 0.75 inches
- Privacy notice included

---

## Encrypted Export & Import

### Exporting Encrypted Files

The `ResultsExport` component includes encrypted export:

```tsx
<ResultsExport results={results} />
// User clicks "Export Encrypted File"
// Prompted for password (min 8 characters)
// Downloads .bfx file
```

### Programmatic Export

```tsx
import { exportEncrypted, downloadBlob, generateExportFilename } from '@/components/results';

// Export with password
const blob = await exportEncrypted(results, 'strongPassword123', {
  profileSnapshot: userProfile,
  metadata: {
    userName: 'John Doe',
    state: 'GA',
    notes: 'Backup before income change',
  },
});

// Download file
const filename = `${generateExportFilename('benefit-results')}.bfx`;
downloadBlob(blob, filename);
```

### File Format (.bfx)

**BenefitFinder eXport** format:
- **Encrypted** with AES-256-GCM
- **Password-protected**
- **Includes**:
  - Complete results data
  - Profile snapshot (optional)
  - Metadata (username, state, notes)
  - Export timestamp
  - Format version

### Importing Encrypted Files

```tsx
import { ResultsImport } from '@/components/results';

function ImportPage() {
  const handleImport = (results, metadata) => {
    // Use imported results
    console.log('Imported results:', results);
    console.log('Metadata:', metadata);
  };

  return (
    <ResultsImport onImport={handleImport} />
  );
}
```

### Programmatic Import

```tsx
import { importEncrypted } from '@/components/results';

// User selects file
const file = event.target.files[0];

// Import with password
const imported = await importEncrypted(file, 'strongPassword123');

console.log('Results:', imported.results);
console.log('Exported at:', imported.exportedAt);
console.log('Metadata:', imported.metadata);
```

### Security Features

1. **AES-256-GCM encryption** (military-grade)
2. **Password required** to decrypt
3. **No password recovery** (privacy-first design)
4. **Local encryption/decryption** (never sent to server)
5. **File integrity** validation

---

## Results Comparison

### Comparing Multiple Results

```tsx
import { ResultsComparison } from '@/components/results';

function ComparisonPage({ resultIds }) {
  const { loadResult } = useResultsManagement();

  // Load results to compare
  const [savedResults, setSavedResults] = useState([]);

  useEffect(() => {
    Promise.all(resultIds.map(async id => ({
      id,
      results: await loadResult(id),
      evaluatedAt: new Date(), // From loaded data
    }))).then(setSavedResults);
  }, [resultIds]);

  return (
    <ResultsComparison
      savedResults={savedResults}
      onClose={() => router.push('/history')}
    />
  );
}
```

### Comparison Features

- **Side-by-side comparison** of eligibility status
- **Track changes over time** (e.g., income changes affecting eligibility)
- **Summary statistics** for each result
- **Change indicators** (qualified count up/down)
- **Date/state context** for each result

### Use Cases

1. **Track eligibility over time** as income/situation changes
2. **Compare before/after** major life events
3. **Verify rule updates** (compare same profile with different rule versions)
4. **Family planning** (compare different household scenarios)

---

## Privacy & Security

### Data Protection

All results management features maintain privacy:

1. **Local Storage Only**
   - Data stored in browser IndexedDB
   - Never sent to external servers
   - User controls all data

2. **Encryption at Rest**
   - Sensitive fields encrypted in RxDB
   - AES-256-GCM encryption
   - Encryption key derived from user passphrase

3. **Encrypted Export**
   - Password-protected export files
   - AES-256-GCM encryption
   - No password recovery (by design)

4. **Secure Deletion**
   - Complete removal from database
   - No backup copies on servers
   - User has full control

### Best Practices

**For Users:**
- ✅ Use strong passwords for encrypted exports
- ✅ Store export files securely
- ✅ Delete old results periodically
- ✅ Don't share passwords via insecure channels

**For Developers:**
- ✅ Always use encryption for sensitive data
- ✅ Never log sensitive information
- ✅ Validate all imports
- ✅ Handle errors gracefully

---

## API Reference

### Hooks

#### `useResultsManagement()`

Manages results persistence and retrieval.

```tsx
const {
  savedResults,      // SavedResult[]
  isLoading,         // boolean
  error,             // Error | null
  saveResults,       // (options) => Promise<string>
  loadResult,        // (id) => Promise<EligibilityResults>
  loadAllResults,    // () => Promise<SavedResult[]>
  deleteResult,      // (id) => Promise<void>
  updateResult,      // (id, updates) => Promise<void>
} = useResultsManagement();
```

**Methods:**

- `saveResults(options)` - Save new results, returns ID
- `loadResult(id)` - Load full results by ID
- `loadAllResults()` - Refresh list of saved results
- `deleteResult(id)` - Delete saved results
- `updateResult(id, updates)` - Update notes/tags

#### `useEligibilityEvaluation(options)`

Evaluates eligibility using rule packages.

```tsx
const { results, isEvaluating, error } = useEligibilityEvaluation({
  rulePackages: [snapRules, medicaidRules],
  profile: userProfile,
  includeNotQualified: true,
});
```

### Export Functions

#### `exportToPDF(results, options)`

```tsx
await exportToPDF(results, {
  userInfo: { name: 'John Doe', evaluationDate: new Date() },
  includeNotQualified: false,
});
```

#### `exportEncrypted(results, password, options)`

```tsx
const blob = await exportEncrypted(results, 'password123', {
  profileSnapshot: userProfile,
  metadata: { userName: 'John Doe', state: 'GA' },
});
```

#### `importEncrypted(file, password)`

```tsx
const imported = await importEncrypted(file, 'password123');
// Returns: { results, profileSnapshot, metadata, exportedAt }
```

#### `downloadBlob(blob, filename)`

```tsx
downloadBlob(blob, 'my-results.bfx');
```

#### `generateExportFilename(prefix)`

```tsx
const filename = generateExportFilename('benefit-results');
// Returns: "benefit-results-2024-10-12-14-30-45"
```

---

## Complete Example

### Full Results Management Implementation

```tsx
import React, { useState } from 'react';
import {
  ResultsSummary,
  ProgramCard,
  ResultsExport,
  ResultsImport,
  ResultsHistory,
  useEligibilityEvaluation,
  useResultsManagement,
} from '@/components/results';

import snapRules from '@/rules/examples/snap-federal-rules.json';
import medicaidRules from '@/rules/examples/medicaid-federal-rules.json';
import wicRules from '@/rules/examples/wic-federal-rules.json';

function ResultsManagementPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [currentResults, setCurrentResults] = useState(null);

  // User profile (from questionnaire)
  const userProfile = {
    age: 35,
    householdSize: 3,
    householdIncome: 2500,
    citizenship: 'us_citizen',
    state: 'GA',
    hasChildren: true,
  };

  // Evaluate eligibility
  const { results, isEvaluating } = useEligibilityEvaluation({
    rulePackages: [snapRules, medicaidRules, wicRules],
    profile: userProfile,
  });

  // Results management
  const { saveResults, savedResults } = useResultsManagement();

  const handleSave = async () => {
    if (!results) return;

    const id = await saveResults({
      results,
      profileSnapshot: userProfile,
      userId: 'user-123',
      userName: 'John Doe',
      state: userProfile.state,
      tags: ['screening-2024'],
      notes: 'Initial screening',
    });

    alert(`Results saved! ID: ${id}`);
  };

  const handleImport = (importedResults, metadata) => {
    setCurrentResults(importedResults);
    alert(`Imported results from ${metadata?.state || 'unknown state'}`);
  };

  if (showHistory) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => setShowHistory(false)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Current Results
        </button>
        <ResultsHistory
          onLoadResult={(id) => {
            // Load and display
          }}
          onCompareResults={(ids) => {
            // Show comparison
          }}
        />
      </div>
    );
  }

  if (isEvaluating) {
    return <div>Evaluating eligibility...</div>;
  }

  if (!results) {
    return <div>No results available</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Action Bar */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            💾 Save Results
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            📋 View History ({savedResults.length})
          </button>
        </div>

        <div className="flex gap-3">
          <ResultsExport
            results={results}
            profileSnapshot={userProfile}
            userInfo={{ name: 'John Doe', state: userProfile.state }}
          />

          <ResultsImport onImport={handleImport} />
        </div>
      </div>

      {/* Results Display */}
      <ResultsSummary results={results} />

      <div className="space-y-6 mt-6">
        {results.qualified.map((program) => (
          <ProgramCard key={program.programId} result={program} />
        ))}
      </div>
    </div>
  );
}
```

---

## Export to PDF

### Browser Print Dialog

The PDF export uses the browser's native print-to-PDF feature:

1. User clicks "Export to PDF"
2. Print styles applied automatically
3. Browser print dialog opens
4. User can:
   - Preview
   - Save as PDF
   - Change settings (margins, orientation)
   - Print to physical printer

### What's Included

**In PDF:**
- ✅ Summary statistics
- ✅ All qualified programs
- ✅ Program details and descriptions
- ✅ Required documents lists
- ✅ Next steps with URLs
- ✅ Eligibility explanations
- ✅ Privacy notice
- ✅ Timestamp and attribution

**Excluded from PDF:**
- ❌ Interactive elements (buttons, checkboxes)
- ❌ Navigation
- ❌ Not qualified programs (configurable)

### Print Optimization

Print styles include:
- Proper page breaks
- Optimized font sizes (11pt body)
- URLs displayed after links
- No shadows or unnecessary decoration
- Black text on white background
- Header and footer with metadata

---

## Encrypted Export & Import

### Export Format (.bfx)

**BenefitFinder eXport** format:
- Binary encrypted file
- Password-protected
- Contains complete results + metadata

**File structure** (before encryption):
```json
{
  "version": "1.0.0",
  "exportedAt": "2024-10-12T10:30:00Z",
  "results": { /* full results */ },
  "profileSnapshot": { /* user profile */ },
  "metadata": {
    "userName": "John Doe",
    "state": "GA",
    "notes": "Before job change"
  }
}
```

### Security

**Encryption:**
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 with 100,000 iterations
- Random salt and IV for each export
- Authenticated encryption (prevents tampering)

**Password Requirements:**
- Minimum 8 characters (enforced in UI)
- No maximum length
- Case-sensitive
- No password recovery (by design)

### Use Cases

1. **Backup** - Save results to external storage
2. **Transfer** - Move results between devices
3. **Sharing** - Share with counselor (with password separately)
4. **Archival** - Long-term secure storage

### Import Process

1. User selects .bfx file
2. Enters password
3. File decrypted locally
4. Results loaded into app
5. Can save to database or just view

**Error Handling:**
- Invalid password → Clear error message
- Corrupted file → Version/format validation
- Wrong format → Helpful error

---

## Results Comparison

### Comparing Results Over Time

```tsx
import { ResultsComparison } from '@/components/results';

const compareData = [
  {
    id: 'result-1',
    results: januaryResults,
    evaluatedAt: new Date('2024-01-15'),
    state: 'GA',
  },
  {
    id: 'result-2',
    results: julyResults,
    evaluatedAt: new Date('2024-07-20'),
    state: 'GA',
  },
];

<ResultsComparison
  savedResults={compareData}
  onClose={() => setShowComparison(false)}
/>
```

### Comparison Features

**Table View:**
- Programs in rows
- Saved results in columns
- Status badges for each program/date combination

**Summary Stats:**
- Qualified count for each result
- Changes over time
- Trend indicators (↑ ↓ →)

**Analysis:**
- Shows which programs changed status
- Identifies improvements or declines
- Contextual notes for each save

### Why Compare?

- **Track eligibility** as circumstances change
- **Verify rule updates** with same profile
- **Plan ahead** - see how income changes affect eligibility
- **Document changes** for case workers

---

## Privacy & Security

### Principles

1. **Local-Only Processing**
   - All saves, loads, and exports happen locally
   - No cloud storage or sync by default
   - User controls all data

2. **Encryption Everywhere**
   - Database: Encrypted at rest (RxDB)
   - Export files: AES-256-GCM
   - Transmission: N/A (no network calls)

3. **User Control**
   - Delete anytime
   - Export anytime
   - No automatic backups
   - No telemetry

4. **Transparency**
   - Privacy notices in exports
   - Clear what's encrypted
   - Source code is open

### Threat Model

**Protected Against:**
- ✅ Database dumps (data encrypted)
- ✅ File theft (export files encrypted)
- ✅ Network sniffing (no network calls)
- ✅ Browser history (sensitive data not in URLs)

**User Responsible For:**
- 🔑 Password security (encrypted exports)
- 💾 Device security (database encryption key in memory)
- 🗑️ Data deletion (when no longer needed)

---

## Troubleshooting

### Common Issues

**Issue:** "Failed to save results"
**Solution:** Check browser storage quota, ensure RxDB is initialized

**Issue:** "Invalid password" on import
**Solution:** Password is case-sensitive, ensure correct password

**Issue:** PDF looks different than screen
**Solution:** Expected - print styles optimize for paper

**Issue:** "File corrupted" on import
**Solution:** File may be damaged, try re-exporting from source

### Storage Limits

- **IndexedDB quota**: Varies by browser (typically 50% of available disk space)
- **Check quota**: Use browser DevTools → Application → Storage
- **Clean up**: Delete old results to free space

---

## Best Practices

### For Users

1. **Save important results** with descriptive notes
2. **Use strong passwords** for encrypted exports (12+ characters)
3. **Store passwords securely** (password manager)
4. **Regular backups** via encrypted export
5. **Delete old results** when no longer needed
6. **Tag results** for easy searching

### For Developers

1. **Always encrypt** sensitive data
2. **Validate imports** (version, format, integrity)
3. **Handle errors gracefully**
4. **Provide clear feedback** on operations
5. **Test encryption/decryption** thoroughly
6. **Document password requirements**

---

## Future Enhancements

Potential improvements:

- [ ] Cloud backup with end-to-end encryption
- [ ] Results scheduling (re-evaluate automatically)
- [ ] Email results (with encryption)
- [ ] QR code for mobile transfer
- [ ] Bulk export (multiple results)
- [ ] Results analytics dashboard
- [ ] Calendar export for deadlines

---

## Summary

The Results Management system provides:

✅ **Save** results to encrypted local database
✅ **View history** of all past screenings
✅ **Export to PDF** for printing and documentation
✅ **Encrypted file export** for secure backup/sharing
✅ **Compare results** to track changes over time
✅ **Complete privacy** - all data stays local

All features maintain strict privacy and offline-first principles!

---

## Related Documentation

- **Results Display**: `src/components/results/README.md`
- **Encryption**: `docs/ENCRYPTION.md`
- **Database**: `src/db/README.md`
- **Privacy**: `docs/SECURITY.md`

---

**Questions?** Check component source code or open a GitHub issue.

