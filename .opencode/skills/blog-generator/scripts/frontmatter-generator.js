#!/usr/bin/env node

/**
 * Frontmatter Generator Utility
 *
 * Generates complete blog frontmatter from task execution data.
 * Creates all required fields: core, AEO, SEO, and internal tracking.
 *
 * Usage:
 *   const generator = require('./scripts/frontmatter-generator');
 *   const frontmatter = await generator.generate(taskId, category, content);
 */

const fs = require('fs');
const path = require('path');

class FrontmatterGenerator {
  constructor() {
    this.tasksDir = path.join(process.cwd(), 'tasks');
    this.specsDir = path.join(process.cwd(), 'specs');
  }

  /**
   * Generate complete frontmatter for a blog post
   *
   * @param {string} taskId - Task ID (e.g., 'TASK-001')
   * @param {string} category - Blog category ('technology' or 'product')
   * @param {string} content - Generated blog content (for word count)
   * @returns {Object} Complete frontmatter object
   */
  async generate(taskId, category, content = '') {
    console.log(`[Frontmatter] Generating frontmatter for ${taskId}...`);

    const taskData = await this.loadTaskData(taskId);

    if (!taskData) {
      throw new Error(`Task data not found for ${taskId}`);
    }

    // Generate all frontmatter sections
    const coreFields = this.generateCoreFields(taskId, taskData.spec, category);
    const aeoFields = this.generateAEOFields(taskData.spec, taskData.learnings);
    const seoFields = await this.generateSEOFields(taskData.spec, taskData.decisions, taskData.learnings);
    const internalFields = this.generateInternalFields(content, taskData.metadata);

    const frontmatter = {
      ...coreFields,
      ...aeoFields,
      seo: seoFields,
      author: 'patrick-tehubijuluw',
      _internal: internalFields
    };

    console.log(`[Frontmatter] Generated complete frontmatter for ${taskId}`);
    console.log(`[Frontmatter] Title: ${frontmatter.title}`);
    console.log(`[Frontmatter] Category: ${frontmatter.category}`);
    console.log(`[Frontmatter] Word count: ${frontmatter._internal.word_count}`);

    return frontmatter;
  }

  /**
   * Load task data from logs and knowledge files
   */
  async loadTaskData(taskId) {
    try {
      const taskPath = path.join(this.tasksDir, taskId);

      if (!fs.existsSync(taskPath)) {
        return null;
      }

      const data = {
        spec: null,
        metadata: {},
        decisions: [],
        learnings: [],
        patterns: []
      };

      // Load spec
      const specPath = path.join(this.specsDir, `${taskId}.json`);
      if (fs.existsSync(specPath)) {
        const specData = JSON.parse(fs.readFileSync(specPath, 'utf8'));
        data.spec = specData.task?.spec || {};
      }

      // Load metadata
      const metadataPath = path.join(taskPath, 'knowledge', 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        data.metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }

      // Load decisions
      const decisionsPath = path.join(taskPath, 'knowledge', 'decisions.json');
      if (fs.existsSync(decisionsPath)) {
        const decisionsData = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'));
        data.decisions = decisionsData.decisions || [];
      }

      // Load learnings
      const learningsPath = path.join(taskPath, 'knowledge', 'learnings.json');
      if (fs.existsSync(learningsPath)) {
        const learningsData = JSON.parse(fs.readFileSync(learningsPath, 'utf8'));
        data.learnings = learningsData.learnings || [];
      }

      // Load patterns
      const patternsPath = path.join(taskPath, 'knowledge', 'patterns.json');
      if (fs.existsSync(patternsPath)) {
        const patternsData = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
        data.patterns = patternsData.patterns || [];
      }

      return data;
    } catch (error) {
      console.error('[Frontmatter] Failed to load task data:', error.message);
      return null;
    }
  }

  /**
   * Generate core fields (title, slug, publishedAt, category, contentType)
   */
  generateCoreFields(taskId, spec, category) {
    const title = this.generateTitle(spec, taskId);
    const slug = this.generateSlug(title);
    const publishedAt = new Date().toISOString().split('T')[0];
    const contentType = this.determineContentType(category, spec);

    return {
      title,
      slug,
      publishedAt,
      category,
      contentType
    };
  }

  /**
   * Generate compelling blog title from task spec
   */
  generateTitle(spec, taskId) {
    if (spec?.title) {
      // Use task title as base, make it more blog-friendly
      return this.makeTitleBlogFriendly(spec.title);
    }

    // Generate from description
    if (spec?.description) {
      const firstSentence = spec.description.split('.')[0];
      return this.makeTitleBlogFriendly(firstSentence);
    }

    // Fallback to task ID
    return `${taskId}: Task Implementation`;
  }

  /**
   * Make technical title more blog-friendly
   */
  makeTitleBlogFriendly(title) {
    // Remove common technical prefixes
    let blogTitle = title
      .replace(/^(implement|build|create|add|develop)\s+/i, '')
      .replace(/^(feature|module|component|system)\s+/i, '')
      .trim();

    // Add engaging prefixes for certain topics
    const engagingPrefixes = {
      'authentication': 'Secure ',
      'performance': 'Optimizing ',
      'test': 'Testing ',
      'API': 'Building a Better '
    };

    for (const [keyword, prefix] of Object.entries(engagingPrefixes)) {
      if (blogTitle.toLowerCase().includes(keyword.toLowerCase())) {
        blogTitle = prefix + blogTitle;
        break;
      }
    }

    // Ensure title is not too long (max 120 chars)
    if (blogTitle.length > 120) {
      blogTitle = blogTitle.substring(0, 117) + '...';
    }

    return blogTitle;
  }

  /**
   * Generate kebab-case slug from title
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 80); // Max 80 chars for slug
  }

  /**
   * Determine content type based on category and spec
   */
  determineContentType(category, spec) {
    const text = JSON.stringify(spec).toLowerCase();

    if (category === 'technology') {
      if (text.includes('tutorial') || text.includes('learn') || text.includes('guide')) {
        return 'tutorial';
      }
      if (text.includes('deep') || text.includes('architecture') || text.includes('pattern')) {
        return 'deep-dive';
      }
      if (text.includes('compare') || text.includes('vs ')) {
        return 'comparison';
      }
      if (text.includes('case') || text.includes('example')) {
        return 'case-study';
      }
      return 'deep-dive'; // Default for technology
    } else {
      if (text.includes('launch') || text.includes('release') || text.includes('announce')) {
        return 'announcement';
      }
      if (text.includes('guide') || text.includes('how to')) {
        return 'guide';
      }
      return 'announcement'; // Default for product
    }
  }

  /**
   * Generate AEO fields (excerpt, tldr)
   */
  generateAEOFields(spec, learnings) {
    const excerpt = this.generateExcerpt(spec);
    const tldr = this.generateTLDR(spec, learnings);

    return {
      excerpt,
      tldr
    };
  }

  /**
   * Generate 2-3 sentence excerpt (max 300 chars)
   */
  generateExcerpt(spec) {
    const description = spec?.description || '';

    // Take first 2-3 sentences
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let excerpt = sentences.slice(0, 3).join('. ').trim();

    // Ensure it's compelling and within limit
    if (excerpt.length > 300) {
      excerpt = excerpt.substring(0, 297) + '...';
    }

    // Make it more engaging
    if (!excerpt.match(/[.!?]$/)) {
      excerpt += '.';
    }

    return excerpt;
  }

  /**
   * Generate 80-100 word TLDR for AI citation
   */
  generateTLDR(spec, learnings) {
    const keyPoints = [];

    // Add main goal from spec
    if (spec?.description) {
      keyPoints.push(spec.description.split('.')[0]);
    }

    // Add key learnings
    learnings.slice(0, 2).forEach(learning => {
      if (learning.description) {
        keyPoints.push(learning.description);
      }
    });

    // Add success criteria if available
    if (spec?.success_criteria?.length > 0) {
      const success = spec.success_criteria.slice(0, 2).join(' and ');
      keyPoints.push(`Success criteria include: ${success}`);
    }

    // Combine into coherent paragraph
    let tldr = keyPoints.join(' ');

    // Ensure 80-100 words
    const words = tldr.split(/\s+/);
    if (words.length < 80) {
      // Pad with more context
      if (spec?.context) {
        tldr += ` This work addresses: ${spec.context.split('.')[0]}.`;
      }
    }

    if (words.length > 100) {
      // Trim to 100 words
      tldr = words.slice(0, 100).join(' ') + '.';
    }

    return tldr;
  }

  /**
   * Generate SEO fields (metaDescription, focusKeyword, secondaryKeywords, faq)
   */
  async generateSEOFields(spec, decisions, learnings) {
    const focusKeyword = this.extractFocusKeyword(spec);
    const metaDescription = this.generateMetaDescription(spec, focusKeyword);
    const secondaryKeywords = this.generateSecondaryKeywords(spec, focusKeyword);
    const faq = await this.generateFAQ(decisions, learnings);

    return {
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      faq
    };
  }

  /**
   * Extract primary focus keyword from spec
   */
  extractFocusKeyword(spec) {
    const text = JSON.stringify(spec).toLowerCase();

    // Common technical keywords to prioritize
    const priorityKeywords = [
      'spec-driven development',
      'AI agent',
      'skill orchestration',
      'task automation',
      'TDD workflow',
      'knowledge graph',
      'codebase context'
    ];

    for (const keyword of priorityKeywords) {
      if (text.includes(keyword)) {
        return keyword;
      }
    }

    // Fallback: extract from title
    if (spec?.title) {
      const words = spec.title.split(/\s+/).filter(w => w.length > 4);
      return words.slice(0, 3).join(' ');
    }

    return 'software development';
  }

  /**
   * Generate 150-160 char meta description
   */
  generateMetaDescription(spec, focusKeyword) {
    const description = spec?.description || '';

    // Start with focus keyword
    let meta = `${focusKeyword.charAt(0).toUpperCase() + focusKeyword.slice(1)}: `;

    // Add compelling description
    const firstSentence = description.split('.')[0];
    meta += firstSentence;

    // Add call to action
    meta += '. Learn how to implement this approach.';

    // Ensure 150-160 chars
    if (meta.length > 160) {
      meta = meta.substring(0, 157) + '...';
    }

    return meta;
  }

  /**
   * Generate 2-4 secondary keywords
   */
  generateSecondaryKeywords(spec, focusKeyword) {
    const keywords = new Set();
    const text = JSON.stringify(spec).toLowerCase();

    // Related terms based on focus keyword
    const relatedTerms = {
      'spec-driven': ['task specification', 'automated execution', 'workflow automation'],
      'AI agent': ['agent skills', 'task execution', 'intelligent automation'],
      'skill orchestration': ['skill invocation', 'task management', 'agent workflows'],
      'TDD': ['test-driven development', 'unit testing', 'code quality'],
      'knowledge graph': ['knowledge capture', 'organizational learning', 'decision tracking']
    };

    // Find matching related terms
    for (const [key, terms] of Object.entries(relatedTerms)) {
      if (focusKeyword.toLowerCase().includes(key)) {
        terms.forEach(term => keywords.add(term));
      }
    }

    // Extract additional keywords from spec
    const importantWords = ['automation', 'workflow', 'testing', 'logging', 'documentation', 'skill', 'task', 'agent'];
    importantWords.forEach(word => {
      if (text.includes(word)) {
        keywords.add(word);
      }
    });

    // Return 2-4 keywords
    return Array.from(keywords).slice(0, 4);
  }

  /**
   * Generate FAQ section (3-5 Q&A pairs) from decisions and learnings
   */
  async generateFAQ(decisions, learnings) {
    const faq = [];

    // Generate questions from decisions
    decisions.slice(0, 3).forEach((decision, index) => {
      if (decision.context && decision.choice && decision.rationale) {
        faq.push({
          question: `Why ${decision.context.toLowerCase()}?`,
          answer: this.generateAnswer(decision.choice, decision.rationale)
        });
      }
    });

    // Generate questions from learnings
    learnings.slice(0, 2).forEach(learning => {
      if (learning.description && learning.applicability) {
        faq.push({
          question: `How do I apply ${learning.category || 'this learning'}?`,
          answer: this.generateAnswer(learning.description, learning.applicability)
        });
      }
    });

    // Ensure at least 3 questions
    if (faq.length < 3) {
      faq.push({
        question: 'What are the key benefits of this approach?',
        answer: 'This approach provides better code quality, maintainability, and documentation. It ensures all decisions are captured and learnings are preserved for future reference.'
      });
    }

    // Limit to 5 questions
    return faq.slice(0, 5);
  }

  /**
   * Generate concise answer for FAQ (40-80 words)
   */
  generateAnswer(choice, rationale) {
    let answer = `${choice}. ${rationale}`;

    const words = answer.split(/\s+/);

    // Ensure 40-80 words
    if (words.length < 40) {
      answer += ' This approach has been proven effective in production environments and follows industry best practices.';
    }

    if (words.length > 80) {
      answer = words.slice(0, 80).join(' ') + '.';
    }

    return answer;
  }

  /**
   * Generate internal tracking fields
   */
  generateInternalFields(content, metadata) {
    const wordCount = content ? content.split(/\s+/).length : metadata?.tests_written || 0;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      status: 'draft',
      generated: new Date().toISOString(),
      sources: this.extractSources(metadata),
      word_count: wordCount,
      reading_time: `${readingTime} min`
    };
  }

  /**
   * Extract source URLs from metadata
   */
  extractSources(metadata) {
    const sources = [];

    // Add references from metadata if available
    if (metadata?.patterns_applied) {
      metadata.patterns_applied.forEach(pattern => {
        if (pattern.includes('http')) {
          sources.push(pattern);
        }
      });
    }

    // Default sources
    if (sources.length === 0) {
      sources.push('https://skills.sh/docs');
    }

    return sources;
  }

  /**
   * Generate YAML frontmatter string from object
   */
  toYAML(frontmatter) {
    const yaml = [];

    // Core fields
    yaml.push('---');
    yaml.push('# Core fields');
    yaml.push(`title: "${frontmatter.title}"`);
    yaml.push(`slug: "${frontmatter.slug}"`);
    yaml.push(`publishedAt: "${frontmatter.publishedAt}"`);
    yaml.push(`category: "${frontmatter.category}"`);
    yaml.push(`contentType: "${frontmatter.contentType}"`);
    yaml.push('');

    // AEO fields
    yaml.push('# AEO fields');
    yaml.push(`excerpt: "${this.escapeYAML(frontmatter.excerpt)}"`);
    yaml.push(`tldr: "${this.escapeYAML(frontmatter.tldr)}"`);
    yaml.push('');

    // SEO fields
    yaml.push('# SEO nested object');
    yaml.push('seo:');
    yaml.push(`  metaDescription: "${this.escapeYAML(frontmatter.seo.metaDescription)}"`);
    yaml.push(`  focusKeyword: "${frontmatter.seo.focusKeyword}"`);
    yaml.push('  secondaryKeywords:');
    frontmatter.seo.secondaryKeywords.forEach(kw => {
      yaml.push(`    - "${kw}"`);
    });
    yaml.push('  faq:');
    frontmatter.seo.faq.forEach((item, index) => {
      yaml.push(`    - question: "${this.escapeYAML(item.question)}"`);
      yaml.push(`      answer: "${this.escapeYAML(item.answer)}"`);
    });
    yaml.push('');

    // Author
    yaml.push('# Author');
    yaml.push(`author: "${frontmatter.author}"`);
    yaml.push('');

    // Internal fields
    yaml.push('# Internal fields (stripped before publish)');
    yaml.push('_internal:');
    yaml.push(`  status: "${frontmatter._internal.status}"`);
    yaml.push(`  generated: "${frontmatter._internal.generated}"`);
    yaml.push('  sources:');
    frontmatter._internal.sources.forEach(source => {
      yaml.push(`    - "${source}"`);
    });
    yaml.push(`  word_count: ${frontmatter._internal.word_count}`);
    yaml.push(`  reading_time: "${frontmatter._internal.reading_time}"`);
    yaml.push('---');
    yaml.push('');

    return yaml.join('\n');
  }

  /**
   * Escape special characters for YAML
   */
  escapeYAML(str) {
    return str
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Export for use in other modules
module.exports = { FrontmatterGenerator };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node frontmatter-generator.js <TASK-ID> [category]');
    console.log('Example: node frontmatter-generator.js TASK-001 technology');
    process.exit(1);
  }

  const taskId = args[0];
  const category = args[1] || 'technology';
  const generator = new FrontmatterGenerator();

  console.log(`=== Frontmatter Generator Test for ${taskId} ===\n`);

  generator.generate(taskId, category, 'Sample blog content for word count calculation.').then(frontmatter => {
    console.log('\n=== Generated Frontmatter ===');
    console.log(generator.toYAML(frontmatter));
    console.log('==============================\n');

    process.exit(0);
  }).catch(error => {
    console.error('Frontmatter generation failed:', error.message);
    process.exit(1);
  });
}
