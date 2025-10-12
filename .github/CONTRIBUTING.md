# Contributing to BenefitFinder

Thank you for your interest in contributing to BenefitFinder! This document provides guidelines and instructions for contributing.

## 🎯 Core Principles

Before contributing, please understand our core principles:

1. **Privacy First**: No external API calls, no tracking, no data collection
2. **Offline-First**: All features must work without internet
3. **Accessibility**: WCAG 2.1 AA compliance required
4. **Security**: Treat all user data as sensitive
5. **Open Source**: Transparent, auditable code

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern browser with IndexedDB support

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/benefit-finder.git
cd benefit-finder

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
npm run test:e2e
```

## 📝 How to Contribute

### 1. Find or Create an Issue

- Check existing [issues](https://github.com/yourusername/benefit-finder/issues)
- Comment on the issue you want to work on
- Wait for assignment or approval

### 2. Fork and Branch

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/benefit-finder.git
cd benefit-finder

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

Follow our coding standards:

- **TypeScript**: Strict mode, no `any` types
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **State**: Zustand for global state
- **Database**: RxDB with encryption
- **Tests**: Required for new features

### 4. Run Tests

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y

# Check coverage
npm run test:coverage
```

### 5. Commit Changes

Use conventional commit format:

```bash
git commit -m "feat(scope): add new feature"
git commit -m "fix(scope): fix bug"
git commit -m "docs: update README"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🔒 Security Guidelines

### Required Checks

- [ ] No external API calls
- [ ] User input validated with Zod
- [ ] Sensitive data encrypted
- [ ] No console.log() with user data
- [ ] No eval() or dangerous functions
- [ ] TypeScript types explicit
- [ ] ESLint passes
- [ ] Tests include security scenarios

### Prohibited

❌ NEVER:
- Send data to external servers
- Use eval(), Function(), or innerHTML
- Store sensitive data unencrypted
- Add analytics or tracking
- Use external CDNs
- Create cookies with user data

## ♿ Accessibility Requirements

All UI changes must:

- [ ] Be keyboard accessible
- [ ] Work with screen readers
- [ ] Meet WCAG AA contrast ratios (4.5:1)
- [ ] Have touch targets ≥ 44x44px
- [ ] Include proper ARIA labels
- [ ] Use semantic HTML
- [ ] Pass axe-core tests

## 🧪 Testing Requirements

### Unit Tests (Required)

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should work correctly', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### E2E Tests (For UI Changes)

```typescript
import { test, expect } from './fixtures/test-fixtures';

test('user can perform action', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
  await expect(page.locator('.result')).toBeVisible();
});
```

### Accessibility Tests (For UI Changes)

```typescript
import { expectNoA11yViolations } from './utils/accessibility';

test('page is accessible', async ({ page }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
```

## 📚 Code Style

### TypeScript

```typescript
// ✅ Good
function calculateAge(birthDate: string): number {
  // Implementation
}

// ❌ Bad
function calculateAge(birthDate: any): any {
  // Implementation
}
```

### React Components

```tsx
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export function Button({ children, onClick }: ButtonProps): JSX.Element {
  return (
    <button onClick={onClick} className="px-4 py-2">
      {children}
    </button>
  );
}

// ❌ Bad
export function Button(props: any) {
  return <button {...props} />;
}
```

### Tailwind CSS

```tsx
// ✅ Good - utility classes
<button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg">

// ❌ Bad - inline styles
<button style={{ padding: '12px 24px', background: '#3b82f6' }}>
```

## 🌐 Adding Translations

To add a new language:

1. Create translation file: `src/i18n/locales/{language}.json`
2. Add language to `src/i18n/config.ts`
3. Update language selector component
4. Test all screens in new language

## 📖 Documentation

- Update README.md for major features
- Add JSDoc comments to exported functions
- Update relevant documentation in `/docs`
- Add examples for complex features

## 🐛 Bug Reports

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md):

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- No sensitive data

## 💡 Feature Requests

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md):

- Problem statement
- Proposed solution
- Privacy considerations
- Accessibility considerations
- Use cases

## 🔄 Pull Request Process

1. **Fill out PR template completely**
2. **Ensure all checks pass**:
   - Lint: `npm run lint`
   - Tests: `npm test` and `npm run test:e2e`
   - Build: `npm run build`
3. **Request review** from maintainers
4. **Address feedback** promptly
5. **Squash commits** before merge (if requested)

## 📋 Review Checklist

Reviewers will check:

- [ ] Code quality and style
- [ ] Test coverage
- [ ] Security implications
- [ ] Privacy compliance
- [ ] Accessibility
- [ ] Documentation
- [ ] Performance impact

## 🏆 Recognition

Contributors will be:

- Listed in README.md
- Credited in release notes
- Added to contributors page (coming soon)

## 📞 Getting Help

- **Questions**: [GitHub Discussions](https://github.com/yourusername/benefit-finder/discussions)
- **Issues**: [GitHub Issues](https://github.com/yourusername/benefit-finder/issues)
- **Security**: security@benefitfinder.example

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution helps make benefit information more accessible to those who need it. Thank you for your time and effort!

