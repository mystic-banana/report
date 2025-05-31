import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Category {
  id: string;
  name: string;
}

interface ArticleData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category_id?: string | null;
  status: "draft" | "published" | "archived";
  published_at?: string | null;
  featured_image_url?: string;
  is_premium: boolean;
  meta_title?: string;
  meta_description?: string;
  tags?: string[]; // Stored as array of strings
}

interface ArticleFormProps {
  articleId?: string; // If provided, form is in 'edit' mode
}

// Define custom toolbar modules and formats for ReactQuill as constants
const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"], // 'image' and 'video' might require custom handlers for uploads
    ["clean"], // remove formatting button
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ align: [] }],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

const quillFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
];

const ArticleForm: React.FC<ArticleFormProps> = ({ articleId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ArticleData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category_id: null,
    status: "draft",
    published_at: null,
    featured_image_url: "",
    is_premium: false,
    meta_title: "",
    meta_description: "",
    tags: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();

    // If articleId is provided, fetch article data for editing
    if (articleId) {
      setLoading(true);
      const fetchArticle = async () => {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", articleId)
          .single();

        if (error) {
          console.error("Error fetching article:", error);
          alert("Failed to load article data.");
          navigate("/admin/articles");
        } else if (data) {
          setFormData({
            ...data,
            tags: data.tags || [], // Ensure tags is an array
            category_id: data.category_id || null,
            published_at: data.published_at || null,
          });
          setTagsInput((data.tags || []).join(", "));
        }
        setLoading(false);
      };
      fetchArticle();
    }
  }, [articleId, navigate]);

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Ensure 'content' is not handled here if it's coming from ReactQuill directly
      if (name !== "content") {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, ""),
      }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setFormData((prev) => ({
      ...prev,
      tags: e.target.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: Partial<ArticleData> & {
      tags?: string[];
      published_at?: string | null;
    } = {
      ...formData,
      category_id: formData.category_id === "" ? null : formData.category_id,
      tags:
        formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      published_at:
        formData.status === "published"
          ? formData.published_at || new Date().toISOString() // Keep existing if already published, else set new
          : null, // Set to null if not published
    };

    // If creating a new article and status is 'published', ensure published_at is set
    if (
      !articleId &&
      formData.status === "published" &&
      !payload.published_at
    ) {
      payload.published_at = new Date().toISOString();
    }

    let error;
    if (articleId) {
      // Update existing article
      const { error: updateError } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", articleId);
      error = updateError;
    } else {
      // Create new article
      const { error: insertError } = await supabase
        .from("articles")
        .insert(payload);
      error = insertError;
    }

    setIsSubmitting(false);
    if (error) {
      console.error("Error saving article:", error);
      alert(`Failed to save article: ${error.message}`);
    } else {
      alert(`Article ${articleId ? "updated" : "created"} successfully!`);
      navigate("/admin/articles");
    }
  };

  if (loading) return <p className="text-white">Loading article form...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-dark-800 p-6 md:p-8 rounded-lg shadow-xl"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-dark-200 mb-1"
        >
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
        />
      </div>
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-dark-200 mb-1"
        >
          Slug
        </label>
        <input
          type="text"
          name="slug"
          id="slug"
          value={formData.slug}
          onChange={handleChange}
          required
          className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
        />
      </div>
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-dark-200 mb-1"
        >
          Content
        </label>
        <div className="quill-editor-container bg-dark-800 rounded-md">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            modules={quillModules}
            formats={quillFormats}
            className="bg-transparent text-white"
            placeholder="Write your article content here..."
            style={{ height: "300px" }}
          />
        </div>
      </div>
      <div className="mt-10">
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-dark-200 mb-1"
        >
          Excerpt (Short Summary)
        </label>
        <textarea
          name="excerpt"
          id="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={3}
          className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="category_id"
            className="block text-sm font-medium text-dark-200 mb-1"
          >
            Category
          </label>
          <select
            name="category_id"
            id="category_id"
            value={formData.category_id || ""}
            onChange={handleChange}
            className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-dark-200 mb-1"
          >
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="featured_image_url"
          className="block text-sm font-medium text-dark-200 mb-1"
        >
          Featured Image URL
        </label>
        <input
          type="url"
          name="featured_image_url"
          id="featured_image_url"
          value={formData.featured_image_url}
          onChange={handleChange}
          className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-dark-200 mb-1"
        >
          Tags (comma-separated)
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          value={tagsInput}
          onChange={handleTagsChange}
          className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
          placeholder="e.g., tech, ai, space"
        />
      </div>
      {/* Recipe-specific fields for Sacred Kitchen category */}
      {categories.find((cat) => cat.id === formData.category_id)?.name ===
        "Sacred Kitchen" && (
        <div className="bg-dark-700 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recipe Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label
                htmlFor="prep_time"
                className="block text-sm font-medium text-dark-200 mb-1"
              >
                Prep Time
              </label>
              <input
                type="text"
                name="prep_time"
                id="prep_time"
                placeholder="e.g., 15 min"
                className="w-full bg-dark-600 border-dark-500 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
            <div>
              <label
                htmlFor="cook_time"
                className="block text-sm font-medium text-dark-200 mb-1"
              >
                Cook Time
              </label>
              <input
                type="text"
                name="cook_time"
                id="cook_time"
                placeholder="e.g., 30 min"
                className="w-full bg-dark-600 border-dark-500 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
            <div>
              <label
                htmlFor="servings"
                className="block text-sm font-medium text-dark-200 mb-1"
              >
                Servings
              </label>
              <input
                type="number"
                name="servings"
                id="servings"
                placeholder="4"
                className="w-full bg-dark-600 border-dark-500 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-dark-200 mb-1"
              >
                Difficulty
              </label>
              <select
                name="difficulty"
                id="difficulty"
                className="w-full bg-dark-600 border-dark-500 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="cuisine_type"
                className="block text-sm font-medium text-dark-200 mb-1"
              >
                Cuisine Type
              </label>
              <input
                type="text"
                name="cuisine_type"
                id="cuisine_type"
                placeholder="e.g., Mediterranean, Asian"
                className="w-full bg-dark-600 border-dark-500 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="meta_title"
            className="block text-sm font-medium text-dark-200 mb-1"
          >
            Meta Title (SEO)
          </label>
          <input
            type="text"
            name="meta_title"
            id="meta_title"
            value={formData.meta_title}
            onChange={handleChange}
            className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
          />
        </div>
        <div>
          <label
            htmlFor="meta_description"
            className="block text-sm font-medium text-dark-200 mb-1"
          >
            Meta Description (SEO)
          </label>
          <input
            type="text"
            name="meta_description"
            id="meta_description"
            value={formData.meta_description}
            onChange={handleChange}
            className="w-full bg-dark-700 border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_premium"
          id="is_premium"
          checked={formData.is_premium}
          onChange={handleChange}
          className="h-4 w-4 text-accent-600 border-dark-500 rounded focus:ring-accent-500"
        />
        <label
          htmlFor="is_premium"
          className="ml-2 block text-sm text-dark-200"
        >
          Premium Content
        </label>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate("/admin/articles")}
          className="bg-dark-600 hover:bg-dark-500 text-dark-100 font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? articleId
              ? "Updating..."
              : "Creating..."
            : articleId
              ? "Update Article"
              : "Create Article"}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
