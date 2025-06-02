import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import {
  Activity,
  FileText,
  Star,
  Users,
  Calendar,
  Eye,
  Download,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import Button from "../ui/Button";

interface ActivityItem {
  id: string;
  type: "report" | "chart" | "compatibility" | "forecast";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  link?: string;
}

const RecentActivitySection: React.FC = () => {
  const { user } = useAuthStore();
  const {
    birthCharts,
    reports,
    compatibilityReports,
    fetchBirthCharts,
    fetchReports,
    fetchCompatibilityReports,
  } = useAstrologyStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchBirthCharts(user.id),
            fetchReports(user.id),
            fetchCompatibilityReports(user.id),
          ]);
        } catch (error) {
          console.error("Error loading activity data:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Combine all activities and sort by timestamp
    const allActivities: ActivityItem[] = [];

    // Add birth charts
    birthCharts.forEach((chart) => {
      allActivities.push({
        id: `chart-${chart.id}`,
        type: "chart",
        title: `Created Birth Chart: ${chart.name}`,
        description: `Birth chart for ${chart.name} created successfully`,
        timestamp: chart.created_at,
        icon: Star,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        link: "/astrology/birth-chart",
      });
    });

    // Add reports
    reports.forEach((report) => {
      allActivities.push({
        id: `report-${report.id}`,
        type: "report",
        title: `Generated ${report.report_type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Report`,
        description: report.title,
        timestamp: report.created_at,
        icon: FileText,
        color: "text-teal-400",
        bgColor: "bg-teal-500/20",
        link: "/astrology/reports",
      });
    });

    // Add compatibility reports
    compatibilityReports.forEach((report) => {
      allActivities.push({
        id: `compatibility-${report.id}`,
        type: "compatibility",
        title: "Generated Compatibility Report",
        description: `Compatibility analysis with ${report.compatibility_score}% match`,
        timestamp: report.created_at,
        icon: Users,
        color: "text-pink-400",
        bgColor: "bg-pink-500/20",
        link: "/astrology/compatibility",
      });
    });

    // Sort by timestamp (most recent first) and take top 8
    const sortedActivities = allActivities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 8);

    setActivities(sortedActivities);
  }, [birthCharts, reports, compatibilityReports]);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
        <div className="flex items-center mb-6">
          <Activity className="w-6 h-6 text-indigo-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-dark-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-dark-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-dark-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-indigo-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Clock className="w-4 h-4 mr-1" />
          <span>Last 30 days</span>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-700/50 transition-colors group"
              >
                <div
                  className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate group-hover:text-indigo-300 transition-colors">
                    {activity.title}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                  {activity.link && (
                    <Link to={activity.link}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">
            No Recent Activity
          </h4>
          <p className="text-gray-500 mb-4">
            Start creating birth charts and reports to see your activity here
          </p>
          <Link to="/astrology/birth-chart">
            <Button
              className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-600 hover:to-purple-600"
              icon={Star}
            >
              Create Birth Chart
            </Button>
          </Link>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 pt-4 border-t border-dark-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {birthCharts.length}
            </div>
            <div className="text-xs text-gray-400">Birth Charts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-400">
              {reports.length}
            </div>
            <div className="text-xs text-gray-400">Reports</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-400">
              {compatibilityReports.length}
            </div>
            <div className="text-xs text-gray-400">Compatibility</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivitySection;
