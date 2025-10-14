/**
 * RxDB Schema Definitions with Zod
 *
 * Defines all database schemas using Zod for validation.
 * All schemas are type-safe and include encryption for sensitive fields.
 *
 * Collections:
 * - UserProfiles: Encrypted household and personal data
 * - Programs: Benefit program definitions
 * - Rules: Eligibility rule sets (JSON Logic)
 * - EligibilityResults: Cached evaluation results
 * - AppSettings: User preferences and app state
 */

import { z } from 'zod';
import type {
  RxDocument,
  RxJsonSchema,
  RxCollection,
} from 'rxdb';

// ============================================================================
// USER PROFILES SCHEMA
// ============================================================================

/**
 * Zod Schema: User Profile
 *
 * Stores household and personal information for eligibility checks.
 * All sensitive fields are encrypted at rest.
 */
export const UserProfileZodSchema = z.object({
  // Primary Key
  id: z.string().min(1).max(128).describe('Unique profile identifier'),

  // Personal Information (will be encrypted)
  firstName: z.string().min(1).max(100).optional().describe('First name'),
  lastName: z.string().min(1).max(100).optional().describe('Last name'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Date of birth (YYYY-MM-DD)'),

  // Household Information (will be encrypted)
  householdSize: z.number().int().positive().max(50).optional().describe('Number of people in household'),
  householdIncome: z.number().nonnegative().max(10000000).optional().describe('Household income in dollars (stored as annual)'),
  incomePeriod: z.enum(['monthly', 'annual']).optional().describe('Original income entry frequency'),

  // Location (will be encrypted)
  state: z.string().length(2).optional().describe('US state code (e.g., GA, CA)'),
  // eslint-disable-next-line security/detect-unsafe-regex -- This regex is safe; it matches 5 or 9 digit ZIP codes with no backtracking risk
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional().describe('ZIP code (5 or 9 digits)'),
  county: z.string().max(100).optional().describe('County name'),

  // Citizenship & Status (will be encrypted)
  citizenship: z.enum(['us_citizen', 'permanent_resident', 'refugee', 'asylee', 'other']).optional().describe('Citizenship status'),
  employmentStatus: z.enum(['employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student']).optional().describe('Employment status'),

  // Additional Demographics (will be encrypted)
  hasDisability: z.boolean().optional().describe('Has disability'),
  isVeteran: z.boolean().optional().describe('Is veteran'),
  isPregnant: z.boolean().optional().describe('Is pregnant'),
  hasChildren: z.boolean().optional().describe('Has children under 18'),

  // Metadata (not encrypted)
  createdAt: z.number().positive().describe('Creation timestamp'),
  updatedAt: z.number().positive().describe('Last update timestamp'),
  lastAccessedAt: z.number().positive().optional().describe('Last accessed timestamp'),
});

// TypeScript type from Zod schema
export type UserProfile = z.infer<typeof UserProfileZodSchema>;

// RxDB JSON Schema
export const userProfileSchema: RxJsonSchema<UserProfile> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 128 },
    firstName: { type: 'string', maxLength: 100 },
    lastName: { type: 'string', maxLength: 100 },
    dateOfBirth: { type: 'string' },
    householdSize: { type: 'number', minimum: 1, maximum: 50, multipleOf: 1 },
    householdIncome: { type: 'number', minimum: 0, maximum: 10000000 },
    incomePeriod: { type: 'string', enum: ['monthly', 'annual'] },
    state: { type: 'string', maxLength: 2 },
    zipCode: { type: 'string', maxLength: 10 },
    county: { type: 'string', maxLength: 100 },
    citizenship: { type: 'string', enum: ['us_citizen', 'permanent_resident', 'refugee', 'asylee', 'other'] },
    employmentStatus: { type: 'string', enum: ['employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student'] },
    hasDisability: { type: 'boolean' },
    isVeteran: { type: 'boolean' },
    isPregnant: { type: 'boolean' },
    hasChildren: { type: 'boolean' },
    createdAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    updatedAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    lastAccessedAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
  },
  required: ['id', 'createdAt', 'updatedAt'],
  encrypted: [
    'firstName',
    'lastName',
    'dateOfBirth',
    'householdSize',
    'householdIncome',
    'incomePeriod',
    'state',
    'zipCode',
    'county',
    'citizenship',
    'employmentStatus',
    'hasDisability',
    'isVeteran',
    'isPregnant',
    'hasChildren',
  ],
  indexes: ['createdAt', 'updatedAt'],
};

export type UserProfileDocument = RxDocument<UserProfile>;
export type UserProfileCollection = RxCollection<UserProfile>;

// ============================================================================
// BENEFIT PROGRAMS SCHEMA
// ============================================================================

/**
 * Zod Schema: Benefit Program
 *
 * Stores benefit program definitions and metadata.
 * This data is public and not encrypted.
 */
export const BenefitProgramZodSchema = z.object({
  // Primary Key
  id: z.string().min(1).max(128).describe('Unique program identifier'),

  // Program Information
  name: z.string().min(1).max(200).describe('Full program name'),
  shortName: z.string().min(1).max(50).describe('Abbreviated name'),
  description: z.string().max(2000).describe('Program description'),

  // Categorization
  category: z.enum([
    'food',
    'healthcare',
    'housing',
    'financial',
    'childcare',
    'education',
    'employment',
    'transportation',
    'utilities',
    'legal',
    'other',
  ]).describe('Program category'),

  // Jurisdiction (e.g., "US-FEDERAL", "US-GA", "US-CA-SanFrancisco")
  jurisdiction: z.string().min(2).max(100).describe('Geographic jurisdiction'),
  jurisdictionLevel: z.enum(['federal', 'state', 'county', 'city']).optional().describe('Level of government'),

  // Program Details
  website: z.string().url().optional().describe('Official website URL'),
  phoneNumber: z.string().max(50).optional().describe('Contact phone number'),
  applicationUrl: z.string().url().optional().describe('Online application URL'),
  officeAddress: z.string().max(500).optional().describe('Physical office address'),

  // Eligibility Overview
  eligibilitySummary: z.string().max(1000).optional().describe('Brief eligibility summary'),
  benefitAmount: z.string().max(200).optional().describe('Benefit amount description'),

  // Tags for searching
  tags: z.array(z.string().max(50)).optional().describe('Search tags'),

  // Status
  active: z.boolean().describe('Is program currently active'),
  applicationOpen: z.boolean().optional().describe('Is application period open'),

  // Metadata
  source: z.string().max(500).optional().describe('Data source URL'),
  sourceDate: z.number().positive().optional().describe('Date source was last checked'),
  lastUpdated: z.number().positive().describe('Last update timestamp'),
  createdAt: z.number().positive().describe('Creation timestamp'),
});

export type BenefitProgram = z.infer<typeof BenefitProgramZodSchema>;

export const benefitProgramSchema: RxJsonSchema<BenefitProgram> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 128 },
    name: { type: 'string', maxLength: 200 },
    shortName: { type: 'string', maxLength: 50 },
    description: { type: 'string', maxLength: 2000 },
    category: {
      type: 'string',
      maxLength: 50,
      enum: ['food', 'healthcare', 'housing', 'financial', 'childcare', 'education', 'employment', 'transportation', 'utilities', 'legal', 'other']
    },
    jurisdiction: { type: 'string', maxLength: 100 },
    jurisdictionLevel: { type: 'string', enum: ['federal', 'state', 'county', 'city'] },
    website: { type: 'string', maxLength: 500 },
    phoneNumber: { type: 'string', maxLength: 50 },
    applicationUrl: { type: 'string', maxLength: 500 },
    officeAddress: { type: 'string', maxLength: 500 },
    eligibilitySummary: { type: 'string', maxLength: 1000 },
    benefitAmount: { type: 'string', maxLength: 200 },
    tags: { type: 'array', items: { type: 'string', maxLength: 50 } },
    active: { type: 'boolean' },
    applicationOpen: { type: 'boolean' },
    source: { type: 'string', maxLength: 500 },
    sourceDate: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    lastUpdated: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    createdAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
  },
  required: ['id', 'name', 'shortName', 'description', 'category', 'jurisdiction', 'active', 'lastUpdated', 'createdAt'],
  indexes: ['category', 'jurisdiction', 'active', ['category', 'jurisdiction']],
};

export type BenefitProgramDocument = RxDocument<BenefitProgram>;
export type BenefitProgramCollection = RxCollection<BenefitProgram>;

// ============================================================================
// ELIGIBILITY RULES SCHEMA
// ============================================================================

/**
 * Zod Schema: Eligibility Rule
 *
 * Stores JSON Logic rules for determining benefit eligibility.
 * Rules are public and not encrypted.
 */
export const EligibilityRuleZodSchema = z.object({
  // Primary Key
  id: z.string().min(1).max(128).describe('Unique rule identifier'),

  // Rule Identification
  programId: z.string().min(1).max(128).describe('Reference to benefit program'),
  name: z.string().min(1).max(200).describe('Rule name'),
  description: z.string().max(1000).optional().describe('Rule description'),

  // Rule Type
  ruleType: z.enum(['eligibility', 'benefit_amount', 'document_requirements', 'conditional']).optional().describe('Type of rule'),

  // Rule Definition (JSON Logic format)
  ruleLogic: z.record(z.unknown()).describe('JSON Logic rule definition'),

  // Human-readable explanation
  explanation: z.string().max(2000).optional().describe('Plain language explanation of rule'),

  // Required Documents
  requiredDocuments: z.array(z.string().max(200)).optional().describe('Documents required if eligible'),

  // Required Fields (what data is needed to evaluate)
  requiredFields: z.array(z.string().max(100)).optional().describe('Profile fields needed for evaluation'),

  // Version & Dates
  version: z.string().max(50).describe('Rule version (e.g., "2024.1")'),
  effectiveDate: z.number().positive().optional().describe('When rule becomes active'),
  expirationDate: z.number().positive().optional().describe('When rule expires'),

  // Source & Attribution
  source: z.string().max(500).optional().describe('Official source URL'),
  sourceDocument: z.string().max(200).optional().describe('Source document reference'),
  legalReference: z.string().max(200).optional().describe('Legal citation'),

  // Priority (for multiple rules)
  priority: z.number().int().nonnegative().optional().describe('Rule priority (higher = evaluated first)'),

  // Status
  active: z.boolean().describe('Is rule currently active'),
  draft: z.boolean().optional().describe('Is this a draft rule'),

  // Test Cases (for validation)
  testCases: z.array(z.object({
    input: z.record(z.unknown()),
    expectedOutput: z.boolean(),
    description: z.string().max(200),
  })).optional().describe('Test cases for rule validation'),

  // Metadata
  createdAt: z.number().positive().describe('Creation timestamp'),
  updatedAt: z.number().positive().describe('Last update timestamp'),
  createdBy: z.string().max(100).optional().describe('Rule author'),
});

export type EligibilityRule = z.infer<typeof EligibilityRuleZodSchema>;

export const eligibilityRuleSchema: RxJsonSchema<EligibilityRule> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 128 },
    programId: { type: 'string', maxLength: 128, ref: 'benefit_programs' },
    name: { type: 'string', maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    ruleType: { type: 'string', enum: ['eligibility', 'benefit_amount', 'document_requirements', 'conditional'] },
    ruleLogic: { type: 'object' },
    explanation: { type: 'string', maxLength: 2000 },
    requiredDocuments: { type: 'array', items: { type: 'string', maxLength: 200 } },
    requiredFields: { type: 'array', items: { type: 'string', maxLength: 100 } },
    version: { type: 'string', maxLength: 50 },
    effectiveDate: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    expirationDate: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    source: { type: 'string', maxLength: 500 },
    sourceDocument: { type: 'string', maxLength: 200 },
    legalReference: { type: 'string', maxLength: 200 },
    priority: { type: 'number', minimum: 0, multipleOf: 1 },
    active: { type: 'boolean' },
    draft: { type: 'boolean' },
    testCases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          input: { type: 'object' },
          expectedOutput: { type: 'boolean' },
          description: { type: 'string', maxLength: 200 },
        },
        required: ['input', 'expectedOutput', 'description'],
      },
    },
    createdAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    updatedAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    createdBy: { type: 'string', maxLength: 100 },
  },
  required: ['id', 'programId', 'name', 'ruleLogic', 'version', 'active', 'createdAt', 'updatedAt'],
  indexes: ['programId', 'active', ['programId', 'active'], 'createdAt'],
};

export type EligibilityRuleDocument = RxDocument<EligibilityRule>;
export type EligibilityRuleCollection = RxCollection<EligibilityRule>;

// ============================================================================
// ELIGIBILITY RESULTS SCHEMA
// ============================================================================

/**
 * Zod Schema: Eligibility Result
 *
 * Stores cached eligibility evaluation results.
 * All result data is encrypted for privacy.
 */
export const EligibilityResultZodSchema = z.object({
  // Primary Key
  id: z.string().min(1).max(128).describe('Unique result identifier'),

  // References (userProfileId is encrypted)
  userProfileId: z.string().min(1).max(128).describe('Reference to user profile'),
  programId: z.string().min(1).max(128).describe('Reference to benefit program'),
  ruleId: z.string().min(1).max(128).describe('Reference to eligibility rule'),

  // Result (encrypted)
  eligible: z.boolean().describe('Is user eligible'),
  confidence: z.number().min(0).max(100).describe('Confidence score (0-100)'),
  reason: z.string().max(1000).optional().describe('Explanation of result'),

  // Detailed Breakdown (encrypted)
  criteriaResults: z.array(z.object({
    criterion: z.string(),
    met: z.boolean(),
    value: z.unknown().optional(),
    threshold: z.unknown().optional(),
    comparison: z.string().optional(),
    message: z.string().optional(),
    importance: z.enum(['required', 'preferred', 'optional']).optional(),
  })).optional().describe('Individual criteria results'),

  // Missing Information (encrypted)
  missingFields: z.array(z.string().max(100)).optional().describe('Fields needed for evaluation'),

  // Next Steps (encrypted)
  nextSteps: z.array(z.object({
    step: z.string().max(500),
    url: z.string().max(500).optional(),
    priority: z.enum(['high', 'medium', 'low']),
    estimatedTime: z.string().max(100).optional(),
    requiresDocument: z.boolean().optional(),
  })).optional().describe('Recommended next steps'),

  // Required Documents (encrypted)
  requiredDocuments: z.array(z.object({
    document: z.string().max(200),
    description: z.string().max(500).optional(),
    where: z.string().max(500).optional(),
    alternatives: z.array(z.string()).optional(),
    required: z.boolean(),
    helpText: z.string().max(500).optional(),
  })).optional().describe('Documents needed for application'),

  // Benefit Estimate (encrypted)
  estimatedBenefit: z.object({
    amount: z.number().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    frequency: z.enum(['one_time', 'monthly', 'quarterly', 'annual']),
    description: z.string().max(500).optional(),
    currency: z.literal('USD'),
    calculation: z.string().max(500).optional(),
  }).optional().describe('Estimated benefit amount'),

  // Evaluation Metadata
  ruleVersion: z.string().max(50).optional().describe('Version of rule used'),
  evaluatedAt: z.number().positive().describe('Evaluation timestamp'),
  expiresAt: z.number().positive().optional().describe('When result expires'),

  // Flags
  needsReview: z.boolean().optional().describe('Needs manual review'),
  incomplete: z.boolean().optional().describe('Missing required information'),
});

export type EligibilityResult = z.infer<typeof EligibilityResultZodSchema>;

export const eligibilityResultSchema: RxJsonSchema<EligibilityResult> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 128 },
    userProfileId: { type: 'string', maxLength: 128, ref: 'user_profiles' },
    programId: { type: 'string', maxLength: 128, ref: 'benefit_programs' },
    ruleId: { type: 'string', maxLength: 128, ref: 'eligibility_rules' },
    eligible: { type: 'boolean' },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    reason: { type: 'string', maxLength: 1000 },
    criteriaResults: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          met: { type: 'boolean' },
          value: {},
          threshold: {},
          comparison: { type: 'string' },
          message: { type: 'string' },
          importance: { type: 'string', enum: ['required', 'preferred', 'optional'] },
        },
        required: ['criterion', 'met'],
      },
    },
    missingFields: { type: 'array', items: { type: 'string', maxLength: 100 } },
    nextSteps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'string', maxLength: 500 },
          url: { type: 'string', maxLength: 500 },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          estimatedTime: { type: 'string', maxLength: 100 },
          requiresDocument: { type: 'boolean' },
        },
        required: ['step', 'priority'],
      },
    },
    requiredDocuments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          document: { type: 'string', maxLength: 200 },
          description: { type: 'string', maxLength: 500 },
          where: { type: 'string', maxLength: 500 },
          alternatives: { type: 'array', items: { type: 'string' } },
          required: { type: 'boolean' },
          helpText: { type: 'string', maxLength: 500 },
        },
        required: ['document', 'required'],
      },
    },
    estimatedBenefit: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        minAmount: { type: 'number' },
        maxAmount: { type: 'number' },
        frequency: { type: 'string', enum: ['one_time', 'monthly', 'quarterly', 'annual'] },
        description: { type: 'string', maxLength: 500 },
        currency: { type: 'string', enum: ['USD'] },
        calculation: { type: 'string', maxLength: 500 },
      },
      required: ['frequency', 'currency'],
    },
    ruleVersion: { type: 'string', maxLength: 50 },
    evaluatedAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    expiresAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    needsReview: { type: 'boolean' },
    incomplete: { type: 'boolean' },
  },
  required: ['id', 'userProfileId', 'programId', 'ruleId', 'eligible', 'confidence', 'evaluatedAt'],
  encrypted: [
    // Note: userProfileId and programId are reference IDs, not sensitive data, so not encrypted
    // This allows efficient querying by these fields
    'eligible',
    'confidence',
    'reason',
    'criteriaResults',
    'missingFields',
    'nextSteps',
    'requiredDocuments',
    'estimatedBenefit',
  ],
  indexes: ['userProfileId', 'programId', 'evaluatedAt', ['userProfileId', 'programId']],
};

export type EligibilityResultDocument = RxDocument<EligibilityResult>;
export type EligibilityResultCollection = RxCollection<EligibilityResult>;

// ============================================================================
// APP SETTINGS SCHEMA
// ============================================================================

/**
 * Zod Schema: App Setting
 *
 * Stores application-level settings and metadata.
 * Complements Zustand store with persistent data.
 */
export const AppSettingZodSchema = z.object({
  // Primary Key
  key: z.string().min(1).max(128).describe('Setting key'),

  // Value (stored as JSON string)
  value: z.string().max(10000).describe('Setting value (JSON serialized)'),

  // Type information
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']).describe('Value type'),

  // Security
  encrypted: z.boolean().describe('Is value encrypted'),
  sensitive: z.boolean().optional().describe('Is value sensitive (don\'t log)'),

  // Categorization
  category: z.enum([
    'user_preference',
    'app_state',
    'feature_flag',
    'cache',
    'metadata',
    'other',
  ]).optional().describe('Setting category'),

  // Metadata
  description: z.string().max(500).optional().describe('Setting description'),
  updatedAt: z.number().positive().describe('Last update timestamp'),
  createdAt: z.number().positive().optional().describe('Creation timestamp'),
  expiresAt: z.number().positive().optional().describe('Expiration timestamp (for cache)'),
});

export type AppSetting = z.infer<typeof AppSettingZodSchema>;

export const appSettingSchema: RxJsonSchema<AppSetting> = {
  version: 0,
  primaryKey: 'key',
  type: 'object',
  properties: {
    key: { type: 'string', maxLength: 128 },
    value: { type: 'string', maxLength: 10000 },
    type: { type: 'string', enum: ['string', 'number', 'boolean', 'object', 'array'] },
    encrypted: { type: 'boolean' },
    sensitive: { type: 'boolean' },
    category: {
      type: 'string',
      maxLength: 50,
      enum: ['user_preference', 'app_state', 'feature_flag', 'cache', 'metadata', 'other']
    },
    description: { type: 'string', maxLength: 500 },
    updatedAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    createdAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
    expiresAt: { type: 'number', minimum: 0, maximum: 8640000000000000, multipleOf: 1 },
  },
  required: ['key', 'value', 'type', 'encrypted', 'updatedAt'],
  indexes: ['updatedAt'],
};

export type AppSettingDocument = RxDocument<AppSetting>;
export type AppSettingCollection = RxCollection<AppSetting>;

