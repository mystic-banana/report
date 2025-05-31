import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import PageLayout from "../../components/layout/PageLayout";
import AstrologyDashboard from "../../components/dashboard/AstrologyDashboard";
import SavedContent from "../../components/dashboard/SavedContent";
import RecentActivity from "../../components/dashboard/RecentActivity";
import PodcastSubmissionForm from "../../components/dashboard/PodcastSubmissionForm";
import PodcastPlaylist from "../../components/podcasts/PodcastPlaylist";
import {
  Star,
  Moon,
  Sparkles,
  PlusCircle,
  Rss,
  Headphones,
  ArrowRight,
  Calendar,
  Heart,
  BookOpen,
} from "lucide-react";
import Button from "../../components/ui/Button";

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [activeTab, setActiveTab] = useState("astrology");

  // Memoize tab configuration to prevent unnecessary re-renders
  const tabConfig = useMemo(
    () => [
      {
        id: "astrology",
        label: "Astrology",
        icon: Star,
        color: "purple",
      },
      { id: "tarot", label: "Tarot", icon: Moon, color: "indigo" },
      {
        id: "content",
        label: "Saved Content",
        icon: BookOpen,
        color: "teal",
      },
      {
        id: "activity",
        label: "Recent Activity",
        icon: Calendar,
        color: "amber",
      },
    ],
    [],
  );

  // Memoize user display name to prevent recalculation
  const userDisplayName = useMemo(() => {
    return user?.name || user?.email?.split("@")[0] || "Seeker";
  }, [user?.name, user?.email]);

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Premium Welcome Header */}
          <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-pink-900/30 rounded-2xl p-8 mb-8 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-6 h-6 text-purple-400 mr-2" />
                    <span className="text-purple-400 font-medium text-sm uppercase tracking-wide">
                      Premium Dashboard
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                    Welcome back,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {userDisplayName}
                    </span>
                    !
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Your cosmic journey awaits. Explore the mysteries of the
                    universe.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center relative">
                    <Star className="w-8 h-8 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 bg-dark-800/50 rounded-xl p-2 border border-dark-700">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-600 text-white shadow-lg`
                      : "text-gray-400 hover:text-white hover:bg-dark-700"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === "astrology" && <AstrologyDashboard />}

            {activeTab === "tarot" && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 border border-indigo-500/20 text-center">
                <Moon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-white mb-4">
                  Tarot Readings Coming Soon
                </h2>
                <p className="text-gray-300 mb-6">
                  Unlock the mysteries of the cards with personalized tarot
                  readings, daily card draws, and comprehensive spread
                  interpretations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    Get Notified
                  </Button>
                  <Link to="/tarot">
                    <Button variant="outline">Explore Tarot</Button>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <SavedContent />
                </div>
                <div>
                  <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Link to="/magazine">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Browse Magazine
                        </Button>
                      </Link>
                      <Link to="/astrology/birth-chart">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          View Birth Charts
                        </Button>
                      </Link>
                      <Link to="/podcasts">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Headphones className="w-4 h-4 mr-2" />
                          Listen to Podcasts
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentActivity />
                <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Spiritual Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="text-white font-medium mb-2">
                        Today's Cosmic Energy
                      </h4>
                      <p className="text-gray-400 text-sm">
                        The planets align to bring clarity and new
                        opportunities. Trust your intuition today.
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl p-4 border border-amber-500/20">
                      <h4 className="text-white font-medium mb-2">
                        Meditation Reminder
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Take 10 minutes today to center yourself and connect
                        with your inner wisdom.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Podcast Section - Minimized */}
          <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-purple-400" />
                Podcast Corner
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPodcastForm(!showPodcastForm)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Submit Podcast
                </button>
                <span className="text-gray-600">•</span>
                <button
                  onClick={() => setShowPlaylists(!showPlaylists)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showPlaylists ? "Hide" : "Show"} Playlists
                </button>
                <Link to="/podcasts">
                  <Button variant="ghost" size="sm" icon={ArrowRight}>
                    Browse All
                  </Button>
                </Link>
              </div>
            </div>

            {showPodcastForm && (
              <div className="mb-4">
                <PodcastSubmissionForm />
              </div>
            )}

            {showPlaylists && (
              <div className="max-h-64 overflow-y-auto">
                <PodcastPlaylist onDashboard={true} />
              </div>
            )}

            {!showPlaylists && !showPodcastForm && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-2">
                  Discover spiritual podcasts and create your own playlists
                </p>
                <Link to="/podcasts">
                  <Button size="sm" variant="outline">
                    Explore Podcasts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
