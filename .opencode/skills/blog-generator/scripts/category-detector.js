#!/usr/bin/env node

/**
 * Blog Category Detector Utility
 *
 * Analyzes task content and automatically determines blog category
 * (technology vs product) based on task execution logs and knowledge.
 *
 * Usage:
 *   const detector = require('./scripts/category-detector');
 *   const result = await detector.analyzeTask('TASK-001');
 *   console.log(result.category); // 'technology' or 'product'
 *   console.log(result.confidence); // 0-100
 */

const fs = require('fs');
const path = require('path');

class CategoryDetector {
  constructor() {
    this.tasksDir = path.join(process.cwd(), 'tasks');

    // Technology indicators with confidence weights
    this.techIndicators = {
      fileTypes: {
        '.ts': 30, '.js': 25, '.svelte': 25, '.py': 25, '.go': 25, '.rs': 25,
        '.test.ts': 20, '.spec.ts': 20, '__tests__': 20
      },
      skills: {
        'tdd-workflow': 25,
        'codebase-context': 20,
        'svelte5-best-practices': 20,
        'sveltekit-svelte5-tailwind-skill': 15
      },
      keywords: [
        'implement', 'build', 'develop', 'create', 'API', 'endpoint', 'SDK',
        'function', 'component', 'architecture', 'refactor', 'optimize',
        'performance', 'test', 'spec', 'unit test', 'integration test',
        'database', 'query', 'schema', 'migration', 'authentication',
        'authorization', 'security', 'deployment', 'CI/CD', 'pipeline',
        'latency', 'throughput', 'algorithm', 'pattern'
      ],
      codeThreshold: 100 // lines of code changed
    };

    // Product indicators with confidence weights
    this.productIndicators = {
      keywords: [
        'feature', 'release', 'launch', 'announce', 'users', 'customers',
        'benefit', 'value', 'improve', 'enhance', 'streamline', 'simplify',
        'automate', 'dashboard', 'interface', 'UI', 'UX', 'workflow',
        'process', 'operation', 'availability', 'beta', 'pricing',
        'plan', 'tier', 'subscription', 'onboarding'
      ],
      skills: {
        'documentation-generator': 20,
        'frontend-design': 15
      }
    };
  }

  /**
   * Analyze task and determine blog category
   *
   * @param {string} taskId - Task ID (e.g., 'TASK-001')
   * @returns {Object} Category result with confidence
   */
  async analyzeTask(taskId) {
    console.log(`[CategoryDetector] Analyzing ${taskId}...`);

    const taskData = await this.loadTaskData(taskId);

    if (!taskData) {
      console.log('[CategoryDetector] Task data not found, defaulting to technology');
      return { category: 'technology', confidence: 50, reason: 'Task data not found' };
    }

    let techConfidence = 0;
    let productConfidence = 0;
    const reasons = [];

    // 1. Analyze task spec description
    const specAnalysis = this.analyzeSpec(taskData.spec);
    techConfidence += specAnalysis.tech;
    productConfidence += specAnalysis.product;
    if (specAnalysis.reasons.length > 0) {
      reasons.push(...specAnalysis.reasons);
    }

    // 2. Analyze files modified
    const fileAnalysis = this.analyzeFiles(taskData.changes);
    techConfidence += fileAnalysis.tech;
    productConfidence += fileAnalysis.product;
    if (fileAnalysis.reasons.length > 0) {
      reasons.push(...fileAnalysis.reasons);
    }

    // 3. Analyze skills invoked
    const skillAnalysis = this.analyzeSkills(taskData.metadata);
    techConfidence += skillAnalysis.tech;
    productConfidence += skillAnalysis.product;
    if (skillAnalysis.reasons.length > 0) {
      reasons.push(...skillAnalysis.reasons);
    }

    // 4. Analyze code changes
    const codeAnalysis = this.analyzeCodeChanges(taskData.changes);
    techConfidence += codeAnalysis.tech;
    productConfidence += codeAnalysis.product;
    if (codeAnalysis.reasons.length > 0) {
      reasons.push(...codeAnalysis.reasons);
    }

    // 5. Analyze decisions and learnings
    const knowledgeAnalysis = this.analyzeKnowledge(taskData.decisions, taskData.learnings);
    techConfidence += knowledgeAnalysis.tech;
    productConfidence += knowledgeAnalysis.product;
    if (knowledgeAnalysis.reasons.length > 0) {
      reasons.push(...knowledgeAnalysis.reasons);
    }

    // Determine final category
    const confidenceDiff = Math.abs(techConfidence - productConfidence);
    let category, confidence, reason;

    if (confidenceDiff > 20) {
      // Clear winner
      if (techConfidence > productConfidence) {
        category = 'technology';
        confidence = Math.min(100, 50 + confidenceDiff);
      } else {
        category = 'product';
        confidence = Math.min(100, 50 + confidenceDiff);
      }
    } else {
      // Too close to call, use tiebreaker
      if (techConfidence >= productConfidence) {
        category = 'technology';
        confidence = 50 + (techConfidence - productConfidence);
      } else {
        category = 'product';
        confidence = 50 + (productConfidence - techConfidence);
      }
    }

    // Default to technology for coding tasks (safer assumption)
    if (confidence < 60 && techConfidence >= productConfidence) {
      category = 'technology';
      confidence = 60;
    }

    reason = reasons.length > 0 ? reasons.join('; ') : `Confidence scores: tech=${techConfidence}, product=${productConfidence}`;

    const result = {
      taskId,
      category,
      confidence: Math.round(confidence),
      scores: {
        technology: Math.round(techConfidence),
        product: Math.round(productConfidence)
      },
      reason,
      needsReview: confidence < 60
    };

    console.log(`[CategoryDetector] Result: ${result.category} (${result.confidence}% confidence)`);
    console.log(`[CategoryDetector] Reason: ${result.reason}`);

    return result;
  }

  /**
   * Load all task data from logs and knowledge files
   */
  async loadTaskData(taskId) {
    try {
      const taskPath = path.join(this.tasksDir, taskId);

      // Check if task directory exists
      if (!fs.existsSync(taskPath)) {
        return null;
      }

      const data = {
        spec: null,
        changes: [],
        metadata: {},
        decisions: [],
        learnings: []
      };

      // Load spec from specs directory
      const specPath = path.join(process.cwd(), 'specs', `${taskId}.json`);
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

      return data;
    } catch (error) {
      console.error('[CategoryDetector] Failed to load task data:', error.message);
      return null;
    }
  }

  /**
   * Analyze task specification for keywords
   */
  analyzeSpec(spec) {
    let tech = 0;
    let product = 0;
    const reasons = [];

    if (!spec) {
      return { tech: 0, product: 0, reasons: [] };
    }

    const text = JSON.stringify(spec).toLowerCase();

    // Check for technology keywords
    const techMatches = this.techIndicators.keywords.filter(kw =>
      text.includes(kw.toLowerCase())
    );

    if (techMatches.length > 0) {
      tech += Math.min(40, techMatches.length * 5);
      reasons.push(`Tech keywords: ${techMatches.slice(0, 3).join(', ')}`);
    }

    // Check for product keywords
    const productMatches = this.productIndicators.keywords.filter(kw =>
      text.includes(kw.toLowerCase())
    );

    if (productMatches.length > 0) {
      product += Math.min(40, productMatches.length * 5);
      reasons.push(`Product keywords: ${productMatches.slice(0, 3).join(', ')}`);
    }

    return { tech, product, reasons };
  }

  /**
   * Analyze files modified
   */
  analyzeFiles(changes) {
    let tech = 0;
    let product = 0;
    const reasons = [];

    if (!changes || changes.length === 0) {
      return { tech: 0, product: 0, reasons: [] };
    }

    const fileTypes = new Set();
    changes.forEach(change => {
      const ext = path.extname(change.file).toLowerCase();
      if (ext) {
        fileTypes.add(ext);
        if (this.techIndicators.fileTypes[ext]) {
          tech += this.techIndicators.fileTypes[ext];
        }
      }
    });

    if (fileTypes.size > 0) {
      reasons.push(`File types: ${Array.from(fileTypes).join(', ')}`);
    }

    return { tech, product, reasons };
  }

  /**
   * Analyze skills invoked
   */
  analyzeSkills(metadata) {
    let tech = 0;
    let product = 0;
    const reasons = [];

    if (!metadata || !metadata.skills_used) {
      return { tech: 0, product: 0, reasons: [] };
    }

    metadata.skills_used.forEach(skill => {
      if (this.techIndicators.skills[skill]) {
        tech += this.techIndicators.skills[skill];
        reasons.push(`Tech skill: ${skill}`);
      }
      if (this.productIndicators.skills[skill]) {
        product += this.productIndicators.skills[skill];
        reasons.push(`Product skill: ${skill}`);
      }
    });

    return { tech, product, reasons };
  }

  /**
   * Analyze code changes volume
   */
  analyzeCodeChanges(changes) {
    let tech = 0;
    let product = 0;
    const reasons = [];

    if (!changes || changes.length === 0) {
      return { tech: 0, product: 0, reasons: [] };
    }

    const totalLines = changes.reduce((sum, change) => {
      return sum + (change.lines_changed?.added || 0) + (change.lines_changed?.removed || 0);
    }, 0);

    if (totalLines > this.techIndicators.codeThreshold) {
      tech += 25;
      reasons.push(`Significant code changes: ${totalLines} lines`);
    }

    return { tech, product, reasons };
  }

  /**
   * Analyze decisions and learnings for technical vs product focus
   */
  analyzeKnowledge(decisions, learnings) {
    let tech = 0;
    let product = 0;
    const reasons = [];

    const allText = JSON.stringify([...decisions, ...learnings]).toLowerCase();

    // Technical decisions indicate technology blog
    const techPatterns = ['architecture', 'pattern', 'algorithm', 'optimization', 'performance', 'refactor'];
    const techMatches = techPatterns.filter(p => allText.includes(p));

    if (techMatches.length > 0) {
      tech += Math.min(30, techMatches.length * 10);
      reasons.push(`Technical focus: ${techMatches.join(', ')}`);
    }

    // User/benefit focused decisions indicate product blog
    const productPatterns = ['user', 'customer', 'benefit', 'workflow', 'simplify', 'ease'];
    const productMatches = productPatterns.filter(p => allText.includes(p));

    if (productMatches.length > 0) {
      product += Math.min(30, productMatches.length * 10);
      reasons.push(`Product focus: ${productMatches.join(', ')}`);
    }

    return { tech, product, reasons };
  }

  /**
   * Get category description
   */
  getCategoryDescription(category) {
    if (category === 'technology') {
      return {
        audience: 'Developers, engineers, technical decision makers',
        wordCount: '800-1,500 words',
        tone: 'Authoritative, data-driven, assumes technical knowledge',
        required: 'Code examples (1+), technical metrics, implementation details'
      };
    } else {
      return {
        audience: 'Customers, prospects, product managers',
        wordCount: '500-1,000 words',
        tone: 'Professional B2B, benefit-oriented, problem-aware',
        required: 'Pain points, feature breakdown, use cases'
      };
    }
  }
}

// Export for use in other modules
module.exports = { CategoryDetector };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node category-detector.js <TASK-ID>');
    console.log('Example: node category-detector.js TASK-001');
    process.exit(1);
  }

  const taskId = args[0];
  const detector = new CategoryDetector();

  console.log('=== Blog Category Detector Test ===\n');

  detector.analyzeTask(taskId).then(result => {
    console.log('\n=== Category Detection Result ===');
    console.log(`Task: ${result.taskId}`);
    console.log(`Category: ${result.category}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Scores: tech=${result.scores.technology}, product=${result.scores.product}`);
    console.log(`Reason: ${result.reason}`);
    console.log(`Needs Review: ${result.needsReview ? 'Yes' : 'No'}`);

    const desc = detector.getCategoryDescription(result.category);
    console.log('\n=== Category Description ===');
    console.log(`Audience: ${desc.audience}`);
    console.log(`Word Count: ${desc.wordCount}`);
    console.log(`Tone: ${desc.tone}`);
    console.log(`Required: ${desc.required}`);
    console.log('==============================\n');

    process.exit(0);
  }).catch(error => {
    console.error('Category detection failed:', error.message);
    process.exit(1);
  });
}
