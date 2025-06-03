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
    <div className="vedic-report bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 text-white min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Sacred Geometry Background */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhciIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cG9seWdvbiBwb2ludHM9IjIwLDMgMjYsMTQgMzcsMTQgMjgsMjMgMzEsMzQgMjAsMjcgOSwzNCAxMiwyMyAzLDE0IDE0LDE0IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcikiLz48L3N2Zz4=')]" />
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

export default VedicReportRenderer;
