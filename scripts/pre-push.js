#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔍 Running pre-push checks...');

const commands = [
  { name: '📝 Linting...', cmd: 'npm run lint' },
  { name: '✅ Type checking...', cmd: 'npx tsc --noEmit' },
  { name: '🔧 Validating rules...', cmd: 'npm run validate-rules' },
  { name: '🧪 Running unit tests...', cmd: 'npm run test:run' },
  { name: '🎭 Running E2E tests...', cmd: 'npm run test:e2e' },
  { name: '♿ Running accessibility tests...', cmd: 'npm run test:a11y' }
];

try {
  for (const { name, cmd } of commands) {
    console.log(name);
    execSync(cmd, { stdio: 'inherit' });
  }
  console.log('✨ All checks passed! Pushing...');
} catch (error) {
  console.error('❌ Pre-push checks failed:', error.message);
  process.exit(1);
}
