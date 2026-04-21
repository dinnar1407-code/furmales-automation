#!/bin/bash
#
# SEO Prep Flow - Step 3: Generate Social Media Copy
# Runs: Saturday 19:00 PST
# Output: /tmp/seo-data/social/
#

set -e

BLOGS_DIR="/tmp/seo-data/blogs"
OUTPUT_DIR="/tmp/seo-data/social"

mkdir -p "$OUTPUT_DIR"

echo "═══════════════════════════════════════════════════"
echo "📱 Step 3: Generate Social Media Copy"
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"

# Check if blogs exist
if [ ! -d "$BLOGS_DIR" ]; then
    echo "❌ Blogs directory not found. Run Step 2 first."
    exit 1
fi

BLOG_COUNT=0
for blog_dir in "$BLOGS_DIR"/blog-*; do
    if [ -d "$blog_dir" ]; then
        BLOG_COUNT=$((BLOG_COUNT + 1))
        METADATA="$blog_dir/metadata.json"
        
        if [ -f "$METADATA" ]; then
            KEYWORD=$(cat "$METADATA" | jq -r '.keyword')
            SLUG=$(cat "$METADATA" | jq -r '.slug')
            
            echo ""
            echo "--- Generating social copy for: $KEYWORD ---"
            
            SOCIAL_FILE="$OUTPUT_DIR/blog-$BLOG_COUNT-social.md"
            
            cat > "$SOCIAL_FILE" <<EOF
# Social Copy for: $KEYWORD
Generated: $(date -Iseconds)

---

## Twitter

New guide: How to $(echo $KEYWORD | sed 's/\b\./ /g')

$(echo $KEYWORD | sed 's/\b\./ /g' | sed 's/^\(.\)/\U\1/') - The complete guide for 2026

Free tools + AI-powered solutions included

miniaipdf.com/blog/$SLUG

#PDF #Productivity #AI

---

## LinkedIn

🚀 $(echo $KEYWORD | sed 's/\b\./ /g' | sed 's/^\(.\)/\U\1/')

I just published a comprehensive guide on $KEYWORD, and I think it could save you significant time.

What it covers:
→ Step-by-step instructions for 3 different methods
→ Free tools comparison
→ AI-powered advanced options
→ Pro tips from industry experts

Whether you're a student, freelancer, or enterprise user, this guide has something for you.

Read the full guide: miniaipdf.com/blog/$SLUG

What's your biggest PDF pain point? 👇

#PDFTools #Productivity #Technology

---

## Alternative Text (for images)

"How to $(echo $KEYWORD | sed 's/\b\./ /g') - Complete Guide 2026"
EOF
            
            echo "✅ Created: $SOCIAL_FILE"
        fi
    fi
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Step 3 Complete"
echo "═══════════════════════════════════════════════════"

# List generated files
echo ""
echo "Social copy files:"
ls -la "$OUTPUT_DIR/"
