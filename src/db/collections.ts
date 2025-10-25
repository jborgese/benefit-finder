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
  type UserProfileDocument,
  type BenefitProgramDocument,
  type EligibilityRuleDocument,
  type EligibilityResultDocument,
  type AppSettingDocument,
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
     * Find most recently updated profile
     */
    findLatest(this: RxCollection<UserProfile>): Promise<UserProfileDocument | null> {
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
     * Find all active programs
     */
    findActivePrograms(this: RxCollection<BenefitProgram>): Promise<BenefitProgramDocument[]> {
      return this.find({
        selector: {
          active: true,
        },
        sort: [{ name: 'asc' }],
      }).exec();
    },

    /**
     * Find programs by jurisdiction
     */
    findProgramsByJurisdiction(this: RxCollection<BenefitProgram>, jurisdiction: string): Promise<BenefitProgramDocument[]> {
      return this.find({
        selector: {
          jurisdiction,
          active: true,
        },
        sort: [{ name: 'asc' }],
      }).exec();
    },

    /**
     * Find programs by category
     */
    findProgramsByCategory(this: RxCollection<BenefitProgram>, category: BenefitProgram['category']): Promise<BenefitProgramDocument[]> {
      return this.find({
        selector: {
          category: { $eq: category },
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
     * Find active rules for a program
     */
    findRulesByProgram(this: RxCollection<EligibilityRule>, programId: string): Promise<EligibilityRuleDocument[]> {
      const now = Date.now();

      console.log(`🔍 [RULE QUERY DEBUG] findRulesByProgram: Searching for rules with programId: ${programId}`);

      // First, let's see what rules exist in the database at all
      return this.find({}).exec().then(allRules => {
        console.log(`🔍 [RULE QUERY DEBUG] Total rules in database: ${allRules.length}`);
        console.log(`🔍 [RULE QUERY DEBUG] All program IDs in database:`, [...new Set(allRules.map(r => r.programId))]);
        console.log(`🔍 [RULE QUERY DEBUG] All rule IDs in database:`, allRules.map(r => r.id));

        // Check if there are any rules for this specific program
        const programRules = allRules.filter(r => r.programId === programId);
        console.log(`🔍 [RULE QUERY DEBUG] Rules for program ${programId}: ${programRules.length}`);
        programRules.forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.id} (${rule.ruleType}) - Active: ${rule.active}, Effective: ${rule.effectiveDate}, Expiration: ${rule.expirationDate}`);
        });

        // Now run the actual query
        return this.find({
          selector: {
            programId,
            active: true,
            $or: [
              { effectiveDate: { $exists: false } },
              { effectiveDate: { $lte: now } },
            ],
          },
        }).exec().then(rules => {
          console.log(`🔍 [RULE QUERY DEBUG] Query result: Found ${rules.length} active rules for programId: ${programId}`);
          rules.forEach((rule, index) => {
            console.log(`  ${index + 1}. ${rule.id} (${rule.ruleType}) - Priority: ${rule.priority}`);
          });

          // If no rules found, let's debug why
          if (rules.length === 0) {
            console.log(`🔍 [RULE QUERY DEBUG] No rules found. Debugging query conditions:`);
            console.log(`  - programId: ${programId}`);
            console.log(`  - active: true`);
            console.log(`  - effectiveDate: ${now} or not set`);

            // Check each condition separately
            const byProgram = allRules.filter(r => r.programId === programId);
            console.log(`  - Rules with matching programId: ${byProgram.length}`);

            const byActive = byProgram.filter(r => r.active);
            console.log(`  - Rules that are active: ${byActive.length}`);

            const byEffective = byActive.filter(r => !r.effectiveDate || r.effectiveDate <= now);
            console.log(`  - Rules that are effective: ${byEffective.length}`);
          }

          return rules;
        });
      });
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
     * Find results for a user profile
     */
    findResultsByUserProfile(this: RxCollection<EligibilityResult>, userProfileId: string): Promise<EligibilityResultDocument[]> {
      return this.find({
        selector: {
          userProfileId,
        },
        sort: [{ evaluatedAt: 'desc' }],
      }).exec();
    },

    /**
     * Find non-expired results for a user
     */
    findValidResultsByUser(this: RxCollection<EligibilityResult>, userProfileId: string): Promise<EligibilityResultDocument[]> {
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
    async clearExpired(this: RxCollection<EligibilityResult>): Promise<number> {
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
     * Find setting value by key
     */
    async findSettingByKey(this: RxCollection<AppSetting>, key: string): Promise<unknown> {
      const setting = await this.findOne({
        selector: { key },
      }).exec();

      if (!setting) return null;

      // Type assertion needed because RxDB doesn't automatically include method types
      return (setting as AppSettingDocument & { getValue: () => unknown }).getValue();
    },

    /**
     * Set setting value
     */
    async set(this: RxCollection<AppSetting>, key: string, value: unknown, encrypted = false): Promise<void> {
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

