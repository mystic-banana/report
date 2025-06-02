import React, { useState, useEffect } from "react";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import TransitTimeline from "../../components/astrology/TransitTimeline";
import {
  TrendingUp,
  Calendar,
  Star,
  Download,
  Clock,
  Target,
  Zap,
} from "lucide-react";

const TransitsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    birthCharts,
    transitForecasts,
    loading,
    error,
    fetchBirthCharts,
    fetchTransitForecasts,
    generateTransitForecast,
    generateTransitReport,
    clearError,
  } = useAstrologyStore();

  const [selectedChart, setSelectedChart] = useState<string>("");
  const [forecastDate, setForecastDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [forecastPeriod, setForecastPeriod] = useState("weekly");
  const [activeTab, setActiveTab] = useState<
    "timeline" | "reports" | "analysis"
  >("timeline");
  const [transitData, setTransitData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchBirthCharts(user.id);
    }
  }, [user, fetchBirthCharts]);

  useEffect(() => {
    if (selectedChart) {
      fetchTransitForecasts(selectedChart);
    }
  }, [selectedChart, fetchTransitForecasts]);

  useEffect(() => {
    if (birthCharts.length > 0 && !selectedChart) {
      setSelectedChart(birthCharts[0].id);
    }
  }, [birthCharts, selectedChart]);

  const handleGenerateReport = async (isPremium: boolean = false) => {
    if (selectedChart) {
      const report = await generateTransitReport(
        selectedChart,
        forecastDate,
        forecastPeriod,
        isPremium,
      );
      if (report) {
        setActiveTab("reports");
      }
    }
  };

  const handleDateChange = (newDate: string) => {
    setForecastDate(newDate);
  };

  const selectedChartData = birthCharts.find(
    (chart) => chart.id === selectedChart,
  );

  if (!user) {
    return (
      <PageLayout title="Planetary Transits">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-white mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-300">
              Sign in to access your personalized transit forecasts and reports.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Planetary Transits">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-12 h-12 text-teal-400 mr-4" />
            <h1 className="text-4xl font-serif font-bold text-white">
              Planetary Transits
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how current planetary movements influence your personal
            birth chart and life path. Generate detailed transit reports with
            timing, interpretations, and guidance.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {birthCharts.length === 0 ? (
          <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 text-center">
            <Star className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">
              Create Your Birth Chart First
            </h2>
            <p className="text-gray-300 mb-6">
              To generate transit reports, you need to create a birth chart
              first. This provides the foundation for understanding how current
              planetary movements affect your unique astrological profile.
            </p>
            <Button
              onClick={() => (window.location.href = "/astrology/birth-chart")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              Create Birth Chart
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                  activeTab === "timeline"
                    ? "bg-teal-600 text-white"
                    : "bg-dark-600 text-gray-300 hover:bg-dark-500"
                }`}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Transit Timeline
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                  activeTab === "analysis"
                    ? "bg-teal-600 text-white"
                    : "bg-dark-600 text-gray-300 hover:bg-dark-500"
                }`}
              >
                <Target className="w-5 h-5 mr-2" />
                Analysis
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                  activeTab === "reports"
                    ? "bg-teal-600 text-white"
                    : "bg-dark-600 text-gray-300 hover:bg-dark-500"
                }`}
              >
                <Download className="w-5 h-5 mr-2" />
                Reports (
                {
                  reports.filter((r) => r.report_type.includes("transit"))
                    .length
                }
                )
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Controls Panel */}
              <div className="lg:col-span-1">
                <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 sticky top-8">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Transit Controls
                  </h2>

                  {/* Chart Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Birth Chart
                    </label>
                    <select
                      value={selectedChart}
                      onChange={(e) => setSelectedChart(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {birthCharts.map((chart) => (
                        <option key={chart.id} value={chart.id}>
                          {chart.name} (
                          {new Date(chart.birth_date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Transit Date
                    </label>
                    <input
                      type="date"
                      value={forecastDate}
                      onChange={(e) => setForecastDate(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Period Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Report Period
                    </label>
                    <select
                      value={forecastPeriod}
                      onChange={(e) => setForecastPeriod(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {/* Generate Button - Dynamic based on user status */}
                  <div>
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleGenerateReport(false)}
                        loading={loading}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 w-full"
                        disabled={!selectedChart}
                      >
                        Generate Basic Report
                      </Button>
                      <Button
                        onClick={() => handleGenerateReport(true)}
                        loading={loading}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 w-full"
                        disabled={!selectedChart}
                      >
                        Generate Premium Report
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Premium reports include detailed timing, aspects, and
                      predictions.
                    </p>
                  </div>

                  {/* Report Type Info */}
                  <div className="mt-6 space-y-4">
                    <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 rounded-lg p-4 border border-teal-500/20">
                      <h3 className="text-sm font-semibold text-white mb-2">
                        Basic Report Includes:
                      </h3>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Major transit analysis</li>
                        <li>• 30-day timeline</li>
                        <li>• Life area impacts</li>
                        <li>• Key dates & timing</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-500/20">
                      <h3 className="text-sm font-semibold text-white mb-2">
                        Premium Report Adds:
                      </h3>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Exact timing (hours/minutes)</li>
                        <li>• All aspect interpretations</li>
                        <li>• 90-day predictions</li>
                        <li>• Personalized remedies</li>
                        <li>• Retrograde analysis</li>
                        <li>• Interactive visualizations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Timeline View */}
                {activeTab === "timeline" && (
                  <div className="space-y-8">
                    {selectedChartData && (
                      <TransitTimeline
                        birthChart={selectedChartData.chart_data}
                        selectedDate={forecastDate}
                        onDateChange={handleDateChange}
                      />
                    )}

                    {/* Current Transits Summary */}
                    <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 border border-indigo-500/20">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Zap className="w-6 h-6 text-indigo-400 mr-3" />
                        Today's Key Transits
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-dark-800/50 rounded-xl p-4">
                          <h4 className="text-white font-medium mb-2">
                            Sun Trine Jupiter
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            Expansion and optimism in personal growth. Excellent
                            day for taking on new challenges.
                          </p>
                          <div className="flex items-center text-xs text-green-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Peak: 2:30 PM
                          </div>
                        </div>
                        <div className="bg-dark-800/50 rounded-xl p-4">
                          <h4 className="text-white font-medium mb-2">
                            Venus Square Mars
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            Tension in relationships may surface. Practice
                            patience and clear communication.
                          </p>
                          <div className="flex items-center text-xs text-orange-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Active all day
                          </div>
                        </div>
                        <div className="bg-dark-800/50 rounded-xl p-4">
                          <h4 className="text-white font-medium mb-2">
                            Mercury Sextile Neptune
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            Enhanced intuition and creative communication. Trust
                            your instincts.
                          </p>
                          <div className="flex items-center text-xs text-blue-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Evening hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis View */}
                {activeTab === "analysis" && (
                  <div className="space-y-8">
                    {/* Selected Chart Info */}
                    {selectedChartData && (
                      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 border border-indigo-500/20">
                        <h2 className="text-xl font-semibold text-white mb-4">
                          Chart Analysis: {selectedChartData.name}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Birth Date</p>
                            <p className="text-white font-medium">
                              {new Date(
                                selectedChartData.birth_date,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Birth Time</p>
                            <p className="text-white font-medium">
                              {selectedChartData.birth_time || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Location</p>
                            <p className="text-white font-medium">
                              {selectedChartData.birth_location?.city ||
                                "Unknown"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Chart Type</p>
                            <p className="text-white font-medium capitalize">
                              {selectedChartData.chart_type}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transit Analysis */}
                    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                      <div className="flex items-center mb-4">
                        <Target className="w-6 h-6 text-teal-400 mr-3" />
                        <h2 className="text-xl font-semibold text-white">
                          Transit Analysis
                        </h2>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 mb-6">
                          Planetary transits occur when planets in the sky form
                          aspects to the planets in your birth chart. These
                          cosmic events influence different areas of your life,
                          bringing opportunities, challenges, and periods of
                          growth.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                              Major Transit Types
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-indigo-600 mr-3"></div>
                                <div>
                                  <strong className="text-white">
                                    Conjunctions:
                                  </strong>
                                  <span className="text-gray-300 ml-2">
                                    New beginnings, intensified energy
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-red-600 mr-3"></div>
                                <div>
                                  <strong className="text-white">
                                    Squares:
                                  </strong>
                                  <span className="text-gray-300 ml-2">
                                    Challenges that promote growth
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-600 mr-3"></div>
                                <div>
                                  <strong className="text-white">
                                    Trines:
                                  </strong>
                                  <span className="text-gray-300 ml-2">
                                    Harmony and natural flow
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-pink-600 mr-3"></div>
                                <div>
                                  <strong className="text-white">
                                    Oppositions:
                                  </strong>
                                  <span className="text-gray-300 ml-2">
                                    Balance and awareness needed
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-cyan-600 mr-3"></div>
                                <div>
                                  <strong className="text-white">
                                    Sextiles:
                                  </strong>
                                  <span className="text-gray-300 ml-2">
                                    Opportunities for development
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                              Transit Duration
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-300">
                                  Sun, Moon, Mercury:
                                </span>
                                <span className="text-white">
                                  Hours to days
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">
                                  Venus, Mars:
                                </span>
                                <span className="text-white">
                                  Days to weeks
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Jupiter:</span>
                                <span className="text-white">
                                  Weeks to months
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Saturn:</span>
                                <span className="text-white">
                                  Months to years
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">
                                  Uranus, Neptune, Pluto:
                                </span>
                                <span className="text-white">
                                  Years to decades
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reports View */}
                {activeTab === "reports" && (
                  <div className="space-y-8">
                    {/* Transit Reports */}
                    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">
                          Your Transit Reports
                        </h2>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport(false)}
                            loading={loading}
                            size="sm"
                            disabled={!selectedChart}
                          >
                            Generate Basic
                          </Button>
                          <Button
                            onClick={() => handleGenerateReport(true)}
                            loading={loading}
                            size="sm"
                            className="bg-gradient-to-r from-amber-600 to-orange-600"
                            disabled={!selectedChart}
                          >
                            Generate Premium
                          </Button>
                        </div>
                      </div>

                      {reports.filter((r) => r.report_type.includes("transit"))
                        .length > 0 ? (
                        <div className="space-y-4">
                          {reports
                            .filter((r) => r.report_type.includes("transit"))
                            .slice(0, 5)
                            .map((report) => (
                              <div
                                key={report.id}
                                className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 rounded-xl p-4 border border-teal-500/20"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-white font-medium">
                                    {report.title}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    {report.is_premium && (
                                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                                        Premium
                                      </span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        window.open(
                                          `/astrology/reports/${report.id}`,
                                          "_blank",
                                        )
                                      }
                                    >
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      icon={Download}
                                      onClick={() => {
                                        // TODO: Implement PDF export
                                        console.log("Export PDF:", report.id);
                                      }}
                                    >
                                      PDF
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">
                                  {report.content.substring(0, 150)}...
                                </p>
                                <div className="text-xs text-gray-500">
                                  Created:{" "}
                                  {new Date(
                                    report.created_at,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-400 mb-2">
                            No Transit Reports Yet
                          </h4>
                          <p className="text-gray-500 mb-4">
                            Generate your first transit report to explore how
                            current planetary movements affect your chart
                          </p>
                          {selectedChart && (
                            <Button
                              className="bg-gradient-to-r from-teal-600 to-cyan-600"
                              disabled={loading}
                              loading={loading}
                              onClick={() => handleGenerateReport(false)}
                            >
                              Generate Your First Report
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recent Forecasts */}
                    {transitForecasts.length > 0 && (
                      <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                        <h2 className="text-xl font-semibold text-white mb-4">
                          Recent Transit Forecasts
                        </h2>
                        <div className="space-y-4">
                          {transitForecasts.slice(0, 3).map((forecast) => (
                            <div
                              key={forecast.id}
                              className="bg-dark-700 rounded-lg p-4 border border-dark-600"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-medium">
                                  {forecast.forecast_period} Forecast
                                </h3>
                                <span className="text-gray-400 text-sm">
                                  {new Date(
                                    forecast.forecast_date,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {forecast.forecast_content.substring(0, 200)}...
                              </p>
                              <div className="mt-2">
                                <span className="inline-block bg-teal-900/30 text-teal-300 text-xs px-2 py-1 rounded">
                                  {forecast.significance_level}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TransitsPage;
