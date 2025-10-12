/**
 * Encryption Indicator Component
 *
 * Displays the current encryption status with visual feedback.
 * Uses Radix UI primitives for accessibility.
 *
 * Features:
 * - Visual indicator of encryption status
 * - Tooltip with detailed information
 * - Lock/unlock icon based on state
 * - Color-coded by security level
 * - Accessible keyboard navigation
 */

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  useEncryptionStore,
  selectIsEncryptionEnabled,
  selectIsKeyLoaded,
  selectEncryptionMode,
  selectPassphraseStrength,
  type EncryptionMode,
} from '../stores/encryptionStore';
import type { EncryptionStrength } from '../utils/encryption';

// ============================================================================
// TYPES
// ============================================================================

export interface EncryptionIndicatorProps {
  /** Whether to show label text */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Show detailed tooltip */
  showTooltip?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon based on encryption state
 */
function getEncryptionIcon(
  isEnabled: boolean,
  isKeyLoaded: boolean,
  mode: EncryptionMode
): string {
  if (!isEnabled) {
    return '🔓'; // Unlocked - no encryption
  }

  if (isEnabled && !isKeyLoaded) {
    return '🔒'; // Locked - needs passphrase
  }

  if (mode === 'passphrase') {
    return '🔐'; // Locked with key - passphrase-based
  }

  return '🔒'; // Locked - auto encryption
}

/**
 * Get color class based on encryption state
 */
function getColorClass(
  isEnabled: boolean,
  isKeyLoaded: boolean,
  strength: EncryptionStrength
): string {
  if (!isEnabled) {
    return 'text-gray-500'; // No encryption - gray
  }

  if (isEnabled && !isKeyLoaded) {
    return 'text-yellow-600'; // Locked - needs unlock - yellow
  }

  // Color by passphrase strength
  switch (strength) {
    case 'very-strong':
      return 'text-green-700';
    case 'strong':
      return 'text-green-600';
    case 'medium':
      return 'text-blue-600';
    case 'weak':
      return 'text-orange-600';
    default:
      return 'text-gray-600'; // Auto encryption
  }
}

/**
 * Get status text based on encryption state
 */
function getStatusText(
  isEnabled: boolean,
  isKeyLoaded: boolean,
  mode: EncryptionMode,
  strength: EncryptionStrength
): string {
  if (!isEnabled) {
    return 'Encryption Disabled';
  }

  if (isEnabled && !isKeyLoaded) {
    return 'Locked - Enter Passphrase';
  }

  if (mode === 'passphrase') {
    return `Encrypted (${strengthToLabel(strength)})`;
  }

  return 'Encrypted (Auto)';
}

/**
 * Get detailed tooltip content
 */
function getTooltipContent(
  isEnabled: boolean,
  isKeyLoaded: boolean,
  mode: EncryptionMode,
  strength: EncryptionStrength
): string {
  if (!isEnabled) {
    return 'Your data is not encrypted. Enable encryption in settings for better privacy.';
  }

  if (isEnabled && !isKeyLoaded) {
    return 'Encryption is enabled but locked. Enter your passphrase to access encrypted data.';
  }

  if (mode === 'passphrase') {
    const strengthDesc = getStrengthDescription(strength);
    return `Your data is encrypted with AES-256-GCM using your passphrase. Passphrase strength: ${strengthDesc}`;
  }

  return 'Your data is encrypted with AES-256-GCM using an automatically generated key.';
}

/**
 * Convert strength enum to label
 */
function strengthToLabel(strength: EncryptionStrength): string {
  switch (strength) {
    case 'very-strong':
      return 'Very Strong';
    case 'strong':
      return 'Strong';
    case 'medium':
      return 'Medium';
    case 'weak':
      return 'Weak';
    default:
      return '';
  }
}

/**
 * Get strength description
 */
function getStrengthDescription(strength: EncryptionStrength): string {
  switch (strength) {
    case 'very-strong':
      return 'Very Strong - Excellent protection';
    case 'strong':
      return 'Strong - Good protection';
    case 'medium':
      return 'Medium - Adequate protection';
    case 'weak':
      return 'Weak - Consider strengthening';
    default:
      return 'Auto-generated';
  }
}

/**
 * Get size classes
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg'): {
  icon: string;
  text: string;
  container: string;
} {
  switch (size) {
    case 'sm':
      return {
        icon: 'text-sm',
        text: 'text-xs',
        container: 'gap-1 px-2 py-1',
      };
    case 'lg':
      return {
        icon: 'text-2xl',
        text: 'text-base',
        container: 'gap-3 px-4 py-3',
      };
    case 'md':
    default:
      return {
        icon: 'text-lg',
        text: 'text-sm',
        container: 'gap-2 px-3 py-2',
      };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * EncryptionIndicator component
 *
 * @example
 * ```tsx
 * // Simple indicator
 * <EncryptionIndicator />
 *
 * // With label
 * <EncryptionIndicator showLabel />
 *
 * // Large with tooltip
 * <EncryptionIndicator size="lg" showLabel showTooltip />
 * ```
 */
export const EncryptionIndicator: React.FC<EncryptionIndicatorProps> = ({
  showLabel = false,
  size = 'md',
  className = '',
  showTooltip = true,
}) => {
  // Get encryption state from store
  const isEnabled = useEncryptionStore(selectIsEncryptionEnabled);
  const isKeyLoaded = useEncryptionStore(selectIsKeyLoaded);
  const mode = useEncryptionStore(selectEncryptionMode);
  const strength = useEncryptionStore(selectPassphraseStrength);

  // Get display properties
  const icon = getEncryptionIcon(isEnabled, isKeyLoaded, mode);
  const colorClass = getColorClass(isEnabled, isKeyLoaded, strength);
  const statusText = getStatusText(isEnabled, isKeyLoaded, mode, strength);
  const tooltipContent = getTooltipContent(isEnabled, isKeyLoaded, mode, strength);
  const sizeClasses = getSizeClasses(size);

  // Base component
  const indicator = (
    <div
      className={`
        inline-flex items-center justify-center
        ${sizeClasses.container}
        rounded-md
        bg-gray-50 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        transition-colors duration-200
        ${className}
      `}
      role="status"
      aria-label={statusText}
    >
      {/* Icon */}
      <span
        className={`${sizeClasses.icon} ${colorClass} transition-colors`}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Label */}
      {showLabel && (
        <span
          className={`
            ${sizeClasses.text}
            font-medium
            ${colorClass}
            transition-colors
          `}
        >
          {statusText}
        </span>
      )}
    </div>
  );

  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            {indicator}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="
                max-w-xs
                px-3 py-2
                text-sm
                text-white
                bg-gray-900
                rounded-md
                shadow-lg
                z-50
                animate-fade-in
              "
              sideOffset={5}
            >
              {tooltipContent}
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return indicator;
};

/**
 * Compact encryption badge (icon only, small)
 *
 * @example
 * ```tsx
 * <EncryptionBadge />
 * ```
 */
export const EncryptionBadge: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <EncryptionIndicator
      size="sm"
      showLabel={false}
      showTooltip={true}
      className={className}
    />
  );
};

/**
 * Full encryption status banner
 *
 * @example
 * ```tsx
 * <EncryptionBanner />
 * ```
 */
export const EncryptionBanner: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <EncryptionIndicator
      size="lg"
      showLabel={true}
      showTooltip={true}
      className={className}
    />
  );
};

// Export default
export default EncryptionIndicator;

