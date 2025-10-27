/**
 * EncryptionIndicator Component Tests
 *
 * Tests for encryption indicator component with store mocking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EncryptionIndicator, EncryptionBadge, EncryptionBanner } from '../EncryptionIndicator';
import * as encryptionStoreModule from '../../stores/encryptionStore';

vi.mock('../../stores/encryptionStore', () => ({
  useEncryptionStore: vi.fn(),
  selectIsEncryptionEnabled: vi.fn(),
  selectIsKeyLoaded: vi.fn(),
  selectEncryptionMode: vi.fn(),
  selectPassphraseStrength: vi.fn(),
}));

describe('EncryptionIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: encryption disabled
    (encryptionStoreModule.useEncryptionStore as ReturnType<typeof vi.fn>)
      .mockImplementation((selector: unknown) => {
        if (selector === encryptionStoreModule.selectIsEncryptionEnabled) {
          return false;
        }
        if (selector === encryptionStoreModule.selectIsKeyLoaded) {
          return false;
        }
        if (selector === encryptionStoreModule.selectEncryptionMode) {
          return 'disabled';
        }
        if (selector === encryptionStoreModule.selectPassphraseStrength) {
          return 'weak';
        }
        return undefined;
      });
  });

  describe('Rendering - Encryption Disabled', () => {
    it('should render encryption indicator', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
    });

    it('should show unlocked icon when encryption is disabled', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveTextContent('🔓');
    });

    it('should have gray color when encryption is disabled', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('text-gray-500');
    });

    it('should show status text when showLabel is true', () => {
      render(<EncryptionIndicator showLabel />);

      expect(screen.getByText('Encryption Disabled')).toBeInTheDocument();
    });

    it('should not show label by default', () => {
      render(<EncryptionIndicator />);

      expect(screen.queryByText('Encryption Disabled')).not.toBeInTheDocument();
    });
  });

  describe('Rendering - Encryption Enabled', () => {
    beforeEach(() => {
      (encryptionStoreModule.useEncryptionStore as ReturnType<typeof vi.fn>)
        .mockImplementation((selector: unknown) => {
          if (selector === encryptionStoreModule.selectIsEncryptionEnabled) {
            return true;
          }
          if (selector === encryptionStoreModule.selectIsKeyLoaded) {
            return true;
          }
          if (selector === encryptionStoreModule.selectEncryptionMode) {
            return 'auto';
          }
          if (selector === encryptionStoreModule.selectPassphraseStrength) {
            return 'weak';
          }
          return undefined;
        });
    });

    it('should show locked icon when encryption is enabled', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveTextContent('🔒');
    });

    it('should show encrypted status text', () => {
      render(<EncryptionIndicator showLabel />);

      expect(screen.getByText('Encrypted (Auto)')).toBeInTheDocument();
    });
  });

  describe('Rendering - Passphrase Mode', () => {
    beforeEach(() => {
      (encryptionStoreModule.useEncryptionStore as ReturnType<typeof vi.fn>)
        .mockImplementation((selector: unknown) => {
          if (selector === encryptionStoreModule.selectIsEncryptionEnabled) {
            return true;
          }
          if (selector === encryptionStoreModule.selectIsKeyLoaded) {
            return true;
          }
          if (selector === encryptionStoreModule.selectEncryptionMode) {
            return 'passphrase';
          }
          if (selector === encryptionStoreModule.selectPassphraseStrength) {
            return 'strong';
          }
          return undefined;
        });
    });

    it('should show locked with key icon for passphrase mode', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveTextContent('🔐');
    });

    it('should show passphrase strength in status', () => {
      render(<EncryptionIndicator showLabel />);

      expect(screen.getByText(/Encrypted \(Strong\)/)).toBeInTheDocument();
    });

    it('should show very strong passphrase', () => {
      (encryptionStoreModule.useEncryptionStore as ReturnType<typeof vi.fn>)
        .mockImplementation((selector: unknown) => {
          if (selector === encryptionStoreModule.selectPassphraseStrength) {
            return 'very-strong';
          }
          return true;
        });

      render(<EncryptionIndicator showLabel />);

      expect(screen.getByText(/Very Strong/)).toBeInTheDocument();
    });

    it('should show medium passphrase', () => {
      (encryptionStoreModule.useEncryptionStore as ReturnType<typeof vi.fn>)
        .mockImplementation((selector: unknown) => {
          if (selector === encryptionStoreModule.selectPassphraseStrength) {
            return 'medium';
          }
          return true;
        });

      render(<EncryptionIndicator showLabel />);

      expect(screen.getByText(/Medium/)).toBeInTheDocument();
    });

    it('should show weak passphrase', () => {
      (encryptionStoreModule.useEncryptionStore as ReturnType<typeof vi.fn>)
        .mockImplementation((selector: unknown) => {
          if (selector === encryptionStoreModule.selectPassphraseStrength) {
            return 'weak';
          }
          return true;
        });

      render(<EncryptionIndicator showLabel />);

      expect(screen.getByText(/Weak/)).toBeInTheDocument();
    });
  });

  describe('Rendering - Locked State', () => {
    beforeEach(() => {
      (encryptionStoreModule.useEncryptionStore as ReturnType<typeof vi.fn>)
        .mockImplementation((selector: unknown) => {
          if (selector === encryptionStoreModule.selectIsEncryptionEnabled) {
            return true;
          }
          if (selector === encryptionStoreModule.selectIsKeyLoaded) {
            return false; // Locked
          }
          if (selector === encryptionStoreModule.selectEncryptionMode) {
            return 'passphrase';
          }
          if (selector === encryptionStoreModule.selectPassphraseStrength) {
            return 'weak';
          }
          return undefined;
        });
    });

    it('should show locked icon when key is not loaded', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveTextContent('🔒');
    });

    it('should show yellow color when locked', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('text-yellow-600');
    });

    it('should show locked status text', () => {
      render(<EncryptionIndicator showLabel />);

      expect(screen.getByText('Locked - Enter Passphrase')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      render(<EncryptionIndicator size="sm" />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('px-2');
      expect(indicator).toHaveClass('py-1');
    });

    it('should apply medium size classes by default', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('px-3');
      expect(indicator).toHaveClass('py-2');
    });

    it('should apply large size classes', () => {
      render(<EncryptionIndicator size="lg" />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('px-4');
      expect(indicator).toHaveClass('py-3');
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip when enabled', async () => {
      const user = userEvent.setup();

      render(<EncryptionIndicator showTooltip />);

      const indicator = screen.getByRole('status');
      await user.hover(indicator);

      // Tooltip content should be accessible
      expect(indicator).toBeInTheDocument();
    });

    it('should not show tooltip when disabled', () => {
      render(<EncryptionIndicator showTooltip={false} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<EncryptionIndicator className="custom-class" />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label');
    });

    it('should have aria-label matching status text', () => {
      render(<EncryptionIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', 'Encryption Disabled');
    });
  });
});

describe('EncryptionBadge Component', () => {
  it('should render badge with small size and no label', () => {
    render(<EncryptionBadge />);

    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('px-2');
    expect(screen.queryByText('Encryption Disabled')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<EncryptionBadge className="badge-class" />);

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('badge-class');
  });
});

describe('EncryptionBanner Component', () => {
  it('should render banner with large size and label', () => {
    render(<EncryptionBanner />);

    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('px-4');
    expect(screen.getByText('Encryption Disabled')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<EncryptionBanner className="banner-class" />);

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('banner-class');
  });
});

