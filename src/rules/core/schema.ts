/**
 * Rule Schema Definitions
 *
 * Defines comprehensive schemas for benefit eligibility rules
 * including metadata, versioning, and documentation.
 */

import { z } from 'zod';
import { JsonLogicRuleSchema } from './validator';

// ============================================================================
// METADATA SCHEMAS
// ============================================================================

/**
 * Rule author information
 */
export const RuleAuthorSchema = z.object({
  name: z.string().min(1).max(100).describe('Author name'),
  email: z.string().email().optional().describe('Author email'),
  organization: z.string().max(200).optional().describe('Organization'),
});

export type RuleAuthor = z.infer<typeof RuleAuthorSchema>;

/**
 * Rule citation/source information
 */
export const RuleCitationSchema = z.object({
  title: z.string().min(1).max(500).describe('Citation title'),
  url: z.string().url().optional().describe('Source URL'),
  document: z.string().max(200).optional().describe('Document reference'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Citation date (YYYY-MM-DD)'),
  legalReference: z.string().max(200).optional().describe('Legal citation (e.g., CFR, USC)'),
  notes: z.string().max(1000).optional().describe('Additional notes'),
});

export type RuleCitation = z.infer<typeof RuleCitationSchema>;

/**
 * Rule versioning information
 */
export const RuleVersionSchema = z.object({
  major: z.number().int().nonnegative().describe('Major version number'),
  minor: z.number().int().nonnegative().describe('Minor version number'),
  patch: z.number().int().nonnegative().describe('Patch version number'),
  label: z.string().max(50).optional().describe('Version label (e.g., "beta", "draft")'),
});

export type RuleVersion = z.infer<typeof RuleVersionSchema>;

/**
 * Rule change information
 */
export const RuleChangeSchema = z.object({
  version: RuleVersionSchema.describe('Version when change was made'),
  date: z.number().positive().describe('Change timestamp'),
  author: z.string().max(100).describe('Who made the change'),
  description: z.string().min(1).max(1000).describe('Description of change'),
  breaking: z.boolean().optional().describe('Is this a breaking change?'),
});

export type RuleChange = z.infer<typeof RuleChangeSchema>;

// ============================================================================
// RULE DEFINITION SCHEMA
// ============================================================================

/**
 * Document requirement definition
 */
export const DocumentRequirementSchema = z.object({
  id: z.string().min(1).max(100).describe('Document identifier'),
  name: z.string().min(1).max(200).describe('Document name'),
  description: z.string().max(500).optional().describe('Document description'),
  required: z.boolean().describe('Is this document required?'),
  alternatives: z.array(z.string().max(200)).optional().describe('Alternative documents'),
  where: z.string().max(500).optional().describe('Where to obtain document'),
});

export type DocumentRequirement = z.infer<typeof DocumentRequirementSchema>;

/**
 * Next step after eligibility determination
 */
export const NextStepSchema = z.object({
  step: z.string().min(1).max(500).describe('Step description'),
  url: z.string().url().optional().describe('URL for this step'),
  priority: z.enum(['high', 'medium', 'low']).optional().describe('Step priority'),
  estimatedTime: z.string().max(100).optional().describe('Estimated time to complete'),
});

export type NextStep = z.infer<typeof NextStepSchema>;

/**
 * Rule test case (embedded in rule definition)
 */
export const EmbeddedTestCaseSchema = z.object({
  id: z.string().min(1).max(100).describe('Test case identifier'),
  description: z.string().min(1).max(500).describe('Test description'),
  input: z.record(z.unknown()).describe('Test input data'),
  expected: z.unknown().describe('Expected result'),
  tags: z.array(z.string().max(50)).optional().describe('Test tags'),
});

export type EmbeddedTestCase = z.infer<typeof EmbeddedTestCaseSchema>;

/**
 * Comprehensive rule definition schema
 */
export const RuleDefinitionSchema = z.object({
  // Identification
  id: z.string().min(1).max(128).describe('Unique rule identifier'),
  programId: z.string().min(1).max(128).describe('Associated program ID'),
  name: z.string().min(1).max(200).describe('Rule name'),
  description: z.string().max(2000).optional().describe('Rule description'),

  // Rule Logic
  ruleLogic: JsonLogicRuleSchema.describe('JSON Logic rule'),
  ruleType: z.enum(['eligibility', 'benefit_amount', 'document_requirements', 'conditional'])
    .optional()
    .describe('Type of rule'),

  // Human-readable explanation
  explanation: z.string().max(2000).optional().describe('Plain language explanation'),

  // Required data
  requiredFields: z.array(z.string().max(100))
    .optional()
    .describe('Profile fields needed for evaluation'),

  // Documents
  requiredDocuments: z.array(DocumentRequirementSchema)
    .optional()
    .describe('Required documents'),

  // Next steps
  nextSteps: z.array(NextStepSchema)
    .optional()
    .describe('Next steps after eligibility'),

  // Versioning
  version: RuleVersionSchema.describe('Rule version'),
  effectiveDate: z.number().positive().optional().describe('When rule becomes effective'),
  expirationDate: z.number().positive().optional().describe('When rule expires'),
  supersedes: z.string().max(128).optional().describe('Previous rule ID this replaces'),

  // Source & Attribution
  author: RuleAuthorSchema.optional().describe('Rule author'),
  citations: z.array(RuleCitationSchema).optional().describe('Rule sources and citations'),
  source: z.string().url().optional().describe('Primary source URL'),
  legalReference: z.string().max(200).optional().describe('Legal citation'),

  // Status & Priority
  active: z.boolean().describe('Is rule currently active'),
  draft: z.boolean().optional().describe('Is this a draft rule'),
  priority: z.number().int().nonnegative().optional().describe('Rule priority (higher = evaluated first)'),

  // Testing
  testCases: z.array(EmbeddedTestCaseSchema)
    .optional()
    .describe('Test cases for validation'),

  // Change tracking
  changelog: z.array(RuleChangeSchema)
    .optional()
    .describe('Version history'),

  // Metadata
  createdAt: z.number().positive().describe('Creation timestamp'),
  updatedAt: z.number().positive().describe('Last update timestamp'),
  createdBy: z.string().max(100).optional().describe('Creator identifier'),

  // Tags & Organization
  tags: z.array(z.string().max(50)).optional().describe('Rule tags'),
  category: z.string().max(100).optional().describe('Rule category'),
  jurisdiction: z.string().max(100).optional().describe('Geographic jurisdiction'),

  // Custom metadata
  metadata: z.record(z.unknown()).optional().describe('Additional metadata'),
});

export type RuleDefinition = z.infer<typeof RuleDefinitionSchema>;

// ============================================================================
// RULE PACKAGE SCHEMA
// ============================================================================

/**
 * Rule package metadata
 */
export const RulePackageMetadataSchema = z.object({
  id: z.string().min(1).max(128).describe('Package identifier'),
  name: z.string().min(1).max(200).describe('Package name'),
  description: z.string().max(2000).optional().describe('Package description'),
  version: RuleVersionSchema.describe('Package version'),
  author: RuleAuthorSchema.optional().describe('Package author'),
  license: z.string().max(100).optional().describe('License identifier'),
  homepage: z.string().url().optional().describe('Package homepage'),
  repository: z.string().url().optional().describe('Source repository'),
  jurisdiction: z.string().max(100).optional().describe('Geographic jurisdiction'),
  programs: z.array(z.string().max(128)).optional().describe('Included program IDs'),
  tags: z.array(z.string().max(50)).optional().describe('Package tags'),
  createdAt: z.number().positive().describe('Creation timestamp'),
  updatedAt: z.number().positive().describe('Last update timestamp'),
});

export type RulePackageMetadata = z.infer<typeof RulePackageMetadataSchema>;

/**
 * Complete rule package
 */
export const RulePackageSchema = z.object({
  metadata: RulePackageMetadataSchema.describe('Package metadata'),
  rules: z.array(RuleDefinitionSchema).describe('Rules in package'),
  checksum: z.string().max(128).optional().describe('Package integrity checksum'),
  signature: z.string().max(500).optional().describe('Digital signature'),
});

export type RulePackage = z.infer<typeof RulePackageSchema>;

// ============================================================================
// RULE IMPORT/EXPORT SCHEMAS
// ============================================================================

/**
 * Rule import options
 */
export const RuleImportOptionsSchema = z.object({
  mode: z.enum(['create', 'update', 'upsert', 'replace']).optional().describe('Import mode'),
  validate: z.boolean().optional().describe('Validate before import'),
  skipTests: z.boolean().optional().describe('Skip test execution'),
  overwriteExisting: z.boolean().optional().describe('Overwrite existing rules'),
  dryRun: z.boolean().optional().describe('Simulate import without saving'),
});

export type RuleImportOptions = z.infer<typeof RuleImportOptionsSchema>;

/**
 * Rule import result
 */
export const RuleImportResultSchema = z.object({
  success: z.boolean().describe('Was import successful'),
  imported: z.number().nonnegative().describe('Number of rules imported'),
  skipped: z.number().nonnegative().describe('Number of rules skipped'),
  failed: z.number().nonnegative().describe('Number of rules failed'),
  errors: z.array(z.object({
    ruleId: z.string().optional(),
    message: z.string(),
    code: z.string().optional(),
  })).describe('Import errors'),
  warnings: z.array(z.object({
    ruleId: z.string().optional(),
    message: z.string(),
  })).describe('Import warnings'),
  dryRun: z.boolean().optional().describe('Was this a dry run'),
});

export type RuleImportResult = z.infer<typeof RuleImportResultSchema>;

/**
 * Rule export options
 */
export const RuleExportOptionsSchema = z.object({
  format: z.enum(['json', 'yaml', 'package']).optional().describe('Export format'),
  includeTests: z.boolean().optional().describe('Include test cases'),
  includeMetadata: z.boolean().optional().describe('Include all metadata'),
  minify: z.boolean().optional().describe('Minify output'),
  pretty: z.boolean().optional().describe('Pretty print'),
});

export type RuleExportOptions = z.infer<typeof RuleExportOptionsSchema>;

// ============================================================================
// RULE VALIDATION RESULT SCHEMA
// ============================================================================

/**
 * Enhanced validation result with schema validation
 */
export const RuleSchemaValidationResultSchema = z.object({
  valid: z.boolean().describe('Is rule valid'),
  structureValid: z.boolean().describe('Is structure valid'),
  logicValid: z.boolean().describe('Is logic valid'),
  metadataValid: z.boolean().describe('Is metadata valid'),
  testsValid: z.boolean().describe('Are tests valid'),
  errors: z.array(z.object({
    field: z.string().optional(),
    message: z.string(),
    code: z.string(),
    severity: z.enum(['error', 'critical']),
  })).describe('Validation errors'),
  warnings: z.array(z.object({
    field: z.string().optional(),
    message: z.string(),
    code: z.string().optional(),
  })).describe('Validation warnings'),
});

export type RuleSchemaValidationResult = z.infer<typeof RuleSchemaValidationResultSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse version string (e.g., "1.2.3") to RuleVersion
 */
export function parseVersion(version: string): RuleVersion {
  const parts = version.split('.');
  if (parts.length < 2 || parts.length > 4) {
    throw new Error(`Invalid version format: ${version}`);
  }

  const [major, minor, patch = '0', label] = parts;

  return {
    major: parseInt(major, 10),
    minor: parseInt(minor, 10),
    patch: parseInt(patch, 10),
    label,
  };
}

/**
 * Format RuleVersion to string (e.g., "1.2.3")
 */
export function formatVersion(version: RuleVersion): string {
  const base = `${version.major}.${version.minor}.${version.patch}`;
  return version.label ? `${base}-${version.label}` : base;
}

/**
 * Compare two versions
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: RuleVersion, v2: RuleVersion): number {
  if (v1.major !== v2.major) return v1.major > v2.major ? 1 : -1;
  if (v1.minor !== v2.minor) return v1.minor > v2.minor ? 1 : -1;
  if (v1.patch !== v2.patch) return v1.patch > v2.patch ? 1 : -1;
  return 0;
}

/**
 * Check if version is greater than another
 */
export function isNewerVersion(v1: RuleVersion, v2: RuleVersion): boolean {
  return compareVersions(v1, v2) > 0;
}

/**
 * Increment version
 */
export function incrementVersion(
  version: RuleVersion,
  level: 'major' | 'minor' | 'patch'
): RuleVersion {
  const newVersion = { ...version };

  switch (level) {
    case 'major':
      newVersion.major += 1;
      newVersion.minor = 0;
      newVersion.patch = 0;
      break;
    case 'minor':
      newVersion.minor += 1;
      newVersion.patch = 0;
      break;
    case 'patch':
      newVersion.patch += 1;
      break;
  }

  return newVersion;
}

/**
 * Validate rule definition against schema
 */
export function validateRuleDefinition(
  rule: unknown
): { success: true; data: RuleDefinition } | { success: false; error: z.ZodError } {
  // Simplified logging - only log essential info
  const ruleId = rule && typeof rule === 'object' && 'id' in rule ? rule.id : 'unknown';
  console.log(`🔍 [SCHEMA] Validating rule: ${ruleId}`);

  const result = RuleDefinitionSchema.safeParse(rule);

  if (result.success) {
    console.log(`✅ [SCHEMA] Rule ${ruleId} validation passed`);
    return { success: true, data: result.data };
  }

  // Only log validation errors - they're important for debugging
  console.log(`❌ [SCHEMA] Rule ${ruleId} validation failed:`, {
    errorCount: result.error.issues.length,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      expected: issue.expected,
      received: issue.received
    }))
  });

  return { success: false, error: result.error };
}

/**
 * Validate rule package
 */
export function validateRulePackage(
  pkg: unknown
): { success: true; data: RulePackage } | { success: false; error: z.ZodError } {
  const result = RulePackageSchema.safeParse(pkg);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Create a new rule definition template
 */
export function createRuleTemplate(
  programId: string,
  name: string
): Partial<RuleDefinition> {
  const now = Date.now();

  return {
    id: `${programId}-${Date.now()}`,
    programId,
    name,
    ruleLogic: { var: 'placeholder' } as Record<string, unknown>,
    version: { major: 0, minor: 1, patch: 0, label: 'draft' },
    active: false,
    draft: true,
    createdAt: now,
    updatedAt: now,
    testCases: [],
    changelog: [],
  };
}

/**
 * Calculate rule checksum (for integrity verification)
 */
export async function calculateChecksum(data: unknown): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data, null, 0);
  const buffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

