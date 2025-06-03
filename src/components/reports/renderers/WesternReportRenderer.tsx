import React from "react";
import { AstrologyReport, BirthChart } from "../../../store/astrologyStore";
import ReportHeader from "../sections/ReportHeader";
import BirthInfoSection from "../sections/BirthInfoSection";
import ChartVisualization from "../sections/ChartVisualization";
import PlanetaryPositions from "../sections/PlanetaryPositions";
import AspectAnalysis from "../sections/AspectAnalysis";
import HouseAnalysis from "../sections/HouseAnalysis";
import ElementalBalance from "../sections/ElementalBalance";
import ReportContent from "../sections/ReportContent";
import ReportFooter from "../sections/ReportFooter";

interface WesternReportRendererProps {
  report: AstrologyReport;
  chartData: BirthChart;
}

const WesternReportRenderer: React.FC<WesternReportRendererProps> = ({
  report,
  chartData,
}) => {
  const sections = [
    {
      id: "header",
      component: (
        <ReportHeader report={report} chartData={chartData} system="western" />
      ),
    },
    {
      id: "birth-info",
      component: <BirthInfoSection chartData={chartData} system="western" />,
    },
    {
      id: "chart",
      component: <ChartVisualization chartData={chartData} system="western" />,
    },
    {
      id: "planetary-positions",
      component: <PlanetaryPositions chartData={chartData} system="western" />,
    },
    {
      id: "aspects",
      component: <AspectAnalysis chartData={chartData} system="western" />,
    },
    {
      id: "houses",
      component: <HouseAnalysis chartData={chartData} system="western" />,
    },
    {
      id: "elemental",
      component: <ElementalBalance chartData={chartData} system="western" />,
    },
    {
      id: "content",
      component: <ReportContent report={report} system="western" />,
    },
    {
      id: "footer",
      component: <ReportFooter report={report} system="western" />,
    },
  ];

  return (
    <div className="western-report bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {sections.map((section) => (
          <div key={section.id} className="mb-8">
            {section.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WesternReportRenderer;
