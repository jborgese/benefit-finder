import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from '../LanguageSwitcher';

// Simple test to verify the component renders without crashing
describe('LanguageSwitcher', () => {
  it('renders without crashing', () => {
    // This test will pass if the component renders without throwing errors
    // The actual i18n functionality will be tested in integration tests
    expect(() => render(<LanguageSwitcher />)).not.toThrow();
  });

  it('applies custom className', () => {
    render(<LanguageSwitcher className="custom-class" />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LanguageSwitcher size="sm" />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('h-11');

    rerender(<LanguageSwitcher size="lg" />);
    expect(screen.getByRole('combobox')).toHaveClass('h-12');
  });

  it('applies minimal variant styling', () => {
    render(<LanguageSwitcher variant="minimal" />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('text-gray-700');
    expect(trigger).toHaveClass('dark:text-white');
    expect(trigger).toHaveClass('bg-transparent');
  });

  it('applies default variant styling', () => {
    render(<LanguageSwitcher variant="default" />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('bg-white');
    expect(trigger).toHaveClass('border');
  });
});
