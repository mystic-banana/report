import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { format } from "date-fns";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Slide {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: string;
  author: string;
  authorAvatar?: string; // Add authorAvatar property
  date: string;
  category_id?: string;
}

const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroArticles = async () => {
      try {
        setLoading(true);

        // Fetch featured articles
        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(5);

        if (articlesError) {
          console.error("Error fetching hero articles:", articlesError);
          setLoading(false);
          return;
        }

        if (!articlesData || articlesData.length === 0) {
          // Use default slides if no data
          setSlides([
            {
              id: "1",
              title: "Healthy Cooking Made Easy With Nutritious Recipes",
              slug: "healthy-cooking-recipes",
              image:
                "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600",
              category: "Wellness",
              author: "Daniel Anderson",
              date: "December 12, 2024",
              category_id: "",
            },
            {
              id: "2",
              title: "The Power of Meditation for Mental Clarity",
              slug: "meditation-mental-clarity",
              image:
                "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1600",
              category: "Meditation",
              author: "Sophia Lee",
              date: "December 10, 2024",
              category_id: "",
            },
            {
              id: "3",
              title: "Understanding Your Birth Chart: A Beginner's Guide",
              slug: "birth-chart-beginners-guide",
              image:
                "https://images.pexels.com/photos/5417678/pexels-photo-5417678.jpeg?auto=compress&cs=tinysrgb&w=1600",
              category: "Astrology",
              author: "Olivia Martinez",
              date: "December 8, 2024",
              category_id: "",
            },
          ]);
          setLoading(false);
          return;
        }

        // Fetch categories to get names
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name");

        // Default values
        const authorName = "Mystic Banana Author";
        const authorAvatar = "";
        const defaultImage =
          "https://images.pexels.com/photos/6952861/pexels-photo-6952861.jpeg?auto=compress&cs=tinysrgb&w=1600";

        // Transform the data for the slider
        const transformedSlides = articlesData.map((article) => {
          // Find category name if available
          let categoryName = "Uncategorized";
          if (article.category_id && categoriesData) {
            const category = categoriesData.find(
              (cat) => cat.id === article.category_id,
            );
            if (category) {
              categoryName = category.name;
            }
          }

          return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            image: article.featured_image_url || defaultImage,
            category: categoryName,
            author: authorName,
            authorAvatar: authorAvatar,
            date: article.published_at
              ? format(new Date(article.published_at), "MMMM d, yyyy")
              : "Recently published",
            category_id: article.category_id,
          };
        });

        setSlides(transformedSlides);
        console.log("Hero slides:", transformedSlides);
      } catch (err) {
        console.error("Unexpected error fetching hero articles:", err);
        setError("Failed to load featured articles");
      } finally {
        setLoading(false);
      }
    };

    fetchHeroArticles();
  }, []);

  return (
    <section className="relative bg-gray-100 dark:bg-dark-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-dark-900 dark:text-white">
            Featured Stories
          </h2>
          {!loading && slides.length > 0 && (
            <div className="flex space-x-2">
              <div className="swiper-button-prev-custom text-dark-900 dark:text-white" />
              <div className="swiper-button-next-custom text-dark-900 dark:text-white" />
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse space-y-8 w-full max-w-3xl">
              <div className="h-60 bg-dark-700 rounded-xl"></div>
              <div className="h-4 bg-dark-700 rounded w-3/4"></div>
              <div className="h-4 bg-dark-700 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-6 text-center">
            <p className="text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-dark-700 text-white rounded-md hover:bg-dark-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && slides.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={2}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={slides.length > 1}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
            }}
            className="magazine-slider"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.id || index}>
                <article className="group relative overflow-hidden rounded-xl bg-white dark:bg-dark-800">
                  <Link
                    to={`/magazine/${slide.slug}`}
                    className="block aspect-[4/3]"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.pexels.com/photos/6952861/pexels-photo-6952861.jpeg?auto=compress&cs=tinysrgb&w=1600";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-block mb-3 text-sm font-sans font-medium text-accent-600 dark:text-accent-400">
                        # {slide.category}
                      </span>

                      <h3 className="text-xl font-serif font-bold leading-tight mb-4 text-white group-hover:text-accent-400 transition-colors">
                        {slide.title}
                      </h3>

                      <div className="flex items-center text-sm font-sans text-gray-200">
                        <img
                          src={
                            slide.authorAvatar ||
                            "https://ui-avatars.com/api/?name=Mystic+Banana&background=random"
                          }
                          alt={slide.author}
                          className="w-8 h-8 rounded-full object-cover mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://ui-avatars.com/api/?name=Mystic+Banana&background=random";
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">By {slide.author}</span>
                          <span className="text-gray-300 dark:text-dark-300 text-xs">
                            {slide.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {!loading && !error && slides.length === 0 && (
          <div className="bg-dark-800 rounded-xl p-10 text-center">
            <h3 className="text-xl font-medium text-white mb-2">
              No Featured Articles
            </h3>
            <p className="text-gray-400 mb-6">
              There are currently no featured articles to display.
            </p>
            <Link
              to="/magazine"
              className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
