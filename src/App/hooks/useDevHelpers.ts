/**
 * Development helpers hook
 * Registers global development utilities
 */

import { useEffect } from 'react';
import { clearDatabase } from '../../db/database';
import { clearAndReinitialize } from '../../utils/clearAndReinitialize';
import { forceFixProgramNames } from '../../utils/forceFixProgramNames';

export function useDevHelpers() {
  useEffect(() => {
    if (!import.meta.env.DEV) { return; }

    // Make clearDatabase available globally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).clearBenefitFinderDatabase = async () => {
      try {
        await clearDatabase();
        console.warn('Database cleared successfully. Please refresh the page.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear database:', error);
      }
    };

    // Helper to clear and reinitialize with proper program names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fixProgramNames = async () => {
      try {
        await clearAndReinitialize();
        console.warn('Database reinitialized with user-friendly program names. Please refresh the page.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to reinitialize database:', error);
      }
    };

    // Force fix program names - more aggressive approach
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).forceFixProgramNames = async () => {
      try {
        await forceFixProgramNames();
        console.warn('Program names force fixed! Please refresh the page.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to force fix program names:', error);
      }
    };
  }, []);
}
