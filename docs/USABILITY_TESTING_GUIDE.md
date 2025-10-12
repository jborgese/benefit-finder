# Usability Testing Guide

**Version:** 1.0
**Last Updated:** October 12, 2025

Guide for conducting usability testing of BenefitFinder with target users.

---

## Table of Contents

1. [Overview](#overview)
2. [Target Users](#target-users)
3. [Test Scenarios](#test-scenarios)
4. [Testing Protocol](#testing-protocol)
5. [Metrics to Collect](#metrics-to-collect)
6. [Accessibility Testing](#accessibility-testing)
7. [Field Testing](#field-testing)
8. [Feedback Collection](#feedback-collection)

---

## Overview

### Testing Goals

1. **Validate core workflow** - Can users complete eligibility screening?
2. **Test comprehension** - Do users understand their results?
3. **Verify accessibility** - Can all users access features?
4. **Assess trust** - Do users trust the results?
5. **Identify pain points** - What frustrates or confuses users?

### Testing Principles

- ✅ **Test with real target users** (not developers!)
- ✅ **Observe, don't lead** - Let users struggle to find issues
- ✅ **Test in realistic environments** - Community centers, libraries, homes
- ✅ **Include diverse users** - Different ages, languages, abilities
- ✅ **Respect privacy** - Use test data, not real personal information

---

## Target Users

### Primary User Groups

1. **Benefit Recipients** (Ages 18-65)
   - Low-income individuals seeking assistance
   - May have limited tech literacy
   - May have limited English proficiency
   - May use assistive technologies

2. **Parents/Caregivers**
   - Seeking benefits for children
   - Often multi-tasking
   - Need quick, clear information

3. **Field Workers**
   - Community organizers
   - Social workers
   - Benefits counselors
   - NGO staff

4. **Seniors** (Ages 65+)
   - May be less tech-savvy
   - May use screen readers or magnification
   - Need clear, simple language

### Recruitment

**Where to find testers:**
- Community centers
- Food banks
- Public libraries
- Senior centers
- Immigrant resource centers
- Disability advocacy groups

**Compensation:**
- $25-50 per session
- Or donation to organization
- Provide food/refreshments

---

## Test Scenarios

### Scenario 1: First-Time User (30 minutes)

**Setup:**
- User has never seen BenefitFinder
- Has basic smartphone or computer skills
- Looking to check SNAP eligibility

**Tasks:**
1. Open app and start screening
2. Answer questionnaire
3. View results
4. Understand if qualified for SNAP
5. Find list of required documents
6. Identify next steps to apply

**Success Criteria:**
- ✅ Completes questionnaire in < 15 minutes
- ✅ Correctly identifies eligibility status
- ✅ Finds document checklist
- ✅ Understands next steps

**Questions to Ask:**
- "Did you understand the questions?"
- "Are you confident in your results?"
- "What would you do next?"
- "Was anything confusing?"

---

### Scenario 2: Returning User (15 minutes)

**Setup:**
- User completed screening last month
- Income has changed, wants to re-check
- Has moderate tech skills

**Tasks:**
1. Start new screening
2. Answer questions with updated income
3. Compare new results to old results
4. Identify which programs changed
5. Save new results

**Success Criteria:**
- ✅ Completes questionnaire quickly
- ✅ Compares results successfully
- ✅ Understands changes in eligibility

**Questions to Ask:**
- "Can you tell which programs changed?"
- "Do you understand why your eligibility changed?"
- "Would you use the comparison feature again?"

---

### Scenario 3: Field Worker (45 minutes)

**Setup:**
- Social worker helping 3 clients in one session
- Needs to screen multiple people quickly
- Wants to print results for clients

**Tasks:**
1. Screen first client, save results
2. Screen second client, save results
3. Screen third client, save results
4. Print results for client #2
5. Export encrypted file for records

**Success Criteria:**
- ✅ Can manage multiple client sessions
- ✅ Successfully saves each screening
- ✅ Prints results correctly
- ✅ Can find saved results later

**Questions to Ask:**
- "Is this faster than paper forms?"
- "Would you use this in the field?"
- "What features are missing?"

---

### Scenario 4: Low-Tech Senior (45 minutes)

**Setup:**
- User is 70+ years old
- Limited computer experience
- May use reading glasses
- Checking Medicare/Medicaid eligibility

**Tasks:**
1. Open app (with assistance if needed)
2. Complete questionnaire at own pace
3. View results
4. Print results to take to doctor

**Success Criteria:**
- ✅ Can read text clearly (size, contrast)
- ✅ Understands questions
- ✅ Completes without frustration
- ✅ Gets printable results

**Questions to Ask:**
- "Can you read everything clearly?"
- "Were the questions easy to understand?"
- "Would you feel comfortable using this alone?"

---

### Scenario 5: Mobile-Only User (20 minutes)

**Setup:**
- User only has smartphone (no computer)
- Uses phone for all online tasks
- Limited data plan

**Tasks:**
1. Complete screening on phone
2. View results on small screen
3. Save results to phone
4. Access results later

**Success Criteria:**
- ✅ Can tap all buttons easily (44x44px targets)
- ✅ Can read text on small screen
- ✅ Scrolling works smoothly
- ✅ Forms are usable on mobile

**Questions to Ask:**
- "Were buttons easy to tap?"
- "Could you read everything?"
- "Would you do this on your phone or prefer computer?"

---

### Scenario 6: Immigrant/LEP User (30 minutes)

**Setup:**
- Limited English Proficiency
- Checking eligibility for WIC or SNAP
- May have family member translating

**Tasks:**
1. Complete questionnaire (with or without assistance)
2. View results
3. Understand required documents
4. Identify application location

**Success Criteria:**
- ✅ Can navigate with limited English
- ✅ Plain language is understandable
- ✅ Icons/visuals help comprehension

**Questions to Ask:**
- "What words were confusing?"
- "Would this be clearer in [your language]?"
- "What would make this easier to understand?"

**Note:** This validates need for Phase 2.1 (Multi-language support)

---

## Testing Protocol

### Pre-Test (5 minutes)

1. **Welcome and consent**
   - Explain purpose of testing
   - Get verbal/written consent
   - Explain confidentiality
   - Permission to observe/record

2. **Background questions**
   - Age range
   - Tech comfort level (1-5 scale)
   - What benefits are they interested in?
   - Previous experience with benefit applications

3. **Setup**
   - Provide device (or use theirs)
   - Open app to starting point
   - Have test data ready (if using real device)

### During Test (20-40 minutes)

1. **Observe quietly**
   - Let user work without interruption
   - Take notes on:
     - Where they pause or hesitate
     - What they click (expected vs actual)
     - Facial expressions (confusion, frustration)
     - Time spent on each section

2. **Ask "think aloud"**
   - "Can you tell me what you're thinking?"
   - "What are you looking for?"
   - "What do you expect to happen when you click that?"

3. **Do NOT:**
   - Lead them to answers
   - Explain how things work (unless they're completely stuck)
   - Defend design choices
   - Make excuses for problems

### Post-Test (10 minutes)

1. **Debrief questions**
   - "Overall, how was that experience?" (1-5 scale)
   - "What was most confusing?"
   - "What worked well?"
   - "Would you use this to check your benefits?"
   - "Would you recommend this to others?"

2. **Specific feature questions**
   - "Did you understand your eligibility results?"
   - "Did the 'Why?' explanation help?"
   - "Was the document checklist useful?"

3. **Open feedback**
   - "What would you change?"
   - "What's missing?"
   - "Any other thoughts?"

4. **Thank and compensate**

---

## Metrics to Collect

### Quantitative Metrics

1. **Completion Rate**
   - % who complete questionnaire
   - % who reach results page
   - % who understand results

2. **Time on Task**
   - Time to complete questionnaire
   - Time to find specific information
   - Time to print/save results

3. **Error Rate**
   - Number of input errors
   - Number of times user gets "lost"
   - Number of times user clicks wrong button

4. **Satisfaction Score**
   - Overall satisfaction (1-5)
   - Likelihood to use again (1-5)
   - Likelihood to recommend (1-5)

### Qualitative Metrics

1. **Comprehension**
   - Do users understand eligibility status?
   - Do users know what to do next?
   - Do users trust the results?

2. **Pain Points**
   - What causes confusion?
   - What causes frustration?
   - Where do users get stuck?

3. **Positive Feedback**
   - What do users like?
   - What exceeds expectations?
   - What builds trust?

4. **Feature Requests**
   - What's missing?
   - What would make it better?
   - What features would they use?

---

## Accessibility Testing

### With Screen Reader Users

**Testers:** Blind or low-vision users with NVDA, JAWS, or VoiceOver

**Test Scenarios:**
1. Navigate entire questionnaire with keyboard only
2. Understand eligibility results from screen reader
3. Access document checklist
4. Operate checkboxes and buttons

**Success Criteria:**
- ✅ All content is announced clearly
- ✅ Form controls have proper labels
- ✅ Status changes are announced
- ✅ No "unlabeled" or "clickable" announcements

### With Motor Disability Users

**Testers:** Users with limited dexterity, using keyboard, switch access, or voice control

**Test Scenarios:**
1. Navigate with keyboard only (no mouse)
2. Activate all interactive elements
3. Complete forms without precision mouse control

**Success Criteria:**
- ✅ All features accessible via keyboard
- ✅ Large enough click/tap targets (44x44px)
- ✅ Focus indicators clearly visible

### With Cognitive Disabilities

**Testers:** Users with learning disabilities, ADHD, or cognitive challenges

**Test Scenarios:**
1. Understand questions (plain language)
2. Complete multi-step process
3. Understand results and next steps

**Success Criteria:**
- ✅ Questions are clear and simple
- ✅ Progress is visible
- ✅ Instructions are step-by-step
- ✅ No overwhelming amount of information at once

---

## Field Testing

### In-Person Testing at Community Centers

**Setup:**
- Laptop/tablet with app loaded
- Privacy screen if using real data
- Consent forms
- Compensation ready

**Process:**
1. Brief introduction (2 min)
2. User completes screening (20 min)
3. Observer takes notes
4. Quick debrief (5 min)
5. Compensate and thank

**Target:** 10-15 users per location

### Remote Testing

**Setup:**
- Video call (Zoom, etc.)
- Screen sharing
- Recording with consent

**Process:**
1. Send app link before call
2. User shares screen
3. Complete scenario
4. Discuss feedback

**Target:** 5-10 users

---

## Feedback Collection

### During Session

**Observer Note Template:**
```markdown
## Session #[X] - [Date]
**User Profile:** [Age range] / [Tech comfort: 1-5] / [Benefits sought]

### Observations:
- 00:00 - Started questionnaire
- 02:15 - Paused at income question, looked confused
- 05:30 - Clicked back button
- 10:00 - Reached results page
- 12:00 - Clicked "Why?" explanation
- 15:00 - Found document checklist

### Issues:
1. Confused about gross vs net income
2. Didn't notice "Save" button
3. Wanted to print but couldn't find button initially

### Positive Feedback:
1. "This is so much easier than paper forms!"
2. "I like that it shows exactly what documents I need"

### Quotes:
- "Wait, I qualify for WIC? I didn't know that!"
- "Can I save this to show my caseworker?"

### Recommendations:
- Clarify income question wording
- Make save/print buttons more prominent
```

### Post-Session Survey

**Online form (Google Forms, etc.):**

1. **Demographics**
   - Age range: [ ] 18-30, [ ] 31-50, [ ] 51-65, [ ] 65+
   - Tech comfort: ⭐⭐⭐⭐⭐ (1-5 stars)
   - Primary device: [ ] Phone, [ ] Tablet, [ ] Computer
   - Benefits interested in: [ ] SNAP, [ ] Medicaid, [ ] WIC, [ ] Other

2. **Ease of Use** (1-5 scale, 5 = easiest)
   - How easy was it to complete the screening?
   - How easy was it to understand your results?
   - How easy was it to find what to do next?

3. **Comprehension**
   - Did you understand if you qualify for benefits? [ ] Yes / [ ] No / [ ] Unsure
   - Did you understand why you got that result? [ ] Yes / [ ] No / [ ] Unsure
   - Do you know what documents you need? [ ] Yes / [ ] No / [ ] Unsure

4. **Trust & Confidence**
   - How confident are you in the results? (1-5)
   - Would you use these results to actually apply? [ ] Yes / [ ] No / [ ] Maybe
   - How concerned are you about privacy? (1-5)

5. **Open Feedback**
   - What did you like most?
   - What was most confusing?
   - What would you change?
   - Would you recommend this to others?

---

## Test Scenarios (Detailed)

### **Test Scenario A: SNAP Eligibility - Qualified**

**User Profile:**
- Single adult, age 28
- Monthly income: $1,200
- No children
- U.S. citizen

**Expected Result:**
- Qualifies for SNAP
- High confidence (95%+)
- Documents: pay stubs, ID, proof of address
- Next steps: Apply at state website

**Test Checklist:**
- [ ] User completes questionnaire
- [ ] User sees "You Qualify" status
- [ ] User finds confidence score
- [ ] User clicks "Why?" and understands explanation
- [ ] User finds document checklist
- [ ] User identifies application website
- [ ] User can print or save results

---

### **Test Scenario B: Multiple Programs - Family**

**User Profile:**
- Parent with 2 children (ages 3 and 6)
- Household size: 3
- Monthly income: $2,800
- Pregnant with third child

**Expected Result:**
- Qualifies for: SNAP, Medicaid, WIC
- Shows all three programs
- Different requirements for each

**Test Checklist:**
- [ ] User sees multiple program results
- [ ] User understands qualified for multiple programs
- [ ] User can distinguish between programs
- [ ] User finds WIC-specific requirements
- [ ] User understands pregnancy affects eligibility

---

### **Test Scenario C: Coverage Gap (Non-Expansion State)**

**User Profile:**
- Adult age 35, no children
- State: Georgia (non-expansion)
- Monthly income: $1,500
- No disability

**Expected Result:**
- Qualifies for SNAP
- Does NOT qualify for Medicaid (coverage gap)
- Explanation of why

**Test Checklist:**
- [ ] User understands they qualify for SNAP
- [ ] User understands why NOT qualified for Medicaid
- [ ] User finds alternative resources (HealthCare.gov)
- [ ] User doesn't feel discouraged

---

### **Test Scenario D: Results Management**

**User Profile:**
- User who completed screening before
- Wants to check if still eligible after raise

**Tasks:**
1. Load previous results from history
2. Complete new screening with updated income
3. Compare old vs new results
4. Save new results
5. Export for counselor

**Test Checklist:**
- [ ] User finds "History" button
- [ ] User can view old results
- [ ] User completes new screening
- [ ] User compares side-by-side
- [ ] User exports encrypted file

---

### **Test Scenario E: Print and Apply**

**User Profile:**
- User ready to apply for benefits
- Needs documentation for appointment

**Tasks:**
1. View results
2. Review document checklist
3. Print results
4. Check off documents as gathered

**Test Checklist:**
- [ ] User finds print button
- [ ] Print layout is clear and readable
- [ ] Document checklist prints properly
- [ ] User can use printed version for application

---

## Metrics to Collect

### Completion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Questionnaire completion rate | >85% | # completed / # started |
| Time to complete screening | <10 min | Average time |
| Results comprehension | >90% | % who correctly state status |
| Document identification | >90% | % who find checklist |
| Save/export success | >80% | % who successfully save |

### Satisfaction Metrics

| Metric | Target | Scale |
|--------|--------|-------|
| Overall satisfaction | >4.0/5 | 1-5 rating |
| Likelihood to use again | >4.0/5 | 1-5 rating |
| Likelihood to recommend | >4.0/5 | 1-5 rating |
| Trust in results | >3.5/5 | 1-5 rating |

### Error Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Input errors | <5% | % of questions with errors |
| Navigation errors | <10% | % who get lost |
| Abandoned sessions | <15% | % who don't complete |

---

## Accessibility Testing

### Screen Reader Testing Checklist

**Test with:** NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)

- [ ] All text is announced correctly
- [ ] Form controls have clear labels
- [ ] Button purposes are clear
- [ ] Status badges are announced
- [ ] Confidence scores are announced
- [ ] Checkboxes state announced correctly
- [ ] Accordion states announced
- [ ] Dialog open/close announced
- [ ] Error messages are announced
- [ ] Progress is announced

### Keyboard Navigation Checklist

- [ ] Tab key moves through interactive elements
- [ ] Shift+Tab moves backward
- [ ] Enter activates buttons
- [ ] Space toggles checkboxes
- [ ] Escape closes dialogs
- [ ] Arrow keys work in select/radio groups
- [ ] Focus is always visible
- [ ] Focus doesn't get trapped (except dialogs)
- [ ] Focus order is logical

### Visual Accessibility Checklist

- [ ] Text size at least 16px
- [ ] Color contrast 4.5:1 for text
- [ ] Color contrast 3:1 for UI elements
- [ ] No color-only indicators
- [ ] Icons have text labels
- [ ] Hover states are clear
- [ ] Text is resizable to 200%
- [ ] Page is usable at 200% zoom

### Motor Accessibility Checklist

- [ ] All touch targets ≥44x44px
- [ ] Adequate spacing between buttons
- [ ] No time limits on tasks
- [ ] No required hovering
- [ ] Drag-and-drop not required
- [ ] Works with switch access
- [ ] Works with voice control

---

## Field Testing

### Community Center Testing

**Schedule:**
- 2-3 hour sessions
- 8-12 participants
- One-on-one or small groups

**Setup:**
- Dedicated computer/tablet
- Privacy screen
- Quiet area
- Consent forms and compensation

**Process:**
1. Welcome participants
2. 5-10 min individual sessions
3. Observer takes notes
4. Brief survey after
5. Compensate

**Data Collection:**
- Completion times
- Navigation paths
- Error rates
- Satisfaction scores
- Qualitative feedback

### Food Bank / Benefits Office Testing

**Partnership with:**
- Local food banks
- SNAP enrollment sites
- WIC clinics
- Community health centers

**Approach:**
- Offer as alternative to paper screening
- Field worker assists first-time users
- Collect feedback on accuracy
- Compare to official determinations

### NGO Partner Testing

**Partners:**
- United Way
- Catholic Charities
- Local community organizations
- Legal aid societies

**Goals:**
- Get field worker feedback
- Test with diverse populations
- Validate accuracy against official results
- Build trust for wider deployment

---

## Feedback Collection & Analysis

### During Sessions

**Note Template:**
```
OBSERVATION LOG

User ID: [Anonymized ID]
Date: [Date]
Age: [Range]
Tech Level: [1-5]
Language: [English/Other]

TIMELINE:
[00:00] Started questionnaire
[02:30] First hesitation at [question]
[05:00] Clicked back
[10:00] Reached results
[12:00] Clicked "Why?"
[15:00] Completed

ISSUES OBSERVED:
1. [Description + severity: critical/major/minor]
2. [Description + severity]

POSITIVE OBSERVATIONS:
1. [What worked well]

QUOTES:
- "[Exact user quote]"

RECOMMENDATIONS:
- [Specific change to make]
```

### After Testing

**Analysis Process:**
1. Compile all observation logs
2. Categorize issues by severity
3. Count frequency of each issue
4. Identify patterns across users
5. Prioritize fixes

**Issue Severity:**
- **Critical** - Prevents task completion (fix immediately)
- **Major** - Causes significant frustration (fix before launch)
- **Minor** - Small annoyance (fix if time permits)
- **Enhancement** - Nice to have (add to backlog)

---

## Success Criteria

### Minimum Viable Testing

Before launch, must complete:
- [ ] At least 15 usability tests with target users
- [ ] At least 3 tests with screen reader users
- [ ] At least 5 tests with seniors (65+)
- [ ] At least 5 tests with low-tech users
- [ ] All critical issues resolved
- [ ] 80%+ satisfaction score
- [ ] 85%+ completion rate

### Quality Benchmarks

- **Comprehension**: >90% correctly understand eligibility
- **Task completion**: >85% complete screening
- **Satisfaction**: >4.0/5.0 average
- **Recommendation**: >80% would recommend
- **Accessibility**: 0 WCAG violations

---

## Common Issues to Watch For

### Questionnaire Issues
- Questions too complex or use jargon
- Too many questions (fatigue)
- Unclear input requirements
- Confusing skip logic

### Results Display Issues
- Status not immediately clear
- Confidence score misunderstood
- Can't find "Why?" explanation
- Document list overwhelming
- Next steps unclear

### Navigation Issues
- Can't find how to save
- Can't find print button
- Can't get back to results
- Lost after printing

### Mobile Issues
- Text too small
- Buttons too small to tap
- Horizontal scrolling required
- Forms don't fit screen

### Trust Issues
- Don't understand how result was determined
- Don't trust accuracy
- Concerned about privacy
- Want human verification

---

## Reporting Results

### Test Report Template

```markdown
# Usability Testing Report

**Date:** [Date]
**Sessions:** [Number]
**Users:** [Number]

## Summary
- Completion Rate: [X]%
- Avg Time: [X] minutes
- Satisfaction: [X.X]/5.0
- Critical Issues: [X]

## Key Findings

### What Worked Well
1. [Positive finding]
2. [Positive finding]

### Critical Issues
1. **[Issue]** - [X]% of users affected
   - Recommendation: [Fix]

### Major Issues
1. **[Issue]** - [X]% of users affected
   - Recommendation: [Fix]

### Minor Issues
[List]

### Feature Requests
[List]

## Recommendations
1. [Priority 1 fix]
2. [Priority 2 fix]

## Next Steps
- [ ] Fix critical issues
- [ ] Retest with [X] users
- [ ] Implement requested features
```

---

## Resources

### Testing Tools
- **Screen Readers**: NVDA (free), JAWS (paid), VoiceOver (Mac/iOS built-in)
- **Color Contrast**: WebAIM Contrast Checker
- **Accessibility**: axe DevTools browser extension
- **Recording**: OBS Studio (free), Zoom

### Recruitment
- **Compensation**: $25-50 per hour
- **Incentives**: Gift cards, donations to user's org
- **Partners**: Community centers, food banks, libraries

### Analysis
- **Note taking**: Google Docs, Notion
- **Video review**: OBS recordings
- **Data compilation**: Google Sheets, Excel
- **Issue tracking**: GitHub Issues

---

## Ethical Considerations

### Privacy Protection
- ✅ Use test data whenever possible
- ✅ Never require real personal information
- ✅ Get informed consent
- ✅ Anonymize all notes and recordings
- ✅ Delete recordings after analysis

### Respect for Participants
- ✅ Compensate fairly
- ✅ Respect time limits
- ✅ Allow breaks
- ✅ Right to stop anytime
- ✅ No judgment for struggles
- ✅ Thank profusely!

### Cultural Sensitivity
- ✅ Test with diverse populations
- ✅ Respect language preferences
- ✅ Understand different tech comfort levels
- ✅ Be aware of benefit stigma
- ✅ Create safe, welcoming environment

---

## Next Steps After Testing

1. **Compile findings** into report
2. **Prioritize issues** (critical → major → minor)
3. **Fix critical issues** immediately
4. **Retest** with subset of users
5. **Iterate** until quality benchmarks met
6. **Document lessons learned**
7. **Plan next round** of testing

---

## Questions?

Contact the BenefitFinder team or open a GitHub discussion.

---

**Remember:** Testing with real users is invaluable. Their feedback will make BenefitFinder truly useful and accessible to those who need it most.

