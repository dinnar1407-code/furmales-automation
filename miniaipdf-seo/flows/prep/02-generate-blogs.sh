#!/bin/bash
#
# SEO Prep Flow - Step 2: Generate Blog Posts
# Runs: Saturday 18:30 PST
# Output: /tmp/seo-data/blogs/
#

set -e

OUTPUT_DIR="/tmp/seo-data/blogs"
KEYWORDS_FILE="/tmp/seo-data/keywords.json"
SCRIPT_DIR="/Users/terry-surface-pro/.openclaw/workspace/scripts"

mkdir -p "$OUTPUT_DIR"

echo "═══════════════════════════════════════════════════"
echo "📝 Step 2: Generate Blog Posts"
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"

# Check if keywords file exists
if [ ! -f "$KEYWORDS_FILE" ]; then
    echo "❌ Keywords file not found. Run Step 1 first."
    exit 1
fi

# Read keywords (use newline as delimiter)
KEYWORDS=$(cat "$KEYWORDS_FILE" | jq -r '.keywords[].keyword')

BLOG_COUNT=0
while IFS= read -r keyword; do
    [ -z "$keyword" ] && continue
    BLOG_COUNT=$((BLOG_COUNT + 1))
    echo ""
    echo "--- Generating blog #$BLOG_COUNT: $keyword ---"
    
    # Convert keyword to slug
    SLUG=$(echo "$keyword" | sed 's/[^a-z0-9]/-/g' | tr '[:upper:]' '[:lower]')
    BLOG_DIR="$OUTPUT_DIR/blog-$BLOG_COUNT"
    mkdir -p "$BLOG_DIR"
    
    # Generate metadata
    cat > "$BLOG_DIR/metadata.json" <<EOF
{
  "keyword": "$keyword",
  "slug": "$SLUG",
  "title": "$(echo $keyword | sed 's/\b\./ /g' | sed 's/^\(.\)/\U\1/')",
  "generatedAt": "$(date -Iseconds)",
  "priority": $BLOG_COUNT
}
EOF
    
    # Generate blog content using template
    if [ -f "$SCRIPT_DIR/seo-blog-generator.js" ]; then
        node "$SCRIPT_DIR/seo-blog-generator.js" generate "how-to-compress-pdf" 2>/dev/null || {
            echo "Using fallback blog template..."
        }
    fi
    
    # Create blog content file
    cat > "$BLOG_DIR/content.mdx" <<EOF
# How to $(echo $keyword | sed 's/\b\./ /g' | sed 's/^\(.\)/\U\1/'): Complete Guide 2026

## Introduction

This comprehensive guide covers everything you need to know about $keyword. 

## Why This Matters

In 2026, PDF management is essential for both personal and professional workflows. Whether you're a student, freelancer, or enterprise user, understanding how to $keyword can save you hours every week.

## Step-by-Step Instructions

### Method 1: MiniAIPDF (Recommended)

The fastest and most reliable way to $keyword:

1. Visit [MiniAIPDF](https://miniaipdf.com)
2. Upload your PDF file
3. Select your desired options
4. Download the result

**Time required**: Less than 30 seconds

### Method 2: Free Online Tools

Several free alternatives exist:

- iLovePDF
- Smallpdf  
- PDF2GO

### Method 3: Desktop Software

For advanced users who need offline capabilities.

## Pro Tips

- Always backup your original files
- Use batch processing for multiple files
- Check file quality after conversion

## Conclusion

$keyword doesn't have to be complicated. With the right tools and this guide, you can accomplish it in seconds.

---

*Generated on $(date '+%Y-%m-%d') by MiniAIPDF SEO Engine*
EOF
    
    echo "✅ Created: $BLOG_DIR/content.mdx"
done <<< "$KEYWORDS"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Step 2 Complete - Generated $BLOG_COUNT blogs"
echo "═══════════════════════════════════════════════════"

# List generated blogs
echo ""
echo "Generated blogs:"
ls -la "$OUTPUT_DIR/"
