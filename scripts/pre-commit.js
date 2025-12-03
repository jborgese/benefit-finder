#!/usr/bin/env node

import { execSync } from 'child_process';

function runValidatorStrict() {
  try {
    // Cross-platform way to set env var for Node.js
    execSync(
      process.platform === 'win32'
        ? 'set VALIDATOR_STRICT=1 && npm run validate-rules'
        : 'VALIDATOR_STRICT=1 npm run validate-rules',
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.error('❌ Rule validation failed:', error.message);
    process.exit(1);
  }
}

function runLintStaged() {
  try {
    execSync('npx lint-staged', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Pre-commit checks failed:', error.message);
    process.exit(1);
  }
}

runValidatorStrict();
runLintStaged();
