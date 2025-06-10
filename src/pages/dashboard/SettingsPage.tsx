import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Crown,
  Settings,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

interface UserSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  theme: "dark" | "light" | "auto";
  language: string;
  timezone: string;
  privacy_level: "public" | "private" | "friends";
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    location: "",
    website: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    theme: "dark",
    language: "en",
    timezone: "UTC",
    privacy_level: "private",
  });

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfileData({
          name: data.name || user.name || "",
          email: user.email || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
        });

        setSettings({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          marketing_emails: data.marketing_emails ?? false,
          theme: data.theme || "dark",
          language: data.language || "en",
          timezone: data.timezone || "UTC",
          privacy_level: data.privacy_level || "private",
        });
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update auth store
      updateUser({ ...user, name: profileData.name });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "subscription", label: "Subscription", icon: Crown },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Account Settings
              </h1>
              <p className="text-gray-400">
                Manage your account preferences and security settings
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user?.isPremium && (
              <span className="flex items-center bg-amber-600/20 text-amber-300 px-3 py-1 rounded-full text-sm">
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Profile Information
                      </h2>
                      <p className="text-gray-400">
                        Update your personal information and profile details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full bg-slate-700/50 border border-slate-600 text-gray-400 rounded-lg p-3 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed from settings
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-700">
                    <Button
                      onClick={handleSaveProfile}
                      loading={saving}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Security Settings
                      </h2>
                      <p className="text-gray-400">
                        Manage your password and security preferences
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-700">
                    <Button
                      onClick={handleChangePassword}
                      loading={saving}
                      className="bg-gradient-to-r from-red-600 to-orange-600"
                      disabled={
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <Bell className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Notification Preferences
                      </h2>
                      <p className="text-gray-400">
                        Choose how you want to be notified
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        key: "email_notifications",
                        title: "Email Notifications",
                        description: "Receive important updates via email",
                      },
                      {
                        key: "push_notifications",
                        title: "Push Notifications",
                        description: "Get notified in your browser",
                      },
                      {
                        key: "marketing_emails",
                        title: "Marketing Emails",
                        description: "Receive promotional content and offers",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl"
                      >
                        <div>
                          <h3 className="text-white font-medium">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              settings[
                                item.key as keyof UserSettings
                              ] as boolean
                            }
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-700">
                    <Button
                      onClick={handleSaveSettings}
                      loading={saving}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        App Preferences
                      </h2>
                      <p className="text-gray-400">
                        Customize your app experience
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.theme}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            theme: e.target.value as "dark" | "light" | "auto",
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) =>
                          setSettings({ ...settings, language: e.target.value })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) =>
                          setSettings({ ...settings, timezone: e.target.value })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Privacy Level
                      </label>
                      <select
                        value={settings.privacy_level}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            privacy_level: e.target.value as
                              | "public"
                              | "private"
                              | "friends",
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-700">
                    <Button
                      onClick={handleSaveSettings}
                      loading={saving}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Subscription Tab */}
              {activeTab === "subscription" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Subscription & Billing
                      </h2>
                      <p className="text-gray-400">
                        Manage your subscription and billing information
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl p-6 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {user?.isPremium ? "Premium Plan" : "Free Plan"}
                        </h3>
                        <p className="text-gray-300">
                          {user?.isPremium
                            ? "You have access to all premium features"
                            : "Upgrade to unlock premium features"}
                        </p>
                      </div>
                      {user?.isPremium && (
                        <Crown className="w-8 h-8 text-amber-400" />
                      )}
                    </div>

                    {!user?.isPremium && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-700/30 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2">
                              Premium Features
                            </h4>
                            <ul className="text-gray-300 text-sm space-y-1">
                              <li>• Unlimited birth charts</li>
                              <li>• Premium astrology reports</li>
                              <li>• Advanced compatibility analysis</li>
                              <li>• Priority support</li>
                            </ul>
                          </div>
                          <div className="bg-slate-700/30 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2">
                              Current Limitations
                            </h4>
                            <ul className="text-gray-300 text-sm space-y-1">
                              <li>• 3 birth charts maximum</li>
                              <li>• Basic reports only</li>
                              <li>• Limited compatibility features</li>
                              <li>• Standard support</li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-center pt-4">
                          <Button
                            onClick={() => navigate("/plans")}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-3"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        </div>
                      </div>
                    )}

                    {user?.isPremium && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                          <span className="text-white">Next billing date</span>
                          <span className="text-gray-300">
                            January 15, 2025
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                          <span className="text-white">Plan price</span>
                          <span className="text-gray-300">$9.99/month</span>
                        </div>
                        <div className="flex justify-center space-x-4 pt-4">
                          <Button variant="outline" size="sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Update Payment
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
