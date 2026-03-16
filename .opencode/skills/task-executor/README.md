# Task Executor

Execute tasks from structured JSON specifications with intelligent skill orchestration, comprehensive logging, and knowledge graph updates.

## Installation

Install via skills.sh CLI:
```bash
npx skills add creatuluw/agent-skills --skill task-executor
```

Or manually:
1. Copy the `skills/task-executor` directory to your skills folder
2. Ensure `SKILL.md` is in the root directory

## Features

- **Spec Loading** - Load task specifications from `specs/TASK-XXX.json` or parse NLP prompts as fallback
- **Intelligent Skill Orchestration** - Analyze task context and dynamically invoke required skills (tdd-workflow, svelte5-best-practices, codebase-context, etc.)
- **Structured JSON Logging** - Write all decisions, issues, tests, and changes to machine-readable JSON files
- **Knowledge Graph Updates** - Create modular knowledge files (metadata, decisions, learnings, patterns, anti-patterns) for later merging
- **Automatic Documentation** - Update CHANGELOG.md, README.md (if new feature), docs/ (if user-facing), dev-notes.md (if complex)
- **TDD Enforcement** - Mandatory test-driven development workflow for all coding tasks
- **Error Resilience** - Automatic retry (3x) with fallback strategies and error classification
- **Parallel Execution** - Execute subtasks in parallel where dependencies allow
- **User Approval Gates** - Present completion summary and request approval before updating status
- **Blog Generation Prompt** - Prompt user for blog article generation after task completion

## When to Use

Use this skill when:
- You need to execute tasks from spec files via `/task` command
- You want to run task specifications with full automation, logging, and knowledge capture
- You have completed `/spec` workflow and are ready to execute the work
- You need TDD enforcement, skill orchestration, and comprehensive logging
- You want to implement the `/task` command workflow from brainstorming.md

**Do NOT use for:**
- Tasks without specifications (create spec first with `/spec` command)
- Simple one-command tasks (run directly instead)
- Exploratory work without clear goals (use discovery workflow first)

## Usage

### Basic Usage

1. **Ensure spec exists:**
   ```bash
   # Create spec first using spec-creator skill
   /spec create user authentication feature
   # Output: specs/TASK-001.json
   ```

2. **Execute the task:**
   ```bash
   /task specs/TASK-001.json
   ```

3. **Review completion summary:**
   ```
   ✅ Task TASK-001 completed successfully!
   
   Subtasks completed: 12/12
   Tests passing: 25/25
   Files modified: 8
   Duration: 2h 15m
   
   📝 Generate blog article about this task?
      This will capture problems solved and lessons learned.
      [yes] [no] [maybe later]
   ```

### Invocation Modes

**Spec file reference (primary):**
```bash
/task specs/TASK-001.json
```

**Natural language prompt (fallback):**
```bash
/task "Implement user auth with login/logout using TDD"
```

### Output Structure

Task execution creates the following directory structure:
```
tasks/TASK-001/
  ├── spec.json              # Task specification (input)
  ├── logs/                  # Structured JSON logs
  │   ├── decisions.json     # Decisions and trade-offs
  │   ├── issues.json        # Issues encountered and resolutions
  │   ├── tests.json         # TDD test results
  │   └── changes.json       # Codebase changes for changelog
  ├── knowledge/             # Knowledge graph updates
  │   ├── metadata.json      # Task execution metadata
  │   ├── decisions.json     # Technical decisions
  │   ├── learnings.json     # Lessons learned
  │   ├── patterns.json      # Code patterns applied
  │   └── anti-patterns.json # Anti-patterns avoided
  ├── docs/                  # Documentation updates
  │   ├── changelog.md       # Changelog entries
  │   ├── dev-notes.md       # Developer notes
  │   └── README-updates.md  # README changes
  └── summary.md             # Human-readable summary
```

## Integration with Commands

The task-executor skill works with the task execution system commands:

1. **Create spec:** `/spec <goal>` → `specs/TASK-XXX.json`
2. **Execute task:** `/task specs/TASK-XXX.json` → runs task with logging, TDD, knowledge updates
3. **Optional blog:** Prompted at task completion → `blog/YYYY-MM-DD-title.md`

## Related Skills

- **spec-creator** - Create task specifications before execution
- **tdd-workflow** - Invoked automatically for all coding tasks
- **svelte5-best-practices** - Invoked when frontend work detected
- **codebase-context** - Invoked when large codebase context needed
- **skill-creator** - For creating new skills
- **blog-generator** - Generate blog articles from task logs (when created)

## References

This skill follows patterns from:
- `brainstorming.md` - Complete system design and JSON schemas
- `references/skill-rules.md` - 10 mandatory skill rules
- `references/task-rules.md` - Task execution requirements
- `references/schemas.md` - JSON schemas for logs and knowledge files

## Skill Structure

```
task-executor/
├── SKILL.md              # Skill definition (10 rules compliant)
├── README.md             # This file
└── references/           # Reference documentation
    └── schemas.md        # JSON schemas for validation
```

## Compliance

This skill follows all 10 mandatory rules (see `references/skill-rules.md`):
- Rule A: Goals ✓
- Rule B: Acceptance Criteria (6 criteria) ✓
- Rule C: Decision Management ✓
- Rule D: Triggers (natural language hook) ✓
- Rule E: Steps/Tasks/Checklists (11 steps) ✓
- Rule F: Human Interaction ✓
- Rule G: Permissions ✓
- Rule H: Tool Usage ✓
- Rule I: Format (agent-friendly) ✓
- Rule J: README Documentation ✓