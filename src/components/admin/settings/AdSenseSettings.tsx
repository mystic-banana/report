import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Save, Info, AlertTriangle } from 'lucide-react';

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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAdSenseConfig();
  }, []);
  
  const fetchAdSenseConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError('Failed to load AdSense configuration');
    } finally {
      setLoading(false);
    }
  };
  
  const saveAdSenseConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate publisher ID format
      if (config.enabled && !config.publisher_id.match(/^pub-\d+$/)) {
        setError('Publisher ID should be in the format "pub-1234567890"');
        return;
      }
      
      // Check if config already exists
      const { data: existingConfig, error: checkError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'adsense_config')
        .single();
      
      let result;
      
      if (existingConfig) {
        // Update existing config
        result = await supabase
          .from('site_settings')
          .update({ 
            value: config,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'adsense_config');
      } else {
        // Insert new config
        result = await supabase
          .from('site_settings')
          .insert({
            key: 'adsense_config',
            value: config,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) throw result.error;
      
      setSuccess('AdSense configuration saved successfully');
    } catch (err: any) {
      console.error('Error saving AdSense config:', err);
      setError(err.message || 'Failed to save AdSense configuration');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setConfig({
      ...config,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Google AdSense Settings</h2>
        <button
          onClick={saveAdSenseConfig}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-md flex items-start">
          <AlertTriangle size={20} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-white">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 bg-green-900/30 border border-green-800 rounded-md">
          <p className="text-white">{success}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={config.enabled}
            onChange={handleChange}
            className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
          />
          <label htmlFor="enabled" className="ml-2 text-white font-medium">
            Enable AdSense
          </label>
        </div>
        
        <div>
          <label htmlFor="publisher_id" className="block text-sm font-medium text-gray-300 mb-1">
            Publisher ID
          </label>
          <input
            type="text"
            id="publisher_id"
            name="publisher_id"
            value={config.publisher_id}
            onChange={handleChange}
            placeholder="pub-1234567890"
            className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <p className="mt-1 text-sm text-gray-400">
            Your AdSense Publisher ID (e.g., pub-1234567890)
          </p>
        </div>
        
        <div>
          <label htmlFor="ad_client" className="block text-sm font-medium text-gray-300 mb-1">
            Ad Client
          </label>
          <input
            type="text"
            id="ad_client"
            name="ad_client"
            value={config.ad_client}
            onChange={handleChange}
            placeholder="ca-pub-1234567890"
            className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <p className="mt-1 text-sm text-gray-400">
            Your AdSense Ad Client ID (e.g., ca-pub-1234567890)
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="article_ad_slot" className="block text-sm font-medium text-gray-300 mb-1">
              Article Ad Slot
            </label>
            <input
              type="text"
              id="article_ad_slot"
              name="article_ad_slot"
              value={config.article_ad_slot}
              onChange={handleChange}
              placeholder="1234567890"
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <p className="mt-1 text-sm text-gray-400">
              Ad slot for articles
            </p>
          </div>
          
          <div>
            <label htmlFor="sidebar_ad_slot" className="block text-sm font-medium text-gray-300 mb-1">
              Sidebar Ad Slot
            </label>
            <input
              type="text"
              id="sidebar_ad_slot"
              name="sidebar_ad_slot"
              value={config.sidebar_ad_slot}
              onChange={handleChange}
              placeholder="1234567890"
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <p className="mt-1 text-sm text-gray-400">
              Ad slot for sidebar
            </p>
          </div>
          
          <div>
            <label htmlFor="podcast_ad_slot" className="block text-sm font-medium text-gray-300 mb-1">
              Podcast Ad Slot
            </label>
            <input
              type="text"
              id="podcast_ad_slot"
              name="podcast_ad_slot"
              value={config.podcast_ad_slot}
              onChange={handleChange}
              placeholder="1234567890"
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <p className="mt-1 text-sm text-gray-400">
              Ad slot for podcast pages
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="auto_ads_enabled"
            name="auto_ads_enabled"
            checked={config.auto_ads_enabled}
            onChange={handleChange}
            className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
          />
          <label htmlFor="auto_ads_enabled" className="ml-2 text-white font-medium">
            Enable Auto Ads
          </label>
          <div className="ml-2 group relative">
            <Info size={16} className="text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-600 rounded-md shadow-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Auto ads automatically place ads at optimal positions on your pages for better revenue.
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="show_premium_users"
            name="show_premium_users"
            checked={config.show_premium_users}
            onChange={handleChange}
            className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
          />
          <label htmlFor="show_premium_users" className="ml-2 text-white font-medium">
            Show Ads to Premium Users
          </label>
          <div className="ml-2 group relative">
            <Info size={16} className="text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-600 rounded-md shadow-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              By default, premium users won't see ads. Enable this to show ads to all users regardless of subscription status.
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-dark-700 rounded-md mt-6">
          <h3 className="text-lg font-medium text-white mb-2">AdSense Code Preview</h3>
          <div className="bg-dark-900 p-3 rounded-md">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap">
{`<!-- Google AdSense Code -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.ad_client || 'ca-pub-xxxxxxxxxxxxxxxx'}"
     crossorigin="anonymous"></script>
${config.auto_ads_enabled ? `<!-- Auto ads code -->
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>` : ''}

<!-- Example of an ad unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${config.ad_client || 'ca-pub-xxxxxxxxxxxxxxxx'}"
     data-ad-slot="${config.article_ad_slot || 'xxxxxxxxxx'}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSenseSettings;
