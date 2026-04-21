#!/bin/bash
#
# SEO Main Flow - Deploy Content
# Runs: Daily 09:00 PST
#

set -e

DATA_DIR="/tmp/seo-data"
BLOGS_DIR="/tmp/seo-data/blogs"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"

send_telegram() {
    local message="$1"
    if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=8309413776" \
            -d "text=$message" > /dev/null
    fi
}

echo "═══════════════════════════════════════════════════"
echo "🚀 MiniAIPDF SEO Main Flow"
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S PST')"
echo "═══════════════════════════════════════════════════"

# Step 1: Check for prep data
echo ""
echo "📋 Step 1: Checking for prepared content..."

if [ ! -f "$DATA_DIR/prep-report.md" ]; then
    echo "⚠️ No prep data found. Please run Prep Flow first."
    exit 1
fi

echo "✅ Prep data found"

# Step 2: Health check
echo ""
echo "🏥 Step 2: Health Check..."

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://miniaipdf.com)
if [ "$HEALTH" = "200" ]; then
    echo "✅ Site is healthy (HTTP 200)"
else
    echo "❌ Site health check failed (HTTP $HEALTH)"
    send_telegram "⚠️ MiniAIPDF Health Check Failed: HTTP $HEALTH"
    exit 1
fi

# Step 3: Clone repo and deploy
echo ""
echo "📦 Step 3: Deploying content..."

REPO_DIR="/tmp/miniAIpdf_Claud-code-deploy"

if [ -d "$REPO_DIR" ]; then
    cd "$REPO_DIR"
    git pull origin main > /dev/null 2>&1
else
    git clone https://github.com/dinnar1407-code/miniAIpdf_Claud-code.git "$REPO_DIR" > /dev/null 2>&1
    cd "$REPO_DIR"
fi

# Copy blog files
BLOG_COUNT=0
if [ -d "$BLOGS_DIR" ]; then
    for blog_dir in "$BLOGS_DIR"/blog-*; do
        if [ -d "$blog_dir" ]; then
            METADATA="$blog_dir/metadata.json"
            if [ -f "$METADATA" ]; then
                SLUG=$(cat "$METADATA" | jq -r '.slug')
                CONTENT="$blog_dir/content.mdx"
                
                BLOG_DIR_TARGET="app/blog/$SLUG"
                mkdir -p "$BLOG_DIR_TARGET"
                
                # Create simple page.tsx
                TITLE=$(cat "$METADATA" | jq -r '.title')
                DESC="$SLUG - Complete guide from MiniAIPDF"
                
                cat > "$BLOG_DIR_TARGET/page.tsx" <<PAGEOF
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${TITLE}',
  description: '${DESC}',
};

export default function BlogPost() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <article className="prose prose-lg max-w-none">
PAGEOF
                
                # Add content from MDX file
                if [ -f "$CONTENT" ]; then
                    # Remove the # title line from content (already have metadata title)
                    tail -n +2 "$CONTENT" >> "$BLOG_DIR_TARGET/page.tsx"
                fi
                
                # Close the component
                cat >> "$BLOG_DIR_TARGET/page.tsx" <<'CLOSING'
      </article>
    </main>
  );
}
CLOSING

                BLOG_COUNT=$((BLOG_COUNT + 1))
                echo "  ✅ Deployed: $SLUG"
            fi
        fi
    done
    
    echo ""
    echo "📝 Total blogs deployed: $BLOG_COUNT"
fi

# Git commit and push
echo ""
echo "🚀 Step 4: Pushing to GitHub..."

cd "$REPO_DIR"
git config user.email "playfish@opsea.ai"
git config user.name "Playfish SEO Bot"
git add -A

if git diff --cached --quiet; then
    echo "ℹ️ No changes to commit"
else
    git commit -m "SEO: $(date '+%Y-%m-%d') - New blog posts" 2>/dev/null
    git push origin main 2>/dev/null
    echo "✅ Pushed to GitHub"
fi

# Step 5: Send report
echo ""
echo "📊 Step 5: Sending Telegram report..."

REPORT="✅ *MiniAIPDF SEO Daily Report*

📅 $(date '+%Y-%m-%d')
🌐 Site: miniaipdf.com

📊 Health: OK
📝 Blogs: $BLOG_COUNT deployed
🚀 Railway: Auto-deploying..."

send_telegram "$REPORT"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ MAIN FLOW COMPLETE!"
echo "═══════════════════════════════════════════════════"
