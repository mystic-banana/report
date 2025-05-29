import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Upload, AlertTriangle, Check, Rss, Loader2 } from 'lucide-react';

interface PodcastCategory {
  id: string;
  name: string;
}

interface PodcastSubmission {
  id: string;
  name: string;
  feed_url: string;
  image_url?: string;
  category_id: string;
  category_name?: string;
  status?: string;
  admin_comments?: string;
  created_at: string;
  updated_at: string;
}

const PodcastSubmissionForm: React.FC = () => {
  const [feedUrl, setFeedUrl] = useState('');
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<PodcastSubmission[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchUserSubmissions();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('podcast_categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
      
      // Set default selected category if available
      if (data && data.length > 0) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      // Check if user is an admin
      const isAdmin = user.app_metadata?.role === 'admin';
      
      // Build query to fetch podcasts
      let query = supabase
        .from('podcasts')
        .select(`
          id, name, feed_url, image_url, category_id, status, 
          admin_comments, created_at, updated_at, submitter_id
        `)
        .order('created_at', { ascending: false });
      
      // For admin users, show all podcasts
      // For regular users, only show their submissions
      if (!isAdmin) {
        // Try to filter by submitter_id if it exists in the table
        try {
          query = query.eq('submitter_id', user.id);
        } catch (err) {
          console.error('Error filtering by submitter_id, this column may not exist');
          // If column doesn't exist, we'll just show all podcasts as a fallback
        }
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Get category names
      const categoryIds = [...new Set(data?.map(p => p.category_id) || [])];
      let categoryMap: Record<string, string> = {};
      
      if (categoryIds.length > 0) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('podcast_categories')
          .select('id, name')
          .in('id', categoryIds);
        
        if (!categoryError && categoryData) {
          categoryMap = categoryData.reduce((acc, cat) => ({
            ...acc,
            [cat.id]: cat.name
          }), {});
        }
      }
      
      // Transform data to include category names
      const transformedSubmissions = data?.map(submission => ({
        ...submission,
        category_name: categoryMap[submission.category_id] || 'Unknown Category'
      })) || [];
      
      setUserSubmissions(transformedSubmissions);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!feedUrl) {
      setError('Please enter a podcast feed URL');
      return;
    }
    
    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Get RSS feed details
      let name = 'Unknown Podcast';
      let description = '';
      
      try {
        // Validate URL format first
        const urlPattern = /^(https?:\/\/)([-\da-z.]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        
        if (!urlPattern.test(feedUrl)) {
          throw new Error('Invalid URL format');
        }
        
        // Attempt to extract podcast name from URL for a better UX
        const urlParts = new URL(feedUrl).hostname.split('.');
        if (urlParts.length > 1) {
          // Try to get a reasonable name from the domain
          name = urlParts[urlParts.length - 2].charAt(0).toUpperCase() + urlParts[urlParts.length - 2].slice(1);
          name += ' Podcast';
        }
        
        // Start a quick fetch of RSS metadata in the background
        // This won't block the submission but will update the podcast later if successful
        setTimeout(async () => {
          try {
            console.log('Fetching RSS feed metadata in background...');
            const response = await fetch(`https://tbpnsxwldrxdlirxfcor.supabase.co/functions/v1/parse-rss-feed?url=${encodeURIComponent(feedUrl)}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicG5zeHdsZHJ4ZGxpcnhmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTQwMzYsImV4cCI6MjA2MzU5MDAzNn0.85YLHLnIgdiqhFkLvDe2XWcX4b5nzMCu8K70a6mq8dY'}`
              }
            });
            
            if (response.ok) {
              const feedData = await response.json();
              console.log('RSS feed metadata fetched successfully:', feedData);
              
              // Update the podcast with the fetched metadata
              if (feedData && !feedData.error) {
                const { data, error } = await supabase
                  .from('podcasts')
                  .update({
                    name: feedData.name || name,
                    description: feedData.description || description,
                    image_url: feedData.image_url || null,
                    author: feedData.author || null,
                    last_fetched_at: new Date().toISOString()
                  })
                  .eq('feed_url', feedUrl)
                  .select();
                  
                if (error) {
                  console.error('Error updating podcast with RSS metadata:', error);
                } else {
                  console.log('Podcast updated with RSS metadata:', data);
                  // Refresh the user submissions list
                  fetchUserSubmissions();
                }
              }
            }
          } catch (error) {
            console.error('Error fetching RSS feed metadata:', error);
          }
        }, 100);
      } catch (err) {
        setError('Invalid feed URL format. Please enter a valid URL.');
        setLoading(false);
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit a podcast');
      }
      
      // Check if user is an admin
      const isAdmin = user.app_metadata?.role === 'admin';
      
      // Create podcast submission data object with optional submitter_id
      interface PodcastSubmissionData {
        name: string;
        description: string;
        feed_url: string;
        category_id: string;
        category: string;
        submitter_comments: string | null;
        status: string;
        submitter_id?: string;
        admin_comments?: string;
      }
      
      // If admin, set status to approved automatically. Otherwise, set to pending
      const submissionData: PodcastSubmissionData = {
        name,
        description,
        feed_url: feedUrl,
        category_id: selectedCategoryId,
        category: categories.find(c => c.id === selectedCategoryId)?.name || 'Unknown',
        submitter_comments: comments || null,
        status: isAdmin ? 'approved' : 'pending' // Automatically approve if admin
      };
      
      // Add submitter_id if the user exists
      if (user) {
        submissionData.submitter_id = user.id;
      }
      
      // If admin, add note that this was auto-approved
      if (isAdmin) {
        submissionData.admin_comments = 'Auto-approved (submitted by admin)';
      }
      
      // Insert the submission
      const { error } = await supabase
        .from('podcasts')
        .insert([submissionData])
        .select();
      
      if (error) throw error;
      
      const successMessage = isAdmin 
        ? 'Podcast added successfully! As an admin, your submission was automatically approved.'
        : 'Podcast submitted successfully! It will be reviewed by our team.';
      
      setSuccess(successMessage);
      
      // Clear form
      setSuccess(isAdmin 
        ? 'Podcast added successfully! As an admin, your submission was automatically approved.'
        : 'Podcast submitted successfully! It will be reviewed by our team.');
      setFeedUrl('');
      setComments('');
      fetchUserSubmissions();
    } catch (error: any) {
      console.error('Error submitting podcast:', error);
      setError(error.message || 'Failed to submit podcast');
    } finally {
      setLoading(false);
    }
  };

  // Function to display status badge with appropriate styling
  const renderStatusBadge = (submission: PodcastSubmission) => {
    switch (submission.status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-900/30 text-green-400 rounded-full">
            <Check size={12} className="inline mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-900/30 text-red-400 rounded-full">
            <AlertTriangle size={12} className="inline mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-900/30 text-yellow-400 rounded-full">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-800 rounded-lg p-6 shadow-md space-y-6">
        <div className="flex items-center space-x-2">
          <Rss className="h-5 w-5 text-accent-500" />
          <h3 className="text-xl font-bold text-white">Submit a Podcast</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Podcast RSS Feed URL
            </label>
            <input
              type="url"
              id="feedUrl"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://example.com/feed.rss"
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              required
            />
            <p className="mt-1 text-xs text-gray-400">
              Enter the RSS feed URL of the podcast you want to submit
            </p>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
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
            <label htmlFor="comments" className="block text-sm font-medium text-gray-300 mb-1">
              Comments (Optional)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional information about this podcast..."
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
              rows={3}
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-900/50 text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-900/30 border border-green-900/50 text-green-400 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
        
        <div className="mt-6">
          <button
            disabled={loading}
            type="submit"
            className={`flex items-center justify-center py-2 px-4 rounded-md font-semibold text-white bg-accent-600 hover:bg-accent-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Submit Podcast
              </>
            )}
          </button>
        </div>
      </form>
      </div>
      
      <div className="bg-dark-800 rounded-lg p-6 shadow-md space-y-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Submissions</h3>
        
        {userSubmissions.length === 0 ? (
          <div className="bg-dark-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">You haven't submitted any podcasts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userSubmissions.map(submission => (
              <div key={submission.id} className="bg-dark-700 rounded-lg overflow-hidden border border-dark-600">
                <div className="p-4">
                  <div className="flex items-start">
                    {submission.image_url ? (
                      <img 
                        src={submission.image_url} 
                        alt={submission.name} 
                        className="w-16 h-16 object-cover rounded mr-3"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-dark-600 rounded flex items-center justify-center text-gray-500 mr-3">
                        No Img
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h4 className="text-white font-medium truncate">{submission.name}</h4>
                        {renderStatusBadge(submission)}
                      </div>
                      
                      <p className="text-sm text-gray-400 mt-1 truncate">
                        {submission.feed_url}
                      </p>
                      
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span className="inline-block px-2 py-1 bg-dark-600 rounded text-gray-400 mr-2">
                          {submission.category_name}
                        </span>
                        <span>
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {submission.admin_comments && (
                    <div className="mt-3 p-3 bg-dark-600 rounded-md">
                      <p className="text-xs font-medium text-gray-400 mb-1">Admin Feedback:</p>
                      <p className="text-sm text-gray-300">{submission.admin_comments}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastSubmissionForm;
