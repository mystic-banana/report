import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PodcastFeed, PodcastCategory } from '../../types';
import { Trash2, Plus, RefreshCw, ExternalLink, Grid, List, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import PodcastCategoryManager from '../../components/admin/PodcastCategoryManager';
// We no longer need fetchEpisodesForPodcast as the Edge Function handles episode fetching

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

  // State for Edit Podcast Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<PodcastFeed | null>(null);
  const initialEditFormData = {
    name: '',
    description: '',
    image_url: '',
    author: '',
    category_id: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
  };
  const [editFormData, setEditFormData] = useState(initialEditFormData);

  // Callback for PodcastCategoryManager to trigger a full refresh
  const handleCategoriesChanged = (updatedCategories: PodcastCategory[]) => {
    setCategories(updatedCategories); // Keep local category state up-to-date for the dropdown
    fetchCategoriesAndPodcasts(); // Re-fetch everything to ensure podcast list reflects category changes
  };

  // Fetch podcasts and categories on component mount
  useEffect(() => {
    fetchCategoriesAndPodcasts();
  }, []);

  const fetchCategoriesData = async (): Promise<PodcastCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('podcast_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching podcast categories:', error.message);
        // Do not fall back to temp categories for the main state.
        // UI should handle the case where actual categories are missing.
        setCategories([]); 
        return [];
      }
      const fetchedCategories = data || [];
      setCategories(fetchedCategories);
      return fetchedCategories;
    } catch (err: any) {
      console.error('Critical error fetching podcast categories:', err.message);
      setCategories([]);
      return [];
    }
  };

  const fetchPodcastsData = async (currentCategories: PodcastCategory[]) => {
    try {
      const { data: podcastsData, error: podcastsError } = await supabase
        .from('podcasts')
        .select('*')
        .order('name');
      
      if (podcastsError) {
        throw podcastsError;
      }
      
      const categoryMap: Record<string, string> = {};
      currentCategories.forEach(category => {
        categoryMap[category.id] = category.name;
      });
      
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
      setPodcasts([]); // Set to empty on error
    }
  };

  const fetchCategoriesAndPodcasts = async () => {
    setLoading(true);
    setError(null);
    const fetchedCategories = await fetchCategoriesData();
    await fetchPodcastsData(fetchedCategories);
    setLoading(false);
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
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to add a podcast');
      }
      
      // Call the Edge Function to process the feed
      // Use the hardcoded Supabase URL for this project
      const supabaseUrl = 'https://tbpnsxwldrxdlirxfcor.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/add-podcast-feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            feedUrl: newFeedUrl,
            category: selectedCategoryId
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add podcast: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Edge Function response:', responseData);
      
      setAddFeedSuccess(`Podcast "${responseData.podcastName || 'Unknown'}" added successfully with ${responseData.episodeCount || 0} episodes!`);
      setNewFeedUrl(''); // Clear the input
      fetchCategoriesAndPodcasts(); // Refresh the list to show the new podcast with its real name
      
      // Clear success message after 5 seconds
      setTimeout(() => setAddFeedSuccess(null), 5000);
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
      
      // Directly delete the podcast. Episodes will be deleted by ON DELETE CASCADE.
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
        console.warn('Podcast still exists after deletion attempt. This might indicate an issue with RLS or other constraints.');
        throw new Error('Failed to delete podcast completely. Please check database logs or RLS policies.');
      }
      
      // Success message
      setAddFeedSuccess(`Successfully deleted "${podcastName}" and all associated episodes.`);
      
      // Set a timeout to clear the success message after 5 seconds
      setTimeout(() => {
        setAddFeedSuccess(null);
      }, 5000);
      
      // Refresh the podcast list
      fetchCategoriesAndPodcasts();
      
    } catch (err: any) {
      console.error('Error deleting podcast:', err);
      setError(err.message || 'Failed to delete podcast');
    } finally {
      setLoading(false);
    }
  };

  // Toggle category manager visibility
  // Edit Modal Functions
  const handleOpenEditModal = (podcast: PodcastFeed) => {
    setEditingPodcast(podcast);
    setEditFormData({
      name: podcast.name || '',
      description: podcast.description || '',
      image_url: podcast.image_url || '',
      author: podcast.author || '',
      category_id: podcast.category_id || '',
      status: (podcast.status as 'draft' | 'published' | 'archived') || 'draft',
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPodcast(null);
    setEditFormData(initialEditFormData);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPodcast) {
      setError('No podcast selected for editing.');
      return;
    }

    setLoading(true); // Or a more specific loading state like setUpdatingPodcast(true)
    setError(null);
    setAddFeedSuccess(null);

    try {
      const updatePayload = {
        name: editFormData.name, // Corrected from title
        description: editFormData.description || null, // Ensure empty strings become null if appropriate for DB
        image_url: editFormData.image_url || null,
        author: editFormData.author || null,
        category_id: editFormData.category_id || null,
        status: editFormData.status,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('podcasts')
        .update(updatePayload)
        .eq('id', editingPodcast.id);

      if (updateError) {
        console.error('Error updating podcast:', updateError);
        throw new Error(`Failed to update podcast: ${updateError.message}`);
      }

      setAddFeedSuccess(`Successfully updated "${editFormData.name}".`);
      fetchCategoriesAndPodcasts(); // Refresh the list
      handleCloseEditModal(); // Close the modal on success

      setTimeout(() => {
        setAddFeedSuccess(null);
      }, 5000);

    } catch (err: any) {
      console.error('Error in handleUpdatePodcast:', err);
      setError(err.message || 'An unexpected error occurred while updating the podcast.');
      // Optionally, keep the modal open on error so the user can retry or see the data
    } finally {
      setLoading(false); // Or setUpdatingPodcast(false)
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
            onClick={fetchCategoriesAndPodcasts}
            className="flex items-center px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-md text-white transition-colors"
            title="Refresh podcast list"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Category Manager (collapsible) */}
      {showCategoryManager && <PodcastCategoryManager onCategoriesChange={handleCategoriesChanged} />}
      
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
                    onClick={() => handleOpenEditModal(podcast)}
                    className="p-1.5 bg-dark-700 hover:bg-blue-700 rounded text-gray-300 hover:text-white transition-colors"
                    title="Edit podcast"
                  >
                    <Pencil size={14} />
                  </button>
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
                        onClick={() => handleOpenEditModal(podcast)}
                        className="p-1.5 bg-dark-700 hover:bg-blue-700 rounded text-gray-300 hover:text-white transition-colors"
                        title="Edit podcast"
                      >
                        <Pencil size={14} />
                      </button>
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

      {/* Edit Podcast Modal */}
      {showEditModal && editingPodcast && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">Edit Podcast: <span className='text-accent-400'>{editingPodcast.name}</span></h2>
            <form onSubmit={handleUpdatePodcast}> {/* handleUpdatePodcast will be created in Phase 3 */}
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Podcast Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2.5 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    rows={4}
                    className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2.5 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    id="image_url"
                    value={editFormData.image_url}
                    onChange={handleEditFormChange}
                    className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2.5 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    id="author"
                    value={editFormData.author}
                    onChange={handleEditFormChange}
                    className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2.5 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    name="category_id"
                    id="category_id"
                    value={editFormData.category_id}
                    onChange={handleEditFormChange}
                    className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2.5 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    name="status"
                    id="status"
                    value={editFormData.status}
                    onChange={handleEditFormChange}
                    className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2.5 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-dark-600 hover:bg-dark-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-accent-500 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPodcastsPage;
