import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight } from 'lucide-react';
import { useContentStore } from '../../store/contentStore';

const SavedContent: React.FC = () => {
  const { articles, podcasts } = useContentStore();
  
  const savedItems = [
    ...articles.slice(0, 3),
    ...podcasts.slice(0, 2)
  ];

  return (
    <div className="bg-magazine-secondary rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Saved Content</h2>
        <Link to="/saved-content" className="text-magazine-accent hover:text-magazine-accent/80 transition-colors">
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {savedItems.map((item, index) => (
          <Link
            key={item.id}
            to={'slug' in item ? `/article/${item.slug}` : `/podcast/${item.id}`}
            className="flex items-start space-x-4 p-3 rounded-lg hover:bg-magazine-primary transition-colors"
          >
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                {item.title}
              </h3>
              <span className="text-xs text-magazine-muted">
                {'readTime' in item ? `${item.readTime} min read` : `${item.duration} min listen`}
              </span>
            </div>
            <Bookmark className="w-4 h-4 text-magazine-accent flex-shrink-0" />
          </Link>
        ))}
      </div>
      
      <Link
        to="/saved-content"
        className="flex items-center justify-center space-x-2 mt-6 text-sm text-magazine-accent hover:text-magazine-accent/80 transition-colors"
      >
        <span>See all saved content</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default SavedContent;