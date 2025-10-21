# Program Card Standards

This document establishes the standardized structure and design patterns for benefit program cards and their associated "Why this result?" explanation modals in the BenefitFinder application.

## Overview

Program cards are the primary interface for displaying eligibility results to users. Each card must follow consistent design patterns while providing program-specific information and functionality.

## Card Architecture

### Component Structure

```
src/components/results/
├── ProgramCard.tsx              # Main program card component
├── WhyExplanation.tsx          # Generic explanation fallback
├── WicExplanation.tsx          # WIC-specific explanation
├── MedicaidExplanation.tsx     # Medicaid-specific explanation
├── SnapExplanation.tsx         # SNAP-specific explanation
├── TanfExplanation.tsx         # TANF-specific explanation
├── [ProgramName]Explanation.tsx # Future program explanations
├── ConfidenceScore.tsx         # Confidence indicator component
├── DocumentChecklist.tsx       # Required documents component
├── NextStepsList.tsx          # Next steps component
└── types.ts                   # Type definitions
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

## Standard Card Layout

### 1. Card Header
- **Program Name**: Clear, prominent program title
- **Status Badge**: Color-coded eligibility status with icon
- **Confidence Score**: Visual confidence indicator (if applicable)

### 2. Program Information
- **Description**: Brief program description
- **Estimated Benefit**: Benefit amount and frequency (if applicable)
- **Jurisdiction**: Federal, state, or local program indicator

### 3. Action Buttons
- **"Why this result?" Button**: Triggers explanation modal
- **"Apply Now" Button**: Directs to application (if eligible)
- **"Learn More" Button**: Additional program information

### 4. Card Footer
- **Required Documents**: List of needed documents
- **Next Steps**: Actionable next steps
- **Contact Information**: Program office details

## Status Badge Standards

### Color Coding
- **Qualified**: Green (`text-green-700 bg-green-50 border-green-200`)
- **Likely**: Blue (`text-blue-700 bg-blue-50 border-blue-200`)
- **Maybe**: Yellow (`text-yellow-700 bg-yellow-50 border-yellow-200`)
- **Unlikely**: Orange (`text-orange-700 bg-orange-50 border-orange-200`)
- **Not Qualified**: Gray (`text-gray-700 bg-gray-50 border-gray-200`)

### Icons
- **Qualified**: ✅ (checkmark)
- **Likely**: ✔️ (checkmark)
- **Maybe**: ❓ (question mark)
- **Unlikely**: ⚠️ (warning)
- **Not Qualified**: ❌ (X mark)

### Status Messages
```typescript
const statusMessages = {
  'qualified': 'You are eligible for [Program]! [Specific message].',
  'likely': 'You appear to be eligible for [Program]. [Next steps].',
  'maybe': 'You may be eligible for [Program]. [Guidance].',
  'unlikely': 'You may not currently qualify for [Program], but eligibility can change. [Guidance].',
  'not-qualified': 'You may not currently qualify for [Program]. [Guidance].'
};
```

## Explanation Modal Standards

### Modal Structure

#### 1. Header Section
```typescript
<div className="flex items-start justify-between mb-4">
  <div className="flex-1">
    <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
      Why this result?
    </Dialog.Title>
    <p className="text-gray-600">{programName}</p>
  </div>
  <Dialog.Close asChild>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
      {/* Close icon */}
    </button>
  </Dialog.Close>
</div>
```

#### 2. Status Badge
```typescript
<div className={`p-4 rounded-lg border mb-6 ${getStatusColor()}`}>
  <div className="flex items-center">
    <span className="text-3xl mr-3">{getStatusIcon()}</span>
    <div>
      <h3 className="font-semibold text-lg capitalize">{status.replace('-', ' ')}</h3>
      <p className="text-sm">{statusMessage}</p>
    </div>
  </div>
</div>
```

#### 3. Program-Specific Sections

##### Benefits Section
```typescript
<div>
  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
    <span className="text-lg mr-2">[Program Icon]</span>
    {t('results.[program-id].benefits.title')}
  </h4>
  <ul className="space-y-2">
    {benefits.map((benefit, index) => (
      <li key={index} className="flex items-start">
        <span className="text-green-600 mr-2 mt-0.5">•</span>
        <span className="text-gray-700">{benefit}</span>
      </li>
    ))}
  </ul>
</div>
```

##### Requirements Section
```typescript
<div>
  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
    <span className="text-lg mr-2">📋</span>
    {t('results.[program-id].requirements.title')}
  </h4>
  <ul className="space-y-2">
    {requirements.map((requirement, index) => (
      <li key={index} className="flex items-start">
        <span className="text-blue-600 mr-2 mt-0.5">•</span>
        <span className="text-gray-700">{requirement}</span>
      </li>
    ))}
  </ul>
</div>
```

##### Next Steps Section
```typescript
<div>
  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
    <span className="text-lg mr-2">📞</span>
    {t('results.[program-id].nextSteps.title')}
  </h4>
  <ul className="space-y-2">
    {nextSteps.map((step, index) => (
      <li key={index} className="flex items-start">
        <span className="text-blue-600 mr-2 mt-0.5">•</span>
        <span className="text-gray-700">{step}</span>
      </li>
    ))}
  </ul>
</div>
```

##### How to Apply Section
```typescript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
    <span className="text-lg mr-2">[Program Icon]</span>
    {t('results.[program-id].howToApply.title')}
  </h4>
  <ol className="space-y-2 text-sm text-blue-800">
    {howToApplySteps.map((step, index) => (
      <li key={index} className="flex items-start">
        <span className="font-semibold mr-2">{index + 1}.</span>
        <span>{step}</span>
      </li>
    ))}
  </ol>
</div>
```

##### Additional Resources Section
```typescript
<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
    <span className="text-lg mr-2">ℹ️</span>
    {t('results.[program-id].resources.title')}
  </h4>
  <ul className="space-y-1 text-sm text-gray-700">
    {resources.map((resource, index) => (
      <li key={index}>• {resource}</li>
    ))}
  </ul>
</div>
```

#### 4. Privacy Note
```typescript
<div className="border-t border-gray-200 pt-4 mt-6">
  <div className="flex items-start gap-2 text-sm text-gray-600">
    <span className="text-lg">🔒</span>
    <p>
      <strong>Privacy Note:</strong> All eligibility calculations happen locally on your device.
      No information is sent to external servers. This determination is based on official program
      rules and the information you provided.
    </p>
  </div>
</div>
```

#### 5. Close Button
```typescript
<div className="mt-6 flex justify-end">
  <Dialog.Close asChild>
    <button
      onClick={onClose}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Close
    </button>
  </Dialog.Close>
</div>
```

## Program-Specific Icons

### Standard Icons by Program Type
- **WIC**: 🍎 (apple) - Nutrition focus
- **Medicaid**: 🏥 (hospital) - Health coverage focus
- **SNAP**: 🛒 (shopping cart) - Food assistance focus
- **TANF**: 💰 (money) - Cash assistance focus
- **Housing**: 🏠 (house) - Housing assistance focus
- **Education**: 📚 (books) - Education benefits focus
- **Transportation**: 🚌 (bus) - Transportation assistance focus

## Responsive Design Standards

### Mobile First Approach
- Cards stack vertically on mobile
- Touch targets minimum 44x44px
- Readable font sizes (minimum 16px)
- Adequate spacing between elements

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Card Sizing
- **Mobile**: Full width with padding
- **Tablet**: 2 cards per row
- **Desktop**: 3 cards per row
- Maximum card width: 400px

## Accessibility Standards

### ARIA Labels
```typescript
<button
  onClick={() => setShowExplanation(true)}
  aria-label={`Learn why you ${status} for ${programName}`}
  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
>
  <span className="mr-1">❓</span>
  Why this result?
</button>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order follows logical flow
- Focus indicators visible
- Escape key closes modals

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Descriptive link text

## Color Standards

### Primary Colors
- **Blue**: `#2563eb` (Primary actions, links)
- **Green**: `#16a34a` (Success, qualified status)
- **Yellow**: `#ca8a04` (Warning, maybe status)
- **Orange**: `#ea580c` (Caution, unlikely status)
- **Gray**: `#6b7280` (Neutral, not qualified status)

### Background Colors
- **Light Blue**: `#eff6ff` (Information sections)
- **Light Gray**: `#f9fafb` (Resource sections)
- **White**: `#ffffff` (Card backgrounds)

### Text Colors
- **Primary**: `#111827` (Main text)
- **Secondary**: `#6b7280` (Supporting text)
- **Muted**: `#9ca3af` (Disabled text)

## Typography Standards

### Font Sizes
- **Card Title**: `text-xl font-bold` (20px)
- **Status Badge**: `text-lg font-semibold` (18px)
- **Section Headers**: `text-base font-semibold` (16px)
- **Body Text**: `text-sm` (14px)
- **Small Text**: `text-xs` (12px)

### Font Weights
- **Bold**: `font-bold` (700)
- **Semibold**: `font-semibold` (600)
- **Medium**: `font-medium` (500)
- **Normal**: `font-normal` (400)

## Animation Standards

### Transitions
- **Hover Effects**: `transition-colors duration-200`
- **Modal Open**: `transition-all duration-300`
- **Button Press**: `transform scale-95`

### Loading States
- Skeleton loading for cards
- Spinner for modal content
- Progressive disclosure for complex information

## Testing Standards

### Unit Tests
- Component rendering tests
- Props validation tests
- Event handler tests
- Accessibility tests

### Integration Tests
- Modal open/close functionality
- State-specific messaging
- Translation key validation
- Responsive behavior

### E2E Tests
- Complete user flow testing
- Cross-browser compatibility
- Mobile device testing
- Screen reader testing

## Implementation Checklist

### New Program Card Checklist
- [ ] Create program-specific explanation component
- [ ] Add translations for all text content
- [ ] Implement state-specific messaging (if applicable)
- [ ] Add program-specific icons and colors
- [ ] Test accessibility compliance
- [ ] Verify responsive design
- [ ] Add unit tests
- [ ] Update ProgramCard.tsx routing
- [ ] Document program-specific features

### Translation Checklist
- [ ] Status messages for all states
- [ ] Benefits descriptions
- [ ] Requirements list
- [ ] Next steps guidance
- [ ] How to apply process
- [ ] Additional resources
- [ ] State-specific variations (if applicable)

### Accessibility Checklist
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast compliance (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Semantic HTML structure

## Maintenance Guidelines

### Regular Updates
- Update program information as rules change
- Refresh contact information and websites
- Update benefit amounts and requirements
- Review and update translations

### Performance Monitoring
- Monitor card load times
- Track modal open/close performance
- Optimize image and icon loading
- Minimize bundle size impact

### User Feedback Integration
- Collect user feedback on card clarity
- Monitor explanation modal usage
- Track conversion rates to applications
- Iterate based on user behavior

## Rules Integration

### Rule Loading Process
Program cards automatically load the appropriate rules based on:
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

## Examples

### WIC Card Example
```typescript
// Program-specific benefits
const benefits = [
  'Prenatal nutrition counseling and education',
  'Monthly food package worth approximately $45',
  'Milk, cheese, eggs, cereal, juice, fruits, vegetables, whole grains, and legumes'
];

// Program-specific requirements
const requirements = [
  'Must be a U.S. citizen or qualified immigrant',
  'Must live in the state where you apply',
  'Must have nutritional risk (assessed by WIC staff)',
  'Must be pregnant, postpartum, breastfeeding, or have children under 5',
  'Must meet income guidelines (185% of federal poverty level)'
];
```

### Medicaid Card Example
```typescript
// Program-specific benefits
const benefits = [
  'Comprehensive health insurance coverage',
  'Doctor visits and specialist care',
  'Hospital stays and emergency care',
  'Prescription medications',
  'Preventive care and screenings',
  'Mental health and substance abuse treatment'
];

// State-specific variations
const stateSpecificBenefits = {
  'CA': ['Dental and vision care (included in California)'],
  'TX': ['Limited dental and vision care (varies by program)']
};
```

### SNAP Card Example
```typescript
// Program-specific benefits
const benefits = [
  'Monthly food assistance benefits',
  'Electronic Benefits Transfer (EBT) card for food purchases',
  'Can be used to buy most food items at participating stores',
  'Can be used at many farmers markets',
  'Can be used for online grocery shopping (in some areas)'
];

// State-specific EBT card names
const stateSpecificEBT = {
  'CA': 'Golden State Advantage EBT card',
  'TX': 'Lone Star Card (EBT)'
};
```

### TANF Card Example
```typescript
// Program-specific benefits
const benefits = [
  'Monthly cash assistance for families with children',
  'Work support services and job training',
  'Child care assistance for working parents',
  'Transportation assistance for work-related travel',
  'Emergency assistance for families in crisis'
];

// Program-specific requirements
const requirements = [
  'Must be a U.S. citizen or qualified immigrant',
  'Must have children under 18 (or 19 if still in high school)',
  'Must meet income and asset limits',
  'Must participate in work activities (if able-bodied)',
  'Must cooperate with child support enforcement'
];
```

This standardization ensures consistent, accessible, and user-friendly program cards across all benefit programs while maintaining the flexibility to customize content for each program's unique characteristics.
