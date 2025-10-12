/**
 * Database Tests
 * 
 * Tests for RxDB database initialization and core functionality.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeDatabase,
  getDatabase,
  destroyDatabase,
  isDatabaseInitialized,
  exportDatabase,
  importDatabase,
} from '../database';

describe('RxDB Database', () => {
  beforeAll(async () => {
    // Initialize database before all tests
    await initializeDatabase('test-password-123');
  });
  
  afterAll(async () => {
    // Clean up after all tests
    await destroyDatabase();
  });
  
  describe('Initialization', () => {
    it('should initialize database successfully', () => {
      expect(isDatabaseInitialized()).toBe(true);
    });
    
    it('should return database instance', () => {
      const db = getDatabase();
      expect(db).toBeDefined();
      expect(db.name).toBe('benefitfinder');
    });
    
    it('should have all required collections', () => {
      const db = getDatabase();
      expect(db.user_profiles).toBeDefined();
      expect(db.benefit_programs).toBeDefined();
      expect(db.eligibility_rules).toBeDefined();
      expect(db.eligibility_results).toBeDefined();
      expect(db.app_settings).toBeDefined();
    });
  });
  
  describe('Database Operations', () => {
    it('should export database', async () => {
      const exportData = await exportDatabase();
      
      expect(exportData).toBeDefined();
      expect(exportData.version).toBeDefined();
      expect(exportData.timestamp).toBeDefined();
      expect(exportData.collections).toBeDefined();
    });
    
    it('should import database', async () => {
      const exportData = await exportDatabase();
      
      // This should not throw
      await expect(importDatabase(exportData)).resolves.not.toThrow();
    });
  });
});

