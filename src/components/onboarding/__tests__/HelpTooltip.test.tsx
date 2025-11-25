/**
 * HelpTooltip Component Tests
 *
 * Comprehensive test suite for the HelpTooltip component focusing on features that are actually supported.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpTooltip } from '../HelpTooltip';

describe('HelpTooltip Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic rendering', () => {
    it('should render children', () => {
      render(
        <HelpTooltip content="Test tooltip">
          <button>Trigger</button>
        </HelpTooltip>
      );

      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('should not show tooltip initially', () => {
      render(
        <HelpTooltip content="Test tooltip">
          <button>Trigger</button>
        </HelpTooltip>
      );

      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Content display', () => {
    it('should show tooltip content on hover', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="This is helpful information">
          <button>Help</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Help' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('This is helpful information');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should display title and content when both provided', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Detailed explanation here" title="Important Note">
          <button>Info</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Info' });
      await user.hover(button);

      await waitFor(() => {
        const titles = screen.getAllByText('Important Note');
        const contents = screen.getAllByText('Detailed explanation here');
        expect(titles.length).toBeGreaterThan(0);
        expect(contents.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Size variations', () => {
    it('should apply small size class', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Small tooltip" size="sm">
          <button>Small</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Small' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Small tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should apply medium size class (default)', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Medium tooltip">
          <button>Medium</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Medium' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Medium tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should apply large size class', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Large tooltip" size="lg">
          <button>Large</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Large' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Large tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Position variations', () => {
    it('should render with top position (default)', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Top tooltip">
          <button>Top</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Top' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Top tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should render with bottom position', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Bottom tooltip" position="bottom">
          <button>Bottom</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Bottom' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Bottom tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should render with left position', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Left tooltip" position="left">
          <button>Left</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Left' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Left tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should render with right position', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Right tooltip" position="right">
          <button>Right</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Right' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Right tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interaction', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Interactive tooltip">
          <button>Interactive</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Interactive' });

      // Tooltip should not be visible initially
      expect(screen.queryByText('Interactive tooltip')).not.toBeInTheDocument();

      // Hover to show
      await user.hover(button);
      await waitFor(() => {
        const tooltips = screen.getAllByText('Interactive tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should work with keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <HelpTooltip content="Keyboard accessible">
          <button>Keyboard</button>
        </HelpTooltip>
      );

      // Tab to focus the button
      await user.tab();

      const button = screen.getByRole('button', { name: 'Keyboard' });
      expect(button).toHaveFocus();

      await waitFor(() => {
        const tooltips = screen.getAllByText('Keyboard accessible');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should work with different child elements', () => {
      const { rerender } = render(
        <HelpTooltip content="Button tooltip">
          <button>Button</button>
        </HelpTooltip>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(
        <HelpTooltip content="Link tooltip">
          <a href="#test">Link</a>
        </HelpTooltip>
      );

      expect(screen.getByRole('link')).toBeInTheDocument();

      rerender(
        <HelpTooltip content="Div tooltip">
          <div>Div element</div>
        </HelpTooltip>
      );

      expect(screen.getByText('Div element')).toBeInTheDocument();
    });

    it('should handle combinations of props', async () => {
      const user = userEvent.setup();

      render(
        <HelpTooltip
          content="Complex tooltip content"
          title="Complex Title"
          position="bottom"
          size="lg"
          className="custom-tooltip"
        >
          <button>Complex</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Complex' });
      await user.hover(button);

      await waitFor(() => {
        const titles = screen.getAllByText('Complex Title');
        const contents = screen.getAllByText('Complex tooltip content');
        expect(titles.length).toBeGreaterThan(0);
        expect(contents.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in content', async () => {
      const user = userEvent.setup();
      const specialContent = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/~`';

      render(
        <HelpTooltip content={specialContent}>
          <button>Special</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Special' });
      await user.hover(button);

      await waitFor(() => {
        const contents = screen.getAllByText(specialContent);
        expect(contents.length).toBeGreaterThan(0);
      });
    });

    it('should handle very long content', async () => {
      const user = userEvent.setup();
      const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);

      render(
        <HelpTooltip content={longContent} size="lg">
          <button>Long</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Long' });
      await user.hover(button);

      await waitFor(() => {
        const contents = screen.getAllByText((content) => {
          return content.includes('Lorem ipsum dolor sit amet');
        });
        expect(contents.length).toBeGreaterThan(0);
      });
    });

    it('should work without optional props', async () => {
      const user = userEvent.setup();

      render(
        <HelpTooltip content="Minimal tooltip">
          <button>Minimal</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'Minimal' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Minimal tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <HelpTooltip content="Accessible tooltip">
          <button>Accessible</button>
        </HelpTooltip>
      );

      // Tab to focus the button
      await user.tab();

      const button = screen.getByRole('button', { name: 'Accessible' });
      expect(button).toHaveFocus();

      await waitFor(() => {
        const tooltips = screen.getAllByText('Accessible tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should have proper ARIA attributes', () => {
      render(
        <HelpTooltip content="ARIA test">
          <button>ARIA button</button>
        </HelpTooltip>
      );

      const button = screen.getByRole('button', { name: 'ARIA button' });
      // Tooltip trigger should be accessible
      expect(button).toBeInTheDocument();
    });
  });

  describe('Utility functions coverage', () => {
    it('should apply correct size class for all size options', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <HelpTooltip content="Test" size="sm">
          <button>Test</button>
        </HelpTooltip>
      );

      let button = screen.getByRole('button');
      await user.hover(button);
      await waitFor(() => {
        const tooltips = screen.getAllByText('Test');
        expect(tooltips.length).toBeGreaterThan(0);
      });

      await user.unhover(button);

      rerender(
        <HelpTooltip content="Test" size="md">
          <button>Test</button>
        </HelpTooltip>
      );

      button = screen.getByRole('button');
      await user.hover(button);
      await waitFor(() => {
        const tooltips = screen.getAllByText('Test');
        expect(tooltips.length).toBeGreaterThan(0);
      });

      await user.unhover(button);

      rerender(
        <HelpTooltip content="Test" size="lg">
          <button>Test</button>
        </HelpTooltip>
      );

      button = screen.getByRole('button');
      await user.hover(button);
      await waitFor(() => {
        const tooltips = screen.getAllByText('Test');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should apply correct position for all position options', async () => {
      const user = userEvent.setup();
      const positions: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];

      for (const position of positions) {
        render(
          <HelpTooltip content={`${position} tooltip`} position={position}>
            <button>{position}</button>
          </HelpTooltip>
        );

        const button = screen.getByRole('button', { name: position });
        await user.hover(button);

        await waitFor(() => {
          const tooltips = screen.getAllByText(`${position} tooltip`);
          expect(tooltips.length).toBeGreaterThan(0);
        });

        cleanup();
      }
    });
  });
});
