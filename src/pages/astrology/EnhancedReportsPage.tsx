import React from "react";
import { Helmet } from "react-helmet-async";
import ReportDashboard from "../../components/reports/ReportDashboard";

const EnhancedReportsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark-900">
      <Helmet>
        <title>Astrological Reports | MysticBanana</title>
        <meta
          name="description"
          content="View and create personalized astrological reports based on your birth chart"
        />
      </Helmet>

      <ReportDashboard />
    </div>
  );
};

export default EnhancedReportsPage;
