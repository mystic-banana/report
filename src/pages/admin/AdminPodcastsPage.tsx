import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PodcastFeed, PodcastCategory } from '../../types';
import { Trash2, Plus, RefreshCw, ExternalLink, Grid, List, ChevronDown, ChevronUp } from 'lucide-react';
import PodcastCategoryManager from '../../components/admin/PodcastCategoryManager';
import { fetchEpisodesForPodcast } from '../../utils/fetchEpisodes';

const AdminPodcastsPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<PodcastFeed[]>([]);
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [addingFeed, setAddingFeed] = useState(false);
  const [addFeedError, setAddFeedError] = useState<string | null>(null);
  const [addFeedSuccess, setAddFeedSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Fetch podcasts and categories on component mount
  useEffect(() => {
    fetchPodcasts();
    fetchCategories();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all podcasts
      const { data: podcastsData, error: podcastsError } = await supabase
        .from('podcasts')
        .select('*')
        .order('name');
      
      if (podcastsError) throw podcastsError;
      
      // Try to get categories, but handle the case where the table doesn't exist
      let categoryMap: Record<string, string> = {};
      
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('podcast_categories')
          .select('*');
          
        if (!categoriesError && categoriesData) {
          // Create a map of category IDs to names for quick lookup
          categoriesData.forEach(category => {
            categoryMap[category.id] = category.name;
          });
        }
      } catch (err) {
        console.log('Error fetching categories, using fallback');
        // Use fallback temp categories
        categoryMap = {
          'temp-tech': 'Technology',
          'temp-business': 'Business',
          'temp-science': 'Science',
          'temp-entertainment': 'Entertainment',
          'temp-health': 'Health'
        };
      }
      
      // Map the data to include the category name
      const podcastsWithCategories = podcastsData?.map(podcast => ({
        ...podcast,
        category_name: podcast.category_id && categoryMap[podcast.category_id] 
          ? categoryMap[podcast.category_id] 
          : 'Uncategorized'
      })) || [];
      
      setPodcasts(podcastsWithCategories);
    } catch (err: any) {
      console.error('Error fetching podcasts:', err);
      setError(err.message || 'Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      // Create a temporary set of categories until the table is created
      const tempCategories = [
        { id: 'temp-tech', name: 'Technology', description: 'Tech-related podcasts', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-business', name: 'Business', description: 'Business and entrepreneurship', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-science', name: 'Science', description: 'Science and research', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-entertainment', name: 'Entertainment', description: 'Entertainment and pop culture', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-health', name: 'Health', description: 'Health and wellness', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ];
      
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('podcast_categories')
        .select('*')
        .order('name');
      
      // If there's an error about the table not existing, use temp categories
      if (error && error.message.includes('does not exist')) {
        console.log('Using temporary categories until podcast_categories table is created');
        setCategories(tempCategories);
        return;
      }
      
      // If there's another error, throw it
      if (error) throw error;
      
      // If we got data, use it
      setCategories(data || tempCategories);
    } catch (err: any) {
      console.error('Error fetching podcast categories:', err);
      // Don't set the main error state for this, as it's not critical
      // Use temporary categories as fallback
      setCategories([
        { id: 'temp-tech', name: 'Technology', description: 'Tech-related podcasts', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-business', name: 'Business', description: 'Business and entrepreneurship', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-science', name: 'Science', description: 'Science and research', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-entertainment', name: 'Entertainment', description: 'Entertainment and pop culture', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'temp-health', name: 'Health', description: 'Health and wellness', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]);
    }
  };

  const handleAddPodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl) {
      setAddFeedError('Please enter a feed URL');
      return;
    }
    if (!selectedCategoryId) {
      setAddFeedError('Please select a category');
      return;
    }
    
    try {
      setAddingFeed(true);
      setAddFeedError(null);
      setAddFeedSuccess(null);
      
      console.log('Adding podcast with category ID:', selectedCategoryId);
      
      // Use direct Supabase call instead of edge function to process the feed
      // This will avoid token expiration issues
      const { data: { user } } = await supabase.auth.getUser();
      const { data: podcastData, error: podcastError } = await supabase
        .from('podcasts')
        .insert({
          feed_url: newFeedUrl,
          category_id: selectedCategoryId,
          submitter_id: user?.id || null, // Set submitter_id for admin auto-approval
          category: selectedCategoryId, // Add the category field to satisfy the not-null constraint
          name: 'Loading...',  // Will be updated with actual data once processed
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (podcastError) throw podcastError;
      
      // Podcast inserted, show success and reset form instantly
      setAddFeedSuccess('Podcast added! Episodes will appear soon.');
      setNewFeedUrl('');
      fetchPodcasts();
      setTimeout(() => setAddFeedSuccess(null), 5000);
      
      // Trigger episode fetch and metadata update in the background (do not await, non-blocking)
      if (podcastData && podcastData.id && podcastData.feed_url) {
        setTimeout(() => {
          void fetchEpisodesForPodcast(podcastData.id, podcastData.feed_url);
        }, 0);
      }
      
    } catch (err: any) {
      console.error('Error adding podcast:', err);
      setAddFeedError(err.message || 'Failed to add podcast');
    } finally {
      setAddingFeed(false);
    }
  };

  const handleDeletePodcast = async (podcastId: string) => {
    if (!confirm('Are you sure you want to delete this podcast? This will permanently remove the podcast and all associated episodes from the database.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Find the podcast to show feedback about what we're deleting
      const podcast = podcasts.find(p => p.id === podcastId);
      const podcastName = podcast ? podcast.name : 'Unknown podcast';
      
      // First, get count of episodes to be deleted for verification
      const { count: episodeCount, error: countError } = await supabase
        .from('episodes')
        .select('id', { count: 'exact', head: true })
        .eq('podcast_id', podcastId);
        
      if (countError) {
        console.error('Error counting episodes:', countError);
        // Continue with deletion even if count fails
      } else {
        console.log(`Deleting podcast ${podcastName} with ${episodeCount || 0} episodes`);
      }
      
      // Start a transaction by using RPC if available, otherwise do separate calls
      // First delete all episodes for this podcast
      const { error: episodesError } = await supabase
        .from('episodes')
        .delete()
        .eq('podcast_id', podcastId);
      
      if (episodesError) {
        console.error('Error deleting episodes:', episodesError);
        throw new Error(`Failed to delete episodes: ${episodesError.message}`);
      }
      
      // Then delete the podcast
      const { error: podcastError } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastId);
      
      if (podcastError) {
        console.error('Error deleting podcast:', podcastError);
        throw new Error(`Failed to delete podcast: ${podcastError.message}`);
      }
      
      // Verify deletion by checking if podcast still exists
      const { data: checkData } = await supabase
        .from('podcasts')
        .select('id')
        .eq('id', podcastId)
        .single();
      
      if (checkData) {
        console.warn('Podcast still exists after deletion attempt');
        throw new Error('Failed to delete podcast completely. Please try again.');
      }
      
      // Success message
      setAddFeedSuccess(`Successfully deleted "${podcastName}" and all associated episodes.`);
      
      // Set a timeout to clear the success message after 5 seconds
      setTimeout(() => {
        setAddFeedSuccess(null);
      }, 5000);
      
      // Refresh the podcast list
      fetchPodcasts();
      
    } catch (err: any) {
      console.error('Error deleting podcast:', err);
      setError(err.message || 'Failed to delete podcast');
    } finally {
      setLoading(false);
    }
  };

  // Toggle category manager visibility
  const toggleCategoryManager = () => {
    setShowCategoryManager(!showCategoryManager);
  };
  
  // Filter podcasts by category ID
  const filteredPodcasts = filterCategory === 'all' 
    ? podcasts 
    : podcasts.filter((podcast: PodcastFeed) => {
        return podcast.category_id === filterCategory;
      });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Podcasts</h1>
        <div className="flex space-x-3">
          <button
            onClick={toggleCategoryManager}
            className="flex items-center px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-md text-white transition-colors"
          >
            {showCategoryManager ? (
              <>
                <ChevronUp size={16} className="mr-2" />
                Hide Categories
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-2" />
                Manage Categories
              </>
            )}
          </button>
          <button
            onClick={fetchPodcasts}
            className="flex items-center px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-md text-white transition-colors"
            title="Refresh podcast list"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Category Manager (collapsible) */}
      {showCategoryManager && <PodcastCategoryManager onCategoriesChange={setCategories} />}
      
      {/* Add podcast form */}
      <div className="bg-dark-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Podcast</h2>
        <form onSubmit={handleAddPodcast} className="space-y-4">
          <div>
            <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-300 mb-1">Feed URL</label>
            <input
              id="feedUrl"
              type="url"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              disabled={addingFeed}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              disabled={addingFeed}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {addFeedError && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-md">
              <p className="text-white text-sm">{addFeedError}</p>
            </div>
          )}
          
          {addFeedSuccess && (
            <div className="p-3 bg-green-900/30 border border-green-800 rounded-md">
              <p className="text-white text-sm">
              {addFeedSuccess}
            </p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={addingFeed}
            className="flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingFeed ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Add Podcast
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Podcast list controls */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <span className="text-gray-300">View:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'}`}
            title="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'}`}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Filter:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-md">
          <p className="text-white">{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="w-10 h-10 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Podcasts list */}
      {!loading && filteredPodcasts.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">
            {filterCategory !== 'all' 
              ? 'No podcasts found in this category.' 
              : 'No podcasts found. Add your first podcast using the form above.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPodcasts.map((podcast) => (
            <div key={podcast.id} className="bg-dark-800 rounded-lg overflow-hidden h-full flex flex-col">
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  {podcast.image_url ? (
                    <img 
                      src={podcast.image_url} 
                      alt={podcast.name} 
                      className="w-32 h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-dark-700 rounded flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-2">
                  <h3 className="text-lg font-semibold text-white truncate">{podcast.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{podcast.author || 'Unknown author'}</p>
                </div>
                
                <div className="flex justify-center mb-3">
                  <span className="inline-block px-2 py-1 text-xs bg-accent-900/30 text-accent-400 rounded">
                    {podcast.category_name || 'Uncategorized'}
                  </span>
                </div>
                
                {podcast.description && (
                  <p className="text-gray-300 text-sm line-clamp-2 text-center mb-3">{podcast.description}</p>
                )}
              </div>
              
              <div className="mt-auto p-4 pt-0 flex justify-between items-center border-t border-dark-700">
                <span className="text-xs text-gray-400">
                  {new Date(podcast.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <a 
                    href={podcast.feed_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded text-gray-300 hover:text-white transition-colors"
                    title="Open feed URL"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button 
                    onClick={() => handleDeletePodcast(podcast.id)}
                    className="p-1.5 bg-dark-700 hover:bg-red-900 rounded text-gray-300 hover:text-white transition-colors"
                    title="Delete podcast"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-dark-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-dark-700 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3">Podcast</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredPodcasts.map((podcast: PodcastFeed) => (
                <tr key={podcast.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      {podcast.image_url ? (
                        <img 
                          src={podcast.image_url} 
                          alt={podcast.name} 
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-dark-700 rounded flex items-center justify-center text-gray-500 text-xs">
                          No Img
                        </div>
                      )}
                      <div className="truncate max-w-[200px]">
                        <p className="text-white truncate">{podcast.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{podcast.author || 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 text-xs bg-accent-900/30 text-accent-400 rounded">
                      {podcast.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {new Date(podcast.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <a 
                        href={podcast.feed_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded text-gray-300 hover:text-white transition-colors"
                        title="Open feed URL"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button 
                        onClick={() => handleDeletePodcast(podcast.id)}
                        className="p-1.5 bg-dark-700 hover:bg-red-900 rounded text-gray-300 hover:text-white transition-colors"
                        title="Delete podcast"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPodcastsPage;
