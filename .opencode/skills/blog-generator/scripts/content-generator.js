#!/usr/bin/env node

/**
 * Content Generator Utility
 *
 * Generates complete blog content using Patrick Tehubijuluw's friendly,
 * tutorial-focused writing style (3/10 formality, conversational, encouraging).
 *
 * Usage:
 *   const generator = require('./scripts/content-generator');
 *   const content = await generator.generate(taskId, category, frontmatter);
 */

const fs = require('fs');
const path = require('path');

class ContentGenerator {
  constructor() {
    this.tasksDir = path.join(process.cwd(), 'tasks');
    this.specsDir = path.join(process.cwd(), 'specs');

    // Patrick's writing style markers
    this.styleMarkers = {
      openings: [
        "In this tutorial you will learn about",
        "I often hear questions like",
        "A while ago I stumbled upon",
        "Lately I've been getting some questions on",
        "Ever wondered how to",
        "Recently I've been working on"
      ],
      transitions: [
        "Now, let's get started...",
        "So what should you do?",
        "Next we also need to...",
        "After that...",
        "The only thing you do next is...",
        "Now, in some cases...",
        "Here's the interesting part..."
      ],
      closings: [
        "Have fun!",
        "See you soon!",
        "See u next time!",
        "Happy designing!",
        "I hope this is useful for you guys.",
        "Good luck with your implementation!",
        "Start building something awesome!"
      ],
      conversationalMarkers: [
        "quite simple",
        "handy right?",
        "easy right?",
        "as you can see",
        "pretty straightforward",
        "here's the thing",
        "let me show you"
      ],
      engagementPhrases: [
        "you will learn",
        "you can see",
        "your next step",
        "let me walk you through",
        "I'll show you how",
        "we're going to build",
        "you might be wondering"
      ]
    };
  }

  /**
   * Generate complete blog content
   *
   * @param {string} taskId - Task ID
   * @param {string} category - Blog category ('technology' or 'product')
   * @param {Object} frontmatter - Generated frontmatter
   * @param {Array} codeExamples - Code examples from task
   * @returns {string} Complete blog content in markdown
   */
  async generate(taskId, category, frontmatter, codeExamples = []) {
    console.log(`[ContentGenerator] Generating ${category} blog for ${taskId}...`);

    const taskData = await this.loadTaskData(taskId);

    if (!taskData) {
      throw new Error(`Task data not found for ${taskId}`);
    }

    let content;

    if (category === 'technology') {
      content = this.generateTechnologyBlog(taskData, frontmatter, codeExamples);
    } else {
      content = this.generateProductBlog(taskData, frontmatter);
    }

    // Apply Patrick's writing style throughout
    content = this.applyWritingStyle(content);

    const wordCount = content.split(/\s+/).length;
    console.log(`[ContentGenerator] Generated ${wordCount} words for ${taskId}`);

    return content;
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
        changes: [],
        metadata: {},
        decisions: [],
        learnings: [],
        patterns: [],
        antiPatterns: [],
        tests: []
      };

      // Load spec
      const specPath = path.join(this.specsDir, `${taskId}.json`);
      if (fs.existsSync(specPath)) {
        const specData = JSON.parse(fs.readFileSync(specPath, 'utf8'));
        data.spec = specData.task?.spec || {};
      }

      // Load changes
      const changesPath = path.join(taskPath, 'logs', 'changes.json');
      if (fs.existsSync(changesPath)) {
        const changesData = JSON.parse(fs.readFileSync(changesPath, 'utf8'));
        data.changes = changesData.changes || [];
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

      // Load anti-patterns
      const antiPatternsPath = path.join(taskPath, 'knowledge', 'anti-patterns.json');
      if (fs.existsSync(antiPatternsPath)) {
        const antiPatternsData = JSON.parse(fs.readFileSync(antiPatternsPath, 'utf8'));
        data.antiPatterns = antiPatternsData.anti_patterns || [];
      }

      // Load tests
      const testsPath = path.join(taskPath, 'logs', 'tests.json');
      if (fs.existsSync(testsPath)) {
        const testsData = JSON.parse(fs.readFileSync(testsPath, 'utf8'));
        data.tests = testsData.tdd_cycles || [];
      }

      return data;
    } catch (error) {
      console.error('[ContentGenerator] Failed to load task data:', error.message);
      return null;
    }
  }

  /**
   * Generate technology blog content
   */
  generateTechnologyBlog(taskData, frontmatter, codeExamples) {
    const sections = [];

    // Hook/Opening
    sections.push(this.generateTechnologyHook(taskData.spec));

    // Key metrics from task
    sections.push(this.generateKeyMetrics(taskData.metadata));

    sections.push('---\n');

    // Technical deep-dive
    sections.push(this.generateTechnicalDeepDive(taskData));

    sections.push('---\n');

    // How we built it
    sections.push(this.generateHowWeBuiltIt(taskData));

    sections.push('---\n');

    // Why we built it this way
    sections.push(this.generateWhyWeBuiltItThisWay(taskData.decisions));

    sections.push('---\n');

    // Lessons learned
    sections.push(this.generateLessonsLearned(taskData.learnings, taskData.patterns));

    sections.push('---\n');

    // FAQ section
    sections.push(this.generateFAQSection(taskData.decisions, taskData.learnings));

    sections.push('---\n');

    // Resources
    sections.push(this.generateResourcesSection());

    // Encouraging closing
    sections.push(this.generateEncouragingClosing());

    return sections.join('\n\n');
  }

  /**
   * Generate product blog content
   */
  generateProductBlog(taskData, frontmatter) {
    const sections = [];

    // Pain point / market shift
    sections.push(this.generateProductPainPoint(taskData.spec));

    sections.push('---\n');

    // Feature introduction
    sections.push(this.generateFeatureIntroduction(taskData.spec));

    sections.push('---\n');

    // Key capabilities
    sections.push(this.generateKeyCapabilities(taskData.spec));

    sections.push('---\n');

    // How it works
    sections.push(this.generateHowItWorks(taskData));

    sections.push('---\n');

    // Use cases
    sections.push(this.generateUseCases(taskData.spec));

    sections.push('---\n');

    // FAQ section
    sections.push(this.generateFAQSection(taskData.decisions, taskData.learnings));

    sections.push('---\n');

    // Get started / Availability
    sections.push(this.generateAvailabilitySection());

    // Encouraging closing
    sections.push(this.generateEncouragingClosing());

    return sections.join('\n\n');
  }

  /**
   * Generate engaging hook for technology blog
   */
  generateTechnologyHook(spec) {
    const opening = this.styleMarkers.openings[Math.floor(Math.random() * this.styleMarkers.openings.length)];

    const description = spec?.description || 'this technical challenge';
    const firstSentence = description.split('.')[0];

    return `## ${firstSentence}\n\n${opening} ${description.toLowerCase()}. It's a common problem that many developers face, and I'm here to walk you through how we tackled it.\n\nLet me show you what we discovered.`;
  }

  /**
   * Generate key metrics section
   */
  generateKeyMetrics(metadata) {
    const metrics = [];

    if (metadata?.duration_minutes) {
      metrics.push(`- Development time: ${metadata.duration_minutes} minutes`);
    }

    if (metadata?.tests_written) {
      metrics.push(`- Tests written: ${metadata.tests_written}`);
    }

    if (metadata?.tests_passing) {
      metrics.push(`- Tests passing: ${metadata.tests_passing}`);
    }

    if (metadata?.files_modified?.length) {
      metrics.push(`- Files modified: ${metadata.files_modified.length}`);
    }

    if (metrics.length === 0) {
      return '';
    }

    return `**Key metrics:**\n${metrics.join('\n')}\n`;
  }

  /**
   * Generate technical deep-dive section
   */
  generateTechnicalDeepDive(taskData) {
    const sections = [];

    sections.push('## The Technical Challenge\n');

    const spec = taskData.spec;
    const context = spec?.context || spec?.description || 'the problem at hand';

    sections.push(`When we first looked at ${context.toLowerCase()}, we knew we needed a solid approach. Let me break it down for you step by step.\n`);

    // Add code examples if available
    if (taskData.changes && taskData.changes.length > 0) {
      sections.push('### Implementation Details\n');
      sections.push('Here\'s how we approached the implementation:\n');

      taskData.changes.slice(0, 3).forEach((change, index) => {
        sections.push(`**Step ${index + 1}: ${change.description}**\n`);
        if (change.file) {
          sections.push(`File: \`${change.file}\`\n`);
        }
      });
    }

    // Add patterns applied
    if (taskData.patterns && taskData.patterns.length > 0) {
      sections.push('\n### Patterns Applied\n');
      taskData.patterns.slice(0, 2).forEach(pattern => {
        sections.push(`We used the **${pattern.name}** pattern: ${pattern.description}\n`);
      });
    }

    return sections.join('\n');
  }

  /**
   * Generate "How we built it" section
   */
  generateHowWeBuiltIt(taskData) {
    const sections = [];

    sections.push('## How We Built It\n');
    sections.push('Let me walk you through our approach. It\'s actually quite simple once you break it down.\n');

    if (taskData.spec?.requirements) {
      sections.push('**What we needed to accomplish:**\n');
      taskData.spec.requirements.slice(0, 5).forEach((req, index) => {
        sections.push(`${index + 1}. ${req}`);
      });
      sections.push('');
    }

    if (taskData.metadata?.skills_used?.length) {
      sections.push('**Skills and tools we used:**\n');
      taskData.metadata.skills_used.forEach(skill => {
        sections.push(`- ${skill}`);
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Generate "Why we built it this way" section
   */
  generateWhyWeBuiltItThisWay(decisions) {
    const sections = [];

    sections.push('## Why We Built It This Way\n');
    sections.push('You might be wondering why we chose this approach. Good question! Let me explain.\n');

    if (decisions && decisions.length > 0) {
      decisions.slice(0, 2).forEach(decision => {
        sections.push(`### ${decision.context}\n`);
        sections.push(`**Our choice:** ${decision.choice}\n`);
        sections.push(`**Why:** ${decision.rationale}\n`);
        if (decision.alternatives && decision.alternatives.length > 0) {
          sections.push(`**Alternatives considered:** ${decision.alternatives.join(', ')}\n`);
        }
        sections.push('');
      });
    } else {
      sections.push('We weighed several options and chose this path because it gives us the best balance of simplicity, maintainability, and performance. Pretty straightforward when you think about it.\n');
    }

    return sections.join('\n');
  }

  /**
   * Generate lessons learned section
   */
  generateLessonsLearned(learnings, patterns) {
    const sections = [];

    sections.push('## Lessons Learned\n');
    sections.push('Here\'s what we discovered along the way. I think you\'ll find these pretty handy!\n');

    if (learnings && learnings.length > 0) {
      learnings.forEach((learning, index) => {
        sections.push(`### Lesson ${index + 1}: ${learning.description}\n`);
        if (learning.applicability) {
          sections.push(`**When to use:** ${learning.applicability}\n`);
        }
        if (learning.confidence === 'high') {
          sections.push('**Confidence:** High - this one really works!\n');
        }
        sections.push('');
      });
    }

    if (patterns && patterns.length > 0) {
      sections.push('### Patterns Worth Remembering\n');
      patterns.slice(0, 2).forEach(pattern => {
        sections.push(`- **${pattern.name}**: ${pattern.description}`);
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Generate product pain point section
   */
  generateProductPainPoint(spec) {
    const sections = [];

    sections.push('## The Challenge\n');

    const description = spec?.description || 'the problem we\'re solving';

    sections.push(`We've all been there. ${description.charAt(0).toUpperCase() + description.slice(1)}. It's frustrating, time-consuming, and honestly, it shouldn\'t be this hard.\n`);
    sections.push('That\'s exactly why we built this.\n');

    return sections.join('\n');
  }

  /**
   * Generate feature introduction section
   */
  generateFeatureIntroduction(spec) {
    const sections = [];

    sections.push('## Introducing the Solution\n');

    const title = spec?.title || 'this new capability';

    sections.push(`${title} is here to make your life easier. Here\'s what it does and why you\'re going to love it.\n`);

    if (spec?.context) {
      sections.push(`${spec.context}\n`);
    }

    return sections.join('\n');
  }

  /**
   * Generate key capabilities section
   */
  generateKeyCapabilities(spec) {
    const sections = [];

    sections.push('## Key Capabilities\n');
    sections.push('**Here\'s what you get:**\n');

    if (spec?.requirements) {
      spec.requirements.slice(0, 5).forEach(req => {
        // Convert requirement to benefit-focused capability
        const benefit = req.replace(/^(implement|build|create|add)\s+/i, '');
        sections.push(`- **${benefit}**: Makes your workflow smoother and more efficient`);
      });
    } else {
      sections.push('- **Streamlined workflow**: Less manual work, more automation');
      sections.push('- **Better visibility**: See what\'s happening at every step');
      sections.push('- **Easy integration**: Works with your existing tools');
    }

    sections.push('');
    return sections.join('\n');
  }

  /**
   * Generate how it works section
   */
  generateHowItWorks(taskData) {
    const sections = [];

    sections.push('## How It Works\n');
    sections.push('Let me show you how simple this is to use.\n');

    sections.push('**Getting started is easy:**\n');
    sections.push('1. Set up your configuration');
    sections.push('2. Define your requirements');
    sections.push('3. Run the workflow');
    sections.push('4. Review the results\n');

    sections.push('That\'s it! Pretty straightforward, right?\n');

    return sections.join('\n');
  }

  /**
   * Generate use cases section
   */
  generateUseCases(spec) {
    const sections = [];

    sections.push('## Use Cases\n');
    sections.push('Here are some ways you can use this:\n');

    sections.push('**Use case 1: Streamlining workflows**\n');
    sections.push('Automate repetitive tasks and focus on what matters.\n');

    sections.push('**Use case 2: Better documentation**\n');
    sections.push('Keep everything organized and easy to find.\n');

    if (spec?.success_criteria) {
      sections.push('**Use case 3: Meeting requirements**\n');
      sections.push(`Ensure you hit all your targets: ${spec.success_criteria.slice(0, 2).join(', ')}\n`);
    }

    return sections.join('\n');
  }

  /**
   * Generate FAQ section from decisions and learnings
   */
  generateFAQSection(decisions, learnings) {
    const sections = [];

    sections.push('## Frequently Asked Questions\n');
    sections.push('Good questions! Let me answer them for you.\n');

    const faqs = [];

    // Generate from decisions
    if (decisions && decisions.length > 0) {
      decisions.slice(0, 2).forEach(decision => {
        faqs.push({
          question: `Why ${decision.context.toLowerCase()}?`,
          answer: `${decision.choice}. ${decision.rationale}`
        });
      });
    }

    // Generate from learnings
    if (learnings && learnings.length > 0) {
      learnings.slice(0, 2).forEach(learning => {
        faqs.push({
          question: `How do I apply ${learning.category || 'this'}?`,
          answer: `${learning.description}. ${learning.applicability || 'Works in most cases.'}`
        });
      });
    }

    // Default FAQs if none generated
    if (faqs.length === 0) {
      faqs.push({
        question: 'What are the main benefits?',
        answer: 'You get better code quality, maintainability, and documentation. All decisions are captured and learnings are preserved for future reference.'
      });
      faqs.push({
        question: 'Is this suitable for my project?',
        answer: 'Most likely! This approach works well for projects of any size. Start small and scale up as needed.'
      });
      faqs.push({
        question: 'How long does implementation take?',
        answer: 'Typically a few hours to get started. The time investment pays off quickly in reduced bugs and easier maintenance.'
      });
    }

    faqs.slice(0, 5).forEach(faq => {
      sections.push(`**Q: ${faq.question}**\n`);
      sections.push(`A: ${faq.answer}\n`);
    });

    return sections.join('\n');
  }

  /**
   * Generate resources section
   */
  generateResourcesSection() {
    return `## Resources\n\n- [Documentation](/docs)\n- [API Reference](/docs/api)\n- [Quick Start Guide](/docs/get-started)\n`;
  }

  /**
   * Generate availability section
   */
  generateAvailabilitySection() {
    return `## Get Started\n\nReady to dive in? Here\'s how:\n\n- [Quick Start](/docs/get-started)\n- [Feature Documentation](/docs/features)\n- [Pricing](/pricing)\n\nAvailable now to all users. Let\'s build something great together!\n`;
  }

  /**
   * Generate encouraging closing in Patrick's style
   */
  generateEncouragingClosing() {
    const closings = this.styleMarkers.closings;
    const closing = closings[Math.floor(Math.random() * closings.length)];

    return `\n---\n\n${closing}\n`;
  }

  /**
   * Apply Patrick's writing style to content
   */
  applyWritingStyle(content) {
    let styledContent = content;

    // Add conversational markers throughout
    this.styleMarkers.conversationalMarkers.forEach(marker => {
      // Randomly insert some markers
      if (Math.random() > 0.7) {
        styledContent = styledContent.replace(/(\. )/g, (match, p1, offset) => {
          if (Math.random() > 0.9 && offset > 200) {
            return `. ${marker}, `;
          }
          return match;
        });
      }
    });

    // Ensure direct address ("you") is present
    if (!styledContent.includes('you\'ll') && !styledContent.includes('you will')) {
      styledContent = styledContent.replace(/we will/g, 'you\'ll');
      styledContent = styledContent.replace(/we can/g, 'you can');
    }

    // Add engagement phrases
    this.styleMarkers.engagementPhrases.forEach(phrase => {
      if (Math.random() > 0.8) {
        styledContent = styledContent.replace('Let me', `${phrase.charAt(0).toUpperCase() + phrase.slice(1)}, let me`);
      }
    });

    // Ensure rhetorical questions are present
    if (!styledContent.includes('right?') && !styledContent.includes('?')) {
      styledContent = styledContent.replace('It\'s simple', 'It\'s simple, right?');
    }

    return styledContent;
  }

  /**
   * Count words in content
   */
  countWords(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Validate content meets word count targets
   */
  validateWordCount(content, category) {
    const wordCount = this.countWords(content);
    const min = category === 'technology' ? 800 : 500;
    const max = category === 'technology' ? 1500 : 1000;

    return {
      wordCount,
      withinTarget: wordCount >= min && wordCount <= max,
      min,
      max,
      needsExpansion: wordCount < min,
      needsTrimming: wordCount > max
    };
  }
}

// Export for use in other modules
module.exports = { ContentGenerator };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node content-generator.js <TASK-ID> [category]');
    console.log('Example: node content-generator.js TASK-001 technology');
    process.exit(1);
  }

  const taskId = args[0];
  const category = args[1] || 'technology';
  const generator = new ContentGenerator();

  console.log(`=== Content Generator Test for ${taskId} ===\n`);

  const mockFrontmatter = {
    title: 'Test Blog Post',
    category: category
  };

  generator.generate(taskId, category, mockFrontmatter, []).then(content => {
    console.log('\n=== Generated Content (first 500 words) ===\n');
    const preview = content.split('\n').slice(0, 30).join('\n');
    console.log(preview);
    console.log('\n...\n');

    const validation = generator.validateWordCount(content, category);
    console.log('\n=== Word Count Validation ===');
    console.log(`Total words: ${validation.wordCount}`);
    console.log(`Target: ${validation.min}-${validation.max}`);
    console.log(`Within target: ${validation.withinTarget ? 'Yes' : 'No'}`);
    console.log('==============================\n');

    process.exit(0);
  }).catch(error => {
    console.error('Content generation failed:', error.message);
    process.exit(1);
  });
}
