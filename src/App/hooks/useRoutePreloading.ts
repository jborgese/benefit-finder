/**
 * Route preloading hook
 * Intelligently preloads routes based on app state
 */

import { useEffect } from 'react';
import { RoutePreloader } from '../../components/RoutePreloader';
import type { AppState } from '../types';

export function useRoutePreloading(appState: AppState) {
  useEffect(() => {
    RoutePreloader.preloadUserJourney(appState);
  }, [appState]);
}
