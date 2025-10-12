#!/usr/bin/env node

/**
 * Smart Test Runner - Runs tests related to changed files
 *
 * This script analyzes git changes and runs only the relevant tests:
 * - Unit tests for changed source files
 * - E2E tests for changed components/pages
 * - Rule validation for changed rule files
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Get changed files from git
function getChangedFiles() {
  try {
    // Get files changed in the last commit
    const output = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    console.warn('⚠️  Could not determine changed files, running all tests');
    return [];
  }
}

// Map source files to their test files
function findRelatedTests(changedFiles) {
  const unitTests = new Set();
  const e2eTests = new Set();
  let needsRuleValidation = false;

  for (const file of changedFiles) {
    // Skip test files themselves
    if (file.includes('.test.') || file.includes('.spec.') || file.includes('.e2e.')) {
      continue;
    }

    // Unit tests for source files
    if (file.startsWith('src/') && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      // Find corresponding test file in same directory
      const testFile = file.replace(/\.(ts|tsx)$/, '.test.$1');
      if (existsSync(testFile)) {
        unitTests.add(testFile);
      }

      // Also check for spec files
      const specFile = file.replace(/\.(ts|tsx)$/, '.spec.$1');
      if (existsSync(specFile)) {
        unitTests.add(specFile);
      }

      // Check for tests in __tests__ directory
      const dir = file.substring(0, file.lastIndexOf('/'));
      const fileName = file.substring(file.lastIndexOf('/') + 1);
      const testInTestsDir = `${dir}/__tests__/${fileName.replace(/\.(ts|tsx)$/, '.test.$1')}`;
      if (existsSync(testInTestsDir)) {
        unitTests.add(testInTestsDir);
      }
    }

    // E2E tests for components/pages
    if (file.startsWith('src/') && file.includes('components/')) {
      e2eTests.add('tests/e2e/components.e2e.ts');
    }
    if (file.startsWith('src/') && file.includes('questionnaire/')) {
      e2eTests.add('tests/e2e/questionnaire-flow.e2e.ts');
    }
    if (file.startsWith('src/') && file.includes('results/')) {
      e2eTests.add('tests/e2e/results-display.e2e.ts');
      e2eTests.add('tests/e2e/results-export-import.e2e.ts');
    }

    // Rule validation
    if (file.includes('src/rules/') && file.endsWith('.json')) {
      needsRuleValidation = true;
    }
  }

  return {
    unitTests: Array.from(unitTests),
    e2eTests: Array.from(e2eTests),
    needsRuleValidation
  };
}

// Run tests
async function runTests(testPlan) {
  const results = { unit: true, e2e: true, rules: true };

  console.log('🧪 Running related tests...\n');

  // Unit tests
  if (testPlan.unitTests.length > 0) {
    console.log(`📝 Unit tests: ${testPlan.unitTests.join(', ')}`);
    try {
      execSync(`npm run test:run -- ${testPlan.unitTests.join(' ')}`, { stdio: 'inherit' });
      console.log('✅ Unit tests passed\n');
    } catch {
      console.error('❌ Unit tests failed\n');
      results.unit = false;
    }
  } else {
    console.log('⏭️  No related unit tests found\n');
  }

  // E2E tests
  if (testPlan.e2eTests.length > 0) {
    const existingE2ETests = testPlan.e2eTests.filter(test => existsSync(test));
    if (existingE2ETests.length > 0) {
      console.log(`🎭 E2E tests: ${existingE2ETests.join(', ')}`);
      try {
        execSync(`npm run test:e2e -- ${existingE2ETests.join(' ')}`, { stdio: 'inherit' });
        console.log('✅ E2E tests passed\n');
      } catch {
        console.error('❌ E2E tests failed\n');
        results.e2e = false;
      }
    } else {
      console.log('⏭️  Related E2E test files not found\n');
    }
  } else {
    console.log('⏭️  No related E2E tests found\n');
  }

  // Rule validation
  if (testPlan.needsRuleValidation) {
    console.log('🔧 Validating rules...');
    try {
      execSync('npm run validate-rules', { stdio: 'inherit' });
      console.log('✅ Rule validation passed\n');
    } catch {
      console.error('❌ Rule validation failed\n');
      results.rules = false;
    }
  } else {
    console.log('⏭️  No rule validation needed\n');
  }

  return results;
}

// Main execution
async function main() {
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('ℹ️  No changed files detected, running all tests');
    execSync('npm run test:run', { stdio: 'inherit' });
    return;
  }

  console.log(`📋 Changed files: ${changedFiles.join(', ')}\n`);

  const testPlan = findRelatedTests(changedFiles);

  if (testPlan.unitTests.length === 0 && testPlan.e2eTests.length === 0 && !testPlan.needsRuleValidation) {
    console.log('ℹ️  No related tests found for changed files');
    return;
  }

  const results = await runTests(testPlan);

  const allPassed = results.unit && results.e2e && results.rules;

  if (allPassed) {
    console.log('🎉 All related tests passed!');
  } else {
    console.error('💥 Some tests failed');
    process.exit(1);
  }
}

main().catch(console.error);
