#!/usr/bin/env node

/**
 * Blog Utilities - Code Extractor and Slug Calculator
 *
 * Provides utility functions for blog generation:
 * - Code example extraction from task logs
 * - Slug generation from titles
 * - Reading time calculation
 *
 * Usage:
 *   const utilities = require('./scripts/blog-utilities');
 *   const codeExamples = utilities.extractCodeExamples(taskId);
 *   const slug = utilities.generateSlug(title);
 *   const readingTime = utilities.calculateReadingTime(wordCount);
 */

const fs = require('fs');
const path = require('path');

class BlogUtilities {
  constructor() {
    this.tasksDir = path.join(process.cwd(), 'tasks');
    this.logsDir = 'logs';
    this.knowledgeDir = 'knowledge';

    // File extension to language mapping for syntax highlighting
    this.languageMap = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.svelte': 'svelte',
      '.py': 'python',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.cs': 'csharp',
      '.rb': 'ruby',
      '.php': 'php',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.sh': 'bash',
      '.bash': 'bash',
      '.zsh': 'bash',
      '.md': 'markdown',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.xml': 'xml',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sql': 'sql'
    };
  }

  /**
   * Extract code examples from task logs
   *
   * @param {string} taskId - Task ID (e.g., 'TASK-001')
   * @returns {Array<Object>} Array of code examples with file path, language, and content
   */
  extractCodeExamples(taskId) {
    console.log(`[BlogUtilities] Extracting code examples from ${taskId}...`);

    const taskPath = path.join(this.tasksDir, taskId);
    const codeExamples = [];

    if (!fs.existsSync(taskPath)) {
      console.log('[BlogUtilities] Task directory not found');
      return [];
    }

    // Extract from changes.json
    const changesPath = path.join(taskPath, this.logsDir, 'changes.json');
    if (fs.existsSync(changesPath)) {
      const changesData = JSON.parse(fs.readFileSync(changesPath, 'utf8'));
      const changes = changesData.changes || [];

      changes.forEach(change => {
        if (change.file && change.type !== 'deleted') {
          const example = this.extractCodeFromFile(change.file, change);
          if (example) {
            codeExamples.push(example);
          }
        }
      });
    }

    // Extract from tests.json
    const testsPath = path.join(taskPath, this.logsDir, 'tests.json');
    if (fs.existsSync(testsPath)) {
      const testsData = JSON.parse(fs.readFileSync(testsPath, 'utf8'));
      const tests = testsData.tdd_cycles || [];

      tests.forEach(test => {
        if (test.code_file && (test.implementation || test.refactoring)) {
          const example = this.extractCodeFromTest(test);
          if (example) {
            codeExamples.push(example);
          }
        }
      });
    }

    console.log(`[BlogUtilities] Extracted ${codeExamples.length} code examples`);
    return codeExamples;
  }

  /**
   * Extract code from a file change record
   */
  extractCodeFromFile(filePath, change) {
    const fullPath = path.join(process.cwd(), filePath);
    const ext = path.extname(filePath).toLowerCase();
    const language = this.languageMap[ext] || 'text';

    // Try to read actual file content if it exists
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        return {
          file: filePath,
          language,
          content,
          linesChanged: change.lines_changed || { added: 0, removed: 0 },
          description: change.description || '',
          type: change.type
        };
      } catch (error) {
        console.log(`[BlogUtilities] Could not read ${filePath}: ${error.message}`);
      }
    }

    // Fallback: create placeholder from change metadata
    if (change.description) {
      return {
        file: filePath,
        language,
        content: `// ${change.description}\n// File ${change.type} in task`,
        linesChanged: change.lines_changed || { added: 0, removed: 0 },
        description: change.description,
        type: change.type
      };
    }

    return null;
  }

  /**
   * Extract code from test record
   */
  extractCodeFromTest(test) {
    const ext = path.extname(test.code_file || '').toLowerCase();
    const language = this.languageMap[ext] || 'text';

    let content = '';

    if (test.implementation) {
      content += `// Implementation: ${test.implementation}\n`;
    }

    if (test.refactoring) {
      content += `// Refactoring: ${test.refactoring}\n`;
    }

    if (test.test_file) {
      content += `// Test: ${test.test_name || 'Test'}\n`;
    }

    // If no actual code, create placeholder
    if (content.trim() === '') {
      content = `// Code changes in ${test.code_file || 'unknown file'}\n// Phase: ${test.phase}\n// Status: ${test.status}`;
    }

    return {
      file: test.code_file || test.test_file || 'unknown',
      language,
      content,
      phase: test.phase,
      status: test.status,
      testName: test.test_name
    };
  }

  /**
   * Format code example for blog inclusion
   *
   * @param {Object} codeExample - Code example object
   * @param {number} [maxLines] - Maximum lines to show (optional truncation)
   * @returns {string} Formatted markdown code block
   */
  formatCodeExample(codeExample, maxLines = null) {
    let content = codeExample.content;

    // Truncate if needed
    if (maxLines) {
      const lines = content.split('\n');
      if (lines.length > maxLines) {
        content = lines.slice(0, maxLines).join('\n') + '\n// ... (truncated)';
      }
    }

    let markdown = `\`\`\`${codeExample.language}\n`;
    markdown += content;
    markdown += `\n\`\`\``;

    // Add context if available
    if (codeExample.description) {
      markdown = `**${codeExample.description}**\n\n${markdown}`;
    }

    if (codeExample.file) {
      markdown += `\n\n_File: \`${codeExample.file}\`_`;
    }

    return markdown;
  }

  /**
   * Select best code examples for blog inclusion
   *
   * @param {Array<Object>} codeExamples - Array of all code examples
   * @param {string} category - Blog category ('technology' or 'product')
   * @param {number} [maxExamples=3] - Maximum number of examples to include
   * @returns {Array<Object>} Selected code examples
   */
  selectBestExamples(codeExamples, category, maxExamples = 3) {
    if (codeExamples.length === 0) {
      return [];
    }

    // For technology blogs, prioritize substantial code changes
    if (category === 'technology') {
      return codeExamples
        .filter(ex => ex.linesChanged?.added > 10 || ex.content.split('\n').length > 10)
        .slice(0, maxExamples);
    }

    // For product blogs, include fewer or no code examples
    if (category === 'product') {
      return codeExamples.slice(0, Math.min(1, maxExamples));
    }

    return codeExamples.slice(0, maxExamples);
  }

  /**
   * Generate kebab-case slug from title
   *
   * @param {string} title - Blog post title
   * @returns {string} URL-safe slug (max 80 chars)
   */
  generateSlug(title) {
    if (!title) {
      return 'untitled-post';
    }

    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')           // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '')               // Remove leading/trailing hyphens
      .replace(/-+/g, '-')                   // Collapse multiple hyphens
      .substring(0, 80);                     // Max 80 chars for slug
  }

  /**
   * Validate slug format
   *
   * @param {string} slug - Slug to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateSlug(slug) {
    const errors = [];

    if (!slug) {
      errors.push('Slug is required');
    }

    if (slug && slug.length > 80) {
      errors.push('Slug must be 80 characters or less');
    }

    if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      errors.push('Slug must be kebab-case (lowercase letters, numbers, and hyphens only)');
    }

    if (slug && slug.startsWith('-')) {
      errors.push('Slug cannot start with hyphen');
    }

    if (slug && slug.endsWith('-')) {
      errors.push('Slug cannot end with hyphen');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate reading time from word count
   *
   * @param {number} wordCount - Total word count
   * @param {number} [wordsPerMinute=200] - Average reading speed
   * @returns {string} Formatted reading time (e.g., "5 min")
   */
  calculateReadingTime(wordCount, wordsPerMinute = 200) {
    if (!wordCount || wordCount <= 0) {
      return '1 min';
    }

    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  }

  /**
   * Calculate word count from content
   *
   * @param {string} content - Blog content (markdown)
   * @returns {number} Word count
   */
  calculateWordCount(content) {
    if (!content) {
      return 0;
    }

    // Remove code blocks for word count (they skew the count)
    const withoutCode = content.replace(/```[\s\S]*?```/g, '');

    // Remove frontmatter
    const withoutFrontmatter = withoutCode.replace(/^---[\s\S]*?---\n/, '');

    // Split on whitespace and filter empty strings
    const words = withoutFrontmatter.split(/\s+/).filter(word => word.length > 0);

    return words.length;
  }

  /**
   * Generate complete blog metadata from content
   *
   * @param {string} content - Blog content
   * @param {string} title - Blog title
   * @returns {Object} Metadata with wordCount, readingTime, slug
   */
  generateBlogMetadata(content, title) {
    const wordCount = this.calculateWordCount(content);
    const readingTime = this.calculateReadingTime(wordCount);
    const slug = this.generateSlug(title);

    return {
      wordCount,
      readingTime,
      slug,
      slugValidation: this.validateSlug(slug)
    };
  }

  /**
   * Validate blog post meets requirements
   *
   * @param {string} content - Blog content
   * @param {string} category - Blog category ('technology' or 'product')
   * @param {Array<Object>} codeExamples - Code examples included
   * @returns {Object} Validation result with pass/fail and feedback
   */
  validateBlogPost(content, category, codeExamples = []) {
    const wordCount = this.calculateWordCount(content);
    const minWords = category === 'technology' ? 800 : 500;
    const maxWords = category === 'technology' ? 1500 : 1000;

    const issues = [];
    const warnings = [];

    // Word count validation
    if (wordCount < minWords) {
      issues.push(`Word count (${wordCount}) is below minimum (${minWords}) for ${category} blog`);
    } else if (wordCount > maxWords) {
      warnings.push(`Word count (${wordCount}) exceeds recommended maximum (${maxWords}) for ${category} blog`);
    }

    // Code example validation for technology blogs
    if (category === 'technology' && codeExamples.length === 0) {
      warnings.push('Technology blogs should include at least 1 code example');
    }

    // Check for encouraging closing
    const encouragingClosings = ['have fun', 'see you soon', 'happy designing', 'good luck', 'see u next time'];
    const hasClosing = encouragingClosings.some(closing =>
      content.toLowerCase().includes(closing)
    );

    if (!hasClosing) {
      warnings.push('Missing encouraging closing statement (e.g., "Have fun!", "Happy designing!")');
    }

    // Check for direct address (Patrick's style)
    const hasDirectAddress = content.includes('you\'ll') || content.includes('you will') || content.includes('you can');
    if (!hasDirectAddress) {
      warnings.push('Consider adding more direct address ("you") for engagement');
    }

    return {
      passes: issues.length === 0,
      issues,
      warnings,
      wordCount,
      wordCountRange: `${minWords}-${maxWords}`,
      codeExamplesCount: codeExamples.length
    };
  }
}

// Export for use in other modules
module.exports = { BlogUtilities };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node blog-utilities.js <TASK-ID> [command]');
    console.log('Commands:');
    console.log('  extract-code    - Extract code examples from task logs');
    console.log('  generate-slug   - Generate slug from title (requires title as 3rd arg)');
    console.log('  calc-reading    - Calculate reading time from word count (requires word count as 3rd arg)');
    console.log('\nExamples:');
    console.log('  node blog-utilities.js TASK-001 extract-code');
    console.log('  node blog-utilities.js - generate-slug "My Blog Post Title"');
    console.log('  node blog-utilities.js - calc-reading 1200');
    process.exit(1);
  }

  const taskIdOrDash = args[0];
  const command = args[1];
  const utilities = new BlogUtilities();

  // Handle commands that don't need task ID
  if (taskIdOrDash === '-') {
    if (command === 'generate-slug') {
      const title = args[2] || 'Untitled Post';
      const slug = utilities.generateSlug(title);
      console.log(`\n=== Slug Generation ===`);
      console.log(`Title: ${title}`);
      console.log(`Slug: ${slug}`);
      console.log(`Validation: ${JSON.stringify(utilities.validateSlug(slug))}`);
      console.log('======================\n');
      process.exit(0);
    }

    if (command === 'calc-reading') {
      const wordCount = parseInt(args[2], 10) || 0;
      const readingTime = utilities.calculateReadingTime(wordCount);
      console.log(`\n=== Reading Time Calculation ===`);
      console.log(`Word count: ${wordCount}`);
      console.log(`Reading time: ${readingTime}`);
      console.log('===============================\n');
      process.exit(0);
    }
  }

  // Commands that need task ID
  const taskId = taskIdOrDash;

  if (command === 'extract-code' || !command) {
    console.log(`\n=== Code Example Extraction for ${taskId} ===\n`);
    const examples = utilities.extractCodeExamples(taskId);

    if (examples.length === 0) {
      console.log('No code examples found.');
    } else {
      examples.forEach((ex, index) => {
        console.log(`\n--- Example ${index + 1} ---`);
        console.log(`File: ${ex.file}`);
        console.log(`Language: ${ex.language}`);
        console.log(`Lines: ${ex.content.split('\n').length}`);
        console.log(`Description: ${ex.description || 'N/A'}`);
        console.log('\nPreview:');
        console.log(utilities.formatCodeExample(ex, 10));
      });
    }

    console.log('\n====================================\n');
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
