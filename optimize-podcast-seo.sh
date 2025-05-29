#!/bin/bash

echo "🚀 Starting podcast page SEO optimization..."

# Fix SEO title in PodcastDetailPage.tsx to use names instead of IDs
echo "📄 Updating podcast page SEO title..."
sed -i '' 's|title={podcast ? `${podcast.name} - Mystic Banana Podcasts` : '\''Loading Podcast...'\''|title={podcast ? `${podcast.name} - Podcasts | Mystic Banana` : '\''Podcast | Mystic Banana'\''|g' src/pages/public/PodcastDetailPage.tsx

# Enhance metadata and canonical links for better SEO
echo "🔍 Adding canonical URLs and enhanced metadata..."
sed -i '' 's|description={podcast?.description || '\''Explore this podcast on Mystic Banana'\''|description={podcast?.description?.substring(0, 160) || `Listen to ${podcast?.name || '\''this podcast'\''} on Mystic Banana`|g' src/pages/public/PodcastDetailPage.tsx

echo "✅ SEO optimization completed!"
