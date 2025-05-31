CREATE OR REPLACE FUNCTION public.add_podcast_with_episodes_txn(
    p_name TEXT,
    p_category_id UUID, -- Parameter name and type changed
    p_feed_url TEXT,
    p_description TEXT,
    p_image_url TEXT,
    p_author TEXT,
    p_episodes JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Important for functions that modify data based on admin actions
AS $$
DECLARE
    new_podcast_id UUID;
    episode_data JSONB;
    generated_slug TEXT;
BEGIN
    -- Generate slug from name (assuming public.slugify function exists)
    generated_slug := public.slugify(p_name);

    -- Insert the podcast feed
    INSERT INTO public.podcasts (name, slug, category_id, feed_url, description, image_url, author, last_fetched_at, status)
    VALUES (p_name, generated_slug, p_category_id, p_feed_url, p_description, p_image_url, p_author, NOW(), 'published') -- Using category_id, added slug and status
    RETURNING id INTO new_podcast_id;

    -- Insert episodes if any are provided
    IF p_episodes IS NOT NULL AND jsonb_array_length(p_episodes) > 0 THEN
        FOR episode_data IN SELECT * FROM jsonb_array_elements(p_episodes)
        LOOP
            INSERT INTO public.episodes (
                podcast_id,
                title,
                description,
                pub_date,
                audio_url,
                duration,
                guid,
                image_url
            )
            VALUES (
                new_podcast_id,
                episode_data->>'title',
                episode_data->>'description',
                (episode_data->>'pub_date')::TIMESTAMPTZ,
                episode_data->>'audio_url',
                episode_data->>'duration',
                episode_data->>'guid',
                episode_data->>'image_url'
            )
            ON CONFLICT (podcast_id, guid) DO NOTHING;
        END LOOP;
    END IF;

    RETURN new_podcast_id;
END;
$$;

-- Grant execute permission to the service_role, as the function is called by supabaseAdmin client
GRANT EXECUTE ON FUNCTION public.add_podcast_with_episodes_txn(
    TEXT,
    UUID,
    TEXT,
    TEXT,
    TEXT,
    TEXT,
    JSONB
) TO service_role;
