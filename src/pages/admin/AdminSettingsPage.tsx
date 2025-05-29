import React, { useState } from 'react';
import { Settings, Users, CreditCard, DollarSign, CheckCircle } from 'lucide-react';

// Import settings components directly
import PaymentSettings from '../../components/admin/settings/PaymentSettings';
import PlanManagement from '../../components/admin/settings/PlanManagement';
import AdSenseSettings from '../../components/admin/settings/AdSenseSettings';
import UserManagement from '../../components/admin/settings/UserManagement';
import ApprovalManagement from '../../components/admin/settings/ApprovalManagement';

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('adsense');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'adsense':
        return <AdSenseSettings />;
      case 'plans':
        return <PlanManagement />;
      case 'payment':
        return <PaymentSettings />;
      case 'users':
        return <UserManagement />;
      case 'approvals':
        return <ApprovalManagement />;
      default:
        return <AdSenseSettings />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Settings</h1>
      
      <div className="w-full">
        <div className="flex flex-wrap -mx-1 mb-6">
          <button
            onClick={() => setActiveTab('adsense')}
            className={`px-4 py-2 m-1 rounded-md flex items-center ${activeTab === 'adsense' ? 'bg-accent-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
          >
            <Settings size={16} className="mr-2" />
            AdSense Settings
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 m-1 rounded-md flex items-center ${activeTab === 'plans' ? 'bg-accent-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
          >
            <DollarSign size={16} className="mr-2" />
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 m-1 rounded-md flex items-center ${activeTab === 'payment' ? 'bg-accent-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
          >
            <CreditCard size={16} className="mr-2" />
            Payment Settings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 m-1 rounded-md flex items-center ${activeTab === 'users' ? 'bg-accent-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
          >
            <Users size={16} className="mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 m-1 rounded-md flex items-center ${activeTab === 'approvals' ? 'bg-accent-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
          >
            <CheckCircle size={16} className="mr-2" />
            Content Approval
          </button>
        </div>
        
        <div className="bg-dark-800 rounded-lg p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
