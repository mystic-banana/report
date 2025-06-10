import React, { useState } from "react";
import {
  Star,
  ThumbsUp,
  Flag,
  Edit,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { usePodcastReviews } from "../../hooks/usePodcastReviews";
import { useAuthStore } from "../../store/authStore";

interface PodcastReviewsSectionProps {
  podcastId: string;
  podcastName?: string;
}

const PodcastReviewsSection: React.FC<PodcastReviewsSectionProps> = ({
  podcastId,
  podcastName = "this podcast",
}) => {
  const { user } = useAuthStore();
  const {
    reviews,
    userReview,
    stats,
    isLoading,
    isSubmitting,
    error,
    submitReview,
    updateReview,
    deleteReview,
    markHelpful,
  } = usePodcastReviews(podcastId);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    content: "",
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = editingReview
      ? await updateReview(
          editingReview,
          formData.rating,
          formData.title,
          formData.content,
        )
      : await submitReview(
          podcastId,
          formData.rating,
          formData.title,
          formData.content,
        );

    if (success) {
      setShowReviewForm(false);
      setEditingReview(null);
      setFormData({ rating: 5, title: "", content: "" });
    }
  };

  const handleEditReview = (review: any) => {
    setFormData({
      rating: review.rating,
      title: review.title || "",
      content: review.content || "",
    });
    setEditingReview(review.id);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      await deleteReview(reviewId);
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRatingChange?: (rating: number) => void,
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={
              interactive && onRatingChange
                ? () => onRatingChange(star)
                : undefined
            }
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 24 : 16}
              className={`${star <= rating ? "text-yellow-400 fill-current" : "text-gray-400"}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...stats.ratingDistribution);

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating - 1];
          const percentage =
            stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-8 text-gray-400">{rating}★</span>
              <div className="flex-1 bg-dark-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-400 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-700 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-dark-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <MessageCircle className="mr-2" size={24} />
          Reviews & Ratings
        </h3>
        {user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md font-medium transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(stats.averageRating))}
          </div>
          <div className="text-gray-400 text-sm">
            Based on {stats.totalReviews} review
            {stats.totalReviews !== 1 ? "s" : ""}
          </div>
        </div>
        <div>{renderRatingDistribution()}</div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-dark-700 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            {editingReview
              ? "Edit Your Review"
              : `Write a Review for ${podcastName}`}
          </h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating *
              </label>
              {renderStars(formData.rating, true, (rating) =>
                setFormData((prev) => ({ ...prev, rating })),
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Give your review a title"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Review (optional)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 h-24 resize-none"
                placeholder="Share your thoughts about this podcast..."
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.content.length}/500 characters
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white rounded-md font-medium transition-colors"
              >
                {isSubmitting
                  ? "Submitting..."
                  : editingReview
                    ? "Update Review"
                    : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, title: "", content: "" });
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User's Review */}
      {userReview && !showReviewForm && (
        <div className="bg-accent-900/20 border border-accent-700 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-accent-400 font-medium">Your Review</span>
                {renderStars(userReview.rating)}
              </div>
              {userReview.title && (
                <h5 className="font-medium text-white mb-2">
                  {userReview.title}
                </h5>
              )}
              {userReview.content && (
                <p className="text-gray-300 text-sm">{userReview.content}</p>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleEditReview(userReview)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Edit review"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteReview(userReview.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete review"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews
          .filter((review) => review.id !== userReview?.id)
          .map((review) => (
            <div key={review.id} className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {review.user?.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {(review.user?.name || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white text-sm">
                      {review.user?.name || "Anonymous"}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-gray-400 text-xs">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h5 className="font-medium text-white mb-2">{review.title}</h5>
              )}

              {review.content && (
                <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                  {review.content}
                </p>
              )}

              <div className="flex items-center space-x-4 text-xs">
                <button
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                >
                  <ThumbsUp size={14} />
                  <span>Helpful ({review.helpful_count})</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                  <Flag size={14} />
                  <span>Report</span>
                </button>
              </div>
            </div>
          ))}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No reviews yet</p>
            <p className="text-sm">
              Be the first to share your thoughts about this podcast!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastReviewsSection;
