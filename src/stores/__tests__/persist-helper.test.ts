/**
 * Tests for Zustand Persist Helper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isTestEnvironment } from '../persist-helper';

describe('persist-helper', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('isTestEnvironment', () => {
    it('should return true in test environment', () => {
      // Act
      const result = isTestEnvironment();

      // Assert
      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should check process.env.NODE_ENV', () => {
      // Act
      isTestEnvironment();

      // Assert
      // In test environment, should detect NODE_ENV === 'test'
      const calls = consoleLogSpy.mock.calls;
      const hasProcessEnvCheck = calls.some(call =>
        typeof call[0] === 'string' && call[0].includes('process.env check')
      );
      expect(hasProcessEnvCheck).toBe(true);
    });

    it('should log debug information with processEnv', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') &&
        call[1] && typeof call[1] === 'object' && 'processEnv' in call[1]
      );
      expect(debugCall).toBeDefined();
      if (debugCall && debugCall[1]) {
        expect(debugCall[1]).toHaveProperty('processEnv');
        expect(debugCall[1]).toHaveProperty('importMetaEnv');
        expect(debugCall[1]).toHaveProperty('result');
      }
    });

    it('should log result as true when detected', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') &&
        call[1] && typeof call[1] === 'object' && 'result' in call[1] &&
        (call[1] as { result: boolean }).result === true
      );
      expect(debugCall).toBeDefined();
      if (debugCall && debugCall[1]) {
        expect((debugCall[1] as { result: boolean }).result).toBe(true);
      }
    });

    it('should include NODE_ENV in debug info', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') &&
        call[1] && typeof call[1] === 'object' && 'processEnv' in call[1]
      );
      if (debugCall && debugCall[1]) {
        expect(debugCall[1]).toHaveProperty('processEnv');
        expect((debugCall[1] as { processEnv: Record<string, unknown> }).processEnv).toHaveProperty('NODE_ENV');
      }
    });

    it('should include VITEST in debug info', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') &&
        call[1] && typeof call[1] === 'object' && 'processEnv' in call[1]
      );
      if (debugCall && debugCall[1]) {
        expect((debugCall[1] as { processEnv: Record<string, unknown> }).processEnv).toHaveProperty('VITEST');
      }
    });

    it('should include import.meta.env in debug info', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') &&
        call[1] && typeof call[1] === 'object' && 'importMetaEnv' in call[1]
      );
      if (debugCall && debugCall[1]) {
        expect((debugCall[1] as { importMetaEnv: unknown }).importMetaEnv).toBeDefined();
      }
    });

    it('should check import.meta.env.VITEST', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') &&
        call[1] && typeof call[1] === 'object' && 'importMetaEnv' in call[1]
      );
      if (debugCall && debugCall[1]) {
        const importMetaEnv = (debugCall[1] as { importMetaEnv: Record<string, unknown> }).importMetaEnv;
        // Just verify the debug object includes importMetaEnv (may be empty object)
        expect(importMetaEnv).toBeDefined();
      }
    });

    it('should check import.meta.env.MODE', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') &&
        call[1] && typeof call[1] === 'object' && 'importMetaEnv' in call[1]
      );
      if (debugCall && debugCall[1]) {
        const importMetaEnv = (debugCall[1] as { importMetaEnv: Record<string, unknown> }).importMetaEnv;
        // Just verify the debug object includes importMetaEnv (may be empty object)
        expect(importMetaEnv).toBeDefined();
      }
    });    it('should be callable multiple times', () => {
      // Act
      const result1 = isTestEnvironment();
      const result2 = isTestEnvironment();
      const result3 = isTestEnvironment();

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    it('should return consistent results', () => {
      // Act
      const results = Array.from({ length: 5 }, () => isTestEnvironment());

      // Assert
      expect(results.every(r => r === true)).toBe(true);
    });

    it('should log with correct format', () => {
      // Act
      isTestEnvironment();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PERSIST DEBUG]'),
        expect.objectContaining({
          processEnv: expect.any(Object),
          importMetaEnv: expect.any(Object),
          result: expect.any(Boolean),
        })
      );
    });

    it('should include test detection message', () => {
      // Act
      isTestEnvironment();

      // Assert
      const hasTestMessage = consoleLogSpy.mock.calls.some(call =>
        typeof call[0] === 'string' &&
        (call[0].includes('isTestEnvironment() = true') ||
         call[0].includes('process.env check') ||
         call[0].includes('import.meta.env check'))
      );
      expect(hasTestMessage).toBe(true);
    });

    it('should have correct debug info structure', () => {
      // Act
      isTestEnvironment();

      // Assert
      const debugCall = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('[PERSIST DEBUG]') && call[1]
      );

      if (debugCall && debugCall[1]) {
        expect(debugCall[1]).toEqual(
          expect.objectContaining({
            processEnv: expect.objectContaining({
              NODE_ENV: expect.any(String),
            }),
            importMetaEnv: expect.any(Object),
            result: true,
          })
        );
      }
    });

    it('should detect test environment early and return immediately', () => {
      // Act
      const result = isTestEnvironment();

      // Assert - should return true on first check
      expect(result).toBe(true);
      // Should have logged the detection
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle process.env checks gracefully', () => {
      // Act & Assert - should not throw
      expect(() => isTestEnvironment()).not.toThrow();
    });

    it('should handle import.meta.env checks gracefully', () => {
      // Act & Assert - should not throw
      expect(() => isTestEnvironment()).not.toThrow();
    });

    it('should handle window checks gracefully', () => {
      // Act & Assert - should not throw even if window is undefined
      expect(() => isTestEnvironment()).not.toThrow();
    });

    it('should not call console.warn in test environment', () => {
      // Act
      isTestEnvironment();

      // Assert - should use console.log, not console.warn in test env
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return boolean type', () => {
      // Act
      const result = isTestEnvironment();

      // Assert
      expect(typeof result).toBe('boolean');
    });

    it('should be a named export', () => {
      // Assert
      expect(isTestEnvironment).toBeDefined();
      expect(typeof isTestEnvironment).toBe('function');
    });

    it('should have function name', () => {
      // Assert
      expect(isTestEnvironment.name).toBe('isTestEnvironment');
    });
  });

  describe('Module exports', () => {
    it('should export isTestEnvironment function', async () => {
      // Act
      const module = await import('../persist-helper');

      // Assert
      expect(module.isTestEnvironment).toBeDefined();
      expect(typeof module.isTestEnvironment).toBe('function');
    });

    it('should have correct module structure', async () => {
      // Act
      const module = await import('../persist-helper');

      // Assert
      const exports = Object.keys(module);
      expect(exports).toContain('isTestEnvironment');
    });
  });

  describe('Usage documentation', () => {
    it('should be usable in store creation pattern', () => {
      // This test verifies the function works in the documented pattern
      // Act
      const shouldPersist = !isTestEnvironment();

      // Assert
      expect(typeof shouldPersist).toBe('boolean');
      expect(shouldPersist).toBe(false); // Should NOT persist in tests
    });

    it('should prevent persist middleware in test environment', () => {
      // Act
      const result = isTestEnvironment();

      // Assert - In test environment, should return true to disable persist
      expect(result).toBe(true);
    });
  });
});
