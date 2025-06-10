import React from "react";
import { AstrologyReport } from "../../store/astrologyStore";
// Define BirthChart interface here since it's not exported from astrologyStore
interface BirthChart {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  chart_data?: any;
  id?: string;
}
import WesternReportRenderer from "./renderers/WesternReportRenderer";
import VedicReportRenderer from "./renderers/VedicReportRenderer";
import ChineseReportRenderer from "./renderers/ChineseReportRenderer";
import HellenisticReportRenderer from "./renderers/HellenisticReportRenderer";
import { reportTheme } from "./themes/reportTheme";
import "./themes/printStyles.css"; // Import print-friendly styles for PDF generation

interface ReportRendererProps {
  report: AstrologyReport;
  chartData: BirthChart;
  className?: string;
}

const ReportRenderer: React.FC<ReportRendererProps> = ({
  report,
  chartData,
  className = "",
}) => {
  const getReportSystem = () => {
    if (report.report_type.includes("vedic")) return "vedic";
    if (report.report_type.includes("chinese")) return "chinese";
    if (report.report_type.includes("hellenistic")) return "hellenistic";
    return "western";
  };

  const renderReport = () => {
    const system = getReportSystem();

    switch (system) {
      case "vedic":
        return <VedicReportRenderer report={report} chartData={chartData} />;
      case "chinese":
        return <ChineseReportRenderer report={report} chartData={chartData} />;
      case "hellenistic":
        return (
          <HellenisticReportRenderer report={report} chartData={chartData} />
        );
      default:
        return <WesternReportRenderer report={report} chartData={chartData} />;
    }
  };

  return (
    <div 
      className={`report-renderer ${className}`}
      style={{
        // Apply consistent font settings from theme
        fontFamily: reportTheme.typography.fontFamily,
        // Ensure chart images are properly sized with CSS variables
        "--chart-size-large": `${reportTheme.charts.size.large}px`,
        "--chart-size-medium": `${reportTheme.charts.size.medium}px`,
        "--chart-size-small": `${reportTheme.charts.size.small}px`,
      } as React.CSSProperties}
      /* Added data attribute for PDF printing optimization */
      data-pdf-optimized="true"
    >
      {/* Wrapper with print-friendly class to apply proper page breaks */}
      <div className="print-friendly-content">
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportRenderer;
