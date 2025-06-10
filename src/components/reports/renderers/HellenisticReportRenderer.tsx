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
    <div className="hellenistic-report bg-dark-800 text-white min-h-screen" style={{ background: "linear-gradient(135deg, #121212 0%, #202020 100%)" }}>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Classical Pattern Background with consistent opacity */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-pattern-classical" />
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

export default HellenisticReportRenderer;
