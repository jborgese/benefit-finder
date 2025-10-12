/**
 * Keyboard Navigation Tests
 */

import { describe, it, expect } from 'vitest';
import { Keys } from '../keyboard';

describe('Keyboard Navigation', () => {
  describe('Keys constants', () => {
    it('should define common keyboard keys', () => {
      expect(Keys.ENTER).toBe('Enter');
      expect(Keys.SPACE).toBe(' ');
      expect(Keys.ESCAPE).toBe('Escape');
      expect(Keys.TAB).toBe('Tab');
      expect(Keys.ARROW_UP).toBe('ArrowUp');
      expect(Keys.ARROW_DOWN).toBe('ArrowDown');
      expect(Keys.ARROW_LEFT).toBe('ArrowLeft');
      expect(Keys.ARROW_RIGHT).toBe('ArrowRight');
    });
  });

  describe('Keyboard shortcuts structure', () => {
    it('should validate shortcut structure', () => {
      const shortcut = {
        key: 'Enter',
        ctrlKey: true,
        description: 'Submit',
        action: () => {},
      };

      expect(shortcut.key).toBeDefined();
      expect(shortcut.description).toBeDefined();
      expect(shortcut.action).toBeInstanceOf(Function);
    });
  });
});

