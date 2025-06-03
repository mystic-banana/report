import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import PageLayout from "../../components/layout/PageLayout";
import AstrologyDashboard from "../../components/dashboard/AstrologyDashboard";
import SavedContent from "../../components/dashboard/SavedContent";
import RecentActivity from "../../components/dashboard/RecentActivity";
import OnboardingTour from "../../components/dashboard/OnboardingTour";
import PersonalizationPanel from "../../components/dashboard/PersonalizationPanel";
import AccessibilityToolbar from "../../components/dashboard/AccessibilityToolbar";
import LoadingSkeleton from "../../components/dashboard/LoadingSkeleton";
import {
  Star,
  Moon,
  Sparkles,
  Calendar,
  Heart,
  BookOpen,
  Settings,
  HelpCircle,
  Bell,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  Award,
  Headphones,
} from "lucide-react";
import Button from "../../components/ui/Button";

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(
        `onboarding-seen-${user.id}`,
      );
      if (!hasSeenOnboarding) {
        setIsNewUser(true);
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const tabConfig = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        icon: BarChart3,
        color: "indigo",
        description: "Your cosmic dashboard at a glance",
      },
      {
        id: "astrology",
        label: "Astrology",
        icon: Star,
        color: "purple",
        description: "Birth charts, reports, and cosmic insights",
      },
      {
        id: "tarot",
        label: "Tarot",
        icon: Moon,
        color: "indigo",
        description: "Card readings and mystical guidance",
      },
      {
        id: "content",
        label: "My Library",
        icon: BookOpen,
        color: "teal",
        description: "Saved content and personal collection",
      },
      {
        id: "activity",
        label: "Activity",
        icon: Calendar,
        color: "amber",
        description: "Recent actions and spiritual journey",
      },
    ],
    [],
  );

  const userDisplayName = useMemo(() => {
    return user?.name || user?.email?.split("@")[0] || "Seeker";
  }, [user?.name, user?.email]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding-seen-${user.id}`, "true");
      setIsNewUser(false);
    }
  };

  const quickActions = [
    {
      title: "Create Birth Chart",
      description: "Generate your personalized cosmic blueprint",
      icon: Star,
      link: "/astrology/birth-chart",
      color: "from-purple-600 to-pink-600",
    },
    {
      title: "Daily Horoscope",
      description: "Discover today's cosmic guidance",
      icon: Moon,
      link: "/astrology/horoscopes",
      color: "from-indigo-600 to-purple-600",
    },
    {
      title: "Compatibility",
      description: "Explore relationship dynamics",
      icon: Heart,
      link: "/astrology/compatibility",
      color: "from-pink-600 to-rose-600",
    },
    {
      title: "Browse Content",
      description: "Explore articles and insights",
      icon: BookOpen,
      link: "/magazine",
      color: "from-teal-600 to-cyan-600",
    },
  ];

  if (dashboardLoading) {
    return (
      <PageLayout>
        <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <LoadingSkeleton variant="header" className="mb-8" />
            <LoadingSkeleton variant="stats" className="mb-8" />
            <LoadingSkeleton variant="card" count={2} />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Welcome Header */}
          <div
            id="dashboard-header"
            className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-pink-900/30 rounded-2xl p-8 mb-8 border border-purple-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-6 h-6 text-purple-400 mr-2" />
                    <span className="text-purple-400 font-medium text-sm uppercase tracking-wide">
                      {user?.isPremium ? "Premium" : "Free"} Dashboard
                    </span>
                    {isNewUser && (
                      <span className="ml-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full animate-pulse">
                        New!
                      </span>
                    )}
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
                <div className="flex items-center space-x-3">
                  <button
                    id="settings-button"
                    onClick={() => setShowPersonalization(true)}
                    className="p-3 bg-dark-700/50 hover:bg-dark-600/50 rounded-xl transition-colors border border-dark-600 hover:border-purple-500/50"
                    aria-label="Open personalization settings"
                  >
                    <Settings className="w-5 h-5 text-gray-400 hover:text-purple-400 transition-colors" />
                  </button>
                  {isNewUser && (
                    <Button
                      onClick={() => setShowOnboarding(true)}
                      variant="outline"
                      size="sm"
                      icon={HelpCircle}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      Take Tour
                    </Button>
                  )}
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
          </div>

          {/* Enhanced Navigation Tabs */}
          <div
            id="navigation-tabs"
            className="flex flex-wrap gap-2 mb-8 bg-dark-800/50 rounded-xl p-2 border border-dark-700"
          >
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-600 text-white shadow-lg transform scale-105`
                      : "text-gray-400 hover:text-white hover:bg-dark-700"
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === "overview" && (
              <div id="overview-section" className="space-y-8">
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} to={action.link}>
                        <div
                          className={`bg-gradient-to-br ${action.color} p-6 rounded-2xl text-white hover:scale-105 transition-transform duration-200 cursor-pointer`}
                        >
                          <Icon className="w-8 h-8 mb-3" />
                          <h3 className="font-semibold mb-1">{action.title}</h3>
                          <p className="text-sm opacity-90">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Suspense fallback={<LoadingSkeleton variant="card" />}>
                      <RecentActivity />
                    </Suspense>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                        Your Progress
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Spiritual Level</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-dark-600 rounded-full overflow-hidden">
                              <div className="w-3/4 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                            </div>
                            <span className="text-sm text-purple-400">75%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Cosmic Insights</span>
                          <span className="text-amber-400 font-semibold">
                            42
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Days Active</span>
                          <span className="text-green-400 font-semibold">
                            28
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20">
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-purple-400" />
                        Today's Energy
                      </h4>
                      <p className="text-gray-300 text-sm mb-3">
                        The planets align to bring clarity and new
                        opportunities. Trust your intuition today.
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < 4 ? "text-amber-400" : "text-gray-600"}`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          High Energy
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "astrology" && (
              <div id="astrology-section">
                <Suspense
                  fallback={<LoadingSkeleton variant="card" count={2} />}
                >
                  <AstrologyDashboard />
                </Suspense>
              </div>
            )}

            {activeTab === "tarot" && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 border border-indigo-500/20 text-center">
                <Moon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-white mb-4">
                  Tarot Readings Coming Soon
                </h2>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  Unlock the mysteries of the cards with personalized tarot
                  readings, daily card draws, and comprehensive spread
                  interpretations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    icon={Bell}
                  >
                    Get Notified
                  </Button>
                  <Link to="/tarot">
                    <Button variant="outline">Explore Tarot</Button>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div
                id="saved-content"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2">
                  <Suspense fallback={<LoadingSkeleton variant="card" />}>
                    <SavedContent />
                  </Suspense>
                </div>
                <div className="space-y-6">
                  <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-teal-400" />
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
                      <Link to="/astrology/reports">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          View All Reports
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div id="activity-section">
                <Suspense fallback={<LoadingSkeleton variant="card" />}>
                  <RecentActivity />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        {/* Onboarding Tour */}
        <OnboardingTour
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />

        {/* Personalization Panel */}
        <PersonalizationPanel
          isOpen={showPersonalization}
          onClose={() => setShowPersonalization(false)}
        />

        {/* Accessibility Toolbar */}
        <AccessibilityToolbar />
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
