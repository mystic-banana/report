import React from 'react';

interface PageBannerProps {
  title: string;
  tagline?: string;
  backgroundImageUrl?: string; // Optional background image
}

const PageBanner: React.FC<PageBannerProps> = ({ title, tagline, backgroundImageUrl }) => {
  const bannerStyle = backgroundImageUrl 
    ? { backgroundImage: `url(${backgroundImageUrl})` }
    : {};

  return (
    <section 
      className={`py-20 md:py-28 text-center bg-dark-900 dark:bg-dark-800 text-white ${backgroundImageUrl ? 'bg-cover bg-center' : ''}`}
      style={bannerStyle}
    >
      <div className={`container mx-auto px-4 ${backgroundImageUrl ? 'bg-black/50 py-10 rounded-md' : ''}`}> {/* Adds overlay if image exists */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
          {title}
        </h1>
        {tagline && (
          <p className="text-lg md:text-xl text-dark-200 max-w-3xl mx-auto">
            {tagline}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageBanner;
