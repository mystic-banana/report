import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Plus, Users, Star } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import CompatibilityChart from "../../components/astrology/CompatibilityChart";
import { useAstrologyStore } from "../../store/astrologyStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const CompatibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    compatibilityReports,
    loading,
    fetchBirthCharts,
    fetchCompatibilityReports,
  } = useAstrologyStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchBirthCharts(user.id),
            fetchCompatibilityReports(user.id),
          ]);
        } catch (error) {
          console.error("Error loading compatibility data:", error);
        }
      };
      loadData();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <PageLayout title="Compatibility Analysis - Mystic Banana">
        <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-2xl p-8 border border-pink-500/20">
                <Heart className="w-16 h-16 text-pink-400 mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold text-white mb-4">
                  Relationship Compatibility Analysis
                </h1>
                <p className="text-gray-300 mb-8">
                  Discover the cosmic connections between you and your loved
                  ones through detailed astrological compatibility reports.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-pink-600 to-rose-600"
                  >
                    Sign Up to Get Started
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Compatibility Analysis - Mystic Banana">
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/astrology")}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                  Compatibility Analysis
                </h1>
                <p className="text-gray-400">
                  Explore relationship dynamics through astrology
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {birthCharts.length}
              </p>
              <p className="text-gray-400 text-sm">Birth Charts</p>
            </div>
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center">
              <Users className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {compatibilityReports.length}
              </p>
              <p className="text-gray-400 text-sm">Compatibility Reports</p>
            </div>
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center">
              <Heart className="w-8 h-8 text-rose-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {
                  compatibilityReports.filter(
                    (r) => r.compatibility_score >= 70,
                  ).length
                }
              </p>
              <p className="text-gray-400 text-sm">High Compatibility</p>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Compatibility Chart Component */}
              <CompatibilityChart showHeader={false} maxItems={10} />

              {/* Compatibility Tips */}
              <div className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-2xl p-6 border border-pink-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Relationship Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Building Harmony
                    </h4>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Focus on complementary strengths</li>
                      <li>• Communicate during challenging transits</li>
                      <li>• Celebrate your unique differences</li>
                      <li>
                        • Plan important decisions during favorable aspects
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Growth Areas
                    </h4>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Work through square aspects together</li>
                      <li>• Balance individual needs with partnership</li>
                      <li>• Use opposition aspects for mutual growth</li>
                      <li>• Practice patience during Mercury retrograde</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Need More Charts? */}
              {birthCharts.length < 2 && (
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20 text-center">
                  <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Create More Birth Charts
                  </h3>
                  <p className="text-gray-300 mb-6">
                    You need at least 2 birth charts to generate compatibility
                    reports. Create charts for yourself and your loved ones.
                  </p>
                  <Button
                    onClick={() => navigate("/astrology/birth-chart")}
                    icon={Plus}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    Create Birth Chart
                  </Button>
                </div>
              )}

              {/* How It Works */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h3 className="text-xl font-semibold text-white mb-6">
                  How Compatibility Analysis Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">
                      Planetary Positions
                    </h4>
                    <p className="text-gray-400 text-sm">
                      We analyze the positions of planets in both birth charts
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">Aspects</h4>
                    <p className="text-gray-400 text-sm">
                      Calculate the angles between planets to find harmonious or
                      challenging connections
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">Synastry</h4>
                    <p className="text-gray-400 text-sm">
                      Compare how each person's planets interact with the
                      other's
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">Score</h4>
                    <p className="text-gray-400 text-sm">
                      Generate a compatibility percentage and detailed analysis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default CompatibilityPage;
