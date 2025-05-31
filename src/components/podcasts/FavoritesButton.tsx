import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';

interface FavoritesButtonProps {
  podcastId: string;
  onFavoriteChange?: (isFavorited: boolean) => void;
  className?: string;
}

const FavoritesButton: React.FC<FavoritesButtonProps> = ({ 
  podcastId, 
  onFavoriteChange,
  className = '' 
}) => {
  const { user } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !podcastId) return;
    
    try {
      const { data, error } = await supabase
        .from('podcast_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('podcast_id', podcastId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite status:', error);
        return;
      }
      
      setIsFavorited(!!data);
      if (onFavoriteChange) onFavoriteChange(!!data);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  }, [user, podcastId, onFavoriteChange]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!user) {
      // Prompt user to login
      alert('Please log in to favorite podcasts');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('podcast_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('podcast_id', podcastId);
        
        if (error) throw error;
        
        setIsFavorited(false);
        if (onFavoriteChange) onFavoriteChange(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('podcast_favorites')
          .insert({
            user_id: user.id,
            podcast_id: podcastId
          });
        
        if (error) throw error;
        
        setIsFavorited(true);
        if (onFavoriteChange) onFavoriteChange(true);
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`transition-colors ${className}`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`transition-all ${isFavorited 
          ? 'text-red-500 fill-red-500' 
          : 'text-gray-400 hover:text-red-500'}`}
        size={24}
      />
    </button>
  );
};

export default FavoritesButton;
