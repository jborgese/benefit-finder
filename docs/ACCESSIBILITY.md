# BenefitFinder Accessibility Guide

**WCAG Compliance:** 2.1 Level AA
**Last Updated:** October 12, 2025

## Overview

BenefitFinder is built with accessibility as a core principle. All features are designed to be usable by everyone, including users with disabilities.

---

## WCAG 2.1 AA Compliance

### ✅ Level A Requirements

**1.1 Text Alternatives**
- ✅ All form inputs have associated labels
- ✅ Images have alt text
- ✅ Icons have aria-labels

**1.2 Time-based Media**
- ✅ N/A - No audio/video content

**1.3 Adaptable**
- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Meaningful sequence
- ✅ Form labels and instructions

**1.4 Distinguishable**
- ✅ Color is not the only visual means
- ✅ Audio control (N/A)
- ✅ Contrast ratio minimum 4.5:1 for text
- ✅ Text can be resized to 200%
- ✅ Images of text (avoided)

**2.1 Keyboard Accessible**
- ✅ All functionality via keyboard
- ✅ No keyboard traps
- ✅ Keyboard shortcuts documented

**2.2 Enough Time**
- ✅ Auto-save prevents data loss
- ✅ No time limits
- ✅ Save & Resume functionality

**2.3 Seizures and Physical Reactions**
- ✅ No flashing content

**2.4 Navigable**
- ✅ Skip links provided
- ✅ Page titles
- ✅ Focus order matches visual order
- ✅ Link purpose clear
- ✅ Multiple ways to navigate
- ✅ Headings and labels descriptive
- ✅ Focus visible

**2.5 Input Modalities**
- ✅ Touch targets minimum 44x44px
- ✅ Pointer gestures have alternatives
- ✅ Label in name

**3.1 Readable**
- ✅ Language specified (en-US)
- ✅ Plain language used

**3.2 Predictable**
- ✅ On focus behavior predictable
- ✅ On input behavior predictable
- ✅ Consistent navigation
- ✅ Consistent identification

**3.3 Input Assistance**
- ✅ Error identification
- ✅ Labels and instructions
- ✅ Error suggestions
- ✅ Error prevention (confirmation dialogs)

**4.1 Compatible**
- ✅ Valid HTML
- ✅ Name, role, value for all components
- ✅ Status messages

---

## Keyboard Navigation

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next focusable element |
| `Shift + Tab` | Move to previous focusable element |
| `Enter` | Activate button/link |
| `Space` | Toggle checkbox/radio |
| `Escape` | Close dialog/modal |

### Questionnaire Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + →` | Next question |
| `Alt + ←` | Previous question |
| `Ctrl + S` | Save progress |
| `Ctrl + /` | Show keyboard shortcuts |
| `Ctrl + Shift + N` | Skip question (if allowed) |

### Form Controls

| Control | Keys | Action |
|---------|------|--------|
| **Radio Buttons** | `↑/↓` or `←/→` | Navigate options |
| **Radio Buttons** | `Space` | Select option |
| **Checkboxes** | `Space` | Toggle selection |
| **Select Dropdown** | `↑/↓` | Navigate options |
| **Select Dropdown** | `Enter` | Open dropdown |
| **Number Input** | `↑/↓` | Increment/decrement |
| **Date Picker** | `Enter` | Open calendar |

---

## Screen Reader Support

### Supported Screen Readers

- **NVDA** (Windows) - Latest version
- **JAWS** (Windows) - Version 2020+
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in
- **Narrator** (Windows) - Built-in

### Screen Reader Announcements

**Navigation:**
- "Moving to question 5 of 10"
- "Going back to question 3"
- "Questionnaire complete. Thank you!"

**Validation:**
- "Error in income: Please enter a valid amount"
- "3 errors found. [list of errors]"

**Progress:**
- "25% complete"
- "Progress saved successfully"

**Actions:**
- "Answer saved"
- "Question skipped"
- "Loading next question"

### Testing with Screen Readers

**NVDA (Windows):**
```
1. Install NVDA from nvaccess.org
2. Press Ctrl + Alt + N to start
3. Navigate with Tab and arrow keys
4. Forms mode: Enter/Escape
```

**VoiceOver (Mac):**
```
1. System Preferences > Accessibility > VoiceOver
2. Enable with Cmd + F5
3. Navigate with VO keys (Ctrl + Option)
4. Forms: VO + Shift + ↓
```

**VoiceOver (iOS):**
```
1. Settings > Accessibility > VoiceOver
2. Enable VoiceOver
3. Swipe right/left to navigate
4. Double-tap to activate
```

---

## Focus Management

### Focus Indicators

All interactive elements have visible focus indicators:

```css
/* Focus ring - 2px blue outline */
.element:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Focus ring with Tailwind */
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
```

### Focus Order

Focus follows a logical order:
1. Skip links
2. Header/navigation
3. Main content
4. Question fields
5. Navigation buttons
6. Footer

### Focus Trap

Modals and dialogs trap focus:
- Tab cycles through modal content
- Escape closes modal
- Focus returns to trigger element

---

## Color & Contrast

### Color Contrast Ratios

**Text:**
- Normal text: 4.5:1 (minimum)
- Large text (18pt+): 3:1 (minimum)
- **Our standard:** 4.5:1 for all text

**UI Components:**
- Interactive elements: 3:1 (minimum)
- **Our standard:** 4.5:1

### Color Usage

**Never rely on color alone:**
- ✅ Errors shown with icon + text + color
- ✅ Required fields marked with asterisk + color
- ✅ Links underlined, not just colored

**Example:**
```tsx
{/* ✅ Good - Multiple indicators */}
<label>
  Name
  <span className="text-red-500" aria-label="required">*</span>
</label>
{error && (
  <div role="alert" className="text-red-600">
    <AlertIcon />
    <span>{error}</span>
  </div>
)}

{/* ❌ Bad - Color only */}
<label className="required">Name</label>
<div className="error">{error}</div>
```

---

## Touch Targets

All interactive elements meet minimum touch target size:

**Minimum Size:** 44x44 pixels

**Our Implementation:**
```tsx
/* Buttons */
px-4 py-2 // At least 44px height

/* Checkboxes/Radio */
h-4 w-4 with p-3 container // Total 44x44px

/* Links */
Sufficient padding around text
```

---

## Landmarks & Regions

### Main Regions

```html
<header role="banner">
  <!-- Site header -->
</header>

<nav role="navigation" aria-label="Primary">
  <!-- Main navigation -->
</nav>

<main role="main">
  <!-- Main content -->
</main>

<aside role="complementary" aria-label="Help">
  <!-- Help/sidebar -->
</aside>

<footer role="contentinfo">
  <!-- Site footer -->
</footer>
```

### Questionnaire Regions

```html
<div role="region" aria-label="Questionnaire progress">
  <!-- Progress bar -->
</div>

<div role="main" id="question-content">
  <!-- Current question -->
</div>

<nav role="navigation" aria-label="Question navigation">
  <!-- Back/Next buttons -->
</nav>

<div role="status" aria-live="polite">
  <!-- Status announcements -->
</div>

<div role="alert" aria-live="assertive">
  <!-- Error announcements -->
</div>
```

---

## Error Handling

### Error Identification

Errors are clearly identified:

```tsx
<input
  aria-invalid={hasError}
  aria-describedby="error-1"
/>

<div id="error-1" role="alert">
  <AlertIcon />
  <span>Please enter a valid email address</span>
</div>
```

### Error Prevention

- Validation on blur (not on every keystroke)
- Clear error messages
- Suggested corrections
- Confirmation before destructive actions

### Error Recovery

- Errors clearly explained
- Specific suggestions provided
- Fields retain user input
- Auto-focus on first error

---

## Form Labels

### Required Fields

```tsx
<label htmlFor="email">
  Email Address
  <span className="text-red-500" aria-label="required">*</span>
</label>

{/* Or */}
<label htmlFor="email">
  Email Address
  <abbr title="required" aria-label="required">*</abbr>
</label>
```

### Help Text

```tsx
<label id="label-1">Income</label>
<p id="help-1" className="text-sm text-gray-600">
  Enter your total monthly household income
</p>
<input
  aria-labelledby="label-1"
  aria-describedby="help-1"
/>
```

### Fieldsets for Groups

```tsx
<fieldset>
  <legend>Do you have children?</legend>

  <label>
    <input type="radio" name="children" value="yes" />
    Yes
  </label>

  <label>
    <input type="radio" name="children" value="no" />
    No
  </label>
</fieldset>
```

---

## Testing Checklist

### Pre-Launch Checklist

#### Automated Tests
- [x] Run axe-core accessibility tests
- [x] Validate HTML
- [x] Check ARIA usage
- [x] Verify color contrast

#### Keyboard Testing
- [x] Tab through entire questionnaire
- [x] Use only keyboard to complete flow
- [x] Test all keyboard shortcuts
- [x] Verify focus indicators visible
- [x] Check for keyboard traps
- [x] Test with forms mode (screen readers)

#### Screen Reader Testing
- [x] Test with NVDA (Windows)
- [x] Test with JAWS (Windows)
- [x] Test with VoiceOver (Mac)
- [x] Test with VoiceOver (iOS)
- [x] Test with TalkBack (Android)
- [x] Verify all content announced
- [x] Check form field labels
- [x] Test error announcements
- [x] Verify progress updates

#### Visual Testing
- [x] Test at 200% zoom
- [x] Test at 400% zoom
- [x] Check contrast in all states
- [x] Verify focus indicators
- [x] Test in high contrast mode
- [x] Test with dark mode

#### Motor Impairments
- [x] Touch targets 44x44px minimum
- [x] Sufficient spacing between elements
- [x] No drag/drop required
- [x] No time limits
- [x] Large click areas

#### Cognitive Load
- [x] Clear, simple language
- [x] Progress indicators
- [x] Save & Resume available
- [x] Consistent layout
- [x] Help text available

---

## Known Limitations

1. **Date Picker** - Native browser date picker varies by browser
   - **Mitigation:** Clear instructions provided

2. **Auto-Save Warning** - May not work in private browsing
   - **Mitigation:** Warning shown to user

3. **localStorage** - Screen reader may not announce storage quota
   - **Mitigation:** Manual save button available

---

## Continuous Monitoring

### Tools

- **axe DevTools** - Browser extension
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Chrome DevTools
- **pa11y** - Automated testing

### Regular Testing

- Test with each major release
- Test new features with screen readers
- Validate HTML/ARIA
- Monitor user feedback

---

## User Feedback

We welcome accessibility feedback:

- **Report issues:** GitHub Issues
- **Request accommodations:** Contact form
- **Suggest improvements:** Pull requests

---

## Resources

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Section 508](https://www.section508.gov/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [pa11y](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Testing
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

**Commitment:** We are committed to maintaining WCAG 2.1 AA compliance and continuously improving accessibility based on user feedback and best practices.

