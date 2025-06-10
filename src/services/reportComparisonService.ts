import { supabase } from "../lib/supabaseClient";
import type {
  ReportComparison,
  ComparisonResult,
  ComparisonSettings,
  GeneratedReport,
  ComparisonMatch,
  ComparisonDifference,
  FieldComparison,
  TextPosition,
} from "../types/reportTypes";

class ReportComparisonService {
  // Create a new comparison
  async createComparison(
    name: string,
    reportIds: string[],
    settings: Partial<ComparisonSettings> = {},
  ): Promise<ReportComparison | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Fetch the reports
      const { data: reports, error: reportsError } = await supabase
        .from("astrology_reports")
        .select("*")
        .in("id", reportIds);

      if (reportsError) throw reportsError;
      if (!reports || reports.length < 2) {
        throw new Error("At least 2 reports are required for comparison");
      }

      const defaultSettings: ComparisonSettings = {
        highlightDifferences: true,
        showSimilarities: true,
        compareFields: [
          {
            field: "content",
            weight: 1.0,
            enabled: true,
            displayName: "Content",
          },
          {
            field: "report_type",
            weight: 0.8,
            enabled: true,
            displayName: "Report Type",
          },
          {
            field: "birth_data",
            weight: 0.6,
            enabled: true,
            displayName: "Birth Data",
          },
          {
            field: "planetary_positions",
            weight: 0.7,
            enabled: true,
            displayName: "Planetary Positions",
          },
        ],
        syncScrolling: true,
        showMetadata: true,
        colorScheme: "default",
        ...settings,
      };

      const comparison: ReportComparison = {
        id: crypto.randomUUID(),
        name,
        reports: reports as GeneratedReport[],
        comparisonType: "side-by-side",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.user.id,
        settings: defaultSettings,
      };

      // Store comparison in localStorage for now (could be moved to database)
      const existingComparisons = this.getStoredComparisons();
      existingComparisons.push(comparison);
      localStorage.setItem(
        "report_comparisons",
        JSON.stringify(existingComparisons),
      );

      return comparison;
    } catch (error) {
      console.error("Error creating comparison:", error);
      return null;
    }
  }

  // Get stored comparisons
  getStoredComparisons(): ReportComparison[] {
    try {
      const stored = localStorage.getItem("report_comparisons");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get comparison by ID
  async getComparison(id: string): Promise<ReportComparison | null> {
    const comparisons = this.getStoredComparisons();
    return comparisons.find((c) => c.id === id) || null;
  }

  // Update comparison settings
  async updateComparison(
    id: string,
    updates: Partial<ReportComparison>,
  ): Promise<ReportComparison | null> {
    try {
      const comparisons = this.getStoredComparisons();
      const index = comparisons.findIndex((c) => c.id === id);

      if (index === -1) return null;

      comparisons[index] = {
        ...comparisons[index],
        ...updates,
        updatedAt: new Date(),
      };

      localStorage.setItem("report_comparisons", JSON.stringify(comparisons));
      return comparisons[index];
    } catch (error) {
      console.error("Error updating comparison:", error);
      return null;
    }
  }

  // Delete comparison
  async deleteComparison(id: string): Promise<boolean> {
    try {
      const comparisons = this.getStoredComparisons();
      const filtered = comparisons.filter((c) => c.id !== id);
      localStorage.setItem("report_comparisons", JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting comparison:", error);
      return false;
    }
  }

  // Compare reports and generate results
  async compareReports(
    reports: GeneratedReport[],
    settings: ComparisonSettings,
  ): Promise<ComparisonResult> {
    try {
      const similarities: ComparisonMatch[] = [];
      const differences: ComparisonDifference[] = [];
      const fieldComparisons: FieldComparison[] = [];

      // Compare each enabled field
      for (const field of settings.compareFields.filter((f) => f.enabled)) {
        const fieldComparison = await this.compareField(
          reports,
          field.field,
          field.weight,
        );
        fieldComparisons.push(fieldComparison);

        // Extract similarities and differences from field comparison
        const fieldSimilarities = await this.findSimilarities(
          reports,
          field.field,
        );
        const fieldDifferences = await this.findDifferences(
          reports,
          field.field,
        );

        similarities.push(...fieldSimilarities);
        differences.push(...fieldDifferences);
      }

      // Calculate overall similarity
      const overallSimilarity = this.calculateOverallSimilarity(
        fieldComparisons,
        settings,
      );

      return {
        similarities,
        differences,
        overallSimilarity,
        fieldComparisons,
      };
    } catch (error) {
      console.error("Error comparing reports:", error);
      return {
        similarities: [],
        differences: [],
        overallSimilarity: 0,
        fieldComparisons: [],
      };
    }
  }

  // Compare a specific field across reports
  private async compareField(
    reports: GeneratedReport[],
    fieldName: string,
    weight: number,
  ): Promise<FieldComparison> {
    let matches = 0;
    let differences = 0;
    let totalComparisons = 0;

    // Compare each pair of reports
    for (let i = 0; i < reports.length; i++) {
      for (let j = i + 1; j < reports.length; j++) {
        totalComparisons++;
        const similarity = this.calculateFieldSimilarity(
          this.getFieldValue(reports[i], fieldName),
          this.getFieldValue(reports[j], fieldName),
        );

        if (similarity > 0.8) {
          matches++;
        } else if (similarity < 0.3) {
          differences++;
        }
      }
    }

    const similarity = totalComparisons > 0 ? matches / totalComparisons : 0;

    return {
      field: fieldName,
      similarity,
      differences,
      matches,
    };
  }

  // Find similarities between reports
  private async findSimilarities(
    reports: GeneratedReport[],
    fieldName: string,
  ): Promise<ComparisonMatch[]> {
    const similarities: ComparisonMatch[] = [];
    const values = new Map<string, string[]>();

    // Group reports by field values
    reports.forEach((report) => {
      const value = this.getFieldValue(report, fieldName);
      const normalizedValue = this.normalizeValue(value);

      if (!values.has(normalizedValue)) {
        values.set(normalizedValue, []);
      }
      values.get(normalizedValue)!.push(report.id);
    });

    // Find values shared by multiple reports
    values.forEach((reportIds, value) => {
      if (reportIds.length > 1) {
        similarities.push({
          field: fieldName,
          value,
          confidence: this.calculateConfidence(
            reportIds.length,
            reports.length,
          ),
          reports: reportIds,
        });
      }
    });

    return similarities;
  }

  // Find differences between reports
  private async findDifferences(
    reports: GeneratedReport[],
    fieldName: string,
  ): Promise<ComparisonDifference[]> {
    const differences: ComparisonDifference[] = [];
    const uniqueValues = new Set<string>();
    const valuesByReport: { reportId: string; value: string }[] = [];

    // Collect all unique values
    reports.forEach((report) => {
      const value = this.getFieldValue(report, fieldName);
      const normalizedValue = this.normalizeValue(value);
      uniqueValues.add(normalizedValue);
      valuesByReport.push({ reportId: report.id, value: normalizedValue });
    });

    // If all values are different, create a difference entry
    if (uniqueValues.size === reports.length && reports.length > 1) {
      differences.push({
        field: fieldName,
        values: valuesByReport,
        significance: this.calculateSignificance(fieldName),
        category: this.getCategoryForField(fieldName),
      });
    }

    return differences;
  }

  // Helper methods
  private getFieldValue(report: GeneratedReport, fieldName: string): string {
    switch (fieldName) {
      case "content":
        return report.formats?.html || "";
      case "report_type":
        return report.type || "";
      case "birth_data":
        return JSON.stringify(report.birthData || {});
      case "planetary_positions":
        return JSON.stringify(report.calculations?.planets || {});
      default:
        return "";
    }
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().trim().replace(/\s+/g, " ");
  }

  private calculateFieldSimilarity(value1: string, value2: string): number {
    if (value1 === value2) return 1.0;
    if (!value1 || !value2) return 0.0;

    // Simple similarity calculation using Levenshtein distance
    const maxLength = Math.max(value1.length, value2.length);
    if (maxLength === 0) return 1.0;

    const distance = this.levenshteinDistance(value1, value2);
    return 1 - distance / maxLength;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateConfidence(
    matchCount: number,
    totalReports: number,
  ): number {
    return matchCount / totalReports;
  }

  private calculateSignificance(fieldName: string): "high" | "medium" | "low" {
    const highSignificanceFields = ["report_type", "birth_data"];
    const mediumSignificanceFields = ["planetary_positions"];

    if (highSignificanceFields.includes(fieldName)) return "high";
    if (mediumSignificanceFields.includes(fieldName)) return "medium";
    return "low";
  }

  private getCategoryForField(fieldName: string): string {
    const categories: Record<string, string> = {
      content: "Content",
      report_type: "Report Type",
      birth_data: "Birth Information",
      planetary_positions: "Astrological Data",
    };
    return categories[fieldName] || "Other";
  }

  private calculateOverallSimilarity(
    fieldComparisons: FieldComparison[],
    settings: ComparisonSettings,
  ): number {
    if (fieldComparisons.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    fieldComparisons.forEach((comparison) => {
      const field = settings.compareFields.find(
        (f) => f.field === comparison.field,
      );
      const weight = field?.weight || 1;
      weightedSum += comparison.similarity * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Export comparison results
  async exportComparison(
    comparison: ReportComparison,
    result: ComparisonResult,
    format: "json" | "csv" | "html",
  ): Promise<Blob | null> {
    try {
      switch (format) {
        case "json":
          return new Blob([JSON.stringify({ comparison, result }, null, 2)], {
            type: "application/json",
          });

        case "csv":
          const csvContent = this.generateCSV(comparison, result);
          return new Blob([csvContent], { type: "text/csv" });

        case "html":
          const htmlContent = this.generateHTML(comparison, result);
          return new Blob([htmlContent], { type: "text/html" });

        default:
          return null;
      }
    } catch (error) {
      console.error("Error exporting comparison:", error);
      return null;
    }
  }

  private generateCSV(
    comparison: ReportComparison,
    result: ComparisonResult,
  ): string {
    const headers = ["Field", "Similarity", "Matches", "Differences"];
    const rows = result.fieldComparisons.map((fc) => [
      fc.field,
      fc.similarity.toFixed(3),
      fc.matches.toString(),
      fc.differences.toString(),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  private generateHTML(
    comparison: ReportComparison,
    result: ComparisonResult,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Report Comparison: ${comparison.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .similarity { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .field-comparison { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .differences { background: #ffebee; }
        .similarities { background: #e8f5e8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Report Comparison: ${comparison.name}</h1>
        <div class="similarity">Overall Similarity: ${(result.overallSimilarity * 100).toFixed(1)}%</div>
    </div>
    
    <h2>Field Comparisons</h2>
    ${result.fieldComparisons
      .map(
        (fc) => `
        <div class="field-comparison">
            <h3>${fc.field}</h3>
            <p>Similarity: ${(fc.similarity * 100).toFixed(1)}%</p>
            <p>Matches: ${fc.matches} | Differences: ${fc.differences}</p>
        </div>
    `,
      )
      .join("")}
    
    <h2>Key Differences</h2>
    <div class="differences">
        ${result.differences
          .map(
            (diff) => `
            <div>
                <h4>${diff.field} (${diff.significance} significance)</h4>
                <ul>
                    ${diff.values.map((v) => `<li>Report ${v.reportId}: ${v.value}</li>`).join("")}
                </ul>
            </div>
        `,
          )
          .join("")}
    </div>
    
    <h2>Similarities</h2>
    <div class="similarities">
        ${result.similarities
          .map(
            (sim) => `
            <div>
                <h4>${sim.field}</h4>
                <p>Value: ${sim.value}</p>
                <p>Confidence: ${(sim.confidence * 100).toFixed(1)}%</p>
                <p>Reports: ${sim.reports.join(", ")}</p>
            </div>
        `,
          )
          .join("")}
    </div>
</body>
</html>`;
  }
}

export const reportComparisonService = new ReportComparisonService();
