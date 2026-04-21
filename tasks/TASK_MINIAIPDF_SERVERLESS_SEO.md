# Task: MiniAIPDF SEO Serverless Automation

**Priority**: P2  
**Status**: Open  
**Created**: 2026-04-21

## 🎯 Objective

Convert MiniAIPDF SEO automation from Jarvis Workflow (chat-only) to real serverless execution (like FurMates automation).

## 📁 Reference

See how FurMates automation works in:
- `lib/email-drip.ts`
- `lib/angel-scanner.ts`
- `lib/tidio-timeout.ts`

These run as **Vercel Serverless Functions** and execute real code.

## 📋 Required Implementations

### 1. SEO Content Generator (Daily)

**File**: `lib/seo-daily.ts`

```typescript
// Triggered by cron or webhook
// 1. Keyword research (use existing scripts)
// 2. Generate blog post
// 3. Deploy to GitHub (git push)
// 4. Send Telegram notification
```

**Dependencies**:
- GitHub API (for git push)
- OpenAI/Claude (for content generation)
- Telegram Bot (for notifications)

### 2. SEO Health Checker (Hourly)

**File**: `lib/seo-health.ts`

```typescript
// Every hour:
// 1. Check miniaipdf.com status
// 2. Check blog pages return 200
// 3. Alert if issues found
```

### 3. Ranking Tracker (Daily)

**File**: `lib/seo-rank-tracker.ts`

```typescript
// Daily at 09:00:
// 1. Fetch Google Search Console data
// 2. Update ranking database
// 3. Report changes to Telegram
```

### 4. Social Poster (Daily)

**File**: `lib/seo-social-poster.ts`

```typescript
// Daily at 10:00:
// 1. Read latest blog
// 2. Generate Twitter/LinkedIn posts
// 3. Post via API
```

## 🔧 Tech Stack

| Component | Tool |
|-----------|------|
| Runtime | Vercel Serverless Functions |
| Cron | Vercel Cron Jobs |
| Data | In-memory or KV store |
| Notifications | Telegram Bot API |
| Git | Simple git push (child_process) |

## 📅 Schedule

| Job | File | Cron | Time |
|-----|------|------|------|
| Content Generator | seo-daily.ts | `0 9 * * 1-5` | 09:00 Mon-Fri |
| Health Checker | seo-health.ts | `0 * * * *` | Every hour |
| Ranking Tracker | seo-rank-tracker.ts | `0 9 * * *` | 09:00 Daily |
| Social Poster | seo-social-poster.ts | `0 10 * * *` | 10:00 Daily |

## ✅ Success Criteria

1. Real bash/git commands execute (not chat agents)
2. Telegram notifications sent with actual results
3. No human intervention required
4. Logs visible in Vercel dashboard

## 🔗 Reference

- FurMates automation repo: `furmales-automation`
- Existing scripts: `/scripts/seo-*.js`
- MiniAIPDF repo: `dinnar1407-code/miniAIpdf_Claud-code`
