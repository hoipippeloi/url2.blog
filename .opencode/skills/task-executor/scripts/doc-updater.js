#!/usr/bin/env node

/**
 * Documentation Auto-Updater Utility
 *
 * Automatically updates documentation files based on task execution.
 * Updates: CHANGELOG.md, README.md, docs/, dev-notes.md
 *
 * Usage:
 *   const docUpdater = require('./scripts/doc-updater');
 *   docUpdater.init();
 *   docUpdater.analyzeChanges(changes);
 *   docUpdater.updateChangelog({...});
 *   docUpdater.updateReadme({...});
 *   docUpdater.updateDevNotes({...});
 *   docUpdater.save();
 */

const fs = require('fs');
const path = require('path');

class DocUpdater {
  constructor() {
    this.projectRoot = process.cwd();
    this.changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    this.readmePath = path.join(this.projectRoot, 'README.md');
    this.devNotesPath = path.join(this.projectRoot, 'dev-notes.md');
    this.docsDir = path.join(this.projectRoot, 'docs');
    this.pendingUpdates = {
      changelog: [],
      readme: [],
      docs: [],
      devNotes: []
    };
    this.changes = [];
  }

  /**
   * Initialize documentation updater
   *
   * @returns {boolean} Success status
   */
  init() {
    try {
      console.log('[DocUpdater] Initialized for project:', this.projectRoot);
      return true;
    } catch (error) {
      console.error('[DocUpdater] Failed to initialize:', error.message);
      return false;
    }
  }

  /**
   * Analyze changes to determine what documentation needs updating
   *
   * @param {Array<Object>} changes - Array of change objects from logger
   */
  analyzeChanges(changes) {
    this.changes = changes;

    console.log('[DocUpdater] Analyzing', changes.length, 'changes...');

    // Determine update needs
    const hasNewFiles = changes.some(c => c.type === 'added');
    const hasSkillFiles = changes.some(c => c.file.includes('skills/'));
    const hasPublicFiles = changes.some(c =>
      c.file.includes('src/') || c.file.includes('public/') || c.file.includes('api/')
    );
    const hasComplexLogic = changes.some(c =>
      c.lines_changed?.added > 100 || c.description.includes('complex') || c.description.includes('pattern')
    );

    console.log('[DocUpdater] Analysis:', {
      hasNewFiles,
      hasSkillFiles,
      hasPublicFiles,
      hasComplexLogic
    });

    return {
      updateChangelog: true, // Always update changelog
      updateReadme: hasNewFiles || hasSkillFiles,
      updateDocs: hasPublicFiles,
      updateDevNotes: hasComplexLogic
    };
  }

  /**
   * Update CHANGELOG.md with task entry
   *
   * @param {Object} entry - Changelog entry
   * @param {string} entry.taskId - Task ID (TASK-XXX)
   * @param {string} entry.title - Task title
   * @param {Array<string>} entry.added - Items added
   * @param {Array<string>} entry.changed - Items changed
   * @param {Array<string>} entry.fixed - Items fixed
   * @param {Array<string>} entry.removed - Items removed
   * @param {Array<string>} entry.technical - Technical details
   * @returns {boolean} Success status
   */
  updateChangelog(entry) {
    try {
      const date = new Date().toISOString().split('T')[0];

      let changelogContent = '';

      // Read existing changelog or create new
      if (fs.existsSync(this.changelogPath)) {
        changelogContent = fs.readFileSync(this.changelogPath, 'utf8');
      } else {
        changelogContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
      }

      // Build new entry
      let newEntry = `## ${date} - ${entry.taskId}\n\n`;

      if (entry.title) {
        newEntry += `### ${entry.title}\n\n`;
      }

      if (entry.added && entry.added.length > 0) {
        newEntry += '### Added\n';
        entry.added.forEach(item => {
          newEntry += `- ${item}\n`;
        });
        newEntry += '\n';
      }

      if (entry.changed && entry.changed.length > 0) {
        newEntry += '### Changed\n';
        entry.changed.forEach(item => {
          newEntry += `- ${item}\n`;
        });
        newEntry += '\n';
      }

      if (entry.fixed && entry.fixed.length > 0) {
        newEntry += '### Fixed\n';
        entry.fixed.forEach(item => {
          newEntry += `- ${item}\n`;
        });
        newEntry += '\n';
      }

      if (entry.removed && entry.removed.length > 0) {
        newEntry += '### Removed\n';
        entry.removed.forEach(item => {
          newEntry += `- ${item}\n`;
        });
        newEntry += '\n';
      }

      if (entry.technical && entry.technical.length > 0) {
        newEntry += '### Technical\n';
        entry.technical.forEach(item => {
          newEntry += `- ${item}\n`;
        });
        newEntry += '\n';
      }

      // Insert after header
      const headerEnd = changelogContent.indexOf('\n', changelogContent.indexOf('# Changelog')) + 1;
      const insertPos = changelogContent.indexOf('\n', headerEnd) + 1;

      changelogContent = changelogContent.slice(0, insertPos) + '\n' + newEntry + changelogContent.slice(insertPos);

      fs.writeFileSync(this.changelogPath, changelogContent);
      console.log('[DocUpdater] CHANGELOG.md updated with', entry.taskId);

      this.pendingUpdates.changelog.push({ taskId: entry.taskId, date });
      return true;
    } catch (error) {
      console.error('[DocUpdater] Failed to update CHANGELOG.md:', error.message);
      return false;
    }
  }

  /**
   * Update README.md with new skill or feature
   *
   * @param {Object} entry - README entry
   * @param {string} entry.type - 'skill' or 'feature'
   * @param {string} entry.name - Skill or feature name
   * @param {string} entry.description - Description
   * @param {string} [entry.installation] - Installation command (for skills)
   * @returns {boolean} Success status
   */
  updateReadme(entry) {
    try {
      if (!fs.existsSync(this.readmePath)) {
        console.log('[DocUpdater] README.md not found, skipping update');
        return false;
      }

      let readmeContent = fs.readFileSync(this.readmePath, 'utf8');

      if (entry.type === 'skill') {
        // Find skills list section and add new skill
        const skillsSectionPattern = /(#### Skills in this repository:.*?)(\n\n|\n###|\n##)/s;
        const skillEntry = `\n- **${entry.name}** - ${entry.description}\n`;

        if (skillsSectionPattern.test(readmeContent)) {
          readmeContent = readmeContent.replace(
            skillsSectionPattern,
            `$1${skillEntry}$2`
          );
        } else {
          console.log('[DocUpdater] Skills section not found, appending to end');
          readmeContent += `\n\n#### Skills in this repository:\n${skillEntry}`;
        }
      } else if (entry.type === 'feature') {
        // Find features section and add new feature
        const featuresSectionPattern = /(## Features.*?)(\n\n|\n###|\n##)/s;
        const featureEntry = `\n- **${entry.name}** - ${entry.description}\n`;

        if (featuresSectionPattern.test(readmeContent)) {
          readmeContent = readmeContent.replace(
            featuresSectionPattern,
            `$1${featureEntry}$2`
          );
        } else {
          console.log('[DocUpdater] Features section not found, appending to end');
          readmeContent += `\n\n## Features\n${featureEntry}`;
        }
      }

      fs.writeFileSync(this.readmePath, readmeContent);
      console.log('[DocUpdater] README.md updated with', entry.name);

      this.pendingUpdates.readme.push({ type: entry.type, name: entry.name });
      return true;
    } catch (error) {
      console.error('[DocUpdater] Failed to update README.md:', error.message);
      return false;
    }
  }

  /**
   * Update user documentation in docs/ directory
   *
   * @param {Object} entry - Docs entry
   * @param {string} entry.category - Category (user-guide, api, integration, config)
   * @param {string} entry.filename - Filename for the doc
   * @param {string} entry.title - Document title
   * @param {string} entry.content - Document content (markdown)
   * @returns {boolean} Success status
   */
  updateDocs(entry) {
    try {
      // Create docs directory if needed
      const categoryDir = path.join(this.docsDir, entry.category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      const docPath = path.join(categoryDir, entry.filename);

      let docContent = `# ${entry.title}\n\n`;
      docContent += `*Generated: ${new Date().toISOString().split('T')[0]}*\n\n`;
      docContent += entry.content;

      fs.writeFileSync(docPath, docContent);
      console.log('[DocUpdater] Documentation updated:', docPath);

      this.pendingUpdates.docs.push({ category: entry.category, filename: entry.filename });
      return true;
    } catch (error) {
      console.error('[DocUpdater] Failed to update docs:', error.message);
      return false;
    }
  }

  /**
   * Update dev-notes.md with technical decisions
   *
   * @param {Object} entry - Dev notes entry
   * @param {string} entry.taskId - Task ID
   * @param {string} entry.title - Technical topic title
   * @param {Array<Object>} entry.decisions - Technical decisions made
   * @param {Array<string>} entry.patterns - Patterns applied
   * @param {string} [entry.overview] - Overview of what was built
   * @returns {boolean} Success status
   */
  updateDevNotes(entry) {
    try {
      let devNotesContent = '';

      if (fs.existsSync(this.devNotesPath)) {
        devNotesContent = fs.readFileSync(this.devNotesPath, 'utf8');
      } else {
        devNotesContent = '# Developer Notes\n\nTechnical decisions, patterns, and architecture documentation.\n\n---\n\n';
      }

      // Build new entry
      let newEntry = `## ${entry.taskId}: ${entry.title}\n\n`;
      newEntry += `**Date**: ${new Date().toISOString().split('T')[0]}\n\n`;

      if (entry.overview) {
        newEntry += `### Overview\n\n${entry.overview}\n\n`;
      }

      if (entry.decisions && entry.decisions.length > 0) {
        newEntry += `### Technical Decisions\n\n`;
        entry.decisions.forEach((decision, index) => {
          newEntry += `#### Decision ${index + 1}: ${decision.context}\n`;
          newEntry += `**Choice**: ${decision.choice}\n\n`;
          newEntry += `**Rationale**: ${decision.rationale}\n\n`;
          if (decision.alternatives && decision.alternatives.length > 0) {
            newEntry += `**Alternatives considered**: ${decision.alternatives.join(', ')}\n\n`;
          }
          if (decision.trade_offs && decision.trade_offs.length > 0) {
            newEntry += `**Trade-offs**: ${decision.trade_offs.join(', ')}\n\n`;
          }
        });
      }

      if (entry.patterns && entry.patterns.length > 0) {
        newEntry += `### Patterns Applied\n\n`;
        entry.patterns.forEach(pattern => {
          newEntry += `- **${pattern.name}**: ${pattern.description}\n`;
        });
        newEntry += '\n';
      }

      newEntry += `---\n\n`;

      // Insert after header
      const headerEnd = devNotesContent.indexOf('\n', devNotesContent.indexOf('# Developer Notes')) + 1;
      const insertPos = devNotesContent.indexOf('\n', headerEnd) + 1;

      devNotesContent = devNotesContent.slice(0, insertPos) + newEntry + devNotesContent.slice(insertPos);

      fs.writeFileSync(this.devNotesPath, devNotesContent);
      console.log('[DocUpdater] dev-notes.md updated with', entry.taskId);

      this.pendingUpdates.devNotes.push({ taskId: entry.taskId, title: entry.title });
      return true;
    } catch (error) {
      console.error('[DocUpdater] Failed to update dev-notes.md:', error.message);
      return false;
    }
  }

  /**
   * Get summary of all documentation updates
   *
   * @returns {Object} Summary statistics
   */
  getSummary() {
    return {
      changelog_entries: this.pendingUpdates.changelog.length,
      readme_updates: this.pendingUpdates.readme.length,
      docs_updated: this.pendingUpdates.docs.length,
      devnotes_entries: this.pendingUpdates.devNotes.length,
      total_updates: this.pendingUpdates.changelog.length +
                     this.pendingUpdates.readme.length +
                     this.pendingUpdates.docs.length +
                     this.pendingUpdates.devNotes.length
    };
  }

  /**
   * Save all pending documentation updates
   * (Updates are saved immediately, this just confirms completion)
   *
   * @returns {boolean} Success status
   */
  save() {
    console.log('[DocUpdater] All documentation updates completed');
    console.log('[DocUpdater] Summary:', this.getSummary());
    return true;
  }
}

// Export for use in other modules
module.exports = { DocUpdater };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node doc-updater.js <TASK-ID>');
    console.log('Example: node doc-updater.js TASK-001');
    process.exit(1);
  }

  const taskId = args[0];
  const docUpdater = new DocUpdater();

  console.log(`=== Documentation Updater Test for ${taskId} ===\n`);

  // Initialize
  docUpdater.init();

  // Simulate changes
  const changes = [
    {
      file: 'skills/spec-creator/SKILL.md',
      type: 'added',
      description: 'Created spec-creator skill with 10 rules compliance',
      lines_changed: { added: 402, removed: 0 }
    },
    {
      file: 'skills/spec-creator/README.md',
      type: 'added',
      description: 'Created README with installation and usage',
      lines_changed: { added: 149, removed: 0 }
    },
    {
      file: 'README.md',
      type: 'modified',
      description: 'Updated skills list with spec-creator',
      lines_changed: { added: 5, removed: 0 }
    }
  ];

  // Analyze changes
  const needsUpdate = docUpdater.analyzeChanges(changes);
  console.log('\nDocumentation updates needed:', needsUpdate);

  // Update changelog
  docUpdater.updateChangelog({
    taskId: taskId,
    title: 'Spec Creator Skill',
    added: [
      'spec-creator skill with SKILL.md (10 rules compliant)',
      'spec-creator/README.md with installation and usage',
      'spec-creator/references/ with JSON schemas and workflows'
    ],
    changed: [
      'README.md skills list updated',
      'skills.json registered new skill'
    ],
    technical: [
      'Implements /spec command workflow',
      'Interview pattern with 6 questions',
      'Spec output to specs/TASK-XXX.json format'
    ]
  });

  // Update README (if skill)
  docUpdater.updateReadme({
    type: 'skill',
    name: 'spec-creator',
    description: 'Interactive spec creation and task decomposition for AI agent execution. Use when you need to create structured task specifications, break down complex work into manageable subtasks, plan implementation workflows, or prepare tasks for automated execution via /task command.',
    installation: 'npx skills add creatuluw/agent-skills --skill spec-creator'
  });

  // Update dev notes
  docUpdater.updateDevNotes({
    taskId: taskId,
    title: 'Spec Creator Skill Implementation',
    overview: 'Created the spec-creator skill following all 10 mandatory rules from skill-rules.md. The skill implements an interactive interview workflow for requirements gathering and task decomposition.',
    decisions: [
      {
        context: 'Interview workflow design',
        choice: 'One question at a time',
        rationale: 'Prevents overwhelming users, allows for incremental feedback',
        alternatives: ['All questions at once', 'Multi-part questions'],
        trade_offs: ['Longer interaction time', 'More back-and-forth']
      },
      {
        context: 'Spec section presentation',
        choice: '200-300 words per section',
        rationale: 'Balance between completeness and reviewability',
        alternatives: ['Full spec at once', '50 words per section'],
        trade_offs: ['More review cycles', 'Context switching']
      }
    ],
    patterns: [
      { name: 'Progressive Disclosure', description: 'Present information incrementally' },
      { name: 'Approval Gates', description: 'Require user approval before proceeding' },
      { name: '10 Rules Compliance', description: 'Follow all skill-rules.md requirements' }
    ]
  });

  // Save
  docUpdater.save();

  console.log('\n=== Documentation Update Complete ===\n');
}
