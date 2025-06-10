import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PageLayout from '../../components/layout/PageLayout';
import SEO from '../../components/SEO';
import AdUnit from '../../components/ads/AdUnit';
import ArticleReactions from '../../components/articles/ArticleReactions';
import { generateArticleSchema, generateBreadcrumbSchema, combineStructuredData } from '../../utils/structuredData';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Heart, Share, ChevronRight, User, Eye, MessageCircle, Share2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-hot-toast';
// Import mock data as fallback
import { mockArticles, mockComments } from '../../mocks/articleMockData';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published_at: string | null;
  updated_at?: string | null;
  author_id?: string;
  author_name?: string;
  category?: string;
  category_id?: string;
  tags?: string[];
  featured_image_url?: string;
  is_premium?: boolean;
  read_count?: number;
  // Additional fields for related content
  relevance_score?: number;
  relationship_type?: string;
}

interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  parent_id?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  // User info joined from the auth.users table
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  // Virtual fields
  replies_count?: number;
  likes_count?: number;
}

// Comment form submission data type
export interface CommentFormSubmission {
  content: string;
  parent_id?: string | null;
  recaptcha_token: string;
}

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [article, setArticle] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [commentContent, setCommentContent] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loadingRelated, setLoadingRelated] = useState<boolean>(false);
  
  // Format the article publication date
  const formatArticleDate = (date: string) => {
    return format(new Date(date), 'MMMM dd, yyyy');
  };

  // Function to fetch the article data
  const fetchArticle = async () => {
    if (!slug) {
      setError('Article slug is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try to fetch the article from Supabase
      try {
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!articleError && articleData) {
          // Set the article from database
          setArticle(articleData);
          
          // Try to increment read count
          try {
            await supabase
              .rpc('increment_article_read_count', { article_slug: slug });
          } catch (err: any) {
            console.error('Error incrementing read count:', err);
          }

          // Load related articles using the related_articles table for improved recommendations
          setLoadingRelated(true);
          const { data: relatedData, error: relatedError } = await supabase
            .from('related_articles')
            .select(`
              related_article_id,
              relevance_score,
              relationship_type,
              related_article:related_article_id(id, title, slug, excerpt, published_at, category, featured_image_url)
            `)
            .eq('article_id', articleData.id)
            .order('relevance_score', { ascending: false })
            .limit(10);
          
          if (!relatedError && relatedData && relatedData.length > 0) {
            // Transform the data to match our Article interface
            const transformedRelated: Article[] = [];
            
            relatedData.forEach(item => {
              if (item.related_article) {
                // First cast to unknown to avoid type issues
                const article = item.related_article as unknown as Article;
                transformedRelated.push({
                  ...article,
                  relevance_score: item.relevance_score,
                  relationship_type: item.relationship_type
                });
              }
            });
            
            setRelatedArticles(transformedRelated);
          } else {
            // If no related articles found in the dedicated table, fallback to category-based recommendations
            const { data: categoryRelatedData } = await supabase
              .from('articles')
              .select('*')
              .eq('category_id', articleData.category_id)
              .neq('id', articleData.id)
              .order('published_at', { ascending: false })
              .limit(6);
              
            if (categoryRelatedData && categoryRelatedData.length > 0) {
              setRelatedArticles(categoryRelatedData);
            } else {
              // Use recent articles as fallback
              const { data: recentArticles } = await supabase
                .from('articles')
                .select('*')
                .neq('id', articleData.id)
                .order('published_at', { ascending: false })
                .limit(6);
                
              if (recentArticles && recentArticles.length > 0) {
                setRelatedArticles(recentArticles);
              } else {
                // Use mock related articles as last resort fallback
                setRelatedArticles(mockArticles.filter(a => a.id !== articleData.id));
              }
            }
          }
          setLoadingRelated(false);

          // Load comments from database with user info
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select(`
              id, 
              article_id, 
              user_id, 
              content, 
              status, 
              parent_id, 
              created_at, 
              updated_at,
              user:user_id(email, user_metadata)
            `)
            .eq('article_id', articleData.id)
            .eq('status', 'approved')
            .is('parent_id', null) // Only fetch top-level comments first
            .order('created_at', { ascending: false });

          if (!commentsError && commentsData && commentsData.length > 0) {
            setComments(commentsData as Comment[]);
          } else {
            // Use mock comments as fallback
            // Cast mock comments to match Comment interface
            setComments(mockComments.filter(c => c.article_id === articleData.id) as Comment[]);
          }
          
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue to fallback if database error
      }

      // FALLBACK: Use mock data if database fetch failed
      console.log('Using mock data as fallback...');
      const mockArticle = mockArticles.find(a => a.slug === slug);
      
      if (!mockArticle) {
        setError('Article not found');
        setLoading(false);
        return;
      }
      
      // Set the mock article
      setArticle(mockArticle);
      
      // Set mock related articles
      setRelatedArticles(mockArticles.filter(a => a.id !== mockArticle.id));
      
      // Set mock comments
      // Cast mock comments to match Comment interface
      setComments(mockComments.filter(c => c.article_id === mockArticle.id) as Comment[]);

    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Error fetching article. Please try again.');
    } finally {
      setLoading(false);
      setLoadingComments(false);
      setLoadingRelated(false);
    }
  };
  
  // Function to load replies for a comment
  const loadReplies = async (commentId: string) => {
    try {
      if (showReplies[commentId]) {
        // If replies are already showing, just hide them
        setShowReplies({ ...showReplies, [commentId]: false });
        return;
      }
      
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, 
          article_id, 
          user_id, 
          content, 
          status, 
          parent_id, 
          created_at, 
          updated_at,
          user:user_id(email, user_metadata)
        `)
        .eq('parent_id', commentId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error loading replies:', error);
        toast.error('Failed to load replies');
        return;
      }
      
      if (data && data.length > 0) {
        // Add replies to the comments list
        setComments(prev => {
          // First check if the replies are already in the list
          const existingIds = new Set(prev.map(c => c.id));
          const newReplies = data.filter(reply => !existingIds.has(reply.id));
          return [...prev, ...newReplies as Comment[]];
        });
        
        // Show the replies section
        setShowReplies({ ...showReplies, [commentId]: true });
      } else {
        toast.error('No replies found');
      }
    } catch (e) {
      console.error('Error in loadReplies:', e);
      toast.error('Something went wrong');
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Handle submitting a comment
  const submitComment = async () => {
    if (!article || !isAuthenticated || !commentContent.trim() || !user) {
      if (!isAuthenticated) {
        toast.error('Please log in to comment');
      } else if (!commentContent.trim()) {
        toast.error('Comment cannot be empty');
      }
      return;
    }

    setSubmittingComment(true);

    try {
      // Execute recaptcha
      const token = await recaptchaRef.current?.executeAsync();
      
      if (!token) {
        toast.error('CAPTCHA verification failed');
        setSubmittingComment(false);
        return;
      }

      // Submit to Supabase
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: commentContent,
            article_id: article.id,
            parent_id: replyTo,
            user_id: user.id,
            user_name: user.name || user.email?.split('@')[0] || 'Anonymous',
            user_avatar: user.avatarUrl,
            status: 'pending' // All comments require approval
          }
        ])
        .select();

      if (error) throw error;

      // Reset the form
      setCommentContent('');
      setReplyTo(null);
      recaptchaRef.current?.reset();
      
      toast.success('Your comment has been submitted and is awaiting approval.');
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!article) return null;
    
    const articleSchema = generateArticleSchema({
      title: article.title,
      excerpt: article.excerpt || '',
      coverImage: article.featured_image_url || '',
      publishedAt: article.published_at || '',
      updatedAt: article.updated_at || article.published_at || '',
      authorName: article.author_name || 'Mystic Banana',
      slug: article.slug
    });
    
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Magazine', url: '/magazine' },
      { name: article.category || 'Uncategorized', url: `/magazine/categories/${article.category_id}` },
      { name: article.title, url: `/magazine/${article.slug}` }
    ]);
    
    return combineStructuredData([articleSchema, breadcrumbSchema]);
  };

  // Load article data when component mounts or slug changes
  useEffect(() => {
    fetchArticle();
  }, [slug]);
  return (
    <PageLayout>
      <SEO 
        title={article?.title || 'Article'}
        description={article?.excerpt || ''}
        ogImage={article?.featured_image_url}
        jsonLd={generateStructuredData() || undefined}
      />

      {loading ? (
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-500"></div>
          </div>
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-dark-800 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <Link to="/magazine" className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
              Back to Magazine
            </Link>
          </div>
        </div>
      ) : notFound ? (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-dark-800 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Not Found</h1>
            <p className="text-gray-300 mb-6">The article you are looking for does not exist.</p>
            <Link to="/magazine" className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
              Back to Magazine
            </Link>
          </div>
        </div>
      ) : article ? (
        <div className="bg-dark-900 text-white">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <nav className="flex items-center text-sm mb-6 text-dark-400 dark:text-dark-500">
                <Link to="/" className="hover:text-accent-600 transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 mx-2" />
                <Link to="/magazine" className="hover:text-accent-600 transition-colors">Magazine</Link>
                {article.category && article.categoryId && (
                  <>
                    <ChevronRight className="w-3 h-3 mx-2" />
                    <Link 
                      to={`/magazine/categories/${article.categoryId}`}
                      className="hover:text-accent-600 transition-colors"
                    >
                      {article.category}
                    </Link>
                  </>
                )}
                <ChevronRight className="w-3 h-3 mx-2" />
                <span className="text-dark-700 dark:text-dark-300 truncate">{article.title}</span>
              </nav>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <article className="bg-dark-800 rounded-lg shadow-lg overflow-hidden">
                  {article.featured_image_url && (
                    <div className="relative w-full h-64 md:h-96 overflow-hidden">
                      <img 
                        src={article.featured_image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
                    
                    <div className="flex flex-wrap items-center text-gray-400 mb-6">
                      {article.category && (
                        <span className="mr-4 mb-2 bg-dark-700 text-accent-400 px-3 py-1 rounded-full text-sm">
                          {article.category}
                        </span>
                      )}
                      
                      {article.published_at && (
                        <span className="flex items-center mr-4 mb-2">
                          <span className="mr-1">
                            {formatArticleDate(article.published_at)}
                          </span>
                        </span>
                      )}
                      
                      {article.author_name && (
                        <span className="flex items-center mr-4 mb-2">
                          <User size={16} className="mr-1" />
                          <span>{article.author_name}</span>
                        </span>
                      )}
                      
                      {article.read_count !== undefined && (
                        <span className="flex items-center mb-2">
                          <Eye size={16} className="mr-1" />
                          <span>{article.read_count} {article.read_count === 1 ? 'read' : 'reads'}</span>
                        </span>
                      )}
                    </div>
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag: string, index: number) => (
                            <Link 
                              key={index}
                              to={`/articles/tags/${tag}`}
                              className="bg-dark-700 hover:bg-dark-600 px-3 py-1 rounded-full text-xs text-gray-300 transition-colors"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-b border-dark-700 mb-6 pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          <button className="text-gray-400 hover:text-accent-400 flex items-center transition-colors">
                            <Heart size={20} className="mr-2" />
                            <span>Like</span>
                          </button>
                          <button 
                            onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-gray-400 hover:text-accent-400 flex items-center transition-colors"
                          >
                            <MessageCircle size={20} className="mr-2" />
                            <span>Comment</span>
                          </button>
                        </div>
                        <div>
                          <button className="text-gray-400 hover:text-accent-400 flex items-center transition-colors">
                            <Share2 size={20} className="mr-2" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Article Share/Engagement Buttons */}
                    {article && (
                      <ArticleReactions 
                        articleId={article.id} 
                        commentsCount={comments.length} 
                        onShareClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                      />
                    )}
                    
                    {/* Article Content */}
                    <div 
                      className="prose prose-invert prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                    
                    {/* If article is premium, add premium badge */}
                    {article.is_premium && (
                      <div className="mt-8 bg-gradient-to-r from-purple-600 to-accent-500 rounded-lg p-6 text-white shadow-lg">
                        <div className="flex items-start">
                          <div className="mr-4">
                            <span className="text-3xl">✨</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold mb-2">Premium Content</h3>
                            <p className="mb-4">This is premium content from Mystic Banana. Subscribers get access to exclusive articles, personalized readings, and special community events.</p>
                            {!isAuthenticated || (user && !user.isPremium) ? (
                              <Link to="/premium" className="inline-block px-5 py-2 bg-white text-purple-800 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                Upgrade to Premium
                              </Link>
                            ) : (
                              <p className="text-sm italic">Thank you for being a premium subscriber!</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>

                {/* Comments Section */}
                <div id="comments-section" className="mt-8 bg-dark-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-white">Comments</h2>
                    
                    {/* Comment Form */}
                    {isAuthenticated ? (
                      <div className="mb-8 bg-dark-700 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3 text-white">
                          {replyTo ? 'Write a reply' : 'Join the conversation'}
                        </h3>
                        
                        <div className="relative">
                          <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="w-full p-3 bg-dark-600 text-white rounded-lg border border-dark-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 resize-none min-h-24"
                            placeholder={replyTo ? 'Write your reply...' : 'Share your thoughts...'}
                            disabled={submittingComment}
                          />
                          
                          <div className="flex items-center justify-between mt-3">
                            {replyTo && (
                              <button 
                                onClick={() => setReplyTo(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                Cancel reply
                              </button>
                            )}
                            
                            <div className="ml-auto flex items-center space-x-3">
                              <ReCAPTCHA
                                ref={recaptchaRef}
                                size="invisible"
                                sitekey="6LfD_kQpAAAAAFtwbmgKEdz8sBtW-ISaDPvWu1x-" // This would be replaced with a real key in production
                                onChange={() => {}} // Will be executed when the user submits the form
                              />
                              
                              <button
                                onClick={submitComment}
                                disabled={submittingComment || !commentContent.trim()}
                                className={`px-5 py-2 rounded-lg text-white transition-colors ${submittingComment || !commentContent.trim() ? 'bg-dark-500 cursor-not-allowed' : 'bg-accent-500 hover:bg-accent-600'}`}
                              >
                                {submittingComment ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                  </span>
                                ) : (
                                  'Submit Comment'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mt-3">
                          All comments must be approved by moderators before appearing publicly.
                        </p>
                      </div>
                    ) : (
                      <div className="mb-8 bg-dark-700 p-4 rounded-lg text-center">
                        <p className="text-gray-300 mb-3">You must be logged in to post a comment.</p>
                        <Link 
                          to={`/login?redirect=${encodeURIComponent(`/articles/${slug}`)}`}
                          className="inline-block px-5 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
                        >
                          Log In to Comment
                        </Link>
                      </div>
                    )}

                    {/* Comments List */}
                    {loadingComments ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500 border-r-2 border-accent-500 border-b-2 border-transparent"></div>
                        <p className="text-gray-400 mt-2">Loading comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="py-6 text-center">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-dark-700">
                        {comments.filter(c => !c.parent_id).map(comment => (
                          <div key={comment.id} className="py-6">
                            <div className="flex">
                              <div className="flex-shrink-0 mr-4">
                                {comment.user?.user_metadata?.avatar_url ? (
                                  <img 
                                    src={comment.user.user_metadata.avatar_url} 
                                    alt={comment.user?.user_metadata?.full_name || 'User'} 
                                    className="h-10 w-10 rounded-full"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-dark-600 flex items-center justify-center">
                                    <User size={20} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-white">
                                    {comment.user?.user_metadata?.full_name || comment.user?.email || 'Anonymous User'}
                                  </h4>
                                  <span className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                
                                <div className="prose prose-dark prose-sm max-w-none mb-2">
                                  <p className="text-gray-300">{comment.content}</p>
                                </div>
                                
                                <div className="flex items-center mt-2 space-x-4">
                                  <button 
                                    className="text-sm text-gray-400 hover:text-accent-400 transition-colors"
                                    onClick={() => isAuthenticated ? setReplyTo(comment.id) : toast.error('Please sign in to reply')}
                                  >
                                    Reply
                                  </button>
                                </div>
                                
                                {/* Reply Form */}
                                {replyTo === comment.id && (
                                  <div className="mt-4">
                                    <textarea
                                      className="w-full px-3 py-2 text-sm bg-dark-600 border border-dark-500 rounded-md placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                                      rows={3}
                                      placeholder={`Reply to ${comment.user?.user_metadata?.full_name || comment.user?.email || 'Anonymous'}...`}
                                      value={commentContent}
                                      onChange={(e) => setCommentContent(e.target.value)}
                                    ></textarea>
                                    
                                    <div className="flex justify-between mt-2">
                                      <button 
                                        className="px-3 py-1 text-sm bg-dark-600 text-gray-300 rounded hover:bg-dark-500 transition-colors"
                                        onClick={() => {
                                          setReplyTo(null);
                                          setCommentContent('');
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      
                                      <button 
                                        className="px-3 py-1 text-sm bg-accent-500 text-white rounded hover:bg-accent-600 transition-colors"
                                        onClick={() => {
                                          submitComment();
                                          setReplyTo(null);
                                        }}
                                        disabled={!commentContent.trim() || submittingComment}
                                      >
                                        {submittingComment ? 'Submitting...' : 'Submit Reply'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Replies Section */}
                                {comments.filter(c => c.parent_id === comment.id).length > 0 && (
                                  <div className="mt-4">
                                    <button 
                                      className="flex items-center text-sm text-accent-400 hover:text-accent-500 transition-colors"
                                      onClick={() => loadReplies(comment.id)}
                                    >
                                      {showReplies[comment.id] ? (
                                        <>
                                          <ChevronUp size={16} className="mr-1" />
                                          Hide Replies ({comments.filter(c => c.parent_id === comment.id).length})
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown size={16} className="mr-1" />
                                          Show Replies ({comments.filter(c => c.parent_id === comment.id).length})
                                        </>
                                      )}
                                    </button>
                                    
                                    {showReplies[comment.id] && (
                                      <div className="pl-4 mt-4 border-l-2 border-dark-600 space-y-4">
                                        {comments.filter(c => c.parent_id === comment.id).map(reply => (
                                          <div key={reply.id} className="pt-4">
                                            <div className="flex">
                                              <div className="flex-shrink-0 mr-3">
                                                {reply.user?.user_metadata?.avatar_url ? (
                                                  <img 
                                                    src={reply.user.user_metadata.avatar_url} 
                                                    alt={reply.user?.user_metadata?.full_name || 'User'} 
                                                    className="h-8 w-8 rounded-full"
                                                  />
                                                ) : (
                                                  <div className="h-8 w-8 rounded-full bg-dark-600 flex items-center justify-center">
                                                    <User size={16} className="text-gray-400" />
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div>
                                                <div className="flex items-center mb-1">
                                                  <h5 className="font-medium text-white text-sm">
                                                    {reply.user?.user_metadata?.full_name || reply.user?.email || 'Anonymous User'}
                                                  </h5>
                                                  <span className="text-xs text-gray-500 ml-2">
                                                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                                  </span>
                                                </div>
                                                
                                                <div className="prose prose-dark prose-sm max-w-none mb-1">
                                                  <p className="text-gray-300 text-sm">{reply.content}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Related Articles Section */}
                <div className="mt-8 bg-dark-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-white">You May Also Like</h2>
                    
                    {loadingRelated ? (
                      <div className="py-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500 border-r-2 border-accent-500 border-b-2 border-transparent"></div>
                        <p className="text-gray-400 mt-2">Loading related articles...</p>
                      </div>
                    ) : relatedArticles.length === 0 ? (
                      <div className="py-6 text-center text-gray-400">
                        <p>No related articles found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedArticles.map((related) => (
                          <Link
                            key={related.id}
                            to={`/articles/${related.slug}`}
                            className="block bg-dark-700 rounded-lg overflow-hidden hover:bg-dark-600 transition-colors"
                          >
                            <div className="h-40 overflow-hidden">
                              {related.featured_image_url ? (
                                <img
                                  src={related.featured_image_url}
                                  alt={related.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-dark-600 flex items-center justify-center text-gray-500">
                                  No Image
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4">
                              {related.category && (
                                <span className="inline-block px-2 py-1 bg-dark-600 text-accent-400 rounded-sm text-xs mb-2">
                                  {related.category}
                                </span>
                              )}
                              
                              <h3 className="font-bold text-white mb-2 line-clamp-2">
                                {related.title}
                              </h3>
                              
                              {related.excerpt && (
                                <p className="text-gray-400 text-sm line-clamp-2">
                                  {related.excerpt}
                                </p>
                              )}
                              
                              {related.published_at && (
                                <div className="mt-3 text-xs text-gray-500">
                                  {formatArticleDate(related.published_at)}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Ad Unit */}
                  <AdUnit placement="sidebar" className="bg-dark-800 rounded-lg overflow-hidden shadow-lg" />
                  
                  {/* Popular Articles */}
                  <div className="bg-dark-800 rounded-lg shadow-lg overflow-hidden p-6">
                    <h3 className="font-bold text-lg text-white mb-4">Popular Articles</h3>
                    <div className="space-y-4">
                      {/* This would be populated from a separate API call */}
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-start">
                          <div className="flex-shrink-0 w-16 h-16 bg-dark-700 rounded overflow-hidden mr-3">
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                              Image
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm hover:text-accent-400 transition-colors">
                              Popular Article Title {item}
                            </h4>
                            <p className="text-gray-400 text-xs mt-1">
                              May {item + 20}, 2025
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Newsletter Signup */}
                  <div className="bg-dark-800 rounded-lg shadow-lg overflow-hidden p-6">
                    <h3 className="font-bold text-lg text-white mb-2">Subscribe</h3>
                    <p className="text-gray-400 text-sm mb-4">Get the latest articles delivered to your inbox</p>
                    
                    <form className="space-y-3">
                      <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      />
                      <button 
                        type="submit" 
                        className="w-full px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded font-medium transition-colors"
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
};

export default ArticleDetailPage;
