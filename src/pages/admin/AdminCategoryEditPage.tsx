import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PageLayout from '../../components/layout/PageLayout'; // Assuming you have this
import { ArrowLeft, Save } from 'lucide-react';

interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  ai_prompt?: string;
  generation_frequency?: string;
}

const AdminCategoryEditPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [formData, setFormData] = useState<CategoryData>({
    name: '',
    slug: '',
    description: '',
    ai_prompt: '',
    generation_frequency: 'manual',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        setError('Category ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('name, slug, description, ai_prompt, generation_frequency')
        .eq('id', categoryId)
        .single();

      if (fetchError) {
        console.error('Error fetching category:', fetchError);
        setError(`Failed to load category: ${fetchError.message}`);
        setCategory(null);
      } else if (data) {
        setCategory(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          ai_prompt: data.ai_prompt || '',
          generation_frequency: data.generation_frequency || 'manual',
        });
        setError(null);
      } else {
        setError('Category not found.');
        setCategory(null);
      }
      setLoading(false);
    };

    fetchCategory();
  }, [categoryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'name' && !formData.slug) { // Basic auto-slug generation if slug is empty
        setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { name, slug, description, ai_prompt, generation_frequency } = formData;
    if (!name.trim() || !slug.trim()) {
      alert('Category Name and Slug are required.');
      return;
    }
    setSaving(true);

    const { error: updateError } = await supabase
      .from('categories')
      .update({ name, slug, description, ai_prompt, generation_frequency })
      .eq('id', categoryId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      setSuccessMessage(null);
    } else {
      setError(null);
      setSuccessMessage('Category updated successfully!');
      // Optionally, navigate back or refresh data after a short delay
      setTimeout(() => {
        // navigate('/admin/categories'); // Or just clear message
        setSuccessMessage(null); 
      }, 3000);
    }
  };

  if (loading) {
    return <PageLayout title="Loading Category..."><div className="text-white text-center p-10">Loading...</div></PageLayout>;
  }

  if (error && !category) {
    return <PageLayout title="Error"><div className="text-red-500 text-center p-10">Error: {error}</div></PageLayout>;
  }

  if (!category) {
    return <PageLayout title="Category Not Found"><div className="text-white text-center p-10">Category not found.</div></PageLayout>;
  }

  return (
    <PageLayout title={`Edit Category: ${category.name}`}>
      <div className="max-w-2xl mx-auto bg-dark-800 p-6 md:p-8 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Category</h1>
          <button 
            onClick={() => navigate('/admin/categories')}
            className="text-accent-400 hover:text-accent-500 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </button>
        </div>

        {error && <div className="bg-red-700 text-white p-3 rounded-md mb-4">{error}</div>}
        {successMessage && <div className="bg-green-700 text-white p-3 rounded-md mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-dark-700 border border-dark-600 text-white rounded-md p-3 focus:ring-accent-500 focus:border-accent-500"
              required
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-dark-200 mb-1">Slug</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full bg-dark-700 border border-dark-600 text-white rounded-md p-3 focus:ring-accent-500 focus:border-accent-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-200 mb-1">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm text-white placeholder-dark-400"
              placeholder="A brief description of the category"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="ai_prompt" className="block text-sm font-medium text-dark-300">
              AI Generation Prompt (Optional)
            </label>
            <textarea
              id="ai_prompt"
              name="ai_prompt"
              value={formData.ai_prompt}
              onChange={handleInputChange}
              rows={6}
              className="mt-1 block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm text-white placeholder-dark-400"
              placeholder="Enter a detailed prompt for AI to generate articles in this category. E.g., 'Write a daily horoscope for the sign Leo, focusing on career and relationships. Include a lucky number and color.'"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="generation_frequency" className="block text-sm font-medium text-dark-300">
              AI Generation Frequency
            </label>
            <select
              id="generation_frequency"
              name="generation_frequency"
              value={formData.generation_frequency}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-dark-700 border-dark-600 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm rounded-md text-white"
            >
              <option value="manual">Manual</option>
              <option value="1day">Every 1 Day</option>
              <option value="2days">Every 2 Days</option>
              <option value="7days">Every 7 Days</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-6 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default AdminCategoryEditPage;
