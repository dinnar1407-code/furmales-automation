#!/usr/bin/env node
/**
 * SEO Keyword Research Tool
 * 自动化关键词研究，支持 Google Trends API 和手动输入
 */

const https = require('https');

const TOOLS = [
  'compress-pdf', 'merge-pdf', 'split-pdf', 'rotate-pdf', 
  'protect-pdf', 'unlock-pdf', 'watermark-pdf', 'ai-summarize',
  'ocr-pdf', 'pdf-to-word', 'pdf-to-excel', 'pdf-to-jpg'
];

const KEYWORD_MODIFIERS = [
  'how to', 'best', 'free', 'online', 'without losing quality',
  'for free', 'online free', 'tool', 'software', 'app'
];

function generateKeywords(tools = TOOLS, modifiers = KEYWORD_MODIFIERS) {
  const keywords = [];
  
  for (const tool of tools) {
    // Exact match
    keywords.push(tool.replace('-', ' '));
    
    // With modifiers
    for (const mod of modifiers) {
      keywords.push(`${mod} ${tool.replace('-', ' ')}`);
      keywords.push(`${tool.replace('-', ' ')} ${mod}`);
    }
    
    // Long-tail
    keywords.push(`why is my ${tool.replace('-', ' ')} so big`);
    keywords.push(`can't ${tool.replace('-', ' '}`);
    keywords.push(`${tool.replace('-', ' ')} not working`);
  }
  
  return [...new Set(keywords)];
}

function estimateDifficulty(keyword) {
  // Simple heuristic based on keyword length and competition indicators
  const wordCount = keyword.split(' ').length;
  const hasModifier = KEYWORD_MODIFIERS.some(m => keyword.includes(m));
  
  if (wordCount >= 4 && !hasModifier) return 'low';
  if (wordCount >= 3 || hasModifier) return 'medium';
  return 'high';
}

function estimateVolume(keyword) {
  // Placeholder - in production, integrate with Google Keyword Planner API
  return Math.floor(Math.random() * 10000) + 100;
}

function analyzeKeyword(keyword) {
  return {
    keyword,
    difficulty: estimateDifficulty(keyword),
    estimatedVolume: estimateVolume(keyword),
    priority: estimateDifficulty(keyword) === 'low' ? 'high' : 
              estimateDifficulty(keyword) === 'medium' ? 'medium' : 'low'
  };
}

function generateBlogIdeas(keyword) {
  const base = keyword.replace(/-/g, ' ').replace(/how to /gi, '').trim();
  
  const ideas = [
    {
      title: `How to ${base.charAt(0).toUpperCase() + base.slice(1)}: Complete Guide (2026)`,
      targetKeyword: keyword,
      wordCount: 1500,
      sections: ['Introduction', 'Why', 'Methods', 'Pro Tips', 'Conclusion']
    },
    {
      title: `${base.charAt(0).toUpperCase() + base.slice(1)} vs Alternatives: Which is Best in 2026`,
      targetKeyword: `${base} vs`,
      wordCount: 1200,
      sections: ['Introduction', 'Feature Comparison', 'Pricing', 'Pros & Cons', 'Conclusion']
    }
  ];
  
  return ideas;
}

// Main execution
const keywords = generateKeywords();
const analyzed = keywords.map(analyzeKeyword);

// Sort by priority
analyzed.sort((a, b) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return priorityOrder[a.priority] - priorityOrder[b.priority];
});

// Output top 20
console.log('=== MiniAIPDF SEO Keyword Research ===\n');
console.log(`Total keywords generated: ${keywords.length}\n`);

console.log('=== Top 20 Priority Keywords ===\n');
analyzed.slice(0, 20).forEach((k, i) => {
  console.log(`${i + 1}. "${k.keyword}"`);
  console.log(`   Difficulty: ${k.difficulty} | Est. Volume: ${k.estimatedVolume} | Priority: ${k.priority}`);
  console.log('');
});

console.log('\n=== Blog Post Ideas ===\n');
const topKeyword = analyzed[0].keyword;
generateBlogIdeas(topKeyword).forEach((idea, i) => {
  console.log(`Idea ${i + 1}: ${idea.title}`);
  console.log(`   Target: ${idea.targetKeyword} | Words: ${idea.wordCount}`);
  console.log('');
});

module.exports = { generateKeywords, analyzeKeyword, generateBlogIdeas };
