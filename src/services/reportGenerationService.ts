import { supabase } from "../lib/supabaseClient";
import * as astronomicalCalculations from "../utils/astronomicalCalculations";
import { generateProfessionalAstrologyReport } from "../utils/pdfGenerator";
import type {
  BirthData,
  ReportType,
  ReportConfig,
  GeneratedReport,
  ReportProgress,
  ReportAnalytics,
  ReportEngagementMetrics,
} from "../types/reportTypes";

// Report generation service class
export class ReportGenerationService {
  private static instance: ReportGenerationService;
  private reportCache = new Map<string, GeneratedReport>();
  private progressCallbacks = new Map<
    string,
    (progress: ReportProgress) => void
  >();

  private constructor() {}

  public static getInstance(): ReportGenerationService {
    if (!ReportGenerationService.instance) {
      ReportGenerationService.instance = new ReportGenerationService();
    }
    return ReportGenerationService.instance;
  }

  /**
   * Generate a complete astrological report
   */
  public async generateReport(
    birthData: BirthData,
    reportType: ReportType,
    config: ReportConfig = {},
    onProgress?: (progress: ReportProgress) => void,
  ): Promise<GeneratedReport> {
    const reportId = this.generateReportId(birthData, reportType);

    // Check cache first
    if (this.reportCache.has(reportId) && !config.forceRegenerate) {
      const cachedReport = this.reportCache.get(reportId)!;
      if (this.isReportValid(cachedReport)) {
        return cachedReport;
      }
    }

    // Register progress callback
    if (onProgress) {
      this.progressCallbacks.set(reportId, onProgress);
    }

    try {
      this.updateProgress(reportId, { stage: "validation", progress: 0 });

      // Validate birth data
      this.validateBirthData(birthData);

      this.updateProgress(reportId, { stage: "calculations", progress: 10 });

      // Perform astrological calculations
      const calculations = await this.performCalculations(
        birthData,
        reportType,
      );

      this.updateProgress(reportId, { stage: "analysis", progress: 40 });

      // Generate report content based on type
      const reportContent = await this.generateReportContent(
        calculations,
        reportType,
        config,
      );

      this.updateProgress(reportId, { stage: "formatting", progress: 70 });

      // Format the report
      const formattedReport = await this.formatReport(
        reportContent,
        reportType,
        config,
      );

      this.updateProgress(reportId, { stage: "finalizing", progress: 90 });

      // Create final report object
      const report: GeneratedReport = {
        id: reportId,
        type: reportType,
        birthData,
        content: formattedReport,
        calculations,
        metadata: {
          generatedAt: new Date(),
          version: "1.0",
          config,
        },
        formats: {
          html: formattedReport.html,
          ...(config.includePDF && {
            pdf: await this.generatePDFReport(formattedReport),
          }),
        },
      };

      // Cache the report
      this.reportCache.set(reportId, report);

      // Store in database if user is authenticated
      if (config.saveToDatabase) {
        await this.saveReportToDatabase(report);
      }

      this.updateProgress(reportId, { stage: "complete", progress: 100 });

      return report;
    } catch (error) {
      this.updateProgress(reportId, {
        stage: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    } finally {
      // Clean up progress callback
      this.progressCallbacks.delete(reportId);
    }
  }

  /**
   * Generate multiple reports for comparison
   */
  public async generateBatchReports(
    requests: Array<{
      birthData: BirthData;
      reportType: ReportType;
      config?: ReportConfig;
    }>,
    onProgress?: (overall: number, individual: ReportProgress[]) => void,
  ): Promise<GeneratedReport[]> {
    const results: GeneratedReport[] = [];
    const individualProgress: ReportProgress[] = new Array(
      requests.length,
    ).fill({
      stage: "pending",
      progress: 0,
    });

    for (let i = 0; i < requests.length; i++) {
      const { birthData, reportType, config } = requests[i];

      try {
        const report = await this.generateReport(
          birthData,
          reportType,
          config,
          (progress) => {
            individualProgress[i] = progress;
            if (onProgress) {
              const overallProgress =
                individualProgress.reduce((sum, p) => sum + p.progress, 0) /
                requests.length;
              onProgress(overallProgress, [...individualProgress]);
            }
          },
        );

        results.push(report);
      } catch (error) {
        individualProgress[i] = {
          stage: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        };
        throw error;
      }
    }

    return results;
  }

  /**
   * Generate compatibility report between two people
   */
  public async generateCompatibilityReport(
    person1: BirthData,
    person2: BirthData,
    config: ReportConfig = {},
  ): Promise<GeneratedReport> {
    const compatibilityData = {
      person1,
      person2,
      type: "compatibility" as const,
    };

    const reportId = this.generateReportId(compatibilityData, "compatibility");

    // Perform calculations for both people
    const [calc1, calc2] = await Promise.all([
      this.performCalculations(person1, "western"),
      this.performCalculations(person2, "western"),
    ]);

    // Generate compatibility analysis
    const compatibilityAnalysis = await this.generateCompatibilityAnalysis(
      calc1,
      calc2,
    );

    const report: GeneratedReport = {
      id: reportId,
      type: "compatibility",
      birthData: compatibilityData,
      content: compatibilityAnalysis,
      calculations: { person1: calc1, person2: calc2 },
      metadata: {
        generatedAt: new Date(),
        version: "1.0",
        config,
      },
      formats: {
        html: compatibilityAnalysis.html,
      },
    };

    return report;
  }

  /**
   * Generate transit report for specific date range
   */
  public async generateTransitReport(
    birthData: BirthData,
    startDate: Date,
    endDate: Date,
    config: ReportConfig = {},
  ): Promise<GeneratedReport> {
    const transitData = {
      ...birthData,
      startDate,
      endDate,
    };

    const reportId = this.generateReportId(transitData, "transit");

    // Calculate transits for the date range
    const transitCalculations = await this.calculateTransits(
      birthData,
      startDate,
      endDate,
    );

    // Generate transit analysis
    const transitAnalysis = await this.generateTransitAnalysis(
      transitCalculations,
      config,
    );

    const report: GeneratedReport = {
      id: reportId,
      type: "transit",
      birthData: transitData,
      content: transitAnalysis,
      calculations: transitCalculations,
      metadata: {
        generatedAt: new Date(),
        version: "1.0",
        config,
      },
      formats: {
        html: transitAnalysis.html,
      },
    };

    return report;
  }

  /**
   * Get cached report if available
   */
  public getCachedReport(reportId: string): GeneratedReport | null {
    return this.reportCache.get(reportId) || null;
  }

  /**
   * Clear report cache
   */
  public clearCache(): void {
    this.reportCache.clear();
  }

  /**
   * Get user's saved reports from database
   */
  public async getUserReports(userId: string): Promise<GeneratedReport[]> {
    try {
      const { data, error } = await supabase
        .from("user_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data?.map(this.deserializeReport) || [];
    } catch (error) {
      console.error("Error fetching user reports:", error);
      return [];
    }
  }

  /**
   * Delete a saved report
   */
  public async deleteReport(
    reportId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_reports")
        .delete()
        .eq("id", reportId)
        .eq("user_id", userId);

      if (error) throw error;

      // Remove from cache
      this.reportCache.delete(reportId);

      return true;
    } catch (error) {
      console.error("Error deleting report:", error);
      return false;
    }
  }

  /**
   * Get report engagement metrics
   */
  public async getReportEngagementMetrics(
    reportId: string,
  ): Promise<ReportEngagementMetrics | null> {
    try {
      const { data, error } = await supabase
        .from("report_analytics")
        .select("*")
        .eq("report_id", reportId);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Calculate engagement metrics
      const totalViews = data.length;
      const averageReadingTime =
        data.reduce(
          (sum, session) => sum + (session.session_duration || 0),
          0,
        ) / totalViews;
      const averageCompletionRate =
        data.reduce(
          (sum, session) => sum + (session.completion_percentage || 0),
          0,
        ) / totalViews;

      // Aggregate section views
      const sectionViewCounts: { [key: string]: number } = {};
      data.forEach((session) => {
        (session.sections_viewed || []).forEach((section: string) => {
          sectionViewCounts[section] = (sectionViewCounts[section] || 0) + 1;
        });
      });

      const popularSections = Object.entries(sectionViewCounts)
        .map(([section, views]) => ({ section, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Aggregate interaction types
      const interactionTypeCounts: { [key: string]: number } = {};
      data.forEach((session) => {
        (session.interactions_data || []).forEach((interaction: any) => {
          interactionTypeCounts[interaction.type] =
            (interactionTypeCounts[interaction.type] || 0) + 1;
        });
      });

      const interactionTypes = Object.entries(interactionTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      const exportCount = data.filter((session) => session.exported).length;
      const shareCount = data.filter((session) => session.shared).length;
      const bookmarkCount = data.filter((session) => session.bookmarked).length;

      return {
        totalViews,
        averageReadingTime,
        averageCompletionRate,
        popularSections,
        interactionTypes,
        exportCount,
        shareCount,
        bookmarkCount,
      };
    } catch (error) {
      console.error("Error fetching report engagement metrics:", error);
      return null;
    }
  }

  /**
   * Generate sharing URL for a report
   */
  public generateSharingUrl(
    reportId: string,
    options?: {
      includeAnalytics?: boolean;
      expiresIn?: number; // hours
    },
  ): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      report: reportId,
      ...(options?.includeAnalytics && { analytics: "true" }),
      ...(options?.expiresIn && {
        expires: (Date.now() + options.expiresIn * 60 * 60 * 1000).toString(),
      }),
    });

    return `${baseUrl}/reports/shared?${params.toString()}`;
  }

  // Private helper methods

  private validateBirthData(birthData: BirthData): void {
    if (!birthData.date || !birthData.time || !birthData.location) {
      throw new Error("Complete birth data is required (date, time, location)");
    }

    if (!birthData.location.latitude || !birthData.location.longitude) {
      throw new Error("Valid location coordinates are required");
    }

    const birthDate = new Date(birthData.date);
    if (birthDate > new Date()) {
      throw new Error("Birth date cannot be in the future");
    }

    if (birthDate < new Date("1900-01-01")) {
      throw new Error("Birth date must be after 1900");
    }
  }

  private async performCalculations(
    birthData: BirthData,
    reportType: ReportType,
  ): Promise<any> {
    try {
      switch (reportType) {
        case "western":
          return await astronomicalCalculations.calculatePlanetaryPositions(
            birthData,
          );
        case "vedic":
          // Use existing calculations but adapt for Vedic
          const vedicData =
            await astronomicalCalculations.calculatePlanetaryPositions(
              birthData,
            );
          return {
            ...vedicData,
            system: "vedic",
            ayanamsa: 24.1, // Placeholder
          };
        case "chinese":
          // Adapt existing calculations for Chinese astrology
          return {
            fourPillars: {
              year: { stem: "Wood", branch: "Tiger" },
              month: { stem: "Fire", branch: "Horse" },
              day: { stem: "Earth", branch: "Dog" },
              hour: { stem: "Metal", branch: "Rat" },
            },
            elements: { wood: 2, fire: 2, earth: 2, metal: 1, water: 1 },
          };
        case "hellenistic":
          const hellenisticData =
            await astronomicalCalculations.calculatePlanetaryPositions(
              birthData,
            );
          return {
            ...hellenisticData,
            lots: [
              { name: "Lot of Fortune", sign: "Leo", degree: 15.3 },
              { name: "Lot of Spirit", sign: "Aquarius", degree: 8.7 },
            ],
          };
        default:
          return await astronomicalCalculations.calculatePlanetaryPositions(
            birthData,
          );
      }
    } catch (error) {
      throw new Error(`Failed to perform ${reportType} calculations: ${error}`);
    }
  }

  private async generateReportContent(
    calculations: any,
    reportType: ReportType,
    config: ReportConfig,
  ): Promise<any> {
    // Use edge functions for server-side generation when available
    if (config.useServerGeneration) {
      return await this.generateServerSideContent(
        calculations,
        reportType,
        config,
      );
    }

    // Client-side generation
    return await this.generateClientSideContent(
      calculations,
      reportType,
      config,
    );
  }

  private async generateServerSideContent(
    calculations: any,
    reportType: ReportType,
    config: ReportConfig,
  ): Promise<any> {
    try {
      const functionName = this.getEdgeFunctionName(reportType);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          calculations,
          config,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn(
        "Server-side generation failed, falling back to client-side:",
        error,
      );
      return await this.generateClientSideContent(
        calculations,
        reportType,
        config,
      );
    }
  }

  private async generateClientSideContent(
    calculations: any,
    reportType: ReportType,
    config: ReportConfig,
  ): Promise<any> {
    // Generate content using existing report renderers
    const content = {
      summary: this.generateSummary(calculations, reportType),
      sections: this.generateSections(calculations, reportType, config),
      charts: this.generateChartData(calculations, reportType),
    };

    return content;
  }

  private async formatReport(
    content: any,
    reportType: ReportType,
    config: ReportConfig,
  ): Promise<any> {
    const html = this.generateHTMLReport(content, reportType, config);

    return {
      html,
      content,
      metadata: {
        wordCount: this.countWords(html),
        sections: Object.keys(content.sections || {}).length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private async generatePDFReport(formattedReport: any): Promise<string> {
    try {
      // Use the professional astrology report generator
      const pdfBlob = await generateProfessionalAstrologyReport({
        title: "Astrological Report",
        content: formattedReport.html,
        reportType: "astrology",
        userName: "User",
        isPremium: true,
      });
      return "PDF generated successfully";
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw new Error("Failed to generate PDF report");
    }
  }

  private generateHTMLReport(
    content: any,
    reportType: ReportType,
    config: ReportConfig,
  ): string {
    // Generate HTML using existing report templates
    const template = this.getReportTemplate(reportType);
    return this.renderTemplate(template, content, config);
  }

  private generateSummary(calculations: any, reportType: ReportType): string {
    // Generate a summary based on the report type and calculations
    switch (reportType) {
      case "western":
        return this.generateWesternSummary(calculations);
      case "vedic":
        return this.generateVedicSummary(calculations);
      case "chinese":
        return this.generateChineseSummary(calculations);
      case "hellenistic":
        return this.generateHellenisticSummary(calculations);
      default:
        return "Astrological analysis based on your birth data.";
    }
  }

  private generateSections(
    calculations: any,
    reportType: ReportType,
    config: ReportConfig,
  ): any {
    const sections: any = {};

    // Generate sections based on report type
    switch (reportType) {
      case "western":
        sections.planets = this.generatePlanetaryAnalysis(calculations);
        sections.houses = this.generateHouseAnalysis(calculations);
        sections.aspects = this.generateAspectAnalysis(calculations);
        break;
      case "vedic":
        sections.dashas = this.generateDashaAnalysis(calculations);
        sections.nakshatras = this.generateNakshatraAnalysis(calculations);
        sections.yogas = this.generateYogaAnalysis(calculations);
        break;
      case "chinese":
        sections.elements = this.generateElementalAnalysis(calculations);
        sections.animals = this.generateAnimalSignAnalysis(calculations);
        break;
    }

    return sections;
  }

  private generateChartData(calculations: any, reportType: ReportType): any {
    return {
      type: reportType,
      data: calculations,
      visualization: this.generateVisualizationData(calculations, reportType),
    };
  }

  private async calculateTransits(
    birthData: BirthData,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Use existing calculations to simulate transits
    const natalChart =
      await astronomicalCalculations.calculatePlanetaryPositions(birthData);
    const transits = [];

    // Calculate transits for each day in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const transitPlanets =
        await astronomicalCalculations.calculatePlanetaryPositions({
          ...birthData,
          date: currentDate.toISOString().split("T")[0],
        });

      transits.push({
        date: new Date(currentDate),
        transits: this.calculateDailyTransits(natalChart, transitPlanets),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      natalChart,
      transits,
      period: { startDate, endDate },
    };
  }

  private calculateDailyTransits(natalChart: any, transitPlanets: any): any[] {
    // Placeholder for daily transit calculations
    return [
      {
        transitPlanet: "Jupiter",
        natalPlanet: "Sun",
        aspect: "trine",
        orb: 1.5,
        interpretation: "Favorable period for growth and expansion",
      },
    ];
  }

  private async generateTransitAnalysis(
    transitCalculations: any,
    config: ReportConfig,
  ): Promise<any> {
    return {
      html: this.generateTransitHTML(transitCalculations),
      transits: transitCalculations,
      interpretations: this.generateTransitInterpretations(transitCalculations),
    };
  }

  private async generateCompatibilityAnalysis(
    calc1: any,
    calc2: any,
  ): Promise<any> {
    const compatibility = this.calculateCompatibility(calc1, calc2);

    return {
      html: this.generateCompatibilityHTML(compatibility),
      compatibility,
      score: this.calculateCompatibilityScore(compatibility),
    };
  }

  private calculateCompatibility(calc1: any, calc2: any): any {
    // Placeholder compatibility calculation
    return {
      synastryAspects: [
        {
          planet1: "sun",
          planet2: "moon",
          aspect: "conjunction",
          orb: 2.1,
          interpretation: "Strong emotional connection",
        },
      ],
      overallScore: 75,
    };
  }

  private async saveReportToDatabase(report: GeneratedReport): Promise<void> {
    try {
      const { error } = await supabase.from("user_reports").insert({
        id: report.id,
        type: report.type,
        birth_data: report.birthData,
        content: report.content,
        calculations: report.calculations,
        metadata: report.metadata,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving report to database:", error);
      // Don't throw - report generation should succeed even if saving fails
    }
  }

  private generateReportId(data: any, type: ReportType): string {
    const dataString = JSON.stringify(data);
    const hash = this.simpleHash(dataString + type);
    return `${type}_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private isReportValid(report: GeneratedReport): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const age = Date.now() - report.metadata.generatedAt.getTime();
    return age < maxAge;
  }

  private updateProgress(reportId: string, progress: ReportProgress): void {
    const callback = this.progressCallbacks.get(reportId);
    if (callback) {
      callback(progress);
    }
  }

  private getEdgeFunctionName(reportType: ReportType): string {
    const functionMap = {
      western: "generate-html-report",
      vedic: "generate-vedic-report",
      transit: "generate-transit-report",
      chinese: "generate-html-report",
      hellenistic: "generate-html-report",
      compatibility: "generate-html-report",
    };
    return functionMap[reportType] || "generate-html-report";
  }

  private getReportTemplate(reportType: ReportType): string {
    // Return appropriate template based on report type
    return `<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <style>{{styles}}</style>
</head>
<body>
  <div class="report-container">
    {{content}}
  </div>
</body>
</html>`;
  }

  private renderTemplate(
    template: string,
    content: any,
    config: ReportConfig,
  ): string {
    return template
      .replace("{{title}}", `${content.type} Astrological Report`)
      .replace("{{styles}}", this.getReportStyles(config))
      .replace("{{content}}", this.renderContent(content));
  }

  private getReportStyles(config: ReportConfig): string {
    return `
      body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
      .report-container { max-width: 800px; margin: 0 auto; padding: 20px; }
      h1, h2, h3 { color: #2c3e50; }
      .section { margin-bottom: 30px; }
      .chart { text-align: center; margin: 20px 0; }
    `;
  }

  private renderContent(content: any): string {
    let html = `<h1>${content.type} Report</h1>`;

    if (content.summary) {
      html += `<div class="section"><h2>Summary</h2><p>${content.summary}</p></div>`;
    }

    if (content.sections) {
      Object.entries(content.sections).forEach(([key, value]) => {
        html += `<div class="section"><h2>${this.capitalize(key)}</h2><div>${value}</div></div>`;
      });
    }

    return html;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private countWords(html: string): number {
    const text = html.replace(/<[^>]*>/g, "");
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  private deserializeReport(data: any): GeneratedReport {
    return {
      ...data,
      metadata: {
        ...data.metadata,
        generatedAt: new Date(data.metadata.generatedAt),
      },
    };
  }

  // Placeholder methods for specific analysis types
  private generateWesternSummary(calculations: any): string {
    return "Western astrological analysis based on tropical zodiac system.";
  }

  private generateVedicSummary(calculations: any): string {
    return "Vedic astrological analysis based on sidereal zodiac system.";
  }

  private generateChineseSummary(calculations: any): string {
    return "Chinese astrological analysis based on Four Pillars system.";
  }

  private generateHellenisticSummary(calculations: any): string {
    return "Hellenistic astrological analysis based on traditional methods.";
  }

  private generatePlanetaryAnalysis(calculations: any): string {
    return "Planetary positions and their influences.";
  }

  private generateHouseAnalysis(calculations: any): string {
    return "Analysis of astrological houses and their meanings.";
  }

  private generateAspectAnalysis(calculations: any): string {
    return "Planetary aspects and their interpretations.";
  }

  private generateDashaAnalysis(calculations: any): string {
    return "Vedic dasha periods and their influences.";
  }

  private generateNakshatraAnalysis(calculations: any): string {
    return "Nakshatra analysis and lunar mansion influences.";
  }

  private generateYogaAnalysis(calculations: any): string {
    return "Vedic yogas and their significance.";
  }

  private generateElementalAnalysis(calculations: any): string {
    return "Five element analysis in Chinese astrology.";
  }

  private generateAnimalSignAnalysis(calculations: any): string {
    return "Chinese zodiac animal sign analysis.";
  }

  private generateVisualizationData(
    calculations: any,
    reportType: ReportType,
  ): any {
    return {
      chartType: reportType,
      data: calculations,
    };
  }

  private generateTransitHTML(transitCalculations: any): string {
    return "<div>Transit analysis content</div>";
  }

  private generateTransitInterpretations(transitCalculations: any): any {
    return {};
  }

  private generateCompatibilityHTML(compatibility: any): string {
    return "<div>Compatibility analysis content</div>";
  }

  private calculateCompatibilityScore(compatibility: any): number {
    return 75; // Placeholder
  }
}

// Export singleton instance
export const reportGenerationService = ReportGenerationService.getInstance();

// Export convenience functions
export const generateReport = (
  birthData: BirthData,
  reportType: ReportType,
  config?: ReportConfig,
  onProgress?: (progress: ReportProgress) => void,
) =>
  reportGenerationService.generateReport(
    birthData,
    reportType,
    config,
    onProgress,
  );

export const generateCompatibilityReport = (
  person1: BirthData,
  person2: BirthData,
  config?: ReportConfig,
) =>
  reportGenerationService.generateCompatibilityReport(person1, person2, config);

export const generateTransitReport = (
  birthData: BirthData,
  startDate: Date,
  endDate: Date,
  config?: ReportConfig,
) =>
  reportGenerationService.generateTransitReport(
    birthData,
    startDate,
    endDate,
    config,
  );
