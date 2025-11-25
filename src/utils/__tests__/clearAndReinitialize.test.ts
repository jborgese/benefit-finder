/**
 * Tests for Clear and Reinitialize Database
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearAndReinitialize } from '../clearAndReinitialize';
import * as db from '../../db';
import * as ruleDiscovery from '../ruleDiscovery';

// Mock the dependencies
vi.mock('../../db', () => ({
  clearDatabase: vi.fn(),
}));

vi.mock('../ruleDiscovery', () => ({
  discoverAndSeedAllRules: vi.fn(),
}));

describe('clearAndReinitialize', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
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
    await clearAndReinitialize();

    // Assert
    expect(db.clearDatabase).toHaveBeenCalledTimes(1);
    expect(ruleDiscovery.discoverAndSeedAllRules).toHaveBeenCalledTimes(1);

    // Verify console output
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[DEBUG] Clearing database and reinitializing with proper program names...'
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Database cleared successfully');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[DEBUG] Reinitialization completed:');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 10 rule files discovered');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 5 programs created');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 8 rule sets imported');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[DEBUG] Database reinitialized with user-friendly program names'
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should log errors when discovery returns errors', async () => {
    // Arrange
    const mockResults = {
      discovered: 10,
      created: 5,
      imported: 8,
      errors: ['Error 1', 'Error 2', 'Error 3'],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    await clearAndReinitialize();

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 3 errors:');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Error 1');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Error 2');
    expect(consoleWarnSpy).toHaveBeenCalledWith('    - Error 3');
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
    await clearAndReinitialize();

    // Assert
    const errorCalls = consoleWarnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('errors:')
    );
    expect(errorCalls).toHaveLength(0);
  });

  it('should handle clearDatabase errors and throw', async () => {
    // Arrange
    const dbError = new Error('Database clear failed');
    vi.mocked(db.clearDatabase).mockRejectedValue(dbError);

    // Act & Assert
    try {
      await clearAndReinitialize();
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBe(dbError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DEBUG] Error during reinitialization:',
        dbError
      );
      expect(db.clearDatabase).toHaveBeenCalledTimes(1);
      expect(ruleDiscovery.discoverAndSeedAllRules).not.toHaveBeenCalled();
    }
  });

  it('should handle discoverAndSeedAllRules errors and throw', async () => {
    // Arrange
    const discoveryError = new Error('Discovery failed');
    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockRejectedValue(discoveryError);

    // Act & Assert
    try {
      await clearAndReinitialize();
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBe(discoveryError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DEBUG] Error during reinitialization:',
        discoveryError
      );
      expect(db.clearDatabase).toHaveBeenCalledTimes(1);
      expect(ruleDiscovery.discoverAndSeedAllRules).toHaveBeenCalledTimes(1);
    }
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
    await clearAndReinitialize();

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 0 rule files discovered');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 0 programs created');
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 0 rule sets imported');
  });

  it('should handle multiple errors in results', async () => {
    // Arrange
    const mockResults = {
      discovered: 15,
      created: 10,
      imported: 12,
      errors: ['Error A', 'Error B', 'Error C', 'Error D', 'Error E'],
    };

    vi.mocked(db.clearDatabase).mockResolvedValue();
    vi.mocked(ruleDiscovery.discoverAndSeedAllRules).mockResolvedValue(mockResults);

    // Act
    await clearAndReinitialize();

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith('  - 5 errors:');
    mockResults.errors.forEach(error => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(`    - ${error}`);
    });
  });

  it('should complete all steps in correct order', async () => {
    // Arrange
    const mockResults = {
      discovered: 7,
      created: 4,
      imported: 6,
      errors: ['Test error'],
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
    await clearAndReinitialize();

    // Assert - verify execution order
    expect(callOrder).toEqual(['clearDatabase', 'discoverAndSeedAllRules']);

    // Verify console logs happened in order
    const calls = consoleWarnSpy.mock.calls.map(call => call[0]);
    expect(calls[0]).toBe('[DEBUG] Clearing database and reinitializing with proper program names...');
    expect(calls[1]).toBe('[DEBUG] Database cleared successfully');
    expect(calls[2]).toBe('[DEBUG] Reinitialization completed:');
  });
});
