import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/authStore";
import type { PodcastReview } from "../types/podcastTypes";

export const usePodcastReviews = (podcastId?: string) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<PodcastReview[]>([]);
  const [userReview, setUserReview] = useState<PodcastReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0], // 1-5 stars
  });

  // Load reviews for a podcast
  const loadReviews = useCallback(
    async (targetPodcastId?: string) => {
      const id = targetPodcastId || podcastId;
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch reviews with user data from auth.users
        const { data, error: reviewsError } = await supabase
          .from("podcast_reviews")
          .select(
            `
            *,
            user:auth.users!inner(
              id,
              email
            )
          `,
          )
          .eq("podcast_id", id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        // If that fails, try without user join
        if (reviewsError) {
          const { data: simpleData, error: simpleError } = await supabase
            .from("podcast_reviews")
            .select("*")
            .eq("podcast_id", id)
            .eq("status", "published")
            .order("created_at", { ascending: false });

          if (simpleError) throw simpleError;

          const reviewsWithUser = (simpleData || []).map((review) => ({
            ...review,
            user: {
              id: review.user_id,
              name: "Anonymous User",
              avatar_url: null,
            },
          }));

          setReviews(reviewsWithUser);

          // Calculate stats for simple data
          if (reviewsWithUser.length > 0) {
            const totalRating = reviewsWithUser.reduce(
              (sum, review) => sum + review.rating,
              0,
            );
            const averageRating = totalRating / reviewsWithUser.length;

            const distribution = [0, 0, 0, 0, 0];
            reviewsWithUser.forEach((review) => {
              distribution[review.rating - 1]++;
            });

            setStats({
              averageRating: Math.round(averageRating * 10) / 10,
              totalReviews: reviewsWithUser.length,
              ratingDistribution: distribution,
            });
          } else {
            setStats({
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: [0, 0, 0, 0, 0],
            });
          }

          // Load user's review if logged in
          if (user) {
            const userReviewData = reviewsWithUser.find(
              (review) => review.user_id === user.id,
            );
            setUserReview(userReviewData || null);
          }

          return;
        }

        const reviewsWithUser = (data || []).map((review) => ({
          ...review,
          user: {
            id: review.user?.id || review.user_id,
            name: review.user?.email?.split("@")[0] || "Anonymous User",
            avatar_url: null,
          },
        }));

        setReviews(reviewsWithUser);

        // Calculate stats
        if (reviewsWithUser.length > 0) {
          const totalRating = reviewsWithUser.reduce(
            (sum, review) => sum + review.rating,
            0,
          );
          const averageRating = totalRating / reviewsWithUser.length;

          const distribution = [0, 0, 0, 0, 0];
          reviewsWithUser.forEach((review) => {
            distribution[review.rating - 1]++;
          });

          setStats({
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: reviewsWithUser.length,
            ratingDistribution: distribution,
          });
        } else {
          setStats({
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: [0, 0, 0, 0, 0],
          });
        }

        // Load user's review if logged in
        if (user) {
          const userReviewData = reviewsWithUser.find(
            (review) => review.user_id === user.id,
          );
          setUserReview(userReviewData || null);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    },
    [podcastId, user],
  );

  // Submit a review
  const submitReview = useCallback(
    async (
      targetPodcastId: string,
      rating: number,
      title?: string,
      content?: string,
    ) => {
      if (!user) {
        setError("You must be logged in to submit a review");
        return false;
      }

      if (rating < 1 || rating > 5) {
        setError("Rating must be between 1 and 5 stars");
        return false;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        const reviewData = {
          user_id: user.id,
          podcast_id: targetPodcastId,
          rating,
          title: title?.trim() || null,
          content: content?.trim() || null,
          status: "published",
        };

        const { data, error: submitError } = await supabase
          .from("podcast_reviews")
          .upsert(reviewData)
          .select()
          .single();

        if (submitError) throw submitError;

        // Reload reviews to get updated data
        await loadReviews(targetPodcastId);

        return true;
      } catch (err) {
        console.error("Error submitting review:", err);
        setError(
          err instanceof Error ? err.message : "Failed to submit review",
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, loadReviews],
  );

  // Update a review
  const updateReview = useCallback(
    async (
      reviewId: string,
      rating: number,
      title?: string,
      content?: string,
    ) => {
      if (!user) {
        setError("You must be logged in to update a review");
        return false;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("podcast_reviews")
          .update({
            rating,
            title: title?.trim() || null,
            content: content?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reviewId)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        // Reload reviews
        await loadReviews();

        return true;
      } catch (err) {
        console.error("Error updating review:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update review",
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, loadReviews],
  );

  // Delete a review
  const deleteReview = useCallback(
    async (reviewId: string) => {
      if (!user) {
        setError("You must be logged in to delete a review");
        return false;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("podcast_reviews")
          .update({ status: "deleted" })
          .eq("id", reviewId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        // Reload reviews
        await loadReviews();

        return true;
      } catch (err) {
        console.error("Error deleting review:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete review",
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, loadReviews],
  );

  // Mark review as helpful
  const markHelpful = useCallback(
    async (reviewId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase.rpc("increment_review_helpful", {
          review_id: reviewId,
        });

        if (error) throw error;

        // Update local state
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? { ...review, helpful_count: review.helpful_count + 1 }
              : review,
          ),
        );

        return true;
      } catch (err) {
        console.error("Error marking review as helpful:", err);
        return false;
      }
    },
    [user],
  );

  // Report a review
  const reportReview = useCallback(
    async (reviewId: string, reason: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase.from("review_reports").insert({
          review_id: reviewId,
          reporter_id: user.id,
          reason,
        });

        if (error) throw error;

        return true;
      } catch (err) {
        console.error("Error reporting review:", err);
        return false;
      }
    },
    [user],
  );

  // Load reviews when podcast ID changes
  useEffect(() => {
    if (podcastId) {
      loadReviews();
    }
  }, [podcastId, loadReviews]);

  return {
    reviews,
    userReview,
    stats,
    isLoading,
    isSubmitting,
    error,
    loadReviews,
    submitReview,
    updateReview,
    deleteReview,
    markHelpful,
    reportReview,
  };
};
