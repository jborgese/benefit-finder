/**
 * RxDB Collections Configuration
 *
 * Defines all collections with their schemas and methods.
 */

import type { RxCollectionCreator, RxDocument, RxCollection } from 'rxdb';
import {
  userProfileSchema,
  benefitProgramSchema,
  eligibilityRuleSchema,
  eligibilityResultSchema,
  appSettingSchema,
  type UserProfile,
  type BenefitProgram,
  type EligibilityRule,
  type EligibilityResult,
  type AppSetting,
} from './schemas';

/**
 * User Profiles Collection
 */
export const userProfilesCollection: RxCollectionCreator<UserProfile> = {
  schema: userProfileSchema,
  methods: {
    /**
     * Get full name
     */
    getFullName(this: RxDocument<UserProfile>): string {
      return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
    },

    /**
     * Calculate age from date of birth
     */
    getAge(this: RxDocument<UserProfile>): number | null {
      if (!this.dateOfBirth) return null;

      const birthDate = new Date(this.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    },
  },
  statics: {
    /**
     * Get most recently updated profile
     */
    getLatest(this: RxCollection<UserProfile>) {
      return this.findOne({
        sort: [{ updatedAt: 'desc' }],
      }).exec();
    },
  },
};

/**
 * Benefit Programs Collection
 */
export const benefitProgramsCollection: RxCollectionCreator<BenefitProgram> = {
  schema: benefitProgramSchema,
  methods: {
    /**
     * Check if program is currently active
     */
    isActive(this: RxDocument<BenefitProgram>): boolean {
      return this.active === true;
    },
  },
  statics: {
    /**
     * Get all active programs
     */
    getActivePrograms(this: RxCollection<BenefitProgram>) {
      return this.find({
        selector: {
          active: true,
        },
        sort: [{ name: 'asc' }],
      }).exec();
    },

    /**
     * Get programs by jurisdiction
     */
    getByJurisdiction(this: RxCollection<BenefitProgram>, jurisdiction: string) {
      return this.find({
        selector: {
          jurisdiction,
          active: true,
        },
        sort: [{ name: 'asc' }],
      }).exec();
    },

    /**
     * Get programs by category
     */
    getByCategory(this: RxCollection<BenefitProgram>, category: string) {
      return this.find({
        selector: {
          category,
          active: true,
        },
        sort: [{ name: 'asc' }],
      }).exec();
    },
  },
};

/**
 * Eligibility Rules Collection
 */
export const eligibilityRulesCollection: RxCollectionCreator<EligibilityRule> = {
  schema: eligibilityRuleSchema,
  methods: {
    /**
     * Check if rule is currently valid
     */
    isValid(this: RxDocument<EligibilityRule>): boolean {
      if (!this.active) return false;

      const now = Date.now();

      if (this.effectiveDate && now < this.effectiveDate) return false;
      if (this.expirationDate && now > this.expirationDate) return false;

      return true;
    },
  },
  statics: {
    /**
     * Get active rules for a program
     */
    getByProgram(this: RxCollection<EligibilityRule>, programId: string) {
      const now = Date.now();

      return this.find({
        selector: {
          programId,
          active: true,
          effectiveDate: {
            $lte: now,
          },
          $or: [
            { expirationDate: { $exists: false } },
            { expirationDate: { $gte: now } },
          ],
        },
      }).exec();
    },
  },
};

/**
 * Eligibility Results Collection
 */
export const eligibilityResultsCollection: RxCollectionCreator<EligibilityResult> = {
  schema: eligibilityResultSchema,
  methods: {
    /**
     * Check if result is expired
     */
    isExpired(this: RxDocument<EligibilityResult>): boolean {
      if (!this.expiresAt) return false;
      return Date.now() > this.expiresAt;
    },

    /**
     * Check if result is eligible
     */
    isEligible(this: RxDocument<EligibilityResult>): boolean {
      return this.eligible === true;
    },
  },
  statics: {
    /**
     * Get results for a user profile
     */
    getByUserProfile(this: RxCollection<EligibilityResult>, userProfileId: string) {
      return this.find({
        selector: {
          userProfileId,
        },
        sort: [{ evaluatedAt: 'desc' }],
      }).exec();
    },

    /**
     * Get non-expired results for a user
     */
    getValidResults(this: RxCollection<EligibilityResult>, userProfileId: string) {
      const now = Date.now();

      return this.find({
        selector: {
          userProfileId,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gte: now } },
          ],
        },
        sort: [{ evaluatedAt: 'desc' }],
      }).exec();
    },

    /**
     * Clear expired results
     */
    async clearExpired(this: RxCollection<EligibilityResult>) {
      const now = Date.now();

      const expiredDocs = await this.find({
        selector: {
          expiresAt: {
            $lt: now,
          },
        },
      }).exec();

      for (const doc of expiredDocs) {
        await doc.remove();
      }

      return expiredDocs.length;
    },
  },
};

/**
 * App Settings Collection
 */
export const appSettingsCollection: RxCollectionCreator<AppSetting> = {
  schema: appSettingSchema,
  methods: {
    /**
     * Get typed value
     */
    getValue(this: RxDocument<AppSetting>): unknown {
      try {
        return JSON.parse(this.value);
      } catch {
        return this.value;
      }
    },
  },
  statics: {
    /**
     * Get setting value by key
     */
    async get(this: RxCollection<AppSetting>, key: string): Promise<unknown> {
      const setting = await this.findOne({
        selector: { key },
      }).exec();

      if (!setting) return null;

      return setting.getValue();
    },

    /**
     * Set setting value
     */
    async set(this: RxCollection<AppSetting>, key: string, value: unknown, encrypted = false) {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);

      let type: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';

      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (Array.isArray(value)) type = 'array';
      else if (typeof value === 'object') type = 'object';

      await this.upsert({
        key,
        value: serialized,
        type,
        encrypted,
        updatedAt: Date.now(),
      });
    },
  },
};

/**
 * Collections configuration object
 */
export const collections = {
  user_profiles: userProfilesCollection,
  benefit_programs: benefitProgramsCollection,
  eligibility_rules: eligibilityRulesCollection,
  eligibility_results: eligibilityResultsCollection,
  app_settings: appSettingsCollection,
};

