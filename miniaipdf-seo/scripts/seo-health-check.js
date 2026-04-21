#!/usr/bin/env node
/**
 * SEO Health Check Script
 * Runs daily to verify MiniAIPDF site health
 * 
 * Usage: node seo-health-check.js
 */

const https = require('https');
const http = require('http');

const SITE = 'miniaipdf.com';
const PROTOCOL = 'https';

function checkUrl(path, name) {
  return new Promise((resolve) => {
    const url = `${PROTOCOL}://${SITE}${path}`;
    const start = Date.now();
    
    https.get(url, (res) => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const isHealthy = status >= 200 && status < 400;
      
      console.log(`[${isHealthy ? '✅' : '❌'}] ${name}`);
      console.log(`   URL: ${path}`);
      console.log(`   Status: ${status}`);
      console.log(`   Response: ${duration}ms`);
      
      resolve({
        name,
        path,
        status,
        duration,
        healthy: isHealthy
      });
      
      res.resume();
    }).on('error', (err) => {
      console.log(`[❌] ${name} - ERROR: ${err.message}`);
      resolve({
        name,
        path,
        status: 0,
        error: err.message,
        healthy: false
      });
    });
  });
}

async function main() {
  console.log('═'.repeat(50));
  console.log('🔍 MiniAIPDF SEO Health Check');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log('═'.repeat(50));
  console.log('');
  
  const checks = [
    checkUrl('/', 'Homepage'),
    checkUrl('/sitemap.xml', 'Sitemap'),
    checkUrl('/robots.txt', 'Robots.txt'),
    checkUrl('/blog', 'Blog'),
    checkUrl('/compress-pdf', 'Compress Tool'),
    checkUrl('/merge-pdf', 'Merge Tool'),
    checkUrl('/split-pdf', 'Split Tool'),
  ];
  
  const results = await Promise.all(checks);
  
  console.log('');
  console.log('═'.repeat(50));
  
  const healthy = results.filter(r => r.healthy).length;
  const total = results.length;
  
  console.log(`📊 Health Summary: ${healthy}/${total} checks passed`);
  
  if (healthy === total) {
    console.log('✅ All systems operational');
  } else {
    const failed = results.filter(r => !r.healthy);
    console.log(`❌ ${failed.length} checks failed:`);
    failed.forEach(f => console.log(`   - ${f.name}: ${f.error || `HTTP ${f.status}`}`));
  }
  
  console.log('═'.repeat(50));
  
  // Output JSON for Jarvis
  const output = {
    timestamp: new Date().toISOString(),
    site: SITE,
    total,
    healthy,
    status: healthy === total ? 'healthy' : 'degraded',
    checks: results
  };
  
  console.log('');
  console.log('📄 JSON Output:');
  console.log(JSON.stringify(output, null, 2));
  
  process.exit(healthy === total ? 0 : 1);
}

main().catch(err => {
  console.error('❌ Health check failed:', err);
  process.exit(1);
});
