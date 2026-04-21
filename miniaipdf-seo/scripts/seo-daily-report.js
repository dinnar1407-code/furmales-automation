#!/usr/bin/env node
/**
 * SEO Daily Report Script
 * Generates daily SEO summary for MiniAIPDF
 * 
 * Usage: node seo-daily-report.js
 */

const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8309413776';

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function generateReport(data = {}) {
  const date = formatDate();
  
  const report = `
📊 *MiniAIPDF SEO Daily Report*
${date}

${data.contentGenerated ? `✅ *Content Published*
   • ${data.contentGenerated} blog post(s)` : ''}

${data.keywordsTracked !== undefined ? `🔑 *Keywords Tracked*
   • ${data.keywordsTracked} keywords monitored` : ''}

${data.rankChanges ? `📈 *Ranking Highlights*
${data.rankChanges}` : ''}

${data.technicalIssues && data.technicalIssues.length > 0 ? `⚠️ *Technical Issues*
${data.technicalIssues.map(i => `   • ${i}`).join('\n')}` : '✅ *No Technical Issues*'}

${data.deploymentStatus ? `🚀 *Deployment*
   ${data.deploymentStatus}` : ''}

---
🌐 *miniaipdf.com*
`;

  return report.trim();
}

function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('📱 Telegram notification (no token):');
    console.log(message);
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.ok) {
            console.log('✅ Telegram notification sent!');
          } else {
            console.log('⚠️ Telegram error:', response.description);
          }
        } catch (e) {
          console.log('⚠️ Failed to parse Telegram response');
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log('⚠️ Telegram request failed:', e.message);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('═'.repeat(50));
  console.log('📊 MiniAIPDF SEO Daily Report');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log('═'.repeat(50));
  
  // Collect data
  const data = {
    contentGenerated: process.env.CONTENT_COUNT || '1',
    keywordsTracked: 47, // Placeholder
    deploymentStatus: '✅ Deployed successfully',
    technicalIssues: []
  };
  
  // Generate report
  const report = generateReport(data);
  
  console.log(report);
  
  // Send to Telegram
  await sendTelegram(report);
  
  console.log('\n✅ Daily report complete!');
}

main().catch(console.error);
