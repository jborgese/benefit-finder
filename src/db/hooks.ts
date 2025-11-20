/**
 * RxDB React Hooks
 *
 * Custom React hooks for integrating RxDB with React components.
 * Provides reactive data access with automatic re-rendering.
 */

import { useEffect, useState } from 'react';
import type { RxDocument, RxQuery, MangoQuery } from 'rxdb';
import { getDatabase, isDatabaseInitialized, type BenefitFinderDatabase } from './database';
import type {
  UserProfile,
  BenefitProgram,
  EligibilityRule,
  EligibilityResult,
  AppSetting,
} from './schemas';

/**
 * Hook to access the database instance
 *
 * @returns Database instance or null if not initialized
 */
export function useDatabase(): BenefitFinderDatabase | null {
  if (!isDatabaseInitialized()) {
    return null;
  }

  try {
    return getDatabase();
  } catch (error) {
    console.warn('Database not available:', error);
    return null;
  }
}

/**
 * Generic hook for reactive RxDB queries
 *
 * @param queryConstructor Function that returns an RxQuery
 * @returns Query results and loading state
 */
export function useRxQuery<T>(
  queryConstructor: () => RxQuery<T, RxDocument<T>[]> | null
): {
  result: RxDocument<T>[];
  isFetching: boolean;
} {
  const [result, setResult] = useState<RxDocument<T>[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(true);

    const query = queryConstructor();

    if (!query) {
      setResult([]);
      setIsFetching(false);
      return;
    }

    // Subscribe to query results
    const subscription = query.$.subscribe((docs) => {
      setResult(docs);
      setIsFetching(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryConstructor]);

  return { result, isFetching };
}

/**
 * Hook for reactive single document queries
 *
 * @param queryConstructor Function that returns an RxQuery for a single document
 * @returns Document and loading state
 */
export function useRxDocument<T>(
  queryConstructor: () => RxQuery<T, RxDocument<T> | null> | null
): {
  result: RxDocument<T> | null;
  isFetching: boolean;
} {
  const [result, setResult] = useState<RxDocument<T> | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(true);

    const query = queryConstructor();

    if (!query) {
      setResult(null);
      setIsFetching(false);
      return;
    }

    // Subscribe to query result
    const subscription = query.$.subscribe((doc) => {
      setResult(doc);
      setIsFetching(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryConstructor]);

  return { result, isFetching };
}

/**
 * Hook to fetch user profiles
 *
 * @returns User profiles and loading state
 */
export function useUserProfiles(): {
  result: RxDocument<UserProfile>[];
  isFetching: boolean;
} {
  const db = useDatabase();

  return useRxQuery<UserProfile>(() =>
    db ? db.user_profiles.find({
      sort: [{ updatedAt: 'desc' }],
    }) : null
  );
}

/**
 * Hook to fetch a single user profile by ID
 *
 * @param profileId Profile ID
 * @returns User profile and loading state
 */
export function useUserProfile(profileId: string | null): {
  result: RxDocument<UserProfile> | null;
  isFetching: boolean;
} {
  const db = useDatabase();

  return useRxDocument<UserProfile>(() =>
    db && profileId
      ? db.user_profiles.findOne({
          selector: { id: profileId },
        })
      : null
  );
}

/**
 * Hook to fetch active benefit programs
 *
 * @param jurisdiction Optional jurisdiction filter
 * @returns Benefit programs and loading state
 */
export function useBenefitPrograms(jurisdiction?: string): {
  result: RxDocument<BenefitProgram>[];
  isFetching: boolean;
} {
  const db = useDatabase();

  return useRxQuery<BenefitProgram>(() => {
    if (!db) {return null;}

    const query: MangoQuery<BenefitProgram> = {
      selector: {
        active: true,
        ...(jurisdiction && { jurisdiction }),
      },
      sort: [{ name: 'asc' }],
    };

    return db.benefit_programs.find(query);
  });
}

/**
 * Hook to fetch eligibility rules for a program
 *
 * @param programId Program ID
 * @returns Eligibility rules and loading state
 */
export function useEligibilityRules(programId: string | null): {
  result: RxDocument<EligibilityRule>[];
  isFetching: boolean;
} {
  const db = useDatabase();

  return useRxQuery<EligibilityRule>(() =>
    db && programId
      ? db.eligibility_rules.find({
          selector: { programId, active: true },
        })
      : null
  );
}

/**
 * Hook to fetch eligibility results for a user profile
 *
 * @param userProfileId User profile ID
 * @returns Eligibility results and loading state
 */
export function useEligibilityResults(userProfileId: string | null): {
  result: RxDocument<EligibilityResult>[];
  isFetching: boolean;
} {
  const db = useDatabase();

  return useRxQuery<EligibilityResult>(() =>
    db && userProfileId
      ? db.eligibility_results.find({
          selector: { userProfileId },
          sort: [{ evaluatedAt: 'desc' }],
        })
      : null
  );
}

/**
 * Hook to fetch a specific app setting
 *
 * @param key Setting key
 * @returns Setting value and loading state
 */
export function useAppSetting(key: string): {
  value: unknown | null;
  isFetching: boolean;
} {
  const db = useDatabase();
  const { result, isFetching } = useRxDocument<AppSetting>(() =>
    db ? db.app_settings.findOne({
      selector: { key },
    }) : null
  );

  return {
    value: result ? result.value : null,
    isFetching,
  };
}

