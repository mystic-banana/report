import React, { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PlusCircle, Edit3, Trash2, Info, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ai_prompt?: string;
  generation_frequency?: string;
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // For category loading errors
  const [generationError, setGenerationError] = useState<string | null>(null); // For article generation errors
  const [generatingStates, setGeneratingStates] = useState<Record<string, boolean>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, slug, description, ai_prompt, generation_frequency')
      .order('name', { ascending: true });

    if (fetchError) {
      console.error('Error fetching categories:', fetchError);
      setError(fetchError.message);
      setCategories([]);
    } else {
      setCategories(data as Category[]);
      setError(null);
    }
    setLoading(false);
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategorySlug.trim()) {
      alert('Category Name and Slug are required.');
      return;
    }
    setIsSubmitting(true);
    const { error: insertError } = await supabase
      .from('categories')
      .insert({
        name: newCategoryName.trim(),
        slug: newCategorySlug.trim(),
        description: newCategoryDescription.trim() || null,
      });

    if (insertError) {
      console.error('Error adding category:', insertError);
      alert(`Failed to add category: ${insertError.message}`);
    } else {
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryDescription('');
      await fetchCategories(); // Refresh the list
      alert('Category added successfully!');
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This might affect articles using it.')) {
      return;
    }
    try {
      const { error } = await supabase.from('categories').delete().match({ id: categoryId });
      if (error) {
        console.error('Error deleting category:', error);
        alert(`Failed to delete category: ${error.message}`);
      } else {
        alert('Category deleted successfully!');
        // Refresh the list by filtering out the deleted category or re-fetching
        setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
        // Or, if you prefer to re-fetch to ensure data consistency:
        // await fetchCategories(); 
      }
    } catch (e) {
      console.error('An unexpected error occurred during deletion:', e);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleGenerateArticle = async (categoryId: string, categoryName: string, prompt?: string) => {
    if (!prompt || prompt.trim() === "") {
      alert(`Please set an AI prompt for the category '${categoryName}' before generating an article.`);
      navigate(`/admin/categories/edit/${categoryId}`);
      return;
    }

    setGeneratingStates(prev => ({ ...prev, [categoryId]: true }));
    setError(null); // Clears general page error
    setGenerationError(null); // Clear previous generation error

    try {
      // TODO: Replace 'placeholder-admin-user-id' with actual logged-in admin user ID if available
      const { data, error: functionError } = await supabase.functions.invoke('generate-ai-article', {
        body: { 
          category_id: categoryId,
          model: 'gpt-4.1-mini-2025-04-14' // Explicitly set the working model
        }, 
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.error) { // Error from within the function logic
        console.error('Edge function returned an error:', data.error, data.details);
        alert(`Error generating article: ${data.error}${data.details ? ' Details: ' + JSON.stringify(data.details) : ''}`);
        setGenerationError(`Error generating article for ${categoryName}: ${data.error}`);
      } else {
        console.log('Article generation successful:', data);
        alert(`Successfully started generating article for '${categoryName}'. Article ID: ${data?.article?.id}. You can check the articles page.`);
        // Optionally, navigate to the new article or refresh data
      }

    } catch (e: any) {
      console.error('Failed to invoke Edge Function or unexpected error:', e);
      alert(`Failed to generate article for '${categoryName}'. Error: ${e.message || 'Unknown error'}`);
      setGenerationError(`Failed to generate article for ${categoryName}: ${e.message}`);
    } finally {
      setGeneratingStates(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const navigate = useNavigate(); // Added for potential navigation

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading && categories.length === 0) {
    return <div className="text-white">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading categories: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Manage Categories</h1>

      {/* Display generation error if any */} 
      {generationError && (
        <div className="bg-red-700 text-white p-3 rounded-md mb-4">
          Article Generation Error: {generationError}
        </div>
      )}

      {/* Add Category Form */}
      <div className="bg-dark-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-dark-200 mb-1">Name</label>
            <input 
              type="text" 
              id="categoryName" 
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                // Auto-generate slug (simple version)
                setNewCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
              }}
              className="w-full bg-dark-700 border border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
              required
            />
          </div>
          <div>
            <label htmlFor="categorySlug" className="block text-sm font-medium text-dark-200 mb-1">Slug</label>
            <input 
              type="text" 
              id="categorySlug" 
              value={newCategorySlug}
              onChange={(e) => setNewCategorySlug(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
              required
            />
          </div>
          <div>
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-dark-200 mb-1">Description (Optional)</label>
            <textarea 
              id="categoryDescription" 
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              rows={3}
              className="w-full bg-dark-700 border border-dark-600 text-white rounded-md p-2 focus:ring-accent-500 focus:border-accent-500"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors disabled:opacity-50"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <h2 className="text-xl font-semibold text-white mb-4">Existing Categories</h2>
      {categories.length === 0 && !loading ? (
        <p className="text-dark-300">No categories found.</p>
      ) : (
        <div className="bg-dark-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">Slug</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">AI Prompt</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">Frequency</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-dark-800 divide-y divide-dark-700">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">{category.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                    {category.ai_prompt ? (
                      <span title={category.ai_prompt} className="cursor-help">Prompt Set <Info size={14} className="inline ml-1 text-accent-500"/></span>
                    ) : (
                      <span className="text-dark-500">Not Set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                    {category.generation_frequency ? (
                      <span>
                        {category.generation_frequency === 'manual' ? 'Manual' :
                         category.generation_frequency === '1day' ? 'Daily' :
                         category.generation_frequency === '2days' ? 'Every 2 Days' :
                         category.generation_frequency === '7days' ? 'Weekly' : category.generation_frequency}
                      </span>
                    ) : (
                      <span className="text-dark-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {generatingStates[category.id] ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <button 
                        onClick={() => handleGenerateArticle(category.id, category.name, category.ai_prompt || undefined)}
                        className={`text-xs px-2 py-1 rounded ${category.ai_prompt ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white`}
                        title={category.ai_prompt ? "Generate AI Article" : "Set AI Prompt first"}
                        disabled={!category.ai_prompt || generatingStates[category.id]}
                      >
                        Generate Article
                      </button>
                    )}
                    <Link to={`/admin/categories/edit/${category.id}`} className="text-accent-400 hover:text-accent-500">
                      <Edit3 className="w-4 h-4 inline"/> Edit
                    </Link>
                    <button onClick={() => handleDeleteCategory(category.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4 inline"/> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
