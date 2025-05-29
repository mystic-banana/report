import { create } from 'zustand';
import { Article, Podcast, TarotReading, Horoscope, ContentCategory, Category } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ContentState {
  articles: Article[];
  podcasts: Podcast[];
  tarotReadings: TarotReading[];
  horoscopes: Horoscope[];
  featuredContent: (Article | Podcast)[];
  dailyTarotReading: TarotReading | null;
  dailyHoroscopes: Horoscope[];
  allArticles: Article[];
  relatedArticles: Article[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  mapArticlesFromDb: (dbArticles: any[]) => Article[];
  fetchCategories: () => Promise<void>;
  fetchArticles: (categoryName?: string) => Promise<void>;
  fetchAllArticles: () => Promise<void>;
  fetchPodcasts: (category?: ContentCategory) => Promise<void>;
  fetchFeaturedContent: () => Promise<void>;
  fetchDailyTarotReading: () => Promise<void>;
  fetchHoroscope: (sign: string) => Promise<Horoscope | undefined>;
  saveContent: (contentId: string) => Promise<void>;
  fetchTarotReadings: (userId?: string) => Promise<void>;
  fetchHoroscopes: (sign?: string) => Promise<void>;
  fetchDailyHoroscopes: () => Promise<void>;
}

// const mockPodcasts: Podcast[] = [
//   {
//     id: 'podcast-1',
//     title: 'Cosmic Conversations',
//     description: 'Join us as we explore the mysteries of the universe and our place within it.',
//     coverImage: 'https://images.pexels.com/photos/1257860/pexels-photo-1257860.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//     audioUrl: 'https://example.com/podcasts/cosmic-conversations-ep1.mp3',
//     duration: 45,
//     hostName: 'Astral Andy',
//     publishedAt: '2025-05-02T10:00:00Z',
//     category: 'spirituality',
//     tags: ['cosmos', 'consciousness', 'spirituality'],
//     isPremium: false
//   },
//   {
//     id: 'podcast-2',
//     title: 'Mercury Retrograde Survival Guide',
//     description: 'Everything you need to know to thrive during Mercury retrograde periods.',
//     coverImage: 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//     audioUrl: 'https://example.com/podcasts/mercury-retrograde-ep1.mp3',
//     duration: 32,
//     hostName: 'Stella Nova',
//     publishedAt: '2025-04-29T14:30:00Z',
//     category: 'astrology',
//     tags: ['mercury retrograde', 'planets', 'astrology'],
//     isPremium: true
//   },
//   {
//     id: 'podcast-3',
//     title: 'Mindful Meditation Sessions',
//     description: 'Guided meditations to help you connect with your higher self and find inner peace.',
//     coverImage: 'https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//     audioUrl: 'https://example.com/podcasts/mindful-meditation-ep1.mp3',
//     duration: 28,
//     hostName: 'Zen Master Zara',
//     publishedAt: '2025-04-26T08:15:00Z',
//     category: 'meditation',
//     tags: ['meditation', 'mindfulness', 'peace'],
//     isPremium: false
//   }
// ];
// End of mockPodcasts

const mockTarotReading: TarotReading = {
  id: 'reading-1',
  title: 'Daily Guidance Reading',
  cards: [
    {
      id: 'card-1',
      name: 'The Star',
      image: 'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=600',
      meaningUpright: 'Hope, faith, purpose, renewal, spirituality',
      meaningReversed: 'Lack of faith, despair, self-trust issues',
      isReversed: false
    },
    {
      id: 'card-2',
      name: 'Ten of Cups',
      image: 'https://images.pexels.com/photos/3029827/pexels-photo-3029827.jpeg?auto=compress&cs=tinysrgb&w=600',
      meaningUpright: 'Divine love, blissful relationships, harmony, alignment',
      meaningReversed: 'Broken family, domestic disharmony, relationship struggles',
      isReversed: false
    },
    {
      id: 'card-3',
      name: 'The Fool',
      image: 'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=600',
      meaningUpright: 'Beginnings, innocence, spontaneity, a free spirit',
      meaningReversed: 'Holding back, recklessness, risk-taking',
      isReversed: true
    }
  ],
  interpretation: 'Today brings a sense of hope and spiritual alignment. Your relationships are in a harmonious state, but be cautious about taking unnecessary risks or leaping before you look. While your path ahead is promising, thoughtful consideration before action will serve you well.',
  date: '2025-05-03T00:00:00Z'
};

const mockHoroscopes: Horoscope[] = [
  {
    sign: 'Aries',
    date: '2025-05-03',
    content: 'Your energy is through the roof today, Aries! Channel it into creative pursuits or physical activity for best results. An unexpected conversation could open new doors.',
    mood: 'Energetic',
    compatibility: 'Libra',
    luckyNumber: 7,
    luckyColor: 'Red'
  },
  {
    sign: 'Taurus',
    date: '2025-05-03',
    content: 'Financial matters take center stage today, Taurus. A careful review of your resources could reveal an opportunity you\'ve been overlooking. Trust your instincts in money matters.',
    mood: 'Grounded',
    compatibility: 'Scorpio',
    luckyNumber: 4,
    luckyColor: 'Green'
  },
  {
    sign: 'Gemini',
    date: '2025-05-03',
    content: 'Your communication skills are especially sharp today, Gemini. Use this gift to resolve any lingering misunderstandings. A message from an old friend might surprise you.',
    mood: 'Expressive',
    compatibility: 'Sagittarius',
    luckyNumber: 3,
    luckyColor: 'Yellow'
  },
  // Additional signs would be included in a full implementation
];

export const useContentStore = create<ContentState>((set) => ({
  articles: [],
  podcasts: [],
  tarotReadings: [],
  horoscopes: [],
  featuredContent: [],
  dailyTarotReading: null,
  dailyHoroscopes: [],
  allArticles: [],
  relatedArticles: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    console.log('[contentStore] fetchCategories called.');
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('[contentStore] fetchCategories: Supabase error:', error.message);
        throw error;
      }

      if (!data) {
        console.warn('[contentStore] fetchCategories: No data returned from Supabase.');
        set({ categories: [], isLoading: false });
        return;
      }

      console.log(`[contentStore] fetchCategories: Received ${data.length} categories from Supabase.`);
      // Data should align with Category interface, direct set is fine if types match
      set({ categories: data as Category[], isLoading: false });

    } catch (error) {
      console.error('[contentStore] fetchCategories: Catch block error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },
  
  fetchArticles: async (categoryName?: string) => { 
    console.log('[contentStore] fetchArticles called. Category:', categoryName);
    set({ isLoading: true, error: null });
    
    try {
      let query = supabase
        .from('articles')
        .select(`
          id, title, slug, meta_description, content, 
          featured_image_url, published_at, tags, is_premium, 
          category_id, created_at, updated_at, featured_image_alt, generated_by_ai, status,
          categories (id, name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (categoryName) {
        console.log('[contentStore] fetchArticles: Filtering by category name:', categoryName);
        // First, get the category ID for the given name
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();

        if (categoryError || !categoryData) {
          console.error('[contentStore] fetchArticles: Error fetching category ID or category not found:', categoryName, categoryError);
          set({ isLoading: false, error: `Category '${categoryName}' not found.` });
          return;
        }
        console.log('[contentStore] fetchArticles: Found category ID:', categoryData.id, 'for name:', categoryName);
        query = query.eq('category_id', categoryData.id);
      }

      const { data: dbData, error: dbError } = await query;

      console.log('[contentStore] fetchArticles: Supabase response - dbData:', dbData);
      if (dbError) {
        console.error('[contentStore] fetchArticles: Supabase raw error object:', JSON.stringify(dbError, null, 2));
        console.error('[contentStore] fetchArticles: Supabase error message:', dbError.message);
      } else {
        console.log('[contentStore] fetchArticles: Supabase response - dbError: null (No error)');
      }

      if (dbError) {
        console.error('[contentStore] fetchArticles: Supabase error:', dbError.message); // Log specific message
        throw dbError;
      }

      if (!dbData) {
        console.warn('[contentStore] fetchArticles: No data returned from Supabase.');
        set({ articles: [], isLoading: false });
        return;
      }
      
      console.log(`[contentStore] fetchArticles: Received ${dbData.length} raw articles from Supabase.`);

      const fetchedArticles = dbData.map((dbArticle: any, index: number) => {
        console.log(`[contentStore] fetchArticles: Mapping raw article ${index + 1}:`, dbArticle);
        const mappedArticle: Article = {
          id: dbArticle.id,
          title: dbArticle.title,
          slug: dbArticle.slug,
          excerpt: dbArticle.meta_description || '',
          content: dbArticle.content || '',
          coverImage: dbArticle.featured_image_url || '',
          authorId: 'system-author', // Default if user_id is null
          authorName: 'Mystic Banana Author', // Placeholder, consider joining users table
          authorAvatar: '', // Placeholder
          publishedAt: dbArticle.published_at,
          category: dbArticle.categories?.name || 'Uncategorized', // Ensure 'Uncategorized' is a valid ContentCategory or handle appropriately
          tags: dbArticle.tags || [],
          isPremium: dbArticle.is_premium || false,
          readTime: Math.ceil((dbArticle.content?.split(' ').length || 0) / 200) || 1, // Basic read time calculation
          // Ensure all fields from Article interface are present
        };
        console.log(`[contentStore] fetchArticles: Mapped article ${index + 1}:`, mappedArticle);
        return mappedArticle;
      });
      
      console.log('[contentStore] fetchArticles: Final mapped articles:', fetchedArticles);
      set({ articles: fetchedArticles, isLoading: false });

    } catch (error) {
      console.error('[contentStore] fetchArticles: Catch block error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },
  
  // Helper function to map database articles to our Article interface
  mapArticlesFromDb: (dbArticles: any[]): Article[] => {
    return dbArticles.map((dbArticle: any) => {
      // Set default author information since we don't have author profiles
      const authorName = 'Mystic Banana Author';
      const authorAvatar = '';
      
      // Get category if available (handle both array or direct object format)
      let categoryName = 'Uncategorized';
      if (Array.isArray(dbArticle.categories) && dbArticle.categories.length > 0) {
        categoryName = dbArticle.categories[0].name;
      } else if (dbArticle.categories && typeof dbArticle.categories === 'object' && 'name' in dbArticle.categories) {
        categoryName = dbArticle.categories.name;
      }
      
      // Convert category name to ContentCategory type
      const category = categoryName.toLowerCase() as ContentCategory;
      
      // Calculate read time (1 minute per 200 words, minimum 1 minute)
      const wordCount = dbArticle.content ? dbArticle.content.split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      
      // Create the mapped article
      return {
        id: dbArticle.id,
        title: dbArticle.title,
        slug: dbArticle.slug,
        excerpt: dbArticle.meta_description || '',
        content: dbArticle.content || '',
        coverImage: dbArticle.featured_image_url || 'https://images.pexels.com/photos/6952861/pexels-photo-6952861.jpeg?auto=compress&cs=tinysrgb&w=1600',
        authorId: dbArticle.author_id || 'system-author',
        authorName,
        authorAvatar,
        publishedAt: dbArticle.published_at || new Date().toISOString(),
        category,
        tags: dbArticle.tags || [],
        isPremium: dbArticle.is_premium || false,
        readTime,
        status: dbArticle.status || 'published',
      };
    });
  },
  
  fetchAllArticles: async () => {
    console.log('[contentStore] fetchAllArticles called.');
    set({ isLoading: true, error: null });
    try {
      // Use a simplified query that doesn't rely on relationships
      const { data: dbData, error: dbError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(30); // Limit to 30 articles
      
      // If successful, get categories in a separate query
      if (!dbError && dbData && dbData.length > 0) {
        // Get all category_ids from the articles
        const categoryIds = dbData
          .map(article => article.category_id)
          .filter(id => id !== null && id !== undefined);
          
        // Fetch categories if we have any category IDs
        if (categoryIds.length > 0) {
          const { data: categoriesData } = await supabase
            .from('categories')
            .select('id, name')
            .in('id', categoryIds);
            
          // Add category info to each article
          if (categoriesData) {
            dbData.forEach(article => {
              if (article.category_id) {
                const category = categoriesData.find(cat => cat.id === article.category_id);
                if (category) {
                  article.categories = category;
                }
              }
            });
          }
        }
      }

      if (dbError) {
        console.error('[contentStore] fetchAllArticles: Supabase error:', dbError.message);
        throw dbError;
      }

      if (!dbData || dbData.length === 0) {
        console.warn('[contentStore] fetchAllArticles: No data returned from Supabase.');
        set({ allArticles: [], isLoading: false });
        return;
      }

      console.log(`[contentStore] fetchAllArticles: Received ${dbData.length} articles from Supabase.`);

      // Use the helper function to map database articles to our interface
      const articles = useContentStore.getState().mapArticlesFromDb(dbData);

      set({ allArticles: articles, isLoading: false });
    } catch (error) {
      console.error('[contentStore] fetchAllArticles: Catch block error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },
  
  fetchFeaturedContent: async () => {
    console.log('[contentStore] fetchFeaturedContent called.');
    set({ isLoading: true, error: null });
    try {
      // Use a simplified query that doesn't rely on relationships
      const { data: dbData, error: dbError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6); // Fetch 6 articles for featured content
      
      // If successful, get categories in a separate query
      if (!dbError && dbData && dbData.length > 0) {
        // Get all category_ids from the articles
        const categoryIds = dbData
          .map(article => article.category_id)
          .filter(id => id !== null && id !== undefined);
          
        // Fetch categories if we have any category IDs
        if (categoryIds.length > 0) {
          const { data: categoriesData } = await supabase
            .from('categories')
            .select('id, name')
            .in('id', categoryIds);
            
          // Add category info to each article
          if (categoriesData) {
            dbData.forEach(article => {
              if (article.category_id) {
                const category = categoriesData.find(cat => cat.id === article.category_id);
                if (category) {
                  article.categories = category;
                }
              }
            });
          }
        }
      }

      console.log('[contentStore] fetchFeaturedContent: Supabase response - dbData:', dbData);
      if (dbError) {
        console.error('[contentStore] fetchFeaturedContent: Supabase error:', dbError.message);
        throw dbError;
      }

      if (!dbData || dbData.length === 0) {
        console.warn('[contentStore] fetchFeaturedContent: No data returned from Supabase for featured content.');
        
        // Try to fetch any articles, even if not marked as featured - simplified query
        const { data: backupData, error: backupError } = await supabase
          .from('articles')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(6);
          
        // If successful, get categories in a separate query
        if (!backupError && backupData && backupData.length > 0) {
          // Get all category_ids from the articles
          const categoryIds = backupData
            .map(article => article.category_id)
            .filter(id => id !== null && id !== undefined);
            
          // Fetch categories if we have any category IDs
          if (categoryIds.length > 0) {
            const { data: categoriesData } = await supabase
              .from('categories')
              .select('id, name')
              .in('id', categoryIds);
              
            // Add category info to each article
            if (categoriesData) {
              backupData.forEach(article => {
                if (article.category_id) {
                  const category = categoriesData.find(cat => cat.id === article.category_id);
                  if (category) {
                    article.categories = category;
                  }
                }
              });
            }
          }
        }
        
        if (backupError || !backupData || backupData.length === 0) {
          console.error('[contentStore] fetchFeaturedContent: No articles found in backup attempt:', backupError?.message);
          set({ featuredContent: [], isLoading: false });
          return;
        }
        
        // Process the backup data instead
        const featuredArticles = useContentStore.getState().mapArticlesFromDb(backupData);
        set({ featuredContent: featuredArticles, isLoading: false });
        return;
      }

      console.log(`[contentStore] fetchFeaturedContent: Received ${dbData.length} raw articles from Supabase.`);

      // Use our helper function to map database articles to our interface
      const featuredArticles = useContentStore.getState().mapArticlesFromDb(dbData);

      console.log('[contentStore] fetchFeaturedContent: Final mapped featured articles:', featuredArticles);
      set({ featuredContent: featuredArticles, isLoading: false });

    } catch (error) {
      console.error('[contentStore] fetchFeaturedContent: Catch block error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },
  
  fetchPodcasts: async (categoryName?: string) => {
    console.log('[contentStore] fetchPodcasts called. Category:', categoryName);
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('podcasts')
        .select(`
          id, title, slug, description, cover_image_url, audio_url,
          duration_seconds, host_name, published_at, tags, is_premium, status,
          categories (id, name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (categoryName) {
        console.log('[contentStore] fetchPodcasts: Filtering by category name:', categoryName);
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();

        if (categoryError || !categoryData) {
          console.error('[contentStore] fetchPodcasts: Error fetching category ID or category not found:', categoryName, categoryError);
          set({ isLoading: false, error: `Category '${categoryName}' not found for podcasts.` });
          return;
        }
        console.log('[contentStore] fetchPodcasts: Found category ID:', categoryData.id, 'for name:', categoryName);
        query = query.eq('category_id', categoryData.id);
      }

      const { data: dbData, error: dbError } = await query;

      if (dbError) {
        console.error('[contentStore] fetchPodcasts: Supabase error:', dbError.message);
        throw dbError;
      }

      if (!dbData) {
        console.warn('[contentStore] fetchPodcasts: No data returned from Supabase.');
        set({ podcasts: [], isLoading: false });
        return;
      }

      console.log(`[contentStore] fetchPodcasts: Received ${dbData.length} raw podcasts from Supabase.`);

      const fetchedPodcasts = dbData.map((dbPodcast: any) => {
        const mappedPodcast: Podcast = {
          id: dbPodcast.id,
          title: dbPodcast.title,
          // slug: dbPodcast.slug, // Slug is not in Podcast interface, but good to have in DB
          description: dbPodcast.description || '',
          coverImage: dbPodcast.cover_image_url || '',
          audioUrl: dbPodcast.audio_url,
          duration: dbPodcast.duration_seconds || 0,
          hostName: dbPodcast.host_name || 'Mystic Banana Host',
          publishedAt: dbPodcast.published_at,
          category: dbPodcast.categories?.name || 'Uncategorized', // Ensure 'Uncategorized' is a valid ContentCategory
          tags: dbPodcast.tags || [],
          isPremium: dbPodcast.is_premium || false,
        };
        return mappedPodcast;
      });

      console.log('[contentStore] fetchPodcasts: Final mapped podcasts:', fetchedPodcasts);
      set({ podcasts: fetchedPodcasts, isLoading: false });

    } catch (error) {
      console.error('[contentStore] fetchPodcasts: Catch block error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  fetchTarotReadings: async (userId?: string) => {
    console.log('[contentStore] fetchTarotReadings called. UserID:', userId);
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      const baseTarotReadings = mockTarotReading ? [mockTarotReading] : [];
      const readings = userId 
        ? baseTarotReadings.filter((r: TarotReading) => r.userId === userId)
        : baseTarotReadings.slice(0, 5); 
      console.log('[contentStore] fetchTarotReadings: Returning mock readings:', readings);
      set({ tarotReadings: readings, isLoading: false });
    } catch (error) {
      console.error('[contentStore] fetchTarotReadings: Error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  fetchHoroscopes: async (sign?: string) => {
    console.log('[contentStore] fetchHoroscopes called. Sign:', sign);
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      const filteredHoroscopes = sign
        ? mockHoroscopes.filter((h: Horoscope) => h.sign.toLowerCase() === sign.toLowerCase())
        : mockHoroscopes; 
      console.log('[contentStore] fetchHoroscopes: Returning mock horoscopes:', filteredHoroscopes);
      set({ horoscopes: filteredHoroscopes, isLoading: false });
    } catch (error) {
      console.error('[contentStore] fetchHoroscopes: Error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },
  
  fetchDailyTarotReading: async () => {
    console.log('[contentStore] fetchDailyTarotReading called.');
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const dailyReading = mockTarotReading; 
      console.log('[contentStore] fetchDailyTarotReading: Returning mock daily reading:', dailyReading);
      set({ dailyTarotReading: dailyReading, isLoading: false });
    } catch (error) {
      console.error('[contentStore] fetchDailyTarotReading: Error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  fetchDailyHoroscopes: async () => { // Fetches for all signs, or a featured one
    console.log('[contentStore] fetchDailyHoroscopes called.');
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('[contentStore] fetchDailyHoroscopes: Returning all mock horoscopes for daily view:', mockHoroscopes);
      set({ dailyHoroscopes: mockHoroscopes, isLoading: false });
    } catch (error) {
      console.error('[contentStore] fetchDailyHoroscopes: Error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  fetchHoroscope: async (sign: string) => {
    console.log('[contentStore] fetchHoroscope called. Sign:', sign);
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const horoscope = mockHoroscopes.find(h => h.sign.toLowerCase() === sign.toLowerCase());
      
      if (!horoscope) {
        set({ error: 'Horoscope not found for this sign', isLoading: false });
        return undefined;
      }
      
      set({ isLoading: false });
      return horoscope;
    } catch (error) {
      set({ error: 'Failed to fetch horoscope', isLoading: false });
      return undefined;
    }
  },
  
  saveContent: async (_contentId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // This would interact with the user store in a full implementation
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to save content', isLoading: false });
    }
  }
}));


export default useContentStore;