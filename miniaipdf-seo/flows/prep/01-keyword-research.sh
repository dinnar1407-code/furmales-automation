#!/bin/bash
#
# SEO Prep Flow - Step 1: Keyword Research
# Runs: Saturday 18:00 PST
# Output: /tmp/seo-data/keywords.json
#

set -e

OUTPUT_DIR="/tmp/seo-data"
mkdir -p "$OUTPUT_DIR"

echo "═══════════════════════════════════════════════════"
echo "🔍 Step 1: Keyword Research"
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"

# Default keywords if no research needed
DEFAULT_KEYWORDS='{
  "generatedAt": "'$(date -Iseconds)'",
  "keywords": [
    {
      "keyword": "compress pdf online free",
      "volume": 12000,
      "difficulty": "medium",
      "priority": 1
    },
    {
      "keyword": "merge pdf files free",
      "volume": 8000,
      "difficulty": "medium",
      "priority": 2
    },
    {
      "keyword": "split pdf page online",
      "volume": 5000,
      "difficulty": "easy",
      "priority": 3
    }
  ]
}'

# Try running the keyword research script
if [ -f "/Users/terry-surface-pro/.openclaw/workspace/scripts/seo-keyword-research.js" ]; then
    echo "Running keyword research script..."
    node /Users/terry-surface-pro/.openclaw/workspace/scripts/seo-keyword-research.js \
        --count 3 \
        --output "$OUTPUT_DIR/keywords.json" 2>/dev/null || {
        echo "Script failed, using default keywords..."
        echo "$DEFAULT_KEYWORDS" > "$OUTPUT_DIR/keywords.json"
    }
else
    echo "Script not found, using default keywords..."
    echo "$DEFAULT_KEYWORDS" > "$OUTPUT_DIR/keywords.json"
fi

# Verify output
if [ -f "$OUTPUT_DIR/keywords.json" ]; then
    echo ""
    echo "✅ Keywords saved to: $OUTPUT_DIR/keywords.json"
    echo ""
    echo "Keywords selected:"
    cat "$OUTPUT_DIR/keywords.json" | jq -r '.keywords[] | "  \(.priority). \(.keyword) (\(.volume) vol)"'
else
    echo "❌ Failed to create keywords file"
    exit 1
fi

echo "═══════════════════════════════════════════════════"
echo "✅ Step 1 Complete"
echo "═══════════════════════════════════════════════════"
