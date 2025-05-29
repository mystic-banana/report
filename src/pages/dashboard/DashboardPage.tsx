import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import PageLayout from '../../components/layout/PageLayout';
import DashboardOverview from '../../components/dashboard/DashboardOverview';
import SavedContent from '../../components/dashboard/SavedContent';
import RecentActivity from '../../components/dashboard/RecentActivity';
import PodcastSubmissionForm from '../../components/dashboard/PodcastSubmissionForm';
import PodcastPlaylist from '../../components/podcasts/PodcastPlaylist';
import { PlusCircle, Rss, Headphones } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(true);

  return (
    <PageLayout>
      <div className="bg-dark-900 min-h-screen py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.email?.split('@')[0] || 'User'}</h1>
            <p className="text-gray-400">Explore your dashboard and manage your content</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowPlaylists(!showPlaylists)}
                  className="inline-flex items-center px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-md text-white font-medium transition-colors"
                >
                  <Headphones size={16} className="mr-2" />
                  {showPlaylists ? 'Hide Playlists' : 'Show Playlists'}
                </button>
                <button 
                  onClick={() => setShowPodcastForm(!showPodcastForm)}
                  className="inline-flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
                >
                  {showPodcastForm ? (
                    <>
                      <Rss size={16} className="mr-2" />
                      Hide Podcast Form
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} className="mr-2" />
                      Submit a Podcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {showPodcastForm && (
            <div className="mb-8">
              <PodcastSubmissionForm />
            </div>
          )}
          
          {showPlaylists && (
            <div className="mb-8">
              <PodcastPlaylist onDashboard={true} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <DashboardOverview />
              <RecentActivity />
            </div>
            <div className="lg:col-span-4">
              <SavedContent />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;