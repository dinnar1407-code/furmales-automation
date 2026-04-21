# MiniAIPDF SEO Flow Architecture

**Version**: 2.0  
**Status**: Ready to Implement  
**Created**: 2026-04-20

---

## 🎯 Two-Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINIAPDF SEO ENGINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   PREP FLOW (准备流)                       │  │
│  │  Runs: Saturday 18:00 PST (before main flow)            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Step 1: Keyword Research                                │  │
│  │          → Save to: /tmp/seo-data/keywords.json         │  │
│  │                                                          │  │
│  │  Step 2: Generate 3 Blog Posts                          │  │
│  │          → Save to: /tmp/seo-data/blogs/                │  │
│  │                                                          │  │
│  │  Step 3: Generate Social Content                        │  │
│  │          → Save to: /tmp/seo-data/social/               │  │
│  │                                                          │  │
│  │  Step 4: Generate Report                                │  │
│  │          → Save to: /tmp/seo-data/prep-report.md       │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│                   /tmp/seo-data/                                  │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   MAIN FLOW (主流程)                      │  │
│  │  Runs: Daily 09:00 PST                                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Step 1: Read Prep Data                                 │  │
│  │          ← Read: /tmp/seo-data/                         │  │
│  │                                                          │  │
│  │  Step 2: Health Check                                   │  │
│  │          → If fail, notify + skip deploy                │  │
│  │                                                          │  │
│  │  Step 3: Deploy Content                                 │  │
│  │          → Git add + commit + push                       │  │
│  │                                                          │  │
│  │  Step 4: Publish Social                                │  │
│  │          → Twitter/X post                               │  │
│  │                                                          │  │
│  │  Step 5: Send Telegram Report                          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Data Exchange Format

### `/tmp/seo-data/keywords.json`
```json
{
  "generatedAt": "2026-04-20T18:00:00-07:00",
  "keywords": [
    {
      "keyword": "compress pdf online free",
      "volume": 12000,
      "difficulty": "medium",
      "priority": 1
    },
    {
      "keyword": "merge pdf files",
      "volume": 8000,
      "difficulty": "medium", 
      "priority": 2
    },
    {
      "keyword": "split pdf page",
      "volume": 5000,
      "difficulty": "easy",
      "priority": 3
    }
  ]
}
```

### `/tmp/seo-data/blogs/`
```
blogs/
├── blog-001/
│   ├── metadata.json      # keyword, title, url_slug
│   ├── content.mdx       # full blog content
│   └── social-copy.md    # tweet/linkedin text
├── blog-002/
│   └── ...
└── blog-003/
    └── ...
```

### `/tmp/seo-data/social/blog-001-social-copy.md`
```markdown
## Twitter
New guide: How to compress PDF files for free in 2026 🔥

7 proven methods, 50-80% size reduction

miniaipdf.com/blog/compress-pdf-online-free

## LinkedIn
[Longer post with professional tone]
```

### `/tmp/seo-data/prep-report.md`
```markdown
# SEO Prep Report - 2026-04-20

## Keywords Selected
1. compress pdf online free (P1)
2. merge pdf files (P2)
3. split pdf page (P3)

## Blogs Generated
- blog-001: How to Compress PDF Online Free
- blog-002: How to Merge PDF Files in 2026
- blog-003: How to Split PDF Pages

## Ready for Deployment
✅ 3 blogs ready
✅ Social copy ready
```

---

## 🔧 Prep Flow Implementation

### Step 1: Keyword Research
```bash
node scripts/seo-keyword-research.js --count 3 --output /tmp/seo-data/keywords.json
```

### Step 2: Generate Blogs
```bash
# Generate 3 blogs based on keywords
for keyword in $(cat /tmp/seo-data/keywords.json | jq -r '.keywords[].keyword'); do
  node scripts/seo-blog-generator.js generate --keyword "$keyword" --output /tmp/seo-data/blogs/
done
```

### Step 3: Generate Social Copy
```bash
node scripts/seo-social-generator.js --input /tmp/seo-data/blogs/ --output /tmp/seo-data/social/
```

### Step 4: Create Prep Report
```bash
node scripts/seo-prep-report.js --input /tmp/seo-data/ --output /tmp/seo-data/prep-report.md
```

---

## 🚀 Main Flow Implementation

### Step 1: Read Prep Data
```bash
# Check if prep data exists
if [ ! -f /tmp/seo-data/prep-report.md ]; then
  echo "ERROR: No prep data found. Run Prep Flow first."
  exit 1
fi
```

### Step 2: Health Check
```bash
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://miniaipdf.com)
if [ "$HEALTH" != "200" ]; then
  curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=8309413776" \
    -d "text=⚠️ MiniAIPDF Health Check Failed: HTTP $HEALTH"
  exit 1
fi
```

### Step 3: Deploy Content
```bash
cd /tmp/miniAIpdf_Claud-code
git pull origin main
cp -r /tmp/seo-data/blogs/* app/blog/
git add .
git commit -m "SEO: $(date '+%Y-%m-%d') - New blog posts"
git push origin main
```

### Step 4: Publish Social
```bash
for file in /tmp/seo-data/social/*; do
  TWITTER_TEXT=$(grep -A1 "^## Twitter" "$file" | tail -1)
  bash scripts/send-tweet-v2.sh "$TWITTER_TEXT"
done
```

### Step 5: Send Report
```bash
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=8309413776" \
  -d "text=$(cat /tmp/seo-data/prep-report.md)"
```

---

## ⏰ Schedule

| Flow | Frequency | Time | Purpose |
|------|-----------|------|---------|
| **Prep Flow** | Weekly | Saturday 18:00 PST | Prepare content |
| **Main Flow** | Daily | 09:00 PST | Deploy & publish |

**Why this split?**
- Saturday: AI generates content (takes time)
- Sunday: Content "rests" for review
- Monday-Friday: Auto-deploy without AI generation

---

## 🎯 Advantages of This Architecture

| Benefit | Explanation |
|---------|-------------|
| **No agent blocking** | Prep and Main run independently |
| **Review opportunity** | Content ready Saturday, deployed Monday |
| **Retry friendly** | If Main fails, just re-run (data preserved) |
| **Scalable** | Easy to add more blogs or social platforms |
| **Debuggable** | Clear data flow, can inspect at each step |

---

## 📋 Jarvis Workflows Setup

### Prep Flow (Weekly)
```yaml
id: miniAIPDF-seo-prep
name: MiniAIPDF SEO Prep (Weekly)
trigger: "0 18 * * 6"  # Saturday 18:00 PST

steps:
  - script: keyword-research.sh
  - script: generate-blogs.sh
  - script: generate-social.sh
  - script: create-prep-report.sh
```

### Main Flow (Daily)
```yaml
id: miniAIPDF-seo-main
name: MiniAIPDF SEO Main (Daily)
trigger: "0 9 * * *"  # Daily 09:00 PST

steps:
  - script: check-prep-data.sh
  - script: health-check.sh
  - script: deploy-content.sh
  - script: publish-social.sh
  - notify: telegram-report
```

---

## 🔄 Data Lifecycle

```
Saturday 18:00 → Prep Flow runs → /tmp/seo-data/ populated
                           ↓
Sunday → Terry can review content (optional)
                           ↓
Monday 09:00 → Main Flow reads data → Deploys
                           ↓
Tuesday-Friday → Main Flow re-runs same data (no new content)
                           ↓
Next Saturday → Prep Flow creates NEW content
```

---

## ✅ Next Steps

1. Create Prep Flow scripts
2. Create Main Flow scripts  
3. Set up Jarvis workflows (or use cron)
4. Test the full cycle

---

*This architecture solves the agent-blocking problem by decoupling content generation from deployment.*
