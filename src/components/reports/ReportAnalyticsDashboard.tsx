import React, { useState, useEffect, useMemo } from "react";
import { useReportAnalytics } from "../../hooks/useReportAnalytics";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";
import {
  BarChart3,
  Clock,
  Eye,
  TrendingUp,
  BookOpen,
  Download,
  Share2,
  Calendar,
  Filter,
  RefreshCw,
  Award,
  Target,
  Zap,
  Users,
  FileText,
  Activity,
  PieChart,
  LineChart,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface ReportAnalyticsDashboardProps {
  className?: string;
}

interface AnalyticsData {
  totalReports: number;
  totalReadingTime: number;
  averageCompletionRate: number;
  mostViewedReports: Array<{
    id: string;
    title: string;
    views: number;
    avgReadingTime: number;
    completionRate: number;
  }>;
  readingTrends: Array<{
    date: string;
    reports: number;
    readingTime: number;
  }>;
  reportTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  engagementMetrics: {
    bookmarks: number;
    shares: number;
    exports: number;
    annotations: number;
  };
  readingStats: {
    averageReadingSpeed: number;
    totalWordsRead: number;
    streakDays: number;
    favoriteReadingTime: string;
  };
}

const ReportAnalyticsDashboard: React.FC<ReportAnalyticsDashboardProps> = ({
  className = "",
}) => {
  const { user } = useAuthStore();
  const { getReportReadingHistory, getUserReadingStats } = useReportAnalytics();

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState<
    "views" | "time" | "completion"
  >("views");
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, dateRange, reportTypeFilter]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get reading history
      const readingHistory = await getReportReadingHistory(100);

      // Get user reading stats
      const userStats = await getUserReadingStats();

      // Get additional analytics data
      const { data: reportsData, error: reportsError } = await supabase
        .from("astrology_reports")
        .select(
          `
          id,
          title,
          report_type,
          created_at,
          report_analytics!inner(
            session_duration,
            completion_percentage,
            reading_speed,
            bookmarked,
            shared,
            exported,
            interactions_count,
            created_at
          )
        `,
        )
        .eq("report_analytics.user_id", user.id)
        .gte("report_analytics.created_at", dateRange.start.toISOString())
        .lte("report_analytics.created_at", dateRange.end.toISOString())
        .order("report_analytics.created_at", { ascending: false });

      if (reportsError) throw reportsError;

      // Process the data
      const processedData = processAnalyticsData(reportsData || [], userStats);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (
    reportsData: any[],
    userStats: any,
  ): AnalyticsData => {
    // Group reports by title to get unique reports with their analytics
    const reportMap = new Map();
    const dailyData = new Map();
    const typeDistribution = new Map();
    let totalBookmarks = 0;
    let totalShares = 0;
    let totalExports = 0;
    let totalAnnotations = 0;

    reportsData.forEach((report) => {
      const analytics = report.report_analytics[0]; // Get the first analytics record
      if (!analytics) return;

      // Process unique reports
      if (!reportMap.has(report.id)) {
        reportMap.set(report.id, {
          id: report.id,
          title: report.title,
          type: report.report_type,
          views: 0,
          totalReadingTime: 0,
          completionRates: [],
        });
      }

      const reportData = reportMap.get(report.id);
      reportData.views += 1;
      reportData.totalReadingTime += analytics.session_duration || 0;
      reportData.completionRates.push(analytics.completion_percentage || 0);

      // Process daily trends
      const date = format(new Date(analytics.created_at), "yyyy-MM-dd");
      if (!dailyData.has(date)) {
        dailyData.set(date, { reports: 0, readingTime: 0 });
      }
      const dayData = dailyData.get(date);
      dayData.reports += 1;
      dayData.readingTime += analytics.session_duration || 0;

      // Process report type distribution
      const type = report.report_type;
      typeDistribution.set(type, (typeDistribution.get(type) || 0) + 1);

      // Count engagement metrics
      if (analytics.bookmarked) totalBookmarks++;
      if (analytics.shared) totalShares++;
      if (analytics.exported) totalExports++;
      totalAnnotations += analytics.interactions_count || 0;
    });

    // Convert maps to arrays and calculate averages
    const mostViewedReports = Array.from(reportMap.values())
      .map((report) => ({
        ...report,
        avgReadingTime: report.totalReadingTime / report.views,
        completionRate:
          report.completionRates.reduce((a, b) => a + b, 0) /
          report.completionRates.length,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const readingTrends = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        reports: data.reports,
        readingTime: Math.round(data.readingTime / 60), // Convert to minutes
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalReportsCount =
      typeDistribution.size > 0
        ? Array.from(typeDistribution.values()).reduce((a, b) => a + b, 0)
        : 1;

    const reportTypeDistributionArray = Array.from(typeDistribution.entries())
      .map(([type, count]) => ({
        type: type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
        percentage: Math.round((count / totalReportsCount) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalReports: reportMap.size,
      totalReadingTime: Math.round(
        Array.from(reportMap.values()).reduce(
          (sum, report) => sum + report.totalReadingTime,
          0,
        ) / 60,
      ),
      averageCompletionRate: Math.round(
        mostViewedReports.reduce(
          (sum, report) => sum + report.completionRate,
          0,
        ) / Math.max(mostViewedReports.length, 1),
      ),
      mostViewedReports,
      readingTrends,
      reportTypeDistribution: reportTypeDistributionArray,
      engagementMetrics: {
        bookmarks: totalBookmarks,
        shares: totalShares,
        exports: totalExports,
        annotations: totalAnnotations,
      },
      readingStats: {
        averageReadingSpeed: userStats?.averageReadingSpeed || 0,
        totalWordsRead: userStats?.totalWordsRead || 0,
        streakDays: calculateReadingStreak(readingTrends),
        favoriteReadingTime: getFavoriteReadingTime(reportsData),
      },
    };
  };

  const calculateReadingStreak = (trends: any[]): number => {
    if (trends.length === 0) return 0;

    let streak = 0;
    const today = format(new Date(), "yyyy-MM-dd");
    const sortedTrends = trends.sort((a, b) => b.date.localeCompare(a.date));

    for (const trend of sortedTrends) {
      if (trend.reports > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getFavoriteReadingTime = (reportsData: any[]): string => {
    const hourCounts = new Array(24).fill(0);

    reportsData.forEach((report) => {
      if (report.report_analytics[0]) {
        const hour = new Date(report.report_analytics[0].created_at).getHours();
        hourCounts[hour]++;
      }
    });

    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    return `${maxHour}:00 - ${maxHour + 1}:00`;
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Reports Read", analyticsData.totalReports],
      ["Total Reading Time (minutes)", analyticsData.totalReadingTime],
      ["Average Completion Rate (%)", analyticsData.averageCompletionRate],
      [
        "Average Reading Speed (WPM)",
        analyticsData.readingStats.averageReadingSpeed,
      ],
      ["Total Words Read", analyticsData.readingStats.totalWordsRead],
      ["Reading Streak (days)", analyticsData.readingStats.streakDays],
      ["Total Bookmarks", analyticsData.engagementMetrics.bookmarks],
      ["Total Shares", analyticsData.engagementMetrics.shares],
      ["Total Exports", analyticsData.engagementMetrics.exports],
      ["Total Annotations", analyticsData.engagementMetrics.annotations],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e5e5e5",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          color: "#374151",
        },
      },
      y: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          color: "#374151",
        },
      },
    },
  };

  const trendChartData = useMemo(() => {
    if (!analyticsData) return { labels: [], datasets: [] };

    return {
      labels: analyticsData.readingTrends.map((trend) =>
        format(new Date(trend.date), "MMM dd"),
      ),
      datasets: [
        {
          label: "Reports Read",
          data: analyticsData.readingTrends.map((trend) => trend.reports),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
        },
        {
          label: "Reading Time (min)",
          data: analyticsData.readingTrends.map((trend) => trend.readingTime),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
        },
      ],
    };
  }, [analyticsData]);

  const reportTypeChartData = useMemo(() => {
    if (!analyticsData) return { labels: [], datasets: [] };

    const colors = [
      "#f59e0b",
      "#8b5cf6",
      "#10b981",
      "#ef4444",
      "#3b82f6",
      "#f97316",
    ];

    return {
      labels: analyticsData.reportTypeDistribution.map((item) => item.type),
      datasets: [
        {
          data: analyticsData.reportTypeDistribution.map((item) => item.count),
          backgroundColor: colors.slice(
            0,
            analyticsData.reportTypeDistribution.length,
          ),
          borderColor: colors.slice(
            0,
            analyticsData.reportTypeDistribution.length,
          ),
          borderWidth: 2,
        },
      ],
    };
  }, [analyticsData]);

  if (loading) {
    return (
      <div className={`bg-dark-800 rounded-2xl p-8 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="text-white ml-4">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`bg-dark-800 rounded-2xl p-8 text-center ${className}`}>
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-400 mb-4">
          Start reading reports to see your analytics dashboard.
        </p>
        <Button onClick={refreshData} variant="primary" icon={RefreshCw}>
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Report Analytics
          </h2>
          <p className="text-gray-400">
            Insights into your reading habits and report engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshData}
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            disabled={refreshing}
            title="Refresh Data"
          />
          <Button
            onClick={exportAnalytics}
            variant="ghost"
            size="sm"
            icon={Download}
            title="Export Analytics"
          />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {analyticsData.totalReports}
            </span>
          </div>
          <h3 className="font-semibold">Reports Read</h3>
          <p className="text-sm opacity-90">Total unique reports</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {analyticsData.totalReadingTime}
            </span>
          </div>
          <h3 className="font-semibold">Reading Time</h3>
          <p className="text-sm opacity-90">Minutes spent reading</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {analyticsData.averageCompletionRate}%
            </span>
          </div>
          <h3 className="font-semibold">Completion Rate</h3>
          <p className="text-sm opacity-90">Average report completion</p>
        </div>

        <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {analyticsData.readingStats.streakDays}
            </span>
          </div>
          <h3 className="font-semibold">Reading Streak</h3>
          <p className="text-sm opacity-90">Consecutive days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Trends Chart */}
        <div className="bg-dark-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Reading Trends</h3>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </div>

        {/* Report Type Distribution */}
        <div className="bg-dark-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Report Types</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Pie data={reportTypeChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Viewed Reports */}
        <div className="lg:col-span-2 bg-dark-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Most Viewed Reports
            </h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData.mostViewedReports
              .slice(0, 5)
              .map((report, index) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-400 font-bold text-sm">
                        #{index + 1}
                      </span>
                      <h4 className="text-white font-medium text-sm truncate">
                        {report.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span>{report.views} views</span>
                      <span>
                        {Math.round(report.avgReadingTime / 60)} min avg
                      </span>
                      <span>
                        {Math.round(report.completionRate)}% completion
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Reading Stats & Engagement */}
        <div className="space-y-6">
          {/* Reading Stats */}
          <div className="bg-dark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Reading Stats
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Reading Speed</span>
                <span className="text-white font-semibold">
                  {analyticsData.readingStats.averageReadingSpeed} WPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Words Read</span>
                <span className="text-white font-semibold">
                  {analyticsData.readingStats.totalWordsRead.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Favorite Time</span>
                <span className="text-white font-semibold">
                  {analyticsData.readingStats.favoriteReadingTime}
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-dark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Engagement</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <div className="text-amber-400 text-xl font-bold">
                  {analyticsData.engagementMetrics.bookmarks}
                </div>
                <div className="text-xs text-gray-400">Bookmarks</div>
              </div>
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <div className="text-blue-400 text-xl font-bold">
                  {analyticsData.engagementMetrics.shares}
                </div>
                <div className="text-xs text-gray-400">Shares</div>
              </div>
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <div className="text-green-400 text-xl font-bold">
                  {analyticsData.engagementMetrics.exports}
                </div>
                <div className="text-xs text-gray-400">Exports</div>
              </div>
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <div className="text-purple-400 text-xl font-bold">
                  {analyticsData.engagementMetrics.annotations}
                </div>
                <div className="text-xs text-gray-400">Notes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalyticsDashboard;
