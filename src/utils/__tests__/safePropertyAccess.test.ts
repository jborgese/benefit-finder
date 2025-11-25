/**
 * Tests for Safe Property Access Utilities
 */

import { describe, it, expect } from 'vitest';
import { hasOwnProperty, safeGetProperty, hasProperty } from '../safePropertyAccess';

describe('safePropertyAccess', () => {
  describe('hasOwnProperty', () => {
    it('should return true for own properties', () => {
      const obj = { name: 'test', value: 42 };
      expect(hasOwnProperty(obj, 'name')).toBe(true);
      expect(hasOwnProperty(obj, 'value')).toBe(true);
    });

    it('should return false for inherited properties', () => {
      const obj = Object.create({ inherited: 'value' });
      expect(hasOwnProperty(obj, 'inherited')).toBe(false);
    });

    it('should return false for non-existent properties', () => {
      const obj = { name: 'test' };
      expect(hasOwnProperty(obj, 'missing')).toBe(false);
    });

    it('should work with symbol keys', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      expect(hasOwnProperty(obj, sym)).toBe(true);
    });

    it('should work with number keys', () => {
      const obj = { 0: 'zero', 1: 'one' };
      expect(hasOwnProperty(obj, 0)).toBe(true);
      expect(hasOwnProperty(obj, 1)).toBe(true);
      expect(hasOwnProperty(obj, 2)).toBe(false);
    });

    it('should use Object.hasOwn when available', () => {
      const obj = { test: 'value' };
      // Object.hasOwn is available in modern environments
      const result = hasOwnProperty(obj, 'test');
      expect(result).toBe(true);
    });

    it('should fallback to Object.prototype.hasOwnProperty.call when Object.hasOwn is not available', () => {
      const obj = { test: 'value' };

      // Temporarily mock Object to simulate older environment
      const originalHasOwn = (Object as any).hasOwn;
      delete (Object as any).hasOwn;

      const result = hasOwnProperty(obj, 'test');
      expect(result).toBe(true);

      // Restore
      if (originalHasOwn) {
        (Object as any).hasOwn = originalHasOwn;
      }
    });
  });

  describe('safeGetProperty', () => {
    it('should return property value for existing string keys', () => {
      const obj = { name: 'test', value: 42 };
      expect(safeGetProperty(obj, 'name')).toBe('test');
      expect(safeGetProperty(obj, 'value')).toBe(42);
    });

    it('should return undefined for non-existent properties', () => {
      const obj = { name: 'test' };
      expect(safeGetProperty(obj, 'missing' as any)).toBeUndefined();
    });

    it('should return undefined for inherited properties', () => {
      const proto = { inherited: 'value' };
      const obj = Object.create(proto);
      obj.own = 'ownValue';

      expect(safeGetProperty(obj, 'own')).toBe('ownValue');
      expect(safeGetProperty(obj, 'inherited' as any)).toBeUndefined();
    });

    it('should work with number keys', () => {
      const obj = { 0: 'zero', 1: 'one', 2: 'two' };
      expect(safeGetProperty(obj, 0 as any)).toBe('zero');
      expect(safeGetProperty(obj, 1 as any)).toBe('one');
    });

    it('should work with symbol keys', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'symbolValue' };
      expect(safeGetProperty(obj, sym as any)).toBe('symbolValue');
    });

    it('should return falsy values correctly', () => {
      const obj = { zero: 0, empty: '', nullValue: null, falseValue: false };
      expect(safeGetProperty(obj, 'zero')).toBe(0);
      expect(safeGetProperty(obj, 'empty')).toBe('');
      expect(safeGetProperty(obj, 'nullValue')).toBe(null);
      expect(safeGetProperty(obj, 'falseValue')).toBe(false);
    });

    it('should handle objects with null prototype', () => {
      const obj = Object.create(null);
      obj.test = 'value';
      expect(safeGetProperty(obj, 'test')).toBe('value');
    });

    it('should safely handle nested objects', () => {
      const obj = { nested: { deep: { value: 'found' } } };
      expect(safeGetProperty(obj, 'nested')).toEqual({ deep: { value: 'found' } });
    });
  });

  describe('hasProperty', () => {
    it('should return true for own properties', () => {
      const obj = { name: 'test', value: 42 };
      expect(hasProperty(obj, 'name')).toBe(true);
      expect(hasProperty(obj, 'value')).toBe(true);
    });

    it('should return true for inherited properties', () => {
      const proto = { inherited: 'value' };
      const obj = Object.create(proto);
      expect(hasProperty(obj, 'inherited')).toBe(true);
    });

    it('should return false for non-existent properties', () => {
      const obj = { name: 'test' };
      expect(hasProperty(obj, 'missing')).toBe(false);
    });

    it('should work with symbol keys', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      expect(hasProperty(obj, sym)).toBe(true);
    });

    it('should work with number keys', () => {
      const obj = { 0: 'zero', 1: 'one' };
      expect(hasProperty(obj, 0)).toBe(true);
      expect(hasProperty(obj, 1)).toBe(true);
      expect(hasProperty(obj, 2)).toBe(false);
    });

    it('should return true for properties from Object.prototype', () => {
      const obj = {};
      expect(hasProperty(obj, 'toString')).toBe(true);
      expect(hasProperty(obj, 'hasOwnProperty')).toBe(true);
    });

    it('should handle arrays correctly', () => {
      const arr = ['a', 'b', 'c'];
      expect(hasProperty(arr, 0)).toBe(true);
      expect(hasProperty(arr, 2)).toBe(true);
      expect(hasProperty(arr, 'length')).toBe(true);
      expect(hasProperty(arr, 100)).toBe(false);
    });
  });
});
