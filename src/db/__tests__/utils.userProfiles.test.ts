import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock the database module that `utils.ts` imports
const mockInsert = vi.fn(async (doc: Record<string, unknown>) => doc);
const mockFindOneExec = vi.fn();

const mockDb = {
  user_profiles: {
    insert: mockInsert,
    find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }),
    findOne: vi.fn().mockImplementation(() => ({ exec: mockFindOneExec })),
  },
};

vi.mock('../database', () => ({
  getDatabase: () => mockDb,
}));

// Import the functions under test after mocking
import { createUserProfile, updateUserProfile } from '../utils';

describe('user_profiles utils', () => {
  beforeEach(() => {
    mockInsert.mockClear();
    // reset findOne exec
    mockFindOneExec.mockClear();
  });

  it('defaults householdIncome to 0 when creating a profile with null income', async () => {
    const input = {
      householdSize: 1,
      householdIncome: null,
      state: 'GA',
    } as const;

    await createUserProfile(input as any);

    expect(mockInsert).toHaveBeenCalled();
    const inserted = mockInsert.mock.calls[0][0];
    expect(inserted.householdIncome).toBe(0);
  });

  it('defaults householdIncome to 0 when updating a profile with null income', async () => {
    // Mock an existing profile document with an update method
    const updateMock = vi.fn(async (_payload: unknown) => ({ updated: true }));
    const fakeProfile = { update: updateMock };

    mockFindOneExec.mockResolvedValue(fakeProfile);

    const profileId = 'test-profile-1';
    const data = { householdIncome: null } as const;

    await updateUserProfile(profileId, data as any);

    expect(mockFindOneExec).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalled();
    const updateArg = updateMock.mock.calls[0][0];
    expect(updateArg.$set.householdIncome).toBe(0);
  });
});
