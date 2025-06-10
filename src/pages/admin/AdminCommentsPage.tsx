import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

type Comment = {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  article: {
    title: string;
    slug: string;
  };
  user: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
};

const AdminCommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const fetchComments = async () => {
    setLoading(true);
    
    let query = supabase
      .from('comments')
      .select(`
        *,
        article:article_id(title, slug),
        user:user_id(email, user_metadata)
      `)
      .order('created_at', { ascending: false });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } else {
      setComments(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    
    // Subscribe to changes in the comments table
    const subscription = supabase
      .channel('comments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchComments();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [filter]);

  const updateCommentStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('comments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating comment status:', error);
      toast.error('Failed to update comment status');
    } else {
      toast.success(`Comment ${status}`);
      fetchComments();
    }
  };

  const deleteComment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
      } else {
        toast.success('Comment deleted');
        fetchComments();
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Comment Moderation</h1>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-accent-500 text-white' : 'bg-dark-700 text-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-accent-500 text-white' : 'bg-dark-700 text-gray-300'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-accent-500 text-white' : 'bg-dark-700 text-gray-300'}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-accent-500 text-white' : 'bg-dark-700 text-gray-300'}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-xl text-gray-400">No {filter !== 'all' ? filter : ''} comments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-dark-800 rounded-lg overflow-hidden">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-gray-200">Comment</th>
                <th className="px-4 py-3 text-left text-gray-200">Article</th>
                <th className="px-4 py-3 text-left text-gray-200">User</th>
                <th className="px-4 py-3 text-left text-gray-200">Date</th>
                <th className="px-4 py-3 text-left text-gray-200">Status</th>
                <th className="px-4 py-3 text-center text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-dark-700">
                  <td className="px-4 py-3 text-gray-300 max-w-md">
                    <div className="line-clamp-3">{comment.content}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <a
                      href={`/article/${comment.article?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-400 hover:underline"
                    >
                      {comment.article?.title || 'Unknown Article'}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {comment.user?.user_metadata?.full_name || comment.user?.email || 'Unknown User'}
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        comment.status === 'approved'
                          ? 'bg-green-900 text-green-200'
                          : comment.status === 'rejected'
                          ? 'bg-red-900 text-red-200'
                          : 'bg-yellow-900 text-yellow-200'
                      }`}
                    >
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'approved')}
                          className="p-1 bg-green-700 text-white rounded hover:bg-green-600"
                          title="Approve"
                        >
                          ✓
                        </button>
                      )}
                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'rejected')}
                          className="p-1 bg-red-700 text-white rounded hover:bg-red-600"
                          title="Reject"
                        >
                          ✕
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="p-1 bg-dark-600 text-white rounded hover:bg-dark-500"
                        title="Delete"
                      >
                        🗑️
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

export default AdminCommentsPage;
