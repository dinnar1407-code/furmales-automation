#!/usr/bin/env node
/**
 * SEO Blog Post Generator
 * 基于关键词自动生成 SEO 友好的博客文章
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TITLE | MiniAIPDF',
  description: 'META_DESCRIPTION',
};

export default function BlogPost() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-8">H1_HEADING</h1>
        
        INTRO_PARAGRAPH
        
        H2_SECTIONS
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
        <p>KEYWORD_PLACEHOLDER is essential for MODULE_PLACEHOLDER. MiniAIPDF offers the best solution - free, fast, and no signup required.</p>
        <a href="https://miniaipdf.com" className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block mt-4">Try MiniAIPDF Free</a>
      </article>
    </main>
  );
}
`;

// Section templates
const METHOD_TEMPLATE = `
        <h2 className="text-2xl font-bold mt-8 mb-4">METHOD_TITLE</h2>
        <p>METHOD_INTRO</p>
        <ol>
METHOD_STEPS
        </ol>
`;

const STEP_TEMPLATE = `          <li>STEP_CONTENT</li>
`;

const PRO_TIPS_TEMPLATE = `
        <h2 className="text-2xl font-bold mt-8 mb-4">Pro Tips</h2>
        <ul>
PRO_TIPS
        </ul>
`;

const TIP_TEMPLATE = `          <li>TIP_CONTENT</li>
`;

function generateSteps(steps) {
  return steps.map(step => STEP_TEMPLATE.replace('STEP_CONTENT', step)).join('\n');
}

function generateProTips(tips) {
  return tips.map(tip => TIP_TEMPLATE.replace('TIP_CONTENT', tip)).join('\n');
}

function generateMethod(method) {
  let result = METHOD_TEMPLATE
    .replace('METHOD_TITLE', method.title)
    .replace('METHOD_INTRO', method.intro)
    .replace('METHOD_STEPS', generateSteps(method.steps));
  
  if (method.tips && method.tips.length > 0) {
    result += PRO_TIPS_TEMPLATE.replace('PRO_TIPS', generateProTips(method.tips));
  }
  
  return result;
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateBlogPost(config) {
  const {
    title,
    metaDescription,
    h1Heading,
    introParagraph,
    methods = [],
    keyword,
    module
  } = config;

  // Build H2 sections
  let h2Sections = '';
  for (const method of methods) {
    h2Sections += generateMethod(method);
  }

  // Build final content
  let content = TEMPLATE
    .replace('TITLE', title)
    .replace('META_DESCRIPTION', metaDescription)
    .replace('H1_HEADING', h1Heading)
    .replace('INTRO_PARAGRAPH', introParagraph)
    .replace('H2_SECTIONS', h2Sections)
    .replace('KEYWORD_PLACEHOLDER', keyword)
    .replace('MODULE_PLACEHOLDER', module);

  return content;
}

// Pre-built blog templates
const BLOG_TEMPLATES = {
  'how-to-compress-pdf': {
    title: 'How to Compress PDF Without Losing Quality | MiniAIPDF',
    metaDescription: '7 proven methods to reduce PDF file size by 50-80% without losing quality. Free tools + AI-powered solutions covered.',
    h1Heading: 'How to Compress PDF Without Losing Quality: The Ultimate Guide (2026)',
    introParagraph: '<p className="text-xl text-gray-600 mb-8">Need to reduce PDF file size without losing quality? This guide covers 7 proven methods from free online tools to AI-powered compression.</p>',
    keyword: 'compress PDF',
    module: 'document management and file size optimization',
    methods: [
      {
        title: 'Method 1: MiniAIPDF AI Compression (Recommended)',
        intro: 'The fastest, most reliable way to compress PDFs without quality loss:',
        steps: [
          'Visit MiniAIPDF',
          'Upload your PDF file',
          'Select compression level',
          'Download compressed file'
        ],
        tips: [
          'Choose "Balanced" mode for best quality/size ratio',
          'Large files may take longer to process',
          'Preview before downloading'
        ]
      },
      {
        title: 'Method 2: Adobe Acrobat',
        intro: 'Industry standard for PDF management:',
        steps: [
          'Open PDF in Adobe Acrobat',
          'File > Save As Other > Optimized PDF',
          'Adjust compression settings',
          'Save'
        ]
      }
    ]
  },
  
  'how-to-merge-pdfs': {
    title: 'How to Merge PDFs Online for Free | MiniAIPDF',
    metaDescription: 'Learn how to merge multiple PDFs into one file instantly. Free online tool with no signup required.',
    h1Heading: 'How to Merge PDFs Online for Free: Complete Guide (2026)',
    introParagraph: '<p className="text-xl text-gray-600 mb-8">Need to combine multiple PDFs? This guide shows the fastest ways to merge PDFs for free.</p>',
    keyword: 'merge PDFs',
    module: 'combining multiple documents',
    methods: [
      {
        title: 'Method 1: MiniAIPDF (Fastest)',
        intro: 'The easiest way to merge PDFs online:',
        steps: [
          'Visit MiniAIPDF',
          'Select "Merge PDF" tool',
          'Upload multiple PDF files',
          'Drag to reorder',
          'Click "Merge" and download'
        ],
        tips: [
          'Files are processed in upload order by default',
          'Maximum 50MB per file',
          'No signup required'
        ]
      }
    ]
  }
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'list') {
    console.log('Available blog templates:');
    Object.keys(BLOG_TEMPLATES).forEach(key => {
      console.log(`  - ${key}`);
    });
  } else if (command === 'generate' && args[1]) {
    const templateName = args[1];
    const template = BLOG_TEMPLATES[templateName];
    
    if (!template) {
      console.error(`Template "${templateName}" not found. Run with "list" to see available templates.`);
      process.exit(1);
    }
    
    const content = generateBlogPost(template);
    const outputPath = path.join(__dirname, '..', 'PROJECTS', 'MiniAIPDF', 'generated', `${templateName}.tsx`);
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content);
    
    console.log(`Generated: ${outputPath}`);
  } else if (command === 'keyword-research') {
    const kw = require('./seo-keyword-research.js');
    const keywords = kw.generateKeywords();
    const analyzed = keywords.map(kw.analyzeKeyword);
    
    console.log('=== Keywords by Priority ===\n');
    analyzed.slice(0, 10).forEach((k, i) => {
      console.log(`${i + 1}. [${k.priority.toUpperCase()}] "${k.keyword}"`);
    });
  } else {
    console.log(`
SEO Blog Generator

Usage:
  node seo-blog-generator.js list              - List available templates
  node seo-blog-generator.js generate <name>  - Generate blog from template
  node seo-blog-generator.js keyword-research   - Run keyword research
    `);
  }
}

module.exports = { generateBlogPost, BLOG_TEMPLATES };
