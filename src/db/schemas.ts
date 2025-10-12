/**
 * RxDB Schema Definitions
 * 
 * Defines all database schemas using Zod for validation.
 * All schemas are type-safe and include encryption for sensitive fields.
 */

import { z } from 'zod';
import type {
  RxDocument,
  RxJsonSchema,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
} from 'rxdb';
import { toTypedRxJsonSchema } from 'rxdb';

/**
 * User Profile Schema
 * 
 * Stores household and personal information for eligibility checks.
 * All fields are encrypted for privacy.
 */
const userProfileSchemaLiteral = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 128,
    },
    // Personal Information (encrypted)
    firstName: {
      type: 'string',
      encrypted: true,
    },
    lastName: {
      type: 'string',
      encrypted: true,
    },
    dateOfBirth: {
      type: 'string',
      encrypted: true,
    },
    // Household Information (encrypted)
    householdSize: {
      type: 'number',
      encrypted: true,
    },
    householdIncome: {
      type: 'number',
      encrypted: true,
    },
    state: {
      type: 'string',
      encrypted: true,
    },
    zipCode: {
      type: 'string',
      encrypted: true,
    },
    // Status Information (encrypted)
    citizenship: {
      type: 'string',
      encrypted: true,
    },
    employmentStatus: {
      type: 'string',
      encrypted: true,
    },
    // Metadata
    createdAt: {
      type: 'number',
      minimum: 0,
    },
    updatedAt: {
      type: 'number',
      minimum: 0,
    },
  },
  required: ['id', 'createdAt', 'updatedAt'],
  encrypted: ['firstName', 'lastName', 'dateOfBirth', 'householdSize', 
              'householdIncome', 'state', 'zipCode', 'citizenship', 
              'employmentStatus'],
} as const;

export const userProfileSchema = toTypedRxJsonSchema(userProfileSchemaLiteral);
export type UserProfile = ExtractDocumentTypeFromTypedRxJsonSchema<typeof userProfileSchema>;
export type UserProfileDocument = RxDocument<UserProfile>;
export type UserProfileCollection = RxCollection<UserProfile>;

/**
 * Benefit Program Schema
 * 
 * Stores benefit program definitions and metadata.
 */
const benefitProgramSchemaLiteral = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 128,
    },
    // Program Information
    name: {
      type: 'string',
    },
    shortName: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    category: {
      type: 'string',
      enum: ['food', 'healthcare', 'housing', 'financial', 'childcare', 'other'],
    },
    // Jurisdiction
    jurisdiction: {
      type: 'string', // e.g., "US-GA", "US-CA", "US-FEDERAL"
    },
    // Program Details
    website: {
      type: 'string',
    },
    phoneNumber: {
      type: 'string',
    },
    applicationUrl: {
      type: 'string',
    },
    // Metadata
    active: {
      type: 'boolean',
    },
    lastUpdated: {
      type: 'number',
      minimum: 0,
    },
    createdAt: {
      type: 'number',
      minimum: 0,
    },
  },
  required: ['id', 'name', 'category', 'jurisdiction', 'active', 'lastUpdated', 'createdAt'],
} as const;

export const benefitProgramSchema = toTypedRxJsonSchema(benefitProgramSchemaLiteral);
export type BenefitProgram = ExtractDocumentTypeFromTypedRxJsonSchema<typeof benefitProgramSchema>;
export type BenefitProgramDocument = RxDocument<BenefitProgram>;
export type BenefitProgramCollection = RxCollection<BenefitProgram>;

/**
 * Eligibility Rule Schema
 * 
 * Stores JSON Logic rules for determining benefit eligibility.
 */
const eligibilityRuleSchemaLiteral = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 128,
    },
    // Rule Identification
    programId: {
      type: 'string',
      ref: 'benefit_programs',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    // Rule Definition
    ruleLogic: {
      type: 'object', // JSON Logic rule
    },
    // Requirements
    requiredDocuments: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    // Metadata
    version: {
      type: 'string',
    },
    effectiveDate: {
      type: 'number',
      minimum: 0,
    },
    expirationDate: {
      type: 'number',
      minimum: 0,
    },
    source: {
      type: 'string', // Citation/source of the rule
    },
    active: {
      type: 'boolean',
    },
    createdAt: {
      type: 'number',
      minimum: 0,
    },
    updatedAt: {
      type: 'number',
      minimum: 0,
    },
  },
  required: ['id', 'programId', 'name', 'ruleLogic', 'version', 'active', 'createdAt', 'updatedAt'],
} as const;

export const eligibilityRuleSchema = toTypedRxJsonSchema(eligibilityRuleSchemaLiteral);
export type EligibilityRule = ExtractDocumentTypeFromTypedRxJsonSchema<typeof eligibilityRuleSchema>;
export type EligibilityRuleDocument = RxDocument<EligibilityRule>;
export type EligibilityRuleCollection = RxCollection<EligibilityRule>;

/**
 * Eligibility Result Schema
 * 
 * Stores cached eligibility evaluation results.
 * Results are encrypted for privacy.
 */
const eligibilityResultSchemaLiteral = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 128,
    },
    // References
    userProfileId: {
      type: 'string',
      ref: 'user_profiles',
      encrypted: true,
    },
    programId: {
      type: 'string',
      ref: 'benefit_programs',
    },
    ruleId: {
      type: 'string',
      ref: 'eligibility_rules',
    },
    // Result
    eligible: {
      type: 'boolean',
      encrypted: true,
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      encrypted: true,
    },
    reason: {
      type: 'string',
      encrypted: true,
    },
    // Details
    nextSteps: {
      type: 'array',
      items: {
        type: 'string',
      },
      encrypted: true,
    },
    requiredDocuments: {
      type: 'array',
      items: {
        type: 'string',
      },
      encrypted: true,
    },
    // Metadata
    evaluatedAt: {
      type: 'number',
      minimum: 0,
    },
    expiresAt: {
      type: 'number',
      minimum: 0,
    },
  },
  required: ['id', 'userProfileId', 'programId', 'ruleId', 'eligible', 
             'confidence', 'evaluatedAt'],
  encrypted: ['userProfileId', 'eligible', 'confidence', 'reason', 
              'nextSteps', 'requiredDocuments'],
} as const;

export const eligibilityResultSchema = toTypedRxJsonSchema(eligibilityResultSchemaLiteral);
export type EligibilityResult = ExtractDocumentTypeFromTypedRxJsonSchema<typeof eligibilityResultSchema>;
export type EligibilityResultDocument = RxDocument<EligibilityResult>;
export type EligibilityResultCollection = RxCollection<EligibilityResult>;

/**
 * App Setting Schema
 * 
 * Stores application-level settings and metadata.
 * Complements Zustand store with persistent data.
 */
const appSettingSchemaLiteral = {
  version: 0,
  primaryKey: 'key',
  type: 'object',
  properties: {
    key: {
      type: 'string',
      maxLength: 128,
    },
    value: {
      type: 'string', // Stored as JSON string
    },
    type: {
      type: 'string',
      enum: ['string', 'number', 'boolean', 'object', 'array'],
    },
    encrypted: {
      type: 'boolean',
    },
    updatedAt: {
      type: 'number',
      minimum: 0,
    },
  },
  required: ['key', 'value', 'type', 'encrypted', 'updatedAt'],
} as const;

export const appSettingSchema = toTypedRxJsonSchema(appSettingSchemaLiteral);
export type AppSetting = ExtractDocumentTypeFromTypedRxJsonSchema<typeof appSettingSchema>;
export type AppSettingDocument = RxDocument<AppSetting>;
export type AppSettingCollection = RxCollection<AppSetting>;

