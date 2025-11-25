import { describe, it, expect, vi, beforeEach } from 'vitest';

let programs: any[] = [];

function makeDb() {
  return {
    benefit_programs: {
      find: () => ({ exec: async () => programs })
    }
  } as any;
}

// Top-level mocks (hoisted safe)
const initDbMock = vi.fn(async () => {});
const getDbMock = vi.fn(() => makeDb());
const clearDbMock = vi.fn(async () => { programs = []; });
const discoverMock = vi.fn(async () => ({ created: 1, imported: 2, errors: [] }));
const checkNewFilesMock = vi.fn(async () => false);

vi.mock('../db', () => ({
  initializeDatabase: initDbMock,
  getDatabase: getDbMock,
  clearDatabase: clearDbMock,
}));

vi.mock('./ruleDiscovery', () => ({
  discoverAndSeedAllRules: discoverMock,
  checkForNewRuleFiles: checkNewFilesMock,
}));

async function importInitializeApp() {
  const mod = await import('./initializeApp');
  return mod.initializeApp;
}

beforeEach(() => {
  vi.resetModules(); // reset module state (isInitializing)
  programs = [];
  initDbMock.mockReset(); initDbMock.mockImplementation(async () => {});
  getDbMock.mockReset(); getDbMock.mockImplementation(() => makeDb());
  clearDbMock.mockReset(); clearDbMock.mockImplementation(async () => { programs = []; });
  discoverMock.mockReset(); discoverMock.mockImplementation(async () => ({ created: 1, imported: 2, errors: [] }));
  checkNewFilesMock.mockReset(); checkNewFilesMock.mockImplementation(async () => false);
});

describe('initializeApp', () => {
  it('skips re-initialization when already initializing (concurrency wait path)', async () => {
    let resolveInit!: () => void;
    initDbMock.mockImplementationOnce(() => new Promise<void>(r => { resolveInit = r; }));
    const initializeApp = await importInitializeApp();

    const firstPromise = initializeApp();
    const secondPromise = initializeApp();
    resolveInit();
    await firstPromise;
    await secondPromise;
    expect(initDbMock).toHaveBeenCalledTimes(1);
  });

  it('forces re-initialization when already initializing and force option provided', async () => {
    let resolveInit!: () => void;
    initDbMock.mockImplementationOnce(() => new Promise<void>(r => { resolveInit = r; }));
    const initializeApp = await importInitializeApp();
    const firstPromise = initializeApp();
    const secondPromise = initializeApp({ force: true });
    resolveInit();
    await firstPromise; await secondPromise;
    expect(initDbMock).toHaveBeenCalledTimes(2);
  });

  it('clears and reinitializes when programs have technical names', async () => {
    programs = [{ id: 'benefits.test', name: 'benefits.test' }];
    const initializeApp = await importInitializeApp();
    await initializeApp();
    expect(clearDbMock).toHaveBeenCalledTimes(1);
    expect(discoverMock).toHaveBeenCalledTimes(1);
  });

  it('forces discovery when SNAP program present', async () => {
    programs = [{ id: 'snap-federal', name: 'SNAP Federal' }];
    const initializeApp = await importInitializeApp();
    await initializeApp();
    expect(clearDbMock).not.toHaveBeenCalled();
    expect(discoverMock).toHaveBeenCalledTimes(1);
  });

  it('returns early when initialized and no new rule files', async () => {
    programs = [{ id: 'some-program', name: 'Some Program' }];
    checkNewFilesMock.mockResolvedValue(false);
    const initializeApp = await importInitializeApp();
    await initializeApp();
    expect(checkNewFilesMock).toHaveBeenCalledTimes(1);
    expect(discoverMock).not.toHaveBeenCalled();
  });

  it('retries after initialization failure and runs discovery when empty after retry', async () => {
    initDbMock.mockImplementationOnce(async () => { throw new Error('Database initialization failed: test'); });
    // second call succeeds (default impl)
    const initializeApp = await importInitializeApp();
    await initializeApp();
    expect(initDbMock).toHaveBeenCalledTimes(2);
    expect(clearDbMock).toHaveBeenCalledTimes(1);
    expect(discoverMock).toHaveBeenCalledTimes(1);
  });

  it('retries after failure and returns early when programs exist after retry', async () => {
    initDbMock.mockImplementationOnce(async () => { throw new Error('Database initialization failed: test'); });
    // After retry populate programs before discovery
    initDbMock.mockImplementationOnce(async () => { programs = [{ id: 'seeded-program', name: 'Seeded Program' }]; });
    const initializeApp = await importInitializeApp();
    await initializeApp();
    expect(initDbMock).toHaveBeenCalledTimes(2);
    expect(clearDbMock).toHaveBeenCalledTimes(1);
    expect(discoverMock).not.toHaveBeenCalled();
  });
});
