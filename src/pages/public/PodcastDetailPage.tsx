import React, { useState, useEffect, useMemo, useRef } from "react";
import DOMPurify from "dompurify";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { fetchEpisodesForPodcast } from "../../utils/fetchEpisodes"; // Assuming this utility exists and works
import {
  Headphones,
  RefreshCw,
  Play,
  List,
  Share2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import PodcastPlayer from "../../components/podcasts/PodcastPlayer";
import PodcastPlaylist from "../../components/podcasts/PodcastPlaylist";
import CurrentPodcastEpisodeList from "../../components/podcasts/CurrentPodcastEpisodeList";
import FavoritesButton from "../../components/podcasts/FavoritesButton";
import PodcastReviewsSection from "../../components/podcasts/PodcastReviewsSection";
import PodcastDownloadManager from "../../components/podcasts/PodcastDownloadManager";
import AdUnit from "../../components/ads/AdUnit";
// import { formatDistanceToNow } from 'date-fns'; // Use if needed, or implement formatDate
import { useAuthStore } from "../../store/authStore";
import { usePlayerStore } from "../../store/playerStore";
import type { Episode } from "../../types/playerTypes";
import SEO from "../../components/SEO";

// Define specific types for podcast and episode data
interface EpisodeTypeFromDB {
  id: string;
  title: string;
  audio_url?: string | null;
  enclosure_url?: string | null;
  image_url?: string | null;
  description?: string | null;
  pub_date?: string | null;
  duration?: string | number | null;
  podcast_id?: string;
}

interface PodcastType {
  id: string;
  slug?: string | null;
  name: string;
  author?: string | null;
  last_updated?: string | null;
  description?: string | null;
  image_url?: string | null;
  feed_url?: string | null;
  category_id?: string | number | null;
  category?: string | null;
  status?: string;
  Episodes?: EpisodeTypeFromDB[];
}

// Helper function to check if a string is a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Placeholder utility functions - implement or import real ones
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const PodcastDetailPage: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { currentEpisode: playerStoreCurrentEpisode } = usePlayerStore();

  const [podcast, setPodcast] = useState<PodcastType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingEpisodes, setRefreshingEpisodes] = useState(false);
  const [recommendedPodcasts, setRecommendedPodcasts] = useState<PodcastType[]>(
    [],
  );
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const episodesRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const sortedEpisodes = useMemo(() => {
    if (!podcast || !podcast.Episodes || !Array.isArray(podcast.Episodes)) {
      return [];
    }
    return [...podcast.Episodes].sort(
      (a: EpisodeTypeFromDB, b: EpisodeTypeFromDB) => {
        const dateA = a && a.pub_date ? new Date(a.pub_date).getTime() : 0;
        const dateB = b && b.pub_date ? new Date(b.pub_date).getTime() : 0;
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
      },
    );
  }, [podcast]);

  const mappedEpisodes: Episode[] = useMemo(() => {
    if (!podcast || !Array.isArray(sortedEpisodes)) {
      return [];
    }
    return sortedEpisodes.map((ep: EpisodeTypeFromDB) => ({
      id: ep.id,
      title: ep.title || "Untitled Episode",
      audio_url: ep.audio_url || ep.enclosure_url || "", // Ensure string
      image_url: ep.image_url || podcast?.image_url || "", // Ensure string
      podcast_name: podcast?.name || "Unknown Podcast",
      description: ep.description || "",
      pub_date: ep.pub_date || new Date().toISOString(),
      duration: String(ep.duration || 0), // Ensure string
      podcast_id: podcast?.id || "",
    }));
  }, [sortedEpisodes, podcast]);

  const fetchPodcastAndEpisodes = async () => {
    setLoading(true);
    setError(null);
    setPodcast(null); // Initialize podcast state
    setRecommendedPodcasts([]); // Initialize recommended podcasts

    try {
      if (!slug) {
        setError("Podcast identifier (slug or ID) is missing.");
        setLoading(false);
        return;
      }

      let podcastQuery = supabase
        .from("podcasts")
        .select("*")
        .eq("status", "published");

      if (isUUID(slug)) {
        podcastQuery = podcastQuery.eq("id", slug);
      } else {
        podcastQuery = podcastQuery.eq("slug", slug);
      }

      let { data: podcastData, error: podcastError } =
        await podcastQuery.single();

      // If not found by slug and slug is not a UUID, try matching by name (slug with dashes replaced by spaces)
      if ((podcastError || !podcastData) && !isUUID(slug)) {
        console.log(
          `Podcast not found by slug '${slug}', trying by name match...`,
        );
        const nameMatchQuery = supabase
          .from("podcasts")
          .select("*")
          .ilike("name", `%${slug.replace(/-/g, " ")}%`)
          .eq("status", "published")
          .limit(1)
          .single(); // Use single if you expect only one match or want the first

        const { data: nameMatchData, error: nameMatchError } =
          await nameMatchQuery;

        if (nameMatchData && !nameMatchError) {
          console.log("Found podcast by name match:", nameMatchData.name);
          podcastData = nameMatchData;
          podcastError = null; // Clear previous error
        } else {
          // If name match also fails or errors
          if (nameMatchError && nameMatchError.code !== "PGRST116") {
            // PGRST116 means no rows found, which is not an error in this fallback logic
            console.error(
              "Error fetching podcast by name match:",
              nameMatchError,
            );
          }
        }
      }

      if (podcastError || !podcastData) {
        console.error(
          "Error fetching podcast or podcast not found:",
          podcastError?.message,
        );
        if (podcastError?.code === "PGRST116" || !podcastData) {
          setError(
            "Podcast not found. It might have been moved, deleted, or the link is incorrect.",
          );
        } else {
          setError(
            `Failed to fetch podcast: ${podcastError?.message || "Unknown error"}`,
          );
        }
        setPodcast(null);
        setLoading(false);
        return;
      }

      // At this point, podcastData should be valid
      const currentPodcast = podcastData as PodcastType;

      // 2. Fetch episodes for this podcast
      const { data: episodesData, error: episodesError } = await supabase
        .from("episodes") // Assuming episodes table is 'episodes'
        .select("*")
        .eq("podcast_id", currentPodcast.id) // Assuming foreign key is 'podcast_id'
        .order("pub_date", { ascending: false });

      let finalPodcastWithEpisodes: PodcastType;

      if (episodesError) {
        console.error("Error fetching episodes:", episodesError.message);
        finalPodcastWithEpisodes = { ...currentPodcast, Episodes: [] };
        // Optionally set a partial error if episodes fail but podcast is loaded
        setError(
          `Podcast data loaded, but failed to fetch episodes: ${episodesError.message}. You can try refreshing episodes.`,
        );
      } else {
        finalPodcastWithEpisodes = {
          ...currentPodcast,
          Episodes: episodesData || [],
        };
      }

      setPodcast(finalPodcastWithEpisodes);

      // 3. Fetch recommended podcasts
      if (currentPodcast.category_id) {
        const { data: recommended, error: recommendedError } = await supabase
          .from("podcasts")
          .select("id, name, slug, author, image_url, category_id")
          .eq("status", "published")
          .eq("category_id", currentPodcast.category_id)
          .neq("id", currentPodcast.id) // Exclude the current podcast
          .limit(4);

        if (recommendedError) {
          console.error(
            "Error fetching recommended podcasts:",
            recommendedError.message,
          );
        } else {
          setRecommendedPodcasts((recommended as PodcastType[]) || []);
        }
      } else if (currentPodcast.category) {
        // Fallback if category_id is null but category name exists
        const { data: recommended, error: recommendedError } = await supabase
          .from("podcasts")
          .select("id, name, slug, author, image_url, category")
          .eq("status", "published")
          .eq("category", currentPodcast.category)
          .neq("id", currentPodcast.id)
          .limit(4);
        if (recommendedError) {
          console.error(
            "Error fetching recommended podcasts by category name:",
            recommendedError.message,
          );
        } else {
          setRecommendedPodcasts((recommended as PodcastType[]) || []);
        }
      }
    } catch (err: any) {
      console.error(
        "Unexpected error in fetchPodcastAndEpisodes:",
        err.message,
      );
      setError(
        `An unexpected error occurred: ${err.message || "Unknown error"}`,
      );
      setPodcast(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcastAndEpisodes();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleRefreshEpisodes = async () => {
    if (!podcast?.feed_url || !podcast?.id || refreshingEpisodes) {
      console.warn("Refresh conditions not met or already refreshing.");
      return;
    }
    setRefreshingEpisodes(true);
    try {
      await fetchEpisodesForPodcast(podcast.id, podcast.feed_url); // Removed third argument
      await fetchPodcastAndEpisodes();
      console.log("Episodes refreshed successfully.");
    } catch (error: unknown) {
      console.error("Error refreshing episodes:", error);
      setError("Failed to refresh episodes: " + (error as Error).message);
    } finally {
      setRefreshingEpisodes(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Loading Podcast...">
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-accent-500" />
        </div>
      </PageLayout>
    );
  }

  if (error && !podcast) {
    return (
      <PageLayout title="Error">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Oops! Something went wrong.
          </h1>
          <p className="text-lg text-gray-300 mb-6">{error}</p>
          <Link
            to="/podcasts"
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Back to Podcasts
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!podcast) {
    return (
      <PageLayout title="Podcast Not Found">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Podcast Not Found
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            The podcast you are looking for does not exist or has been moved.
          </p>
          <Link
            to="/podcasts"
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Back to Podcasts
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={podcast.name || "Podcast Details"}>
      <SEO
        title={podcast.name || ""}
        description={podcast.description?.substring(0, 160) || ""}
        ogImage={podcast.image_url || ""} // Changed image to ogImage
      />
      <div className="bg-gradient-to-b from-dark-900 via-dark-850 to-dark-800 text-gray-100">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              {podcast.image_url ? (
                <img
                  src={podcast.image_url}
                  alt={podcast.name}
                  className="rounded-lg shadow-xl w-full aspect-square object-cover mb-6"
                />
              ) : (
                <div className="rounded-lg shadow-xl w-full aspect-square bg-dark-700 flex items-center justify-center mb-6">
                  <Headphones size={64} className="text-accent-500" />
                </div>
              )}
              {user && <FavoritesButton podcastId={podcast.id} />}
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                <List size={18} /> Add to Playlist
              </button>
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-9">
              <h1 className="text-4xl font-bold mb-2 text-white">
                {podcast.name}
              </h1>
              <p className="text-lg text-gray-400 mb-1">
                By {podcast.author || "Unknown Author"}
              </p>
              {podcast.last_updated && (
                <p className="text-sm text-gray-500 mb-4">
                  Last updated: {formatDate(podcast.last_updated)}
                </p>
              )}

              {podcast.description && (
                <div
                  ref={descriptionRef}
                  className="prose prose-invert max-w-none text-gray-300 mb-6"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(podcast.description),
                  }}
                />
              )}

              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={handleRefreshEpisodes}
                  disabled={refreshingEpisodes}
                  className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                  {refreshingEpisodes ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                  {refreshingEpisodes ? "Refreshing..." : "Refresh Episodes"}
                </button>
                <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                  <Share2 size={18} /> Share
                </button>
              </div>

              <div ref={episodesRef}>
                <h2 className="text-2xl font-semibold mb-4 text-white border-b border-dark-700 pb-2">
                  Episodes
                </h2>
                {error && !loading && (
                  <div
                    className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                {mappedEpisodes.length > 0 ? (
                  <CurrentPodcastEpisodeList episodes={mappedEpisodes} />
                ) : (
                  <p className="text-gray-400">
                    No episodes found for this podcast.
                  </p>
                )}
              </div>

              {/* Download Manager */}
              <div className="mt-8">
                <PodcastDownloadManager showFullManager={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8">
          <AdUnit placement="podcast" className="mx-auto" />
        </div>

        {/* Reviews Section */}
        {podcast && (
          <div className="mb-8">
            <PodcastReviewsSection
              podcastId={podcast.id}
              podcastName={podcast.name}
            />
          </div>
        )}
        {recommendedPodcasts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 border-b border-dark-700 pb-3 text-white">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendedPodcasts.map((recommendedPodcast) => (
                <Link
                  key={recommendedPodcast.id}
                  to={`/podcasts/${recommendedPodcast.slug || recommendedPodcast.id}`}
                  className="block group"
                >
                  <div className="bg-dark-800 rounded-lg overflow-hidden hover:bg-dark-700 transition-colors">
                    <div className="aspect-square relative">
                      {recommendedPodcast.image_url ? (
                        <img
                          src={recommendedPodcast.image_url}
                          alt={recommendedPodcast.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-dark-700">
                          <Headphones size={32} className="text-accent-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="bg-accent-500 rounded-full p-3">
                          <Play size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white line-clamp-1 group-hover:text-accent-400 transition-colors">
                        {recommendedPodcast.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                        {recommendedPodcast.author || "Unknown Author"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {playerStoreCurrentEpisode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg">
          <PodcastPlayer />
        </div>
      )}

      {showPlaylistModal && podcast && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-dark-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add to Playlist</h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <PodcastPlaylist
                currentPodcast={{
                  id: podcast.id,
                  name: podcast.name,
                }}
                currentEpisode={
                  playerStoreCurrentEpisode
                    ? {
                        ...playerStoreCurrentEpisode,
                        id: String(playerStoreCurrentEpisode.id), // Ensure id is a string
                        image_url: playerStoreCurrentEpisode.image_url || "", // Ensure string for PodcastPlaylist
                        audio_url: playerStoreCurrentEpisode.audio_url || "", // Ensure string for PodcastPlaylist
                        // @ts-expect-error - Assuming playerStoreCurrentEpisode might not have these yet, will be fixed by updating Episode type
                        duration: String(
                          playerStoreCurrentEpisode.duration || 0,
                        ),
                        // @ts-expect-error - Assuming playerStoreCurrentEpisode might not have these yet, will be fixed by updating Episode type
                        published_at:
                          playerStoreCurrentEpisode.pub_date ||
                          new Date().toISOString(),
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default PodcastDetailPage;
