#!/bin/bash
#
# SEO Deploy Script
# Pushes new content to GitHub, Railway auto-deploys
#
# Usage: bash seo-deploy.sh
#

set -e

REPO_DIR="/tmp/miniaipdf-clone"
GITHUB_REPO="dinnar1407-code/miniAIpdf_Claud-code"

echo "═══════════════════════════════════════════════════"
echo "🚀 MiniAIPDF SEO Deploy"
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"

# Check if repo exists
if [ ! -d "$REPO_DIR" ]; then
    echo "📦 Cloning repository..."
    git clone "https://github.com/${GITHUB_REPO}.git" "$REPO_DIR"
else
    echo "📦 Pulling latest..."
    cd "$REPO_DIR"
    git pull origin main
fi

cd "$REPO_DIR"

# Show git status
echo ""
echo "📊 Git Status:"
git status --short

# Show diff
echo ""
echo "📝 Changes:"
git diff --stat

# Stage all changes
echo ""
echo "📤 Staging changes..."
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

# Commit with SEO timestamp
COMMIT_MSG="SEO Update: $(date '+%Y-%m-%d %H:%M')"
echo ""
echo "💾 Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Deploy complete! Railway will auto-deploy."
echo "⏰ Expected deploy time: 2-5 minutes"
echo "═══════════════════════════════════════════════════"

# Verify deployment
sleep 30
DEPLOY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://miniaipdf.com")

if [ "$DEPLOY_STATUS" = "200" ]; then
    echo "✅ Deployment verified: Site is up!"
else
    echo "⚠️ Deployment may still be in progress (HTTP $DEPLOY_STATUS)"
fi
