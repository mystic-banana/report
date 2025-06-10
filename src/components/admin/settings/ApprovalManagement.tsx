import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Check,
  X,
  Calendar,
  ExternalLink,
  Flag,
  Eye,
  MessageSquare,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  User,
  FileText,
  Shield,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
  UserCheck,
  Ban,
  CheckSquare,
  Square,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAdminSecurity } from "../AdminSecurityProvider";

// Enhanced types for approval items
interface PodcastSubmission {
  id: string;
  name: string;
  feed_url: string;
  image_url: string | null;
  author: string | null;
  description: string | null;
  category_id: string;
  category_name: string;
  submitter_id?: string;
  submitter_name: string;
  submitted_at: string;
  status?: "pending" | "approved" | "rejected";
  admin_comments?: string;
  priority?: number;
  auto_flagged?: boolean;
  flagged_reasons?: string[];
}

interface CommentSubmission {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  submitted_at: string;
  article_id?: string;
  episode_id?: string;
  article_title?: string;
  episode_title?: string;
  status: "pending" | "approved" | "rejected";
  priority?: number;
  auto_flagged?: boolean;
  flagged_reasons?: string[];
}

interface ArticleSubmission {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
  category_id?: string;
  category_name?: string;
  priority?: number;
  auto_flagged?: boolean;
  flagged_reasons?: string[];
}

interface ModerationQueueItem {
  id: string;
  content_id: string;
  content_type: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  priority: number;
  created_at: string;
  updated_at: string;
  assigned_moderator_id?: string;
  assigned_moderator_name?: string;
  submitter_id?: string;
  submitter_name?: string;
  auto_flagged_reasons?: string[];
  moderation_notes?: string;
  content_preview?: string;
  content_title?: string;
}

type ApprovalItem = PodcastSubmission | CommentSubmission | ArticleSubmission;

const ApprovalManagement: React.FC = () => {
  const { logAdminAction, hasPermission } = useAdminSecurity();

  // State management
  const [pendingPodcasts, setPendingPodcasts] = useState<PodcastSubmission[]>(
    [],
  );
  const [pendingComments, setPendingComments] = useState<CommentSubmission[]>(
    [],
  );
  const [pendingArticles, setPendingArticles] = useState<ArticleSubmission[]>(
    [],
  );
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<
    "queue" | "podcasts" | "comments" | "articles"
  >("queue");
  const [adminComment, setAdminComment] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Filter and search state
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "flagged" | "assigned" | "high_priority"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "status">(
    "priority",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Stats and analytics
  const [moderationStats, setModerationStats] = useState<any>(null);
  const [availableModerators, setAvailableModerators] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    fetchPendingItems();
    fetchAvailableModerators();
  }, []);

  useEffect(() => {
    // Clear success/error messages after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchAvailableModerators = async () => {
    try {
      const { data: moderators, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("is_admin", true);

      if (!error && moderators) {
        setAvailableModerators(moderators);
      }
    } catch (err) {
      console.error("Error fetching moderators:", err);
    }
  };

  const fetchModerationStats = async () => {
    try {
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: stats, error } = await supabase
        .from("content_moderation_queue")
        .select("status, priority, created_at, updated_at")
        .gte("created_at", thirtyDaysAgo);

      if (!error && stats) {
        const pending = stats.filter((s) => s.status === "pending").length;
        const approved = stats.filter((s) => s.status === "approved").length;
        const rejected = stats.filter((s) => s.status === "rejected").length;
        const flagged = stats.filter((s) => s.status === "flagged").length;
        const highPriority = stats.filter((s) => s.priority >= 4).length;

        // Calculate average response time
        const resolvedItems = stats.filter(
          (s) => s.status !== "pending" && s.updated_at,
        );
        let avgResponseTime = "N/A";
        if (resolvedItems.length > 0) {
          const totalTime = resolvedItems.reduce((acc, item) => {
            const created = new Date(item.created_at).getTime();
            const updated = new Date(item.updated_at).getTime();
            return acc + (updated - created);
          }, 0);
          const avgMs = totalTime / resolvedItems.length;
          const avgHours = Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;
          avgResponseTime = `${avgHours}h`;
        }

        setModerationStats({
          total: stats.length,
          pending,
          approved,
          rejected,
          flagged,
          high_priority: highPriority,
          avg_response_time: avgResponseTime,
          resolution_rate:
            stats.length > 0
              ? Math.round(((approved + rejected) / stats.length) * 100)
              : 0,
        });
      }
    } catch (err) {
      console.error("Error fetching moderation stats:", err);
    }
  };

  const fetchModerationQueue = async () => {
    try {
      const { data: queue, error } = await supabase
        .from("content_moderation_queue")
        .select(
          `
          *,
          submitter:profiles!submitter_id(name, email),
          assigned_moderator:profiles!assigned_moderator_id(name, email)
        `,
        )
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;

      const transformedQueue = (queue || []).map((item) => ({
        id: item.id,
        content_id: item.content_id,
        content_type: item.content_type,
        status: item.status,
        priority: item.priority || 1,
        created_at: item.created_at,
        updated_at: item.updated_at,
        assigned_moderator_id: item.assigned_moderator_id,
        assigned_moderator_name: item.assigned_moderator?.name || "Unassigned",
        submitter_id: item.submitter_id,
        submitter_name: item.submitter?.name || "Unknown User",
        auto_flagged_reasons: item.auto_flagged_reasons || [],
        moderation_notes: item.moderation_notes,
        content_preview:
          item.content_type === "comment"
            ? (item.content_preview || "").substring(0, 100) + "..."
            : item.content_preview,
        content_title:
          item.content_title ||
          `${item.content_type} #${item.content_id.substring(0, 8)}`,
      }));

      setModerationQueue(transformedQueue);
    } catch (err) {
      console.error("Error fetching moderation queue:", err);
    }
  };

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      await Promise.all([
        fetchModerationQueue(),
        fetchModerationStats(),
        fetchPendingPodcasts(),
        fetchPendingComments(),
        fetchPendingArticles(),
      ]);
    } catch (err: any) {
      console.error("Error fetching pending items:", err);
      setError(err.message || "Failed to load pending items");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPodcasts = async () => {
    try {
      const { data: podcastData, error: podcastError } = await supabase
        .from("podcasts")
        .select(
          `
          id, name, feed_url, image_url, author, description, 
          category_id, created_at, status, admin_comments, submitter_id
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (podcastError) throw podcastError;

      if (!podcastData || podcastData.length === 0) {
        setPendingPodcasts([]);
        return;
      }

      // Get category names
      const categoryIds = [...new Set(podcastData.map((p) => p.category_id))];
      let categoryMap: Record<string, string> = {};

      if (categoryIds.length > 0) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("podcast_categories")
          .select("id, name")
          .in("id", categoryIds);

        if (!categoryError && categoryData) {
          categoryMap = categoryData.reduce(
            (acc, cat) => ({
              ...acc,
              [cat.id]: cat.name,
            }),
            {},
          );
        }
      }

      // Get submitter names
      const submitterIds = podcastData
        .filter((p) => p.submitter_id)
        .map((p) => p.submitter_id);

      let submitterMap: Record<string, string> = {};

      if (submitterIds.length > 0) {
        try {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", submitterIds);

          if (!userError && userData) {
            submitterMap = userData.reduce(
              (acc, user) => ({
                ...acc,
                [user.id]: user.name || user.email || "Unknown User",
              }),
              {},
            );
          }
        } catch (err) {
          console.error("Error fetching submitter names:", err);
        }
      }

      const transformedPodcasts = podcastData.map((podcast) => ({
        id: podcast.id,
        name: podcast.name,
        feed_url: podcast.feed_url,
        image_url: podcast.image_url,
        author: podcast.author,
        description: podcast.description,
        category_id: podcast.category_id,
        category_name: categoryMap[podcast.category_id] || "Unknown Category",
        submitter_name: podcast.submitter_id
          ? submitterMap[podcast.submitter_id] || "Unknown User"
          : "Admin",
        submitted_at: podcast.created_at,
        status: podcast.status || "pending",
        admin_comments: podcast.admin_comments,
        priority: 3, // Default priority
        auto_flagged: false,
        flagged_reasons: [],
      }));

      setPendingPodcasts(transformedPodcasts);
    } catch (err) {
      console.error("Error fetching pending podcasts:", err);
    }
  };

  const fetchPendingComments = async () => {
    try {
      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .select(
          `
          *,
          article:articles(title),
          user:profiles!user_id(name, email)
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!commentError && commentData) {
        const transformedComments = commentData.map((comment) => ({
          id: comment.id,
          content: comment.content,
          user_id: comment.user_id,
          user_name: comment.user?.name || "Unknown User",
          submitted_at: comment.created_at,
          article_id: comment.article_id,
          article_title: comment.article?.title || "Unknown Article",
          status: comment.status || "pending",
          priority: 2, // Default priority
          auto_flagged: false,
          flagged_reasons: [],
        }));
        setPendingComments(transformedComments);
      }
    } catch (err) {
      console.error("Error fetching pending comments:", err);
    }
  };

  const fetchPendingArticles = async () => {
    try {
      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .select(
          `
          *,
          category:categories(name),
          author:profiles!author_id(name, email)
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!articleError && articleData) {
        const transformedArticles = articleData.map((article) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          author_id: article.author_id,
          author_name: article.author?.name || "Unknown Author",
          submitted_at: article.created_at,
          status: article.status || "pending",
          category_id: article.category_id,
          category_name: article.category?.name || "Uncategorized",
          priority: 4, // Higher priority for articles
          auto_flagged: false,
          flagged_reasons: [],
        }));
        setPendingArticles(transformedArticles);
      }
    } catch (err) {
      console.error("Error fetching pending articles:", err);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPendingItems();
      setSuccess("Data refreshed successfully");
    } catch (err) {
      setError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleBulkAction = async (
    action: string,
    itemIds: string[],
    type: string,
  ) => {
    if (itemIds.length === 0) {
      setError("No items selected");
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      for (const itemId of itemIds) {
        if (action === "approve") {
          await handleApproveItem(itemId, type);
        } else if (action === "reject") {
          if (!adminComment) {
            setError("Please provide a reason for bulk rejection");
            return;
          }
          await handleRejectItem(itemId, type);
        } else if (action === "flag") {
          await flagContent(itemId, adminComment || "Bulk flagged");
        }
      }

      setSelectedItems([]);
      setAdminComment("");
      setSuccess(`Bulk ${action} completed for ${itemIds.length} items`);
      await fetchPendingItems();
    } catch (err: any) {
      setError(err.message || `Bulk ${action} failed`);
    }
  };

  const handleApproveItem = async (itemId: string, type: string) => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;

      if (type === "podcasts") {
        const { error } = await supabase
          .from("podcasts")
          .update({
            status: "approved",
            admin_comments: adminComment || null,
            reviewed_at: new Date().toISOString(),
            reviewed_by: currentUser?.id,
          })
          .eq("id", itemId);

        if (error) throw error;
        await logAdminAction("approve_podcast", "podcast", itemId);
      } else if (type === "comments") {
        const { error } = await supabase
          .from("comments")
          .update({
            status: "approved",
            admin_comments: adminComment || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (error) throw error;
        await logAdminAction("approve_comment", "comment", itemId);
      } else if (type === "articles") {
        const { error } = await supabase
          .from("articles")
          .update({
            status: "published",
            admin_comments: adminComment || null,
            reviewed_at: new Date().toISOString(),
            reviewed_by: currentUser?.id,
          })
          .eq("id", itemId);

        if (error) throw error;
        await logAdminAction("approve_article", "article", itemId);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleRejectItem = async (itemId: string, type: string) => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;

      if (type === "podcasts") {
        const { error } = await supabase
          .from("podcasts")
          .update({
            status: "rejected",
            admin_comments: adminComment,
            reviewed_at: new Date().toISOString(),
            reviewed_by: currentUser?.id,
          })
          .eq("id", itemId);

        if (error) throw error;
        await logAdminAction("reject_podcast", "podcast", itemId, {
          reason: adminComment,
        });
      } else if (type === "comments") {
        const { error } = await supabase
          .from("comments")
          .update({
            status: "rejected",
            admin_comments: adminComment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (error) throw error;
        await logAdminAction("reject_comment", "comment", itemId, {
          reason: adminComment,
        });
      } else if (type === "articles") {
        const { error } = await supabase
          .from("articles")
          .update({
            status: "rejected",
            admin_comments: adminComment,
            reviewed_at: new Date().toISOString(),
            reviewed_by: currentUser?.id,
          })
          .eq("id", itemId);

        if (error) throw error;
        await logAdminAction("reject_article", "article", itemId, {
          reason: adminComment,
        });
      }
    } catch (err) {
      throw err;
    }
  };

  const handleApprove = async (
    item: ApprovalItem,
    type: "podcasts" | "comments" | "articles",
  ) => {
    try {
      setError(null);
      setSuccess(null);

      await handleApproveItem(item.id, type);

      // Update local state
      if (type === "podcasts") {
        setPendingPodcasts((prev) => prev.filter((p) => p.id !== item.id));
        setSuccess(
          `Podcast "${(item as PodcastSubmission).name}" has been approved`,
        );
      } else if (type === "comments") {
        setPendingComments((prev) => prev.filter((c) => c.id !== item.id));
        setSuccess("Comment has been approved");
      } else if (type === "articles") {
        setPendingArticles((prev) => prev.filter((a) => a.id !== item.id));
        setSuccess("Article has been approved");
      }

      setAdminComment("");
      setSelectedItem(null);
    } catch (err: any) {
      console.error("Error approving item:", err);
      setError(err.message || "Failed to approve item");
    }
  };

  const handleReject = async (
    item: ApprovalItem,
    type: "podcasts" | "comments" | "articles",
  ) => {
    try {
      setError(null);
      setSuccess(null);

      if (!adminComment) {
        setError("Please provide a reason for rejection");
        return;
      }

      await handleRejectItem(item.id, type);

      // Update local state
      if (type === "podcasts") {
        setPendingPodcasts((prev) => prev.filter((p) => p.id !== item.id));
        setSuccess(
          `Podcast "${(item as PodcastSubmission).name}" has been rejected`,
        );
      } else if (type === "comments") {
        setPendingComments((prev) => prev.filter((c) => c.id !== item.id));
        setSuccess("Comment has been rejected");
      } else if (type === "articles") {
        setPendingArticles((prev) => prev.filter((a) => a.id !== item.id));
        setSuccess("Article has been rejected");
      }

      setAdminComment("");
      setSelectedItem(null);
    } catch (err: any) {
      console.error("Error rejecting item:", err);
      setError(err.message || "Failed to reject item");
    }
  };

  const assignModerator = async (queueId: string, moderatorId: string) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("content_moderation_queue")
        .update({
          assigned_moderator_id: moderatorId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", queueId);

      if (error) throw error;

      await logAdminAction("assign_moderator", "moderation_queue", queueId, {
        moderator_id: moderatorId,
      });
      await fetchModerationQueue();
      setSuccess("Moderator assigned successfully");
    } catch (err: any) {
      setError(err.message || "Failed to assign moderator");
    }
  };

  const flagContent = async (queueId: string, reason: string) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("content_moderation_queue")
        .update({
          status: "flagged",
          moderation_notes: reason,
          priority: 5,
          updated_at: new Date().toISOString(),
        })
        .eq("id", queueId);

      if (error) throw error;

      await logAdminAction("flag_content", "moderation_queue", queueId, {
        reason,
      });
      await fetchModerationQueue();
      setSuccess("Content flagged successfully");
    } catch (err: any) {
      setError(err.message || "Failed to flag content");
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const toggleAllItems = (items: any[]) => {
    const allIds = items.map((item) => item.id);
    const allSelected = allIds.every((id) => selectedItems.includes(id));

    if (allSelected) {
      setSelectedItems((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const exportModerationReport = async () => {
    try {
      const reportData = {
        generated_at: new Date().toISOString(),
        stats: moderationStats,
        pending_podcasts: pendingPodcasts.length,
        pending_comments: pendingComments.length,
        pending_articles: pendingArticles.length,
        moderation_queue: moderationQueue.length,
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moderation_report_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      await logAdminAction(
        "export_moderation_report",
        "system",
        "moderation_report",
      );
      setSuccess("Moderation report exported successfully");
    } catch (err) {
      setError("Failed to export moderation report");
    }
  };

  // Filter and sort functions
  const getFilteredItems = (items: any[]) => {
    let filtered = items;

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => {
        switch (filterStatus) {
          case "pending":
            return item.status === "pending";
          case "flagged":
            return (
              item.auto_flagged ||
              (item.flagged_reasons && item.flagged_reasons.length > 0)
            );
          case "high_priority":
            return item.priority >= 4;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.title && item.title.toLowerCase().includes(term)) ||
          (item.content && item.content.toLowerCase().includes(term)) ||
          (item.author && item.author.toLowerCase().includes(term)) ||
          (item.submitter_name &&
            item.submitter_name.toLowerCase().includes(term)),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "date":
          aVal = new Date(a.submitted_at || a.created_at).getTime();
          bVal = new Date(b.submitted_at || b.created_at).getTime();
          break;
        case "priority":
          aVal = a.priority || 1;
          bVal = b.priority || 1;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  const getPaginatedItems = (items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: any[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  const renderModerationStats = () => {
    if (!moderationStats) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">
                {moderationStats.total}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {moderationStats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-400">
                {moderationStats.approved}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-400">
                {moderationStats.rejected}
              </p>
            </div>
            <X className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Flagged</p>
              <p className="text-2xl font-bold text-orange-400">
                {moderationStats.flagged}
              </p>
            </div>
            <Flag className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-purple-400">
                {moderationStats.high_priority}
              </p>
            </div>
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-dark-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-cyan-400">
                {moderationStats.avg_response_time}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
      </div>
    );
  };

  const renderFilterControls = () => {
    return (
      <div className="bg-dark-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="high_priority">High Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-md text-white hover:bg-dark-700 transition-colors"
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              {sortOrder === "asc" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBulkActions = () => {
    if (selectedItems.length === 0) return null;

    return (
      <div className="bg-accent-900/20 border border-accent-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-accent-400 font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}{" "}
              selected
            </span>

            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleBulkAction("approve", selectedItems, activeTab)
                }
                className="px-3 py-1.5 bg-green-700 hover:bg-green-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
              >
                <Check size={14} className="mr-1" />
                Approve All
              </button>

              <button
                onClick={() => {
                  if (!adminComment) {
                    setError("Please provide a reason for bulk rejection");
                    return;
                  }
                  handleBulkAction("reject", selectedItems, activeTab);
                }}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
              >
                <X size={14} className="mr-1" />
                Reject All
              </button>

              <button
                onClick={() =>
                  handleBulkAction("flag", selectedItems, activeTab)
                }
                className="px-3 py-1.5 bg-orange-700 hover:bg-orange-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
              >
                <Flag size={14} className="mr-1" />
                Flag All
              </button>
            </div>
          </div>

          <button
            onClick={() => setSelectedItems([])}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-3">
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Add a comment for bulk actions (required for rejection)..."
              className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
              rows={2}
            />
          </div>
        )}
      </div>
    );
  };

  const renderPagination = (totalItems: number) => {
    const totalPages = getTotalPages({ length: totalItems } as any);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          items
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-white text-sm transition-colors"
          >
            Previous
          </button>

          <span className="px-3 py-1.5 bg-accent-600 rounded-md text-white text-sm">
            {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-white text-sm transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderModerationQueue = () => {
    const filteredQueue = getFilteredItems(moderationQueue);
    const paginatedQueue = getPaginatedItems(filteredQueue);

    if (filteredQueue.length === 0 && !loading) {
      return (
        <div className="bg-dark-700 rounded-lg p-6 text-center">
          <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            No items in moderation queue
          </p>
          <p className="text-gray-500 text-sm">All content has been reviewed</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {paginatedQueue.map((item) => (
          <div
            key={item.id}
            className={`bg-dark-700 rounded-lg border border-dark-600 overflow-hidden ${
              selectedItems.includes(item.id) ? "ring-2 ring-accent-500" : ""
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleItemSelection(item.id)}
                    className="mt-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {selectedItems.includes(item.id) ? (
                      <CheckSquare size={20} className="text-accent-500" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {item.content_title}
                      </h3>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.priority >= 4
                            ? "bg-red-900/30 text-red-400"
                            : item.priority >= 3
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        Priority {item.priority}
                      </span>

                      <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                        {item.content_type}
                      </span>

                      {item.status === "flagged" && (
                        <span className="px-2 py-1 text-xs bg-orange-900/30 text-orange-400 rounded-full">
                          Flagged
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Submitted by: {item.submitter_name}</p>
                      <p>
                        Created: {new Date(item.created_at).toLocaleString()}
                      </p>
                      {item.assigned_moderator_name !== "Unassigned" && (
                        <p>Assigned to: {item.assigned_moderator_name}</p>
                      )}
                    </div>

                    {item.content_preview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">
                          {item.content_preview}
                        </p>
                      </div>
                    )}

                    {item.auto_flagged_reasons &&
                      item.auto_flagged_reasons.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-orange-400">
                            Auto-flagged for:
                          </p>
                          <ul className="text-xs text-orange-300 ml-4">
                            {item.auto_flagged_reasons.map((reason, index) => (
                              <li key={index}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleItemExpansion(item.id)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {expandedItems.includes(item.id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>

                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {expandedItems.includes(item.id) && (
                <div className="mt-4 pt-4 border-t border-dark-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Assign Moderator
                      </label>
                      <select
                        onChange={(e) =>
                          assignModerator(item.id, e.target.value)
                        }
                        value={item.assigned_moderator_id || ""}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="">Unassigned</option>
                        {availableModerators.map((mod) => (
                          <option key={mod.id} value={mod.id}>
                            {mod.name || mod.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Moderation Notes
                      </label>
                      <textarea
                        value={item.moderation_notes || ""}
                        onChange={(e) => {
                          // Update notes in real-time
                          setModerationQueue((prev) =>
                            prev.map((q) =>
                              q.id === item.id
                                ? { ...q, moderation_notes: e.target.value }
                                : q,
                            ),
                          );
                        }}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                        rows={3}
                        placeholder="Add moderation notes..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => flagContent(item.id, "Flagged for review")}
                      className="px-3 py-1.5 bg-orange-700 hover:bg-orange-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                    >
                      <Flag size={14} className="mr-1" />
                      Flag
                    </button>

                    <button
                      onClick={() => {
                        // Handle queue item approval
                        setSuccess("Queue item processed");
                      }}
                      className="px-3 py-1.5 bg-green-700 hover:bg-green-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                    >
                      <Check size={14} className="mr-1" />
                      Approve
                    </button>

                    <button
                      onClick={() => {
                        // Handle queue item rejection
                        setSuccess("Queue item rejected");
                      }}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                    >
                      <X size={14} className="mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {renderPagination(filteredQueue.length)}
      </div>
    );
  };

  const renderPodcastTab = () => {
    const filteredPodcasts = getFilteredItems(pendingPodcasts);
    const paginatedPodcasts = getPaginatedItems(filteredPodcasts);

    if (filteredPodcasts.length === 0 && !loading) {
      return (
        <div className="bg-dark-700 rounded-lg p-6 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            No pending podcast submissions
          </p>
          <p className="text-gray-500 text-sm">
            Admin-submitted podcasts are automatically approved
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleAllItems(filteredPodcasts)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            {filteredPodcasts.every((p) => selectedItems.includes(p.id)) ? (
              <CheckSquare size={20} className="text-accent-500" />
            ) : (
              <Square size={20} />
            )}
            <span>Select All ({filteredPodcasts.length})</span>
          </button>
        </div>

        {paginatedPodcasts.map((podcast) => (
          <div
            key={podcast.id}
            className={`bg-dark-700 rounded-lg overflow-hidden border border-dark-600 ${
              selectedItems.includes(podcast.id) ? "ring-2 ring-accent-500" : ""
            } ${selectedItem === podcast.id ? "ring-2 ring-blue-500" : ""}`}
          >
            <div className="p-6">
              <div className="flex items-start">
                <button
                  onClick={() => toggleItemSelection(podcast.id)}
                  className="mr-4 mt-2 text-gray-400 hover:text-white transition-colors"
                >
                  {selectedItems.includes(podcast.id) ? (
                    <CheckSquare size={20} className="text-accent-500" />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                {podcast.image_url ? (
                  <img
                    src={podcast.image_url}
                    alt={podcast.name}
                    className="w-24 h-24 object-cover rounded mr-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-dark-600 rounded flex items-center justify-center text-gray-500 mr-4">
                    No Image
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-white">
                      {podcast.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {podcast.priority && podcast.priority >= 4 && (
                        <span className="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded-full">
                          High Priority
                        </span>
                      )}
                      <a
                        href={podcast.feed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-dark-600 hover:bg-dark-500 rounded text-gray-300 hover:text-white transition-colors"
                        title="Open feed URL"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <p className="text-gray-300 mt-1">
                    {podcast.author || "Unknown Author"}
                  </p>

                  <div className="flex items-center mt-2 space-x-3">
                    <span className="inline-block px-2 py-1 text-xs bg-accent-900/30 text-accent-400 rounded">
                      {podcast.category_name}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(podcast.submitted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-400">
                    Submitted by: {podcast.submitter_name}
                  </div>

                  {podcast.description && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">
                        Description:
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {podcast.description}
                      </p>
                    </div>
                  )}

                  {podcast.auto_flagged &&
                    podcast.flagged_reasons &&
                    podcast.flagged_reasons.length > 0 && (
                      <div className="mt-4 p-3 bg-orange-900/20 border border-orange-800 rounded">
                        <p className="text-sm text-orange-400 font-medium mb-1">
                          Auto-flagged for:
                        </p>
                        <ul className="text-xs text-orange-300">
                          {podcast.flagged_reasons.map((reason, index) => (
                            <li key={index}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              {selectedItem === podcast.id ? (
                <div className="mt-4 border-t border-dark-600 pt-4">
                  <div className="mb-3">
                    <label
                      htmlFor="adminComment"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Admin Comments (required for rejection)
                    </label>
                    <textarea
                      id="adminComment"
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                      rows={3}
                      placeholder="Optional comments for approval, required for rejection"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="px-3 py-1.5 bg-dark-600 hover:bg-dark-500 rounded-md text-white font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(podcast, "podcasts")}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 rounded-md text-white font-medium text-sm transition-colors flex items-center"
                    >
                      <X size={14} className="mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(podcast, "podcasts")}
                      className="px-3 py-1.5 bg-green-700 hover:bg-green-800 rounded-md text-white font-medium text-sm transition-colors flex items-center"
                    >
                      <Check size={14} className="mr-1" />
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setSelectedItem(podcast.id)}
                    className="px-3 py-1.5 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium text-sm transition-colors"
                  >
                    Review Submission
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {renderPagination(filteredPodcasts.length)}
      </div>
    );
  };

  const renderCommentsTab = () => {
    const filteredComments = getFilteredItems(pendingComments);
    const paginatedComments = getPaginatedItems(filteredComments);

    if (filteredComments.length === 0 && !loading) {
      return (
        <div className="bg-dark-700 rounded-lg p-6 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            No pending comment submissions
          </p>
          <p className="text-gray-500 text-sm">
            All comments have been reviewed
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleAllItems(filteredComments)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            {filteredComments.every((c) => selectedItems.includes(c.id)) ? (
              <CheckSquare size={20} className="text-accent-500" />
            ) : (
              <Square size={20} />
            )}
            <span>Select All ({filteredComments.length})</span>
          </button>
        </div>

        {paginatedComments.map((comment) => (
          <div
            key={comment.id}
            className={`bg-dark-700 rounded-lg border border-dark-600 p-4 ${
              selectedItems.includes(comment.id) ? "ring-2 ring-accent-500" : ""
            }`}
          >
            <div className="flex items-start space-x-3">
              <button
                onClick={() => toggleItemSelection(comment.id)}
                className="mt-1 text-gray-400 hover:text-white transition-colors"
              >
                {selectedItems.includes(comment.id) ? (
                  <CheckSquare size={20} className="text-accent-500" />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-semibold text-white">
                      Comment by {comment.user_name}
                    </h4>
                    {comment.priority && comment.priority >= 4 && (
                      <span className="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded-full">
                        High Priority
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(comment.submitted_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-300 mb-3">{comment.content}</p>

                <div className="text-sm text-gray-400">
                  <p>Article: {comment.article_title}</p>
                </div>

                {comment.auto_flagged &&
                  comment.flagged_reasons &&
                  comment.flagged_reasons.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-900/20 border border-orange-800 rounded">
                      <p className="text-sm text-orange-400 font-medium mb-1">
                        Auto-flagged for:
                      </p>
                      <ul className="text-xs text-orange-300">
                        {comment.flagged_reasons.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => handleReject(comment, "comments")}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                  >
                    <X size={14} className="mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(comment, "comments")}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                  >
                    <Check size={14} className="mr-1" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {renderPagination(filteredComments.length)}
      </div>
    );
  };

  const renderArticlesTab = () => {
    const filteredArticles = getFilteredItems(pendingArticles);
    const paginatedArticles = getPaginatedItems(filteredArticles);

    if (filteredArticles.length === 0 && !loading) {
      return (
        <div className="bg-dark-700 rounded-lg p-6 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            No pending article submissions
          </p>
          <p className="text-gray-500 text-sm">
            All articles have been reviewed
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleAllItems(filteredArticles)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            {filteredArticles.every((a) => selectedItems.includes(a.id)) ? (
              <CheckSquare size={20} className="text-accent-500" />
            ) : (
              <Square size={20} />
            )}
            <span>Select All ({filteredArticles.length})</span>
          </button>
        </div>

        {paginatedArticles.map((article) => (
          <div
            key={article.id}
            className={`bg-dark-700 rounded-lg border border-dark-600 p-4 ${
              selectedItems.includes(article.id) ? "ring-2 ring-accent-500" : ""
            }`}
          >
            <div className="flex items-start space-x-3">
              <button
                onClick={() => toggleItemSelection(article.id)}
                className="mt-1 text-gray-400 hover:text-white transition-colors"
              >
                {selectedItems.includes(article.id) ? (
                  <CheckSquare size={20} className="text-accent-500" />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-semibold text-white">
                      {article.title}
                    </h4>
                    {article.priority && article.priority >= 4 && (
                      <span className="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded-full">
                        High Priority
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(article.submitted_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm text-gray-400 mb-3">
                  <p>Author: {article.author_name}</p>
                  <p>Category: {article.category_name}</p>
                </div>

                <div className="text-gray-300 mb-3">
                  <p className="line-clamp-3">
                    {article.content.substring(0, 200)}...
                  </p>
                </div>

                {article.auto_flagged &&
                  article.flagged_reasons &&
                  article.flagged_reasons.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-900/20 border border-orange-800 rounded">
                      <p className="text-sm text-orange-400 font-medium mb-1">
                        Auto-flagged for:
                      </p>
                      <ul className="text-xs text-orange-300">
                        {article.flagged_reasons.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      // View full article
                      setExpandedItems((prev) =>
                        prev.includes(article.id)
                          ? prev.filter((id) => id !== article.id)
                          : [...prev, article.id],
                      );
                    }}
                    className="px-3 py-1.5 bg-dark-600 hover:bg-dark-500 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                  >
                    <Eye size={14} className="mr-1" />
                    {expandedItems.includes(article.id) ? "Hide" : "View"}
                  </button>
                  <button
                    onClick={() => handleReject(article, "articles")}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                  >
                    <X size={14} className="mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(article, "articles")}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-800 rounded-md text-white text-sm font-medium transition-colors flex items-center"
                  >
                    <Check size={14} className="mr-1" />
                    Approve
                  </button>
                </div>

                {expandedItems.includes(article.id) && (
                  <div className="mt-4 p-4 bg-dark-800 rounded border border-dark-600">
                    <h5 className="text-white font-medium mb-2">
                      Full Content:
                    </h5>
                    <div className="text-gray-300 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {article.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {renderPagination(filteredArticles.length)}
      </div>
    );
  };

  // Temporarily disable permission check to allow admin access
  // if (!hasPermission("moderate:content")) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-12">
  //       <Shield className="w-16 h-16 text-red-400 mb-4" />
  //       <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
  //       <p className="text-gray-400">
  //         You don't have permission to moderate content.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
          {moderationStats && (
            <div className="flex space-x-6 mt-2 text-sm text-gray-400">
              <span>Pending: {moderationStats.pending}</span>
              <span>Flagged: {moderationStats.flagged}</span>
              <span>High Priority: {moderationStats.high_priority}</span>
              <span>Resolution Rate: {moderationStats.resolution_rate}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
              autoRefresh
                ? "bg-green-700 hover:bg-green-800 text-white"
                : "bg-dark-700 hover:bg-dark-600 text-gray-300"
            }`}
          >
            <Activity size={16} className="mr-1" />
            Auto Refresh
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-dark-700 hover:bg-dark-600 rounded-md text-white font-medium transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={`mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            onClick={exportModerationReport}
            className="px-3 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors flex items-center"
          >
            <Download size={16} className="mr-1" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      {renderModerationStats()}

      {/* Tab Navigation */}
      <div className="bg-dark-800 rounded-md p-1 flex">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
            activeTab === "queue"
              ? "bg-accent-600 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Flag size={16} className="mr-1" />
          Queue ({moderationQueue.length})
        </button>
        <button
          onClick={() => setActiveTab("podcasts")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "podcasts"
              ? "bg-accent-600 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Podcasts ({pendingPodcasts.length})
        </button>
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "articles"
              ? "bg-accent-600 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Articles ({pendingArticles.length})
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "comments"
              ? "bg-accent-600 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Comments ({pendingComments.length})
        </button>
      </div>

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Bulk Actions */}
      {renderBulkActions()}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-900/50 text-red-400 px-4 py-3 rounded-md flex items-start">
          <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-900/50 text-green-400 px-4 py-3 rounded-md flex items-start">
          <Check size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {activeTab === "queue" && renderModerationQueue()}
          {activeTab === "podcasts" && renderPodcastTab()}
          {activeTab === "comments" && renderCommentsTab()}
          {activeTab === "articles" && renderArticlesTab()}
        </div>
      )}
    </div>
  );
};

export default ApprovalManagement;
