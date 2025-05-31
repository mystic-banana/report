import React, { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import PageLayout from "../../components/layout/PageLayout";
import { ArrowLeft, Save, Sparkles, Eye, Settings } from "lucide-react";

interface ContentStructure {
  format: string;
  layout_type: string;
  sections: string[];
  max_word_count: number;
  min_word_count: number;
  recipe_specific?: {
    include_prep_time: boolean;
    include_cook_time: boolean;
    include_servings: boolean;
    include_nutrition: boolean;
  };
}

interface SEOSettings {
  title_max_length: number;
  meta_description_max_length: number;
  content_tone: string;
  target_audience: string;
}

interface LayoutConfig {
  hero_style: string;
  card_layout: string;
  color_scheme: string;
  typography: string;
}

interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  ai_prompt?: string;
  generation_frequency?: string;
  content_structure?: ContentStructure;
  seo_settings?: SEOSettings;
  layout_config?: LayoutConfig;
  output_format?: string;
  image_generation_strategy?: string;
  image_style?: string;
  image_prompt_template?: string;
}

const AdminCategoryEditPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [formData, setFormData] = useState<CategoryData>({
    name: "",
    slug: "",
    description: "",
    ai_prompt: "",
    generation_frequency: "manual",
    content_structure: {
      format: "article",
      layout_type: "standard",
      sections: ["title", "content"],
      max_word_count: 600,
      min_word_count: 300,
    },
    seo_settings: {
      title_max_length: 55,
      meta_description_max_length: 150,
      content_tone: "engaging",
      target_audience: "spiritual_seekers",
    },
    layout_config: {
      hero_style: "standard",
      card_layout: "default",
      color_scheme: "default",
      typography: "serif",
    },
    output_format: "html",
    image_generation_strategy: "dalle",
    image_style: "modern, clean, professional",
    image_prompt_template: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        setError("Category ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (fetchError) {
        console.error("Error fetching category:", fetchError);
        setError(`Failed to load category: ${fetchError.message}`);
        setCategory(null);
      } else if (data) {
        setCategory(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          ai_prompt: data.ai_prompt || "",
          generation_frequency: data.generation_frequency || "manual",
          content_structure: data.content_structure || {
            format: "article",
            layout_type: "standard",
            sections: ["title", "content"],
            max_word_count: 600,
            min_word_count: 300,
          },
          seo_settings: data.seo_settings || {
            title_max_length: 55,
            meta_description_max_length: 150,
            content_tone: "engaging",
            target_audience: "spiritual_seekers",
          },
          layout_config: data.layout_config || {
            hero_style: "standard",
            card_layout: "default",
            color_scheme: "default",
            typography: "serif",
          },
          output_format: data.output_format || "html",
          image_generation_strategy: data.image_generation_strategy || "dalle",
          image_style: data.image_style || "modern, clean, professional",
          image_prompt_template: data.image_prompt_template || "",
        });
        setError(null);
      } else {
        setError("Category not found.");
        setCategory(null);
      }
      setLoading(false);
    };

    fetchCategory();
  }, [categoryId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, ""),
      }));
    }
  };

  const handleContentFormatChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const format = e.target.value;
    let sections: string[] = [];
    let layout_type = "standard";
    let max_word_count = 600;
    let min_word_count = 300;

    switch (format) {
      case "recipe":
        sections = [
          "title",
          "introduction",
          "ingredients",
          "instructions",
          "tips",
        ];
        layout_type = "recipe_card";
        max_word_count = 500;
        min_word_count = 250;
        break;
      case "guide":
        sections = [
          "title",
          "introduction",
          "benefits",
          "practice_steps",
          "conclusion",
        ];
        layout_type = "step_by_step";
        max_word_count = 700;
        min_word_count = 400;
        break;
      case "insight":
        sections = ["title", "overview", "key_insights", "practical_advice"];
        layout_type = "mystical";
        max_word_count = 500;
        min_word_count = 250;
        break;
      default:
        sections = ["title", "introduction", "main_content", "conclusion"];
        layout_type = "standard";
        break;
    }

    setFormData((prev) => ({
      ...prev,
      content_structure: {
        ...prev.content_structure!,
        format,
        layout_type,
        sections,
        max_word_count,
        min_word_count,
      },
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CategoryData],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { name, slug } = formData;

    if (!name.trim() || !slug.trim()) {
      alert("Category Name and Slug are required.");
      return;
    }
    setSaving(true);

    const { error: updateError } = await supabase
      .from("categories")
      .update(formData)
      .eq("id", categoryId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      setSuccessMessage(null);
    } else {
      setError(null);
      setSuccessMessage("Category updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Loading Category...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error && !category) {
    return (
      <PageLayout title="Error">
        <div className="text-red-500 text-center p-10">Error: {error}</div>
      </PageLayout>
    );
  }

  if (!category) {
    return (
      <PageLayout title="Category Not Found">
        <div className="text-white text-center p-10">Category not found.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Edit Category: ${category.name}`}>
      <div className="max-w-4xl mx-auto bg-dark-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-600 to-accent-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Edit Category: {category.name}
              </h1>
              <p className="text-accent-100 mt-1">
                Configure AI generation and layout settings
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/categories")}
              className="text-white hover:text-accent-200 flex items-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "basic", label: "Basic Info", icon: Settings },
              { id: "content", label: "Content Structure", icon: Sparkles },
              { id: "layout", label: "Layout & SEO", icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === tab.id
                      ? "border-accent-500 text-accent-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Brief description of this category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Generation Prompt
                </label>
                <textarea
                  name="ai_prompt"
                  value={formData.ai_prompt}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Detailed prompt for AI to generate articles in this category..."
                />
                <p className="text-gray-400 text-sm mt-1">
                  Be specific about the type of content, tone, and target
                  audience.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Generation Frequency
                </label>
                <select
                  name="generation_frequency"
                  value={formData.generation_frequency}
                  onChange={handleInputChange}
                  className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="manual">Manual Only</option>
                  <option value="1day">Daily</option>
                  <option value="2days">Every 2 Days</option>
                  <option value="7days">Weekly</option>
                </select>
              </div>
            </div>
          )}

          {/* Content Structure Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="bg-dark-750 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Content Format
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Article Format
                    </label>
                    <select
                      value={formData.content_structure?.format || "article"}
                      onChange={handleContentFormatChange}
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="article">Standard Article</option>
                      <option value="recipe">Recipe</option>
                      <option value="guide">Spiritual Guide</option>
                      <option value="insight">Mystical Insight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Layout Type
                    </label>
                    <input
                      type="text"
                      value={formData.content_structure?.layout_type || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "content_structure",
                          "layout_type",
                          e.target.value,
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="e.g., recipe_card, step_by_step"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Word Count
                    </label>
                    <input
                      type="number"
                      value={formData.content_structure?.min_word_count || 300}
                      onChange={(e) =>
                        handleNestedChange(
                          "content_structure",
                          "min_word_count",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      min="100"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Word Count
                    </label>
                    <input
                      type="number"
                      value={formData.content_structure?.max_word_count || 600}
                      onChange={(e) =>
                        handleNestedChange(
                          "content_structure",
                          "max_word_count",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      min="200"
                      max="2000"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-dark-750 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Image Generation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image Source
                    </label>
                    <select
                      name="image_generation_strategy"
                      value={formData.image_generation_strategy || "dalle"}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="dalle">DALL-E 3 (AI Generated)</option>
                      <option value="pexels">Pexels (Stock Photos)</option>
                      <option value="mixed">DALL-E with Pexels Fallback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image Style
                    </label>
                    <input
                      type="text"
                      name="image_style"
                      value={formData.image_style || ""}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="e.g., professional food photography, serene meditation scene"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout & SEO Tab */}
          {activeTab === "layout" && (
            <div className="space-y-6">
              <div className="bg-dark-750 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  SEO Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content Tone
                    </label>
                    <select
                      value={formData.seo_settings?.content_tone || "engaging"}
                      onChange={(e) =>
                        handleNestedChange(
                          "seo_settings",
                          "content_tone",
                          e.target.value,
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="engaging">Engaging</option>
                      <option value="informative">Informative</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="practical">Practical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={
                        formData.seo_settings?.target_audience ||
                        "spiritual_seekers"
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "seo_settings",
                          "target_audience",
                          e.target.value,
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="spiritual_seekers">
                        Spiritual Seekers
                      </option>
                      <option value="wellness_enthusiasts">
                        Wellness Enthusiasts
                      </option>
                      <option value="meditation_practitioners">
                        Meditation Practitioners
                      </option>
                      <option value="general_audience">General Audience</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Title Length
                    </label>
                    <input
                      type="number"
                      value={formData.seo_settings?.title_max_length || 55}
                      onChange={(e) =>
                        handleNestedChange(
                          "seo_settings",
                          "title_max_length",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      min="30"
                      max="70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Meta Description Length
                    </label>
                    <input
                      type="number"
                      value={
                        formData.seo_settings?.meta_description_max_length ||
                        150
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "seo_settings",
                          "meta_description_max_length",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      min="120"
                      max="160"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-dark-750 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Layout Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hero Style
                    </label>
                    <select
                      value={formData.layout_config?.hero_style || "standard"}
                      onChange={(e) =>
                        handleNestedChange(
                          "layout_config",
                          "hero_style",
                          e.target.value,
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="featured">Featured</option>
                      <option value="minimal">Minimal</option>
                      <option value="immersive">Immersive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Layout
                    </label>
                    <select
                      value={formData.layout_config?.card_layout || "default"}
                      onChange={(e) =>
                        handleNestedChange(
                          "layout_config",
                          "card_layout",
                          e.target.value,
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="compact">Compact</option>
                      <option value="featured">Featured</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color Scheme
                    </label>
                    <select
                      value={formData.layout_config?.color_scheme || "default"}
                      onChange={(e) =>
                        handleNestedChange(
                          "layout_config",
                          "color_scheme",
                          e.target.value,
                        )
                      }
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="mystical">Mystical</option>
                      <option value="wellness">Wellness</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-dark-700">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-3 px-8 rounded-lg flex items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Saving Changes..." : "Save Category Settings"}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default AdminCategoryEditPage;
