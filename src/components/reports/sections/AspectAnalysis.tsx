import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Zap, Circle } from "lucide-react";

interface AspectAnalysisProps {
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const AspectAnalysis: React.FC<AspectAnalysisProps> = ({
  chartData,
  system,
}) => {
  const aspects = chartData.chart_data?.aspects || [];

  const getAspectColor = (aspect: string) => {
    switch (aspect.toLowerCase()) {
      case "conjunction":
        return "text-yellow-400 bg-yellow-400/20";
      case "trine":
        return "text-green-400 bg-green-400/20";
      case "sextile":
        return "text-blue-400 bg-blue-400/20";
      case "square":
        return "text-red-400 bg-red-400/20";
      case "opposition":
        return "text-purple-400 bg-purple-400/20";
      case "quincunx":
        return "text-orange-400 bg-orange-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getAspectSymbol = (aspect: string) => {
    const symbols = {
      conjunction: "☌",
      opposition: "☍",
      trine: "△",
      square: "□",
      sextile: "⚹",
      quincunx: "⚻",
    };
    return symbols[aspect.toLowerCase()] || "◯";
  };

  const getAspectNature = (aspect: string) => {
    const harmonious = ["trine", "sextile", "conjunction"];
    const challenging = ["square", "opposition"];
    const neutral = ["quincunx"];

    if (harmonious.includes(aspect.toLowerCase())) return "Harmonious";
    if (challenging.includes(aspect.toLowerCase())) return "Challenging";
    if (neutral.includes(aspect.toLowerCase())) return "Neutral";
    return "Mixed";
  };

  const majorAspects = aspects
    .filter((aspect) =>
      ["conjunction", "opposition", "trine", "square", "sextile"].includes(
        aspect.aspect?.toLowerCase(),
      ),
    )
    .slice(0, 12);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Zap className="w-6 h-6 mr-3 text-purple-400" />
        Planetary Aspects
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Major Aspects
          </h3>
          <div className="space-y-3">
            {majorAspects.map((aspect, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getAspectSymbol(aspect.aspect)}
                    </span>
                    <div>
                      <span className="text-white font-medium">
                        {aspect.planet1} {aspect.aspect} {aspect.planet2}
                      </span>
                      <div className="text-sm text-gray-400">
                        Orb: {aspect.orb?.toFixed(1)}°
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getAspectColor(aspect.aspect)}`}
                  >
                    {getAspectNature(aspect.aspect)}
                  </span>
                </div>
                {aspect.description && (
                  <p className="text-gray-300 text-sm">{aspect.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Aspect Summary
          </h3>
          <div className="space-y-4">
            {["Harmonious", "Challenging", "Neutral"].map((nature) => {
              const count = majorAspects.filter(
                (aspect) => getAspectNature(aspect.aspect) === nature,
              ).length;

              const percentage =
                majorAspects.length > 0
                  ? (count / majorAspects.length) * 100
                  : 0;

              return (
                <div key={nature} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {nature} Aspects
                    </span>
                    <span className="text-gray-300">{count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        nature === "Harmonious"
                          ? "bg-green-500"
                          : nature === "Challenging"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {percentage.toFixed(0)}% of major aspects
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
            <h4 className="text-purple-300 font-medium mb-2">
              Aspect Interpretation
            </h4>
            <p className="text-purple-200 text-sm">
              Aspects reveal the dynamic relationships between planets in your
              chart. Harmonious aspects indicate natural talents and ease, while
              challenging aspects point to areas of growth and potential
              transformation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AspectAnalysis;
