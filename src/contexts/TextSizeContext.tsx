/**
 * Text Size Context
 *
 * Provides text size management for accessibility
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TextSize, TEXT_SIZE_ORDER, TEXT_SIZE_MULTIPLIERS } from './textSizeConstants';

interface TextSizeContextType {
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
    return saved as TextSize || 'medium';
  });

  // Apply text size to document
  useEffect(() => {
    const multiplier = TEXT_SIZE_MULTIPLIERS[textSize];
    if (multiplier) {
      document.documentElement.style.fontSize = `${multiplier}rem`;
      document.documentElement.setAttribute('data-text-size', textSize);
    }
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

export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};

export default TextSizeContext;
