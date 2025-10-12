/**
 * Rule Validation and Testing Utility
 *
 * This script validates rule files and runs their embedded test cases.
 * Usage:
 *   npm run validate-rules [filepath]
 *   npm run validate-rules src/rules/examples/snap-federal-rules.json
 *   npm run validate-rules  (validates all rules in examples/)
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { validateRulePackage } from '../src/rules/schema';
import type { RulePackage, RuleDefinition } from '../src/rules/schema';
import jsonLogic from 'json-logic-js';

// ============================================================================
// TYPES
// ============================================================================

interface ValidationReport {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  ruleCount: number;
  testResults?: TestSuiteReport;
}

interface TestSuiteReport {
  totalRules: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  ruleResults: RuleTestReport[];
}

interface RuleTestReport {
  ruleId: string;
  ruleName: string;
  testsPassed: number;
  testsFailed: number;
  failures: TestFailure[];
}

interface TestFailure {
  testId: string;
  description: string;
  expected: unknown;
  actual: unknown;
  error?: string;
}

// ============================================================================
// COLORS (for terminal output)
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Load and parse a rule package file
 */
function loadRulePackage(filepath: string): RulePackage | null {
  try {
    const content = readFileSync(filepath, 'utf-8');
    return JSON.parse(content) as RulePackage;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to load file: ${filepath}`);
    console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Validate a rule package structure
 */
function validatePackageStructure(pkg: RulePackage, filepath: string): ValidationReport {
  const report: ValidationReport = {
    file: filepath,
    valid: true,
    errors: [],
    warnings: [],
    ruleCount: 0,
  };

  // Validate using Zod schema
  const validationResult = validateRulePackage(pkg);

  if (!validationResult.success) {
    report.valid = false;
    validationResult.error.errors.forEach((err) => {
      const path = err.path.join('.');
      report.errors.push(`${path}: ${err.message}`);
    });
  }

  // Additional validation checks
  if (pkg.rules) {
    report.ruleCount = pkg.rules.length;

    // Check for duplicate rule IDs
    const ruleIds = new Set<string>();
    pkg.rules.forEach((rule) => {
      if (ruleIds.has(rule.id)) {
        report.errors.push(`Duplicate rule ID: ${rule.id}`);
        report.valid = false;
      }
      ruleIds.add(rule.id);
    });

    // Check for missing citations
    pkg.rules.forEach((rule) => {
      if (!rule.citations || rule.citations.length === 0) {
        report.warnings.push(`Rule ${rule.id} has no citations`);
      }
    });

    // Check for rules without test cases
    pkg.rules.forEach((rule) => {
      if (!rule.testCases || rule.testCases.length === 0) {
        report.warnings.push(`Rule ${rule.id} has no test cases`);
      }
    });

    // Check for draft rules that are active
    pkg.rules.forEach((rule) => {
      if (rule.draft && rule.active) {
        report.warnings.push(`Rule ${rule.id} is marked as both draft and active`);
      }
    });
  }

  return report;
}

/**
 * Test a single rule's logic with its test cases
 */
function testRule(rule: RuleDefinition): RuleTestReport {
  const report: RuleTestReport = {
    ruleId: rule.id,
    ruleName: rule.name,
    testsPassed: 0,
    testsFailed: 0,
    failures: [],
  };

  if (!rule.testCases || rule.testCases.length === 0) {
    return report;
  }

  rule.testCases.forEach((testCase) => {
    try {
      const result = jsonLogic.apply(rule.ruleLogic, testCase.input);

      if (result === testCase.expected) {
        report.testsPassed++;
      } else {
        report.testsFailed++;
        report.failures.push({
          testId: testCase.id,
          description: testCase.description,
          expected: testCase.expected,
          actual: result,
        });
      }
    } catch (error) {
      report.testsFailed++;
      report.failures.push({
        testId: testCase.id,
        description: testCase.description,
        expected: testCase.expected,
        actual: undefined,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return report;
}

/**
 * Test all rules in a package
 */
function testRulePackage(pkg: RulePackage): TestSuiteReport {
  const report: TestSuiteReport = {
    totalRules: pkg.rules.length,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    ruleResults: [],
  };

  pkg.rules.forEach((rule) => {
    const ruleReport = testRule(rule);
    report.ruleResults.push(ruleReport);
    report.totalTests += ruleReport.testsPassed + ruleReport.testsFailed;
    report.passedTests += ruleReport.testsPassed;
    report.failedTests += ruleReport.testsFailed;
  });

  return report;
}

// ============================================================================
// REPORTING FUNCTIONS
// ============================================================================

/**
 * Print validation report
 */
function printValidationReport(report: ValidationReport) {
  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}File: ${colors.cyan}${report.file}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

  // Overall status
  if (report.valid && report.errors.length === 0) {
    console.log(`${colors.green}✓${colors.reset} ${colors.bright}Structure: VALID${colors.reset}`);
  } else {
    console.log(`${colors.red}✗${colors.reset} ${colors.bright}Structure: INVALID${colors.reset}`);
  }

  console.log(`  Rules: ${report.ruleCount}`);

  // Errors
  if (report.errors.length > 0) {
    console.log(`\n${colors.red}Errors (${report.errors.length}):${colors.reset}`);
    report.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  // Warnings
  if (report.warnings.length > 0) {
    console.log(`\n${colors.yellow}Warnings (${report.warnings.length}):${colors.reset}`);
    report.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  }

  // Test results
  if (report.testResults) {
    printTestReport(report.testResults);
  }
}

/**
 * Print test report
 */
function printTestReport(report: TestSuiteReport) {
  console.log(`\n${colors.bright}Test Results:${colors.reset}`);
  console.log(`  Total Rules: ${report.totalRules}`);
  console.log(`  Total Tests: ${report.totalTests}`);

  if (report.failedTests === 0) {
    console.log(`  ${colors.green}✓ All tests passed (${report.passedTests}/${report.totalTests})${colors.reset}`);
  } else {
    console.log(`  ${colors.green}✓ Passed: ${report.passedTests}${colors.reset}`);
    console.log(`  ${colors.red}✗ Failed: ${report.failedTests}${colors.reset}`);
  }

  // Show failed tests
  const failedRules = report.ruleResults.filter((r) => r.testsFailed > 0);
  if (failedRules.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    failedRules.forEach((ruleReport) => {
      console.log(`\n  ${colors.bright}${ruleReport.ruleName}${colors.reset} (${ruleReport.ruleId})`);
      ruleReport.failures.forEach((failure) => {
        console.log(`    ${colors.red}✗${colors.reset} ${failure.description}`);
        console.log(`      Test ID: ${failure.testId}`);
        console.log(`      Expected: ${JSON.stringify(failure.expected)}`);
        console.log(`      Actual: ${JSON.stringify(failure.actual)}`);
        if (failure.error) {
          console.log(`      Error: ${failure.error}`);
        }
      });
    });
  }
}

/**
 * Print summary of all validated files
 */
function printSummary(reports: ValidationReport[]) {
  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

  const totalFiles = reports.length;
  const validFiles = reports.filter((r) => r.valid && r.errors.length === 0).length;
  const filesWithWarnings = reports.filter((r) => r.warnings.length > 0).length;
  const totalRules = reports.reduce((sum, r) => sum + r.ruleCount, 0);
  const totalTests = reports.reduce((sum, r) => sum + (r.testResults?.totalTests || 0), 0);
  const passedTests = reports.reduce((sum, r) => sum + (r.testResults?.passedTests || 0), 0);
  const failedTests = reports.reduce((sum, r) => sum + (r.testResults?.failedTests || 0), 0);

  console.log(`Files: ${validFiles}/${totalFiles} valid`);
  if (filesWithWarnings > 0) {
    console.log(`Warnings: ${filesWithWarnings} file(s) with warnings`);
  }
  console.log(`Rules: ${totalRules} total`);
  console.log(`Tests: ${passedTests}/${totalTests} passed`);

  if (validFiles === totalFiles && failedTests === 0) {
    console.log(`\n${colors.green}${colors.bright}✓ All validations passed!${colors.reset}\n`);
  } else if (validFiles < totalFiles) {
    console.log(`\n${colors.red}${colors.bright}✗ Some validations failed${colors.reset}\n`);
  } else if (failedTests > 0) {
    console.log(`\n${colors.yellow}${colors.bright}⚠ Structure valid but tests failed${colors.reset}\n`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  let filesToValidate: string[] = [];

  if (args.length === 0) {
    // Validate all rules in examples directory
    const examplesDir = join(process.cwd(), 'src', 'rules', 'examples');
    try {
      const files = readdirSync(examplesDir).filter((f) => f.endsWith('.json'));
      filesToValidate = files.map((f) => join(examplesDir, f));
    } catch (error) {
      console.error(`${colors.red}Failed to read examples directory${colors.reset}`);
      process.exit(1);
    }
  } else {
    // Validate specified file
    filesToValidate = args;
  }

  if (filesToValidate.length === 0) {
    console.log(`${colors.yellow}No rule files found to validate${colors.reset}`);
    process.exit(0);
  }

  console.log(`${colors.bright}Validating ${filesToValidate.length} rule file(s)...${colors.reset}`);

  const reports: ValidationReport[] = [];

  filesToValidate.forEach((filepath) => {
    const pkg = loadRulePackage(filepath);
    if (!pkg) {
      reports.push({
        file: filepath,
        valid: false,
        errors: ['Failed to load file'],
        warnings: [],
        ruleCount: 0,
      });
      return;
    }

    const report = validatePackageStructure(pkg, filepath);

    // Run tests if validation passed
    if (report.valid) {
      report.testResults = testRulePackage(pkg);
    }

    reports.push(report);
    printValidationReport(report);
  });

  // Print summary if multiple files
  if (reports.length > 1) {
    printSummary(reports);
  }

  // Exit with error code if any validation failed
  const hasErrors = reports.some((r) => !r.valid || r.errors.length > 0 || (r.testResults && r.testResults.failedTests > 0));
  process.exit(hasErrors ? 1 : 0);
}

export { validatePackageStructure, testRulePackage, ValidationReport, TestSuiteReport };

// Run main function
main();

