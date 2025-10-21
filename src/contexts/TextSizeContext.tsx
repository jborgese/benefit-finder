/**
 * Text Size Context
 *
 * Provides text size management for accessibility
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type TextSize = 'small' | 'medium' | 'large' | 'extra-large';

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

const TEXT_SIZE_ORDER: TextSize[] = ['small', 'medium', 'large', 'extra-large'];

const TEXT_SIZE_MULTIPLIERS = {
  small: 0.875,      // 14px base
  medium: 1,         // 16px base (default)
  large: 1.125,      // 18px base
  'extra-large': 1.25, // 20px base
};

export const TextSizeProvider: React.FC<TextSizeProviderProps> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    // Get saved text size from localStorage or default to 'medium'
    const saved = localStorage.getItem('bf-text-size');
    return (saved as TextSize) || 'medium';
  });

  // Apply text size to document
  useEffect(() => {
    const multiplier = TEXT_SIZE_MULTIPLIERS[textSize];
    document.documentElement.style.fontSize = `${multiplier}rem`;
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('bf-text-size', size);
  };

  const increaseTextSize = () => {
    const currentIndex = TEXT_SIZE_ORDER.indexOf(textSize);
    if (currentIndex < TEXT_SIZE_ORDER.length - 1) {
      setTextSize(TEXT_SIZE_ORDER[currentIndex + 1]);
    }
  };

  const decreaseTextSize = () => {
    const currentIndex = TEXT_SIZE_ORDER.indexOf(textSize);
    if (currentIndex > 0) {
      setTextSize(TEXT_SIZE_ORDER[currentIndex - 1]);
    }
  };

  const resetTextSize = () => {
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
