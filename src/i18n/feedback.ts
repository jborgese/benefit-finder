/**
 * Translation Feedback System
 *
 * This module provides a framework for collecting and managing community feedback
 * on translations. Since the app is offline-first and privacy-preserving, feedback
 * is stored locally and can be exported for community review.
 */

export interface TranslationFeedback {
  id: string;
  language: string;
  translationKey: string;
  currentText: string;
  suggestedText: string;
  context?: string;
  reason: string;
  timestamp: Date;
  userAgent: string;
  appVersion: string;
}

export interface TranslationIssue {
  id: string;
  language: string;
  translationKey: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  context?: string;
}

/**
 * Translation feedback manager
 */
export class TranslationFeedbackManager {
  private feedbackKey = 'benefit-finder-translation-feedback';
  private issuesKey = 'benefit-finder-translation-issues';

  /**
   * Submit feedback for a translation
   */
  async submitFeedback(feedback: Omit<TranslationFeedback, 'id' | 'timestamp' | 'userAgent' | 'appVersion'>): Promise<void> {
    const fullFeedback: TranslationFeedback = {
      ...feedback,
      id: this.generateId(),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      appVersion: this.getAppVersion(),
    };

    const existingFeedback = await this.getFeedback();
    existingFeedback.push(fullFeedback);

    localStorage.setItem(this.feedbackKey, JSON.stringify(existingFeedback));
  }

  /**
   * Report an issue with a translation
   */
  async reportIssue(issue: Omit<TranslationIssue, 'id' | 'timestamp'>): Promise<void> {
    const fullIssue: TranslationIssue = {
      ...issue,
      id: this.generateId(),
      timestamp: new Date(),
    };

    const existingIssues = await this.getIssues();
    existingIssues.push(fullIssue);

    localStorage.setItem(this.issuesKey, JSON.stringify(existingIssues));
  }

  /**
   * Get all feedback
   */
  async getFeedback(): Promise<TranslationFeedback[]> {
    try {
      const stored = localStorage.getItem(this.feedbackKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get all issues
   */
  async getIssues(): Promise<TranslationIssue[]> {
    try {
      const stored = localStorage.getItem(this.issuesKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Export feedback for community review
   */
  async exportFeedback(): Promise<string> {
    const feedback = await this.getFeedback();
    const issues = await this.getIssues();

    const exportData = {
      exportDate: new Date().toISOString(),
      appVersion: this.getAppVersion(),
      feedback,
      issues,
      summary: {
        totalFeedback: feedback.length,
        totalIssues: issues.length,
        languages: [...new Set([...feedback.map(f => f.language), ...issues.map(i => i.language)])],
        issuesBySeverity: issues.reduce((acc, issue) => {
          acc[issue.severity] = (acc[issue.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear all feedback (for privacy)
   */
  async clearFeedback(): Promise<void> {
    localStorage.removeItem(this.feedbackKey);
    localStorage.removeItem(this.issuesKey);
  }

  /**
   * Get feedback statistics
   */
  async getStatistics(): Promise<{
    totalFeedback: number;
    totalIssues: number;
    languages: string[];
    recentActivity: number;
  }> {
    const feedback = await this.getFeedback();
    const issues = await this.getIssues();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = [
      ...feedback,
      ...issues,
    ].filter(item => item.timestamp > sevenDaysAgo).length;

    return {
      totalFeedback: feedback.length,
      totalIssues: issues.length,
      languages: [...new Set([...feedback.map(f => f.language), ...issues.map(i => i.language)])],
      recentActivity,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAppVersion(): string {
    // This would typically come from package.json or build metadata
    return '0.1.0';
  }
}

/**
 * React hook for translation feedback
 */
export const useTranslationFeedback = () => {
  const manager = new TranslationFeedbackManager();

  const submitFeedback = async (feedback: Omit<TranslationFeedback, 'id' | 'timestamp' | 'userAgent' | 'appVersion'>) => {
    await manager.submitFeedback(feedback);
  };

  const reportIssue = async (issue: Omit<TranslationIssue, 'id' | 'timestamp'>) => {
    await manager.reportIssue(issue);
  };

  const exportFeedback = async () => {
    return await manager.exportFeedback();
  };

  const getStatistics = async () => {
    return await manager.getStatistics();
  };

  const clearFeedback = async () => {
    await manager.clearFeedback();
  };

  return {
    submitFeedback,
    reportIssue,
    exportFeedback,
    getStatistics,
    clearFeedback,
  };
};

/**
 * Utility function to create feedback for a specific translation
 */
export const createTranslationFeedback = (
  language: string,
  translationKey: string,
  currentText: string,
  suggestedText: string,
  reason: string,
  context?: string
): Omit<TranslationFeedback, 'id' | 'timestamp' | 'userAgent' | 'appVersion'> => {
  return {
    language,
    translationKey,
    currentText,
    suggestedText,
    reason,
    context,
  };
};

/**
 * Utility function to create an issue report
 */
export const createTranslationIssue = (
  language: string,
  translationKey: string,
  issue: string,
  severity: 'low' | 'medium' | 'high',
  context?: string
): Omit<TranslationIssue, 'id' | 'timestamp'> => {
  return {
    language,
    translationKey,
    issue,
    severity,
    context,
  };
};
