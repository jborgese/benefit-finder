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
});

