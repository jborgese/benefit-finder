# Program Explanation Modal Structure

This document outlines the standardized structure for creating program-specific "Why this result?" explanation modals in the BenefitFinder application. This structure ensures consistency, maintainability, and user-friendly explanations across all benefit programs.

## Overview

The explanation modal system provides program-specific, user-friendly explanations for eligibility results. Each program has its own explanation component that follows a consistent structure while providing tailored content for that specific benefit program.

## Architecture

### Component Structure

```
src/components/results/
├── ProgramCard.tsx              # Main program card with explanation trigger
├── WhyExplanation.tsx           # Generic explanation fallback
├── WicExplanation.tsx          # WIC-specific explanation
├── MedicaidExplanation.tsx     # Medicaid-specific explanation
├── SnapExplanation.tsx         # SNAP-specific explanation
├── TanfExplanation.tsx         # TANF-specific explanation
└── [ProgramName]Explanation.tsx # Future program explanations
```

### Rules Directory Structure

```
src/rules/
├── core/                      # Core rule engine files
│   ├── evaluator.ts          # Rule evaluation logic
│   ├── validator.ts          # Rule validation
│   ├── schema.ts             # Rule schemas and types
│   ├── tester.ts             # Rule testing framework
│   ├── debug.ts              # Debug utilities
│   ├── performance.ts        # Performance monitoring
│   ├── explanation.ts        # Rule explanation
│   ├── eligibility.ts        # Eligibility evaluation
│   ├── detailedEvaluator.ts  # Detailed evaluation
│   ├── import-export.ts      # Import/export functionality
│   ├── versioning.ts         # Version management
│   ├── types.ts              # TypeScript type definitions
│   ├── eligibility/          # Eligibility-specific modules
│   └── examples/             # Example rule files
├── federal/                  # Federal-level rules
│   ├── snap/                 # SNAP federal rules
│   ├── medicaid/             # Medicaid federal rules
│   ├── tanf/                 # TANF federal rules
│   └── wic/                  # WIC federal rules
├── state/                    # State-specific rules
│   ├── california/           # California state rules
│   └── georgia/              # Georgia state rules
├── packages/                 # Legacy rule packages (for reference)
├── __tests__/                # Test files
├── index.ts                  # Main exports
└── README.md                 # Main documentation
```

### Translation Structure

```json
{
  "results": {
    "[program-id]": {
      "statusMessages": { /* Status-specific messages */ },
      "benefits": { /* What the program provides */ },
      "requirements": { /* Eligibility requirements */ },
      "nextSteps": { /* Action items */ },
      "additionalSteps": { /* Context-specific additional steps */ },
      "howToApply": { /* Application process */ },
      "resources": { /* Additional resources */ },
      "stateSpecific": { /* State-specific variations */ }
    }
  }
}
```

### State-Specific Messaging

Many benefit programs have significant variations by state, particularly:
- **Medicaid**: Income limits, covered services, application processes vary by state
- **SNAP**: Some states have different asset limits, work requirements, or additional programs
- **WIC**: State-specific clinic locations, additional services, or program variations
- **TANF**: Completely state-administered with varying eligibility and benefits

#### State-Specific Translation Structure

```json
{
  "results": {
    "[program-id]": {
      "stateSpecific": {
        "CA": {
          "statusMessages": { /* California-specific messages */ },
          "benefits": { /* California-specific benefits */ },
          "requirements": { /* California-specific requirements */ },
          "nextSteps": { /* California-specific steps */ },
          "resources": { /* California-specific resources */ }
        },
        "TX": {
          "statusMessages": { /* Texas-specific messages */ },
          "benefits": { /* Texas-specific benefits */ },
          "requirements": { /* Texas-specific requirements */ },
          "nextSteps": { /* Texas-specific steps */ },
          "resources": { /* Texas-specific resources */ }
        }
      }
    }
  }
}
```

#### Implementation Pattern

Use the provided utility functions from `src/utils/stateSpecificMessaging.ts`:

```typescript
import {
  getStateSpecificMessage,
  getStateSpecificBenefit,
  getStateSpecificRequirement,
  getStateSpecificNextStep,
  getStateSpecificResource,
  hasStateSpecificMessaging
} from '../../utils/stateSpecificMessaging';

// Get state-specific status message
const statusMessage = getStateSpecificMessage(
  'medicaid-federal',
  userProfile?.state || 'CA',
  'statusMessages.qualified',
  t
);

// Get state-specific benefit
const benefit = getStateSpecificBenefit(
  'snap-federal',
  userProfile?.state || 'TX',
  'monthlyBenefits',
  t
);

// Check if state-specific messaging exists
if (hasStateSpecificMessaging('medicaid-federal', userProfile?.state || 'CA', t)) {
  // Use state-specific messaging
}
```

## Standard Modal Sections

### 1. Header Section
- **Title**: "Why this result?"
- **Program Name**: Display the specific program name
- **Close Button**: Accessible close functionality

### 2. Status Badge
- **Visual Status Indicator**: Icon and color-coded status
- **Status Message**: Program-specific status explanation
- **Context-Aware Messaging**: Tailored based on user profile

### 3. Program Benefits Section
- **Title**: "What [Program] provides:"
- **Icon**: Program-specific icon (🍎 for WIC, 🏥 for Medicaid, 🛒 for SNAP)
- **Benefits List**: Comprehensive list of program benefits
- **Context-Specific Benefits**: Additional benefits based on user profile

### 4. Requirements Section
- **Title**: "[Program] requirements:"
- **Icon**: 📋 (standard requirements icon)
- **Requirements List**: All eligibility requirements
- **Context-Specific Requirements**: Requirements based on user profile

### 5. Next Steps Section
- **Title**: "Next steps:"
- **Icon**: 📞 (standard next steps icon)
- **Action Items**: Specific steps based on eligibility status
- **Context-Specific Steps**: Additional steps based on user profile

### 6. How to Apply Section
- **Title**: "How to apply for [Program]:"
- **Icon**: Program-specific icon
- **Background**: Blue-tinted background for emphasis
- **Step-by-Step Process**: Numbered list of application steps

### 7. Additional Resources Section
- **Title**: "Additional resources:"
- **Icon**: ℹ️ (information icon)
- **Background**: Gray-tinted background
- **Resource Links**: Official websites, hotlines, and helpful information

### 8. Privacy Note
- **Icon**: 🔒 (privacy icon)
- **Message**: Standard privacy notice about local processing

### 9. Close Button
- **Styling**: Blue button with hover effects
- **Accessibility**: Proper ARIA labels

## Implementation Guidelines

### 1. Component Creation

Create a new explanation component following this pattern:

```typescript
// src/components/results/[ProgramName]Explanation.tsx
import React from 'react';
import { EligibilityStatus, EligibilityExplanation } from './types';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '../../i18n/hooks';

interface [ProgramName]ExplanationProps {
  programName: string;
  status: EligibilityStatus;
  explanation: EligibilityExplanation;
  userProfile?: {
    // Add relevant user profile fields
    [key: string]: unknown;
  };
  onClose: () => void;
}

export const [ProgramName]Explanation: React.FC<[ProgramName]ExplanationProps> = ({
  programName,
  status,
  explanation,
  userProfile,
  onClose,
}) => {
  const { t } = useI18n();

  // Implementation follows standard structure
  // ... component implementation
};
```

### 2. Translation Keys

Add translations following this structure:

```json
{
  "results": {
    "[program-id]": {
      "statusMessages": {
        "qualified": "You are eligible for [Program]! [Specific message].",
        "likely": "You appear to be eligible for [Program]. [Next steps].",
        "maybe": "You may be eligible for [Program]. [Guidance].",
        "unlikely": "You may not currently qualify for [Program], but eligibility can change. [Guidance].",
        "notQualified": "You may not currently qualify for [Program]. [Guidance]."
      },
      "benefits": {
        "title": "What [Program] provides:",
        "benefit1": "Specific benefit description",
        "benefit2": "Another benefit description",
        // Add program-specific benefits
      },
      "requirements": {
        "title": "[Program] requirements:",
        "requirement1": "Specific requirement description",
        "requirement2": "Another requirement description",
        // Add program-specific requirements
      },
      "nextSteps": {
        "title": "Next steps:",
        "step1": "First action item",
        "step2": "Second action item",
        // Add program-specific steps
      },
      "additionalSteps": {
        "contextSpecific1": "Additional step for specific context",
        "contextSpecific2": "Another context-specific step",
        // Add context-specific additional steps
      },
      "howToApply": {
        "title": "How to apply for [Program]:",
        "step1": "First application step",
        "step2": "Second application step",
        // Add step-by-step application process
      },
      "resources": {
        "title": "Additional resources:",
        "website": "[Program] website: [URL]",
        "hotline": "[Program] hotline: [Phone]",
        "info1": "Additional helpful information",
        "info2": "More helpful information"
      }
    }
  }
}
```

### 3. State-Specific Implementation

For programs with state variations, implement state-specific messaging:

```typescript
// Helper function for state-specific translations
function getStateSpecificMessage(
  programId: string,
  state: string,
  messageKey: string,
  t: (key: string) => string
): string {
  const stateKey = `results.${programId}.stateSpecific.${state}.${messageKey}`;
  const fallbackKey = `results.${programId}.${messageKey}`;

  // Try state-specific first, fallback to general
  return t(stateKey) !== stateKey ? t(stateKey) : t(fallbackKey);
}

// Usage in component
const statusMessage = getStateSpecificMessage(
  'medicaid-federal',
  userProfile?.state || 'CA',
  'statusMessages.qualified',
  t
);
```

### 4. ProgramCard Integration

Update `ProgramCard.tsx` to include the new explanation component:

```typescript
// Add import
import { [ProgramName]Explanation } from './[ProgramName]Explanation';

// Update dialog content
{result.programId === '[program-id]' ? (
  <[ProgramName]Explanation
    programName={result.programName}
    status={result.status}
    explanation={result.explanation}
    userProfile={userProfile}
    onClose={() => setShowExplanation(false)}
  />
) : result.programId === 'wic-federal' ? (
  // ... existing conditions
) : (
  <WhyExplanation
    // ... fallback explanation
  />
)}
```

## Rules Integration

### Rule Loading Process
Explanation modals automatically load the appropriate rules based on:
- **Program ID**: Determines which federal rules to load
- **User State**: Determines which state-specific rules to load
- **Rule Priority**: State rules override federal rules when conflicts exist

### Rule File Naming Conventions
- **Federal rules**: `{program}-federal-rules.json`
- **State rules**: `{program}-{state}-rules.json`
- **Legacy/example rules**: `{program}-rules.json`

### Examples
- `snap-federal-rules.json` - Federal SNAP rules
- `snap-california-rules.json` - California SNAP rules
- `medicaid-georgia-rules.json` - Georgia Medicaid rules
- `tanf-federal-rules.json` - Federal TANF rules

### Import Paths
```typescript
// Import from core engine
import { evaluateRule, validateRule } from '@/rules';
// or directly from core
import { evaluateRule } from '@/rules/core/evaluator';

// Import specific rule files
import snapFederalRules from '@/rules/federal/snap/snap-federal-rules.json';
import snapCaliforniaRules from '@/rules/state/california/snap/snap-california-rules.json';
```

## Design Principles

### 1. Consistency
- All explanation modals follow the same visual structure
- Consistent iconography and color schemes
- Standardized section ordering

### 2. Accessibility
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes

### 3. User Experience
- Clear, jargon-free language
- Context-aware messaging
- Actionable next steps
- Comprehensive resource information
- State-specific guidance where applicable

### 4. Maintainability
- Modular component structure
- Centralized translations
- Reusable helper functions
- Type-safe implementations

## Status-Specific Messaging

### Qualified Status
- Positive, encouraging tone
- Clear next steps for application
- Emphasis on benefits received

### Likely Status
- Cautiously optimistic tone
- Emphasis on verification needed
- Clear application guidance

### Maybe Status
- Neutral, informative tone
- Emphasis on discussion with program office
- Alternative options mentioned

### Unlikely Status
- Respectful, informative tone
- Emphasis on eligibility changes
- Alternative programs suggested

### Not Qualified Status
- Respectful, supportive tone
- Clear explanation of current status
- Alternative options and reapplication guidance

## Context-Aware Features

### User Profile Integration
- **Pregnant Women**: Additional prenatal-specific guidance
- **Families with Children**: Child-specific benefits and requirements
- **Seniors**: Age-appropriate alternatives and considerations
- **Disabilities**: Disability-specific programs and accommodations

### Program-Specific Customization
- **WIC**: Nutrition focus, pregnancy/child-specific benefits
- **Medicaid**: Health coverage focus, medical services emphasis
- **SNAP**: Food assistance focus, EBT card information

## Testing Considerations

### 1. Component Testing
- Test all status scenarios
- Verify context-aware messaging
- Check accessibility compliance

### 2. Translation Testing
- Verify all translation keys are used
- Test with different languages
- Check for missing translations

### 3. Integration Testing
- Test with different user profiles
- Verify program-specific routing
- Check fallback to generic explanation

## Future Enhancements

### 1. Dynamic Content
- Real-time eligibility updates
- Personalized benefit calculations
- Interactive application guidance

### 2. Multimedia Integration
- Video explanations
- Interactive tutorials
- Visual application guides

### 3. Advanced Personalization
- Machine learning-based recommendations
- Predictive eligibility modeling
- Customized application timelines

## Maintenance

### 1. Regular Updates
- Update program information as rules change
- Refresh contact information and websites
- Update benefit amounts and requirements

### 2. Translation Maintenance
- Add new languages as needed
- Update existing translations
- Verify translation accuracy

### 3. Component Maintenance
- Update dependencies regularly
- Refactor for performance improvements
- Add new accessibility features

## Examples

### WIC Explanation
- **Focus**: Nutrition assistance for pregnant women, new mothers, and children
- **Benefits**: Food packages, nutrition counseling, breastfeeding support
- **Requirements**: Pregnancy/child status, income limits, nutritional risk
- **Application**: Local WIC office, nutritional assessment, food package pickup

### Medicaid Explanation
- **Focus**: Health insurance coverage for low-income individuals
- **Benefits**: Doctor visits, hospital care, prescriptions, preventive care
- **Requirements**: Income limits, citizenship, state residence
- **Application**: State Medicaid office, online application, health plan selection
- **State Variations**: Income limits vary by state (e.g., CA: 138% FPL, TX: 16% FPL), covered services differ, application processes vary

### SNAP Explanation
- **Focus**: Food assistance for low-income individuals and families
- **Benefits**: Monthly food benefits, EBT card, nutrition education
- **Requirements**: Income limits, work requirements, asset limits
- **Application**: Local SNAP office, interview process, EBT card issuance
- **State Variations**: Some states have different asset limits, work requirements, or additional programs (e.g., CalFresh in CA)

### TANF Explanation
- **Focus**: Temporary cash assistance for families with children
- **Benefits**: Monthly cash benefits, work support services, child care assistance
- **Requirements**: Income limits, work participation, child support cooperation
- **Application**: State TANF office, work plan development, benefit calculation
- **State Variations**: Completely state-administered with varying eligibility, benefits, and work requirements

This structure ensures that all benefit programs provide consistent, informative, and user-friendly explanations while maintaining the flexibility to customize content for each program's unique characteristics.
