/**
 * Database Usage Examples
 *
 * Demonstrates how to use RxDB in React components.
 */

import { useState, useEffect, type FormEvent, type ReactNode, type ReactElement } from 'react';
import {
  useUserProfiles,
  useUserProfile,
  useBenefitPrograms,
  useEligibilityResults,
} from '../hooks';
import {
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '../utils';

/**
 * Example 1: Display User Profiles
 * Shows reactive query that auto-updates
 */
export function UserProfilesList(): ReactElement {
  const { result: profiles, isFetching } = useUserProfiles();

  if (isFetching) {
    return <div className="text-secondary-600">Loading profiles...</div>;
  }

  if (profiles.length === 0) {
    return <div className="text-secondary-500">No profiles found</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-secondary-900">User Profiles</h2>
      {profiles.map((profile) => (
        <div key={profile.id} className="p-4 border rounded-lg bg-white shadow">
          <h3 className="text-lg font-semibold">{profile.firstName} {profile.lastName}</h3>
          <p className="text-sm text-secondary-600">
            Household Size: {profile.householdSize ?? 'N/A'}
          </p>
          <p className="text-xs text-secondary-500">
            Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 2: Create User Profile Form
 * Demonstrates creating documents
 */
export function CreateProfileForm(): ReactElement {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [householdIncome, setHouseholdIncome] = useState<number>(0);
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createUserProfile({
        firstName,
        lastName,
        dateOfBirth,
        householdSize,
        householdIncome,
        state,
        zipCode: '',
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setHouseholdSize(1);
      setHouseholdIncome(0);
      setState('');
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to create profile: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Create Profile</h2>

      {error && (
        <div className="p-3 bg-error-50 border border-error-500 text-error-900 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-success-50 border border-success-500 text-success-900 rounded">
          Profile created successfully!
        </div>
      )}

      <div>
        <label htmlFor="firstName" className="block text-sm font-medium mb-1">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium mb-1">
          Date of Birth
        </label>
        <input
          id="dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="householdSize" className="block text-sm font-medium mb-1">
          Household Size
        </label>
        <input
          id="householdSize"
          type="number"
          min="1"
          value={householdSize}
          onChange={(e) => setHouseholdSize(parseInt(e.target.value, 10))}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="householdIncome" className="block text-sm font-medium mb-1">
          Annual Household Income ($)
        </label>
        <input
          id="householdIncome"
          type="number"
          min="0"
          value={householdIncome}
          onChange={(e) => setHouseholdIncome(parseInt(e.target.value, 10))}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium mb-1">
          State
        </label>
        <input
          id="state"
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="e.g., GA"
          required
          maxLength={2}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 min-h-touch"
      >
        {loading ? 'Creating...' : 'Create Profile'}
      </button>
    </form>
  );
}

/**
 * Example 3: Edit Profile
 * Demonstrates updating documents
 */
export function EditProfileButton({ profileId }: { profileId: string }): ReactElement {
  const { result: profile, isFetching } = useUserProfile(profileId);
  const [editing, setEditing] = useState(false);
  const [income, setIncome] = useState<number>(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setIncome(profile.householdIncome ?? 0);
    }
  }, [profile]);

  const handleUpdate = async (): Promise<void> => {
    try {
      await updateUserProfile(profileId, {
        householdIncome: income,
      });
      setEditing(false);
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to update: ${err}`);
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  if (!editing) {
    return (
      <div className="space-y-2">
        {success && (
          <div className="p-2 bg-success-50 border border-success-500 text-success-900 rounded text-sm">
            Profile updated!
          </div>
        )}
        {error && (
          <div className="p-2 bg-error-50 border border-error-500 text-error-900 rounded text-sm">
            {error}
          </div>
        )}
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Edit Income
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="number"
        value={income}
        onChange={(e) => setIncome(parseInt(e.target.value, 10))}
        className="px-4 py-2 border rounded-lg"
      />
      <div className="flex gap-2">
        <button
          onClick={() => { void handleUpdate(); }}
          className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-2 bg-secondary-200 text-secondary-900 rounded-lg hover:bg-secondary-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Example 4: Delete Profile with Confirmation
 * Demonstrates deleting documents
 */
export function DeleteProfileButton({ profileId }: { profileId: string }): ReactElement {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    setError(null);

    try {
      await deleteUserProfile(profileId);
      setSuccess(true);
      setConfirming(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to delete: ${err}`);
    } finally {
      setDeleting(false);
    }
  };

  if (success) {
    return (
      <div className="p-2 bg-success-50 border border-success-500 text-success-900 rounded text-sm">
        Profile deleted successfully
      </div>
    );
  }

  if (!confirming) {
    return (
      <div className="space-y-2">
        {error && (
          <div className="p-2 bg-error-50 border border-error-500 text-error-900 rounded text-sm">
            {error}
          </div>
        )}
        <button
          onClick={() => setConfirming(true)}
          className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700"
        >
          Delete Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-error-600">Are you sure? This cannot be undone.</p>
      {error && (
        <div className="p-2 bg-error-50 border border-error-500 text-error-900 rounded text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => { void handleDelete(); }}
          disabled={deleting}
          className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-4 py-2 bg-secondary-200 text-secondary-900 rounded-lg hover:bg-secondary-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Example 5: Benefit Programs List
 * Demonstrates querying with filters
 */
export function BenefitProgramsList({ jurisdiction }: { jurisdiction?: string }): ReactElement {
  const { result: programs, isFetching } = useBenefitPrograms(jurisdiction);

  if (isFetching) {
    return <div className="text-secondary-600">Loading programs...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Available Programs {jurisdiction && `in ${jurisdiction}`}
      </h2>

      {programs.length === 0 ? (
        <p className="text-secondary-500">No programs found</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <div key={program.id} className="p-4 border rounded-lg bg-white shadow">
              <h3 className="text-lg font-semibold">{program.name}</h3>
              <p className="text-sm text-secondary-600 mt-1">{program.description}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                  {program.category}
                </span>
                <span className="px-2 py-1 text-xs bg-secondary-100 text-secondary-800 rounded">
                  {program.jurisdiction}
                </span>
              </div>
              {program.website && (
                <a
                  href={program.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-primary-600 hover:text-primary-700"
                >
                  Learn More →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Eligibility Results Display
 * Demonstrates complex queries and encrypted data
 */
export function EligibilityResultsList({ userProfileId }: { userProfileId: string }): ReactElement {
  const { result: results, isFetching } = useEligibilityResults(userProfileId);
  const { result: programs } = useBenefitPrograms();

  if (isFetching) {
    return <div className="text-secondary-600">Loading results...</div>;
  }

  // Create lookup map for program names
  const programMap = new Map(programs.map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Eligibility Results</h2>

      {results.length === 0 ? (
        <p className="text-secondary-500">No results yet. Complete the questionnaire to check eligibility.</p>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const program = programMap.get(result.programId);
            const isExpired = result.expiresAt ? Date.now() > result.expiresAt : false;

            return (
              <div
                key={result.id}
                className={`p-4 border rounded-lg ${result.eligible
                    ? 'bg-success-50 border-success-500'
                    : 'bg-neutral-50 border-neutral-300'
                  } ${isExpired ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {program?.name ?? 'Unknown Program'}
                    </h3>
                    <p className={`text-sm font-medium ${result.eligible ? 'text-success-700' : 'text-secondary-700'
                      }`}>
                      {result.eligible ? '✓ You may be eligible!' : '✗ May not qualify'}
                    </p>
                    {result.reason && (
                      <p className="text-sm text-secondary-600 mt-1">{result.reason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-right">
                      <span className="text-lg font-bold text-secondary-900">
                        {(() => {
                          if (result.confidence >= 90) return result.eligible ? 'Strong Match' : 'Clear Mismatch';
                          if (result.confidence >= 70) return result.eligible ? 'Good Match' : 'Likely Ineligible';
                          return 'Uncertain';
                        })()}
                      </span>
                      <p className="text-xs text-secondary-500">assessment</p>
                    </div>
                  </div>
                </div>

                {isExpired && (
                  <p className="mt-2 text-xs text-warning-700">
                    This result has expired. Please check eligibility again.
                  </p>
                )}

                {result.nextSteps && result.nextSteps.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Next Steps:</p>
                    <ul className="mt-1 text-sm text-secondary-700 list-disc list-inside">
                      {result.nextSteps.map((step, idx) => (
                        <li key={idx}>{typeof step === 'string' ? step : step.step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Initialize Database in App
 * Shows how to set up database when app starts
 */
export function DatabaseInitializer({ children }: { children: ReactNode }): ReactElement {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        const { initializeDatabase } = await import('../database');
        await initializeDatabase();
        setInitialized(true);
      } catch (err) {
        setError(`Failed to initialize database: ${err}`);
        console.error('Database initialization error:', err);
      }
    };

    void init();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-error-50 border border-error-500 text-error-900 rounded">
        <h2 className="text-lg font-bold">Database Error</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-secondary-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

