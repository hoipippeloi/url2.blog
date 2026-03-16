#!/usr/bin/env node

/**
 * User Approval and Blog Prompt Workflow
 *
 * Handles completion summary presentation, user approval gates,
 * and blog generation prompts after task execution.
 *
 * Usage:
 *   const approval = require('./scripts/approval-workflow');
 *   const workflow = new ApprovalWorkflow(taskId, summary);
 *   await workflow.presentSummary();
 *   const approved = await workflow.requestApproval();
 *   if (approved) {
 *     await workflow.promptBlog();
 *     workflow.generateSummary();
 *   }
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ApprovalWorkflow {
  constructor(taskId, executionSummary = null) {
    this.taskId = taskId;
    this.executionSummary = executionSummary || {};
    this.tasksDir = path.join(process.cwd(), 'tasks', taskId);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Set execution summary data
   *
   * @param {Object} summary - Execution summary
   * @param {number} summary.subtasks_completed - Number of subtasks completed
   * @param {number} summary.subtasks_total - Total subtasks
   * @param {number} summary.tests_passing - Tests passing
   * @param {number} summary.tests_total - Total tests
   * @param {number} summary.files_modified - Files modified
   * @param {number} summary.duration_minutes - Execution duration
   * @param {Array<string>} summary.skills_invoked - Skills that were invoked
   * @param {Object} summary.logs - Log file information
   * @param {Object} summary.knowledge - Knowledge graph information
   * @param {Object} summary.docs - Documentation updates
   */
  setSummary(summary) {
    this.executionSummary = summary;
    console.log('[Approval] Summary set for', this.taskId);
  }

  /**
   * Present completion summary to user
   *
   * @returns {Promise<string>} Formatted summary
   */
  async presentSummary() {
    const s = this.executionSummary;

    const summary = `
╔════════════════════════════════════════════════════════════════╗
║                    Task Completion Summary                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Task: ${this.taskId.padEnd(56)}║
║                                                                 ║
║  📊 Execution Stats:                                            ║
║  ────────────────────────────────────────────────────────────   ║
║  Subtasks completed: ${(s.subtasks_completed || 0).toString().padEnd(4)} / ${(s.subtasks_total || 0).toString().padEnd(3)}                              ║
║  Tests passing:      ${(s.tests_passing || 0).toString().padEnd(4)} / ${(s.tests_total || 0).toString().padEnd(3)}                              ║
║  Files modified:     ${(s.files_modified || 0).toString().padEnd(4)}                                      ║
║  Duration:           ${(s.duration_minutes || 0).toString().padEnd(4)} minutes                                ║
║                                                                 ║
║  🛠️  Skills Invoked:                                            ║
║  ────────────────────────────────────────────────────────────   ║
${this.formatSkillsList(s.skills_invoked || [])}
║                                                                 ║
║  📝 Logs Written:                                               ║
║  ────────────────────────────────────────────────────────────   ║
║  ✓ decisions.json  - Technical decisions made                  ║
║  ✓ issues.json     - Issues encountered and resolved           ║
║  ✓ tests.json      - TDD test results (RED-GREEN-REFACTOR)     ║
║  ✓ changes.json    - Codebase changes for changelog            ║
║                                                                 ║
║  🧠 Knowledge Updated:                                          ║
║  ────────────────────────────────────────────────────────────   ║
║  ✓ metadata.json    - Task execution metadata                   ║
║  ✓ decisions.json   - Technical decisions                       ║
║  ✓ learnings.json   - Lessons learned                           ║
║  ✓ patterns.json    - Code patterns applied                     ║
║  ✓ anti-patterns.json - Anti-patterns avoided                   ║
║                                                                 ║
║  📄 Documentation Updated:                                      ║
║  ────────────────────────────────────────────────────────────   ║
${this.formatDocsList(s.docs || {})}
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
`;

    console.log(summary);
    return summary;
  }

  /**
   * Format skills list for display
   *
   * @param {Array<string>} skills - List of skill names
   * @returns {string} Formatted skills list
   */
  formatSkillsList(skills) {
    if (!skills || skills.length === 0) {
      return '║  (No skills invoked)'.padEnd(65) + '║\n';
    }

    return skills.slice(0, 5).map(skill => {
      const line = `║  • ${skill}`.padEnd(65);
      return line.substring(0, 64) + '║';
    }).join('\n') + (skills.length > 5 ? `\n║  ... and ${skills.length - 5} more`.padEnd(65) + '║' : '');
  }

  /**
   * Format documentation updates list for display
   *
   * @param {Object} docs - Documentation updates
   * @returns {string} Formatted docs list
   */
  formatDocsList(docs) {
    const lines = [];

    if (docs.changelog) {
      lines.push('║  ✓ CHANGELOG.md   - Task entry added'.padEnd(65) + '║');
    }
    if (docs.readme) {
      lines.push('║  ✓ README.md      - Skills/features updated'.padEnd(65) + '║');
    }
    if (docs.devNotes) {
      lines.push('║  ✓ dev-notes.md   - Technical decisions documented'.padEnd(65) + '║');
    }
    if (docs.userDocs && docs.userDocs.length > 0) {
      lines.push('║  ✓ docs/          - User documentation updated'.padEnd(65) + '║');
    }

    if (lines.length === 0) {
      lines.push('║  (No documentation updates)'.padEnd(65) + '║');
    }

    return lines.join('\n');
  }

  /**
   * Request user approval for task completion
   *
   * @returns {Promise<boolean>} User approval status
   */
  async requestApproval() {
    console.log('\n');
    console.log('═'.repeat(64));
    console.log('Does this completion look correct and complete?');
    console.log('═'.repeat(64));
    console.log('\n[yes] - Approve and complete task');
    console.log('[no]   - Report issues or request fixes');
    console.log('[adjust] - Make adjustments before completing\n');

    return new Promise((resolve) => {
      const askApproval = () => {
        this.rl.question('Your response: ', (answer) => {
          const normalized = answer.toLowerCase().trim();

          if (normalized === 'yes' || normalized === 'y') {
            console.log('\n✅ Task approval granted!\n');
            resolve(true);
          } else if (normalized === 'no' || normalized === 'n') {
            console.log('\n❌ Task approval denied.\n');
            console.log('Please describe the issues that need to be addressed:\n');
            this.rl.question('Issues: ', (issueDescription) => {
              console.log('\n📝 Issues recorded:', issueDescription);
              console.log('Task will remain in "pending_fixes" status.\n');
              resolve(false);
            });
          } else if (normalized === 'adjust' || normalized === 'a') {
            console.log('\n🔧 Adjustment mode selected.\n');
            console.log('What adjustments would you like to make?\n');
            this.rl.question('Adjustments: ', (adjustmentDescription) => {
              console.log('\n📝 Adjustments recorded:', adjustmentDescription);
              console.log('Task will remain in "pending_adjustments" status.\n');
              resolve(false);
            });
          } else {
            console.log('\n⚠️  Please respond with "yes", "no", or "adjust".\n');
            askApproval();
          }
        });
      };

      askApproval();
    });
  }

  /**
   * Prompt user for blog article generation
   *
   * @returns {Promise<string>} User response: 'yes', 'no', or 'later'
   */
  async promptBlog() {
    console.log('\n');
    console.log('═'.repeat(64));
    console.log('📝 Generate blog article about this task?');
    console.log('═'.repeat(64));
    console.log('\nThis will capture problems solved and lessons learned.');
    console.log('The article will be saved to blog/YYYY-MM-DD-task-title.md\n');
    console.log('[yes] - Generate blog article now');
    console.log('[no]   - Skip blog generation');
    console.log('[later] - Generate blog article later\n');

    return new Promise((resolve) => {
      this.rl.question('Your response: ', (answer) => {
        const normalized = answer.toLowerCase().trim();

        if (normalized === 'yes' || normalized === 'y') {
          console.log('\n✅ Blog generation initiated!\n');
          resolve('yes');
        } else if (normalized === 'no' || normalized === 'n') {
          console.log('\n⏭️  Blog generation skipped.\n');
          resolve('no');
        } else if (normalized === 'later' || normalized === 'l') {
          console.log('\n⏰ Blog generation scheduled for later.\n');
          console.log('You can generate the blog later with:');
          console.log(`  /blog ${this.taskId}\n`);
          resolve('later');
        } else {
          console.log('\n⚠️  Please respond with "yes", "no", or "later".\n');
          this.promptBlog().then(resolve);
        }
      });
    });
  }

  /**
   * Generate human-readable summary.md file
   *
   * @returns {boolean} Success status
   */
  generateSummary() {
    try {
      const s = this.executionSummary;
      const summaryDir = path.join(this.tasksDir);

      if (!fs.existsSync(summaryDir)) {
        fs.mkdirSync(summaryDir, { recursive: true });
      }

      const summaryPath = path.join(summaryDir, 'summary.md');
      const date = new Date().toISOString().split('T')[0];

      let content = `# Task ${this.taskId}: ${s.title || 'Task Execution Summary'}\n\n`;
      content += `**Generated:** ${date}\n\n`;

      content += `## Overview\n\n`;
      content += `${s.overview || `Task ${this.taskId} was executed with ${s.subtasks_completed || 0}/${s.subtasks_total || 0} subtasks completed successfully.`}\n\n`;

      content += `## Execution Statistics\n\n`;
      content += `| Metric | Value |\n`;
      content += `|--------|-------|\n`;
      content += `| Subtasks Completed | ${s.subtasks_completed || 0}/${s.subtasks_total || 0} |\n`;
      content += `| Tests Passing | ${s.tests_passing || 0}/${s.tests_total || 0} |\n`;
      content += `| Files Modified | ${s.files_modified || 0} |\n`;
      content += `| Duration | ${s.duration_minutes || 0} minutes |\n`;
      content += `| Status | ${s.success ? '✅ Success' : '⚠️ Partial'} |\n\n`;

      content += `## Skills Used\n\n`;
      if (s.skills_invoked && s.skills_invoked.length > 0) {
        s.skills_invoked.forEach((skill, index) => {
          content += `${index + 1}. **${skill}**\n`;
        });
      } else {
        content += `(No skills invoked)\n`;
      }
      content += '\n';

      content += `## Test Results\n\n`;
      content += `- Tests Written: ${s.tests_written || s.tests_total || 0}\n`;
      content += `- Tests Passing: ${s.tests_passing || 0}\n`;
      content += `- Tests Failing: ${(s.tests_total || 0) - (s.tests_passing || 0)}\n`;
      content += `- Success Rate: ${s.tests_total > 0 ? Math.round((s.tests_passing / s.tests_total) * 100) : 0}%\n\n`;

      content += `## Changes Made\n\n`;
      if (s.files_changed && s.files_changed.length > 0) {
        s.files_changed.forEach((file, index) => {
          content += `${index + 1}. \`${file.path}\` - ${file.type} - ${file.description || ''}\n`;
        });
      } else {
        content += `(No file changes recorded)\n`;
      }
      content += '\n';

      content += `## Decisions Made\n\n`;
      if (s.decisions && s.decisions.length > 0) {
        s.decisions.forEach((decision, index) => {
          content += `### Decision ${index + 1}: ${decision.context}\n\n`;
          content += `**Choice:** ${decision.choice}\n\n`;
          content += `**Rationale:** ${decision.rationale}\n\n`;
        });
      } else {
        content += `(No decisions recorded)\n`;
      }
      content += '\n';

      content += `## Lessons Learned\n\n`;
      if (s.learnings && s.learnings.length > 0) {
        s.learnings.forEach((learning, index) => {
          content += `${index + 1}. ${learning.description}\n`;
          content += `   - Category: ${learning.category}\n`;
          content += `   - Applicability: ${learning.applicability}\n\n`;
        });
      } else {
        content += `(No lessons recorded)\n`;
      }
      content += '\n';

      content += `## Output Files\n\n`;
      content += `### Logs\n\n`;
      content += `- \`tasks/${this.taskId}/logs/decisions.json\` - Technical decisions\n`;
      content += `- \`tasks/${this.taskId}/logs/issues.json\` - Issues encountered\n`;
      content += `- \`tasks/${this.taskId}/logs/tests.json\` - TDD test results\n`;
      content += `- \`tasks/${this.taskId}/logs/changes.json\` - Codebase changes\n\n`;

      content += `### Knowledge Graph\n\n`;
      content += `- \`tasks/${this.taskId}/knowledge/metadata.json\` - Execution metadata\n`;
      content += `- \`tasks/${this.taskId}/knowledge/decisions.json\` - Technical decisions\n`;
      content += `- \`tasks/${this.taskId}/knowledge/learnings.json\` - Lessons learned\n`;
      content += `- \`tasks/${this.taskId}/knowledge/patterns.json\` - Patterns applied\n`;
      content += `- \`tasks/${this.taskId}/knowledge/anti-patterns.json\` - Anti-patterns avoided\n\n`;

      content += `### Documentation\n\n`;
      content += `- \`CHANGELOG.md\` - Updated with task entry\n`;
      if (s.docs && s.docs.readme) {
        content += `- \`README.md\` - Updated with new features/skills\n`;
      }
      if (s.docs && s.docs.devNotes) {
        content += `- \`dev-notes.md\` - Updated with technical decisions\n`;
      }
      content += '\n';

      content += `---\n\n`;
      content += `*Summary generated by task-executor skill*\n`;

      fs.writeFileSync(summaryPath, content);
      console.log('[Approval] Summary saved to:', summaryPath);
      return true;
    } catch (error) {
      console.error('[Approval] Failed to generate summary:', error.message);
      return false;
    }
  }

  /**
   * Close readline interface
   */
  close() {
    this.rl.close();
  }

  /**
   * Execute complete approval workflow
   *
   * @returns {Promise<Object>} Workflow results
   */
  async execute() {
    const results = {
      taskId: this.taskId,
      summaryPresented: false,
      approved: false,
      blogRequested: null,
      summaryGenerated: false
    };

    try {
      // Present summary
      await this.presentSummary();
      results.summaryPresented = true;

      // Request approval
      results.approved = await this.requestApproval();

      if (!results.approved) {
        console.log('[Approval] Task not approved, skipping blog prompt and summary generation.');
        this.close();
        return results;
      }

      // Prompt for blog
      results.blogRequested = await this.promptBlog();

      // Generate summary.md
      this.generateSummary();
      results.summaryGenerated = true;

      this.close();

      console.log('[Approval] Approval workflow completed successfully.');
      return results;
    } catch (error) {
      console.error('[Approval] Workflow failed:', error.message);
      this.close();
      throw error;
    }
  }
}

// Export for use in other modules
module.exports = { ApprovalWorkflow };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node approval-workflow.js <TASK-ID>');
    console.log('Example: node approval-workflow.js TASK-001');
    process.exit(1);
  }

  const taskId = args[0];

  console.log(`=== Approval Workflow Test for ${taskId} ===\n`);

  const workflow = new ApprovalWorkflow(taskId, {
    title: 'Spec Creator Skill Implementation',
    subtasks_completed: 12,
    subtasks_total: 12,
    tests_passing: 25,
    tests_total: 25,
    files_modified: 8,
    duration_minutes: 135,
    skills_invoked: [
      'tdd-workflow',
      'skill-creator',
      'codebase-context'
    ],
    decisions: [
      {
        context: 'Interview workflow design',
        choice: 'One question at a time',
        rationale: 'Prevents overwhelming users, allows incremental feedback'
      }
    ],
    learnings: [
      {
        description: 'Progressive disclosure improves user comprehension',
        category: 'process',
        applicability: 'All user-facing workflows'
      }
    ],
    files_changed: [
      { path: 'skills/spec-creator/SKILL.md', type: 'added', description: 'Main skill definition' },
      { path: 'skills/spec-creator/README.md', type: 'added', description: 'Installation and usage' },
      { path: 'README.md', type: 'modified', description: 'Added spec-creator to skills list' }
    ],
    docs: {
      changelog: true,
      readme: true,
      devNotes: true
    },
    success: true
  });

  workflow.execute().then(results => {
    console.log('\n=== Workflow Results ===');
    console.log('Task:', results.taskId);
    console.log('Summary Presented:', results.summaryPresented);
    console.log('Approved:', results.approved);
    console.log('Blog Requested:', results.blogRequested);
    console.log('Summary Generated:', results.summaryGenerated);
    console.log('======================\n');

    process.exit(results.approved ? 0 : 1);
  }).catch(error => {
    console.error('Workflow failed:', error.message);
    process.exit(1);
  });
}
