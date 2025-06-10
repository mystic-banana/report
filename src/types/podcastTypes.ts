// Enhanced podcast types for new features

export interface PodcastAnalytics {
  id: string;
  user_id: string;
  episode_id: string;
  podcast_id: string;
  play_started_at: string;
  play_ended_at?: string;
  duration_listened: number;
  total_duration: number;
  completion_percentage: number;
  device_type?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

export interface PodcastReview {
  id: string;
  user_id: string;
  podcast_id: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  reported_count: number;
  status: "draft" | "published" | "hidden" | "deleted";
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
}

export interface PodcastDownload {
  id: string;
  user_id: string;
  episode_id: string;
  podcast_id: string;
  download_started_at: string;
  download_completed_at?: string;
  file_size?: number;
  download_url?: string;
  local_path?: string;
  status: "pending" | "downloading" | "completed" | "failed" | "deleted";
  progress_percentage: number;
  error_message?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PodcastSearchIndex {
  id: string;
  podcast_id?: string;
  episode_id?: string;
  content_type: "podcast" | "episode";
  title: string;
  description?: string;
  tags?: string[];
  topics?: string[];
  keywords?: string[];
  search_vector?: string;
  created_at: string;
  updated_at: string;
}

export interface PodcastPlaylist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  episode_count: number;
  total_duration: number;
  created_at: string;
  updated_at: string;
  episodes?: PlaylistEpisode[];
}

export interface PlaylistEpisode {
  id: string;
  playlist_id: string;
  episode_id: string;
  position: number;
  added_at: string;
  episode?: {
    id: string;
    title: string;
    audio_url: string;
    image_url?: string;
    duration?: string;
    podcast_name?: string;
  };
}

export interface PodcastSubscription {
  id: string;
  user_id: string;
  podcast_id: string;
  subscribed_at: string;
  notification_enabled: boolean;
  auto_download: boolean;
}

export interface PodcastStats {
  id: string;
  name: string;
  unique_listeners: number;
  total_plays: number;
  avg_completion_rate: number;
  total_listen_time: number;
  average_rating: number;
  review_count: number;
  subscriber_count: number;
}

export interface EpisodeStats {
  id: string;
  title: string;
  podcast_id: string;
  unique_listeners: number;
  total_plays: number;
  avg_completion_rate: number;
  total_listen_time: number;
  download_count: number;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  topics?: string[];
  duration?: {
    min?: number;
    max?: number;
  };
  rating?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: "relevance" | "date" | "rating" | "popularity";
  sortOrder?: "asc" | "desc";
}

export interface SearchResult {
  id: string;
  type: "podcast" | "episode";
  title: string;
  description?: string;
  image_url?: string;
  podcast_name?: string;
  rating?: number;
  play_count?: number;
  duration?: string;
  published_at?: string;
  relevance_score?: number;
}

// Enhanced Episode type for player
export interface EnhancedEpisode {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string;
  podcast_name?: string;
  podcast_id: string;
  description?: string;
  pub_date?: string;
  duration?: string;
  download_status?: "none" | "pending" | "downloading" | "completed" | "failed";
  download_progress?: number;
  is_downloaded?: boolean;
  local_path?: string;
}
