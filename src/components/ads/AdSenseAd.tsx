import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Add interface for auth context until we create the actual context
interface AuthContextValue {
  user: any;
  profile: {
    is_premium?: boolean;
  } | null;
}

// Temporary hook until we implement the actual auth context
const useAuth = (): AuthContextValue => {
  // This is a placeholder. Replace with actual implementation.
  return {
    user: null,
    profile: null
  };
};

interface AdSenseAdProps {
  slot: 'article' | 'sidebar' | 'podcast';
  className?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
}

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

const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  slot, 
  className = '', 
  format = 'auto' 
}) => {
  const { profile } = useAuth();
  const [adConfig, setAdConfig] = useState<AdSenseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldShowAd, setShouldShowAd] = useState(false);
  // Use any type for the ref to avoid TypeScript errors with the ins element
  const adRef = useRef<any>(null);
  
  useEffect(() => {
    fetchAdSenseConfig();
  }, []);
  
  useEffect(() => {
    if (adConfig && adRef.current && shouldShowAd) {
      // Initialize the ad after the component mounts and config is loaded
      try {
        // Add type definition for adsbygoogle
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (error) {
        console.error('Error initializing AdSense ad:', error);
      }
    }
  }, [adConfig, shouldShowAd]);
  
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
        const config = data.value as AdSenseConfig;
        setAdConfig(config);
        
        // Determine if we should show the ad based on user premium status and config
        const isPremium = profile?.is_premium || false;
        const showAd = config.enabled && (!isPremium || config.show_premium_users);
        setShouldShowAd(showAd);
        
        // If auto ads are enabled and this is the first ad on the page, load the script
        if (config.enabled && config.auto_ads_enabled && !document.querySelector('script[src*="adsbygoogle"]')) {
          loadAdSenseScript(config.ad_client);
        }
      } else {
        setShouldShowAd(false);
      }
    } catch (err) {
      console.error('Error fetching AdSense config:', err);
      setShouldShowAd(false);
    } finally {
      setLoading(false);
    }
  };
  
  const loadAdSenseScript = (adClient: string) => {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  };
  
  // Don't render anything if we're still loading or shouldn't show ads
  if (loading || !shouldShowAd || !adConfig) {
    return null;
  }
  
  // Get the appropriate ad slot based on the slot prop
  let adSlot = '';
  switch (slot) {
    case 'article':
      adSlot = adConfig.article_ad_slot;
      break;
    case 'sidebar':
      adSlot = adConfig.sidebar_ad_slot;
      break;
    case 'podcast':
      adSlot = adConfig.podcast_ad_slot;
      break;
  }
  
  if (!adSlot) {
    return null; // Don't render if no slot is configured
  }
  
  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adConfig.ad_client}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
        ref={adRef}
      />
    </div>
  );
};

export default AdSenseAd;
