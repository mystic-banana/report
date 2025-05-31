import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ChefHat, Star } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image_url?: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  rating?: number;
  published_at: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  variant?: "default" | "featured" | "compact";
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  variant = "default",
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-400/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/20";
      case "Hard":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time.includes("min") ? time : `${time} min`;
  };

  if (variant === "featured") {
    return (
      <Link to={`/magazine/${recipe.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-2xl bg-dark-800 hover:bg-dark-700 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl">
          <div className="aspect-[16/10] relative overflow-hidden">
            {recipe.featured_image_url ? (
              <img
                src={recipe.featured_image_url}
                alt={recipe.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-magazine-accent/20 to-accent-700/20 flex items-center justify-center">
                <ChefHat size={48} className="text-magazine-accent" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Recipe Stats Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {recipe.prep_time && (
                    <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <Clock size={14} className="text-magazine-accent" />
                      <span className="text-white text-sm">
                        {formatTime(recipe.prep_time)}
                      </span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <Users size={14} className="text-magazine-accent" />
                      <span className="text-white text-sm">
                        {recipe.servings}
                      </span>
                    </div>
                  )}
                </div>
                {recipe.difficulty && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}
                  >
                    {recipe.difficulty}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-serif font-bold text-white mb-2 group-hover:text-magazine-accent transition-colors">
                {recipe.title}
              </h2>

              {recipe.excerpt && (
                <p className="text-gray-200 text-sm line-clamp-2">
                  {recipe.excerpt}
                </p>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/magazine/${recipe.slug}`} className="group block">
        <article className="flex items-center space-x-4 bg-dark-800 hover:bg-dark-700 rounded-lg p-4 transition-all duration-200">
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
            {recipe.featured_image_url ? (
              <img
                src={recipe.featured_image_url}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-magazine-accent/20 flex items-center justify-center">
                <ChefHat size={20} className="text-magazine-accent" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-magazine-accent transition-colors line-clamp-1">
              {recipe.title}
            </h3>
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
              {recipe.prep_time && (
                <span className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatTime(recipe.prep_time)}</span>
                </span>
              )}
              {recipe.difficulty && (
                <span
                  className={`px-2 py-0.5 rounded-full ${getDifficultyColor(recipe.difficulty)}`}
                >
                  {recipe.difficulty}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/magazine/${recipe.slug}`} className="group block">
      <article className="bg-dark-800 hover:bg-dark-700 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl">
        <div className="aspect-[4/3] relative overflow-hidden">
          {recipe.featured_image_url ? (
            <img
              src={recipe.featured_image_url}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-magazine-accent/20 to-accent-700/20 flex items-center justify-center">
              <ChefHat size={32} className="text-magazine-accent" />
            </div>
          )}

          {recipe.rating && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
              <Star size={12} className="text-yellow-400 fill-current" />
              <span className="text-white text-xs font-medium">
                {recipe.rating}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-magazine-accent font-medium uppercase tracking-wider">
              Sacred Kitchen
            </span>
            {recipe.difficulty && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}
              >
                {recipe.difficulty}
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg font-semibold text-white mb-2 group-hover:text-magazine-accent transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          {recipe.excerpt && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
              {recipe.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {recipe.prep_time && (
                <span className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatTime(recipe.prep_time)}</span>
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center space-x-1">
                  <Users size={12} />
                  <span>{recipe.servings} servings</span>
                </span>
              )}
            </div>
            <span>{new Date(recipe.published_at).toLocaleDateString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default RecipeCard;
