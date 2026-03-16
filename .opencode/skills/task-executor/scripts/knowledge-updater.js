#!/usr/bin/env node

/**
 * Knowledge Graph Updater Utility
 *
 * Captures and stores knowledge from task execution in modular JSON files.
 * Creates: metadata.json, decisions.json, learnings.json, patterns.json, anti-patterns.json
 *
 * Usage:
 *   const knowledge = require('./scripts/knowledge-updater');
 *   knowledge.init('TASK-001');
 *   knowledge.captureDecision({...});
 *   knowledge.captureLearning({...});
 *   knowledge.capturePattern({...});
 *   knowledge.captureAntiPattern({...});
 *   knowledge.save();
 */

const fs = require('fs');
const path = require('path');

class KnowledgeUpdater {
  constructor(taskId) {
    this.taskId = taskId;
    this.knowledgeDir = path.join(process.cwd(), 'tasks', taskId, 'knowledge');
    this.data = {
      metadata: {
        task_id: taskId,
        timestamp: new Date().toISOString(),
        completed: false,
        duration_minutes: 0,
        skills_used: [],
        files_modified: [],
        patterns_applied: [],
        subtasks_completed: 0,
        subtasks_total: 0,
        tests_written: 0,
        tests_passing: 0
      },
      decisions: [],
      learnings: [],
      patterns: [],
      anti_patterns: []
    };
  }

  /**
   * Initialize knowledge updater and create knowledge directory
   *
   * @returns {boolean} Success status
   */
  init() {
    try {
      if (!fs.existsSync(this.knowledgeDir)) {
        fs.mkdirSync(this.knowledgeDir, { recursive: true });
      }
      console.log(`[Knowledge] Initialized for ${this.taskId} at ${this.knowledgeDir}`);
      return true;
    } catch (error) {
      console.error(`[Knowledge] Failed to initialize: ${error.message}`);
      return false;
    }
  }

  /**
   * Update task metadata
   *
   * @param {Object} metadata - Metadata updates
   */
  updateMetadata(metadata) {
    this.data.metadata = {
      ...this.data.metadata,
      ...metadata
    };
    console.log('[Knowledge] Metadata updated');
  }

  /**
   * Capture a technical decision made during task execution
   *
   * @param {Object} decision - Decision object
   * @param {string} decision.context - Situation requiring decision
   * @param {string} decision.choice - Decision made
   * @param {string} decision.rationale - Reasoning for the choice
   * @param {Array<string>} [decision.alternatives] - Options considered but not chosen
   * @param {Array<string>} [decision.trade_offs] - Trade-offs acknowledged
   * @param {string} [decision.impact] - Expected impact of decision
   * @returns {Object} Captured decision with id and timestamp
   */
  captureDecision(decision) {
    const entry = {
      id: `D${this.data.decisions.length + 1}`,
      context: decision.context,
      choice: decision.choice,
      alternatives: decision.alternatives || [],
      rationale: decision.rationale,
      trade_offs: decision.trade_offs || [],
      impact: decision.impact || '',
      timestamp: new Date().toISOString()
    };

    // Validate required fields
    if (!entry.context || !entry.choice || !entry.rationale) {
      throw new Error('Decision missing required fields: context, choice, rationale');
    }

    this.data.decisions.push(entry);
    console.log(`[Knowledge] Decision captured: ${entry.id} - ${entry.choice.substring(0, 50)}...`);
    return entry;
  }

  /**
   * Capture a lesson learned during task execution
   *
   * @param {Object} learning - Learning object
   * @param {string} learning.description - Lesson learned statement
   * @param {string} learning.category - technical, process, architecture, testing, tooling
   * @param {string} learning.applicability - When/where this lesson applies
   * @param {string} [learning.confidence] - high, medium, low
   * @param {string} [learning.source] - What experience led to this learning
   * @returns {Object} Captured learning with id
   */
  captureLearning(learning) {
    const entry = {
      id: `L${this.data.learnings.length + 1}`,
      description: learning.description,
      category: learning.category || 'technical',
      applicability: learning.applicability,
      confidence: learning.confidence || 'medium',
      source: learning.source || ''
    };

    // Validate required fields
    if (!entry.description || !entry.applicability) {
      throw new Error('Learning missing required fields: description, applicability');
    }

    // Validate category
    const validCategories = ['technical', 'process', 'architecture', 'testing', 'tooling'];
    if (!validCategories.includes(entry.category)) {
      entry.category = 'technical';
    }

    // Validate confidence
    const validConfidence = ['high', 'medium', 'low'];
    if (!validConfidence.includes(entry.confidence)) {
      entry.confidence = 'medium';
    }

    this.data.learnings.push(entry);
    console.log(`[Knowledge] Learning captured: ${entry.id} - ${entry.description.substring(0, 50)}...`);
    return entry;
  }

  /**
   * Capture a code pattern applied during task execution
   *
   * @param {Object} pattern - Pattern object
   * @param {string} pattern.name - Pattern name
   * @param {string} pattern.description - What the pattern does
   * @param {string} pattern.application - How it was applied in this task
   * @param {string} [pattern.category] - architectural, component, state, testing, security
   * @param {string} [pattern.code_example] - Code snippet showing pattern usage
   * @param {Array<string>} [pattern.benefits] - Benefits gained from pattern
   * @param {string} [pattern.source] - Pattern source or origin
   * @returns {Object} Captured pattern with id
   */
  capturePattern(pattern) {
    const entry = {
      id: `P${this.data.patterns.length + 1}`,
      name: pattern.name,
      description: pattern.description,
      category: pattern.category || 'technical',
      application: pattern.application,
      code_example: pattern.code_example || '',
      benefits: pattern.benefits || [],
      source: pattern.source || ''
    };

    // Validate required fields
    if (!entry.name || !entry.description || !entry.application) {
      throw new Error('Pattern missing required fields: name, description, application');
    }

    // Validate category
    const validCategories = ['architectural', 'component', 'state', 'testing', 'security', 'technical'];
    if (!validCategories.includes(entry.category)) {
      entry.category = 'technical';
    }

    this.data.patterns.push(entry);
    console.log(`[Knowledge] Pattern captured: ${entry.id} - ${entry.name}`);
    return entry;
  }

  /**
   * Capture an anti-pattern avoided during task execution
   *
   * @param {Object} antiPattern - Anti-pattern object
   * @param {string} antiPattern.name - Anti-pattern name
   * @param {string} antiPattern.description - What the anti-pattern is
   * @param {string} antiPattern.avoided_reason - Why it was avoided
   * @param {string} [antiPattern.category] - architectural, component, state, testing, security
   * @param {string} [antiPattern.alternative] - What pattern was used instead
   * @param {Array<string>} [antiPattern.consequences_avoided] - Negative outcomes prevented
   * @returns {Object} Captured anti-pattern with id
   */
  captureAntiPattern(antiPattern) {
    const entry = {
      id: `AP${this.data.anti_patterns.length + 1}`,
      name: antiPattern.name,
      description: antiPattern.description,
      category: antiPattern.category || 'technical',
      avoided_reason: antiPattern.avoided_reason,
      alternative: antiPattern.alternative || '',
      consequences_avoided: antiPattern.consequences_avoided || []
    };

    // Validate required fields
    if (!entry.name || !entry.description || !entry.avoided_reason) {
      throw new Error('Anti-pattern missing required fields: name, description, avoided_reason');
    }

    // Validate category
    const validCategories = ['architectural', 'component', 'state', 'testing', 'security', 'technical'];
    if (!validCategories.includes(entry.category)) {
      entry.category = 'technical';
    }

    this.data.anti_patterns.push(entry);
    console.log(`[Knowledge] Anti-pattern captured: ${entry.id} - ${entry.name}`);
    return entry;
  }

  /**
   * Record a skill that was invoked during execution
   *
   * @param {string} skillName - Name of the skill
   * @param {Object} [result] - Skill execution result
   */
  recordSkillUsage(skillName, result = null) {
    if (!this.data.metadata.skills_used.includes(skillName)) {
      this.data.metadata.skills_used.push(skillName);
    }
    console.log(`[Knowledge] Skill usage recorded: ${skillName}`);
  }

  /**
   * Record a file that was modified during execution
   *
   * @param {string} filePath - Path to the file
   * @param {string} [changeType] - added, modified, deleted
   */
  recordFileModification(filePath, changeType = 'modified') {
    const existing = this.data.metadata.files_modified.find(f => f.path === filePath);
    if (existing) {
      existing.change_type = changeType;
    } else {
      this.data.metadata.files_modified.push({
        path: filePath,
        change_type: changeType
      });
    }
    console.log(`[Knowledge] File modification recorded: ${filePath}`);
  }

  /**
   * Record test statistics
   *
   * @param {number} written - Number of tests written
   * @param {number} passing - Number of tests passing
   */
  recordTestStats(written, passing) {
    this.data.metadata.tests_written = written;
    this.data.metadata.tests_passing = passing;
    console.log(`[Knowledge] Test stats recorded: ${passing}/${written} passing`);
  }

  /**
   * Mark task as completed
   *
   * @param {boolean} success - Whether task completed successfully
   * @param {number} durationMinutes - Total execution time in minutes
   */
  markCompleted(success, durationMinutes) {
    this.data.metadata.completed = success;
    this.data.metadata.duration_minutes = durationMinutes;
    this.data.metadata.timestamp = new Date().toISOString();
    console.log(`[Knowledge] Task marked as ${success ? 'completed' : 'failed'} (${durationMinutes}min)`);
  }

  /**
   * Get summary statistics for all knowledge
   *
   * @returns {Object} Summary statistics
   */
  getSummary() {
    return {
      task_id: this.data.metadata.task_id,
      completed: this.data.metadata.completed,
      duration_minutes: this.data.metadata.duration_minutes,
      decisions_count: this.data.decisions.length,
      learnings_count: this.data.learnings.length,
      patterns_count: this.data.patterns.length,
      anti_patterns_count: this.data.anti_patterns.length,
      skills_used_count: this.data.metadata.skills_used.length,
      files_modified_count: this.data.metadata.files_modified.length,
      tests_written: this.data.metadata.tests_written,
      tests_passing: this.data.metadata.tests_passing
    };
  }

  /**
   * Save all knowledge to modular JSON files
   *
   * @returns {boolean} Success status
   */
  save() {
    try {
      if (!fs.existsSync(this.knowledgeDir)) {
        fs.mkdirSync(this.knowledgeDir, { recursive: true });
      }

      // Write metadata.json
      const metadataPath = path.join(this.knowledgeDir, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(this.data.metadata, null, 2));
      console.log(`[Knowledge] Saved metadata to ${metadataPath}`);

      // Write decisions.json
      const decisionsPath = path.join(this.knowledgeDir, 'decisions.json');
      fs.writeFileSync(decisionsPath, JSON.stringify({
        task_id: this.taskId,
        decisions: this.data.decisions
      }, null, 2));
      console.log(`[Knowledge] Saved ${this.data.decisions.length} decisions to ${decisionsPath}`);

      // Write learnings.json
      const learningsPath = path.join(this.knowledgeDir, 'learnings.json');
      fs.writeFileSync(learningsPath, JSON.stringify({
        task_id: this.taskId,
        learnings: this.data.learnings
      }, null, 2));
      console.log(`[Knowledge] Saved ${this.data.learnings.length} learnings to ${learningsPath}`);

      // Write patterns.json
      const patternsPath = path.join(this.knowledgeDir, 'patterns.json');
      fs.writeFileSync(patternsPath, JSON.stringify({
        task_id: this.taskId,
        patterns: this.data.patterns
      }, null, 2));
      console.log(`[Knowledge] Saved ${this.data.patterns.length} patterns to ${patternsPath}`);

      // Write anti-patterns.json
      const antiPatternsPath = path.join(this.knowledgeDir, 'anti-patterns.json');
      fs.writeFileSync(antiPatternsPath, JSON.stringify({
        task_id: this.taskId,
        anti_patterns: this.data.anti_patterns
      }, null, 2));
      console.log(`[Knowledge] Saved ${this.data.anti_patterns.length} anti-patterns to ${antiPatternsPath}`);

      console.log(`[Knowledge] All knowledge files saved successfully for ${this.taskId}`);
      return true;
    } catch (error) {
      console.error(`[Knowledge] Failed to save knowledge: ${error.message}`);
      return false;
    }
  }

  /**
   * Load existing knowledge from files
   *
   * @returns {boolean} Success status
   */
  load() {
    try {
      const metadataPath = path.join(this.knowledgeDir, 'metadata.json');
      const decisionsPath = path.join(this.knowledgeDir, 'decisions.json');
      const learningsPath = path.join(this.knowledgeDir, 'learnings.json');
      const patternsPath = path.join(this.knowledgeDir, 'patterns.json');
      const antiPatternsPath = path.join(this.knowledgeDir, 'anti-patterns.json');

      if (fs.existsSync(metadataPath)) {
        this.data.metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }

      if (fs.existsSync(decisionsPath)) {
        const data = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'));
        this.data.decisions = data.decisions || [];
      }

      if (fs.existsSync(learningsPath)) {
        const data = JSON.parse(fs.readFileSync(learningsPath, 'utf8'));
        this.data.learnings = data.learnings || [];
      }

      if (fs.existsSync(patternsPath)) {
        const data = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
        this.data.patterns = data.patterns || [];
      }

      if (fs.existsSync(antiPatternsPath)) {
        const data = JSON.parse(fs.readFileSync(antiPatternsPath, 'utf8'));
        this.data.anti_patterns = data.anti_patterns || [];
      }

      console.log(`[Knowledge] Loaded existing knowledge for ${this.taskId}`);
      return true;
    } catch (error) {
      console.error(`[Knowledge] Failed to load knowledge: ${error.message}`);
      return false;
    }
  }

  /**
   * Prepare knowledge for merging with other tasks
   *
   * @returns {Object} Knowledge ready for aggregation
   */
  prepareForMerge() {
    return {
      task_id: this.taskId,
      timestamp: this.data.metadata.timestamp,
      decisions: this.data.decisions.map(d => ({ ...d, task_id: this.taskId })),
      learnings: this.data.learnings.map(l => ({ ...l, task_id: this.taskId })),
      patterns: this.data.patterns.map(p => ({ ...p, task_id: this.taskId })),
      anti_patterns: this.data.anti_patterns.map(ap => ({ ...ap, task_id: this.taskId }))
    };
  }
}

// Export for use in other modules
module.exports = { KnowledgeUpdater };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node knowledge-updater.js <TASK-ID>');
    console.log('Example: node knowledge-updater.js TASK-001');
    process.exit(1);
  }

  const taskId = args[0];
  const knowledge = new KnowledgeUpdater(taskId);

  console.log(`=== Knowledge Updater Test for ${taskId} ===\n`);

  // Initialize
  knowledge.init();

  // Capture test data
  knowledge.captureDecision({
    context: 'State management for user session',
    choice: 'Svelte 5 $state rune instead of stores',
    rationale: 'Runes provide better SSR isolation, simpler syntax, and are the Svelte 5 recommended approach',
    alternatives: ['Writable store', 'Context API', 'External state library'],
    trade_offs: ['Less ecosystem compatibility with store-based code'],
    impact: 'Cleaner component code, better SSR behavior'
  });

  knowledge.captureLearning({
    description: 'Using $derived for computed values reduces reactivity bugs compared to manual calculations',
    category: 'technical',
    applicability: 'Svelte 5 component development',
    confidence: 'high',
    source: 'Refactored computed user data from manual to $derived'
  });

  knowledge.capturePattern({
    name: 'RED-GREEN-REFACTOR',
    description: 'Test-driven development cycle: write failing test, write minimal code, refactor',
    category: 'testing',
    application: 'Applied to all authentication functions',
    code_example: '1. Write test for login()\n2. Implement minimal login()\n3. Refactor with error extraction',
    benefits: ['All code covered by tests', 'Edge cases discovered early', 'Confidence in refactoring'],
    source: 'tdd-workflow skill'
  });

  knowledge.captureAntiPattern({
    name: 'God Component',
    description: 'Single component handling multiple unrelated responsibilities',
    category: 'component',
    avoided_reason: 'Would make component hard to test, maintain, and reuse',
    alternative: 'Separated into Login, Register, and PasswordReset components',
    consequences_avoided: ['Unmaintainable code', 'Difficult testing', 'Poor reusability']
  });

  knowledge.recordSkillUsage('tdd-workflow');
  knowledge.recordSkillUsage('svelte5-best-practices');
  knowledge.recordFileModification('src/auth.ts', 'added');
  knowledge.recordFileModification('src/auth.test.ts', 'added');
  knowledge.recordTestStats(15, 15);
  knowledge.markCompleted(true, 135);

  // Save knowledge
  knowledge.save();

  // Print summary
  const summary = knowledge.getSummary();
  console.log('\n=== Knowledge Summary ===');
  console.log(`Task: ${summary.task_id}`);
  console.log(`Completed: ${summary.completed}`);
  console.log(`Duration: ${summary.duration_minutes} minutes`);
  console.log(`Decisions: ${summary.decisions_count}`);
  console.log(`Learnings: ${summary.learnings_count}`);
  console.log(`Patterns: ${summary.patterns_count}`);
  console.log(`Anti-patterns: ${summary.anti_patterns_count}`);
  console.log(`Skills used: ${summary.skills_used_count}`);
  console.log(`Files modified: ${summary.files_modified_count}`);
  console.log(`Tests: ${summary.tests_passing}/${summary.tests_written} passing`);
  console.log('=========================\n');
}
