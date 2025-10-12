#!/usr/bin/env node

import { execSync } from 'child_process';

try {
  execSync('npx lint-staged', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Pre-commit checks failed:', error.message);
  process.exit(1);
}
