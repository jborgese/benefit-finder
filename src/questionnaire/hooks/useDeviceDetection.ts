/**
 * Device Detection Hook
 *
 * Detects mobile devices and screen size for responsive UI decisions
 */

import { useState, useEffect } from 'react';

// Extend Navigator interface to include Microsoft-specific properties
interface NavigatorWithTouchPoints extends Navigator {
  msMaxTouchPoints?: number;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768,
    isTouchDevice: false,
  });

  useEffect(() => {
    const updateDeviceInfo = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Touch device detection
      const navLike = navigator as unknown as { maxTouchPoints?: number };
      const msTouch = (navigator as NavigatorWithTouchPoints).msMaxTouchPoints ?? 0;
      const maxTouch = (typeof navLike?.maxTouchPoints === 'number') ? navLike.maxTouchPoints : 0;
      const isTouchDevice = typeof window !== 'undefined' && (
        'ontouchstart' in window ||
        maxTouch > 0 ||
        msTouch > 0
      );

      // Breakpoint definitions
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        isTouchDevice,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};
