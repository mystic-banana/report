// File: supabase/functions/add-podcast-feed/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// IMPORTANT: Adjust this import path based on your actual project structure
// and how Deno resolves modules in your Supabase Edge Function environment.
// This path assumes 'rssFeedParser.ts' is in 'src/lib/' relative to your project root.
// For Deno deploy, you might need a URL import or ensure the file is bundled.
import { parseRssFeed } from '../../../src/lib/rssFeedParser.ts';

interface AddPodcastFeedRequest {
  feedUrl: string;
  category: string;
}

const getSupabaseAdminClient = (): SupabaseClient => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key not provided in environment variables. Ensure they are set in your Supabase project settings for this function.');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

serve(async (req: Request) => {
  console.log('[add-podcast-feed] Function invoked. Method:', req.method);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient(); // Initialize client EARLIER

    // --- Admin Authentication Block ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('[add-podcast-feed] Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401, // Unauthorized
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      console.warn(`[add-podcast-feed] Invalid or expired token. Error: ${userError?.message}`);
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401, // Unauthorized
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
        console.error(`[add-podcast-feed] Error fetching profile for user ${user.id}:`, profileError);
        return new Response(JSON.stringify({ error: 'Error fetching user profile' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    if (!profile || !profile.is_admin) {
      console.warn(`[add-podcast-feed] User ${user.id} is not an admin.`);
      return new Response(JSON.stringify({ error: 'User is not an admin' }), {
        status: 403, // Forbidden
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- End Admin Authentication Block ---
    
    console.log(`[add-podcast-feed] Admin user ${user.id} authenticated successfully.`);

    const { feedUrl, category }: AddPodcastFeedRequest = await req.json();

    if (!feedUrl || !category) {
      return new Response(JSON.stringify({ error: 'feedUrl and category are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      new URL(feedUrl); // Basic URL validation
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Invalid feed URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`[add-podcast-feed] Request received for admin ${user.id}: feedUrl=${feedUrl}, category=${category}`);

    // supabaseAdmin is already initialized above
    const { feedDetails, episodes: parsedEpisodes } = await parseRssFeed(feedUrl);
    
    console.log(`[add-podcast-feed] Parsed feed: ${feedDetails.name}, Found ${parsedEpisodes.length} episodes.`);

    const { data: podcastId, error: rpcError } = await supabaseAdmin.rpc('add_podcast_with_episodes_txn', {
        p_name: feedDetails.name,
        p_category_id: category, // Use the user-provided category_id, SQL function expects UUID
        p_feed_url: feedUrl,
        p_description: feedDetails.description,
        p_image_url: feedDetails.image_url,
        p_author: feedDetails.author,
        p_episodes: parsedEpisodes.map(ep => ({ // Ensure this structure matches the JSONB expected by the PG function
            title: ep.title,
            description: ep.description,
            pub_date: ep.pub_date,
            audio_url: ep.audio_url,
            duration: ep.duration,
            guid: ep.guid,
            image_url: ep.image_url,
        }))
    });

    if (rpcError) {
      console.error('[add-podcast-feed] Error calling RPC add_podcast_with_episodes_txn:', rpcError);
      // Check for unique constraint violation on feed_url (PostgreSQL error code 23505)
      if (rpcError.code === '23505' && rpcError.message.includes('podcasts_feed_url_key')) {
        return new Response(JSON.stringify({ error: 'This feed URL has already been added.' }), {
          status: 409, // Conflict
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw rpcError; // Rethrow other RPC errors
    }
    
    if (!podcastId) {
        console.error('[add-podcast-feed] RPC did not return a podcast ID.');
        throw new Error('Failed to add podcast feed: No ID returned from database operation.');
    }

    console.log(`[add-podcast-feed] Successfully added podcast with ID: ${podcastId} and its episodes.`);

    return new Response(JSON.stringify({
      message: 'Podcast feed added successfully',
      podcastId: podcastId,
      podcastName: feedDetails.name, // Include the podcast name
      episodeCount: parsedEpisodes.length, // Include the episode count
      imageUrl: feedDetails.image_url, // Include the image URL
      description: feedDetails.description, // Include the description
      author: feedDetails.author // Include the author
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    console.error('[add-podcast-feed] Uncaught error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});