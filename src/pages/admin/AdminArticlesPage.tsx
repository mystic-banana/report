import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  categories: { name: string } | null;
  status: string;
  published_at: string;
  // Add other relevant fields
}

const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch articles (can be reused after delete)
  const fetchArticles = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, status, published_at, categories(name)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching articles:', fetchError);
      setError(fetchError.message);
      setArticles([]);
    } else if (data) {
      // Type assertion here to align with actual data structure
      setArticles(data as any);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    try {
      const { error: deleteError } = await supabase.from('articles').delete().match({ id: articleId });
      if (deleteError) {
        console.error('Error deleting article:', deleteError);
        alert(`Failed to delete article: ${deleteError.message}`);
      } else {
        alert('Article deleted successfully!');
        // Refresh the list by filtering or re-fetching
        setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
        // Or fetchArticles();
      }
    } catch (e) {
      console.error('An unexpected error occurred during deletion:', e);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-white">Loading articles...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading articles: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Articles</h1>
        <Link
          to="/admin/articles/new"
          className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-dark-300">No articles found. Get started by adding one!</p>
      ) : (
        <div className="bg-dark-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                  Published
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-dark-800 divide-y divide-dark-700">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{article.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                    {article.categories?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${article.status === 'published' ? 'bg-green-700 text-green-100' : 
                        article.status === 'draft' ? 'bg-yellow-700 text-yellow-100' : 
                        'bg-gray-700 text-gray-100'}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Not Published'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link to={`/admin/articles/edit/${article.id}`} className="text-accent-400 hover:text-accent-500">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteArticle(article.id)} 
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" /> Delete
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

export default AdminArticlesPage;
