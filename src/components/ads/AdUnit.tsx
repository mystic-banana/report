import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdSenseAd from './AdSenseAd';

interface AdUnitProps {
  placement: 'article' | 'sidebar' | 'podcast';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ placement, className }) => {
  const [showAd, setShowAd] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkUserPremiumStatus();
  }, []);

  const checkUserPremiumStatus = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No logged in user, show ads
        setShowAd(true);
        return;
      }
      
      // Get user profile to check premium status
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        // On error, default to showing ads
        setShowAd(true);
        return;
      }
      
      // Check if user is premium - if they are, don't show ads
      setShowAd(!profile?.is_premium);
    } catch (err) {
      console.error('Error checking premium status:', err);
      setShowAd(true);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return null; // Don't render anything while loading
  }
  
  if (!showAd) {
    return null; // Don't render ad for premium users
  }
  
  return (
    <div className={`ad-unit ${className || ''}`}>
      <AdSenseAd slot={placement} />
    </div>
  );
};

export default AdUnit;
