import React from "react";
import { AstrologyReport, BirthChart } from "../../../store/astrologyStore";
import ReportHeader from "../sections/ReportHeader";
import BirthInfoSection from "../sections/BirthInfoSection";
import HellenisticChart from "../sections/HellenisticChart";
import PlanetaryRulers from "../sections/PlanetaryRulers";
import LotAnalysis from "../sections/LotAnalysis";
import TimeAnalysis from "../sections/TimeAnalysis";
import ReportContent from "../sections/ReportContent";
import ReportFooter from "../sections/ReportFooter";

interface HellenisticReportRendererProps {
  report: AstrologyReport;
  chartData: BirthChart;
}

const HellenisticReportRenderer: React.FC<HellenisticReportRendererProps> = ({
  report,
  chartData,
}) => {
  const sections = [
    {
      id: "header",
      component: (
        <ReportHeader
          report={report}
          chartData={chartData}
          system="hellenistic"
        />
      ),
    },
    {
      id: "birth-info",
      component: (
        <BirthInfoSection chartData={chartData} system="hellenistic" />
      ),
    },
    {
      id: "hellenistic-chart",
      component: <HellenisticChart chartData={chartData} />,
    },
    {
      id: "planetary-rulers",
      component: <PlanetaryRulers chartData={chartData} />,
    },
    ...(report.is_premium
      ? [
          {
            id: "lots",
            component: <LotAnalysis chartData={chartData} />,
          },
          {
            id: "time-analysis",
            component: <TimeAnalysis chartData={chartData} />,
          },
        ]
      : []),
    {
      id: "content",
      component: <ReportContent report={report} system="hellenistic" />,
    },
    {
      id: "footer",
      component: <ReportFooter report={report} system="hellenistic" />,
    },
  ];

  return (
    <div className="hellenistic-report bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Classical Pattern Background */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY2xhc3NpY2FsIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NsYXNzaWNhbCkiLz48L3N2Zz4=')]" />
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

export default HellenisticReportRenderer;
