#!/usr/bin/env node
/**
 * SEO Quality Check Script
 * Validates blog posts before publishing
 * 
 * Usage: node seo-quality-check.js <file>
 */

const fs = require('fs');
const path = require('path');

const MIN_WORD_COUNT = 1200;
const MAX_KEYWORD_DENSITY = 3;
const MIN_KEYWORD_DENSITY = 0.5;

function analyzeFile(filePath) {
  console.log(`\n📄 Analyzing: ${filePath}`);
  console.log('═'.repeat(50));
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const stats = fs.statSync(filePath);
  
  // Extract frontmatter if exists
  let frontmatter = {};
  let body = content;
  
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end > 0) {
      const fm = content.slice(3, end).trim();
      fm.split('\n').forEach(line => {
        const [key, ...vals] = line.split(':');
        if (key && vals.length) {
          frontmatter[key.trim()] = vals.join(':').trim();
        }
      });
      body = content.slice(end + 3).trim();
    }
  }
  
  // Basic metrics
  const wordCount = body.split(/\s+/).filter(w => w).length;
  const charCount = body.length;
  const readTime = Math.ceil(wordCount / 200);
  
  console.log(`📊 Basic Metrics:`);
  console.log(`   Words: ${wordCount}`);
  console.log(`   Characters: ${charCount}`);
  console.log(`   Est. Read Time: ${readTime} min`);
  
  // Check word count
  const wordCountPass = wordCount >= MIN_WORD_COUNT;
  console.log(`\n${wordCountPass ? '✅' : '❌'} Word Count: ${wordCount} (min: ${MIN_WORD_COUNT})`);
  
  // Extract title
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'No H1 found';
  console.log(`\n📌 Title: ${title}`);
  
  // Extract meta description
  const metaMatch = content.match(/description:\s*["'](.+)["']/);
  const metaDesc = metaMatch ? metaMatch[1] : null;
  console.log(`${metaDesc ? '✅' : '❌'} Meta Description: ${metaDesc || 'Missing'}`);
  
  // Check for images
  const imageMatches = body.match(/!\[.*?\]\(.*?\)/g) || [];
  console.log(`\n🖼️ Images: ${imageMatches.length}`);
  
  // Extract headings
  const h2Matches = body.match(/^##\s+(.+)$/gm) || [];
  const h3Matches = body.match(/^###\s+(.+)$/gm) || [];
  console.log(`\n📑 Headings:`);
  console.log(`   H2: ${h2Matches.length}`);
  console.log(`   H3: ${h3Matches.length}`);
  
  // Check for internal links
  const internalLinks = body.match(/\[.+\]\(\/(?!https?:)/g) || [];
  console.log(`\n🔗 Internal Links: ${internalLinks.length}`);
  
  // Check for external links
  const externalLinks = body.match(/\[.+\]\(https?:\/\//g) || [];
  console.log(`🔗 External Links: ${externalLinks.length}`);
  
  // Extract keyword from frontmatter or title
  const keyword = frontmatter.keyword || frontmatter.tags?.split(',')[0] || 'unknown';
  if (keyword !== 'unknown') {
    const keywordLower = keyword.toLowerCase();
    const bodyLower = body.toLowerCase();
    const keywordCount = (bodyLower.match(new RegExp(keywordLower, 'g')) || []).length;
    const keywordDensity = (keywordCount / wordCount * 100).toFixed(2);
    
    console.log(`\n🔑 Keyword: "${keyword}"`);
    console.log(`   Occurrences: ${keywordCount}`);
    console.log(`   Density: ${keywordDensity}%`);
    
    const densityPass = keywordDensity >= MIN_KEYWORD_DENSITY && keywordDensity <= MAX_KEYWORD_DENSITY;
    console.log(`${densityPass ? '✅' : '⚠️'} Keyword Density: ${keywordDensity}% (ideal: ${MIN_KEYWORD_DENSITY}-${MAX_KEYWORD_DENSITY}%)`);
  }
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📋 Quality Summary:');
  
  const checks = [
    { name: 'Word Count', pass: wordCountPass, note: `${wordCount >= MIN_WORD_COUNT ? '✅' : '❌'} ${wordCount}/${MIN_WORD_COUNT}` },
    { name: 'Meta Description', pass: !!metaDesc, note: metaDesc ? '✅ Found' : '❌ Missing' },
    { name: 'Images', pass: imageMatches.length > 0, note: imageMatches.length > 0 ? `✅ ${imageMatches.length}` : '⚠️ No images' },
    { name: 'Internal Links', pass: internalLinks.length >= 2, note: internalLinks.length >= 2 ? `✅ ${internalLinks.length}` : '⚠️ Need more' },
  ];
  
  checks.forEach(check => {
    console.log(`   ${check.pass ? '✅' : '⚠️'} ${check.name}: ${check.note}`);
  });
  
  const allPass = checks.every(c => c.pass);
  console.log('\n' + '═'.repeat(50));
  console.log(allPass ? '✅ Quality Check PASSED' : '⚠️ Quality Check PASSED (with warnings)');
  
  return true;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node seo-quality-check.js <file>');
  console.log('Example: node seo-quality-check.js blog_posts/latest.md');
  process.exit(1);
}

analyzeFile(args[0]);
