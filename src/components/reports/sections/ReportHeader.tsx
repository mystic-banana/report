import React from "react";
import { AstrologyReport, BirthChart } from "../../../store/astrologyStore";
import { Crown, Star, Calendar, MapPin } from "lucide-react";

interface ReportHeaderProps {
  report: AstrologyReport;
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  report,
  chartData,
  system,
}) => {
  const getSystemTheme = () => {
    switch (system) {
      case "vedic":
        return {
          gradient: "from-orange-600 to-red-600",
          accent: "text-orange-300",
          icon: "🕉️",
          title: "Vedic Jyotish Report",
        };
      case "chinese":
        return {
          gradient: "from-red-600 to-yellow-600",
          accent: "text-yellow-300",
          icon: "🐉",
          title: "Chinese Astrology Report",
        };
      case "hellenistic":
        return {
          gradient: "from-purple-600 to-indigo-600",
          accent: "text-purple-300",
          icon: "🏛️",
          title: "Hellenistic Astrology Report",
        };
      default:
        return {
          gradient: "from-blue-600 to-indigo-600",
          accent: "text-blue-300",
          icon: "⭐",
          title: "Western Astrology Report",
        };
    }
  };

  const theme = getSystemTheme();
  const birthDate = new Date(chartData.birth_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} p-8 shadow-2xl`}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{theme.icon}</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {report.title}
              </h1>
              <p className={`text-xl ${theme.accent} font-medium`}>
                {theme.title}
              </p>
            </div>
          </div>

          {report.is_premium && (
            <div className="flex items-center bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-full">
              <Crown className="w-5 h-5 text-white mr-2" />
              <span className="text-white font-semibold text-sm">Premium</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Star className="w-6 h-6 text-white" />
            <div>
              <p className="text-white/80 text-sm">Name</p>
              <p className="text-white font-semibold text-lg">
                {chartData.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Calendar className="w-6 h-6 text-white" />
            <div>
              <p className="text-white/80 text-sm">Birth Date</p>
              <p className="text-white font-semibold text-lg">{birthDate}</p>
            </div>
          </div>

          {chartData.birth_location && (
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <MapPin className="w-6 h-6 text-white" />
              <div>
                <p className="text-white/80 text-sm">Location</p>
                <p className="text-white font-semibold text-lg">
                  {chartData.birth_location.city},{" "}
                  {chartData.birth_location.country}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/90 text-lg italic">
            "The stars impel, they do not compel" - Ancient Wisdom
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
