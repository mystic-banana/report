#!/bin/bash

# This script merges the article page implementation files and replaces the original file

# Create directory if it doesn't exist
mkdir -p /Users/startupomatic/Documents/work/mysticbanana/temp

# Merge the files
cat /Users/startupomatic/Documents/work/mysticbanana/src/pages/public/ArticleDetailPage.new.tsx \
    /Users/startupomatic/Documents/work/mysticbanana/src/pages/public/ArticleDetailPage.new.part2.tsx \
    /Users/startupomatic/Documents/work/mysticbanana/src/pages/public/ArticleDetailPage.new.part3.tsx \
    > /Users/startupomatic/Documents/work/mysticbanana/temp/ArticleDetailPage.merged.tsx

# Replace the original file
mv /Users/startupomatic/Documents/work/mysticbanana/temp/ArticleDetailPage.merged.tsx \
   /Users/startupomatic/Documents/work/mysticbanana/src/pages/public/ArticleDetailPage.tsx

# Clean up
rm -f /Users/startupomatic/Documents/work/mysticbanana/src/pages/public/ArticleDetailPage.new.tsx
rm -f /Users/startupomatic/Documents/work/mysticbanana/src/pages/public/ArticleDetailPage.new.part2.tsx
rm -f /Users/startupomatic/Documents/work/mysticbanana/src/pages/public/ArticleDetailPage.new.part3.tsx
rmdir /Users/startupomatic/Documents/work/mysticbanana/temp 2>/dev/null

echo "ArticleDetailPage.tsx has been successfully updated!"
