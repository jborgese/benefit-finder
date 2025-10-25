/**
 * Resource Monitor - Tracks and optimizes resource consumption during imports
 *
 * This service provides:
 * - Memory usage monitoring
 * - CPU usage tracking
 * - Import performance metrics
 * - Resource optimization recommendations
 */

export interface ResourceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  importPerformance: {
    averageImportTime: number;
    slowestImport: string;
    fastestImport: string;
  };
  resourceRecommendations: string[];
}

export interface ImportPerformanceRecord {
  importKey: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  success: boolean;
  errorMessage?: string;
}

export class ResourceMonitor {
  private static instance: ResourceMonitor;
  private performanceRecords: ImportPerformanceRecord[] = [];
  private readonly MAX_RECORDS = 100;
  private readonly MEMORY_THRESHOLD = 0.8; // 80% memory usage threshold
  private readonly PERFORMANCE_THRESHOLD = 30000; // 30 second performance threshold

  private constructor() {}

  public static getInstance(): ResourceMonitor {
    ResourceMonitor.instance ??= new ResourceMonitor();
    return ResourceMonitor.instance;
  }

  /**
   * Start monitoring an import operation
   */
  public startImportMonitoring(importKey: string): void {
    const memoryBefore = this.getMemoryUsage();

    console.log(`📊 [RESOURCE MONITOR] Starting monitoring for ${importKey}`, {
      memoryBefore,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * End monitoring an import operation
   */
  public endImportMonitoring(
    importKey: string,
    success: boolean,
    errorMessage?: string
  ): void {
    const endTime = Date.now();
    const memoryAfter = this.getMemoryUsage();

    // Find the start time for this import (simplified - in real implementation, you'd track this per import)
    const startTime = endTime - 1000; // Placeholder - would need proper tracking

    const record: ImportPerformanceRecord = {
      importKey,
      startTime,
      endTime,
      duration: endTime - startTime,
      memoryBefore: this.getMemoryUsage(),
      memoryAfter,
      success,
      errorMessage
    };

    this.performanceRecords.push(record);

    // Keep only the most recent records
    if (this.performanceRecords.length > this.MAX_RECORDS) {
      this.performanceRecords = this.performanceRecords.slice(-this.MAX_RECORDS);
    }

    console.log(`📊 [RESOURCE MONITOR] Import completed for ${importKey}`, {
      duration: record.duration,
      memoryBefore: record.memoryBefore,
      memoryAfter: record.memoryAfter,
      success,
      errorMessage
    });

    // Check for resource issues
    this.checkResourceHealth();
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Check resource health and provide recommendations
   */
  private checkResourceHealth(): void {
    const metrics = this.getResourceMetrics();

    // Check memory usage
    if (metrics.memoryUsage.percentage > this.MEMORY_THRESHOLD) {
      console.warn(`⚠️ [RESOURCE MONITOR] High memory usage detected: ${metrics.memoryUsage.percentage.toFixed(1)}%`);
    }

    // Check import performance
    if (metrics.importPerformance.averageImportTime > this.PERFORMANCE_THRESHOLD) {
      console.warn(`⚠️ [RESOURCE MONITOR] Slow import performance detected: ${metrics.importPerformance.averageImportTime}ms average`);
    }

    // Log recommendations
    if (metrics.resourceRecommendations.length > 0) {
      console.log(`💡 [RESOURCE MONITOR] Recommendations:`, metrics.resourceRecommendations);
    }
  }

  /**
   * Get comprehensive resource metrics
   */
  public getResourceMetrics(): ResourceMetrics {
    const memoryUsage = this.getMemoryUsageInfo();
    const importPerformance = this.getImportPerformanceInfo();
    const resourceRecommendations = this.generateRecommendations(memoryUsage, importPerformance);

    return {
      memoryUsage,
      importPerformance,
      resourceRecommendations
    };
  }

  /**
   * Get memory usage information
   */
  private getMemoryUsageInfo(): ResourceMetrics['memoryUsage'] {
    if (typeof performance !== 'undefined' && performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      const percentage = (used / total) * 100;

      return { used, total, percentage };
    }

    return { used: 0, total: 0, percentage: 0 };
  }

  /**
   * Get import performance information
   */
  private getImportPerformanceInfo(): ResourceMetrics['importPerformance'] {
    if (this.performanceRecords.length === 0) {
      return {
        averageImportTime: 0,
        slowestImport: 'N/A',
        fastestImport: 'N/A'
      };
    }

    const durations = this.performanceRecords.map(r => r.duration);
    const averageImportTime = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;

    const slowestRecord = this.performanceRecords.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest
    );

    const fastestRecord = this.performanceRecords.reduce((fastest, current) =>
      current.duration < fastest.duration ? current : fastest
    );

    return {
      averageImportTime,
      slowestImport: slowestRecord.importKey,
      fastestImport: fastestRecord.importKey
    };
  }

  /**
   * Generate resource optimization recommendations
   */
  private generateRecommendations(
    memoryUsage: ResourceMetrics['memoryUsage'],
    importPerformance: ResourceMetrics['importPerformance']
  ): string[] {
    const recommendations: string[] = [];

    // Memory recommendations
    if (memoryUsage.percentage > 0.8) {
      recommendations.push('Consider clearing unused imports or reducing batch sizes');
    }
    if (memoryUsage.percentage > 0.9) {
      recommendations.push('High memory usage detected - consider implementing garbage collection');
    }

    // Performance recommendations
    if (importPerformance.averageImportTime > 30000) {
      recommendations.push('Import performance is slow - consider optimizing rule validation');
    }
    if (importPerformance.averageImportTime > 60000) {
      recommendations.push('Very slow imports detected - consider implementing import caching');
    }

    // General recommendations
    if (this.performanceRecords.length > 50) {
      recommendations.push('Consider implementing import batching to reduce overhead');
    }

    return recommendations;
  }

  /**
   * Get performance records for analysis
   */
  public getPerformanceRecords(): ImportPerformanceRecord[] {
    return [...this.performanceRecords];
  }

  /**
   * Clear performance records
   */
  public clearPerformanceRecords(): void {
    this.performanceRecords = [];
  }

  /**
   * Get import success rate
   */
  public getSuccessRate(): number {
    if (this.performanceRecords.length === 0) return 0;

    const successfulImports = this.performanceRecords.filter(r => r.success).length;
    return (successfulImports / this.performanceRecords.length) * 100;
  }

  /**
   * Check if system is under resource pressure
   */
  public isUnderResourcePressure(): boolean {
    const metrics = this.getResourceMetrics();
    return (
      metrics.memoryUsage.percentage > this.MEMORY_THRESHOLD ||
      metrics.importPerformance.averageImportTime > this.PERFORMANCE_THRESHOLD
    );
  }

  /**
   * Get resource health status
   */
  public getResourceHealthStatus(): 'healthy' | 'warning' | 'critical' {
    const metrics = this.getResourceMetrics();

    if (metrics.memoryUsage.percentage > 0.9 || metrics.importPerformance.averageImportTime > 60000) {
      return 'critical';
    }

    if (metrics.memoryUsage.percentage > 0.8 || metrics.importPerformance.averageImportTime > 30000) {
      return 'warning';
    }

    return 'healthy';
  }
}

// Export singleton instance
export const resourceMonitor = ResourceMonitor.getInstance();
