#!/usr/bin/env node

/**
 * Structured JSON Logger Utility
 *
 * Writes task execution logs in structured JSON format.
 * Creates and manages: decisions.json, issues.json, tests.json, changes.json
 *
 * Usage:
 *   const logger = require('./scripts/logger');
 *   logger.init('TASK-001');
 *   logger.logDecision({...});
 *   logger.logIssue({...});
 *   logger.logTest({...});
 *   logger.logChange({...});
 *   logger.save();
 */

const fs = require('fs');
const path = require('path');

class TaskLogger {
  constructor(taskId) {
    this.taskId = taskId;
    this.logsDir = path.join(process.cwd(), 'tasks', taskId, 'logs');
    this.data = {
      decisions: [],
      issues: [],
      tests: [],
      changes: []
    };
  }

  /**
   * Initialize logger and create logs directory
   */
  init() {
    try {
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
      console.log(`[Logger] Initialized for ${this.taskId} at ${this.logsDir}`);
      return true;
    } catch (error) {
      console.error(`[Logger] Failed to initialize: ${error.message}`);
      return false;
    }
  }

  /**
   * Log a decision made during task execution
   *
   * @param {Object} decision - Decision object
   * @param {string} decision.context - Situation requiring decision
   * @param {string} decision.choice - Decision made
   * @param {string} decision.rationale - Reasoning for the choice
   * @param {Array<string>} [decision.alternatives] - Options considered but not chosen
   * @param {Array<string>} [decision.trade_offs] - Trade-offs acknowledged
   * @returns {Object} Logged decision with id and timestamp
   */
  logDecision(decision) {
    const entry = {
      id: `D${this.data.decisions.length + 1}`,
      task_id: this.taskId,
      context: decision.context,
      choice: decision.choice,
      rationale: decision.rationale,
      alternatives: decision.alternatives || [],
      trade_offs: decision.trade_offs || [],
      timestamp: new Date().toISOString()
    };

    // Validate required fields
    if (!entry.context || !entry.choice || !entry.rationale) {
      throw new Error('Decision missing required fields: context, choice, rationale');
    }

    this.data.decisions.push(entry);
    console.log(`[Logger] Decision logged: ${entry.id} - ${entry.choice.substring(0, 50)}...`);
    return entry;
  }

  /**
   * Log an issue encountered during task execution
   *
   * @param {Object} issue - Issue object
   * @param {string} issue.description - Description of the issue
   * @param {string} issue.resolution - How it was resolved
   * @param {string} [issue.severity] - low, medium, high, critical
   * @param {string} [issue.error_type] - transient, logic, missing_resource, permission, skill_invocation
   * @param {number} [issue.retry_count] - Number of retries attempted
   * @param {boolean} [issue.fallback_used] - Whether fallback strategy was used
   * @returns {Object} Logged issue with id and timestamp
   */
  logIssue(issue) {
    const entry = {
      id: `ERR-${this.data.issues.length + 1}`,
      task_id: this.taskId,
      description: issue.description,
      severity: issue.severity || 'medium',
      error_type: issue.error_type || 'unknown',
      resolution: issue.resolution,
      retry_count: issue.retry_count || 0,
      fallback_used: issue.fallback_used || false,
      timestamp: new Date().toISOString()
    };

    // Validate required fields
    if (!entry.description || !entry.resolution) {
      throw new Error('Issue missing required fields: description, resolution');
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(entry.severity)) {
      entry.severity = 'medium';
    }

    this.data.issues.push(entry);
    console.log(`[Logger] Issue logged: ${entry.id} - ${entry.severity} - ${entry.description.substring(0, 50)}...`);
    return entry;
  }

  /**
   * Log a TDD test cycle result
   *
   * @param {Object} test - Test object
   * @param {string} test.phase - RED, GREEN, or REFACTOR
   * @param {string} test.status - passed, failed, or skipped
   * @param {string} [test.test_name] - Name of the test
   * @param {string} [test.test_file] - Path to test file
   * @param {string} [test.code_file] - Path to code file
   * @param {string} [test.error] - Error message if failed
   * @param {string} [test.implementation] - Implementation description
   * @param {string} [test.refactoring] - Refactoring description
   * @returns {Object} Logged test with cycle_number and timestamp
   */
  logTest(test) {
    const entry = {
      cycle_number: this.data.tests.length + 1,
      task_id: this.taskId,
      phase: test.phase,
      test_name: test.test_name || '',
      test_file: test.test_file || '',
      code_file: test.code_file || '',
      status: test.status,
      error: test.error || '',
      implementation: test.implementation || '',
      refactoring: test.refactoring || '',
      lines_changed: test.lines_changed || { added: 0, removed: 0 },
      timestamp: new Date().toISOString()
    };

    // Validate required fields
    if (!entry.phase || !entry.status) {
      throw new Error('Test missing required fields: phase, status');
    }

    // Validate phase
    const validPhases = ['RED', 'GREEN', 'REFACTOR'];
    if (!validPhases.includes(entry.phase)) {
      throw new Error(`Invalid test phase: ${entry.phase}. Must be RED, GREEN, or REFACTOR`);
    }

    // Validate status
    const validStatuses = ['passed', 'failed', 'skipped'];
    if (!validStatuses.includes(entry.status)) {
      throw new Error(`Invalid test status: ${entry.status}. Must be passed, failed, or skipped`);
    }

    this.data.tests.push(entry);
    console.log(`[Logger] Test logged: Cycle ${entry.cycle_number} - ${entry.phase} - ${entry.status}`);
    return entry;
  }

  /**
   * Log a codebase change
   *
   * @param {Object} change - Change object
   * @param {string} change.file - Path to modified file
   * @param {string} change.type - added, modified, deleted, or renamed
   * @param {string} change.description - Description of the change
   * @param {string} [change.purpose] - Purpose of the change
   * @param {string} [change.related_subtask] - Related subtask ID
   * @param {Object} [change.lines_changed] - Lines added/removed
   * @returns {Object} Logged change with timestamp
   */
  logChange(change) {
    const entry = {
      task_id: this.taskId,
      file: change.file,
      type: change.type,
      description: change.description,
      purpose: change.purpose || '',
      related_subtask: change.related_subtask || '',
      lines_changed: change.lines_changed || { added: 0, removed: 0 },
      timestamp: new Date().toISOString()
    };

    // Validate required fields
    if (!entry.file || !entry.type || !entry.description) {
      throw new Error('Change missing required fields: file, type, description');
    }

    // Validate type
    const validTypes = ['added', 'modified', 'deleted', 'renamed'];
    if (!validTypes.includes(entry.type)) {
      throw new Error(`Invalid change type: ${entry.type}. Must be added, modified, deleted, or renamed`);
    }

    this.data.changes.push(entry);
    console.log(`[Logger] Change logged: ${entry.type} - ${entry.file}`);
    return entry;
  }

  /**
   * Get summary statistics for all logs
   *
   * @returns {Object} Summary statistics
   */
  getSummary() {
    return {
      task_id: this.taskId,
      decisions_count: this.data.decisions.length,
      issues_count: this.data.issues.length,
      tests_count: this.data.tests.length,
      changes_count: this.data.changes.length,
      tests_by_status: {
        passed: this.data.tests.filter(t => t.status === 'passed').length,
        failed: this.data.tests.filter(t => t.status === 'failed').length,
        skipped: this.data.tests.filter(t => t.status === 'skipped').length
      },
      issues_by_severity: {
        critical: this.data.issues.filter(i => i.severity === 'critical').length,
        high: this.data.issues.filter(i => i.severity === 'high').length,
        medium: this.data.issues.filter(i => i.severity === 'medium').length,
        low: this.data.issues.filter(i => i.severity === 'low').length
      },
      changes_by_type: {
        added: this.data.changes.filter(c => c.type === 'added').length,
        modified: this.data.changes.filter(c => c.type === 'modified').length,
        deleted: this.data.changes.filter(c => c.type === 'deleted').length,
        renamed: this.data.changes.filter(c => c.type === 'renamed').length
      }
    };
  }

  /**
   * Save all logs to JSON files
   *
   * @returns {boolean} Success status
   */
  save() {
    try {
      // Ensure logs directory exists
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }

      // Write decisions.json
      const decisionsPath = path.join(this.logsDir, 'decisions.json');
      fs.writeFileSync(decisionsPath, JSON.stringify({
        task_id: this.taskId,
        decisions: this.data.decisions
      }, null, 2));
      console.log(`[Logger] Saved ${this.data.decisions.length} decisions to ${decisionsPath}`);

      // Write issues.json
      const issuesPath = path.join(this.logsDir, 'issues.json');
      fs.writeFileSync(issuesPath, JSON.stringify({
        task_id: this.taskId,
        issues: this.data.issues
      }, null, 2));
      console.log(`[Logger] Saved ${this.data.issues.length} issues to ${issuesPath}`);

      // Write tests.json
      const testsPath = path.join(this.logsDir, 'tests.json');
      fs.writeFileSync(testsPath, JSON.stringify({
        task_id: this.taskId,
        tdd_cycles: this.data.tests
      }, null, 2));
      console.log(`[Logger] Saved ${this.data.tests.length} tests to ${testsPath}`);

      // Write changes.json
      const changesPath = path.join(this.logsDir, 'changes.json');
      const changesSummary = this.getSummary().changes_by_type;
      fs.writeFileSync(changesPath, JSON.stringify({
        task_id: this.taskId,
        changes: this.data.changes,
        summary: {
          files_added: changesSummary.added,
          files_modified: changesSummary.modified,
          files_deleted: changesSummary.deleted,
          total_lines_added: this.data.changes.reduce((sum, c) => sum + (c.lines_changed?.added || 0), 0),
          total_lines_removed: this.data.changes.reduce((sum, c) => sum + (c.lines_changed?.removed || 0), 0)
        }
      }, null, 2));
      console.log(`[Logger] Saved ${this.data.changes.length} changes to ${changesPath}`);

      console.log(`[Logger] All logs saved successfully for ${this.taskId}`);
      return true;
    } catch (error) {
      console.error(`[Logger] Failed to save logs: ${error.message}`);
      return false;
    }
  }

  /**
   * Load existing logs from files
   *
   * @returns {boolean} Success status
   */
  load() {
    try {
      const decisionsPath = path.join(this.logsDir, 'decisions.json');
      const issuesPath = path.join(this.logsDir, 'issues.json');
      const testsPath = path.join(this.logsDir, 'tests.json');
      const changesPath = path.join(this.logsDir, 'changes.json');

      if (fs.existsSync(decisionsPath)) {
        const data = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'));
        this.data.decisions = data.decisions || [];
      }

      if (fs.existsSync(issuesPath)) {
        const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
        this.data.issues = data.issues || [];
      }

      if (fs.existsSync(testsPath)) {
        const data = JSON.parse(fs.readFileSync(testsPath, 'utf8'));
        this.data.tests = data.tdd_cycles || [];
      }

      if (fs.existsSync(changesPath)) {
        const data = JSON.parse(fs.readFileSync(changesPath, 'utf8'));
        this.data.changes = data.changes || [];
      }

      console.log(`[Logger] Loaded existing logs for ${this.taskId}`);
      return true;
    } catch (error) {
      console.error(`[Logger] Failed to load logs: ${error.message}`);
      return false;
    }
  }
}

// Export for use in other modules
module.exports = { TaskLogger };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node logger.js <TASK-ID>');
    console.log('Example: node logger.js TASK-001');
    process.exit(1);
  }

  const taskId = args[0];
  const logger = new TaskLogger(taskId);

  console.log(`Testing logger for ${taskId}...`);

  // Initialize
  logger.init();

  // Test logging
  logger.logDecision({
    context: 'State management for component',
    choice: 'Using Svelte 5 $state rune',
    rationale: 'Better SSR isolation and simpler syntax',
    alternatives: ['Writable store', 'Context API'],
    trade_offs: ['Less ecosystem compatibility']
  });

  logger.logIssue({
    description: 'Test failed: expected 200 but got 401',
    resolution: 'Fixed authentication middleware',
    severity: 'high',
    error_type: 'logic',
    retry_count: 0,
    fallback_used: false
  });

  logger.logTest({
    phase: 'RED',
    status: 'failed',
    test_name: 'should login user with valid credentials',
    test_file: 'src/auth.test.ts',
    error: 'Expected 200 but got 401'
  });

  logger.logTest({
    phase: 'GREEN',
    status: 'passed',
    test_name: 'should login user with valid credentials',
    test_file: 'src/auth.test.ts',
    code_file: 'src/auth.ts',
    implementation: 'Added login function with JWT generation'
  });

  logger.logChange({
    file: 'src/auth.ts',
    type: 'added',
    description: 'Implemented authentication module',
    purpose: 'User login/logout functionality',
    lines_changed: { added: 85, removed: 0 }
  });

  // Save logs
  logger.save();

  // Print summary
  const summary = logger.getSummary();
  console.log('\n=== Log Summary ===');
  console.log(`Task: ${summary.task_id}`);
  console.log(`Decisions: ${summary.decisions_count}`);
  console.log(`Issues: ${summary.issues_count}`);
  console.log(`Tests: ${summary.tests_count} (${summary.tests_by_status.passed} passed)`);
  console.log(`Changes: ${summary.changes_count}`);
  console.log('===================\n');
}
