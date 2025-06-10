import React, { useEffect, useState } from "react";
import {
  Book,
  Headphones,
  Star,
  Clock,
  Activity,
  FileText,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const {
    birthCharts,
    reports,
    compatibilityReports,
    fetchBirthCharts,
    fetchReports,
    fetchCompatibilityReports,
  } = useAstrologyStore();
  const [totalReadingTime, setTotalReadingTime] = useState("0h");

  useEffect(() => {
    if (user) {
      // Fetch data when component mounts
      fetchBirthCharts(user.id);
      fetchReports(user.id);
      fetchCompatibilityReports(user.id);

      // Calculate estimated reading time based on reports
      const calculateReadingTime = () => {
        // Assume average reading time of 10 minutes per report
        const totalMinutes = (reports?.length || 0) * 10;
        if (totalMinutes < 60) {
          setTotalReadingTime(`${totalMinutes}m`);
        } else {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          setTotalReadingTime(
            `${hours}${minutes > 0 ? "." + Math.floor(minutes / 6) : ""}h`,
          );
        }
      };

      calculateReadingTime();
    }
  }, [
    user,
    reports,
    fetchBirthCharts,
    fetchReports,
    fetchCompatibilityReports,
  ]);

  const stats = [
    {
      label: "Birth Charts",
      value: (birthCharts?.length || 0).toString(),
      icon: <Star className="w-5 h-5" />,
      color: "text-purple-400",
      link: "/astrology/birth-chart",
    },
    {
      label: "Reports",
      value: (reports?.length || 0).toString(),
      icon: <FileText className="w-5 h-5" />,
      color: "text-teal-400",
      link: "/astrology/reports",
    },
    {
      label: "Compatibility",
      value: (compatibilityReports?.length || 0).toString(),
      icon: <Users className="w-5 h-5" />,
      color: "text-pink-400",
      link: "/astrology/compatibility",
    },
    {
      label: "Reading Time",
      value: totalReadingTime,
      icon: <Clock className="w-5 h-5" />,
      color: "text-green-500",
      link: "/astrology/reports",
    },
  ];

  return (
    <div className="bg-dark-800 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Overview</h2>
        <Link
          to="/astrology"
          className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
        >
          <Button variant="ghost" size="sm" icon={Activity}>
            View All Activity
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="block">
            <div className="bg-dark-700 rounded-lg p-4 hover:bg-dark-600 transition-colors">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
