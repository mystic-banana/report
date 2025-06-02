import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Sun,
  Moon,
  Calendar,
  Eye,
  Download,
  Sparkles,
  Crown,
  Info,
} from "lucide-react";
import {
  VedicChartData,
  VedicHouseData,
  NakshatraInfo,
} from "../../utils/astronomicalCalculations";
import Button from "../ui/Button";

interface VedicChartProps {
  vedicData: VedicChartData;
  userName: string;
  birthDate: string;
  isPremiumUser?: boolean;
  showDetailedAnalysis?: boolean;
  className?: string;
}

const VedicChart: React.FC<VedicChartProps> = ({
  vedicData,
  userName,
  birthDate,
  isPremiumUser = false,
  showDetailedAnalysis = false,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<
    "rasi" | "navamsa" | "dasha" | "nakshatra"
  >("rasi");
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  const renderVedicHouseChart = (houses: VedicHouseData[], title: string) => {
    return (
      <div className="bg-dark-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 text-center">
          {title}
        </h4>
        <div className="relative w-80 h-80 mx-auto">
          {/* Vedic Chart Grid (4x4 traditional layout) */}
          <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-1">
            {/* Row 1 */}
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">12</div>
              <div className="text-xs text-gray-300">{houses[11]?.sign}</div>
              <div className="text-xs text-white">
                {houses[11]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">1</div>
              <div className="text-xs text-gray-300">{houses[0]?.sign}</div>
              <div className="text-xs text-white">
                {houses[0]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">2</div>
              <div className="text-xs text-gray-300">{houses[1]?.sign}</div>
              <div className="text-xs text-white">
                {houses[1]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">3</div>
              <div className="text-xs text-gray-300">{houses[2]?.sign}</div>
              <div className="text-xs text-white">
                {houses[2]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>

            {/* Row 2 */}
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">11</div>
              <div className="text-xs text-gray-300">{houses[10]?.sign}</div>
              <div className="text-xs text-white">
                {houses[10]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded border-2 border-orange-500 p-2 text-center flex items-center justify-center">
              <div className="text-center">
                <div className="text-orange-400 text-sm font-bold">Rasi</div>
                <div className="text-white text-xs">Chart</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded border-2 border-orange-500 p-2 text-center flex items-center justify-center">
              <div className="text-center">
                <div className="text-orange-400 text-sm font-bold">Lagna</div>
                <div className="text-white text-xs">{houses[0]?.sign}</div>
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">4</div>
              <div className="text-xs text-gray-300">{houses[3]?.sign}</div>
              <div className="text-xs text-white">
                {houses[3]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>

            {/* Row 3 */}
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">10</div>
              <div className="text-xs text-gray-300">{houses[9]?.sign}</div>
              <div className="text-xs text-white">
                {houses[9]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded border-2 border-orange-500 p-2 text-center flex items-center justify-center">
              <div className="text-center">
                <div className="text-orange-400 text-sm font-bold">Birth</div>
                <div className="text-white text-xs">
                  {new Date(birthDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded border-2 border-orange-500 p-2 text-center flex items-center justify-center">
              <div className="text-center">
                <div className="text-orange-400 text-sm font-bold">Name</div>
                <div className="text-white text-xs">{userName}</div>
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">5</div>
              <div className="text-xs text-gray-300">{houses[4]?.sign}</div>
              <div className="text-xs text-white">
                {houses[4]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>

            {/* Row 4 */}
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">9</div>
              <div className="text-xs text-gray-300">{houses[8]?.sign}</div>
              <div className="text-xs text-white">
                {houses[8]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">8</div>
              <div className="text-xs text-gray-300">{houses[7]?.sign}</div>
              <div className="text-xs text-white">
                {houses[7]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">7</div>
              <div className="text-xs text-gray-300">{houses[6]?.sign}</div>
              <div className="text-xs text-white">
                {houses[6]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
            <div className="bg-dark-600 rounded border border-orange-500/30 p-2 text-center">
              <div className="text-xs text-orange-400 font-semibold">6</div>
              <div className="text-xs text-gray-300">{houses[5]?.sign}</div>
              <div className="text-xs text-white">
                {houses[5]?.planets.map((p) => p.charAt(0)).join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNakshatraInfo = (nakshatra: NakshatraInfo) => {
    return (
      <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-xl p-6 border border-orange-500/20">
        <div className="text-center mb-6">
          <Star className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {nakshatra.name}
          </h3>
          <p className="text-orange-300">
            Birth Nakshatra • Pada {nakshatra.pada}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-dark-700/50 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2">
                Ruling Planet
              </h4>
              <p className="text-white">{nakshatra.lord}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2">Deity</h4>
              <p className="text-white">{nakshatra.deity}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-dark-700/50 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2">Symbol</h4>
              <p className="text-white">{nakshatra.symbol}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2">Degree</h4>
              <p className="text-white">{nakshatra.degree.toFixed(2)}°</p>
            </div>
          </div>
        </div>

        {nakshatra.characteristics && nakshatra.characteristics.length > 0 && (
          <div className="mt-6">
            <h4 className="text-orange-400 font-semibold mb-3">
              Key Characteristics
            </h4>
            <div className="flex flex-wrap gap-2">
              {nakshatra.characteristics.map((trait, index) => (
                <span
                  key={index}
                  className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDashaInfo = () => {
    const { currentDasha, vimshottariDasha } = vedicData;

    return (
      <div className="space-y-6">
        {/* Current Dasha */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center mb-4">
            <Calendar className="w-6 h-6 text-purple-400 mr-3" />
            <h3 className="text-xl font-bold text-white">
              Current Dasha Period
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-dark-700/50 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">
                  Mahadasha
                </h4>
                <p className="text-white text-lg">{currentDasha.mahadasha}</p>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">
                  Antardasha
                </h4>
                <p className="text-white text-lg">{currentDasha.antardasha}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-dark-700/50 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">
                  Remaining Years
                </h4>
                <p className="text-white text-lg">
                  {currentDasha.remainingYears.toFixed(1)} years
                </p>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">End Date</h4>
                <p className="text-white">
                  {new Date(currentDasha.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {currentDasha.effects && currentDasha.effects.length > 0 && (
            <div className="mt-6">
              <h4 className="text-purple-400 font-semibold mb-3">
                Current Effects
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentDasha.effects.map((effect, index) => (
                  <span
                    key={index}
                    className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                  >
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dasha Timeline */}
        {isPremiumUser && vimshottariDasha && vimshottariDasha.length > 0 && (
          <div className="bg-dark-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Vimshottari Dasha Timeline
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {vimshottariDasha.slice(0, 5).map((period, index) => {
                const startYear = new Date(period.startDate).getFullYear();
                const endYear = new Date(period.endDate).getFullYear();
                const isCurrent =
                  new Date() >= new Date(period.startDate) &&
                  new Date() <= new Date(period.endDate);

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isCurrent
                        ? "bg-purple-900/30 border-purple-500/50"
                        : "bg-dark-600 border-dark-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">
                          {period.planet}
                        </span>
                        {isCurrent && (
                          <span className="ml-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {startYear} - {endYear} ({period.years} years)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-dark-800 rounded-2xl p-6 border border-dark-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Sparkles
            className="w-6 h-6 text-orange-400 mr-3"
            aria-hidden="true"
          />
          <h2
            className="text-xl font-semibold text-white"
            id="vedic-chart-title"
          >
            Vedic Chart Analysis
          </h2>
        </div>
        {isPremiumUser && (
          <div
            className="flex items-center text-yellow-400"
            role="status"
            aria-label="Premium user"
          >
            <Crown className="w-5 h-5 mr-2" aria-hidden="true" />
            <span className="text-sm font-medium">Premium</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div
        className="flex flex-wrap gap-2 mb-6"
        role="tablist"
        aria-labelledby="vedic-chart-title"
      >
        <button
          onClick={() => setActiveTab("rasi")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-dark-800 ${
            activeTab === "rasi"
              ? "bg-orange-600 text-white"
              : "bg-dark-600 text-gray-300 hover:bg-dark-500"
          }`}
          role="tab"
          aria-selected={activeTab === "rasi"}
          aria-controls="rasi-panel"
          id="rasi-tab"
        >
          Rasi Chart
        </button>
        <button
          onClick={() => setActiveTab("navamsa")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-dark-800 ${
            activeTab === "navamsa"
              ? "bg-orange-600 text-white"
              : "bg-dark-600 text-gray-300 hover:bg-dark-500"
          }`}
          role="tab"
          aria-selected={activeTab === "navamsa"}
          aria-controls="navamsa-panel"
          id="navamsa-tab"
        >
          Navamsa (D9)
        </button>
        <button
          onClick={() => setActiveTab("nakshatra")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-dark-800 ${
            activeTab === "nakshatra"
              ? "bg-orange-600 text-white"
              : "bg-dark-600 text-gray-300 hover:bg-dark-500"
          }`}
          role="tab"
          aria-selected={activeTab === "nakshatra"}
          aria-controls="nakshatra-panel"
          id="nakshatra-tab"
        >
          Nakshatra
        </button>
        <button
          onClick={() => setActiveTab("dasha")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-dark-800 ${
            activeTab === "dasha"
              ? "bg-orange-600 text-white"
              : "bg-dark-600 text-gray-300 hover:bg-dark-500"
          }`}
          role="tab"
          aria-selected={activeTab === "dasha"}
          aria-controls="dasha-panel"
          id="dasha-tab"
        >
          Dasha Periods
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        role="tabpanel"
        aria-labelledby={`${activeTab}-tab`}
        id={`${activeTab}-panel`}
      >
        {activeTab === "rasi" &&
          renderVedicHouseChart(vedicData.lagnaChart, "Rasi Chart (D1)")}
        {activeTab === "navamsa" &&
          renderVedicHouseChart(vedicData.navamsaChart, "Navamsa Chart (D9)")}
        {activeTab === "nakshatra" &&
          renderNakshatraInfo(vedicData.birthNakshatra)}
        {activeTab === "dasha" && renderDashaInfo()}
      </motion.div>

      {/* Legend */}
      <div className="mt-6 bg-dark-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Chart Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-gray-300">
            <span className="text-orange-400">Numbers:</span> House positions
          </div>
          <div className="text-gray-300">
            <span className="text-orange-400">Signs:</span> Vedic zodiac signs
          </div>
          <div className="text-gray-300">
            <span className="text-orange-400">Letters:</span> Planet
            abbreviations
          </div>
          <div className="text-gray-300">
            <span className="text-orange-400">Center:</span> Chart information
          </div>
        </div>
      </div>
    </div>
  );
};

export default VedicChart;
