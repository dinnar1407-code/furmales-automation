#!/usr/bin/env node
/**
 * FurMates Social Media Automation — Issue #8
 * scripts/social-media/post-scheduler.js
 *
 * Env: BUFFER_ACCESS_TOKEN, BUFFER_TWITTER_PROFILE_ID, BUFFER_INSTAGRAM_PROFILE_ID
 *      TWITTER_BEARER_TOKEN, SOCIAL_START_DATE
 *
 * Usage:
 *   node post-scheduler.js --preview      Preview today
 *   node post-scheduler.js --post         Post now
 *   node post-scheduler.js --post --day 5  Post day 5
 *   node post-scheduler.js --schedule-all  Schedule all 30 days
 *   node post-scheduler.js --report        Weekly report
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const CALENDAR = path.join(__dirname, 'content/30-day-calendar.json');
const BUFFER_API = 'https://api.bufferapp.com/1';
const TWITTER_API = 'https://api.twitter.com/2';
const START = process.env.SOCIAL_START_DATE ? new Date(process.env.SOCIAL_START_DATE) : new Date();

function loadCal() {
  if (!fs.existsSync(CALENDAR)) throw new Error('Calendar not found: '+CALENDAR);
  return JSON.parse(fs.readFileSync(CALENDAR, 'utf-8'));
}

function getDate(post) {
  const d = new Date(START);
  d.setDate(d.getDate() + post.date_offset);
  const [h,m] = post.time.split(':').map(Number);
  d.setHours(h,m,0,0);
  return d;
}

function todayPosts(cal, dayOverride) {
  const offset = dayOverride != null ? dayOverride-1 : Math.floor((new Date-START)/(86400000));
  return cal.filter(p => p.date_offset === offset);
}

async function bufPost(text, profile, schAt) {
  const tok = process.env.BUFFER_ACCESS_TOKEN;
  if (!tok) throw new Error('BUFFER_ACCESS_TOKEN not set');
  const body = new URLSearchParams({text, profile_ids: profile, access_token: tok});
  if (schAt) body.set('scheduled_at', schAt.toISOString()); else body.set('now','true');
  const r = await fetch(BUFFER_API+'/updates/create.json',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});
  if (!r.ok) throw new Error('Buffer '+r.status+': '+await r.text());
  return r.json();
}

afunction parseArgs() {
  const a = {};
  for (let i=2;i<process.argv.length;i++) {
    if (process.argv[i].startsWith('--')) {
      const k = process.argv[i].slice(2);
      const n = process.argv[i+1];
      a[k] = n&&!n.startsWith('--') ? (++i,n) : true;
    }
  }
  return a;
}

async function main() {
  const args = parseArgs();
  const cal = loadCal();
  console.log('🐾 FurMates Social Media Automation');
  console.log('📅 Start: '+START.toLocaleDateString()+' | 📋 Posts: '+cal.length);

  if (args.report) {
    console.log('\n📊 Weekly Report');
    const w = new Date(); w.setDate(w.getDate()-7);
    cal.filter(p=>{const d=getDate(p);return d>=w && d<=new Date();})
       .forEach(p=>console.log('  Day'+p.day+': '+p.category));
    return;
  }

  if (args['schedule-all']) {
    console.log('\n📅 Scheduling all 30 days via Buffer...');
    for (const p of cal) {
      console.log('Day '+p.day+': '+p.category+' ('+getDate(p).toLocaleDateString()+')');
      if (process.env.BUFFER_TWITTER_PROFILE_ID) await bufPost(p.twitter,process.env.BUFFER_TWITTER_PROFILE_ID,getDate(p));
      if (process.env.BUFFER_INSTAGRAM_PROFILE_ID) await bufPost(p.instagram_caption,process.env.BUFFER_INSTAGRAM_PROFILE_ID,getDate(p));
      await new Promise(r=>setTimeout(r,500));
    }
    console.log('\n✅ All 30 days scheduled!');
    return;
  }

  const posts = todayPosts(cal, args.day ? parseInt(args.day) : undefined);
  if (!posts.length) { console.log('\n📭 No posts today. Use --day N (1-30)'); return; }

  console.log('\n📝 '+posts.length+' post(s):\n');
  for (const p of posts) {
    console.log('━━ Day '+p.day+': '+p.category.replace(/_/g,' ')+' ('+p.platform.join('+')+')');
    console.log('Twitter: '+p.twitter.slice(0,100)+'...');
    if (args.preview) { console.log('\n[Preview mode]\n'); continue; }
    if (args.post) {
      if (process.env.BUFFER_TWITTER_PROFILE_ID) { await bufPost(p.twitter,process.env.BUFFER_TWITTER_PROFILE_ID,null); console.log('  ✅ Twitter posted'); }
      if (process.env.BUFFER_INSTAGRAM_PROFILE_ID) { await bufPost(p.instagram_caption,process.env.BUFFER_INSTAGRAM_PROFILE_ID,null); console.log('  ✅ Instagram posted'); }
    }
  }
  if (!args.post && !args.preview) console.log('\nAdd --post, --preview, or --schedule-all');
}

main().catch(e=>{console.error('Fatal:',e.message);process.exit(1);});
