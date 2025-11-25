/**
 * Tests for Force Fix Program Names
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { forceFixProgramNames } from '../forceFixProgramNames';
import * as db from '../../db';
import * as ruleDiscovery from '../ruleDiscovery';

// Mock the dependencies
vi.mock('../../db', () => ({
  clearDatabase: vi.fn(),
}));

vi.mock('../ruleDiscovery', () => ({
  discoverAndSeedAllRules: vi.fn(),
}));

describe('forceFixProgramNames', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock timers for setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should successfully clear database and reinitialize with proper names', async () => {
    // Arrange
    const mockResults = {
      discovered: 10,
      created: 5,
      imported: 8,
      errors: [],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    const promise = forceFixProgramNames();

    // Fast-forward through the setTimeout
    await vi.runAllTimersAsync();

    await promise;

    // Assert
    expect(db.clearDatabase).toHaveBeenCalledTimes(1);
    expect(ruleDiscovery.discoverAndSeedAllRules).toHaveBeenCalledTimes(1);

    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Force fixing program names...');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Clearing database...');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Database cleared successfully');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Reinitializing with proper program names...');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Force fix completed:');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 10 rule files discovered');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 5 programs created');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 8 rule sets imported');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Program names have been fixed! Please refresh the page.');
  });

  it('should log errors when discovery returns errors', async () => {
    // Arrange
    const mockResults = {
      discovered: 10,
      created: 5,
      imported: 7,
      errors: ['Error loading rule 1', 'Error loading rule 2'],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    const promise = forceFixProgramNames();
    await vi.runAllTimersAsync();
    await promise;

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 2 errors:');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Error loading rule 1');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Error loading rule 2');
  });

  it('should not log error section when there are no errors', async () => {
    // Arrange
    const mockResults = {
      discovered: 5,
      created: 3,
      imported: 4,
      errors: [],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    const promise = forceFixProgramNames();
    await vi.runAllTimersAsync();
    await promise;

    // Assert
    const errorsCalls = consoleWarnSpy.mock.calls.filter(call =>
      typeof call[0] === 'string' && call[0].includes('errors:')
    );
    expect(errorsCalls).toHaveLength(0);
  });

  it('should handle clearDatabase errors and throw', async () => {
    // Arrange
    vi.mocked(db.clearDatabase).mockImplementation(() => Promise.reject(new Error('Database clear failed')));

    // Act & Assert
    let thrownError: Error | null = null;
    try {
      const promise = forceFixProgramNames();
      await vi.runAllTimersAsync();
      await promise;
    } catch (error) {
      thrownError = error as Error;
    }

    expect(thrownError).toBeInstanceOf(Error);
    expect(thrownError?.message).toBe('Database clear failed');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[DEBUG] Error during force fix:', expect.any(Error));
    expect(ruleDiscovery.discoverAndSeedAllRules).not.toHaveBeenCalled();
  });

  it('should handle discoverAndSeedAllRules errors and throw', async () => {
    // Arrange
    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockImplementation(() => Promise.reject(new Error('Discovery failed')));

    // Act & Assert
    let thrownError: Error | null = null;
    try {
      const promise = forceFixProgramNames();
      await vi.runAllTimersAsync();
      await promise;
    } catch (error) {
      thrownError = error as Error;
    }

    expect(thrownError).toBeInstanceOf(Error);
    expect(thrownError?.message).toBe('Discovery failed');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[DEBUG] Error during force fix:', expect.any(Error));
    expect(db.clearDatabase).toHaveBeenCalledTimes(1);
  });

  it('should wait 1000ms between clearing and reinitializing', async () => {
    // Arrange
    const mockResults = {
      discovered: 3,
      created: 2,
      imported: 3,
      errors: [],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    const promise = forceFixProgramNames();

    // Assert - discovery should not be called yet
    expect(ruleDiscovery.discoverAndSeedAllRules).not.toHaveBeenCalled();

    // Fast-forward 500ms - still shouldn't be called
    await vi.advanceTimersByTimeAsync(500);
    expect(ruleDiscovery.discoverAndSeedAllRules).not.toHaveBeenCalled();

    // Fast-forward the remaining 500ms
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    // Now it should be called
    expect(ruleDiscovery.discoverAndSeedAllRules).toHaveBeenCalledTimes(1);
  });

  it('should handle results with zero values correctly', async () => {
    // Arrange
    const mockResults = {
      discovered: 0,
      created: 0,
      imported: 0,
      errors: [],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    const promise = forceFixProgramNames();
    await vi.runAllTimersAsync();
    await promise;

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 0 rule files discovered');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 0 programs created');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 0 rule sets imported');
  });

  it('should handle multiple errors in results', async () => {
    // Arrange
    const mockResults = {
      discovered: 15,
      created: 8,
      imported: 10,
      errors: [
        'Failed to load SNAP rules',
        'Failed to load WIC rules',
        'Failed to load Medicaid rules',
      ],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    const promise = forceFixProgramNames();
    await vi.runAllTimersAsync();
    await promise;

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 3 errors:');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Failed to load SNAP rules');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Failed to load WIC rules');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Failed to load Medicaid rules');
  });

  it('should complete all steps in correct order', async () => {
    // Arrange
    const mockResults = {
      discovered: 5,
      created: 3,
      imported: 4,
      errors: [],
    };

    const callOrder: string[] = [];

    vi.mocked(db.clearDatabase).mockImplementation(async () => {
      callOrder.push('clearDatabase');
    });

    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockImplementation(async () => {
      callOrder.push('discoverAndSeedAllRules');
      return mockResults;
    });

    // Act
    const promise = forceFixProgramNames();
    await vi.runAllTimersAsync();
    await promise;

    // Assert
    expect(callOrder).toEqual(['clearDatabase', 'discoverAndSeedAllRules']);
  });
});
