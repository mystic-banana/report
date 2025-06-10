import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import {
  Star,
  FileText,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  Crown,
  Calendar,
  Eye,
  Download,
} from "lucide-react";
import Button from "../ui/Button";

const DashboardStats: React.FC = () => {
  const { user } = useAuthStore();
  const {
    birthCharts,
    reports,
    compatibilityReports,
    fetchBirthCharts,
    fetchReports,
    fetchCompatibilityReports,
  } = useAstrologyStore();
  const [totalReadingTime, setTotalReadingTime] = useState("0m");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          await Promise.all([
            fetchBirthCharts(user.id),
            fetchReports(user.id),
            fetchCompatibilityReports(user.id),
          ]);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user, fetchBirthCharts, fetchReports, fetchCompatibilityReports]);

  useEffect(() => {
    // Calculate estimated reading time based on reports
    const calculateReadingTime = () => {
      const totalMinutes = reports.length * 8.5; // Average reading time per report
      if (totalMinutes < 60) {
        setTotalReadingTime(`${Math.round(totalMinutes)}m`);
      } else {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        setTotalReadingTime(`${hours}h ${minutes > 0 ? minutes + "m" : ""}`);
      }
    };

    calculateReadingTime();
  }, [reports.length]);

  const stats = [
    {
      label: "Birth Charts",
      value: birthCharts.length,
      icon: Star,
      color: "from-purple-600 to-indigo-600",
      link: "/astrology/birth-chart",
      description: "Personal cosmic blueprints",
      change: "+2 this month",
      changeType: "positive" as const,
    },
    {
      label: "Reports Generated",
      value: reports.length,
      icon: FileText,
      color: "from-teal-600 to-cyan-600",
      link: "/astrology/reports",
      description: "Professional astrology reports",
      change: "+5 this week",
      changeType: "positive" as const,
    },
    {
      label: "Compatibility Reports",
      value: compatibilityReports.length,
      icon: Users,
      color: "from-pink-600 to-rose-600",
      link: "/astrology/compatibility",
      description: "Relationship analysis",
      change: "+1 this week",
      changeType: "positive" as const,
    },
    {
      label: "Reading Time",
      value: totalReadingTime,
      icon: Clock,
      color: "from-amber-600 to-orange-600",
      link: "/astrology/reports",
      description: "Total content consumed",
      change: "12h this month",
      changeType: "neutral" as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
              <div className="w-4 h-4 bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-8 bg-slate-700 rounded"></div>
              <div className="w-24 h-4 bg-slate-700 rounded"></div>
              <div className="w-32 h-3 bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link} className="block group">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm font-medium text-slate-300">
                    {stat.label}
                  </p>
                  <p className="text-xs text-slate-400">{stat.description}</p>
                  {stat.change && (
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp
                        className={`w-3 h-3 ${
                          stat.changeType === "positive"
                            ? "text-green-400"
                            : stat.changeType === "negative"
                              ? "text-red-400"
                              : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          stat.changeType === "positive"
                            ? "text-green-400"
                            : stat.changeType === "negative"
                              ? "text-red-400"
                              : "text-slate-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Link to="/dashboard?tab=activity">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {reports.slice(0, 3).map((report, index) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white line-clamp-1">
                    {report.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(report.created_at).toLocaleDateString()}
                    {report.is_premium && (
                      <span className="ml-2 inline-flex items-center">
                        <Crown className="w-3 h-3 text-amber-400" />
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link to={`/astrology/reports?view=${report.id}`}>
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No reports generated yet</p>
              <Link to="/astrology/birth-chart">
                <Button
                  size="sm"
                  className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Create Your First Chart
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
