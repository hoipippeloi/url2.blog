#!/usr/bin/env node

/**
 * Skill Orchestrator Utility
 *
 * Analyzes task context and dynamically invokes appropriate skills.
 * Handles skill selection, invocation order, and execution coordination.
 *
 * Usage:
 *   const orchestrator = require('./scripts/orchestrator');
 *   const plan = await orchestrator.analyzeTask(taskSpec);
 *   await orchestrator.executePlan(plan);
 */

const fs = require('fs');
const path = require('path');

class SkillOrchestrator {
  constructor(options = {}) {
    this.skillsDir = options.skillsDir || path.join(process.cwd(), 'skills');
    this.logger = options.logger || null;
    this.invokedSkills = [];
    this.skillResults = [];
  }

  /**
   * Analyze task specification and determine which skills to invoke
   *
   * @param {Object} taskSpec - Task specification from specs/TASK-XXX.json
   * @returns {Object} Orchestration plan with skills and execution order
   */
  async analyzeTask(taskSpec) {
    console.log('[Orchestrator] Analyzing task:', taskSpec.task?.title || 'Unknown');

    const context = {
      fileTypes: this.extractFileTypes(taskSpec),
      workType: this.classifyWorkType(taskSpec),
      codebaseSize: await this.assessCodebaseSize(),
      requirements: taskSpec.task?.spec?.requirements || [],
      subtasks: taskSpec.task?.subtasks || []
    };

    console.log('[Orchestrator] Context:', {
      fileTypes: context.fileTypes,
      workType: context.workType,
      codebaseSize: context.codebaseSize
    });

    const skills = this.selectSkills(context);
    const executionOrder = this.planExecutionOrder(skills, context.subtasks);

    const plan = {
      task_id: taskSpec.task?.id || 'UNKNOWN',
      context,
      skills,
      executionOrder,
      createdAt: new Date().toISOString()
    };

    console.log('[Orchestrator] Plan created:', {
      skills_count: skills.length,
      execution_order: executionOrder.length
    });

    return plan;
  }

  /**
   * Extract file types from task specification
   *
   * @param {Object} taskSpec - Task specification
   * @returns {Array<string>} Array of file extensions
   */
  extractFileTypes(taskSpec) {
    const fileTypes = new Set();
    const text = JSON.stringify(taskSpec).toLowerCase();

    // Common file type patterns
    const patterns = [
      /\.svelte/g, /\.ts/g, /\.js/g, /\.py/g, /\.md/g,
      /\.json/g, /\.css/g, /\.html/g, /\.sql/g
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(ext => fileTypes.add(ext.replace('.', '')));
      }
    });

    // Check for explicit file path mentions
    const filePathPattern = /[a-zA-Z0-9_\/\-]+\.(svelte|ts|js|py|md|json|css|html|sql)/gi;
    const filePaths = text.match(filePathPattern);
    if (filePaths) {
      filePaths.forEach(fp => {
        const ext = fp.split('.').pop();
        if (ext) fileTypes.add(ext);
      });
    }

    return Array.from(fileTypes);
  }

  /**
   * Classify the type of work based on task specification
   *
   * @param {Object} taskSpec - Task specification
   * @returns {string} Work type classification
   */
  classifyWorkType(taskSpec) {
    const text = JSON.stringify(taskSpec).toLowerCase();
    const requirements = taskSpec.task?.spec?.requirements || [];
    const description = taskSpec.task?.spec?.description || '';

    // Check for coding work
    const codingKeywords = ['implement', 'create', 'build', 'develop', 'write', 'code', 'function', 'class', 'component'];
    const hasCoding = codingKeywords.some(kw => text.includes(kw));

    // Check for frontend work
    const frontendKeywords = ['frontend', 'ui', 'component', 'svelte', 'react', 'vue', 'angular', 'styling', 'css'];
    const hasFrontend = frontendKeywords.some(kw => text.includes(kw));

    // Check for backend work
    const backendKeywords = ['api', 'backend', 'server', 'database', 'endpoint', 'authentication', 'authorization'];
    const hasBackend = backendKeywords.some(kw => text.includes(kw));

    // Check for documentation work
    const docsKeywords = ['document', 'readme', 'changelog', 'docs', 'write documentation'];
    const hasDocs = docsKeywords.some(kw => text.includes(kw));

    // Check for testing work
    const testKeywords = ['test', 'spec', 'jest', 'vitest', 'unit test', 'integration test'];
    const hasTesting = testKeywords.some(kw => text.includes(kw));

    // Classify based on keywords
    if (hasDocs && !hasCoding) return 'documentation';
    if (hasTesting && !hasCoding) return 'testing';
    if (hasFrontend && hasBackend) return 'full-stack';
    if (hasFrontend) return 'frontend';
    if (hasBackend) return 'backend';
    if (hasCoding) return 'coding';

    return 'general';
  }

  /**
   * Assess codebase size by scanning the project directory
   *
   * @returns {Promise<string>} Codebase size classification
   */
  async assessCodebaseSize() {
    try {
      const projectRoot = process.cwd();
      let fileCount = 0;

      const countFiles = (dir) => {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            if (entry.isDirectory()) {
              countFiles(path.join(dir, entry.name));
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase();
              if (['.ts', '.js', '.svelte', '.py', '.md', '.json'].includes(ext)) {
                fileCount++;
              }
            }
          }
        } catch (error) {
          // Ignore errors in directory traversal
        }
      };

      countFiles(projectRoot);

      if (fileCount > 100) return 'large';
      if (fileCount > 20) return 'medium';
      return 'small';
    } catch (error) {
      console.error('[Orchestrator] Failed to assess codebase size:', error.message);
      return 'unknown';
    }
  }

  /**
   * Select skills based on task context
   *
   * @param {Object} context - Analyzed task context
   * @returns {Array<Object>} Selected skills with invocation details
   */
  selectSkills(context) {
    const skills = [];

    // Mandatory: TDD workflow for all coding tasks
    if (['coding', 'frontend', 'backend', 'full-stack'].includes(context.workType)) {
      skills.push({
        name: 'tdd-workflow',
        reason: 'Mandatory for all coding work',
        priority: 1,
        required: true
      });
    }

    // Frontend: Svelte 5 best practices
    if (context.fileTypes.includes('svelte') || context.workType === 'frontend') {
      skills.push({
        name: 'svelte5-best-practices',
        reason: 'Svelte component development',
        priority: 2,
        required: false
      });
    }

    // Full-stack: SvelteKit integration
    if (context.workType === 'full-stack') {
      skills.push({
        name: 'sveltekit-svelte5-tailwind-skill',
        reason: 'Full-stack SvelteKit development',
        priority: 2,
        required: false
      });
    }

    // Large codebase: Context documentation
    if (context.codebaseSize === 'large') {
      skills.push({
        name: 'codebase-context',
        reason: 'Large codebase requires context documentation',
        priority: 0, // Run first to establish context
        required: false
      });
    }

    // Documentation work
    if (context.workType === 'documentation') {
      skills.push({
        name: 'documentation-generator',
        reason: 'Documentation generation required',
        priority: 1,
        required: false
      });
    }

    // Sort by priority (lower priority number = run first)
    skills.sort((a, b) => a.priority - b.priority);

    console.log('[Orchestrator] Selected skills:', skills.map(s => s.name));

    return skills;
  }

  /**
   * Plan execution order for skills based on dependencies
   *
   * @param {Array<Object>} skills - Selected skills
   * @param {Array<Object>} subtasks - Task subtasks
   * @returns {Array<Object>} Execution plan with ordered skill invocations
   */
  planExecutionOrder(skills, subtasks) {
    const executionOrder = [];

    // Group subtasks by dependencies
    const dependencyGraph = this.buildDependencyGraph(subtasks);
    const orderedSubtasks = this.topologicalSort(dependencyGraph);

    // Create execution plan
    orderedSubtasks.forEach(subtask => {
      const requiredSkills = skills.filter(s => {
        if (s.required) return true;
        // Match skills to subtask based on context
        return true; // For now, all selected skills apply to all subtasks
      });

      executionOrder.push({
        subtask_id: subtask.id,
        subtask_name: subtask.name,
        skills: requiredSkills.map(s => ({
          ...s,
          context: {
            subtask_id: subtask.id,
            subtask_description: subtask.description,
            depends_on: subtask.depends_on || []
          }
        })),
        can_run_parallel: subtask.depends_on?.length === 0
      });
    });

    return executionOrder;
  }

  /**
   * Build dependency graph from subtasks
   *
   * @param {Array<Object>} subtasks - Task subtasks
   * @returns {Object} Dependency graph
   */
  buildDependencyGraph(subtasks) {
    const graph = {};
    subtasks.forEach(st => {
      graph[st.id] = {
        subtask: st,
        dependencies: st.depends_on || [],
        dependents: []
      };
    });

    // Build reverse dependencies
    subtasks.forEach(st => {
      (st.depends_on || []).forEach(depId => {
        if (graph[depId]) {
          graph[depId].dependents.push(st.id);
        }
      });
    });

    return graph;
  }

  /**
   * Topological sort for dependency ordering
   *
   * @param {Object} graph - Dependency graph
   * @returns {Array<Object>} Ordered subtasks
   */
  topologicalSort(graph) {
    const visited = new Set();
    const result = [];

    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = graph[id];
      if (!node) return;

      // Visit dependencies first
      node.dependencies.forEach(depId => visit(depId));
      result.push(node.subtask);
    };

    Object.keys(graph).forEach(id => visit(id));
    return result;
  }

  /**
   * Execute the orchestration plan
   *
   * @param {Object} plan - Orchestration plan from analyzeTask()
   * @returns {Promise<Object>} Execution results
   */
  async executePlan(plan) {
    console.log('[Orchestrator] Executing plan for:', plan.task_id);

    const results = {
      task_id: plan.task_id,
      started_at: new Date().toISOString(),
      skill_invocations: [],
      errors: [],
      completed_at: null,
      success: false
    };

    try {
      for (const step of plan.executionOrder) {
        console.log(`[Orchestrator] Executing subtask ${step.subtask_id}: ${step.subtask_name}`);

        for (const skill of step.skills) {
          const invocationResult = await this.invokeSkill(skill, step.subtask_id);
          results.skill_invocations.push(invocationResult);

          if (invocationResult.success === false && skill.required) {
            results.errors.push({
              skill: skill.name,
              subtask: step.subtask_id,
              error: invocationResult.error
            });

            // For required skills, stop execution
            throw new Error(`Required skill ${skill.name} failed: ${invocationResult.error}`);
          }
        }
      }

      results.completed_at = new Date().toISOString();
      results.success = true;
      this.skillResults = results.skill_invocations;

      console.log('[Orchestrator] Plan execution completed successfully');
    } catch (error) {
      results.completed_at = new Date().toISOString();
      results.success = false;
      results.error = error.message;
      console.error('[Orchestrator] Plan execution failed:', error.message);
    }

    return results;
  }

  /**
   * Invoke a single skill with context
   *
   * @param {Object} skill - Skill configuration
   * @param {string} subtaskId - Subtask being executed
   * @returns {Promise<Object>} Invocation result
   */
  async invokeSkill(skill, subtaskId) {
    const startTime = Date.now();
    console.log(`[Orchestrator] Invoking skill: ${skill.name} for subtask ${subtaskId}`);

    try {
      // Check if skill file exists
      const skillPath = path.join(this.skillsDir, skill.name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        throw new Error(`Skill file not found: ${skillPath}`);
      }

      // Read skill definition
      const skillDefinition = fs.readFileSync(skillPath, 'utf8');

      // Simulate skill execution (in real implementation, this would invoke the skill)
      // For now, we log the invocation and return success
      const result = {
        skill_name: skill.name,
        subtask_id: subtaskId,
        invoked_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        outcome: 'success',
        reason: skill.reason,
        artifacts: [],
        log_message: `Skill ${skill.name} executed for subtask ${subtaskId}`
      };

      this.invokedSkills.push(result);

      // Log to logger if available
      if (this.logger) {
        this.logger.logDecision({
          context: `Skill invocation for subtask ${subtaskId}`,
          choice: `Invoked ${skill.name}`,
          rationale: skill.reason,
          alternatives: [],
          trade_offs: []
        });
      }

      console.log(`[Orchestrator] Skill ${skill.name} completed in ${result.duration_ms}ms`);
      return result;
    } catch (error) {
      const result = {
        skill_name: skill.name,
        subtask_id: subtaskId,
        invoked_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        outcome: 'failed',
        error: error.message,
        reason: skill.reason
      };

      console.error(`[Orchestrator] Skill ${skill.name} failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Get summary of invoked skills
   *
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const successful = this.invokedSkills.filter(s => s.outcome === 'success').length;
    const failed = this.invokedSkills.filter(s => s.outcome === 'failed').length;
    const totalDuration = this.invokedSkills.reduce((sum, s) => sum + s.duration_ms, 0);

    return {
      total_invocations: this.invokedSkills.length,
      successful,
      failed,
      total_duration_ms: totalDuration,
      avg_duration_ms: this.invokedSkills.length > 0 ? Math.round(totalDuration / this.invokedSkills.length) : 0,
      skills_invoked: this.invokedSkills.map(s => s.skill_name)
    };
  }
}

// Export for use in other modules
module.exports = { SkillOrchestrator };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node orchestrator.js <TASK-SPEC-FILE>');
    console.log('Example: node orchestrator.js specs/TASK-001.json');
    process.exit(1);
  }

  const specFile = args[0];

  if (!fs.existsSync(specFile)) {
    console.error(`Error: Spec file not found: ${specFile}`);
    process.exit(1);
  }

  const taskSpec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const orchestrator = new SkillOrchestrator();

  console.log('=== Skill Orchestrator Test ===\n');

  // Analyze task
  orchestrator.analyzeTask(taskSpec).then(async (plan) => {
    console.log('\nOrchestration Plan:');
    console.log(JSON.stringify(plan, null, 2));

    // Execute plan
    console.log('\nExecuting plan...');
    const results = await orchestrator.executePlan(plan);

    console.log('\nExecution Results:');
    console.log(JSON.stringify(results, null, 2));

    const summary = orchestrator.getSummary();
    console.log('\n=== Summary ===');
    console.log(`Total invocations: ${summary.total_invocations}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Total duration: ${summary.total_duration_ms}ms`);
    console.log(`Skills: ${summary.skills_invoked.join(', ')}`);
    console.log('=================\n');
  }).catch(error => {
    console.error('Orchestrator failed:', error.message);
    process.exit(1);
  });
}
