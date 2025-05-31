import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, Music, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define types
interface PlaylistEpisode {
  id: string;
  title: string;
  podcast_name: string;
  image_url: string;
  audio_url: string;
  duration: string;
  published_at: string;
}

// Define database types for type safety
interface EpisodeDetails {
  id: string;
  title: string;
  image_url: string;
  audio_url: string;
  duration: string;
  pub_date: string;
  podcast_id: string;
  podcasts: {
    id: string;
    name: string;
  }[];
}

interface PlaylistEpisodeItem {
  id: string;
  episode_id: string;
  playlist_id: string;
  added_at: string;
  episode_details?: EpisodeDetails | null;
}

interface Playlist {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  episodes: PlaylistEpisode[];
}

interface PodcastPlaylistProps {
  currentPodcast?: {
    id: string;
    name: string;
  };
  currentEpisode?: {
    id: string;
    title: string;
    image_url: string;
    audio_url: string;
    duration: string;
    published_at: string;
  };
  onDashboard?: boolean;
}

const PodcastPlaylist: React.FC<PodcastPlaylistProps> = ({ 
  currentPodcast, 
  currentEpisode,
  onDashboard = false
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [savingToPlaylist, setSavingToPlaylist] = useState(false);
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);

  // Define fetchPlaylists function
  const fetchPlaylists = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      setLoading(false);
      setError('Please log in to view your playlists');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('podcast_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Now fetch episodes for each playlist
      const playlistsWithEpisodes = await Promise.all(
        (data || []).map(async (playlist) => {
          // First get the playlist episodes
          const { data: playlistEpisodesData, error: playlistEpisodesError } = await supabase
            .from('podcast_playlist_episodes')
            .select('id, episode_id, playlist_id, added_at')
            .eq('playlist_id', playlist.id)
            .order('added_at', { ascending: false });
            
          if (playlistEpisodesError) {
            console.error('Error fetching playlist episodes:', playlistEpisodesError);
            throw playlistEpisodesError;
          }
          
          // Then get the episode details for each episode_id
          const episodeIds = playlistEpisodesData?.map(item => item.episode_id) || [];
          
          let episodesData: PlaylistEpisodeItem[] = [];
          let episodesError: any = null;
          
          if (episodeIds.length > 0) {
            const { data: episodesResult, error: episodesQueryError } = await supabase
              .from('episodes')
              .select(`
                id, 
                title, 
                image_url, 
                audio_url, 
                duration, 
                pub_date,
                podcast_id,
                podcasts!inner(id, name)
              `)
              .in('id', episodeIds);
              
            const typedEpisodesResult = episodesResult as EpisodeDetails[] || [];
            episodesError = episodesQueryError;
            
            // Combine the playlist episode data with the episode details
            if (typedEpisodesResult && playlistEpisodesData) {
              episodesData = playlistEpisodesData.map(playlistEpisode => {
                const episodeDetails = typedEpisodesResult.find(ep => ep.id === playlistEpisode.episode_id);
                return { 
                  ...playlistEpisode,
                  episode_details: episodeDetails || null
                } as PlaylistEpisodeItem;
              });
            }
          }
          
          if (episodesError) {
            console.error('Error fetching playlist episodes:', episodesError);
            return {
              ...playlist,
              episodes: []
            };
          }
          
          // Transform episodes data to PlaylistEpisode objects
          const episodes: PlaylistEpisode[] = [];
          
          if (episodesData && Array.isArray(episodesData)) {
            for (const item of episodesData) {
              // Get the episode details from the combined data
              const episodeDetails = item.episode_details;
              if (!episodeDetails) continue; // Skip if no episode details
              
              // Get the podcast data from the episodes relation
              const podcast = episodeDetails.podcasts && episodeDetails.podcasts[0];
              
              const episode: PlaylistEpisode = {
                id: item.episode_id,
                title: episodeDetails.title || 'Unknown Title',
                podcast_name: podcast?.name || 'Unknown Podcast',
                image_url: episodeDetails.image_url || '',
                audio_url: episodeDetails.audio_url || '',
                duration: episodeDetails.duration || '',
                published_at: episodeDetails.pub_date || ''
              };
              episodes.push(episode);
            }
          }
          
          return {
            ...playlist,
            episodes
          };
        })
      );
      
      setPlaylists(playlistsWithEpisodes);
    } catch (err: any) {
      console.error('Error fetching playlists:', err);
      setError(err.message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch playlists on component mount
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Function to create a new playlist
  const createNewPlaylist = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: window.location.pathname } });
      return;
    }
    
    if (!newPlaylistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create new playlist
      const { data, error } = await supabase
        .from('podcast_playlists')
        .insert([
          { 
            name: newPlaylistName,
            user_id: user.id
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to state with empty episodes array
      setPlaylists([
        {
          ...data,
          episodes: []
        },
        ...playlists
      ]);
      
      // Reset form
      setNewPlaylistName('');
      setShowAddPlaylist(false);
      
      // If we're adding an episode, select the new playlist
      if (currentEpisode) {
        setSelectedPlaylist(data.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to add the current episode to a playlist
  const addToPlaylist = async (playlistId: string) => {
    if (!user || !currentEpisode || !currentPodcast) return;
    
    try {
      setSavingToPlaylist(true);
      
      // Check if episode is already in the playlist
      const { data: existingData } = await supabase
        .from('podcast_playlist_episodes')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('episode_id', currentEpisode.id);
      
      if (existingData && existingData.length > 0) {
        setError('This episode is already in the selected playlist');
        return;
      }
      
      // Add episode to playlist
      const { error: insertError } = await supabase
        .from('podcast_playlist_episodes')
        .insert([
          {
            playlist_id: playlistId,
            episode_id: currentEpisode.id,
            podcast_id: currentPodcast.id
          }
        ]);
      
      if (insertError) throw insertError;
      
      // Update playlists state
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              episodes: [
                {
                  id: currentEpisode.id,
                  title: currentEpisode.title,
                  podcast_name: currentPodcast.name,
                  image_url: currentEpisode.image_url,
                  audio_url: currentEpisode.audio_url,
                  duration: currentEpisode.duration,
                  published_at: currentEpisode.published_at
                },
                ...playlist.episodes
              ]
            };
          }
          return playlist;
        })
      );
      
      // Show success message
      setSelectedPlaylist(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add to playlist');
    } finally {
      setSavingToPlaylist(false);
    }
  };
  
  // Function to remove an episode from a playlist
  const removeFromPlaylist = async (playlistId: string, episodeId: string) => {
    if (!user) return;
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('podcast_playlist_episodes')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('episode_id', episodeId);
      
      if (error) throw error;
      
      // Update local state
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              episodes: playlist.episodes.filter(episode => episode.id !== episodeId)
            };
          }
          return playlist;
        })
      );
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove from playlist');
    }
  };
  
  // Function to delete an entire playlist
  const deletePlaylist = async (playlistId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Delete from database
      const { error } = await supabase
        .from('podcast_playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setPlaylists(prevPlaylists => 
        prevPlaylists.filter(playlist => playlist.id !== playlistId)
      );
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete playlist');
    } finally {
      setLoading(false);
    }
  };

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full mr-2"></div>
      <span className="text-gray-400">Loading...</span>
    </div>
  );

  // Render different UI based on context
  if (!user && !onDashboard) {
    return (
      <div className="bg-dark-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Your Playlists</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Please <button 
            onClick={() => navigate('/login', { state: { returnTo: window.location.pathname } })}
            className="text-accent-500 hover:underline"
          >
            log in
          </button> to view and manage your playlists.
        </p>
      </div>
    );
  }

  if (onDashboard) {
    // Dashboard view (full playlist management)
    return (
      <div className="bg-dark-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Your Playlists</h3>
          <button
            onClick={() => setShowAddPlaylist(true)}
            className="text-sm bg-accent-600 hover:bg-accent-700 text-white px-3 py-1 rounded-md flex items-center transition-colors"
          >
            <Plus size={16} className="mr-1" />
            New Playlist
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-100 rounded-md p-3 mb-4">
            {error}
          </div>
        )}
        
        {showAddPlaylist && (
          <div className="mb-4 p-3 bg-dark-700 rounded-md">
            <h4 className="text-white font-medium mb-2">Create New Playlist</h4>
            <div className="flex">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="flex-1 bg-dark-600 border border-dark-500 text-white px-3 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
              <button
                onClick={createNewPlaylist}
                disabled={loading}
                className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-r-md disabled:opacity-50 transition-colors"
              >
                <Save size={16} />
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <LoadingIndicator />
        ) : playlists.length === 0 ? (
          <div className="text-center py-8">
            <Music size={40} className="mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">You don't have any playlists yet.</p>
            <button
              onClick={() => setShowAddPlaylist(true)}
              className="mt-3 text-sm bg-accent-600 hover:bg-accent-700 text-white px-3 py-1 rounded-md inline-flex items-center transition-colors"
            >
              <Plus size={16} className="mr-1" />
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map(playlist => (
              <div key={playlist.id} className="bg-dark-700 rounded-md overflow-hidden">
                <div 
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-dark-600 transition-colors"
                  onClick={() => setExpandedPlaylist(expandedPlaylist === playlist.id ? null : playlist.id)}
                >
                  <div>
                    <h4 className="text-white font-medium">{playlist.name}</h4>
                    <p className="text-gray-400 text-sm">{playlist.episodes.length} episodes</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(playlist.id);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                      aria-label={`Delete ${playlist.name} playlist`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {expandedPlaylist === playlist.id && (
                  <div className="border-t border-dark-500">
                    {playlist.episodes.length === 0 ? (
                      <p className="text-gray-400 text-sm p-3">No episodes in this playlist yet.</p>
                    ) : (
                      <ul className="divide-y divide-dark-500">
                        {playlist.episodes.map(episode => (
                          <li key={episode.id} className="flex items-center p-3 hover:bg-dark-600 transition-colors">
                            <div className="flex-shrink-0 w-10 h-10 mr-3">
                              {episode.image_url ? (
                                <img 
                                  src={episode.image_url} 
                                  alt={episode.title} 
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full bg-dark-500 rounded flex items-center justify-center">
                                  <Music size={16} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-white text-sm font-medium truncate">{episode.title}</h5>
                              <p className="text-gray-400 text-xs truncate">{episode.podcast_name}</p>
                            </div>
                            <button
                              onClick={() => removeFromPlaylist(playlist.id, episode.id)}
                              className="text-red-400 hover:text-red-300 ml-2 p-1"
                              aria-label={`Remove ${episode.title} from playlist`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Detail page view (add to playlist)
  return (
    <div className="bg-dark-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Save to Playlist</h3>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
      {!selectedPlaylist ? (
        <>
          {showAddPlaylist ? (
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="flex-1 bg-dark-700 border border-dark-600 text-white px-3 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
                <button
                  onClick={createNewPlaylist}
                  disabled={loading || !newPlaylistName.trim()}
                  className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-r-md disabled:opacity-50 transition-colors"
                >
                  <Save size={16} />
                </button>
              </div>
              <button
                onClick={() => setShowAddPlaylist(false)}
                className="text-gray-400 hover:text-white text-sm mt-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {loading ? (
                <LoadingIndicator />
              ) : playlists.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-2">You don't have any playlists yet.</p>
                  <button
                    onClick={() => setShowAddPlaylist(true)}
                    className="text-sm bg-accent-600 hover:bg-accent-700 text-white px-3 py-1 rounded-md inline-flex items-center transition-colors"
                  >
                    <Plus size={16} className="mr-1" />
                    Create Playlist
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => addToPlaylist(playlist.id)}
                      disabled={savingToPlaylist}
                      className="w-full text-left p-2 rounded-md bg-dark-700 hover:bg-dark-600 text-white flex items-center justify-between transition-colors"
                    >
                      <span>{playlist.name}</span>
                      <span className="text-gray-400 text-sm">{playlist.episodes.length} episodes</span>
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setShowAddPlaylist(true)}
                    className="w-full mt-3 p-2 rounded-md border border-dashed border-dark-500 hover:border-accent-500 text-gray-400 hover:text-accent-500 flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} className="mr-1" />
                    Create New Playlist
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          {savingToPlaylist ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full mr-2"></div>
              <span className="text-gray-400">Adding to playlist...</span>
            </div>
          ) : (
            <>
              <div className="bg-green-900/20 border border-green-800 text-green-100 rounded-md p-3 mb-4">
                Episode added to playlist successfully!
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-accent-500 hover:text-accent-400"
              >
                Add to another playlist
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PodcastPlaylist;
