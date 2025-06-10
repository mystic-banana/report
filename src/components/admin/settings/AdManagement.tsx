import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Target,
  BarChart3,
  Search,
  Filter,
  Download,
  RefreshCw,
  Image,
  Code,
  Type,
  FileImage,
  ExternalLink,
  TrendingUp,
  Users,
  MousePointer,
} from "lucide-react";
import { adBannerService } from "../../../services/adBannerService";
import { useAdminSecurity } from "../AdminSecurityProvider";
import Button from "../../ui/Button";
import LoadingSpinner from "../../ui/LoadingSpinner";
import type {
  AdBanner,
  AdZone,
  AdBannerFormData,
  AdStats,
} from "../../../types/adTypes";
import toast from "react-hot-toast";

const AdManagement: React.FC = () => {
  const { logAdminAction } = useAdminSecurity();
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [zones, setZones] = useState<AdZone[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterZone, setFilterZone] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"ads" | "stats">("ads");

  const [formData, setFormData] = useState<AdBannerFormData>({
    title: "",
    ad_type: "html",
    content: "",
    cta_text: "",
    target_url: "",
    zones: [],
    start_date: "",
    end_date: "",
    priority: 1,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adsData, zonesData, statsData] = await Promise.all([
        adBannerService.getAdBanners(),
        adBannerService.getAdZones(),
        adBannerService.getAdStats(),
      ]);

      setAds(adsData);
      setZones(zonesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading ad data:", error);
      toast.error("Failed to load ad data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAd) {
        const updated = await adBannerService.updateAdBanner(
          editingAd.id,
          formData,
        );
        if (updated) {
          setAds(ads.map((ad) => (ad.id === editingAd.id ? updated : ad)));
          await logAdminAction(
            "update_ad_banner",
            "ad_banner",
            editingAd.id,
            formData,
          );
          toast.success("Ad banner updated successfully");
        }
      } else {
        const created = await adBannerService.createAdBanner(formData);
        if (created) {
          setAds([created, ...ads]);
          await logAdminAction(
            "create_ad_banner",
            "ad_banner",
            created.id,
            formData,
          );
          toast.success("Ad banner created successfully");
        }
      }

      resetForm();
      loadData(); // Refresh stats
    } catch (error) {
      console.error("Error saving ad banner:", error);
      toast.error("Failed to save ad banner");
    }
  };

  const handleDelete = async (ad: AdBanner) => {
    if (!confirm(`Are you sure you want to delete "${ad.title}"?`)) return;

    try {
      const success = await adBannerService.deleteAdBanner(ad.id);
      if (success) {
        setAds(ads.filter((a) => a.id !== ad.id));
        await logAdminAction("delete_ad_banner", "ad_banner", ad.id);
        toast.success("Ad banner deleted successfully");
        loadData(); // Refresh stats
      }
    } catch (error) {
      console.error("Error deleting ad banner:", error);
      toast.error("Failed to delete ad banner");
    }
  };

  const handleToggleActive = async (ad: AdBanner) => {
    try {
      const updated = await adBannerService.updateAdBanner(ad.id, {
        is_active: !ad.is_active,
      });

      if (updated) {
        setAds(ads.map((a) => (a.id === ad.id ? updated : a)));
        await logAdminAction("toggle_ad_banner", "ad_banner", ad.id, {
          is_active: !ad.is_active,
        });
        toast.success(
          `Ad banner ${updated.is_active ? "activated" : "deactivated"}`,
        );
      }
    } catch (error) {
      console.error("Error toggling ad banner:", error);
      toast.error("Failed to update ad banner");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      ad_type: "html",
      content: "",
      cta_text: "",
      target_url: "",
      zones: [],
      start_date: "",
      end_date: "",
      priority: 1,
      is_active: true,
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const startEdit = (ad: AdBanner) => {
    setFormData({
      title: ad.title,
      ad_type: ad.ad_type,
      content: ad.content,
      cta_text: ad.cta_text || "",
      target_url: ad.target_url || "",
      zones: ad.zones,
      start_date: ad.start_date ? ad.start_date.split("T")[0] : "",
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
      priority: ad.priority,
      is_active: ad.is_active,
    });
    setEditingAd(ad);
    setShowForm(true);
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "svg":
        return <FileImage className="w-4 h-4" />;
      case "html":
        return <Code className="w-4 h-4" />;
      case "text":
        return <Type className="w-4 h-4" />;
      default:
        return <FileImage className="w-4 h-4" />;
    }
  };

  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = !filterZone || ad.zones.includes(filterZone);
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && ad.is_active) ||
      (filterActive === "inactive" && !ad.is_active);

    return matchesSearch && matchesZone && matchesActive;
  });

  const getZoneName = (zoneName: string) => {
    const zone = zones.find((z) => z.name === zoneName);
    return zone ? zone.display_name : zoneName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="text-white ml-4">Loading ad management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Ad Banner Management
          </h2>
          <p className="text-gray-400">
            Manage internal ad banners across your platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={loadData} variant="ghost" size="sm" icon={RefreshCw}>
            Refresh
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            icon={Plus}
          >
            Create Ad Banner
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Ads</p>
                <p className="text-2xl font-bold text-white">
                  {stats.total_ads}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Ads</p>
                <p className="text-2xl font-bold text-white">
                  {stats.active_ads}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">
                  {stats.total_views.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Click Rate</p>
                <p className="text-2xl font-bold text-white">{stats.ctr}%</p>
              </div>
              <MousePointer className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("ads")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "ads"
              ? "bg-accent-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Ad Banners
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "stats"
              ? "bg-accent-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === "ads" && (
        <>
          {/* Filters */}
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search ads..."
                  className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.name}>
                    {zone.display_name}
                  </option>
                ))}
              </select>
              <select
                className="bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <div className="text-sm text-gray-400 flex items-center">
                Showing {filteredAds.length} of {ads.length} ads
              </div>
            </div>
          </div>

          {/* Ad List */}
          <div className="bg-dark-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-600">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Ad
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Zones
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Dates
                    </th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.map((ad) => (
                    <tr
                      key={ad.id}
                      className="border-t border-gray-600 hover:bg-dark-600/50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">
                            {ad.title}
                          </div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            {ad.cta_text || "No CTA"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getAdTypeIcon(ad.ad_type)}
                          <span className="text-gray-300 capitalize">
                            {ad.ad_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {ad.zones.slice(0, 2).map((zone) => (
                            <span
                              key={zone}
                              className="px-2 py-1 bg-accent-600/20 text-accent-300 rounded-full text-xs"
                            >
                              {getZoneName(zone)}
                            </span>
                          ))}
                          {ad.zones.length > 2 && (
                            <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded-full text-xs">
                              +{ad.zones.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">
                          {ad.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(ad)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            ad.is_active
                              ? "bg-green-600/20 text-green-300"
                              : "bg-red-600/20 text-red-300"
                          }`}
                        >
                          {ad.is_active ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          <span>{ad.is_active ? "Active" : "Inactive"}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-400">
                          {ad.start_date && (
                            <div>
                              Start:{" "}
                              {new Date(ad.start_date).toLocaleDateString()}
                            </div>
                          )}
                          {ad.end_date && (
                            <div>
                              End: {new Date(ad.end_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => startEdit(ad)}
                            className="p-1 text-gray-400 hover:text-white hover:bg-dark-600 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad)}
                            className="p-1 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAds.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No ad banners found</p>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="primary"
                  size="sm"
                  className="mt-3"
                >
                  Create Your First Ad
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          {/* Top Performing Ads */}
          <div className="bg-dark-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Performing Ads
            </h3>
            <div className="space-y-3">
              {stats.top_performing_ads.slice(0, 5).map((ad, index) => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between p-3 bg-dark-600 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-accent-400 font-bold">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="text-white font-medium">{ad.title}</div>
                      <div className="text-sm text-gray-400">
                        {ad.views} views • {ad.clicks} clicks
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {ad.ctr.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Performance */}
          <div className="bg-dark-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Zone Performance
            </h3>
            <div className="space-y-3">
              {stats.zone_performance.map((zone) => (
                <div
                  key={zone.zone}
                  className="flex items-center justify-between p-3 bg-dark-600 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">
                      {getZoneName(zone.zone)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {zone.views} views • {zone.clicks} clicks
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {zone.ctr.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ad Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingAd ? "Edit Ad Banner" : "Create Ad Banner"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ad Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ad Type *
                  </label>
                  <select
                    required
                    className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={formData.ad_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ad_type: e.target.value as any,
                      })
                    }
                  >
                    <option value="html">HTML</option>
                    <option value="svg">SVG</option>
                    <option value="image">Image URL</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder={
                      formData.ad_type === "image"
                        ? "https://example.com/image.jpg"
                        : formData.ad_type === "svg"
                          ? "<svg>...</svg>"
                          : formData.ad_type === "html"
                            ? "<div>Your HTML content</div>"
                            : "Your text content"
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      value={formData.cta_text}
                      onChange={(e) =>
                        setFormData({ ...formData, cta_text: e.target.value })
                      }
                      placeholder="Learn More"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target URL
                    </label>
                    <input
                      type="url"
                      className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      value={formData.target_url}
                      onChange={(e) =>
                        setFormData({ ...formData, target_url: e.target.value })
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Zones *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {zones.map((zone) => (
                      <label
                        key={zone.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-600 bg-dark-600 text-accent-600 focus:ring-accent-500"
                          checked={formData.zones.includes(zone.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                zones: [...formData.zones, zone.name],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                zones: formData.zones.filter(
                                  (z) => z !== zone.name,
                                ),
                              });
                            }
                          }}
                        />
                        <span className="text-sm text-gray-300">
                          {zone.display_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-dark-600 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600 bg-dark-600 text-accent-600 focus:ring-accent-500"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm text-gray-300">Active</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" onClick={resetForm} variant="ghost">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingAd ? "Update" : "Create"} Ad Banner
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdManagement;
