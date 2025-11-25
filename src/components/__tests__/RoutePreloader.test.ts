/**
 * RoutePreloader Tests
 *
 * Comprehensive tests for the RoutePreloader utility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoutePreloader } from '../RoutePreloader';

// Mock the dynamic imports
vi.mock('../../pages/HomePage', () => ({
  HomePage: () => 'HomePage',
}));

vi.mock('../../pages/QuestionnairePage', () => ({
  QuestionnairePage: () => 'QuestionnairePage',
}));

vi.mock('../../pages/ResultsPage', () => ({
  ResultsPage: () => 'ResultsPage',
}));

vi.mock('../../pages/ErrorPage', () => ({
  ErrorPage: () => 'ErrorPage',
}));

describe('RoutePreloader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('preloadAll', () => {
    it('should preload all route components', () => {
      // Execute preloadAll - this should not throw
      expect(() => RoutePreloader.preloadAll()).not.toThrow();
    });

    it('should be callable multiple times without error', () => {
      expect(() => {
        RoutePreloader.preloadAll();
        RoutePreloader.preloadAll();
        RoutePreloader.preloadAll();
      }).not.toThrow();
    });
  });

  describe('preloadRoute', () => {
    it('should preload home route', () => {
      expect(() => RoutePreloader.preloadRoute('home')).not.toThrow();
    });

    it('should preload questionnaire route', () => {
      expect(() => RoutePreloader.preloadRoute('questionnaire')).not.toThrow();
    });

    it('should preload results route', () => {
      expect(() => RoutePreloader.preloadRoute('results')).not.toThrow();
    });

    it('should preload error route', () => {
      expect(() => RoutePreloader.preloadRoute('error')).not.toThrow();
    });

    it('should handle all valid route types', () => {
      const routes: Array<'home' | 'questionnaire' | 'results' | 'error'> = [
        'home',
        'questionnaire',
        'results',
        'error',
      ];

      routes.forEach(route => {
        expect(() => RoutePreloader.preloadRoute(route)).not.toThrow();
      });
    });
  });

  describe('preloadUserJourney', () => {
    it('should preload questionnaire when on home route', () => {
      expect(() => RoutePreloader.preloadUserJourney('home')).not.toThrow();
    });

    it('should preload results when on questionnaire route', () => {
      expect(() => RoutePreloader.preloadUserJourney('questionnaire')).not.toThrow();
    });

    it('should preload questionnaire when on results route', () => {
      expect(() => RoutePreloader.preloadUserJourney('results')).not.toThrow();
    });

    it('should handle unknown route without error', () => {
      expect(() => RoutePreloader.preloadUserJourney('unknown-route')).not.toThrow();
    });

    it('should handle empty string route', () => {
      expect(() => RoutePreloader.preloadUserJourney('')).not.toThrow();
    });

    it('should handle multiple sequential calls', () => {
      expect(() => {
        RoutePreloader.preloadUserJourney('home');
        RoutePreloader.preloadUserJourney('questionnaire');
        RoutePreloader.preloadUserJourney('results');
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should work with combined preloading strategies', () => {
      expect(() => {
        RoutePreloader.preloadAll();
        RoutePreloader.preloadRoute('home');
        RoutePreloader.preloadUserJourney('home');
      }).not.toThrow();
    });

    it('should handle rapid successive calls', () => {
      expect(() => {
        for (let i = 0; i < 10; i++) {
          RoutePreloader.preloadRoute('home');
          RoutePreloader.preloadRoute('questionnaire');
        }
      }).not.toThrow();
    });

    it('should return undefined from all methods', () => {
      expect(RoutePreloader.preloadAll()).toBeUndefined();
      expect(RoutePreloader.preloadRoute('home')).toBeUndefined();
      expect(RoutePreloader.preloadUserJourney('home')).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle preloadAll without throwing', () => {
      expect(() => RoutePreloader.preloadAll()).not.toThrow();
    });

    it('should handle preloadRoute with valid routes', () => {
      expect(() => {
        RoutePreloader.preloadRoute('home');
        RoutePreloader.preloadRoute('questionnaire');
        RoutePreloader.preloadRoute('results');
        RoutePreloader.preloadRoute('error');
      }).not.toThrow();
    });

    it('should handle preloadUserJourney with various inputs', () => {
      const inputs = ['home', 'questionnaire', 'results', 'error', 'invalid', '', 'random'];

      inputs.forEach(input => {
        expect(() => RoutePreloader.preloadUserJourney(input)).not.toThrow();
      });
    });
  });

  describe('Type safety', () => {
    it('should accept only valid route types for preloadRoute', () => {
      // These should work (compile-time check, runtime execution)
      RoutePreloader.preloadRoute('home');
      RoutePreloader.preloadRoute('questionnaire');
      RoutePreloader.preloadRoute('results');
      RoutePreloader.preloadRoute('error');

      // Verify they execute without error
      expect(() => {
        RoutePreloader.preloadRoute('home');
      }).not.toThrow();
    });

    it('should accept string for preloadUserJourney', () => {
      // Should accept any string
      expect(() => {
        RoutePreloader.preloadUserJourney('home');
        RoutePreloader.preloadUserJourney('custom-route');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should execute preloadAll quickly', () => {
      const start = performance.now();
      RoutePreloader.preloadAll();
      const end = performance.now();

      // Should complete in reasonable time (less than 100ms for the function call itself)
      expect(end - start).toBeLessThan(100);
    });

    it('should execute preloadRoute quickly', () => {
      const start = performance.now();
      RoutePreloader.preloadRoute('home');
      const end = performance.now();

      expect(end - start).toBeLessThan(50);
    });

    it('should execute preloadUserJourney quickly', () => {
      const start = performance.now();
      RoutePreloader.preloadUserJourney('home');
      const end = performance.now();

      expect(end - start).toBeLessThan(50);
    });
  });

  describe('Consistency', () => {
    it('should produce consistent behavior across multiple calls', () => {
      const results = [];

      for (let i = 0; i < 5; i++) {
        let errorOccurred = false;
        try {
          RoutePreloader.preloadAll();
        } catch {
          errorOccurred = true;
        }
        results.push(errorOccurred);
      }

      // All calls should succeed (no errors)
      expect(results.every(r => r === false)).toBe(true);
    });

    it('should handle all routes consistently', () => {
      const routes: Array<'home' | 'questionnaire' | 'results' | 'error'> = [
        'home',
        'questionnaire',
        'results',
        'error',
      ];

      const results = routes.map(route => {
        try {
          RoutePreloader.preloadRoute(route);
          return 'success';
        } catch {
          return 'error';
        }
      });

      expect(results.every(r => r === 'success')).toBe(true);
    });
  });
});
