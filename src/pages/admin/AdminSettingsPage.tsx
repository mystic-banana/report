import React, { useState } from "react";
import {
  Settings,
  Users,
  CreditCard,
  DollarSign,
  CheckCircle,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Star,
} from "lucide-react";
import { AdminSecurityProvider } from "../../components/admin/AdminSecurityProvider";
import AdminAuthGuard from "../../components/admin/AdminAuthGuard";

// Import settings components directly
import PaymentSettings from "../../components/admin/settings/PaymentSettings";
import PlanManagement from "../../components/admin/settings/PlanManagement";

import AdManagement from "../../components/admin/settings/AdManagement";
import UserManagement from "../../components/admin/settings/UserManagement";
import ApprovalManagement from "../../components/admin/settings/ApprovalManagement";
import TemplateManagement from "../../components/admin/settings/TemplateManagement";

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ads");

  const renderTabContent = () => {
    switch (activeTab) {
      case "ads":
        return <AdManagement />;

      case "plans":
        return <PlanManagement />;
      case "payment":
        return <PaymentSettings />;
      case "users":
        return <UserManagement />;
      case "approvals":
        return <ApprovalManagement />;
      case "templates":
        return <TemplateManagement />;
      default:
        return <AdManagement />;
    }
  };

  return (
    <AdminAuthGuard>
      <AdminSecurityProvider>
        <div className="container mx-auto px-4 py-8 bg-dark-900 min-h-screen">
          <div className="flex items-center mb-8">
            <Shield className="w-8 h-8 text-accent-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          </div>

          <div className="w-full">
            <div className="bg-dark-800 rounded-lg p-1 mb-6 inline-flex">
              <button
                onClick={() => setActiveTab("ads")}
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                  activeTab === "ads"
                    ? "bg-accent-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <BarChart3 size={16} className="mr-2" />
                Ad Banners
              </button>

              <button
                onClick={() => setActiveTab("plans")}
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                  activeTab === "plans"
                    ? "bg-accent-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <DollarSign size={16} className="mr-2" />
                Plans
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                  activeTab === "payment"
                    ? "bg-accent-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <CreditCard size={16} className="mr-2" />
                Payments
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                  activeTab === "users"
                    ? "bg-accent-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <Users size={16} className="mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab("approvals")}
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                  activeTab === "approvals"
                    ? "bg-accent-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <CheckCircle size={16} className="mr-2" />
                Moderation
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                  activeTab === "templates"
                    ? "bg-accent-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <FileText size={16} className="mr-2" />
                Templates
              </button>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </AdminSecurityProvider>
    </AdminAuthGuard>
  );
};

export default AdminSettingsPage;
