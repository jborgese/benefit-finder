/**
 * Text Size Constants
 *
 * Constants for text size management
 */

export type TextSize = 'small' | 'medium' | 'large' | 'extra-large';

export const TEXT_SIZE_ORDER: TextSize[] = ['small', 'medium', 'large', 'extra-large'];

export const TEXT_SIZE_MULTIPLIERS: Record<TextSize, number> = {
  small: 0.875,      // 14px base
  medium: 1,         // 16px base (default)
  large: 1.125,      // 18px base
  'extra-large': 1.25, // 20px base
};
