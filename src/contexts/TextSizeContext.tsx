/**
 * Text Size Context
 *
 * Provides text size management for accessibility
 */

import React, { createContext, useEffect, useState } from 'react';
import { TextSize, TEXT_SIZE_ORDER, TEXT_SIZE_MULTIPLIERS } from './textSizeContextConstants';

export interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  resetTextSize: () => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

interface TextSizeProviderProps {
  children: React.ReactNode;
}


export const TextSizeProvider: React.FC<TextSizeProviderProps> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    // Get saved text size from localStorage or default to 'medium'
    const saved = localStorage.getItem('bf-text-size');
    // Validate that saved value is a valid TextSize
    if (saved && TEXT_SIZE_ORDER.includes(saved as TextSize)) {
      return saved as TextSize;
    }
    return 'medium';
  });

  // Apply text size to document
  useEffect(() => {
    let multiplier: number;
    switch (textSize) {
      case 'small':
        multiplier = TEXT_SIZE_MULTIPLIERS.small;
        break;
      case 'medium':
        multiplier = TEXT_SIZE_MULTIPLIERS.medium;
        break;
      case 'large':
        multiplier = TEXT_SIZE_MULTIPLIERS.large;
        break;
      case 'extra-large':
        multiplier = TEXT_SIZE_MULTIPLIERS['extra-large'];
        break;
      default:
        multiplier = TEXT_SIZE_MULTIPLIERS.medium;
    }
    document.documentElement.style.fontSize = `${multiplier}rem`;
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  const setTextSize = (size: TextSize): void => {
    setTextSizeState(size);
    localStorage.setItem('bf-text-size', size);
  };

  const increaseTextSize = (): void => {
    const currentIndex = TEXT_SIZE_ORDER.indexOf(textSize);
    if (currentIndex < TEXT_SIZE_ORDER.length - 1) {
      setTextSize(TEXT_SIZE_ORDER[currentIndex + 1]);
    }
  };

  const decreaseTextSize = (): void => {
    const currentIndex = TEXT_SIZE_ORDER.indexOf(textSize);
    if (currentIndex > 0) {
      setTextSize(TEXT_SIZE_ORDER[currentIndex - 1]);
    }
  };

  const resetTextSize = (): void => {
    setTextSize('medium');
  };

  return (
    <TextSizeContext.Provider
      value={{
        textSize,
        setTextSize,
        increaseTextSize,
        decreaseTextSize,
        resetTextSize,
      }}
    >
      {children}
    </TextSizeContext.Provider>
  );
};

// Export the context for use in the hook file
export { TextSizeContext };

// Convenience hook for consuming text size context
export function useTextSize(): TextSizeContextType {
  const ctx = React.useContext(TextSizeContext);
  if (!ctx) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return ctx;
}
