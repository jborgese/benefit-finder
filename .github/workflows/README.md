# GitHub Actions Workflows

This directory contains all CI/CD workflows for BenefitFinder.

## Workflows Overview

### 1. **ci.yml** - Continuous Integration

**Triggers**: Push and PR to main/master/develop branches

**Jobs**:
- **Lint**: ESLint and TypeScript checks
- **Unit Tests**: Vitest with coverage
- **E2E Tests**: Playwright (Chrome + Firefox)
- **Accessibility Tests**: axe-core compliance
- **Build**: Production build verification
- **Security Audit**: npm audit for vulnerabilities

**Artifacts**:
- Coverage reports (30 days)
- Playwright reports (30 days)
- Build artifacts (7 days)

### 2. **deploy.yml** - Deployment

**Triggers**: Push to main/master, manual dispatch

**Jobs**:
- Build production bundle
- Deploy to GitHub Pages

**Requirements**:
- All tests must pass
- GitHub Pages enabled in repo settings

### 3. **dependency-review.yml** - Dependency Security

**Triggers**: Pull requests to main/master

**Checks**:
- New dependency vulnerabilities
- License compliance (blocks GPL-3.0, AGPL-3.0)
- Dependency changes review

### 4. **codeql.yml** - Code Security Scanning

**Triggers**: Push, PR, weekly schedule (Monday 6 AM UTC)

**Scans**:
- JavaScript/TypeScript code analysis
- Security vulnerabilities
- Code quality issues

### 5. **lighthouse.yml** - Performance & Accessibility Audit

**Triggers**: Pull requests to main/master

**Audits**:
- Performance (min 80%)
- Accessibility (min 90%)
- Best Practices (min 90%)
- SEO (min 80%)

**Runs**: 3 times per URL for consistency

### 6. **stale.yml** - Issue & PR Management

**Triggers**: Daily at midnight UTC

**Actions**:
- Mark inactive issues stale (30 days)
- Mark inactive PRs stale (14 days)
- Close stale items (7 days after marking)
- Exempt: pinned, security, bug, WIP labels

## Configuration

### Secrets Required

None! All workflows use default `GITHUB_TOKEN`.

### Optional Secrets

- `CODECOV_TOKEN`: For private repo coverage reports

### Branch Protection Rules

Recommended settings for `main` branch:

- ✅ Require PR reviews (1)
- ✅ Require status checks to pass:
  - Lint
  - Unit Tests
  - E2E Tests
  - Build
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators

## Workflow Status Badges

Add to README.md:

```markdown
![CI](https://github.com/username/benefit-finder/workflows/CI/badge.svg)
![Deploy](https://github.com/username/benefit-finder/workflows/Deploy/badge.svg)
![Security](https://github.com/username/benefit-finder/workflows/CodeQL%20Security%20Scan/badge.svg)
```

## Local Testing

Test workflows locally with [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
choco install act  # Windows

# Run workflow
act pull_request -W .github/workflows/ci.yml
```

## Debugging Workflows

### Enable Debug Logging

Add repository secrets:
- `ACTIONS_RUNNER_DEBUG`: `true`
- `ACTIONS_STEP_DEBUG`: `true`

### View Logs

1. Go to Actions tab
2. Click workflow run
3. Click job
4. Expand steps

### Common Issues

**Tests fail in CI but pass locally**:
- Check Node.js version matches
- Ensure `npm ci` instead of `npm install`
- Check environment variables

**Playwright tests timeout**:
- Increase timeout in playwright.config.ts
- Check if server starts properly
- Review browser installation

**Build fails**:
- Check TypeScript errors
- Verify all dependencies installed
- Check memory limits

## Customization

### Change Node Version

Edit all workflow files:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change from 18 to 20
```

### Add New Workflow

1. Create `.github/workflows/my-workflow.yml`
2. Define trigger events
3. Add jobs and steps
4. Test locally with `act`
5. Commit and push

### Modify Test Coverage Threshold

Edit `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,  // Change from 70
    functions: 80,
    branches: 75,
    statements: 80,
  },
},
```

### Change Lighthouse Thresholds

Edit `.github/lighthouse/lighthouserc.json`:

```json
{
  "assertions": {
    "categories:performance": ["error", {"minScore": 0.9}],
    "categories:accessibility": ["error", {"minScore": 0.95}]
  }
}
```

## Performance Optimization

### Speed Up CI

**Cache node_modules**:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

**Run jobs in parallel**:
- Unit tests and E2E tests run concurrently
- Only build after lint and tests pass

**Skip redundant steps**:
```yaml
if: github.event_name == 'pull_request'
```

### Reduce Build Time

- Use `npm ci` instead of `npm install`
- Cache Playwright browsers
- Limit test retries
- Use matrix strategy for parallel tests

## Maintenance

### Weekly Tasks

- [ ] Review failed workflows
- [ ] Update dependencies
- [ ] Check security alerts
- [ ] Review stale issues

### Monthly Tasks

- [ ] Update Node.js version
- [ ] Update GitHub Actions versions
- [ ] Review workflow efficiency
- [ ] Update documentation

### Quarterly Tasks

- [ ] Security audit
- [ ] Performance review
- [ ] Workflow optimization
- [ ] Process improvement

## Monitoring

### Metrics to Track

- ✅ Build success rate
- ✅ Average build time
- ✅ Test coverage trend
- ✅ Lighthouse scores
- ✅ Security vulnerabilities

### Alerts

Set up notifications:
1. GitHub → Settings → Notifications
2. Enable workflow notifications
3. Configure email/Slack integration

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

