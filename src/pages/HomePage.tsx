import React, { Suspense, lazy } from "react";
import PageLayout from "../components/layout/PageLayout";
import SEO from "../components/SEO";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy load components for better performance
const SaaSHeroSection = lazy(
  () => import("../components/home/SaaSHeroSection"),
);
const FreeReportsSection = lazy(
  () => import("../components/home/FreeReportsSection"),
);
const AIAstrologerSection = lazy(
  () => import("../components/home/AIAstrologerSection"),
);
const FeaturesShowcase = lazy(
  () => import("../components/home/FeaturesShowcase"),
);
const PodcastMagazineSection = lazy(
  () => import("../components/home/PodcastMagazineSection"),
);
const TestimonialsSection = lazy(
  () => import("../components/home/TestimonialsSection"),
);
const PricingSection = lazy(() => import("../components/home/PricingSection"));
const NewsletterSection = lazy(
  () => import("../components/home/NewsletterSection"),
);

const HomePage: React.FC = () => {
  const seoData = {
    title:
      "World's Best Astrology Platform | Free Reports & AI Astrologer Chat | Mystic Banana",
    description:
      "Discover your cosmic destiny with the world's most accurate astrology platform. Get free birth chart reports, chat with AI astrologer, explore Vedic & Western astrology. Join 1M+ users worldwide.",
    canonicalUrl: "/",
    keywords: [
      "astrology",
      "birth chart",
      "horoscope",
      "free astrology report",
      "AI astrologer",
      "vedic astrology",
      "western astrology",
      "natal chart",
      "astrology reading",
      "cosmic guidance",
      "spiritual insights",
      "astrology app",
      "personalized horoscope",
      "astrology predictions",
      "zodiac signs",
      "planetary transits",
      "astrology compatibility",
      "spiritual guidance",
    ],
    ogImage:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
    ogImageAlt: "Mystic Banana - World's Best Astrology Platform",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Mystic Banana",
      description:
        "World's most accurate astrology platform with free reports and AI astrologer chat",
      url: "https://mysticbanana.com",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free astrology reports and basic features",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "50000",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Free Birth Chart Analysis",
        "AI Astrologer Chat",
        "Vedic & Western Astrology",
        "Daily Horoscopes",
        "Compatibility Reports",
        "Transit Predictions",
        "Spiritual Podcasts",
        "Astrology Magazine",
      ],
    },
  };

  return (
    <>
      <SEO {...seoData} />
      <PageLayout showHeader={true} showFooter={true}>
        <Suspense fallback={<LoadingSpinner />}>
          <SaaSHeroSection />
        </Suspense>

        <Suspense fallback={<div className="h-20 bg-gray-50" />}>
          <FreeReportsSection />
        </Suspense>

        <Suspense fallback={<div className="h-20 bg-white" />}>
          <AIAstrologerSection />
        </Suspense>

        <Suspense fallback={<div className="h-20 bg-gray-50" />}>
          <FeaturesShowcase />
        </Suspense>

        <Suspense fallback={<div className="h-20 bg-white" />}>
          <PodcastMagazineSection />
        </Suspense>

        <Suspense fallback={<div className="h-20 bg-gray-50" />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<div className="h-20 bg-white" />}>
          <PricingSection />
        </Suspense>

        <Suspense fallback={<div className="h-20 bg-gray-50" />}>
          <NewsletterSection />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default HomePage;
