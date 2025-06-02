import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ArrowLeft,
  Download,
  Share2,
  Crown,
  Smartphone,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import BirthDataForm from "../../components/astrology/BirthDataForm";
import InteractiveChart from "../../components/astrology/InteractiveChart";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { BirthData } from "../../utils/astronomicalCalculations";

const BirthChartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { createBirthChart, currentChart, loading } = useAstrologyStore();
  const [step, setStep] = useState<"form" | "chart">("form");
  const [generatedChart, setGeneratedChart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check premium status
  useEffect(() => {
    // TODO: Implement actual premium check from user subscription
    setIsPremiumUser(user?.subscription_plan !== "free");
  }, [user]);

  const handleBirthDataSubmit = async (birthData: BirthData) => {
    const chart = await createBirthChart(birthData);
    if (chart) {
      setGeneratedChart(chart);
      setStep("chart");
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setGeneratedChart(null);
  };

  return (
    <PageLayout title="Birth Chart Generator - Mystic Banana">
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div
            className={`flex ${isMobile ? "flex-col space-y-4" : "items-center justify-between"} mb-8`}
          >
            <div className="flex items-center">
              <button
                onClick={() => navigate("/astrology")}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1
                  className={`${isMobile ? "text-2xl" : "text-3xl md:text-4xl"} font-serif font-bold text-white mb-2`}
                >
                  Birth Chart Generator
                </h1>
                <p className="text-gray-400">
                  Create your personalized astrological natal chart
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isMobile && <Smartphone className="w-6 h-6 text-blue-400" />}
              {isPremiumUser && <Crown className="w-6 h-6 text-yellow-400" />}
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div
              className={`flex items-center ${isMobile ? "space-x-2" : "space-x-4"}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === "form"
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-dark-700 border-purple-600 text-purple-400"
                }`}
              >
                1
              </div>
              <div
                className={`${isMobile ? "w-8" : "w-16"} h-0.5 bg-dark-600`}
              ></div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === "chart"
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-dark-700 border-dark-600 text-gray-400"
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === "form" && (
              <div
                className={`${isMobile ? "max-w-full px-2" : "max-w-2xl"} mx-auto`}
              >
                <BirthDataForm
                  onSubmit={handleBirthDataSubmit}
                  loading={loading}
                />
              </div>
            )}

            {step === "chart" && generatedChart && (
              <div className="space-y-8">
                {/* Chart Header */}
                <div
                  className={`bg-dark-800 rounded-2xl p-${isMobile ? 4 : 6} border border-dark-700`}
                >
                  <div
                    className={`flex ${isMobile ? "flex-col space-y-3" : "items-center justify-between"} mb-4`}
                  >
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-white mb-2">
                        {generatedChart.name}'s Birth Chart
                      </h2>
                      <p className="text-gray-400">
                        Generated on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`flex items-center ${isMobile ? "flex-wrap gap-2" : "space-x-2"}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackToForm}
                      >
                        Edit Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={() => {
                          // Trigger the PNG export from InteractiveChart
                          const event = new CustomEvent("exportChart");
                          window.dispatchEvent(event);
                        }}
                      >
                        Export PNG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Share2}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `${generatedChart.name}'s Birth Chart`,
                              text: "Check out my personalized birth chart from Mystic Banana!",
                              url: window.location.href,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Chart link copied to clipboard!");
                          }
                        }}
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Interactive Chart */}
                {generatedChart.chart_data ? (
                  <div>
                    <InteractiveChart
                      chartData={generatedChart.chart_data}
                      width={isMobile ? 350 : 800}
                      height={isMobile ? 350 : 800}
                      userName={generatedChart.name}
                      birthDate={generatedChart.birth_date}
                      isMobile={isMobile}
                      isPremiumUser={isPremiumUser}
                      showPremiumFeatures={isPremiumUser}
                    />

                    {/* Chart Insights */}
                    <div
                      className={`mt-8 bg-dark-800 rounded-2xl p-${isMobile ? 4 : 6} border border-dark-700`}
                    >
                      <h3
                        className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white mb-4`}
                      >
                        Key Insights
                      </h3>
                      <div
                        className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-6`}
                      >
                        <div>
                          <h4 className="text-lg font-medium text-white mb-3">
                            Planetary Strengths
                          </h4>
                          <div className="space-y-2">
                            {generatedChart.chart_data.planets
                              .slice(0, 3)
                              .map((planet, index) => (
                                <div
                                  key={planet.name}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-gray-300">
                                    {planet.name} in {planet.sign}
                                  </span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < 4
                                            ? "text-yellow-400"
                                            : "text-gray-600"
                                        }`}
                                        fill="currentColor"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium text-white mb-3">
                            Major Aspects
                          </h4>
                          <div className="space-y-2">
                            {generatedChart.chart_data.aspects
                              .slice(0, 3)
                              .map((aspect, index) => (
                                <div key={index} className="text-sm">
                                  <span className="text-gray-300">
                                    {aspect.planet1} {aspect.aspect}{" "}
                                    {aspect.planet2}
                                  </span>
                                  <span
                                    className={`ml-2 px-2 py-1 rounded text-xs ${
                                      aspect.exact
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-600 text-gray-200"
                                    }`}
                                  >
                                    {aspect.exact
                                      ? "Exact"
                                      : `${aspect.orb.toFixed(1)}° orb`}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 text-center">
                    <Star className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Chart Generated Successfully!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Your birth chart has been created. Sign in to view the
                      interactive chart and get detailed interpretations.
                    </p>
                    {!isAuthenticated && (
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={() => navigate("/signup")}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600"
                        >
                          Sign Up for Full Access
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/login")}
                        >
                          Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Chart Interpretation */}
                <div
                  className={`bg-dark-800 rounded-2xl p-${isMobile ? 4 : 6} border border-dark-700`}
                >
                  <h3
                    className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white mb-4`}
                  >
                    Chart Overview
                  </h3>
                  <div
                    className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"} gap-6`}
                  >
                    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="text-lg font-medium text-white mb-2">
                        Sun Sign
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Your core personality and life purpose
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 rounded-xl p-4 border border-pink-500/20">
                      <h4 className="text-lg font-medium text-white mb-2">
                        Moon Sign
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Your emotional nature and inner self
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl p-4 border border-amber-500/20">
                      <h4 className="text-lg font-medium text-white mb-2">
                        Rising Sign
                      </h4>
                      <p className="text-gray-400 text-sm">
                        How others perceive you and your approach to life
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div
                  className={`bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-${isMobile ? 4 : 6} border border-purple-500/20`}
                >
                  <h3
                    className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white mb-4`}
                  >
                    Explore More
                  </h3>
                  <div
                    className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-4`}
                  >
                    <Button
                      onClick={() => navigate("/astrology/compatibility")}
                      variant="outline"
                      className="justify-start"
                    >
                      Check Compatibility
                    </Button>
                    <Button
                      onClick={() => {
                        if (generatedChart?.id) {
                          navigate(
                            `/astrology/reports?chartId=${generatedChart.id}`,
                          );
                        } else {
                          navigate("/astrology/reports");
                        }
                      }}
                      variant="outline"
                      className="justify-start"
                    >
                      Get Detailed Report
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BirthChartPage;
