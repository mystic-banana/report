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
    <div className="chinese-report bg-gradient-to-br from-red-900 via-yellow-900 to-red-800 text-white min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Dragon Pattern Background */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZHJhZ29uIiB4PSIwIiB5PSIwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjIwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RyYWdvbikiLz48L3N2Zz4=')]" />
        </div>

        {sections.map((section) => (
          <div key={section.id} className="mb-8 relative z-10">
            {section.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChineseReportRenderer;
