import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { Save, Lock, User, Mail, Bell, Shield, CreditCard } from "lucide-react";
import Button from "../../components/ui/Button";

const DashboardSettingsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notifications: {
      email: true,
      app: true,
      marketing: false
    },
    theme: "system",
    timezone: "auto"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name.split('.')[1]]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Only update fields that can be changed
      await updateUserProfile({
        name: formData.name
      });
      
      setMessage({ 
        type: "success", 
        text: "Your settings have been updated successfully!"
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      setMessage({ 
        type: "error", 
        text: "Failed to update settings. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Account Settings | Mystic Banana</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-100">Account Settings</h1>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/60 text-green-200' : 'bg-red-900/60 text-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h2 className="text-xl font-medium text-gray-200 mb-4">Settings</h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <a href="#profile" className="text-purple-400 flex items-center gap-2 py-2 px-3 bg-purple-900/20 rounded-md">
                      <User size={18} />
                      <span>Profile</span>
                    </a>
                  </li>
                  <li>
                    <a href="#notifications" className="text-gray-300 hover:text-purple-400 flex items-center gap-2 py-2 px-3 hover:bg-gray-700/40 rounded-md">
                      <Bell size={18} />
                      <span>Notifications</span>
                    </a>
                  </li>
                  <li>
                    <a href="#security" className="text-gray-300 hover:text-purple-400 flex items-center gap-2 py-2 px-3 hover:bg-gray-700/40 rounded-md">
                      <Shield size={18} />
                      <span>Security</span>
                    </a>
                  </li>
                  <li>
                    <a href="#billing" className="text-gray-300 hover:text-purple-400 flex items-center gap-2 py-2 px-3 hover:bg-gray-700/40 rounded-md">
                      <CreditCard size={18} />
                      <span>Billing</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Profile section */}
              <section id="profile" className="bg-gray-800/50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-medium text-gray-200 mb-6 flex items-center gap-2">
                  <User size={20} />
                  Profile Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-4 py-2 text-gray-400 cursor-not-allowed"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Contact support to change your email address
                    </p>
                  </div>
                </div>
              </section>

              {/* Notifications section */}
              <section id="notifications" className="bg-gray-800/50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-medium text-gray-200 mb-6 flex items-center gap-2">
                  <Bell size={20} />
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-200">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive updates via email</p>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="notifications.email"
                          checked={formData.notifications.email}
                          onChange={handleInputChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-200">App Notifications</h3>
                      <p className="text-sm text-gray-400">Receive in-app notifications</p>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="notifications.app"
                          checked={formData.notifications.app}
                          onChange={handleInputChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-200">Marketing Communications</h3>
                      <p className="text-sm text-gray-400">Receive promotional emails</p>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="notifications.marketing"
                          checked={formData.notifications.marketing}
                          onChange={handleInputChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security section placeholder */}
              <section id="security" className="bg-gray-800/50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-medium text-gray-200 mb-6 flex items-center gap-2">
                  <Shield size={20} />
                  Security
                </h2>
                
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password change functionality would go here");
                    }}
                  >
                    <Lock size={16} />
                    Change Password
                  </Button>
                </div>
              </section>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center gap-2 px-6"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettingsPage;
