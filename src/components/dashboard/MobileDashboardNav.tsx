import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Star,
  FileText,
  Users,
  Sun,
  Calendar,
  Moon,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

const MobileDashboardNav: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-xl border-t border-slate-700/50 lg:hidden">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  item.current
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Navigation */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Mystic Banana</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/astrology/transits"
                className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4" />
                  <span>Transits</span>
                </div>
              </Link>
              <Link
                to="/astrology/vedic"
                className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <Moon className="w-4 h-4" />
                  <span>Vedic Astrology</span>
                </div>
              </Link>
              <Link
                to="/dashboard?tab=analytics"
                className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileDashboardNav;
