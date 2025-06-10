import React from "react";
import { AstrologyReport, BirthChart } from "../../../store/astrologyStore";
import ReportHeader from "../sections/ReportHeader";
import BirthInfoSection from "../sections/BirthInfoSection";
import VedicChartGrid from "../sections/VedicChartGrid";
import NakshatraAnalysis from "../sections/NakshatraAnalysis";
import DashaAnalysis from "../sections/DashaAnalysis";
import YogaAnalysis from "../sections/YogaAnalysis";
import RemedialMeasures from "../sections/RemedialMeasures";
import ReportContent from "../sections/ReportContent";
import ReportFooter from "../sections/ReportFooter";

interface VedicReportRendererProps {
  report: AstrologyReport;
  chartData: BirthChart;
}

const VedicReportRenderer: React.FC<VedicReportRendererProps> = ({
  report,
  chartData,
}) => {
  const sections = [
    {
      id: "header",
      component: (
        <ReportHeader report={report} chartData={chartData} system="vedic" />
      ),
    },
    {
      id: "birth-info",
      component: <BirthInfoSection chartData={chartData} system="vedic" />,
    },
    {
      id: "vedic-chart",
      component: <VedicChartGrid chartData={chartData} />,
    },
    {
      id: "nakshatra",
      component: <NakshatraAnalysis chartData={chartData} />,
    },
    ...(report.is_premium
      ? [
          {
            id: "dasha",
            component: <DashaAnalysis chartData={chartData} />,
          },
          {
            id: "yoga",
            component: <YogaAnalysis chartData={chartData} />,
          },
        ]
      : []),
    {
      id: "remedies",
      component: <RemedialMeasures chartData={chartData} />,
    },
    {
      id: "content",
      component: <ReportContent report={report} system="vedic" />,
    },
    {
      id: "footer",
      component: <ReportFooter report={report} system="vedic" />,
    },
  ];

  return (
    <div className="vedic-report bg-dark-800 text-white min-h-screen" style={{ background: "linear-gradient(135deg, #121212 0%, #202020 100%)" }}>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Sacred Geometry Background with consistent opacity */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-pattern-sacred" />
        </div>

        {sections.map((section) => (
          <div key={section.id} className="mb-10 relative z-10">
            {section.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VedicReportRenderer;
