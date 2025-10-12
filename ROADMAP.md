# BenefitFinder Development Roadmap

**Version:** 1.0
**Last Updated:** October 12, 2025

This roadmap outlines the development phases for BenefitFinder, a privacy-preserving, offline-first government benefits eligibility checker. All features maintain strict privacy standards with no server dependencies.

---

## 🎯 Development Principles

Every feature must satisfy:
- ✅ Works completely offline
- ✅ No external API calls or tracking
- ✅ Encrypted local storage only
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Full test coverage (unit + E2E + a11y)
- ✅ Type-safe TypeScript implementation

---

## Phase 1: Foundation & Core MVP (Weeks 1-8)

**Goal:** Build a functional MVP that can evaluate eligibility for 2-3 benefit programs in 2-3 states.

### 1.1 Project Infrastructure Setup (Week 1)
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS with custom theme
- [x] Set up Zustand store architecture
- [x] Configure RxDB with encryption plugin
- [x] Set up Vitest for unit testing
- [x] Configure Playwright for E2E testing
- [x] Add @axe-core/playwright for accessibility testing
- [x] Set up ESLint with security plugins
- [x] Create GitHub Actions CI/CD pipeline

**Deliverables:**
- Development environment ready
- Testing framework operational
- Linting and formatting configured

---

### 1.2 Core Data Architecture (Week 2)

#### Database Schema
- [x] Define RxDB collections schema with Zod:
  - ✅ `UserProfiles` — encrypted household data (17 fields, 14 encrypted)
  - ✅ `Programs` — benefit program definitions (19 fields)
  - ✅ `Rules` — eligibility rule sets (21 fields with JSON Logic)
  - ✅ `EligibilityResults` — cached evaluations (15 fields, 9 encrypted)
  - ✅ `AppSettings` — user preferences and app state (10 fields)

#### Type System
- [x] Create comprehensive TypeScript types:
  - ✅ `HouseholdProfile` interface (+ 9 related types)
  - ✅ `BenefitProgram` interface (+ 11 related types)
  - ✅ `RuleDefinition` interface (+ 11 related types)
  - ✅ `EligibilityResult` interface (+ 8 related types)
  - ✅ `QuestionDefinition` interface (+ 15 related types)
  - ✅ 18 utility types (ValidationResult, AsyncResult, etc.)

#### Encryption
- [x] Implement AES-GCM encryption wrapper for RxDB
- [x] Create secure key derivation from user passphrase
- [x] Add encryption indicator UI component

**Deliverables:**
- RxDB collections initialized with encryption
- Type-safe data models
- Unit tests for data operations

---

### 1.3 Rule Engine Foundation (Week 3)

#### JSON Logic Integration
- [x] Set up json-logic-js with TypeScript types
- [x] Create rule evaluation service
- [x] Build rule validation utilities
- [x] Implement rule testing framework

#### Rule Schema Design
- [x] Define JSON schema for rule definitions
- [x] Create Zod validator for rules
- [x] Build rule import/validation pipeline
- [x] Add rule versioning system

#### Core Rule Operations
- [x] Implement `evaluateEligibility()` function
- [x] Create `debugRule()` utility for debugging
- [x] Build `explainResult()` for transparency
- [x] Add rule performance monitoring

**Deliverables:**
- Working rule engine with json-logic-js
- Validated rule schema
- Comprehensive unit tests
- Sample rules for testing

---

### 1.4 Questionnaire Engine (Week 4-5)

#### Question Flow System
- [x] Design dynamic question tree structure
- [x] Implement conditional question logic
- [x] Create question skip/branch logic
- [x] Build progress tracking system

#### Question Types
- [x] Text input (name, SSN, etc.)
- [x] Number input (income, age, household size)
- [x] Single select (yes/no, state, citizenship)
- [x] Multi-select (disabilities, programs interested in)
- [x] Date picker (birth date, employment dates)
- [x] Currency input (income amounts)

#### Question Components
- [x] Build accessible form components with Radix UI
- [x] Create validation layer with Zod
- [x] Implement auto-save to local storage
- [x] Add "Save & Resume Later" functionality
- [x] Build question navigation (back/forward)

#### Accessibility
- [x] Ensure keyboard navigation works
- [x] Add ARIA labels and descriptions
- [x] Test with screen readers
- [x] Verify focus management

**Deliverables:**
- Dynamic questionnaire engine
- Reusable form components
- E2E tests for question flows
- A11y tests for all inputs

---

### 1.5 Initial Program Rules (Week 5-6)

#### Program Research & Data Entry
- [x] Research SNAP eligibility rules (Federal baseline)
- [x] Research Medicaid eligibility rules (Federal baseline)
- [x] Research WIC eligibility rules (Federal baseline)

#### State-Specific Rules (Priority: GA, CA, NY)
- [x] Georgia: SNAP, Medicaid rules (5 rules each, 32 tests total)
- [x] California: SNAP (CalFresh) rules (5 rules, 15 tests)
- [ ] California: Medi-Cal rules (defer to Phase 2 or as needed)
- [ ] New York: SNAP, Medicaid rules (defer to Phase 2 or as needed)

#### Rule Documentation
- [x] Create rule authoring guide
- [x] Document rule testing process
- [x] Build rule contribution template
- [x] Add source citations for each rule

**Deliverables:**
- [x] 3 federal program rule sets (SNAP, Medicaid, WIC) - 18 rules with 69 tests
- [ ] 3 programs × 3 states = 9 state-specific rule sets
- [x] Rule documentation and templates
- [x] Validation tests for each rule
- [x] Validation utilities and scripts

---

### 1.6 Results Display System (Week 6-7)

#### Results UI
- [x] Create results summary component
- [x] Build program card component with:
  - [x] Program name and description
  - [x] Eligibility status (qualified/maybe/not qualified)
  - [x] Confidence score display
  - [x] Required documents checklist
  - [x] Next steps and action items
- [x] Add "Why?" explanation feature
- [x] Implement print-friendly view

#### Next Steps & Resources
- [x] Display application links
- [x] Show required documents
- [x] Add contact information for local offices
- [x] Include deadlines and timelines

#### Results Management
- [x] Save results to RxDB
- [x] Create results history view
- [x] Add export to PDF functionality
- [x] Build share functionality (encrypted export file)

**Deliverables:**
- [x] User-friendly results interface (15 components total)
- [x] Document checklist generator
- [x] useEligibilityEvaluation hook for rule integration
- [x] Print-optimized layout
- [x] Results persistence with RxDB schema
- [x] Encrypted export/import system (.bfx format)
- [x] Results history and comparison tools

---

### 1.7 MVP Testing & Refinement (Week 7-8)

#### Testing
- [x] Complete E2E test suite for full user flow
- [x] Run accessibility audit on all pages
- [x] Perform usability testing with target users (guide created)
- [x] Test offline functionality thoroughly
- [x] Verify encryption is working correctly

#### Performance
- [x] Optimize bundle size (analysis tools and configuration created)
- [x] Test on low-end devices (Playwright config + Android Studio guide)
- [x] Verify PWA installation works (PWA config and tests created)
- [x] Check database performance with large datasets (performance test suite)

#### Documentation
- [ ] Write user guide
- [ ] Create FAQ section
- [ ] Document privacy features
- [ ] Add troubleshooting guide

**Deliverables:**
- [x] Complete E2E test suite (5 test files, 50+ tests)
- [x] Accessibility tests with axe-core
- [x] Offline functionality tests
- [x] Encryption verification tests
- [x] Usability testing guide and scenarios
- [ ] Production-ready MVP (pending integration)
- [ ] User documentation (in progress)
- [ ] Performance benchmarks (pending)

---

## Phase 2: Enhanced Features (Weeks 9-16)

**Goal:** Improve usability, expand language support, and add visualization features.

### 2.1 Multi-Language Support (Week 9-10)

#### Internationalization Setup
- [ ] Install and configure i18next
- [ ] Set up language detection and persistence
- [ ] Create translation file structure
- [ ] Build language switcher component

#### Translations
- [ ] Translate UI to Spanish
- [ ] Translate common program names
- [ ] Translate questionnaire
- [ ] Add RTL support for future languages

#### Cultural Considerations
- [ ] Research culturally appropriate phrasing
- [ ] Get community feedback on translations
- [ ] Add locale-specific formatting (dates, currency)

**Deliverables:**
- English and Spanish language support
- Translation infrastructure
- Language switcher UI

---

### 2.2 Progressive Web App (Week 10-11)

#### PWA Configuration
- [ ] Create service worker for offline caching
- [ ] Add web app manifest
- [ ] Configure install prompts
- [ ] Set up app icons and splash screens

#### Offline Capabilities
- [ ] Cache static assets
- [ ] Implement offline fallback pages
- [ ] Add offline indicator
- [ ] Test offline functionality across browsers

#### App-Like Features
- [ ] Add install button
- [ ] Configure app shortcuts
- [ ] Set up push notifications (for deadline reminders)
- [ ] Create standalone mode optimizations

**Deliverables:**
- Installable PWA
- Full offline functionality
- App store-like experience

---

### 2.3 Profile Import/Export (Week 11-12)

#### Export Features
- [ ] Export encrypted profile file (.bfp format)
- [ ] Export plain JSON (with user confirmation)
- [ ] Export to PDF report
- [ ] Add QR code generation for mobile transfer

#### Import Features
- [ ] Import encrypted profile
- [ ] Validate imported data structure
- [ ] Merge or replace existing profiles
- [ ] Handle version compatibility

#### Security
- [ ] Use strong encryption for exports
- [ ] Add password protection option
- [ ] Implement secure file handling
- [ ] Add data sanitization on import

**Deliverables:**
- Secure import/export functionality
- File format documentation
- Migration tools

---

### 2.4 Visual Eligibility Flows (Week 13-14)

#### ReactFlow Integration
- [ ] Set up ReactFlow library
- [ ] Design node types for eligibility tree
- [ ] Create edge types for conditions
- [ ] Build interactive flow viewer

#### Flow Features
- [ ] Visualize rule logic as flowchart
- [ ] Highlight user's path through eligibility tree
- [ ] Show why questions were asked/skipped
- [ ] Add zoom and pan controls

#### Educational Mode
- [ ] "Explain this program" visualization
- [ ] Interactive rule exploration
- [ ] Comparison mode (show multiple program paths)

**Deliverables:**
- Interactive eligibility flowcharts
- Educational visualization tool
- Flow export as image

---

### 2.5 Enhanced UI/UX (Week 15-16)

#### Design Improvements
- [ ] Conduct UX audit
- [ ] Refine color scheme and typography
- [ ] Add micro-interactions and animations
- [ ] Improve mobile experience

#### User Onboarding
- [ ] Create welcome tour
- [ ] Add contextual help tooltips
- [ ] Build privacy explainer
- [ ] Create quick-start guide

#### Advanced Features
- [ ] Dark mode support
- [ ] Customizable text size
- [ ] Print stylesheets
- [ ] Keyboard shortcuts

**Deliverables:**
- Polished UI with improved UX
- Onboarding flow
- Accessibility enhancements

---

## Phase 3: Field Deployment (Weeks 17-24)

**Goal:** Enable field workers and NGOs to use the tool for community outreach.

### 3.1 Device-to-Device Sync (Week 17-19)

#### Sync Architecture
- [ ] Implement CouchDB replication protocol
- [ ] Set up RxDB sync plugin
- [ ] Create peer discovery mechanism (local network only)
- [ ] Build conflict resolution strategy

#### Wi-Fi Direct Implementation
- [ ] Research Web Bluetooth / WebRTC for peer connection
- [ ] Implement device pairing flow
- [ ] Create sync initiation UI
- [ ] Add sync progress indicator

#### Security
- [ ] Implement end-to-end encryption for sync
- [ ] Add device authentication
- [ ] Create sync permission system
- [ ] Audit sync for privacy leaks

**Deliverables:**
- Working device-to-device sync
- No server dependencies [[memory:8456495]]
- Secure peer connections
- Sync documentation for field workers

---

### 3.2 Offline Rule Updates (Week 19-20)

#### Rule Distribution
- [ ] Create rule package format (.bfrules)
- [ ] Build rule import interface
- [ ] Add rule versioning and changelog
- [ ] Implement rule signing for verification

#### Update Mechanisms
- [ ] Manual rule package import
- [ ] Sync rules via device-to-device
- [ ] Show available vs. installed rules
- [ ] Add rule update notifications

#### Rule Management
- [ ] List installed rule packages
- [ ] Show rule metadata (version, jurisdiction, date)
- [ ] Enable/disable rule sets
- [ ] Rollback to previous rule versions

**Deliverables:**
- Rule update system
- Rule package format
- Rule management UI

---

### 3.3 Field Worker Dashboard (Week 20-22)

#### Dashboard Features
- [ ] Aggregated statistics (anonymized)
- [ ] Most-requested programs
- [ ] Common eligibility patterns
- [ ] Session history (without PII)

#### Screening Tools
- [ ] Quick screening mode
- [ ] Batch profile comparison
- [ ] Print queue management
- [ ] Follow-up reminders

#### Field Worker Tools
- [ ] Notes and annotations (local only)
- [ ] Checklist for required documents
- [ ] Office locator (pre-loaded data)
- [ ] Resource library

#### Privacy
- [ ] Ensure no PII in dashboard stats
- [ ] Add data retention controls
- [ ] Create session clear functionality
- [ ] Document privacy safeguards

**Deliverables:**
- Field worker dashboard
- Privacy-preserving analytics
- Screening workflow tools

---

### 3.4 Bulk Screening Mode (Week 22-24)

#### Bulk Operations
- [ ] Import multiple profiles (CSV format)
- [ ] Batch eligibility evaluation
- [ ] Export bulk results
- [ ] Progress tracking for large batches

#### Screening Events
- [ ] Event mode for community screening
- [ ] Session management
- [ ] Quick profile creation
- [ ] Batch printing

#### Performance
- [ ] Optimize for 100+ profiles
- [ ] Add background processing
- [ ] Implement queue system
- [ ] Cache evaluation results

**Deliverables:**
- Bulk screening capability
- Event mode for NGOs
- Performance optimizations

---

## Phase 4: Expansion (Weeks 25+)

**Goal:** Scale to more jurisdictions, programs, and advanced features.

### 4.1 Geographic Expansion (Ongoing)

#### Additional States (Priority Order)
1. [ ] Texas (SNAP, Medicaid, CHIP)
2. [ ] Florida (SNAP, Medicaid)
3. [ ] Illinois (SNAP, Medicaid)
4. [ ] Pennsylvania (SNAP, Medicaid)
5. [ ] Ohio (SNAP, Medicaid)
6. [ ] North Carolina (SNAP, Medicaid)
7. [ ] Michigan (SNAP, Medicaid)

#### All 50 States
- [ ] Create state contribution template
- [ ] Recruit state-specific volunteers
- [ ] Establish rule review process
- [ ] Build state coverage map

**Deliverables:**
- 10+ states in first milestone
- All 50 states in full rollout
- Community contribution pipeline

---

### 4.2 Program Expansion (Ongoing)

#### Federal Programs
- [ ] SSI (Supplemental Security Income)
- [ ] LIHEAP (Energy assistance)
- [ ] Section 8 Housing
- [ ] TANF (Temporary Assistance)
- [ ] Free/Reduced School Meals
- [ ] Medicare/Medicare Savings Programs
- [ ] Veterans Benefits
- [ ] Childcare Subsidies
- [ ] Unemployment Insurance

#### State/Local Programs
- [ ] State-specific energy assistance
- [ ] Local food banks and pantries
- [ ] Transportation assistance
- [ ] Job training programs

**Deliverables:**
- 15+ benefit programs
- Federal + state program coverage
- Program database

---

### 4.3 Document Management (Week 25-26)

#### Document Checklist Generator
- [ ] Dynamic checklist based on programs
- [ ] Print-optimized checklist view
- [ ] Document upload tracking (metadata only)
- [ ] Expiration date reminders

#### Document Guidance
- [ ] Where to get each document
- [ ] Acceptable alternatives
- [ ] Translation/notarization info
- [ ] Document preparation tips

**Deliverables:**
- Smart document checklist
- Document guidance library

---

### 4.4 Application Tracking (Week 27-28)

#### Deadline Tracker
- [ ] Track application deadlines
- [ ] Renewal reminders
- [ ] Document expiration alerts
- [ ] Calendar export (ICS format)

#### Application Status
- [ ] Manual status updates
- [ ] Application timeline view
- [ ] Next steps reminders

#### Privacy
- [ ] All data stored locally and encrypted
- [ ] Optional reminders (no push notifications)
- [ ] Easy deletion of tracking data

**Deliverables:**
- Application deadline tracker
- Privacy-preserving reminders

---

### 4.5 Advanced Features (Week 29+)

#### Argdown Integration
- [ ] Argument mapping for policy advocacy
- [ ] Visualize benefit cliff effects
- [ ] Show how rule changes affect eligibility
- [ ] Educational mode for understanding policies

#### Benefit Optimization
- [ ] Find best program combinations
- [ ] Identify benefit cliffs
- [ ] Suggest income optimization strategies
- [ ] Show long-term eligibility projections

#### Community Features
- [ ] Pre-loaded resource directory
- [ ] Community organization finder
- [ ] Legal aid referrals
- [ ] Success stories (anonymized, opt-in)

**Deliverables:**
- Policy visualization tools
- Benefit optimization engine
- Community resource integration

---

## 📊 Success Metrics

### Technical Metrics
- ✅ 100% offline functionality
- ✅ 90%+ test coverage
- ✅ WCAG 2.1 AA compliance on all pages
- ✅ < 3s initial load time
- ✅ < 100ms rule evaluation time
- ✅ Works on devices from 2018+

### User Metrics
- ✅ User can complete screening in < 10 minutes
- ✅ 90%+ accuracy compared to official eligibility
- ✅ Used by 10+ NGO partners
- ✅ Available in 5+ languages
- ✅ Covers 100+ benefit programs

### Privacy Metrics
- ✅ Zero external API calls (verified by audit)
- ✅ Zero tracking or analytics
- ✅ Encrypted local storage verified
- ✅ Open source security audit passed

---

## 🤝 Community Contribution Areas

### High Priority
- **Rule Contributions**: Validate and add state-specific rules
- **Translations**: Add language support for your community
- **Testing**: Field test with real users and provide feedback
- **Documentation**: Improve guides and tutorials

### Ongoing Needs
- **Accessibility Testing**: Test with assistive technologies
- **Rule Maintenance**: Keep rules updated with policy changes
- **Design**: Improve UI/UX for specific user groups
- **Advocacy**: Spread awareness to NGOs and community groups

---

## 🎯 Release Strategy

### Alpha Release (End of Phase 1)
- Limited release to beta testers
- 3 states, 3 programs
- Core MVP features only
- Gather feedback and iterate

### Beta Release (End of Phase 2)
- Public beta with more states
- Enhanced features and PWA
- Community testing program
- Documentation complete

### Version 1.0 (End of Phase 3)
- Production-ready release
- Field worker features
- 10+ states, 10+ programs
- Full security audit

### Version 2.0 (End of Phase 4)
- Nationwide coverage
- 50 states, 20+ programs
- Advanced optimization features
- Multi-language support

---

## 🛡️ Privacy & Security Checkpoints

Each phase must pass:
- [ ] Privacy audit (no data leaks)
- [ ] Security audit (encryption verified)
- [ ] Accessibility audit (WCAG AA)
- [ ] Code review (security best practices)
- [ ] Test coverage review (90%+)

---

## 📚 Resources & References

### Documentation to Create
- User Guide
- Field Worker Manual
- Rule Authoring Guide
- API Documentation (for sync)
- Privacy Policy
- Security Audit Report

### External Resources
- SNAP eligibility: [fns.usda.gov](https://www.fns.usda.gov/snap/recipient/eligibility)
- Medicaid: [medicaid.gov](https://www.medicaid.gov)
- Benefits.gov program data
- State DHHS websites

---

**This roadmap is a living document. Updates reflect changing priorities, user feedback, and community contributions.**

**Questions? Open a discussion on GitHub or contact the maintainers.**

