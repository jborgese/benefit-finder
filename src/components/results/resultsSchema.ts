/**
 * RxDB Schema for Eligibility Results
 *
 * Stores eligibility results with encryption for sensitive data
 */

import { z } from 'zod';
import type { RxJsonSchema } from 'rxdb';

/**
 * Zod schema for eligibility results document
 */
export const EligibilityResultsDocumentSchema = z.object({
  id: z.string(),

  // User identification (encrypted)
  userId: z.string().optional(),
  userName: z.string().optional(),

  // Results data (encrypted)
  results: z.object({
    qualified: z.array(z.any()),
    likely: z.array(z.any()),
    maybe: z.array(z.any()),
    notQualified: z.array(z.any()),
    totalPrograms: z.number(),
    evaluatedAt: z.string(), // ISO date string
  }),

  // User profile used for evaluation (encrypted)
  profileSnapshot: z.record(z.unknown()).optional(),

  // Metadata (not encrypted)
  evaluatedAt: z.number(), // Timestamp for sorting
  state: z.string().optional(),
  programsEvaluated: z.array(z.string()),
  qualifiedCount: z.number(),

  // Tags and notes
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),

  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type EligibilityResultsDocument = z.infer<typeof EligibilityResultsDocumentSchema>;

/**
 * RxDB schema for eligibility results collection
 */
export const eligibilityResultsSchema: RxJsonSchema<EligibilityResultsDocument> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 128,
    },
    userId: {
      type: 'string',
      maxLength: 128,
    },
    userName: {
      type: 'string',
      maxLength: 200,
    },
    results: {
      type: 'object',
      properties: {
        qualified: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        likely: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        maybe: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        notQualified: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        totalPrograms: {
          type: 'number',
        },
        evaluatedAt: {
          type: 'string',
        },
      },
      required: ['qualified', 'likely', 'maybe', 'notQualified', 'totalPrograms', 'evaluatedAt'],
    },
    profileSnapshot: {
      type: 'object',
    },
    evaluatedAt: {
      type: 'number',
    },
    state: {
      type: 'string',
      maxLength: 50,
    },
    programsEvaluated: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    qualifiedCount: {
      type: 'number',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    notes: {
      type: 'string',
      maxLength: 5000,
    },
    createdAt: {
      type: 'number',
    },
    updatedAt: {
      type: 'number',
    },
  },
  required: ['id', 'results', 'evaluatedAt', 'programsEvaluated', 'qualifiedCount', 'createdAt', 'updatedAt'],
  indexes: ['evaluatedAt', 'qualifiedCount', 'state'],
  encrypted: ['userId', 'userName', 'results', 'profileSnapshot', 'notes'],
};

/**
 * Collection name for eligibility results
 */
export const ELIGIBILITY_RESULTS_COLLECTION = 'eligibility_results';

