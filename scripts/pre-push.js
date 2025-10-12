#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔍 Running pre-push checks...');

// Get list of changed files
function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    // If we can't get changed files, return empty array
    return [];
  }
}

// Determine which tests to run based on changed files
function determineTestScope(changedFiles) {
  const hasSourceChanges = changedFiles.some(file => 
    file.startsWith('src/') && !file.includes('.test.') && !file.includes('.spec.')
  );
  
  const hasTestChanges = changedFiles.some(file => 
    file.includes('.test.') || file.includes('.spec.') || file.includes('.e2e.')
  );
  
  const hasConfigChanges = changedFiles.some(file => 
    file.includes('package.json') || file.includes('vite.config') || file.includes('playwright.config')
  );
  
  const hasRuleChanges = changedFiles.some(file => 
    file.includes('src/rules/') && file.endsWith('.json')
  );

  return {
    runUnitTests: hasSourceChanges || hasTestChanges || hasConfigChanges,
    runE2ETests: hasSourceChanges || hasTestChanges || hasConfigChanges,
    runA11yTests: hasSourceChanges || hasTestChanges || hasConfigChanges,
    runRuleValidation: hasRuleChanges || hasConfigChanges,
    changedFiles
  };
}

// Smart test execution based on changes
function runSmartTests(scope) {
  const commands = [
    { name: '📝 Linting...', cmd: 'npm run lint', always: true },
    { name: '✅ Type checking...', cmd: 'npx tsc --noEmit', always: true }
  ];

  if (scope.runRuleValidation) {
    commands.push({ name: '🔧 Validating rules...', cmd: 'npm run validate-rules' });
  }

  if (scope.runUnitTests) {
    if (scope.changedFiles.length > 0) {
      // Run only tests related to changed files
      commands.push({ name: '🧪 Running related unit tests...', cmd: 'npm run test:run -- --related' });
    } else {
      commands.push({ name: '🧪 Running unit tests...', cmd: 'npm run test:run' });
    }
  }

  // For E2E tests, we'll run a subset based on changes
  if (scope.runE2ETests) {
    const e2eTestFiles = scope.changedFiles.filter(file => file.includes('.e2e.'));
    if (e2eTestFiles.length > 0) {
      // Run specific E2E test files that changed
      const testArgs = e2eTestFiles.map(file => `tests/e2e/${file.split('/').pop()}`).join(' ');
      commands.push({ name: '🎭 Running changed E2E tests...', cmd: `npm run test:e2e -- ${testArgs}` });
    } else {
      // Run core E2E tests (faster subset)
      commands.push({ name: '🎭 Running core E2E tests...', cmd: 'npm run test:e2e -- --project=chromium --grep="should load successfully|should display main content"' });
    }
  }

  if (scope.runA11yTests && scope.changedFiles.some(f => f.includes('components/') || f.includes('src/'))) {
    commands.push({ name: '♿ Running accessibility tests...', cmd: 'npm run test:a11y -- --project=a11y' });
  }

  return commands;
}

try {
  const changedFiles = getChangedFiles();
  console.log(`📋 Changed files: ${changedFiles.length > 0 ? changedFiles.join(', ') : 'None detected'}`);
  
  const scope = determineTestScope(changedFiles);
  const commands = runSmartTests(scope);
  
  console.log(`🎯 Test scope: Unit=${scope.runUnitTests}, E2E=${scope.runE2ETests}, A11y=${scope.runA11yTests}, Rules=${scope.runRuleValidation}`);

  for (const { name, cmd } of commands) {
    console.log(name);
    execSync(cmd, { stdio: 'inherit' });
  }
  
  console.log('✨ All checks passed! Pushing...');
} catch (error) {
  console.error('❌ Pre-push checks failed:', error.message);
  process.exit(1);
}
