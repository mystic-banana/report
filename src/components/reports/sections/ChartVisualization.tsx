import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Star, Circle } from "lucide-react";

interface ChartVisualizationProps {
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const ChartVisualization: React.FC<ChartVisualizationProps> = ({
  chartData,
  system,
}) => {
  const getChartTitle = () => {
    switch (system) {
      case "vedic":
        return "Janma Kundali";
      case "chinese":
        return "Four Pillars Chart";
      case "hellenistic":
        return "Natal Horoscope";
      default:
        return "Birth Chart";
    }
  };

  const renderWesternChart = () => {
    return (
      <div className="relative w-96 h-96 mx-auto">
        {/* Outer Circle */}
        <div className="absolute inset-0 border-4 border-blue-400 rounded-full">
          {/* Inner Circle */}
          <div className="absolute inset-8 border-2 border-blue-300 rounded-full">
            {/* Center */}
            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* House Lines */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30 - 90;
          const radian = (angle * Math.PI) / 180;
          const x1 = 192 + 160 * Math.cos(radian);
          const y1 = 192 + 160 * Math.sin(radian);
          const x2 = 192 + 180 * Math.cos(radian);
          const y2 = 192 + 180 * Math.sin(radian);

          return (
            <div
              key={i}
              className="absolute w-0.5 bg-blue-300 origin-bottom"
              style={{
                left: `${x1}px`,
                top: `${y1}px`,
                width: "2px",
                height: "20px",
                transform: `rotate(${angle + 90}deg)`,
                transformOrigin: "center bottom",
              }}
            />
          );
        })}

        {/* Zodiac Signs */}
        {[
          "♈",
          "♉",
          "♊",
          "♋",
          "♌",
          "♍",
          "♎",
          "♏",
          "♐",
          "♑",
          "♒",
          "♓",
        ].map((sign, i) => {
          const angle = i * 30 - 75;
          const radian = (angle * Math.PI) / 180;
          const x = 192 + 140 * Math.cos(radian);
          const y = 192 + 140 * Math.sin(radian);

          return (
            <div
              key={i}
              className="absolute text-2xl text-blue-300 font-bold transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              {sign}
            </div>
          );
        })}

        {/* Planets */}
        {chartData.chart_data?.planets?.slice(0, 10).map((planet, i) => {
          const angle = (planet.longitude || i * 36) - 90;
          const radian = (angle * Math.PI) / 180;
          const x = 192 + 100 * Math.cos(radian);
          const y = 192 + 100 * Math.sin(radian);

          const planetSymbols = {
            Sun: "☉",
            Moon: "☽",
            Mercury: "☿",
            Venus: "♀",
            Mars: "♂",
            Jupiter: "♃",
            Saturn: "♄",
            Uranus: "♅",
            Neptune: "♆",
            Pluto: "♇",
          };

          return (
            <div
              key={i}
              className="absolute text-xl text-yellow-400 font-bold transform -translate-x-1/2 -translate-y-1/2 bg-blue-900/80 rounded-full w-8 h-8 flex items-center justify-center"
              style={{ left: `${x}px`, top: `${y}px` }}
              title={planet.name}
            >
              {planetSymbols[planet.name] || "●"}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
        <Circle className="w-6 h-6 mr-3 text-blue-400" />
        {getChartTitle()}
      </h2>

      <div className="flex justify-center">{renderWesternChart()}</div>

      <div className="mt-8 text-center">
        <p className="text-gray-300 text-sm italic">
          Interactive chart visualization showing planetary positions at birth
        </p>
      </div>
    </div>
  );
};

export default ChartVisualization;
