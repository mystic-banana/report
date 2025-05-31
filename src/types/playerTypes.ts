export interface Episode {
  id: string | number; // Assuming id can be string or number, adjust if more specific
  title: string;
  audio_url: string;
  image_url?: string; // Optional as PodcastPlayer has fallback UI
  podcast_name?: string; // Optional as PodcastPlayer has fallback UI
  // Add other fields like duration, description if they become part of the player's needs
}
