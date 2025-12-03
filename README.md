# BenefitFinder

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/jborgese/benefit-finder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

**Discover what government benefits and assistance programs you qualify for — privately, transparently, and offline.**

BenefitFinder helps individuals and families check eligibility for federal and state programs (like SNAP, Medicaid, WIC, LIHEAP, and SSI) without giving away personal data or creating an account.

---

## 🌍 Mission

To empower individuals to access the support they're already entitled to — through an open, privacy-preserving tool that runs entirely offline and uses plain language.

---

## ✨ Features

### 🎯 Core Functionality
- **Guided Questionnaire** — Dynamic Q&A flow with conditional logic and navigation
- **Eligibility Engine** — JSON-logic based rule evaluation for program criteria
- **Plain-Language Results** — Detailed explanations with next steps and document checklists
- **Visual Flow Diagrams** — Interactive eligibility flow visualization using ReactFlow
- **Offline-First Architecture** — Works without internet
- **Local Data Only** — RxDB with AES-GCM encryption ensures all data stays private
- **Import/Export** — Save and share eligibility results securely
- **Multi-Jurisdiction Support** — Rules organized by country/state/year with versioning
- **Comprehensive Testing** — Unit, E2E, accessibility, and performance tests included
- **NGO-Ready Sync Option** — CouchDB replication for shared field devices (device-to-device over Wi-Fi)
- **LIHTC Housing Assessment** — Advanced Low-Income Housing Tax Credit eligibility with real HUD data

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Modern UI library with hooks
- **TypeScript** — Type-safe development
- **Vite** — Fast build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **Radix UI** — Accessible component primitives
- **React Router** — Client-side routing

### State & Data Management
- **Zustand** — Lightweight state management
- **RxDB** — Reactive offline-first database
- **Dexie** — IndexedDB wrapper
- **Zod** — Schema validation

### Visualization & Logic
- **ReactFlow** — Interactive eligibility flow diagrams
- **Argdown** — Argument mapping
- **json-logic-js** — Rule evaluation engine

### Testing & Quality
- **Vitest** — Unit testing
- **Playwright** — E2E testing
- **@axe-core/playwright** — Accessibility testing
- **ESLint** — Code linting with security plugins

### Additional Dependencies
- **crypto-js** — Cryptographic functions for AES-GCM encryption
- **nanoid** — Unique ID generation
- **immer** — Immutable state updates
- **isomorphic-dompurify** — XSS protection and sanitization
- **elkjs** — Graph layout algorithms for flow diagrams
- **html-to-image** / **dom-to-svg** — Export capabilities

---

## 🚀 Getting Started

### System Requirements

**Development:**
- Node.js 18 or higher
- npm (comes with Node.js)

**Browser Support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with IndexedDB and ES2020 support

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jborgese/benefit-finder.git
cd benefit-finder

# Install dependencies
npm install

# Start development server (typically on http://localhost:5173)
npm run dev
```

The application will automatically open in your browser. All data is stored locally in IndexedDB.

#### Linux Development Quickstart

**Ubuntu/Debian:**
```bash
# Install Node.js 18+ (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional dependencies for Playwright
sudo npx playwright install-deps

# Clone and start
git clone https://github.com/jborgese/benefit-finder.git
cd benefit-finder
npm install
npm run dev
```

**Fedora/RHEL:**
```bash
# Install Node.js 18+
sudo dnf install nodejs npm

# Install Playwright dependencies
sudo npx playwright install-deps

# Clone and start
git clone https://github.com/jborgese/benefit-finder.git
cd benefit-finder
npm install
npm run dev
```

**Arch Linux:**
```bash
# Install Node.js
sudo pacman -S nodejs npm

# Install Playwright dependencies
sudo npx playwright install-deps

# Clone and start
git clone https://github.com/jborgese/benefit-finder.git
cd benefit-finder
npm install
npm run dev
```

**Tips for Linux:**
- If port 5173 is in use, Vite will automatically select the next available port
- Use `scripts/kill-dev-linux.sh` to terminate any stuck dev server processes
- For browser auto-open issues, manually navigate to `http://localhost:5173`

### Development

```bash
# Start development server with hot reload
npm run dev

# Run in production mode locally
npm run build
npm run preview
```

### Build

```bash
# Create production build (runs TypeScript check + Vite build)
npm run build

# Preview production build locally
npm run preview

# Build with bundle size analysis
npm run build:analyze
```

### Testing

```bash
# Unit Tests
npm test                    # Run unit tests in watch mode
npm run test:ui             # Run tests with Vitest UI
npm run test:run            # Run tests once (CI mode)
npm run test:coverage       # Run tests with coverage report
npm run test:watch          # Run tests in watch mode (explicit)

# End-to-End Tests
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Run E2E tests with Playwright UI
npm run test:e2e:headed     # Run E2E tests in headed mode
npm run test:e2e:debug      # Debug E2E tests
npm run test:e2e:report     # Show latest E2E test report

# Accessibility Tests
npm run test:a11y           # Run accessibility-specific tests

# Performance Tests
npm run test:perf           # Run performance benchmarks

# Rule Validation
npm run validate-rules      # Validate eligibility rule schemas

# Fast Smoke Suite

For a quick regression signal, run the lightweight smoke suite (single-threaded Vitest):

```bash
npm run test:smoke
```

You can also grep for tests tagged with `@smoke`:

```bash
npm run test:smoke:grep
```

Smoke tests live under `src/__tests__/smoke/` and focus on resilient checks of critical UI flows.
```

### Linting

```bash
# Check code quality
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### All Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (TypeScript + Vite) |
| `npm run build:analyze` | Build with bundle size analysis |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests (watch mode) |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:run` | Run tests once (CI mode) |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run all E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:e2e:headed` | Run E2E tests in headed mode |
| `npm run test:e2e:debug` | Debug E2E tests |
| `npm run test:e2e:report` | Show E2E test report |
| `npm run test:a11y` | Run accessibility tests |
| `npm run test:perf` | Run performance tests |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run validate-rules` | Validate rule schemas |

---

## 📁 Project Structure

```
benefit-finder/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles
│   ├── components/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── EligibilityResultExplanation.tsx
│   │   ├── EncryptionIndicator.tsx
│   │   └── results/               # Results display components
│   ├── db/                        # RxDB database layer
│   │   ├── database.ts            # Database initialization
│   │   ├── collections.ts         # Collection definitions
│   │   ├── schemas.ts             # Data schemas
│   │   └── hooks.ts               # Database hooks
│   ├── questionnaire/             # Questionnaire system
│   │   ├── store.ts               # Questionnaire state
│   │   ├── flow-engine.ts         # Flow logic
│   │   ├── navigation.ts          # Navigation handling
│   │   ├── components/            # Questionnaire components
│   │   ├── ui/                    # UI components
│   │   └── accessibility/         # Accessibility features
│   ├── rules/                     # Eligibility rules engine
│   │   ├── evaluator.ts           # Rule evaluation
│   │   ├── eligibility.ts         # Eligibility logic
│   │   ├── validator.ts           # Rule validation
│   │   ├── explanation.ts         # Result explanations
│   │   └── examples/              # Example rule definitions
│   ├── stores/                    # Zustand state stores
│   │   ├── useStore.ts            # Main store
│   │   ├── encryptionStore.ts     # Encryption state
│   │   ├── appSettingsStore.ts    # App settings
│   │   └── questionnaireStore.ts  # Questionnaire state
│   ├── types/                     # TypeScript type definitions
│   │   ├── eligibility.ts
│   │   ├── household.ts
│   │   ├── program.ts
│   │   ├── question.ts
│   │   └── rule.ts
│   └── utils/                     # Utility functions
│       └── encryption.ts          # AES-GCM encryption
├── docs/                          # Documentation
│   ├── ACCESSIBILITY.md
│   ├── ENCRYPTION.md
│   ├── PRIVACY_GUIDE.md
│   ├── RULE_SCHEMA.md
│   ├── SECURITY.md
│   ├── USER_GUIDE.md
│   └── milestones/                # Development milestones
├── tests/
│   └── e2e/                       # Playwright E2E tests
├── scripts/                       # Build and utility scripts
│   ├── performance-tests.ts
│   ├── database-performance.ts
│   └── validate-rules.ts
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
├── vitest.config.ts               # Vitest configuration
├── playwright.config.ts           # Playwright configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### User Documentation
- **[User Guide](docs/USER_GUIDE.md)** — Complete guide for using BenefitFinder
- **[FAQ](docs/FAQ.md)** — Frequently asked questions
- **[Privacy Guide](docs/PRIVACY_GUIDE.md)** — How your data stays private
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** — Common issues and solutions

### Linux Development Troubleshooting

**Port Already in Use:**
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use the provided script
./scripts/kill-dev-linux.sh
```

**Playwright Browser Installation Issues:**
```bash
# Install system dependencies for Playwright
sudo npx playwright install-deps

# Install browsers manually
npx playwright install
```

**Permission Denied Errors:**
```bash
# If npm install fails with permission errors, don't use sudo
# Instead, configure npm to use a different directory:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then retry installation
npm install
```

**Memory Issues on Low-End Systems:**
```bash
# Use the low-end Playwright config for E2E tests
npm run test:e2e -- --config=playwright.config.lowend.ts

# Or increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

**File Watcher Limit (ENOSPC Error):**
```bash
# Increase inotify watchers limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If TypeScript errors persist
npm run build -- --mode development
```

**Database Issues:**
```bash
# Clear local database (caution: deletes all local data)
node clear-db.js

# Or clear browser data manually in DevTools:
# Application → Storage → Clear site data
```

**SELinux Issues (Fedora/RHEL):**
```bash
# If you encounter permission issues with SELinux
sudo setenforce 0  # Temporarily disable (not recommended for production)

# Or add proper SELinux context
sudo chcon -R -t httpd_sys_content_t /path/to/benefit-finder
```

### Developer Documentation
- **[Rule Schema](docs/RULE_SCHEMA.md)** — Eligibility rule format and structure
- **[Rule Authoring Guide](docs/RULE_AUTHORING_GUIDE.md)** — How to create benefit rules
- **[Rule System](docs/RULE_SYSTEM.md)** — Rule engine architecture
- **[Rule Validation](docs/RULE_VALIDATION_USAGE.md)** — Validating rule definitions
- **[Rule Maintenance](docs/RULE_MAINTENANCE.md)** — Updating and managing rules

### Technical Documentation
- **[Encryption](docs/ENCRYPTION.md)** — Data encryption implementation
- **[Security](docs/SECURITY.md)** — Security architecture and best practices
- **[Accessibility](docs/ACCESSIBILITY.md)** — Accessibility features and testing
- **[Results Management](docs/RESULTS_MANAGEMENT.md)** — Managing eligibility results
- **[Core Operations](docs/CORE_OPERATIONS.md)** — Core functionality guide
- **[Performance Testing](docs/PERFORMANCE_TESTING.md)** — Performance benchmarks
- **[Usability Testing](docs/USABILITY_TESTING_GUIDE.md)** — Usability testing procedures

### Project Documentation
- **[Roadmap](docs/ROADMAP.md)** — Detailed project roadmap
- **[Milestones](docs/milestones/)** — Development milestone documentation

---

## 🧩 Example Rule Definition

```json
{
  "program": "SNAP",
  "jurisdiction": "US-GA",
  "year": 2025,
  "conditions": {
    "all": [
      { "<=": [ { "var": "gross_income_fpl_percent" }, 130 ] },
      { "==": [ { "var": "citizenship_or_eligible_status" }, true ] }
    ]
  },
  "docsRequired": ["Proof of income", "Residency", "SSN"],
  "nextSteps": [
    { "label": "Apply via Georgia Gateway", "url": "https://gateway.ga.gov" }
  ]
}
```

---

## 🔒 Privacy & Security

- **No Server Required** — All processing happens locally in your browser
- **No Tracking** — No analytics, cookies, or third-party scripts
- **Encrypted Storage** — AES-GCM encryption for all locally stored data
- **Open Source** — Fully auditable codebase
- **No Account Needed** — Start using immediately without registration

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and add tests
4. **Ensure tests pass** (`npm test`)
5. **Lint your code** (`npm run lint`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Development Guidelines
- Write tests for new features
- Follow existing code style
- Run accessibility tests for UI changes
- Update documentation as needed
- Keep commits focused and descriptive

---

## 🗺️ Roadmap

### Phase 1: Core MVP ✅
- [x] Basic questionnaire engine with dynamic flow
- [x] Rule evaluation system (json-logic-js)
- [x] Results display with explanations and next steps
- [x] Offline-first architecture with RxDB
- [x] AES-GCM encryption for local data
- [x] Comprehensive test suite (Unit, E2E, Accessibility, Performance)
- [x] Import/export eligibility results

### Phase 2: Enhanced Features 🚧
- [ ] Multi-language support (Spanish, etc.)
- [ ] Progressive Web App (PWA) capabilities
- [x] Visual eligibility flow diagrams (ReactFlow)
- [ ] Additional benefit program rules (SNAP, Medicaid, WIC, SSI, etc.)
- [ ] Enhanced accessibility features
- [ ] User preferences and customization

### Phase 3: Expansion (in progress)
- [ ] Additional state jurisdictions
- [ ] More benefit programs (housing, childcare, utilities)
- [ ] Document checklist generator
- [ ] Application deadline tracking
- [ ] Community resource integration

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built to serve communities in need of benefits assistance
- Inspired by the challenges faced by outreach workers and social service organizations
- Thanks to all contributors and testers who help make this tool better

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/jborgese/benefit-finder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jborgese/benefit-finder/discussions)

---

**Note**: This tool provides informational guidance only. Always verify eligibility requirements with official program administrators before applying.
