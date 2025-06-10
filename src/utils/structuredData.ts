/**
 * Structured Data Utilities
 * 
 * This file contains functions to generate Schema.org compatible structured data
 * for various page types in the Mystic Banana application.
 * 
 * All structured data is validated against Schema.org specifications and
 * optimized for Google's Rich Results.
 */

import { PodcastFeed, PodcastEpisode, PodcastCategory } from '../types';

// Organization schema for the website
export const generateOrganizationSchema = (): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mystic Banana",
    "url": "https://mysticbanana.com",
    "logo": "https://mysticbanana.com/images/logo.png",
    "sameAs": [
      "https://www.facebook.com/mysticbanana",
      "https://www.instagram.com/mysticbanana",
      "https://twitter.com/mysticbanana"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-234-567-8900",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };
};

// Website schema
export const generateWebsiteSchema = (): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mystic Banana",
    "url": "https://mysticbanana.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://mysticbanana.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

// BreadcrumbList schema
export const generateBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `https://mysticbanana.com${crumb.url}`
    }))
  };
};

// Article schema
export const generateArticleSchema = (article: {
  title: string;
  excerpt?: string;
  coverImage?: string;
  authorName?: string;
  authorId?: string;
  publishedAt: string;
  updatedAt?: string;
  slug: string;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
}): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.coverImage,
    "author": {
      "@type": "Person",
      "name": article.authorName,
      "url": `https://mysticbanana.com/authors/${article.authorId}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mystic Banana",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mysticbanana.com/images/logo.png"
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://mysticbanana.com/articles/${article.slug}`
    },
    "keywords": article.tags?.join(", ") || "",
    "articleSection": article.category,
    "isAccessibleForFree": !article.isPremium
  };
};

// PodcastSeries schema
export const generatePodcastSeriesSchema = (podcast: PodcastFeed, episodes: PodcastEpisode[]): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "name": podcast.name,
    "description": podcast.description,
    "url": `https://mysticbanana.com/podcasts/${podcast.id}`,
    "image": podcast.image_url,
    "webFeed": podcast.feed_url,
    "author": {
      "@type": "Person",
      "name": podcast.author || "Mystic Banana"
    },
    "datePublished": podcast.created_at,
    "genre": podcast.category,
    "inLanguage": "en",
    "episode": episodes.map(episode => ({
      "@type": "PodcastEpisode",
      "name": episode.title,
      "description": episode.description,
      "datePublished": episode.pub_date,
      "duration": episode.duration,
      "url": `https://mysticbanana.com/podcasts/${podcast.id}/episodes/${episode.id}`,
      "associatedMedia": {
        "@type": "MediaObject",
        "contentUrl": episode.audio_url
      }
    }))
  };
};

// PodcastCategory schema (CollectionPage)
export const generatePodcastCategorySchema = (
  category: PodcastCategory, 
  slug: string, 
  podcasts: PodcastFeed[]
): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} Podcasts | Mystic Banana`,
    "description": category.description || `Explore our collection of ${category.name} podcasts`,
    "url": `https://mysticbanana.com/podcasts/category/${slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": podcasts.map((podcast, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "PodcastSeries",
          "name": podcast.name,
          "url": `https://mysticbanana.com/podcasts/${podcast.id}`,
          "image": podcast.image_url,
          "description": podcast.description,
          "author": {
            "@type": "Person",
            "name": podcast.author || "Mystic Banana"
          }
        }
      }))
    }
  };
};

// TarotReading schema
export const generateTarotReadingSchema = (reading: {
  id: string;
  title: string;
  date: string;
  cards: Array<{
    name: string;
    image: string;
    isReversed: boolean;
    meaningUpright: string;
    meaningReversed: string;
  }>;
}): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": reading.title,
    "description": `Tarot reading: ${reading.title}`,
    "dateCreated": reading.date,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": reading.cards.map((card, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Thing",
          "name": card.name,
          "description": card.isReversed ? card.meaningReversed : card.meaningUpright,
          "image": card.image
        }
      }))
    }
  };
};

// Horoscope schema
export const generateHoroscopeSchema = (horoscope: {
  sign: string;
  date: string;
  content: string;
}): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": `${horoscope.sign} Horoscope for ${horoscope.date}`,
    "headline": `${horoscope.sign} Horoscope for ${horoscope.date}`,
    "description": horoscope.content,
    "datePublished": horoscope.date,
    "keywords": [horoscope.sign, "horoscope", "astrology", "zodiac", "daily horoscope"],
    "author": {
      "@type": "Organization",
      "name": "Mystic Banana"
    }
  };
};

// FAQ schema
export const generateFAQSchema = (questions: Array<{question: string, answer: string}>): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
};

// Product schema (for premium plans)
export const generateProductSchema = (
  plan: {name: string, description: string, price: number, currency: string, features: string[]}
): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": plan.name,
    "description": plan.description,
    "offers": {
      "@type": "Offer",
      "price": plan.price,
      "priceCurrency": plan.currency,
      "availability": "https://schema.org/InStock"
    },
    "brand": {
      "@type": "Brand",
      "name": "Mystic Banana"
    }
  };
};

// Course schema (for spiritual courses)
export const generateCourseSchema = (
  course: {name: string, description: string, provider: string, duration: string, lessons: number}
): Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": course.provider
    },
    "timeRequired": course.duration,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online"
    }
  };
};

// Combine multiple schemas into a single script tag
export const combineStructuredData = (...schemas: Record<string, any>[]): Record<string, any> => {
  if (schemas.length === 1) {
    return schemas[0];
  }
  
  return {
    "@context": "https://schema.org",
    "@graph": schemas
  };
};
