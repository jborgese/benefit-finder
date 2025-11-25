/**
 * Tests for TextSizeContext
 *
 * Tests text size management and accessibility features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { TextSizeProvider, useTextSize } from '../TextSizeContext';

// Test component that uses the context
function TestConsumer() {
  const { textSize, setTextSize, increaseTextSize, decreaseTextSize, resetTextSize } = useTextSize();

  return (
    <div>
      <div data-testid="current-size">{textSize}</div>
      <button onClick={() => setTextSize('small')}>Set Small</button>
      <button onClick={() => setTextSize('medium')}>Set Medium</button>
      <button onClick={() => setTextSize('large')}>Set Large</button>
      <button onClick={() => setTextSize('extra-large')}>Set Extra Large</button>
      <button onClick={increaseTextSize}>Increase</button>
      <button onClick={decreaseTextSize}>Decrease</button>
      <button onClick={resetTextSize}>Reset</button>
    </div>
  );
}

describe('TextSizeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document properties
    document.documentElement.style.fontSize = '';
    document.documentElement.removeAttribute('data-text-size');
  });

  describe('TextSizeProvider', () => {
    it('should provide default text size of medium', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should load saved text size from localStorage', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      expect(screen.getByTestId('current-size')).toHaveTextContent('large');
    });

    it('should ignore invalid saved text size', () => {
      localStorage.setItem('bf-text-size', 'invalid-size');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should handle null saved text size', () => {
      localStorage.setItem('bf-text-size', 'null');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should render children', () => {
      render(
        <TextSizeProvider>
          <div data-testid="child">Test Child</div>
        </TextSizeProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('setTextSize', () => {
    it('should set text size to small', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Small').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('small');
      expect(localStorage.getItem('bf-text-size')).toBe('small');
    });

    it('should set text size to medium', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Medium').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
      expect(localStorage.getItem('bf-text-size')).toBe('medium');
    });

    it('should set text size to large', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Large').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('large');
      expect(localStorage.getItem('bf-text-size')).toBe('large');
    });

    it('should set text size to extra-large', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Extra Large').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('extra-large');
      expect(localStorage.getItem('bf-text-size')).toBe('extra-large');
    });

    it('should persist text size to localStorage', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Large').click();
      });

      expect(localStorage.getItem('bf-text-size')).toBe('large');
    });
  });

  describe('increaseTextSize', () => {
    it('should increase from small to medium', () => {
      localStorage.setItem('bf-text-size', 'small');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Increase').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should increase from medium to large', () => {
      localStorage.setItem('bf-text-size', 'medium');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Increase').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('large');
    });

    it('should increase from large to extra-large', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Increase').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('extra-large');
    });

    it('should not increase beyond extra-large', () => {
      localStorage.setItem('bf-text-size', 'extra-large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Increase').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('extra-large');
    });
  });

  describe('decreaseTextSize', () => {
    it('should decrease from extra-large to large', () => {
      localStorage.setItem('bf-text-size', 'extra-large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Decrease').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('large');
    });

    it('should decrease from large to medium', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Decrease').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should decrease from medium to small', () => {
      localStorage.setItem('bf-text-size', 'medium');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Decrease').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('small');
    });

    it('should not decrease below small', () => {
      localStorage.setItem('bf-text-size', 'small');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Decrease').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('small');
    });
  });

  describe('resetTextSize', () => {
    it('should reset to medium from small', () => {
      localStorage.setItem('bf-text-size', 'small');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Reset').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should reset to medium from large', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Reset').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should reset to medium from extra-large', () => {
      localStorage.setItem('bf-text-size', 'extra-large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Reset').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
    });

    it('should persist reset to localStorage', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Reset').click();
      });

      expect(localStorage.getItem('bf-text-size')).toBe('medium');
    });
  });

  describe('Document style effects', () => {
    it('should apply small text size to document', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Small').click();
      });

      expect(document.documentElement.style.fontSize).toBe('0.875rem');
      expect(document.documentElement.getAttribute('data-text-size')).toBe('small');
    });

    it('should apply medium text size to document', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Medium').click();
      });

      expect(document.documentElement.style.fontSize).toBe('1rem');
      expect(document.documentElement.getAttribute('data-text-size')).toBe('medium');
    });

    it('should apply large text size to document', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Large').click();
      });

      expect(document.documentElement.style.fontSize).toBe('1.125rem');
      expect(document.documentElement.getAttribute('data-text-size')).toBe('large');
    });

    it('should apply extra-large text size to document', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Extra Large').click();
      });

      expect(document.documentElement.style.fontSize).toBe('1.25rem');
      expect(document.documentElement.getAttribute('data-text-size')).toBe('extra-large');
    });

    it('should update document on initial render with saved size', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      expect(document.documentElement.style.fontSize).toBe('1.125rem');
      expect(document.documentElement.getAttribute('data-text-size')).toBe('large');
    });

    it('should apply default medium on invalid saved size', () => {
      localStorage.setItem('bf-text-size', 'invalid');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      expect(document.documentElement.style.fontSize).toBe('1rem');
      expect(document.documentElement.getAttribute('data-text-size')).toBe('medium');
    });
  });

  describe('useTextSize hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useTextSize must be used within a TextSizeProvider');

      consoleError.mockRestore();
    });

    it('should provide all context values', () => {
      let contextValue: any = null;

      function TestComponent() {
        contextValue = useTextSize();
        return null;
      }

      render(
        <TextSizeProvider>
          <TestComponent />
        </TextSizeProvider>
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.textSize).toBe('medium');
      expect(typeof contextValue.setTextSize).toBe('function');
      expect(typeof contextValue.increaseTextSize).toBe('function');
      expect(typeof contextValue.decreaseTextSize).toBe('function');
      expect(typeof contextValue.resetTextSize).toBe('function');
    });
  });

  describe('Integration scenarios', () => {
    it('should allow chaining increase operations', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Increase').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('large');

      act(() => {
        screen.getByText('Increase').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('extra-large');
    });

    it('should allow chaining decrease operations', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Decrease').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');

      act(() => {
        screen.getByText('Decrease').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('small');
    });

    it('should work after reset', () => {
      localStorage.setItem('bf-text-size', 'large');

      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Reset').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');

      act(() => {
        screen.getByText('Increase').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('large');
    });

    it('should handle rapid size changes', () => {
      render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      act(() => {
        screen.getByText('Set Small').click();
        screen.getByText('Set Large').click();
        screen.getByText('Set Medium').click();
      });

      expect(screen.getByTestId('current-size')).toHaveTextContent('medium');
      expect(localStorage.getItem('bf-text-size')).toBe('medium');
    });
  });

  describe('Context value stability', () => {
    it('should provide stable context value structure', () => {
      const { rerender } = render(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      const firstSize = screen.getByTestId('current-size').textContent;

      rerender(
        <TextSizeProvider>
          <TestConsumer />
        </TextSizeProvider>
      );

      expect(screen.getByTestId('current-size').textContent).toBe(firstSize);
    });
  });
});
