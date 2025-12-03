#!/usr/bin/env node
// Fails if any rule is missing a citation
import { execSync } from 'child_process';

try {
  // Run the validator and capture output
  const output = execSync(
    process.platform === 'win32'
      ? 'set VALIDATOR_STRICT=0 && npm run validate-rules'
      : 'VALIDATOR_STRICT=0 npm run validate-rules',
    { encoding: 'utf-8' }
  );

  // Look for citation warnings in output
  const missingCitationRegex = /Rule (\S+) has no citations/;
  if (missingCitationRegex.test(output)) {
    console.error('❌ One or more rules are missing citations.');
    process.exit(1);
  } else {
    console.log('✅ All rules have citations.');
  }
} catch (error) {
  console.error('❌ Rule validation failed:', error.message);
  process.exit(1);
}
