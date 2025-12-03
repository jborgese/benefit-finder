import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

// Lightweight smoke test: render App and assert key UI mounts
// Avoids heavy flows; aims to catch major regressions fast

describe('Smoke: App renders core layout', () => {
  it('renders without crashing and shows primary header', () => {
    render(<App />);
    // Check for app root elements that should always exist
    // Prefer stable text or role-based queries
    const heading = screen.queryByRole('heading', { level: 1 });
    expect(heading).toBeTruthy();
  });

  it('shows navigation or primary action controls', () => {
    render(<App />);
    // Look for common navigation landmarks or buttons
    const nav = screen.queryByRole('navigation');
    const startButtons = screen.queryAllByRole('button');
    expect(nav || startButtons.length > 0).toBeTruthy();
  });
});
