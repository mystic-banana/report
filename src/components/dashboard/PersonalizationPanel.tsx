import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Palette,
  Layout,
  Bell,
  Eye,
  Moon,
  Sun,
  Monitor,
  Grid,
  List,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import { Switch } from "../ui/Switch";

interface PersonalizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersonalizationSettings {
  theme: "light" | "dark" | "auto";
  layout: "grid" | "list" | "compact";
  notifications: {
    dailyHoroscope: boolean;
    dailyTarot: boolean;
    newContent: boolean;
    premiumOffers: boolean;
    soundEnabled: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
  dashboard: {
    showWelcomeMessage: boolean;
    showQuickStats: boolean;
    showRecentActivity: boolean;
    compactMode: boolean;
  };
}

const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUserProfile } = useAuthStore();
  const [settings, setSettings] = useState<PersonalizationSettings>({
    theme: "dark",
    layout: "grid",
    notifications: {
      dailyHoroscope: true,
      dailyTarot: true,
      newContent: true,
      premiumOffers: true,
      soundEnabled: true,
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
    },
    dashboard: {
      showWelcomeMessage: true,
      showQuickStats: true,
      showRecentActivity: true,
      compactMode: false,
    },
  });
  const [activeTab, setActiveTab] = useState("theme");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setSettings({
        theme: (user.preferences as any).theme || "dark",
        layout: (user.preferences as any).layout || "grid",
        notifications: {
          ...settings.notifications,
          ...(user.preferences as any).notificationSettings,
        },
        accessibility:
          (user.preferences as any).accessibility || settings.accessibility,
        dashboard: (user.preferences as any).dashboard || settings.dashboard,
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof PersonalizationSettings],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile({
        preferences: {
          ...user.preferences,
          theme: settings.theme,
          layout: settings.layout,
          notificationSettings: settings.notifications,
          accessibility: settings.accessibility,
          dashboard: settings.dashboard,
        },
      });
      setHasChanges(false);
      applyThemeChanges();
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const applyThemeChanges = () => {
    const root = document.documentElement;

    if (settings.accessibility.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (settings.accessibility.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }

    if (settings.accessibility.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  };

  const handleReset = () => {
    setSettings({
      theme: "dark",
      layout: "grid",
      notifications: {
        dailyHoroscope: true,
        dailyTarot: true,
        newContent: true,
        premiumOffers: true,
        soundEnabled: true,
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
      },
      dashboard: {
        showWelcomeMessage: true,
        showQuickStats: true,
        showRecentActivity: true,
        compactMode: false,
      },
    });
    setHasChanges(true);
  };

  const tabs = [
    { id: "theme", label: "Theme", icon: Palette },
    { id: "layout", label: "Layout", icon: Layout },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "accessibility", label: "Accessibility", icon: Eye },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl border border-purple-500/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Personalization
                </h2>
                <p className="text-sm text-gray-400">
                  Customize your dashboard experience
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Close personalization panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-200px)]">
            {/* Sidebar */}
            <div className="w-48 bg-dark-900/50 border-r border-dark-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-dark-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === "theme" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Theme Preferences
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "auto", label: "Auto", icon: Monitor },
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.id}
                            onClick={() =>
                              handleSettingChange("theme", "theme", theme.id)
                            }
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.theme === theme.id
                                ? "border-purple-500 bg-purple-500/20"
                                : "border-dark-600 hover:border-dark-500"
                            }`}
                          >
                            <Icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-white">{theme.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "layout" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Layout Options
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "grid", label: "Grid", icon: Grid },
                        { id: "list", label: "List", icon: List },
                        { id: "compact", label: "Compact", icon: Layout },
                      ].map((layout) => {
                        const Icon = layout.icon;
                        return (
                          <button
                            key={layout.id}
                            onClick={() =>
                              handleSettingChange("layout", "layout", layout.id)
                            }
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.layout === layout.id
                                ? "border-purple-500 bg-purple-500/20"
                                : "border-dark-600 hover:border-dark-500"
                            }`}
                          >
                            <Icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-white">{layout.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-white mb-3">
                      Dashboard Components
                    </h4>
                    <div className="space-y-3">
                      {[
                        { key: "showWelcomeMessage", label: "Welcome Message" },
                        { key: "showQuickStats", label: "Quick Statistics" },
                        { key: "showRecentActivity", label: "Recent Activity" },
                        { key: "compactMode", label: "Compact Mode" },
                      ].map((option) => (
                        <div
                          key={option.key}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-300">{option.label}</span>
                          <Switch
                            checked={
                              settings.dashboard[
                                option.key as keyof typeof settings.dashboard
                              ]
                            }
                            onChange={(checked) =>
                              handleSettingChange(
                                "dashboard",
                                option.key,
                                checked,
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "dailyHoroscope",
                          label: "Daily Horoscope",
                          desc: "Get your daily horoscope",
                        },
                        {
                          key: "dailyTarot",
                          label: "Daily Tarot",
                          desc: "Receive daily tarot insights",
                        },
                        {
                          key: "newContent",
                          label: "New Content",
                          desc: "Notifications for new articles and features",
                        },
                        {
                          key: "premiumOffers",
                          label: "Premium Offers",
                          desc: "Special offers and promotions",
                        },
                      ].map((notification) => (
                        <div
                          key={notification.key}
                          className="flex items-start justify-between"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {notification.label}
                            </p>
                            <p className="text-sm text-gray-400">
                              {notification.desc}
                            </p>
                          </div>
                          <Switch
                            checked={
                              settings.notifications[
                                notification.key as keyof typeof settings.notifications
                              ]
                            }
                            onChange={(checked) =>
                              handleSettingChange(
                                "notifications",
                                notification.key,
                                checked,
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-white mb-3">
                      Sound Settings
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {settings.notifications.soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-gray-400" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-300">
                          Notification Sounds
                        </span>
                      </div>
                      <Switch
                        checked={settings.notifications.soundEnabled}
                        onChange={(checked) =>
                          handleSettingChange(
                            "notifications",
                            "soundEnabled",
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "accessibility" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Accessibility Options
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "highContrast",
                          label: "High Contrast",
                          desc: "Increase color contrast for better visibility",
                        },
                        {
                          key: "largeText",
                          label: "Large Text",
                          desc: "Increase text size throughout the application",
                        },
                        {
                          key: "reducedMotion",
                          label: "Reduced Motion",
                          desc: "Minimize animations and transitions",
                        },
                      ].map((option) => (
                        <div
                          key={option.key}
                          className="flex items-start justify-between"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {option.label}
                            </p>
                            <p className="text-sm text-gray-400">
                              {option.desc}
                            </p>
                          </div>
                          <Switch
                            checked={
                              settings.accessibility[
                                option.key as keyof typeof settings.accessibility
                              ]
                            }
                            onChange={(checked) =>
                              handleSettingChange(
                                "accessibility",
                                option.key,
                                checked,
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-dark-700">
            <Button
              variant="ghost"
              onClick={handleReset}
              icon={RotateCcw}
              className="text-gray-400 hover:text-white"
            >
              Reset to Defaults
            </Button>
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                loading={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersonalizationPanel;
