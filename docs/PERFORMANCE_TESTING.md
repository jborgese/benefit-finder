# Performance Testing & Optimization Guide

**Version:** 1.0
**Last Updated:** October 12, 2025

Complete guide for performance testing, optimization, and benchmarking.

---

## Table of Contents

1. [Overview](#overview)
2. [Performance Targets](#performance-targets)
3. [Bundle Size Optimization](#bundle-size-optimization)
4. [PWA Configuration](#pwa-configuration)
5. [Database Performance](#database-performance)
6. [Low-End Device Testing](#low-end-device-testing)
7. [Performance Monitoring](#performance-monitoring)
8. [Optimization Techniques](#optimization-techniques)

---

## Overview

BenefitFinder must perform well on low-end devices and slow networks to serve users who may have:
- Budget smartphones from 2018+
- Slow or unreliable internet connections
- Limited data plans
- Older computers at libraries/community centers

---

## Performance Targets

### Page Load Targets

| Metric | Target | Good | Needs Work |
|--------|--------|------|------------|
| First Contentful Paint (FCP) | <1.8s | <1.0s | >2.5s |
| Time to Interactive (TTI) | <3.8s | <2.5s | >5.0s |
| Total Page Load | <3.0s | <2.0s | >5.0s |

### Runtime Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Rule evaluation (single) | <5ms | Average over 1000 runs |
| Rule evaluation (package) | <50ms | 7 rules evaluated |
| UI render (initial) | <100ms | React component mount |
| Database save | <500ms | Single result save |
| Database load | <1000ms | Load 100 results |
| Export encrypted | <2000ms | Generate .bfx file |

### Bundle Size Targets

| Asset Type | Target | Good | Needs Work |
|------------|--------|------|------------|
| JavaScript (gzipped) | <500KB | <300KB | >800KB |
| CSS (gzipped) | <50KB | <30KB | >100KB |
| Total page (gzipped) | <600KB | <400KB | >1MB |
| Initial bundle | <200KB | <150KB | >300KB |

---

## Bundle Size Optimization

### Analyze Bundle

```bash
# Build with bundle analysis
npm run build:analyze

# Opens dist/stats.html showing bundle breakdown
```

**Analyzes:**
- Which dependencies are largest
- Duplicate code
- Chunk sizes
- Tree-shaking effectiveness

### Current Bundle Configuration

**Manual chunks configured:**
```typescript
{
  'react-vendor': ['react', 'react-dom'],      // ~130KB
  'radix-ui': [...],                           // ~80KB
  'database': ['rxdb', 'dexie'],               // ~150KB
  'state': ['zustand', 'immer'],               // ~20KB
  'visualization': ['reactflow', 'elkjs'],     // ~200KB (lazy load!)
  'rules': ['json-logic-js'],                  // ~10KB
  'utils': ['zod', 'nanoid', 'crypto-js'],     // ~50KB
}
```

### Lazy Loading Strategy

**Lazy load heavy features:**

```typescript
// Lazy load visualization (only when needed)
const ReactFlowVisualization = lazy(() => import('./components/Visualization'));

// Lazy load comparison (rarely used)
const ResultsComparison = lazy(() => import('./components/results/ResultsComparison'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <ReactFlowVisualization />
</Suspense>
```

**Candidates for lazy loading:**
- ReactFlow visualization (~200KB)
- Argdown (if/when implemented)
- PDF generation libraries (if added)
- Advanced comparison features

### Tree-Shaking Optimization

**Ensure proper imports:**

❌ **Don't do this:**
```typescript
import * as RadixUI from '@radix-ui/react-accordion';
```

✅ **Do this:**
```typescript
import * as Accordion from '@radix-ui/react-accordion';
```

**Check unused exports:**
```bash
npm run build:analyze
# Look for grayed-out code in treemap
```

### Dependency Optimization

**Review large dependencies:**
```bash
# Analyze node_modules size
du -sh node_modules/*  | sort -h | tail -20

# Or on Windows PowerShell:
Get-ChildItem node_modules | ForEach-Object {
  [PSCustomObject]@{
    Name = $_.Name
    Size = (Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
  }
} | Sort-Object Size -Descending | Select-Object -First 20
```

**Consider alternatives:**
- Use `date-fns` instead of `moment` (if needed)
- Use native Web Crypto instead of large crypto libraries
- Avoid lodash (use native JS)

---

## PWA Configuration

### Setup

PWA configured in `vite.config.pwa.ts`:

```typescript
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'BenefitFinder',
    short_name: 'BenefitFinder',
    theme_color: '#2563eb',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [ /* icon definitions */ ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
    runtimeCaching: [ /* caching strategies */ ],
  },
})
```

### Build PWA

```bash
# Build with PWA enabled
npm run build:pwa

# Test PWA locally
npm run preview
```

### Verify PWA Installation

**Chrome DevTools:**
1. Open DevTools → Application tab
2. Check "Manifest" section
3. Check "Service Workers" section
4. Click "Add to Home Screen" should work

**Lighthouse:**
```bash
# Run Lighthouse PWA audit
lighthouse http://localhost:5173 --view --preset=desktop

# Or in Chrome DevTools: Lighthouse tab → PWA
```

**PWA checklist:**
- [ ] Web app manifest present
- [ ] Service worker registered
- [ ] HTTPS (or localhost for testing)
- [ ] Icons for all required sizes
- [ ] Installable
- [ ] Works offline

### Service Worker Caching

**Precache:** Static assets (HTML, CSS, JS)
**Runtime cache:** API responses (N/A for BenefitFinder - no APIs!)
**Strategy:** CacheFirst for all static assets

### Testing PWA Features

```typescript
// In E2E tests
test('should install as PWA', async ({ page, context }) => {
  await page.goto('/');

  // Check manifest
  const manifest = await page.evaluate(() => {
    const link = document.querySelector('link[rel="manifest"]');
    return link ? link.getAttribute('href') : null;
  });

  expect(manifest).toBeTruthy();

  // Check service worker
  const swRegistered = await page.evaluate(() => {
    return 'serviceWorker' in navigator;
  });

  expect(swRegistered).toBeTruthy();
});
```

---

## Database Performance

### Test with Large Datasets

**Run performance tests:**
```bash
npm run test:perf
```

**Tests include:**
- Insert performance (10, 100, 1000 records)
- Query performance (find, filter, sort)
- Large data serialization
- JSON operations

### Expected Results

| Operation | 10 Records | 100 Records | 1000 Records |
|-----------|------------|-------------|--------------|
| Insert | <50ms | <200ms | <1000ms |
| Find by ID | <5ms | <5ms | <10ms |
| Filter by state | <10ms | <20ms | <50ms |
| Sort by date | <10ms | <30ms | <100ms |

### Optimization Strategies

**1. Indexing**
```typescript
// In RxDB schema
indexes: ['evaluatedAt', 'qualifiedCount', 'state']
```

**2. Pagination**
```typescript
// Load results in batches
const results = await db.eligibility_results
  .find()
  .sort({ evaluatedAt: 'desc' })
  .limit(20)  // First page
  .exec();
```

**3. Lazy Loading**
```typescript
// Don't load full results until needed
const summaries = await db.eligibility_results
  .find()
  .select(['id', 'qualifiedCount', 'evaluatedAt'])
  .exec();
```

**4. Cleanup**
```typescript
// Delete old results automatically
const oldResults = await db.eligibility_results
  .find()
  .where('evaluatedAt')
  .lt(Date.now() - (365 * 24 * 60 * 60 * 1000)) // 1 year old
  .exec();

await Promise.all(oldResults.map(r => r.remove()));
```

---

## Low-End Device Testing

### Device Simulation

**Using Playwright:**

```bash
# Run tests on simulated low-end devices
npx playwright test --config=playwright.config.lowend.ts
```

**Configurations:**
- **Galaxy S5** - Low-end Android (2014 device)
- **Slow CPU** - 4x CPU throttling
- **Slow 3G** - Network throttling
- **Offline mode** - Complete offline testing

### Using Android Studio Emulator

**Setup:**

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK

2. **Create Low-End Emulator**
   ```
   Device: Pixel 2 or similar
   Android: 8.0 (Oreo) or 9.0 (Pie)
   CPU: 2 cores
   RAM: 1.5 GB
   Storage: 4 GB
   ```

3. **Start Emulator**
   ```bash
   # From Android Studio or command line:
   emulator -avd Pixel_2_API_28 -no-boot-anim
   ```

4. **Test App**
   - Open Chrome in emulator
   - Navigate to http://10.0.2.2:5173 (host machine)
   - Test all features

**Performance Settings:**
- Network: Slow 3G or 2G
- Latency: 300-500ms
- Download: 250 kbps
- Upload: 50 kbps

### Manual Testing Devices

**Recommended test devices:**
- Budget Android phone (Moto G, Samsung Galaxy A series)
- Older iPhone (iPhone 7 or 8)
- Library computers (often older Windows machines)
- Tablets (iPad Air 2, Android tablets)

**Test scenarios:**
- Cold start (first visit)
- Warm start (cached)
- Slow network (throttled)
- Offline mode (airplane mode)
- Low battery (power saver mode)

---

## Performance Monitoring

### Core Web Vitals

**What to measure:**

1. **Largest Contentful Paint (LCP)**
   - Target: <2.5s
   - Measures: Largest element render time
   - How: Chrome DevTools Performance tab

2. **First Input Delay (FID)**
   - Target: <100ms
   - Measures: Time until interactive
   - How: Real user monitoring

3. **Cumulative Layout Shift (CLS)**
   - Target: <0.1
   - Measures: Visual stability
   - How: Chrome DevTools Performance tab

### Measuring in Browser

**Chrome DevTools:**
```typescript
// In browser console
performance.measure('rule-eval');
performance.getEntriesByType('measure');
```

**Performance API:**
```typescript
const start = performance.now();
// ... operation ...
const end = performance.now();
console.log(`Operation took ${end - start}ms`);
```

**Performance Observer:**
```typescript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
```

### Lighthouse Audits

```bash
# Run Lighthouse
lighthouse http://localhost:5173 --view

# Or in Chrome DevTools: Lighthouse tab
```

**Categories:**
- Performance
- Accessibility
- Best Practices
- SEO
- PWA

**Targets:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- PWA: 100

---

## Optimization Techniques

### 1. Code Splitting

**Automatic:**
```typescript
// Vite automatically splits by route
import { lazy } from 'react';

const ResultsPage = lazy(() => import('./pages/Results'));
```

**Manual chunks:**
```typescript
// In vite.config.ts
manualChunks: {
  'vendor': ['react', 'react-dom'],
  'ui': ['@radix-ui/*'],
}
```

### 2. Image Optimization

**Use appropriate formats:**
- SVG for icons
- WebP for photos (with PNG fallback)
- Compress all images

**Lazy load images:**
```tsx
<img loading="lazy" src="..." alt="..." />
```

### 3. CSS Optimization

**Purge unused Tailwind:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Purges unused classes automatically
}
```

**Critical CSS:**
- Inline critical CSS in `<head>`
- Defer non-critical CSS

### 4. JavaScript Optimization

**Minimize dependencies:**
```typescript
// Don't import entire library
import debounce from 'lodash/debounce';  // ✓ Good
import { debounce } from 'lodash';       // ✗ Imports all of lodash
```

**Use native APIs:**
```typescript
// Use native instead of library
Array.from() // instead of lodash _.from()
Object.assign() // instead of lodash _.assign()
```

### 5. React Optimization

**Memo expensive components:**
```typescript
import { memo } from 'react';

export const ProgramCard = memo(({ result }) => {
  // Component code
});
```

**useMemo for expensive calculations:**
```typescript
const sortedResults = useMemo(() => {
  return results.sort((a, b) => b.confidence - a.confidence);
}, [results]);
```

**useCallback for stable functions:**
```typescript
const handleSave = useCallback(async () => {
  await saveResults(results);
}, [results, saveResults]);
```

### 6. Database Optimization

**Indexes:**
```typescript
indexes: ['evaluatedAt', 'qualifiedCount', 'state']
```

**Batch operations:**
```typescript
// Instead of multiple inserts
await Promise.all(results.map(r => db.insert(r)));

// Use bulk insert
await db.bulkInsert(results);
```

**Pagination:**
```typescript
const pageSize = 20;
const page = 1;

const results = await db.eligibility_results
  .find()
  .sort({ evaluatedAt: 'desc' })
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .exec();
```

---

## Bundle Size Optimization

### Analyze Current Bundle

```bash
npm run build:analyze
```

Opens `dist/stats.html` with interactive treemap showing:
- Size of each dependency
- Code splitting effectiveness
- Duplicate modules
- Large files

### Optimization Steps

**1. Review Dependencies**

Check `package.json` for large or unused dependencies:
```bash
# Analyze with webpack-bundle-analyzer alternative
npm install -g source-map-explorer
npm run build
source-map-explorer dist/assets/*.js
```

**2. Enable Compression**

Vite plugin for Brotli/Gzip:
```typescript
import viteCompression from 'vite-plugin-compression';

plugins: [
  viteCompression({
    algorithm: 'brotliCompress',
    ext: '.br',
  }),
  viteCompression({
    algorithm: 'gzip',
    ext: '.gz',
  }),
]
```

**3. Configure Minification**

```typescript
build: {
  minify: 'esbuild', // Faster than terser
  terserOptions: {
    compress: {
      drop_console: true, // Remove console.log in production
      drop_debugger: true,
    },
  },
}
```

**4. Remove Source Maps in Production**

```typescript
build: {
  sourcemap: false, // Reduces bundle size significantly
}
```

---

## PWA Configuration

### Manifest Configuration

**File:** `vite.config.pwa.ts`

**Required icons:**
- `pwa-64x64.png` (64x64)
- `pwa-192x192.png` (192x192)
- `pwa-512x512.png` (512x512)
- `maskable-icon-512x512.png` (512x512, maskable)

**Generate icons:**
```bash
# From a source SVG or PNG, generate all sizes
# Use online tools like https://realfavicongenerator.net/
# Or use sharp/imagemagick
```

### Service Worker

**Caching strategy:**
- **Precache:** HTML, CSS, JS, images (everything needed offline)
- **Runtime cache:** None (no external APIs!)
- **Fallback:** Show offline page if needed

**Update strategy:**
```typescript
skipWaiting: true,      // Update immediately
clientsClaim: true,     // Take control immediately
```

### Testing PWA Installation

**Chrome (Desktop):**
1. Visit app at localhost or HTTPS
2. Look for install icon in address bar
3. Click to install
4. Verify app opens in standalone window

**Chrome (Android):**
1. Visit app on mobile
2. Tap menu → "Add to Home Screen"
3. Verify icon appears on home screen
4. Tap icon, app opens without browser UI

**iOS (Safari):**
1. Visit app in Safari
2. Tap Share → "Add to Home Screen"
3. Verify icon on home screen
4. Works offline (with caveats - iOS limitations)

**Verification test:**
```bash
# Run PWA-specific tests
npm run test:e2e -- --grep "PWA"
```

---

## Database Performance

### Test with Large Datasets

```bash
npm run test:perf
```

**Tests:**
- Insert 10, 100, 1000 records
- Query by ID, filter, sort
- JSON serialization
- Memory usage

### Generating Test Data

**Script:** `scripts/database-performance.ts`

```typescript
// Generate test results
for (let i = 0; i < 1000; i++) {
  await db.eligibility_results.insert({
    id: nanoid(),
    results: { /* ... */ },
    evaluatedAt: Date.now(),
    // ...
  });
}
```

### Performance Monitoring

**Track operations:**
```typescript
const start = performance.now();
await db.eligibility_results.find().exec();
const queryTime = performance.now() - start;

if (queryTime > 100) {
  console.warn(`Slow query: ${queryTime}ms`);
}
```

### Optimization

**1. Limit result size:**
```typescript
// Only load what's needed
.select(['id', 'qualifiedCount', 'evaluatedAt'])
```

**2. Use indexes:**
```typescript
// Fast (uses index)
.where('evaluatedAt').gt(timestamp)

// Slow (no index)
.where('notes').regex(/keyword/)
```

**3. Batch updates:**
```typescript
await db.bulkUpdate(updates);
```

---

## Low-End Device Testing

### Using Playwright Low-End Config

```bash
npx playwright test --config=playwright.config.lowend.ts
```

**Projects configured:**
- `low-end-android` - Galaxy S5 simulation
- `low-end-desktop` - Older desktop
- `slow-network` - Slow 3G
- `offline-mode` - Complete offline

### Using Android Studio Emulator

**Create emulator:**
```bash
# List available system images
sdkmanager --list | grep system-images

# Create AVD (Android Virtual Device)
avdmanager create avd -n LowEnd_Test -k "system-images;android-28;google_apis;x86_64" -d pixel_2

# Start emulator
emulator -avd LowEnd_Test
```

**Configure low-end settings:**
- RAM: 1.5 GB
- VM Heap: 128 MB
- Internal Storage: 2 GB
- SD Card: None
- CPU Cores: 2

**Network throttling:**
- Settings → Network → Throttling → Slow 3G
- Or use Chrome DevTools on desktop

### Test Checklist

**On low-end device:**
- [ ] App loads without timeout
- [ ] Questionnaire is responsive
- [ ] Results display without lag
- [ ] Scrolling is smooth (30+ FPS)
- [ ] Buttons respond immediately
- [ ] No crashes or freezes
- [ ] Offline mode works
- [ ] Installation works

---

## Performance Monitoring

### Core Web Vitals Tracking

**Implement in app:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Log locally (no external analytics!)
  console.log(metric.name, metric.value);

  // Could save to localStorage for debugging
  const metrics = JSON.parse(localStorage.getItem('perf_metrics') || '[]');
  metrics.push(metric);
  localStorage.setItem('perf_metrics', JSON.stringify(metrics.slice(-100)));
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Budget

**Set limits:**
```typescript
// In vite.config.ts
build: {
  chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
}
```

**Monitor in CI:**
```yaml
# GitHub Actions
- name: Check bundle size
  run: |
    npm run build
    SIZE=$(du -sb dist | cut -f1)
    if [ $SIZE -gt 1048576 ]; then
      echo "Bundle too large: $SIZE bytes"
      exit 1
    fi
```

---

## Optimization Checklist

### Before Launch

**Bundle Size:**
- [ ] Total bundle <600KB (gzipped)
- [ ] Initial load <200KB
- [ ] Lazy load visualization libraries
- [ ] Tree-shaking enabled
- [ ] Minification enabled
- [ ] Source maps disabled in production

**Performance:**
- [ ] FCP <1.8s
- [ ] TTI <3.8s
- [ ] Rule evaluation <100ms
- [ ] Database queries <100ms
- [ ] No memory leaks

**PWA:**
- [ ] Manifest configured
- [ ] Service worker registered
- [ ] Offline mode works
- [ ] Installable
- [ ] Icons generated

**Database:**
- [ ] Indexed fields defined
- [ ] Pagination implemented
- [ ] Cleanup strategy defined
- [ ] Performance tested with 1000+ records

**Testing:**
- [ ] All E2E tests pass
- [ ] Accessibility tests pass
- [ ] Performance tests pass
- [ ] Low-end device tested
- [ ] Offline functionality verified

---

## Continuous Monitoring

### Development

**Watch bundle size:**
```bash
npm run build:analyze
# Review stats.html after each build
```

**Monitor performance:**
```bash
npm run test:perf
# Run before commits
```

### Production

**User metrics** (optional, privacy-preserving):
```typescript
// Store locally only, user consent required
interface PerformanceMetrics {
  pageLoadTime: number;
  ruleEvalTime: number;
  renderTime: number;
  device: string;
  timestamp: number;
}

// Save to localStorage (never send to server)
localStorage.setItem('perf_metrics', JSON.stringify(metrics));
```

---

## Troubleshooting

### Bundle Too Large

**Identify culprits:**
```bash
npm run build:analyze
```

**Solutions:**
- Lazy load heavy features
- Remove unused dependencies
- Use lighter alternatives
- Code split more aggressively

### Slow Rule Evaluation

**Profile:**
```typescript
console.time('rule-eval');
jsonLogic.apply(rule, data);
console.timeEnd('rule-eval');
```

**Solutions:**
- Simplify complex rules
- Cache evaluation results
- Evaluate in parallel (Web Workers)

### Slow Database Operations

**Profile:**
```typescript
console.time('db-query');
const results = await db.find().exec();
console.timeEnd('db-query');
```

**Solutions:**
- Add indexes
- Use pagination
- Limit returned fields
- Optimize queries

### Memory Leaks

**Detect:**
```typescript
// Chrome DevTools → Memory → Take heap snapshot
// Compare before/after operations
```

**Common causes:**
- Event listeners not removed
- Intervals not cleared
- Large objects in closures
- Refs not cleaned up

**Solutions:**
```typescript
useEffect(() => {
  const listener = () => {};
  window.addEventListener('event', listener);

  return () => {
    window.removeEventListener('event', listener);
  };
}, []);
```

---

## Performance Testing Commands

### Quick Reference

```bash
# Analyze bundle
npm run build:analyze

# Run performance tests
npm run test:perf

# E2E performance tests
npx playwright test tests/e2e/performance.e2e.ts

# Low-end device tests
npx playwright test --config=playwright.config.lowend.ts

# Lighthouse audit
lighthouse http://localhost:5173 --view
```

---

## Success Criteria

### Must Meet Before Launch

- ✅ Bundle size <600KB (gzipped)
- ✅ Page load <3s on slow 3G
- ✅ Rule evaluation <100ms
- ✅ Works on 2018+ devices
- ✅ Lighthouse performance >80
- ✅ PWA installable
- ✅ Offline mode functional
- ✅ No critical performance issues

---

## Resources

### Tools

- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **WebPageTest**: https://www.webpagetest.org/
- **Chrome DevTools**: Built into Chrome
- **Rollup Visualizer**: Included in build:analyze
- **Playwright**: For E2E performance tests

### References

- **Web Vitals**: https://web.dev/vitals/
- **PWA Guide**: https://web.dev/progressive-web-apps/
- **Vite Performance**: https://vitejs.dev/guide/build.html
- **React Performance**: https://react.dev/learn/render-and-commit

---

## Summary

Performance testing ensures BenefitFinder works well for all users, especially:
- Those on budget devices
- Those with slow internet
- Those in low-connectivity areas
- Those who need offline access

**All features work offline, load quickly, and perform well on low-end devices!**

---

**Questions?** Check test files or open a GitHub issue.

