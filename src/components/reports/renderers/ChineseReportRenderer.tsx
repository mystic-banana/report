import React from "react";
import { AstrologyReport, BirthChart } from "../../../store/astrologyStore";
import ReportHeader from "../sections/ReportHeader";
import BirthInfoSection from "../sections/BirthInfoSection";
import FourPillarsChart from "../sections/FourPillarsChart";
import ElementalCycle from "../sections/ElementalCycle";
import AnimalSignAnalysis from "../sections/AnimalSignAnalysis";
import FengShuiGuidance from "../sections/FengShuiGuidance";
import ReportContent from "../sections/ReportContent";
import ReportFooter from "../sections/ReportFooter";

interface ChineseReportRendererProps {
  report: AstrologyReport;
  chartData: BirthChart;
}

const ChineseReportRenderer: React.FC<ChineseReportRendererProps> = ({
  report,
  chartData,
}) => {
  const sections = [
    {
      id: "header",
      component: (
        <ReportHeader report={report} chartData={chartData} system="chinese" />
      ),
    },
    {
      id: "birth-info",
      component: <BirthInfoSection chartData={chartData} system="chinese" />,
    },
    {
      id: "four-pillars",
      component: <FourPillarsChart chartData={chartData} />,
    },
    {
      id: "elemental-cycle",
      component: <ElementalCycle chartData={chartData} />,
    },
    {
      id: "animal-signs",
      component: <AnimalSignAnalysis chartData={chartData} />,
    },
    ...(report.is_premium
      ? [
          {
            id: "feng-shui",
            component: <FengShuiGuidance chartData={chartData} />,
          },
        ]
      : []),
    {
      id: "content",
      component: <ReportContent report={report} system="chinese" />,
    },
    {
      id: "footer",
      component: <ReportFooter report={report} system="chinese" />,
    },
  ];

  return (
    <div className="chinese-report bg-dark-800 text-white min-h-screen" style={{ background: "linear-gradient(135deg, #121212 0%, #202020 100%)" }}>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Chinese Pattern Background with consistent opacity */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-pattern-chinese" />
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

export default ChineseReportRenderer;
