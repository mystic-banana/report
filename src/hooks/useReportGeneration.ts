import { useState, useCallback, useRef } from "react";
import { reportGenerationService } from "../services/reportGenerationService";
import type {
  BirthData,
  ReportType,
  ReportConfig,
  GeneratedReport,
  ReportProgress,
  ReportError,
} from "../types/reportTypes";

export interface UseReportGenerationOptions {
  autoSave?: boolean;
  cacheResults?: boolean;
  onComplete?: (report: GeneratedReport) => void;
  onError?: (error: ReportError) => void;
}

export const useReportGeneration = (
  options: UseReportGenerationOptions = {},
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ReportProgress | null>(null);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(
    null,
  );
  const [error, setError] = useState<ReportError | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GeneratedReport[]>(
    [],
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  const generateReport = useCallback(
    async (
      birthData: BirthData,
      reportType: ReportType,
      config: ReportConfig = {},
    ): Promise<GeneratedReport | null> => {
      try {
        setIsGenerating(true);
        setError(null);
        setProgress({ stage: "validation", progress: 0 });

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Configure report generation
        const finalConfig: ReportConfig = {
          saveToDatabase: options.autoSave,
          ...config,
        };

        // Generate the report
        const report = await reportGenerationService.generateReport(
          birthData,
          reportType,
          finalConfig,
          (progressUpdate) => {
            setProgress(progressUpdate);
          },
        );

        // Update state
        setCurrentReport(report);
        setGenerationHistory((prev) => [report, ...prev.slice(0, 9)]); // Keep last 10

        // Call completion callback
        if (options.onComplete) {
          options.onComplete(report);
        }

        return report;
      } catch (err) {
        const reportError: ReportError = {
          code: "GENERATION_FAILED",
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
          details: err,
          timestamp: new Date(),
        };

        setError(reportError);

        if (options.onError) {
          options.onError(reportError);
        }

        return null;
      } finally {
        setIsGenerating(false);
        setProgress(null);
        abortControllerRef.current = null;
      }
    },
    [options],
  );

  const generateCompatibilityReport = useCallback(
    async (
      person1: BirthData,
      person2: BirthData,
      config: ReportConfig = {},
    ): Promise<GeneratedReport | null> => {
      try {
        setIsGenerating(true);
        setError(null);
        setProgress({ stage: "validation", progress: 0 });

        const finalConfig: ReportConfig = {
          saveToDatabase: options.autoSave,
          ...config,
        };

        const report =
          await reportGenerationService.generateCompatibilityReport(
            person1,
            person2,
            finalConfig,
          );

        setCurrentReport(report);
        setGenerationHistory((prev) => [report, ...prev.slice(0, 9)]);

        if (options.onComplete) {
          options.onComplete(report);
        }

        return report;
      } catch (err) {
        const reportError: ReportError = {
          code: "COMPATIBILITY_GENERATION_FAILED",
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
          details: err,
          timestamp: new Date(),
        };

        setError(reportError);

        if (options.onError) {
          options.onError(reportError);
        }

        return null;
      } finally {
        setIsGenerating(false);
        setProgress(null);
      }
    },
    [options],
  );

  const generateTransitReport = useCallback(
    async (
      birthData: BirthData,
      startDate: Date,
      endDate: Date,
      config: ReportConfig = {},
    ): Promise<GeneratedReport | null> => {
      try {
        setIsGenerating(true);
        setError(null);
        setProgress({ stage: "validation", progress: 0 });

        const finalConfig: ReportConfig = {
          saveToDatabase: options.autoSave,
          ...config,
        };

        const report = await reportGenerationService.generateTransitReport(
          birthData,
          startDate,
          endDate,
          finalConfig,
        );

        setCurrentReport(report);
        setGenerationHistory((prev) => [report, ...prev.slice(0, 9)]);

        if (options.onComplete) {
          options.onComplete(report);
        }

        return report;
      } catch (err) {
        const reportError: ReportError = {
          code: "TRANSIT_GENERATION_FAILED",
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
          details: err,
          timestamp: new Date(),
        };

        setError(reportError);

        if (options.onError) {
          options.onError(reportError);
        }

        return null;
      } finally {
        setIsGenerating(false);
        setProgress(null);
      }
    },
    [options],
  );

  const generateBatchReports = useCallback(
    async (
      requests: Array<{
        birthData: BirthData;
        reportType: ReportType;
        config?: ReportConfig;
      }>,
    ): Promise<GeneratedReport[]> => {
      try {
        setIsGenerating(true);
        setError(null);
        setProgress({ stage: "validation", progress: 0 });

        const reports = await reportGenerationService.generateBatchReports(
          requests,
          (overallProgress, individualProgress) => {
            setProgress({
              stage: "analysis",
              progress: overallProgress,
              message: `Processing ${individualProgress.filter((p) => p.stage === "complete").length} of ${requests.length} reports`,
            });
          },
        );

        setGenerationHistory((prev) => [...reports, ...prev].slice(0, 20));

        return reports;
      } catch (err) {
        const reportError: ReportError = {
          code: "BATCH_GENERATION_FAILED",
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
          details: err,
          timestamp: new Date(),
        };

        setError(reportError);

        if (options.onError) {
          options.onError(reportError);
        }

        return [];
      } finally {
        setIsGenerating(false);
        setProgress(null);
      }
    },
    [options],
  );

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setProgress(null);
      setError({
        code: "GENERATION_CANCELLED",
        message: "Report generation was cancelled by user",
        timestamp: new Date(),
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setGenerationHistory([]);
  }, []);

  const getCachedReport = useCallback((reportId: string) => {
    return reportGenerationService.getCachedReport(reportId);
  }, []);

  const deleteReport = useCallback(async (reportId: string, userId: string) => {
    return await reportGenerationService.deleteReport(reportId, userId);
  }, []);

  const getUserReports = useCallback(async (userId: string) => {
    return await reportGenerationService.getUserReports(userId);
  }, []);

  // Progress helpers
  const getProgressPercentage = useCallback(() => {
    return progress?.progress || 0;
  }, [progress]);

  const getProgressMessage = useCallback(() => {
    if (!progress) return "";

    const stageMessages = {
      validation: "Validating birth data...",
      calculations: "Performing astrological calculations...",
      analysis: "Analyzing planetary positions...",
      formatting: "Formatting report content...",
      finalizing: "Finalizing report...",
      complete: "Report generation complete!",
      error: "An error occurred during generation",
      pending: "Preparing to generate report...",
    };

    return progress.message || stageMessages[progress.stage] || "Processing...";
  }, [progress]);

  const isComplete = progress?.stage === "complete";
  const hasError = error !== null;
  const canCancel = isGenerating && abortControllerRef.current !== null;

  return {
    // State
    isGenerating,
    progress,
    currentReport,
    error,
    generationHistory,

    // Actions
    generateReport,
    generateCompatibilityReport,
    generateTransitReport,
    generateBatchReports,
    cancelGeneration,
    clearError,
    clearHistory,
    getCachedReport,
    deleteReport,
    getUserReports,

    // Helpers
    getProgressPercentage,
    getProgressMessage,
    isComplete,
    hasError,
    canCancel,
  };
};

export default useReportGeneration;
