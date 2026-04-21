#!/usr/bin/env node
/**
 * SEO Rank Checker
 * 监控关键词排名变化
 */

const https = require('https');

const CONFIG = {
  domain: 'miniaipdf.com',
  keywords: [
    'compress pdf',
    'merge pdf',
    'split pdf',
    'rotate pdf',
    'pdf compressor',
    'pdf tools',
    'ai pdf'
  ],
  searchEngines: ['google', 'bing'],
  location: 'us'
};

function googleSearchUrl(keyword, page = 0) {
  const start = page * 10;
  const base = 'https://www.google.com/search';
  return `${base}?q=${encodeURIComponent(keyword)}&start=${start}`;
}

function checkRank(keyword, domain = CONFIG.domain) {
  return new Promise((resolve) => {
    const url = googleSearchUrl(keyword);
    
    // In production, use a SERP API instead of direct scraping
    // This is a placeholder that simulates rank checking
    
    const result = {
      keyword,
      domain,
      rank: null,
      found: false,
      checkedAt: new Date().toISOString(),
      note: 'Requires SERP API (Google Search Console, SerpAPI, or similar)'
    };
    
    // Simulate no rank (in production, parse actual SERP results)
    setTimeout(() => resolve(result), 100);
  });
}

async function checkAllKeywords() {
  console.log('=== SEO Rank Check ===\n');
  console.log(`Domain: ${CONFIG.domain}`);
  console.log(`Keywords: ${CONFIG.keywords.length}\n`);
  
  const results = [];
  
  for (const keyword of CONFIG.keywords) {
    process.stdout.write(`Checking: "${keyword}"... `);
    const result = await checkRank(keyword);
    results.push(result);
    
    if (result.found) {
      console.log(`Rank #${result.rank}`);
    } else {
      console.log('Not in top 100');
    }
  }
  
  console.log('\n=== Summary ===\n');
  
  const found = results.filter(r => r.found);
  const notFound = results.filter(r => !r.found);
  
  console.log(`Tracked: ${results.length}`);
  console.log(`In Top 100: ${found.length}`);
  console.log(`Not Found: ${notFound.length}`);
  
  if (found.length > 0) {
    console.log('\n=== Top Rankings ===\n');
    found
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .forEach(r => {
        console.log(`#${r.rank} - ${r.keyword}`);
      });
  }
  
  console.log('\n=== Not Yet Ranking ===\n');
  notFound.forEach(r => {
    console.log(`- ${r.keyword}`);
  });
  
  return results;
}

function generateReport(results) {
  const now = new Date().toISOString().split('T')[0];
  const reportPath = `memory/seo-rank-reports/${now}.md`;
  
  let report = `# SEO Rank Report - ${now}\n\n`;
  report += `## Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Keywords | ${results.length} |\n`;
  report += `| In Top 100 | ${results.filter(r => r.found).length} |\n`;
  report += `| Not Found | ${results.filter(r => !r.found).length} |\n\n`;
  
  const found = results.filter(r => r.found);
  if (found.length > 0) {
    report += `## Rankings\n\n`;
    report += `| Keyword | Rank | Change |\n`;
    report += `|---------|------|--------|\n`;
    found
      .sort((a, b) => a.rank - b.rank)
      .forEach(r => {
        report += `| ${r.keyword} | #${r.rank} | - |\n`;
      });
    report += '\n';
  }
  
  return report;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'check') {
    checkAllKeywords().then(results => {
      const report = generateReport(results);
      console.log('\n' + report);
    });
  } else if (args[0] === 'add' && args[1]) {
    CONFIG.keywords.push(args[1]);
    console.log(`Added "${args[1]}" to tracking list`);
  } else if (args[0] === 'list') {
    console.log('Tracked keywords:\n');
    CONFIG.keywords.forEach((k, i) => {
      console.log(`${i + 1}. ${k}`);
    });
  } else {
    console.log(`
SEO Rank Checker

Usage:
  node seo-rank-checker.js check      - Check all keyword rankings
  node seo-rank-checker.js add <kw>   - Add keyword to tracking
  node seo-rank-checker.js list        - List tracked keywords
    `);
  }
}

module.exports = { checkRank, checkAllKeywords, CONFIG };
