/**
 * Progressive Loading System
 *
 * Implements progressive loading for better user experience.
 * Loads core functionality first, then features as needed.
 */

import { useState, useCallback } from 'react';

export interface LoadingStage {
  id: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  error?: string;
}

export interface ProgressiveLoadingState {
  stages: LoadingStage[];
  currentStage: string | null;
  overallProgress: number;
  isComplete: boolean;
  hasError: boolean;
}

/**
 * Progressive loading hook
 */
export function useProgressiveLoading(): {
  state: ProgressiveLoadingState;
  updateStage: (stageId: string, updates: Partial<LoadingStage>) => void;
  setCurrentStage: (stageId: string | null) => void;
  addStage: (stage: LoadingStage) => void;
  reset: () => void;
} {
  const [state, setState] = useState<ProgressiveLoadingState>({
    stages: [],
    currentStage: null,
    overallProgress: 0,
    isComplete: false,
    hasError: false,
  });

  const updateStage = useCallback((stageId: string, updates: Partial<LoadingStage>) => {
    setState(prev => {
      const newStages = prev.stages.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      );

      const overallProgress = newStages.reduce((sum, stage) => sum + stage.progress, 0) / newStages.length;
      const isComplete = newStages.every(stage => stage.completed);
      const hasError = newStages.some(stage => stage.error);

      return {
        ...prev,
        stages: newStages,
        overallProgress,
        isComplete,
        hasError,
      };
    });
  }, []);

  const setCurrentStage = useCallback((stageId: string | null) => {
    setState(prev => ({ ...prev, currentStage: stageId }));
  }, []);

  const addStage = useCallback((stage: LoadingStage) => {
    setState(prev => ({
      ...prev,
      stages: [...prev.stages, stage],
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      stages: [],
      currentStage: null,
      overallProgress: 0,
      isComplete: false,
      hasError: false,
    });
  }, []);

  return {
    state,
    updateStage,
    setCurrentStage,
    addStage,
    reset,
  };
}

/**
 * Progressive loading stages for BenefitFinder
 */
export const LOADING_STAGES = {
  CORE: {
    id: 'core',
    name: 'Core Application',
    description: 'Loading essential application components',
    progress: 0,
    completed: false,
  },
  DATABASE: {
    id: 'database',
    name: 'Database',
    description: 'Initializing local database',
    progress: 0,
    completed: false,
  },
  RULES_ENGINE: {
    id: 'rules-engine',
    name: 'Rules Engine',
    description: 'Loading eligibility rules engine',
    progress: 0,
    completed: false,
  },
  FEDERAL_RULES: {
    id: 'federal-rules',
    name: 'Federal Rules',
    description: 'Loading federal benefit rules',
    progress: 0,
    completed: false,
  },
  STATE_RULES: {
    id: 'state-rules',
    name: 'State Rules',
    description: 'Loading state-specific rules',
    progress: 0,
    completed: false,
  },
  UI_COMPONENTS: {
    id: 'ui-components',
    name: 'UI Components',
    description: 'Loading user interface components',
    progress: 0,
    completed: false,
  },
  QUESTIONNAIRE: {
    id: 'questionnaire',
    name: 'Questionnaire',
    description: 'Preparing assessment questionnaire',
    progress: 0,
    completed: false,
  },
  RESULTS: {
    id: 'results',
    name: 'Results System',
    description: 'Loading results processing system',
    progress: 0,
    completed: false,
  },
} as const;

/**
 * Progressive loading manager
 */
export class ProgressiveLoader {
  private stages: Map<string, LoadingStage> = new Map();
  private callbacks: Map<string, () => Promise<void>> = new Map();

  constructor() {
    // Initialize stages
    Object.values(LOADING_STAGES).forEach(stage => {
      this.stages.set(stage.id, { ...stage });
    });
  }

  /**
   * Register a loading stage with its implementation
   */
  registerStage(stageId: string, callback: () => Promise<void>): void {
    this.callbacks.set(stageId, callback);
  }

  /**
   * Execute progressive loading
   */
  async executeProgressiveLoading(
    onProgress: (state: ProgressiveLoadingState) => void,
    requiredStages: string[] = ['core', 'database', 'rules-engine']
  ): Promise<ProgressiveLoadingState> {
    const stages = Array.from(this.stages.values());

    // Initialize progress callback
    const updateProgress = (): void => {
      const overallProgress = stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length;
      const isComplete = requiredStages.every(id => this.stages.get(id)?.completed);
      const hasError = stages.some(stage => stage.error);

      onProgress({
        stages: [...stages],
        currentStage: stages.find(s => !s.completed && !s.error)?.id ?? null,
        overallProgress,
        isComplete,
        hasError,
      });
    };

    // Load required stages first
    for (const stageId of requiredStages) {
      const stage = this.stages.get(stageId);
      if (!stage) {continue;}

      try {
        stage.progress = 0;
        stage.completed = false;
        stage.error = undefined;
        updateProgress();

        const callback = this.callbacks.get(stageId);
        if (callback) {
          await callback();
        }

        stage.progress = 100;
        stage.completed = true;
        updateProgress();
      } catch (error) {
        stage.error = error instanceof Error ? error.message : 'Unknown error';
        updateProgress();
        throw error;
      }
    }

    // Load optional stages in background
    const optionalStages = stages.filter(s => !requiredStages.includes(s.id));
    void Promise.all(optionalStages.map(async (stage) => {
      try {
        const callback = this.callbacks.get(stage.id);
        if (callback) {
          await callback();
          const stageRef = this.stages.get(stage.id);
          if (stageRef) {
            stageRef.progress = 100;
            stageRef.completed = true;
          }
          updateProgress();
        }
      } catch (error) {
        // Optional stages can fail without breaking the app
        console.warn(`Optional stage ${stage.id} failed:`, error);
      }
    }));

    return {
      stages: [...stages],
      currentStage: null,
      overallProgress: 100,
      isComplete: true,
      hasError: false,
    };
  }
}

/**
 * Default progressive loader instance
 */
export const progressiveLoader = new ProgressiveLoader();
