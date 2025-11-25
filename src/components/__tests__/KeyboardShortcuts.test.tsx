/**
 * KeyboardShortcuts Component Tests
 *
 * Tests for keyboard shortcuts component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import * as useThemeModule from '../../contexts/useTheme';
import * as useTextSizeModule from '../../contexts/useTextSize';

// Mock the hooks
const mockToggleTheme = vi.fn();
const mockIncreaseTextSize = vi.fn();
const mockDecreaseTextSize = vi.fn();
const mockResetTextSize = vi.fn();

vi.mock('../../contexts/useTheme', () => ({
  useTheme: vi.fn(),
}));

vi.mock('../../contexts/useTextSize', () => ({
  useTextSize: vi.fn(),
}));

describe('KeyboardShortcuts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useThemeModule.useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      actualTheme: 'light',
      setTheme: vi.fn(),
      toggleTheme: mockToggleTheme,
    });

    (useTextSizeModule.useTextSize as ReturnType<typeof vi.fn>).mockReturnValue({
      textSize: 'medium',
      increaseTextSize: mockIncreaseTextSize,
      decreaseTextSize: mockDecreaseTextSize,
      resetTextSize: mockResetTextSize,
      setTextSize: vi.fn(),
    });
  });

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', vi.fn());
  });

  describe('Rendering', () => {
    it('should render without visible output', () => {
      const { container } = render(<KeyboardShortcuts />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Keyboard Shortcuts - Ctrl+Enter', () => {
    it('should call onStartQuestionnaire when Ctrl+Enter is pressed', async () => {
      const onStartQuestionnaire = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onStartQuestionnaire={onStartQuestionnaire} />);

      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(onStartQuestionnaire).toHaveBeenCalled();
    });

    it('should not trigger when typing in input', async () => {
      const onStartQuestionnaire = vi.fn();
      const user = userEvent.setup();

      render(
        <div>
          <KeyboardShortcuts onStartQuestionnaire={onStartQuestionnaire} />
          <input data-testid="test-input" />
        </div>
      );

      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      input.focus();
      await user.keyboard('{Control>}{Enter}{/Control}');

      // Should not trigger when focus is in input
      expect(onStartQuestionnaire).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts - Theme Toggle', () => {
    it('should toggle theme when Ctrl+Shift+T is pressed', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Shift>}t{/Shift}{/Control}');

      expect(mockToggleTheme).toHaveBeenCalled();
    });

    it('should work with Meta key (Mac)', async () => {
      render(<KeyboardShortcuts />);

      // Simulate Meta+Shift+T
      const event = new KeyboardEvent('keydown', {
        key: 't',
        metaKey: true,
        shiftKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);

      // Give time for event to process
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockToggleTheme).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts - Text Size', () => {
    it('should increase text size when Ctrl+Shift+= is pressed', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Shift>}={/Shift}{/Control}');

      expect(mockIncreaseTextSize).toHaveBeenCalled();
    });

    it('should decrease text size when Ctrl+Shift+- is pressed', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Shift>}-{/Shift}{/Control}');

      expect(mockDecreaseTextSize).toHaveBeenCalled();
    });

    it('should reset text size when Ctrl+Shift+0 is pressed', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Shift>}0{/Shift}{/Control}');

      expect(mockResetTextSize).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts - Navigation', () => {
    it('should call onGoHome when Ctrl+Shift+H is pressed', async () => {
      const onGoHome = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onGoHome={onGoHome} />);

      await user.keyboard('{Control>}{Shift>}h{/Shift}{/Control}');

      expect(onGoHome).toHaveBeenCalled();
    });

    it('should call onViewResults when Ctrl+Shift+R is pressed', async () => {
      const onViewResults = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onViewResults={onViewResults} />);

      await user.keyboard('{Control>}{Shift>}r{/Shift}{/Control}');

      expect(onViewResults).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts - Function Keys', () => {
    it('should call onToggleTour when F1 is pressed', async () => {
      const onToggleTour = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onToggleTour={onToggleTour} />);

      await user.keyboard('{F1}');

      expect(onToggleTour).toHaveBeenCalled();
    });

    it('should call onTogglePrivacy when F2 is pressed', async () => {
      const onTogglePrivacy = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onTogglePrivacy={onTogglePrivacy} />);

      await user.keyboard('{F2}');

      expect(onTogglePrivacy).toHaveBeenCalled();
    });

    it('should call onToggleGuide when F3 is pressed', async () => {
      const onToggleGuide = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onToggleGuide={onToggleGuide} />);

      await user.keyboard('{F3}');

      expect(onToggleGuide).toHaveBeenCalled();
    });
  });

  describe('Input Detection', () => {
    it('should not trigger shortcuts when typing in textarea', async () => {
      const onStartQuestionnaire = vi.fn();
      const user = userEvent.setup();

      render(
        <div>
          <KeyboardShortcuts onStartQuestionnaire={onStartQuestionnaire} />
          <textarea data-testid="test-textarea" />
        </div>
      );

      const textarea = document.querySelector('[data-testid="test-textarea"]') as HTMLTextAreaElement;
      textarea.focus();
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(onStartQuestionnaire).not.toHaveBeenCalled();
    });

    it('should not trigger shortcuts when typing in select', async () => {
      const onStartQuestionnaire = vi.fn();
      const user = userEvent.setup();

      render(
        <div>
          <KeyboardShortcuts onStartQuestionnaire={onStartQuestionnaire} />
          <select data-testid="test-select">
            <option>Option 1</option>
          </select>
        </div>
      );

      const select = document.querySelector('[data-testid="test-select"]') as HTMLSelectElement;
      select.focus();
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(onStartQuestionnaire).not.toHaveBeenCalled();
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const { unmount } = render(<KeyboardShortcuts />);
      const removeSpy = vi.spyOn(document, 'removeEventListener');

      unmount();

      expect(removeSpy).toHaveBeenCalled();
      removeSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should not trigger shortcuts when typing in contentEditable element', async () => {
      const onStartQuestionnaire = vi.fn();

      render(
        <div>
          <KeyboardShortcuts onStartQuestionnaire={onStartQuestionnaire} />
        </div>
      );

      // Create a mock contentEditable element
      const editable = document.createElement('div');
      editable.contentEditable = 'true';
      document.body.appendChild(editable);

      // Dispatch event with contentEditable element as target
      const event = new KeyboardEvent('keydown', {
        key: 'enter',
        ctrlKey: true,
        bubbles: true,
      });

      // Override target to be the contentEditable element
      Object.defineProperty(event, 'target', {
        value: editable,
        writable: false,
        configurable: true
      });

      document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(onStartQuestionnaire).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(editable);
    });

    it('should handle null event target gracefully', () => {
      render(<KeyboardShortcuts />);

      // Dispatch event with null target
      const event = new KeyboardEvent('keydown', {
        key: 't',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      // Mock target as null
      Object.defineProperty(event, 'target', { value: null, writable: false });

      // Should not throw error
      expect(() => {
        document.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should not trigger when Ctrl without Shift for theme toggle', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}t{/Control}');

      // Should not trigger without Shift
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should not trigger when Ctrl without Shift for text size increase', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}={/Control}');

      // Should not trigger without Shift
      expect(mockIncreaseTextSize).not.toHaveBeenCalled();
    });

    it('should not trigger when Ctrl without Shift for text size decrease', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}-{/Control}');

      // Should not trigger without Shift
      expect(mockDecreaseTextSize).not.toHaveBeenCalled();
    });

    it('should not trigger when Ctrl without Shift for text size reset', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}0{/Control}');

      // Should not trigger without Shift
      expect(mockResetTextSize).not.toHaveBeenCalled();
    });

    it('should not trigger when Ctrl without Shift for home navigation', async () => {
      const onGoHome = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onGoHome={onGoHome} />);

      await user.keyboard('{Control>}h{/Control}');

      // Should not trigger without Shift
      expect(onGoHome).not.toHaveBeenCalled();
    });

    it('should not trigger when Ctrl without Shift for results view', async () => {
      const onViewResults = vi.fn();
      const user = userEvent.setup();

      render(<KeyboardShortcuts onViewResults={onViewResults} />);

      await user.keyboard('{Control>}r{/Control}');

      // Should not trigger without Shift
      expect(onViewResults).not.toHaveBeenCalled();
    });

    it('should ignore unrecognized Ctrl key combinations', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');

      // Should not crash or trigger any callbacks
      expect(mockToggleTheme).not.toHaveBeenCalled();
      expect(mockIncreaseTextSize).not.toHaveBeenCalled();
    });

    it('should ignore unrecognized function keys', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{F4}');

      // Should not crash
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should work with Meta key for Ctrl+Enter', async () => {
      const onStartQuestionnaire = vi.fn();

      render(<KeyboardShortcuts onStartQuestionnaire={onStartQuestionnaire} />);

      const event = new KeyboardEvent('keydown', {
        key: 'enter',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(onStartQuestionnaire).toHaveBeenCalled();
    });

    it('should handle keys without Ctrl or Meta', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('t');

      // Should not trigger anything without Ctrl/Meta
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });
  });

  describe('Optional callbacks', () => {
    it('should handle missing onStartQuestionnaire gracefully', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Enter}{/Control}');

      // Should not crash when callback is undefined
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should handle missing onGoHome gracefully', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Shift>}h{/Shift}{/Control}');

      // Should not crash when callback is undefined
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should handle missing onViewResults gracefully', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{Control>}{Shift>}r{/Shift}{/Control}');

      // Should not crash when callback is undefined
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should handle missing onToggleTour gracefully', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{F1}');

      // Should not crash when callback is undefined
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should handle missing onTogglePrivacy gracefully', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{F2}');

      // Should not crash when callback is undefined
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should handle missing onToggleGuide gracefully', async () => {
      const user = userEvent.setup();

      render(<KeyboardShortcuts />);

      await user.keyboard('{F3}');

      // Should not crash when callback is undefined
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });
  });
});

