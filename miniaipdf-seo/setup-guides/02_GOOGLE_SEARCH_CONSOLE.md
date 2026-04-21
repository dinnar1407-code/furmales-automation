# Setup Guide: Google Search Console API

**Integration**: Google Search Console  
**Time**: 30 minutes  
**Difficulty**: Medium  

---

## Why This Matters

- Track keyword rankings automatically
- See which pages get the most clicks
- Get search traffic data daily
- Identify SEO opportunities

---

## Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name: `MiniAIPDF-SEO`
4. Click **"Create"**

## Step 2: Enable Search Console API

1. In the new project, click **"+ Enable APIs and Services"**
2. Search for: **"Search Console API"**
3. Click on it
4. Click **"Enable"**

## Step 3: Create OAuth Credentials

1. Go to **"Credentials"** (sidebar)
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. Application type: **"Web application"**
5. Name: `MiniAIPDF SEO Dashboard`
6. Authorized redirect URIs:
   ```
   https://developers.google.com/oauthplayground
   ```
7. Click **"Create"**
8. **Copy and save:**
   - Client ID
   - Client Secret

## Step 4: Quick Auth Test

1. Go to: https://developers.google.com/oauthplayground
2. Click **"Settings"** (⚙️)
3. Check **"Use your own OAuth credentials"**
4. Enter your Client ID and Client Secret
5. In the left panel, search for **"Search Console API v3"**
6. Select: `https://www.googleapis.com/auth/webmasters.readonly`
7. Click **"Authorize APIs"**
8. Complete the OAuth flow
9. Click **"Exchange authorization code for tokens"**
10. Copy the **Access Token**

## Step 5: Share with Playfish

**Tell Playfish:**
> "Google Search Console is set up! Here are the credentials:
> - Client ID: [paste]
> - Client Secret: [paste]
> - Access Token: [paste]"

---

## What We'll Build

```
Google Search Console API
          ↓
Daily ranking data collection
          ↓
Keyword position tracking
          ↓
Weekly SEO report (Telegram)
```

---

## ⚠️ Notes

- Access token expires in ~1 hour
- We'll set up refresh token for automatic renewal
- You only need to do this once

---

## If You Hit Issues

| Issue | Solution |
|-------|----------|
| No "Create" button | Check project is selected |
| API not found | Search "searchconsole" |
| OAuth error | Use correct email for auth |

---

*Estimated time: 30 minutes*
