# BenefitFinder

**Discover what government benefits and assistance programs you qualify for — privately, transparently, and offline.**

BenefitFinder helps individuals and families check eligibility for federal and state programs (like SNAP, Medicaid, WIC, LIHEAP, and SSI) without giving away personal data or creating an account.

---

## 🌍 Mission

To empower individuals to access the support they're already entitled to — through an open, privacy-preserving tool that runs entirely offline and uses plain language.

---

## ✨ Features

### 🎯 Core Functionality
- **Guided Questionnaire** — Dynamic Q&A flow to gather relevant details.
- **Eligibility Engine** — JSON rule sets map inputs to real-world program criteria.
- **Plain-Language Results** — "You may qualify for…" summaries with next steps and document checklists.
- **Offline-First Architecture** — Works without internet access; perfect for field workers or outreach programs.
- **Local Data Only** — RxDB + AES-GCM encryption ensure all data stays private.
- **Multi-Jurisdiction Support** — Rules organized by country/state/year.
- **NGO-Ready Sync Option** — CouchDB replication for shared field devices (no hosted servers, direct device-to-device over Wi-Fi).

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Modern UI library with hooks
- **TypeScript** — Type-safe development
- **Vite** — Fast build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **Radix UI** — Accessible component primitives

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

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- Modern browser with IndexedDB support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/benefit-finder.git
cd benefit-finder

# Install dependencies
npm install
```

### Development

```bash
# Start development server (typically on http://localhost:5173)
npm run dev
# or
npx vite
```

### Build

```bash
# Create production build
npm run build
# or
npx vite build

# Preview production build locally
npm run preview
# or
npx vite preview
```

### Testing

```bash
# Run unit tests
npm test
# or
npx vitest

# Run E2E tests
npm run test:e2e
# or
npx playwright test

# Run accessibility tests
npx playwright test --grep @a11y
```

### Linting

```bash
# Check code quality
npm run lint
# or
npx eslint .
```

---

## 📁 Project Structure

```
benefit-finder/
├── src/
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type definitions
├── tests/
│   └── e2e/                 # Playwright end-to-end tests
├── scripts/                 # Build and utility scripts
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest test configuration
├── playwright.config.ts     # Playwright test configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and metadata
```

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

### Phase 1: Core MVP
- [ ] Basic questionnaire engine
- [ ] Rule evaluation system
- [ ] SNAP & Medicaid rules (initial states)
- [ ] Results display with next steps

### Phase 2: Enhanced Features
- [ ] Multi-language support (Spanish, etc.)
- [ ] Progressive Web App (PWA) capabilities
- [ ] Import/export eligibility profiles
- [ ] Visual eligibility flow diagrams

### Phase 3: Field Deployment
- [ ] Device-to-device sync via Wi-Fi Direct
- [ ] Offline rule updates
- [ ] Field worker dashboard
- [ ] Bulk screening mode

### Phase 4: Expansion
- [ ] Additional state jurisdictions
- [ ] More benefit programs
- [ ] Document checklist generator
- [ ] Application deadline tracking

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

- **Issues**: [GitHub Issues](https://github.com/yourusername/benefit-finder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/benefit-finder/discussions)
- **Email**: support@benefitfinder.example

---

**Note**: This tool provides informational guidance only. Always verify eligibility requirements with official program administrators before applying.
