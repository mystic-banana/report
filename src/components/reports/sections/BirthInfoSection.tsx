import React from "react";
import { BirthChart } from "../../../store/astrologyStore";
import { Clock, Globe, Sunrise, Moon } from "lucide-react";

interface BirthInfoSectionProps {
  chartData: BirthChart;
  system: "western" | "vedic" | "chinese" | "hellenistic";
}

const BirthInfoSection: React.FC<BirthInfoSectionProps> = ({
  chartData,
  system,
}) => {
  const getSystemTitle = () => {
    switch (system) {
      case "vedic":
        return "Janma Vivaran (Birth Details)";
      case "chinese":
        return "出生详情 (Birth Details)";
      case "hellenistic":
        return "Γενέθλια Στοιχεία (Birth Details)";
      default:
        return "Birth Information";
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Time Unknown";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const birthDate = new Date(chartData.birth_date);
  const birthTime = chartData.birth_time;
  const location = chartData.birth_location;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Sunrise className="w-6 h-6 mr-3 text-amber-400" />
        {getSystemTitle()}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30">
          <div className="flex items-center mb-3">
            <Clock className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-medium text-sm">
              Birth Time
            </span>
          </div>
          <p className="text-white text-lg font-semibold">
            {formatTime(birthTime)}
          </p>
          {!birthTime && (
            <p className="text-gray-400 text-xs mt-1">Solar chart used</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-4 border border-green-400/30">
          <div className="flex items-center mb-3">
            <Globe className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-300 font-medium text-sm">
              Coordinates
            </span>
          </div>
          <p className="text-white text-sm font-semibold">
            {location?.latitude.toFixed(2)}°N
          </p>
          <p className="text-white text-sm font-semibold">
            {location?.longitude.toFixed(2)}°E
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
          <div className="flex items-center mb-3">
            <Moon className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-300 font-medium text-sm">
              Timezone
            </span>
          </div>
          <p className="text-white text-lg font-semibold">
            {location?.timezone || "UTC"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
          <div className="flex items-center mb-3">
            <Sunrise className="w-5 h-5 text-orange-400 mr-2" />
            <span className="text-orange-300 font-medium text-sm">
              Day of Week
            </span>
          </div>
          <p className="text-white text-lg font-semibold">
            {birthDate.toLocaleDateString("en-US", { weekday: "long" })}
          </p>
        </div>
      </div>

      {system === "vedic" && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-400/20">
          <p className="text-orange-200 text-sm italic">
            "जन्म कुंडली आत्मा की यात्रा का मानचित्र है" - The birth chart is
            the map of the soul's journey
          </p>
        </div>
      )}

      {system === "chinese" && (
        <div className="mt-6 p-4 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl border border-red-400/20">
          <p className="text-red-200 text-sm italic">
            "天人合一" - Heaven and humanity are one
          </p>
        </div>
      )}
    </div>
  );
};

export default BirthInfoSection;
