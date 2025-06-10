import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Switch } from '../../../components/ui/Switch';
import { toast } from 'react-hot-toast';

interface AdSenseConfig {
  enabled: boolean;
  publisher_id: string;
  ad_client: string;
  article_ad_slot: string;
  sidebar_ad_slot: string;
  podcast_ad_slot: string;
  show_premium_users: boolean;
  auto_ads_enabled: boolean;
}

const AdSenseSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AdSenseConfig>({
    enabled: false,
    publisher_id: '',
    ad_client: '',
    article_ad_slot: '',
    sidebar_ad_slot: '',
    podcast_ad_slot: '',
    show_premium_users: false,
    auto_ads_enabled: false
  });

  useEffect(() => {
    fetchAdSenseConfig();
  }, []);

  const fetchAdSenseConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'adsense_config')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }
      
      if (data) {
        setConfig(data.value as AdSenseConfig);
      }
    } catch (err: any) {
      console.error('Error fetching AdSense config:', err);
      toast.error('Failed to load AdSense configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveAdSenseConfig = async () => {
    try {
      setSaving(true);
      
      // Validate AdSense credentials
      if (config.enabled) {
        if (!config.publisher_id || !config.ad_client) {
          toast.error('Publisher ID and Ad Client are required when ads are enabled');
          return;
        }
        
        // Simple format validation
        if (!config.ad_client.startsWith('ca-pub-')) {
          toast.error('Ad Client should start with "ca-pub-"');
          return;
        }
      }
      
      // Check if config already exists
      const { data: existingConfig } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'adsense_config')
        .single();
        
      let result;
      
      if (existingConfig) {
        // Update existing config
        result = await supabase
          .from('site_settings')
          .update({ value: config, updated_at: new Date() })
          .eq('key', 'adsense_config');
      } else {
        // Insert new config
        result = await supabase
          .from('site_settings')
          .insert({
            key: 'adsense_config',
            value: config
          });
      }
      
      if (result.error) throw result.error;
      
      toast.success('AdSense configuration saved successfully');
    } catch (err: any) {
      console.error('Error saving AdSense config:', err);
      toast.error('Failed to save AdSense configuration');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setConfig(prev => ({ ...prev, [name]: checked }));
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading AdSense configuration...</div>;
  }

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-6">AdSense Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Enable Advertisements</h3>
            <p className="text-gray-400 text-sm">Turn on to display ads on your website</p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => handleSwitchChange('enabled', checked)}
            aria-label="Enable ads"
          />
        </div>
        
        {config.enabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="publisher_id" className="block text-sm font-medium text-gray-300">
                  Publisher ID
                </label>
                <input
                  type="text"
                  id="publisher_id"
                  name="publisher_id"
                  value={config.publisher_id}
                  onChange={handleChange}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white"
                  placeholder="pub-1234567890123456"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="ad_client" className="block text-sm font-medium text-gray-300">
                  Ad Client
                </label>
                <input
                  type="text"
                  id="ad_client"
                  name="ad_client"
                  value={config.ad_client}
                  onChange={handleChange}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white"
                  placeholder="ca-pub-1234567890123456"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="article_ad_slot" className="block text-sm font-medium text-gray-300">
                  Article Ad Slot
                </label>
                <input
                  type="text"
                  id="article_ad_slot"
                  name="article_ad_slot"
                  value={config.article_ad_slot}
                  onChange={handleChange}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white"
                  placeholder="1234567890"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="sidebar_ad_slot" className="block text-sm font-medium text-gray-300">
                  Sidebar Ad Slot
                </label>
                <input
                  type="text"
                  id="sidebar_ad_slot"
                  name="sidebar_ad_slot"
                  value={config.sidebar_ad_slot}
                  onChange={handleChange}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white"
                  placeholder="1234567890"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="podcast_ad_slot" className="block text-sm font-medium text-gray-300">
                  Podcast Ad Slot
                </label>
                <input
                  type="text"
                  id="podcast_ad_slot"
                  name="podcast_ad_slot"
                  value={config.podcast_ad_slot}
                  onChange={handleChange}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white"
                  placeholder="1234567890"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Show Ads to Premium Users</h3>
                <p className="text-gray-400 text-sm">If enabled, premium users will also see ads</p>
              </div>
              <Switch
                checked={config.show_premium_users}
                onCheckedChange={(checked) => handleSwitchChange('show_premium_users', checked)}
                aria-label="Show ads to premium users"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Enable Auto Ads</h3>
                <p className="text-gray-400 text-sm">Let Google automatically place ads on your site</p>
              </div>
              <Switch
                checked={config.auto_ads_enabled}
                onCheckedChange={(checked) => handleSwitchChange('auto_ads_enabled', checked)}
                aria-label="Enable auto ads"
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end pt-4">
          <button
            onClick={saveAdSenseConfig}
            disabled={saving}
            className={`px-4 py-2 rounded-md ${saving ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdSenseSettings;
