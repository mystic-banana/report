import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Save, Info, AlertTriangle, Shield, Eye, EyeOff } from "lucide-react";
import { useAdminSecurity } from "../AdminSecurityProvider";

interface AdSenseConfig {
  enabled: boolean;
  publisher_id: string;
  ad_client: string;
  article_ad_slot: string;
  sidebar_ad_slot: string;
  podcast_ad_slot: string;
  show_premium_users: boolean;
  auto_ads_enabled: boolean;
  revenue_sharing_enabled: boolean;
  revenue_share_percentage: number;
  minimum_payout: number;
  ad_placement_rules: {
    max_ads_per_page: number;
    min_content_length: number;
    exclude_categories: string[];
  };
  performance_tracking: {
    track_clicks: boolean;
    track_impressions: boolean;
    track_revenue: boolean;
  };
}

const AdSenseSettings: React.FC = () => {
  const { logAdminAction, hasPermission } = useAdminSecurity();
  const [config, setConfig] = useState<AdSenseConfig>({
    enabled: false,
    publisher_id: "",
    ad_client: "",
    article_ad_slot: "",
    sidebar_ad_slot: "",
    podcast_ad_slot: "",
    show_premium_users: false,
    auto_ads_enabled: false,
    revenue_sharing_enabled: false,
    revenue_share_percentage: 70,
    minimum_payout: 100,
    ad_placement_rules: {
      max_ads_per_page: 3,
      min_content_length: 500,
      exclude_categories: [],
    },
    performance_tracking: {
      track_clicks: true,
      track_impressions: true,
      track_revenue: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [adPerformance, setAdPerformance] = useState<any>(null);

  useEffect(() => {
    fetchAdSenseConfig();
  }, []);

  const fetchAdSenseConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "adsense_config")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        // Merge fetched data with default config to ensure all properties exist
        const fetchedConfig = data.value as Partial<AdSenseConfig>;
        setConfig({
          enabled: fetchedConfig.enabled ?? false,
          publisher_id: fetchedConfig.publisher_id ?? "",
          ad_client: fetchedConfig.ad_client ?? "",
          article_ad_slot: fetchedConfig.article_ad_slot ?? "",
          sidebar_ad_slot: fetchedConfig.sidebar_ad_slot ?? "",
          podcast_ad_slot: fetchedConfig.podcast_ad_slot ?? "",
          show_premium_users: fetchedConfig.show_premium_users ?? false,
          auto_ads_enabled: fetchedConfig.auto_ads_enabled ?? false,
          revenue_sharing_enabled:
            fetchedConfig.revenue_sharing_enabled ?? false,
          revenue_share_percentage:
            fetchedConfig.revenue_share_percentage ?? 70,
          minimum_payout: fetchedConfig.minimum_payout ?? 100,
          ad_placement_rules: {
            max_ads_per_page:
              fetchedConfig.ad_placement_rules?.max_ads_per_page || 3,
            min_content_length:
              fetchedConfig.ad_placement_rules?.min_content_length || 500,
            exclude_categories:
              fetchedConfig.ad_placement_rules?.exclude_categories ?? [],
          },
          performance_tracking: {
            track_clicks:
              fetchedConfig.performance_tracking?.track_clicks ?? true,
            track_impressions:
              fetchedConfig.performance_tracking?.track_impressions ?? true,
            track_revenue:
              fetchedConfig.performance_tracking?.track_revenue ?? true,
          },
        });
      }
    } catch (err: any) {
      console.error("Error fetching AdSense config:", err);
      setError("Failed to load AdSense configuration");
    } finally {
      setLoading(false);
    }
  };

  const validateConfig = (): string[] => {
    const errors: string[] = [];

    if (config.enabled) {
      if (!config.publisher_id.match(/^pub-\d+$/)) {
        errors.push('Publisher ID should be in the format "pub-1234567890"');
      }

      if (!config.ad_client.match(/^ca-pub-\d+$/)) {
        errors.push('Ad Client should be in the format "ca-pub-1234567890"');
      }

      if (config.revenue_sharing_enabled) {
        if (
          config.revenue_share_percentage < 0 ||
          config.revenue_share_percentage > 100
        ) {
          errors.push("Revenue share percentage must be between 0 and 100");
        }

        if (config.minimum_payout < 10) {
          errors.push("Minimum payout must be at least $10");
        }
      }

      // Add null check for ad_placement_rules
      if (config.ad_placement_rules) {
        if (
          config.ad_placement_rules.max_ads_per_page < 1 ||
          config.ad_placement_rules.max_ads_per_page > 10
        ) {
          errors.push("Maximum ads per page must be between 1 and 10");
        }
      }
    }

    return errors;
  };

  const saveAdSenseConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      setValidationErrors([]);

      // Validate configuration
      const errors = validateConfig();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setSaving(false);
        return;
      }

      // Check if config already exists
      const { data: existingConfig, error: checkError } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "adsense_config")
        .single();

      let result;

      if (existingConfig) {
        // Update existing config
        result = await supabase
          .from("site_settings")
          .update({
            value: config,
            updated_at: new Date().toISOString(),
          })
          .eq("key", "adsense_config");
      } else {
        // Insert new config
        result = await supabase.from("site_settings").insert({
          key: "adsense_config",
          value: config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      if (result.error) throw result.error;

      // Log admin action
      await logAdminAction(
        "update_adsense_settings",
        "settings",
        "adsense_config",
        { enabled: config.enabled, publisher_id: config.publisher_id },
      );

      setSuccess("AdSense configuration saved successfully");
    } catch (err: any) {
      console.error("Error saving AdSense config:", err);
      setError(err.message || "Failed to save AdSense configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      // Handle nested object properties
      const [parent, child] = name.split(".");
      setConfig({
        ...config,
        [parent]: {
          ...((config as any)[parent] || {}),
          [child]:
            type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : type === "number"
                ? parseFloat(value) || 0
                : value,
        },
      });
    } else {
      setConfig({
        ...config,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : type === "number"
              ? parseFloat(value) || 0
              : value,
      });
    }
  };

  const fetchAdPerformance = async () => {
    if (!config.enabled || !config.publisher_id) return;

    try {
      // This would integrate with AdSense API in production
      // For now, we'll simulate performance data
      setAdPerformance({
        impressions: 12500,
        clicks: 89,
        ctr: 0.71,
        revenue: 45.67,
        rpm: 3.65,
      });
    } catch (error) {
      console.error("Failed to fetch ad performance:", error);
    }
  };

  useEffect(() => {
    if (config.enabled) {
      fetchAdPerformance();
    }
  }, [config.enabled, config.publisher_id]);

  if (!hasPermission("manage:adsense")) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
        <p className="text-gray-400">
          You don't have permission to manage AdSense settings.
        </p>
      </div>
    );
  }

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
        <h2 className="text-2xl font-semibold text-white">
          Google AdSense Settings
        </h2>
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
          <AlertTriangle
            size={20}
            className="text-red-400 mr-2 mt-0.5 flex-shrink-0"
          />
          <p className="text-white">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 bg-green-900/30 border border-green-800 rounded-md">
          <p className="text-white">{success}</p>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="p-4 mb-6 bg-yellow-900/30 border border-yellow-800 rounded-md">
          <h4 className="text-yellow-400 font-medium mb-2">
            Validation Errors:
          </h4>
          <ul className="list-disc list-inside text-yellow-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
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
          <label
            htmlFor="publisher_id"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
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
          <label
            htmlFor="ad_client"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
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
            <label
              htmlFor="article_ad_slot"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
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
            <p className="mt-1 text-sm text-gray-400">Ad slot for articles</p>
          </div>

          <div>
            <label
              htmlFor="sidebar_ad_slot"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
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
            <p className="mt-1 text-sm text-gray-400">Ad slot for sidebar</p>
          </div>

          <div>
            <label
              htmlFor="podcast_ad_slot"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
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
          <label
            htmlFor="auto_ads_enabled"
            className="ml-2 text-white font-medium"
          >
            Enable Auto Ads
          </label>
          <div className="ml-2 group relative">
            <Info size={16} className="text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-600 rounded-md shadow-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Auto ads automatically place ads at optimal positions on your
              pages for better revenue.
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
          <label
            htmlFor="show_premium_users"
            className="ml-2 text-white font-medium"
          >
            Show Ads to Premium Users
          </label>
          <div className="ml-2 group relative">
            <Info size={16} className="text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-600 rounded-md shadow-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              By default, premium users won't see ads. Enable this to show ads
              to all users regardless of subscription status.
            </div>
          </div>
        </div>

        {/* Revenue Sharing Settings */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="revenue_sharing_enabled"
            name="revenue_sharing_enabled"
            checked={config.revenue_sharing_enabled}
            onChange={handleChange}
            className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
          />
          <label
            htmlFor="revenue_sharing_enabled"
            className="ml-2 text-white font-medium"
          >
            Enable Revenue Sharing
          </label>
        </div>

        {config.revenue_sharing_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="revenue_share_percentage"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Revenue Share Percentage (%)
              </label>
              <input
                type="number"
                id="revenue_share_percentage"
                name="revenue_share_percentage"
                value={config.revenue_share_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            <div>
              <label
                htmlFor="minimum_payout"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Minimum Payout ($)
              </label>
              <input
                type="number"
                id="minimum_payout"
                name="minimum_payout"
                value={config.minimum_payout}
                onChange={handleChange}
                min="10"
                className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>
        )}

        {/* Ad Placement Rules */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-4">
            Ad Placement Rules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ad_placement_rules.max_ads_per_page"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Max Ads Per Page
              </label>
              <input
                type="number"
                id="ad_placement_rules.max_ads_per_page"
                name="ad_placement_rules.max_ads_per_page"
                value={config.ad_placement_rules?.max_ads_per_page || 3}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            <div>
              <label
                htmlFor="ad_placement_rules.min_content_length"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Min Content Length (words)
              </label>
              <input
                type="number"
                id="ad_placement_rules.min_content_length"
                name="ad_placement_rules.min_content_length"
                value={config.ad_placement_rules?.min_content_length || 500}
                onChange={handleChange}
                min="100"
                className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>
        </div>

        {/* Performance Tracking */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-4">
            Performance Tracking
          </h4>
          <div className="space-y-3">
            {Object.entries(config.performance_tracking || {}).map(
              ([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`performance_tracking.${key}`}
                    name={`performance_tracking.${key}`}
                    checked={value}
                    onChange={handleChange}
                    className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
                  />
                  <label
                    htmlFor={`performance_tracking.${key}`}
                    className="ml-2 text-white font-medium capitalize"
                  >
                    Track {key.replace("_", " ")}
                  </label>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Performance Dashboard */}
        {config.enabled && adPerformance && (
          <div className="mb-6 p-4 bg-dark-700 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-4">
              Ad Performance (Last 30 Days)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-400">
                  {adPerformance.impressions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Impressions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-400">
                  {adPerformance.clicks}
                </div>
                <div className="text-sm text-gray-400">Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-400">
                  {adPerformance.ctr}%
                </div>
                <div className="text-sm text-gray-400">CTR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  ${adPerformance.revenue}
                </div>
                <div className="text-sm text-gray-400">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  ${adPerformance.rpm}
                </div>
                <div className="text-sm text-gray-400">RPM</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-dark-700 rounded-md mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-white">
              AdSense Code Preview
            </h3>
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="flex items-center px-3 py-1 bg-dark-600 hover:bg-dark-500 rounded text-gray-300 hover:text-white transition-colors"
            >
              {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="ml-1">{showSecrets ? "Hide" : "Show"} IDs</span>
            </button>
          </div>
          <div className="bg-dark-900 p-3 rounded-md">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap">
              {`<!-- Google AdSense Code -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${showSecrets ? config.ad_client || "ca-pub-xxxxxxxxxxxxxxxx" : "ca-pub-xxxxxxxxxxxxxxxx"}"
     crossorigin="anonymous"></script>
${
  config.auto_ads_enabled
    ? `<!-- Auto ads code -->
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    : ""
}

<!-- Example of an ad unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${showSecrets ? config.ad_client || "ca-pub-xxxxxxxxxxxxxxxx" : "ca-pub-xxxxxxxxxxxxxxxx"}"
     data-ad-slot="${showSecrets ? config.article_ad_slot || "xxxxxxxxxx" : "xxxxxxxxxx"}"
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
