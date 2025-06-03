import React from "react";
import { AstrologyReport, BirthChart } from "../../store/astrologyStore";
import WesternReportRenderer from "./renderers/WesternReportRenderer";
import VedicReportRenderer from "./renderers/VedicReportRenderer";
import ChineseReportRenderer from "./renderers/ChineseReportRenderer";
import HellenisticReportRenderer from "./renderers/HellenisticReportRenderer";

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

  return <div className={`report-renderer ${className}`}>{renderReport()}</div>;
};

export default ReportRenderer;
