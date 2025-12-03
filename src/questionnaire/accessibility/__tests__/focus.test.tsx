/**
 * Focus Management Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteComponent } from '../../../components/RouteComponent';
import { ExitConfirmDialog } from '../../ui/SaveResume';

describe('Focus Management', () => {
  beforeEach(() => {
    // Ensure body has no lingering focusable elements between tests
    document.body.innerHTML = '';
  });

  it('focuses the main heading on route render', async () => {
    render(
      <div role="main">
        <RouteComponent>
          <div>
            <h1>Accessible Page Title</h1>
            <p>Content</p>
          </div>
        </RouteComponent>
      </div>
    );

    const heading = screen.getByRole('heading', { level: 1, name: /Accessible Page Title/i });
    expect(heading).toHaveFocus();
  });

  it('traps focus within AlertDialog (ExitConfirmDialog) when open', async () => {
    const user = userEvent.setup();

    // Outside focusable to verify trap
    const { getByRole, getByText } = render(
      <div>
        <button type="button">Outside Before</button>
        <ExitConfirmDialog open={true} onConfirm={() => {}} onCancel={() => {}} />
        <button type="button">Outside After</button>
      </div>
    );

    const dialog = getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();

    const stayButton = getByText('Stay');
    const exitButton = getByText('Exit');

    // Initial focus should be inside dialog
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Tab cycles within dialog and never leaves the dialog container
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Reverse tab also remains trapped
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Focus remains on one of the known controls
    expect([stayButton, exitButton]).toContain(document.activeElement);
  });
});
