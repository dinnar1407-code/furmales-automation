# Setup Guide: YouTube API for Shorts

**Integration**: YouTube Data API v3  
**Time**: 30 minutes  
**Difficulty**: Medium  

---

## Why This Matters

- Auto-upload YouTube Shorts
- Get video analytics
- Track views and subscribers

---

## Step 1: Create Google Cloud Project

(If you already did Google Search Console setup, skip to Step 2)

1. Go to: https://console.cloud.google.com
2. Create new project: `MiniAIPDF-YouTube`

## Step 2: Enable YouTube Data API

1. Click **"+ Enable APIs and Services"**
2. Search: **"YouTube Data API v3"**
3. Click **"Enable"**

## Step 3: Create API Key

1. Go to **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"API key"**
4. Copy the key

## Step 4: Get YouTube Channel ID

1. Go to: https://www.youtube.com/account_advanced
2. Copy your **Channel ID** (starts with UC...)

## Step 5: Share with Playfish

**Tell Playfish:**
> "YouTube API ready!
> - API Key: [paste]
> - Channel ID: [paste]"

---

## What We'll Build

```
AI Script Generator
       ↓
TTS Voice Over (OpenClaw)
       ↓
Video Assembler (ffmpeg)
       ↓
YouTube API Upload
       ↓
Scheduled Shorts
```

---

## ⚠️ Important Notes

1. **Quotas**: YouTube has daily upload limits (10/day for regular, higher for Shorts)
2. **Content ID**: Don't use copyrighted music
3. **Thumbnails**: Auto-generated or manual upload

---

## Alternative: Manual Upload

If YouTube API is too complex, we can:
1. Auto-generate video files
2. Save to Dropbox/Google Drive
3. Terry reviews and uploads manually
4. Later automate when approved

---

*Estimated time: 30 minutes*
