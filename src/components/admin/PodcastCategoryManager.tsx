import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { PodcastCategory } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface PodcastCategoryManagerProps {
  onCategoriesChange?: (categories: PodcastCategory[]) => void;
}

const PodcastCategoryManager: React.FC<PodcastCategoryManagerProps> = ({ onCategoriesChange }) => {
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch categories from Supabase
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch categories from the database
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('podcast_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
      
      // Notify parent component if callback provided
      if (onCategoriesChange) {
        onCategoriesChange(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching podcast categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      setAddingCategory(true);
      setError(null);
      
      // Create a timestamp for created_at and updated_at
      const timestamp = new Date().toISOString();
      
      // Insert the new category into Supabase
      const { data, error } = await supabase
        .from('podcast_categories')
        .insert([
          {
            name: newCategoryName.trim(),
            description: newCategoryDescription.trim() || null,
            created_at: timestamp,
            updated_at: timestamp
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Add the new category to the list
      if (data && data.length > 0) {
        const updatedCategories = [...categories, data[0]];
        setCategories(updatedCategories);
        
        // Notify parent component if callback provided
        if (onCategoriesChange) {
          onCategoriesChange(updatedCategories);
        }
      }
      
      // Reset form
      setNewCategoryName('');
      setNewCategoryDescription('');
      
    } catch (err: any) {
      console.error('Error adding category:', err);
      setError(err.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const startEditing = (category: PodcastCategory) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
    setEditDescription('');
  };

  const saveEditing = async (categoryId: string) => {
    if (!editName.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      setError(null);
      
      // Update the category in Supabase
      const { data, error } = await supabase
        .from('podcast_categories')
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .select();
      
      if (error) throw error;
      
      // Update the category in the local state
      if (data && data.length > 0) {
        const updatedCategories = categories.map(cat => 
          cat.id === categoryId ? data[0] : cat
        );
        
        setCategories(updatedCategories);
        
        // Notify parent component if callback provided
        if (onCategoriesChange) {
          onCategoriesChange(updatedCategories);
        }
      }
      
      // Reset edit state
      cancelEditing();
      
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      setError(null);
      
      // First check if any podcasts are using this category
      const { data: podcastsWithCategory, error: checkError } = await supabase
        .from('podcasts')
        .select('id, name')
        .eq('category_id', categoryId);
      
      if (checkError) throw checkError;
      
      // If podcasts are using this category, show a warning
      if (podcastsWithCategory && podcastsWithCategory.length > 0) {
        alert(`Cannot delete this category because it is being used by ${podcastsWithCategory.length} podcast(s). Please reassign these podcasts to another category first.`);
        return;
      }
      
      // Delete the category from Supabase
      const { error: deleteError } = await supabase
        .from('podcast_categories')
        .delete()
        .eq('id', categoryId);
      
      if (deleteError) throw deleteError;
      
      // Remove the category from the local state
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      
      // Notify parent component if callback provided
      if (onCategoriesChange) {
        onCategoriesChange(updatedCategories);
      }
      
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="bg-dark-800 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Podcast Categories</h2>
      
      {/* Error message */}
      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-md">
          <p className="text-white">{error}</p>
        </div>
      )}
      
      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              disabled={addingCategory}
            />
          </div>
          <div className="md:col-span-1">
            <input
              type="text"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              disabled={addingCategory}
            />
          </div>
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={addingCategory}
              className="w-full flex justify-center items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingCategory ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Category
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center my-6">
          <div className="w-8 h-8 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Categories list */}
      {!loading && categories.length === 0 ? (
        <div className="text-center py-6 bg-dark-700 rounded-lg">
          <p className="text-gray-400">No categories found. Add your first category using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-700 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-md">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 rounded-tr-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {categories.map((category) => (
                <tr key={category.id} className="bg-dark-800 hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3">
                    {editingCategory === category.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-1 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-accent-500"
                      />
                    ) : (
                      <span className="text-white">{category.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCategory === category.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-1 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-accent-500"
                      />
                    ) : (
                      <span className="text-gray-400">{category.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingCategory === category.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => saveEditing(category.id)}
                          className="p-1 bg-green-800 hover:bg-green-700 rounded text-white transition-colors"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 bg-dark-600 hover:bg-dark-500 rounded text-white transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEditing(category)}
                          className="p-1 bg-dark-600 hover:bg-dark-500 rounded text-gray-300 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 bg-dark-600 hover:bg-red-900 rounded text-gray-300 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
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

export default PodcastCategoryManager;
