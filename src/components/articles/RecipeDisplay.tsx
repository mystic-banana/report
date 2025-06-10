import React from "react";
import { Clock, Users, ChefHat, Star, Flame } from "lucide-react";

interface RecipeData {
  prep_time?: string;
  cook_time?: string;
  total_time?: string;
  servings?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  cuisine_type?: string;
  rating?: number;
  ingredients?: string[];
  instructions?: string[];
  nutrition?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

interface RecipeDisplayProps {
  recipe: RecipeData;
  title: string;
  description?: string;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({
  recipe,
  title,
  description,
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "Hard":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time.includes("min") ? time : `${time} min`;
  };

  return (
    <div className="bg-dark-800 rounded-2xl p-6 mb-8 border border-dark-700">
      {/* Recipe Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <ChefHat className="text-magazine-accent" size={20} />
            <span className="text-magazine-accent font-medium text-sm uppercase tracking-wider">
              Sacred Kitchen Recipe
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-300 leading-relaxed">{description}</p>
          )}
        </div>

        {recipe.rating && (
          <div className="flex items-center space-x-1 bg-dark-700 rounded-full px-3 py-2">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-white font-medium">{recipe.rating}</span>
          </div>
        )}
      </div>

      {/* Recipe Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {recipe.prep_time && (
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <Clock className="text-magazine-accent mx-auto mb-1" size={20} />
            <div className="text-white font-medium text-sm">
              {formatTime(recipe.prep_time)}
            </div>
            <div className="text-gray-400 text-xs">Prep Time</div>
          </div>
        )}

        {recipe.cook_time && (
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <Flame className="text-magazine-accent mx-auto mb-1" size={20} />
            <div className="text-white font-medium text-sm">
              {formatTime(recipe.cook_time)}
            </div>
            <div className="text-gray-400 text-xs">Cook Time</div>
          </div>
        )}

        {recipe.total_time && (
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <Clock className="text-magazine-accent mx-auto mb-1" size={20} />
            <div className="text-white font-medium text-sm">
              {formatTime(recipe.total_time)}
            </div>
            <div className="text-gray-400 text-xs">Total Time</div>
          </div>
        )}

        {recipe.servings && (
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <Users className="text-magazine-accent mx-auto mb-1" size={20} />
            <div className="text-white font-medium text-sm">
              {recipe.servings}
            </div>
            <div className="text-gray-400 text-xs">Servings</div>
          </div>
        )}

        {recipe.difficulty && (
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(recipe.difficulty)}`}
            >
              {recipe.difficulty}
            </div>
            <div className="text-gray-400 text-xs mt-1">Difficulty</div>
          </div>
        )}

        {recipe.cuisine_type && (
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <div className="text-white font-medium text-sm">
              {recipe.cuisine_type}
            </div>
            <div className="text-gray-400 text-xs">Cuisine</div>
          </div>
        )}
      </div>

      {/* Ingredients & Instructions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-magazine-accent rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                1
              </span>
              Ingredients
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-3 text-gray-300"
                >
                  <span className="w-2 h-2 bg-magazine-accent rounded-full mt-2 flex-shrink-0" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-magazine-accent rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                2
              </span>
              Instructions
            </h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-dark-700 text-magazine-accent rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-300 leading-relaxed">
                    {instruction}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Nutrition Info */}
      {recipe.nutrition && (
        <div className="mt-8 pt-6 border-t border-dark-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Nutrition Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipe.nutrition.calories && (
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <div className="text-magazine-accent font-bold text-lg">
                  {recipe.nutrition.calories}
                </div>
                <div className="text-gray-400 text-sm">Calories</div>
              </div>
            )}
            {recipe.nutrition.protein && (
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <div className="text-magazine-accent font-bold text-lg">
                  {recipe.nutrition.protein}
                </div>
                <div className="text-gray-400 text-sm">Protein</div>
              </div>
            )}
            {recipe.nutrition.carbs && (
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <div className="text-magazine-accent font-bold text-lg">
                  {recipe.nutrition.carbs}
                </div>
                <div className="text-gray-400 text-sm">Carbs</div>
              </div>
            )}
            {recipe.nutrition.fat && (
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <div className="text-magazine-accent font-bold text-lg">
                  {recipe.nutrition.fat}
                </div>
                <div className="text-gray-400 text-sm">Fat</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplay;
