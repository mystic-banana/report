import React from 'react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for stats or quick links */}
        <div className="bg-dark-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-white mb-2">Total Articles</h2>
          <p className="text-3xl font-bold text-accent-400">120</p> {/* Example Data */}
        </div>
        <div className="bg-dark-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-white mb-2">Total Podcasts</h2>
          <p className="text-3xl font-bold text-accent-400">45</p> {/* Example Data */}
        </div>
        <div className="bg-dark-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-white mb-2">New Users (Month)</h2>
          <p className="text-3xl font-bold text-accent-400">78</p> {/* Example Data */}
        </div>
      </div>
      {/* Further content will go here */}
    </div>
  );
};

export default AdminDashboardPage;
