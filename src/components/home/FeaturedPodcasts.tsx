import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';

const FeaturedPodcasts: React.FC = () => {
  const podcasts = [
    {
      id: 'podcast-1',
      title: 'The Art of Mindful Living: Daily Practices',
      image: 'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=1600',
      category: 'Mindfulness',
      author: 'Sarah Parker',
      date: 'December 15, 2024',
      duration: '45 min',
      slug: 'mindful-living-practices'
    },
    {
      id: 'podcast-2',
      title: 'Exploring Ancient Wisdom: Sacred Texts',
      image: 'https://images.pexels.com/photos/5417293/pexels-photo-5417293.jpeg?auto=compress&cs=tinysrgb&w=1600',
      category: 'Spirituality',
      author: 'Michael Chen',
      date: 'December 10, 2024',
      duration: '32 min',
      slug: 'ancient-wisdom-texts'
    },
    {
      id: 'podcast-3',
      title: 'Modern Meditation Techniques',
      image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1600',
      category: 'Meditation',
      author: 'Emma Wilson',
      date: 'December 5, 2024',
      duration: '28 min',
      slug: 'modern-meditation'
    }
  ];

  return (
    <section className="relative bg-magazine-primary py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Podcasts</h2>
          <div className="flex space-x-2">
            <div className="podcast-swiper-button-prev" />
            <div className="podcast-swiper-button-next" />
          </div>
        </div>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={2}
          navigation={{
            prevEl: '.podcast-swiper-button-prev',
            nextEl: '.podcast-swiper-button-next',
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30
            }
          }}
          className="podcast-slider"
        >
          {podcasts.map((podcast) => (
            <SwiperSlide key={podcast.id}>
              <article className="group relative overflow-hidden rounded-xl bg-magazine-secondary">
                <Link to={`/podcast/${podcast.slug}`} className="block aspect-[4/3]">
                  <img
                    src={podcast.image}
                    alt={podcast.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="inline-flex items-center text-sm font-medium text-magazine-accent">
                        <Headphones className="w-4 h-4 mr-1" />
                        {podcast.duration}
                      </span>
                      <span className="text-magazine-accent">&bull;</span>
                      <span className="inline-block text-sm font-medium text-magazine-accent">
                        # {podcast.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-magazine-accent transition-colors">
                      {podcast.title}
                    </h3>
                    
                    <div className="flex items-center text-sm">
                      <img
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32"
                        alt={podcast.author}
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">By {podcast.author}</span>
                        <span className="text-magazine-muted text-xs">{podcast.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturedPodcasts;