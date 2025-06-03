import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  ArrowRight,
  Star,
  FileText,
  Users,
  Loader,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

interface SavedItem {
  id: string;
  type: "chart" | "report" | "compatibility" | "article" | "podcast";
  title: string;
  description?: string;
  coverImage?: string;
  timestamp: string;
  link: string;
  metadata?: any;
}

const SavedContent: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    reports,
    compatibilityReports,
    fetchBirthCharts,
    fetchReports,
    fetchCompatibilityReports,
  } = useAstrologyStore();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      const loadData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchBirthCharts(user.id),
            fetchReports(user.id),
            fetchCompatibilityReports(user.id),
          ]);
        } catch (error) {
          console.error("Error loading saved content:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [
    isAuthenticated,
    user,
    fetchBirthCharts,
    fetchReports,
    fetchCompatibilityReports,
  ]);

  useEffect(() => {
    // Convert astrology data to saved items format
    const items: SavedItem[] = [];

    // Add favorite birth charts
    birthCharts
      .filter((chart) => user?.savedContent?.includes(`chart:${chart.id}`))
      .forEach((chart) => {
        items.push({
          id: `chart-${chart.id}`,
          type: "chart",
          title: `${chart.name}'s Birth Chart`,
          description: `Created on ${new Date(chart.created_at).toLocaleDateString()}`,
          timestamp: chart.created_at,
          link: `/astrology/birth-chart?id=${chart.id}`,
          coverImage:
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
          metadata: {
            chartType: chart.chart_type,
            birthDate: chart.birth_date,
          },
        });
      });

    // Add favorite reports
    reports
      .filter((report) => user?.savedContent?.includes(`report:${report.id}`))
      .forEach((report) => {
        items.push({
          id: `report-${report.id}`,
          type: "report",
          title: report.title,
          description: `${report.report_type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Report`,
          timestamp: report.created_at,
          link: `/astrology/reports?id=${report.id}`,
          coverImage:
            "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=400&q=80",
          metadata: {
            reportType: report.report_type,
            isPremium: report.is_premium,
          },
        });
      });

    // Add compatibility reports
    compatibilityReports
      .filter((report) =>
        user?.savedContent?.includes(`compatibility:${report.id}`),
      )
      .forEach((report) => {
        const chart1 = birthCharts.find((c) => c.id === report.chart1_id);
        const chart2 = birthCharts.find((c) => c.id === report.chart2_id);

        items.push({
          id: `compatibility-${report.id}`,
          type: "compatibility",
          title: `Compatibility: ${chart1?.name || "Person 1"} & ${chart2?.name || "Person 2"}`,
          description: `${report.compatibility_score}% Match`,
          timestamp: report.created_at,
          link: `/astrology/compatibility?id=${report.id}`,
          coverImage:
            "https://images.unsplash.com/photo-1516589178581-6cd7ef18b4d2?w=400&q=80",
          metadata: {
            score: report.compatibility_score,
          },
        });
      });

    // Sort by timestamp (most recent first)
    const sortedItems = items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    setSavedItems(sortedItems);
  }, [birthCharts, reports, compatibilityReports, user]);

  if (!isAuthenticated) {
    return (
      <div className="bg-dark-800 rounded-xl p-6">
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">
            Sign in to view saved content
          </h4>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-600 hover:to-purple-600">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6">Saved Content</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "chart":
        return <Star className="w-4 h-4 text-purple-400" />;
      case "report":
        return <FileText className="w-4 h-4 text-teal-400" />;
      case "compatibility":
        return <Users className="w-4 h-4 text-pink-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-dark-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Saved Content</h2>
        {savedItems.length > 5 && (
          <Link
            to="/saved-content"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {savedItems.length > 0 ? (
        <div className="space-y-4">
          {savedItems.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-dark-700/50 transition-colors group"
            >
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={
                    item.coverImage ||
                    `https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}`
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center text-xs text-gray-400">
                  {getIconForType(item.type)}
                  <span className="ml-1">{item.description}</span>
                </div>
              </div>
              <Bookmark className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">
            No Saved Content
          </h4>
          <p className="text-gray-500 mb-4">
            Save birth charts, reports, and compatibility analyses for quick
            access
          </p>
          <Link to="/astrology/birth-chart">
            <Button variant="outline" icon={Star}>
              Create Birth Chart
            </Button>
          </Link>
        </div>
      )}

      {savedItems.length > 0 && (
        <Link
          to="/saved-content"
          className="flex items-center justify-center space-x-2 mt-6 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>See all saved content</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
};

export default SavedContent;
