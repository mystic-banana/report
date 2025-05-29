import React from 'react';

interface Podcast {
  id: string;
  title: string;
  description: string;
  duration: string;
  coverImage: string;
  date: string;
  category?: string;
  hostName?: string;
}

interface PodcastCardProps {
  podcast: Podcast;
}

// A simple SVG Play Icon
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-white">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  const formattedDate = new Date(podcast.date).toLocaleDateString('en-US', {
    month: 'long', // e.g., 'May'
    day: 'numeric',    // e.g., '20'
    year: 'numeric'   // e.g., '2024'
  });

  return (
    <article className="bg-white dark:bg-dark-800 shadow-lg rounded-lg overflow-hidden group flex flex-col">
      <div className="relative aspect-video sm:aspect-[16/10] overflow-hidden">
        <img 
          src={podcast.coverImage} 
          alt={podcast.title} 
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <PlayIcon />
        </div>
        {podcast.category && (
          <div className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-semibold uppercase px-2 py-1 rounded">
            {podcast.category}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold text-dark-900 dark:text-white mb-2 leading-tight group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
          <a href="#" className="hover:underline">{/* Link to actual podcast page later */}
            {podcast.title}
          </a>
        </h3>
        
        <div className="text-xs text-dark-500 dark:text-dark-400 mb-3 space-x-2">
          {podcast.hostName && (
            <span>By <span className="font-medium text-dark-700 dark:text-dark-200">{podcast.hostName}</span></span>
          )}
          {podcast.hostName && podcast.date && <span>&bull;</span>}
          {podcast.date && (
            <time dateTime={podcast.date}>{formattedDate}</time>
          )}
        </div>

        <p className="text-sm text-dark-600 dark:text-dark-300 line-clamp-3 mb-4 flex-grow">
          {podcast.description}
        </p>

        <div className="flex items-center justify-between text-xs text-dark-500 dark:text-dark-400 border-t border-gray-200 dark:border-dark-700 pt-3 mt-auto">
          <span>{podcast.duration}</span>
          <a href="#" className="text-accent-600 dark:text-accent-400 hover:underline font-medium">
            Listen Now
          </a>
        </div>
      </div>
    </article>
  );
};

export default PodcastCard;
