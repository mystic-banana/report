import React from "react";
import { Helmet } from "react-helmet-async";
import {
  generateWebsiteSchema,
  generateOrganizationSchema,
  combineStructuredData,
} from "../utils/structuredData";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "podcast" | "profile";
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: "summary" | "summary_large_image";
  twitterSite?: string;
  twitterCreator?: string;
  jsonLd?: Record<string, any>;
  noIndex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  children?: React.ReactNode;
  language?: string;
  additionalMetaTags?: Array<{ name: string; content: string }>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage,
  ogImageAlt,
  noIndex = false,
  keywords = [],
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
  language = "en",
  additionalMetaTags = [],
}) => {
  // Base URL for the site - used throughout the component
  const siteUrl =
    process.env.NODE_ENV === "production"
      ? "https://mysticbanana.com"
      : "http://localhost:5173";

  // Combine base schemas with page-specific schema
  const baseSchemas = [];

  // Only add organization and website schemas on the homepage or key landing pages
  if (
    canonicalUrl === "/" ||
    canonicalUrl === "/podcasts" ||
    canonicalUrl === "/articles"
  ) {
    baseSchemas.push(generateOrganizationSchema());
    baseSchemas.push(generateWebsiteSchema());
  }

  // If jsonLd is provided, combine it with base schemas
  const finalJsonLd = jsonLd
    ? baseSchemas.length > 0
      ? combineStructuredData(...baseSchemas, jsonLd)
      : jsonLd
    : baseSchemas.length > 0
      ? combineStructuredData(...baseSchemas)
      : undefined;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {canonicalUrl && (
        <link
          rel="canonical"
          href={
            canonicalUrl.startsWith("http")
              ? canonicalUrl
              : `${siteUrl}${canonicalUrl}`
          }
        />
      )}
      <meta name="language" content={language} />
      <meta name="author" content="Mystic Banana" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#FFD700" />

      {/* Robots Meta Tags */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && (
        <meta
          property="og:image"
          content={
            ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`
          }
        />
      )}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      {canonicalUrl && (
        <meta
          property="og:url"
          content={
            canonicalUrl.startsWith("http")
              ? canonicalUrl
              : `${siteUrl}${canonicalUrl}`
          }
        />
      )}
      <meta property="og:site_name" content="Mystic Banana" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@mysticbanana" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && (
        <meta
          name="twitter:image"
          content={
            ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`
          }
        />
      )}
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}

      {/* Additional Meta Tags */}
      {additionalMetaTags.map((tag, index) => (
        <meta key={`meta-tag-${index}`} name={tag.name} content={tag.content} />
      ))}

      {/* JSON-LD Structured Data */}
      {finalJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(finalJsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
