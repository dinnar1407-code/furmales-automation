# Setup Guide: Reddit API

**Integration**: Reddit API  
**Time**: 20 minutes  
**Difficulty**: Medium  

---

## Why This Matters

- Auto-post to Reddit communities
- Monitor mentions of MiniAIPDF
- Track subreddit activity
- Engage with users automatically

---

## Step 1: Create Reddit App

1. Go to: https://www.reddit.com/prefs/apps
2. Look for **"developed applications"** section
3. Click **"are you a developer? create an app..."**
4. Fill in:
   - **Name**: `MiniAIPDF Bot`
   - **App type**: Select **"script"**
   - **Description**: `SEO and marketing bot for MiniAIPDF`
   - **About URL**: `https://miniaipdf.com`
   - **Redirect URI**: `https://miniaipdf.com`
5. Click **"Create app"**

## Step 2: Copy Credentials

You'll see:
- **client_id**: (under the app name)
- **client_secret**: (shown once)
- **username**: your Reddit username
- **password**: your Reddit password
- **user_agent**: `MiniAIPDF Bot v1.0`

## Step 3: Test Connection

Use this script to verify:
```bash
curl -X POST -u "client_id:client_secret" \
  -d "grant_type=password&username=USERNAME&password=PASSWORD" \
  https://www.reddit.com/api/v1/access_token
```

## Step 4: Share with Playfish

**Tell Playfish:**
> "Reddit API ready!
> - Client ID: [paste]
> - Client Secret: [paste]
> - Username: [your Reddit username]
> - Password: [your Reddit password]"

---

## What We'll Build

```
Content Template
      ↓
Auto-generate Reddit post
      ↓
Post to target subreddits
      ↓
Monitor comments
      ↓
Auto-reply with helpful answers
```

---

## Target Subreddits

| Subreddit | Purpose | Post Type |
|-----------|---------|-----------|
| r/productivity | B2C traffic | Tool showcase |
| r/freelance | B2C traffic | Problem/solution |
| r/SideProject | Launch traffic | "I built this" |
| r/Python | Developer traffic | Code snippet |
| r/webdev | Developer traffic | Tool recommendation |

---

## ⚠️ Reddit Rules

1. **No spam**: Don't post the same thing repeatedly
2. **Add value**: Comments must be helpful
3. **Wait times**: Space out posts by days
4. **Karma required**: Some subreddits require account age/karma

---

## Rate Limits

| Action | Limit |
|--------|-------|
| Posts per day | ~5-10 |
| Comments per day | ~30 |
| API calls per minute | 60 |

---

*Estimated time: 20 minutes*
