import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, ThumbsUp, BookOpen, Lightbulb } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ReactionCounts {
  like: number;
  love: number;
  insightful: number;
  curious: number;
}

interface ArticleReactionsProps {
  articleId: string;
  commentsCount: number;
  onShareClick?: () => void;
}

const ArticleReactions: React.FC<ArticleReactionsProps> = ({ 
  articleId, 
  commentsCount,
  onShareClick 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const [reactions, setReactions] = useState<ReactionCounts>({
    like: 0,
    love: 0,
    insightful: 0,
    curious: 0
  });
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [shareMenuOpen, setShareMenuOpen] = useState<boolean>(false);

  // Fetch reaction counts
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        // Get all reactions for this article
        const { data, error } = await supabase
          .from('article_reactions')
          .select('reaction_type')
          .eq('article_id', articleId);

        if (error) {
          console.error('Error fetching reactions:', error);
          return;
        }

        // Count reactions by type
        const counts: ReactionCounts = {
          like: 0,
          love: 0,
          insightful: 0,
          curious: 0
        };

        data.forEach(reaction => {
          const type = reaction.reaction_type as keyof ReactionCounts;
          counts[type] += 1;
        });

        setReactions(counts);

        // If user is authenticated, fetch their reactions
        if (isAuthenticated && user) {
          const { data: userReactionsData, error: userReactionsError } = await supabase
            .from('article_reactions')
            .select('reaction_type')
            .eq('article_id', articleId)
            .eq('user_id', user.id);

          if (!userReactionsError && userReactionsData) {
            setUserReactions(userReactionsData.map(r => r.reaction_type));
          }
        }
      } catch (e) {
        console.error('Error in fetchReactions:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();

    // Subscribe to changes in reactions
    const subscription = supabase
      .channel('article-reactions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'article_reactions',
          filter: `article_id=eq.${articleId}`
        }, 
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [articleId, isAuthenticated, user]);

  // Handle reaction click
  const handleReaction = async (reactionType: keyof ReactionCounts) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to react to articles');
      return;
    }

    try {
      setLoading(true);

      // Check if user already reacted with this type
      const hasReacted = userReactions.includes(reactionType);

      if (hasReacted) {
        // Remove the reaction
        const { error } = await supabase
          .from('article_reactions')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user!.id)
          .eq('reaction_type', reactionType);

        if (error) {
          console.error('Error removing reaction:', error);
          toast.error('Failed to remove reaction');
          return;
        }

        // Update local state
        setUserReactions(userReactions.filter(r => r !== reactionType));
        setReactions({
          ...reactions,
          [reactionType]: Math.max(0, reactions[reactionType] - 1)
        });

      } else {
        // Add the reaction
        const { error } = await supabase
          .from('article_reactions')
          .insert({
            article_id: articleId,
            user_id: user!.id,
            reaction_type: reactionType
          });

        if (error) {
          // If it's a unique constraint error, it might be because the user already reacted
          if (error.code === '23505') {
            toast.error('You already reacted to this article');
          } else {
            console.error('Error adding reaction:', error);
            toast.error('Failed to add reaction');
          }
          return;
        }

        // Update local state
        setUserReactions([...userReactions, reactionType]);
        setReactions({
          ...reactions,
          [reactionType]: reactions[reactionType] + 1
        });
      }
    } catch (e) {
      console.error('Error in handleReaction:', e);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handle share button click
  const handleShareClick = () => {
    if (onShareClick) {
      onShareClick();
    } else {
      setShareMenuOpen(!shareMenuOpen);
    }
  };

  // Share to social media
  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const url = window.location.href;
    const title = document.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShareMenuOpen(false);
  };

  // Copy link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast.success('Link copied to clipboard');
        setShareMenuOpen(false);
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  return (
    <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6 py-3 border-t border-b border-dark-700">
      {/* Reaction buttons */}
      <div className="flex space-x-3">
        <button 
          onClick={() => handleReaction('like')} 
          disabled={loading}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full ${
            userReactions.includes('like') 
              ? 'bg-blue-900 text-blue-200' 
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          } transition-colors`}
        >
          <ThumbsUp size={18} />
          <span>{reactions.like > 0 ? reactions.like : ''}</span>
        </button>
        
        <button 
          onClick={() => handleReaction('love')} 
          disabled={loading}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full ${
            userReactions.includes('love') 
              ? 'bg-red-900 text-red-200' 
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          } transition-colors`}
        >
          <Heart size={18} />
          <span>{reactions.love > 0 ? reactions.love : ''}</span>
        </button>
        
        <button 
          onClick={() => handleReaction('insightful')} 
          disabled={loading}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full ${
            userReactions.includes('insightful') 
              ? 'bg-purple-900 text-purple-200' 
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          } transition-colors`}
        >
          <Lightbulb size={18} />
          <span>{reactions.insightful > 0 ? reactions.insightful : ''}</span>
        </button>
        
        <button 
          onClick={() => handleReaction('curious')} 
          disabled={loading}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full ${
            userReactions.includes('curious') 
              ? 'bg-yellow-900 text-yellow-200' 
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          } transition-colors`}
        >
          <BookOpen size={18} />
          <span>{reactions.curious > 0 ? reactions.curious : ''}</span>
        </button>
      </div>
      
      <div className="flex-1"></div>
      
      {/* Comments count */}
      <div className="flex items-center space-x-1 text-gray-400">
        <MessageCircle size={18} />
        <span>{commentsCount}</span>
      </div>
      
      {/* Share button with dropdown */}
      <div className="relative">
        <button 
          onClick={handleShareClick}
          className="flex items-center space-x-1 px-3 py-2 rounded-full bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
        
        {shareMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-md shadow-lg z-10 border border-dark-600">
            <div className="py-1">
              <button 
                onClick={() => shareToSocial('twitter')} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
              >
                Share on Twitter
              </button>
              <button 
                onClick={() => shareToSocial('facebook')} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
              >
                Share on Facebook
              </button>
              <button 
                onClick={() => shareToSocial('linkedin')} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
              >
                Share on LinkedIn
              </button>
              <button 
                onClick={copyLink} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleReactions;
