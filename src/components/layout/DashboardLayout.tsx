import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  Menu,
  X,
  Star,
  FileText,
  Users,
  Calendar,
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  Moon,
  Sun,
  BarChart3,
  BookOpen,
  Headphones,
  Crown,
  ChevronDown,
  Home,
  Sparkles,
} from "lucide-react";
import Button from "../ui/Button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const userDisplayName = user?.name || user?.email?.split("@")[0] || "Seeker";

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Birth Charts",
      href: "/astrology/birth-chart",
      icon: Star,
      current: location.pathname.includes("/birth-chart"),
    },
    {
      name: "Reports",
      href: "/astrology/reports",
      icon: FileText,
      current: location.pathname.includes("/reports"),
      badge: "New",
    },
    {
      name: "Compatibility",
      href: "/astrology/compatibility",
      icon: Users,
      current: location.pathname.includes("/compatibility"),
    },
    {
      name: "Horoscopes",
      href: "/astrology/horoscopes",
      icon: Sun,
      current: location.pathname.includes("/horoscopes"),
    },
    {
      name: "Transits",
      href: "/astrology/transits",
      icon: Calendar,
      current: location.pathname.includes("/transits"),
    },
    {
      name: "Vedic Astrology",
      href: "/astrology/vedic",
      icon: Moon,
      current: location.pathname.includes("/vedic"),
    },
  ];

  const secondaryNavigation = [
    {
      name: "Magazine",
      href: "/magazine",
      icon: BookOpen,
      current: location.pathname.includes("/magazine"),
    },
    {
      name: "Podcasts",
      href: "/podcasts",
      icon: Headphones,
      current: location.pathname.includes("/podcasts"),
    },
    {
      name: "Analytics",
      href: "/dashboard?tab=analytics",
      icon: BarChart3,
      current: location.search.includes("analytics"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setNotificationsOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700/50">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Mystic Banana
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userDisplayName}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-slate-400">
                    {user?.isPremium ? "Premium" : "Free"} Plan
                  </p>
                  {user?.isPremium && (
                    <Crown className="w-3 h-3 text-amber-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      item.current
                        ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        item.current
                          ? "text-purple-400"
                          : "text-slate-400 group-hover:text-slate-300"
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-600/20 text-purple-300 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Explore
              </p>
              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        item.current
                          ? "bg-slate-700/50 text-white"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Bottom actions */}
          <div className="px-4 py-4 border-t border-slate-700/50">
            <div className="space-y-2">
              <Link
                to="/dashboard/settings"
                className="group flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-700/30 rounded-lg transition-all duration-200"
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search bar - hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reports, charts..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></span>
                </button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-700/50">
                      <h3 className="text-sm font-medium text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-slate-700/30 transition-colors">
                        <p className="text-sm text-white">
                          Your birth chart report is ready
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          2 minutes ago
                        </p>
                      </div>
                      <div className="px-4 py-3 hover:bg-slate-700/30 transition-colors">
                        <p className="text-sm text-white">
                          New weekly horoscope available
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-700/50">
                      <p className="text-sm font-medium text-white">
                        {userDisplayName}
                      </p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/30 transition-colors"
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/plans"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/30 transition-colors"
                    >
                      {user?.isPremium
                        ? "Manage Subscription"
                        : "Upgrade to Premium"}
                    </Link>
                    <div className="border-t border-slate-700/50 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>

        {/* Dashboard Footer */}
        <footer className="border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400">
              <p>© 2024 Mystic Banana. All rights reserved.</p>
              <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <Link
                  to="/privacy"
                  className="hover:text-slate-300 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-slate-300 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-slate-300 transition-colors"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
