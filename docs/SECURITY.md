# Security Policy

## 🔒 Security First

BenefitFinder is designed with privacy and security as core principles. All processing happens locally in the browser with no server dependencies.

## Core Security Principles

### 1. **No External API Calls**
- ❌ No data sent to external servers
- ❌ No analytics or tracking
- ❌ No third-party services
- ✅ All processing happens locally
- ✅ IndexedDB with encryption

### 2. **Data Encryption**
- ✅ AES-256-GCM encryption for sensitive data
- ✅ Encrypted at rest in IndexedDB
- ✅ Field-level encryption for user data
- ✅ Secure key derivation (PBKDF2)

### 3. **Input Validation**
- ✅ Zod schema validation for all inputs
- ✅ Sanitization with isomorphic-dompurify
- ✅ Type-safe TypeScript throughout
- ✅ No eval() or dangerous functions

### 4. **Secure Coding Practices**
- ✅ Strict TypeScript mode
- ✅ No `any` types without justification
- ✅ ESLint security rules enforced
- ✅ SonarJS code quality checks
- ✅ Regular dependency updates

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email: security@benefitfinder.example (replace with actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours.

## Security Checklist for Contributors

### Code Review Checklist

- [ ] No external API calls added
- [ ] User input is validated with Zod
- [ ] Sensitive data is encrypted
- [ ] No console.log() with user data
- [ ] No eval() or similar dangerous functions
- [ ] TypeScript types are explicit (no `any`)
- [ ] ESLint passes without warnings
- [ ] Tests include security scenarios
- [ ] Dependencies are up to date

### Data Handling

- [ ] User data stored in encrypted IndexedDB
- [ ] No localStorage for sensitive data (use RxDB)
- [ ] No cookies or session storage for PII
- [ ] Data can be easily deleted
- [ ] No data persistence beyond user control

### Privacy

- [ ] No tracking or analytics
- [ ] No external fonts or resources
- [ ] No CDN dependencies
- [ ] No server-side logging
- [ ] Clear privacy documentation

## Secure Development Guidelines

### 1. **Input Validation**

Always validate user input with Zod:

```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  income: z.number().positive(),
});

const validated = schema.parse(userInput);
```

### 2. **Data Encryption**

Store sensitive data in encrypted RxDB collections:

```typescript
// Schema with encryption
const schema = {
  encrypted: ['firstName', 'income', 'ssn'],
  // ...
};
```

### 3. **Sanitize User Content**

Use DOMPurify for any user-generated content:

```typescript
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(userContent);
```

### 4. **Avoid Dangerous Patterns**

```typescript
// ❌ NEVER do this
eval(userInput);
new Function(userInput);
innerHTML = userInput;

// ✅ Do this instead
const validated = schema.parse(userInput);
textContent = validated;
```

### 5. **Type Safety**

```typescript
// ❌ Avoid
function process(data: any) { ... }

// ✅ Use explicit types
function process(data: UserProfile): EligibilityResult { ... }
```

## Security Testing

### Automated Security Checks

Run security linting:
```bash
npm run lint
```

Run tests with security scenarios:
```bash
npm test
npm run test:e2e
```

### Manual Security Testing

1. **Data Privacy**
   - [ ] Check DevTools → Application → IndexedDB (data should be encrypted)
   - [ ] Check Network tab (no external requests)
   - [ ] Check Console (no sensitive data logged)

2. **XSS Prevention**
   - [ ] Test input fields with `<script>alert('xss')</script>`
   - [ ] Verify output is sanitized

3. **Data Deletion**
   - [ ] Clear all data feature works
   - [ ] IndexedDB is actually cleared
   - [ ] localStorage is cleared

## Dependencies Security

### Audit Dependencies

```bash
npm audit
npm audit fix
```

### Update Dependencies

```bash
npm outdated
npm update
```

### Dependency Policy

- ✅ Use well-maintained packages
- ✅ Check for known vulnerabilities
- ✅ Minimize dependencies
- ✅ Pin major versions
- ✅ Review dependency changes

## Prohibited Practices

### ❌ NEVER

1. Send user data to external servers
2. Use `eval()`, `Function()`, or similar
3. Store sensitive data in localStorage unencrypted
4. Log sensitive data to console
5. Use `dangerouslySetInnerHTML` without sanitization
6. Include analytics or tracking scripts
7. Use external CDNs for dependencies
8. Create cookies with user data
9. Use `any` type without justification
10. Commit secrets or API keys

## Compliance

### Standards

- ✅ OWASP Top 10
- ✅ Privacy by Design
- ✅ Data minimization
- ✅ User data ownership
- ✅ Right to deletion

### Certifications

- [ ] Security audit (planned)
- [ ] Penetration testing (planned)
- [ ] WCAG 2.1 AA compliance
- [ ] Open source review

## Incident Response

If a security incident occurs:

1. **Immediate**: Assess impact and scope
2. **Within 1 hour**: Notify maintainers
3. **Within 24 hours**: Patch and test fix
4. **Within 48 hours**: Release security update
5. **Within 1 week**: Public disclosure (if applicable)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Mozilla Web Security](https://infosec.mozilla.org/guidelines/web_security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Updates

This security policy is reviewed quarterly and updated as needed.

**Last Updated**: October 12, 2025
**Next Review**: January 12, 2026

