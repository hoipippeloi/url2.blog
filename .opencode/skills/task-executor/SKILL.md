---
name: task-executor
description: Execute tasks from structured JSON specifications with intelligent skill orchestration, comprehensive logging, and knowledge graph updates. Use this skill when you need to execute tasks from spec files via /task command, run task specifications with full automation and logging, or implement the /task command workflow from brainstorming.md with TDD enforcement, skill orchestration, and knowledge capture. Always use this skill after /spec creates a task specification to execute the work end-to-end.
---

# Task Executor Skill

## Rule A: Goals

This skill enables:
- **Execute tasks from structured JSON specifications**: Load and parse task specs from `specs/TASK-XXX.json` or NLP prompts
- **Intelligent skill orchestration**: Analyze task context and dynamically invoke required skills (tdd-workflow, svelte5-best-practices, codebase-context, etc.)
- **Comprehensive structured logging**: Write all decisions, issues, tests, and changes to JSON files (decisions.json, issues.json, tests.json, changes.json)
- **Knowledge graph updates**: Create modular knowledge files (metadata.json, decisions.json, learnings.json, patterns.json, anti-patterns.json)
- **Automatic documentation updates**: Update CHANGELOG.md, README.md (if new feature), docs/ (if user-facing), dev-notes.md (if complex)
- **User approval workflow**: Present completion summary and request approval before updating status
- **Blog generation prompt**: Prompt user for blog article generation after task completion
- **Human-readable summaries**: Generate summary.md with complete task execution overview

## Rule B: Acceptance Criteria

1. **Task Execution Complete**: All subtasks from spec executed successfully with tests passing (TDD workflow enforced)

2. **Structured Logs Written**: All four JSON log files created with valid schemas (decisions.json, issues.json, tests.json, changes.json)

3. **Knowledge Graph Updated**: All five modular knowledge files created (metadata.json, decisions.json, learnings.json, patterns.json, anti-patterns.json)

4. **Documentation Updated**: CHANGELOG.md updated, README/docs/dev-notes updated as appropriate based on task type

5. **User Approval Obtained**: User explicitly approves task completion after reviewing summary before status update

6. **Output Structure Correct**: Task output directory matches brainstorming.md specification (`tasks/TASK-XXX/logs/, knowledge/, docs/, summary.md`)

## Rule C: Decision Management

### Skill Selection Logic

**Always invoke:**
- `tdd-workflow` - For any coding task (mandatory)

**Invoke when frontend work:**
- `svelte5-best-practices` - When .svelte files involved
- `sveltekit-svelte5-tailwind-skill` - When full-stack SvelteKit work

**Invoke when large codebase:**
- `codebase-context` - When codebase is large or context needed

**Invoke when spec/task is complex:**
- `codebase-context` - When implementation details are complex and have lots of dependencies

**Invoke when documentation needed:**
- `documentation-generator` - When docs updates required

**Decision process:**
1. Analyze task spec for file types mentioned
2. Check codebase size (if known)
3. Determine if coding, testing, docs, or integration work
4. Invoke skills based on classification

### Error Handling Strategy

**Error Classification:**
- **Transient** (network, timeout) → Auto-retry 3x with exponential backoff
- **Logic error** (test failing) → Invoke tdd-workflow to fix
- **Missing resource** → Log error, continue with next task
- **Permission error** → Log error, continue
- **Skill invocation failure** → Retry once, log, try alternative approach

**Retry Logic:**
```
On error:
  1. Classify error type
  2. Retry up to 3 times (for transient errors)
  3. If still fails, try alternative approach
  4. Log error in issues.json
  5. Continue with next subtask
  6. Report all errors in final summary
```

### Execution Mode Decision

**Parallel execution when:**
- Subtasks have no dependencies between them
- Subtasks touch different files/systems
- Subtasks can run independently

**Sequential execution when:**
- Subtask B depends on Subtask A output
- Subtasks modify same files
- User explicitly requests sequential mode

**Decision rule:**
```
If subtask.depends_on is empty → Can run parallel
If subtask.depends_on has items → Must run after deps complete
```

### Documentation Update Decision

**Update CHANGELOG.md:**
- Always (every task makes some change)

**Update README.md:**
- When task adds new public feature
- When task changes public API
- When task adds new skill

**Update docs/ :**
- When task adds user-facing features
- When task changes user workflow

**Update dev-notes.md:**
- When task involves complex logic
- When task introduces new patterns
- When task has significant technical decisions

## Rule D: Triggers

**Trigger Description**: "Execute tasks from spec files with full automation, logging, and knowledge capture"

Use this skill when the user:
- Requests to "execute task", "run task", or "execute spec"
- Mentions "/task command", "TASK-XXX", or "task execution"
- Provides path to spec file (specs/TASK-XXX.json)
- Wants to execute work with TDD, logging, and knowledge updates
- Has completed /spec workflow and ready to execute
- References "specs/TASK-XXX.json" or task specification files

## Rule E: Steps, Tasks, and Checklists

### Step 1: Load Task Specification

1. **Action**: Check if input is file path or NLP prompt
2. **Why**: Support both invocation modes from brainstorming.md
3. **Output**: Parsed task specification object

**File path mode:**
```
Input: specs/TASK-001.json
Action: read_file specs/TASK-001.json
Parse: JSON → task object
```

**NLP prompt mode:**
```
Input: "Implement user auth with login/logout"
Action: Parse prompt, extract intent, build minimal spec
Parse: NLP → task object with inferred requirements
```

**Checklist:**
```
[ ] Input detected (file path or NLP)
[ ] Specification loaded
[ ] Task ID extracted (or generated for NLP)
[ ] Subtasks array parsed
[ ] Orchestration settings read
```

### Step 2: Analyze Task Context

1. **Action**: Use LLM to analyze task content, file types, requirements
2. **Why**: Determine which skills to invoke dynamically
3. **Output**: Ordered list of skills to invoke per subtask

**Analysis factors:**
- File types mentioned (.svelte, .ts, .md, etc.)
- Codebase size (if known from context)
- Task type (frontend, backend, testing, docs, integration)
- Skills mentioned in spec
- Requirements that need specific skills

**Checklist:**
```
[ ] Task type classified
[ ] File types identified
[ ] Required skills determined
[ ] Skill invocation order planned
[ ] Dependencies noted
```

### Step 3: Orchestrate Skills

1. **Action**: Invoke skills in dependency order based on analysis
2. **Why**: Execute subtasks with appropriate skills
3. **Output**: Skill execution results and artifacts

**Skill invocation:**
```
For each subtask:
  1. Determine required skills
  2. Invoke skill with subtask context
  3. Capture skill result
  4. Log skill usage
  5. Check for errors
  6. Handle errors (retry/fallback)
  7. Continue to next subtask
```

**Checklist:**
```
[ ] Skills invoked in correct order
[ ] Each skill executed with proper context
[ ] Results captured and logged
[ ] Errors handled appropriately
[ ] All subtasks completed
```

### Step 4: Execute Subtasks

1. **Action**: Execute each subtask respecting dependencies
2. **Why**: Complete all work from specification
3. **Output**: Completed work artifacts

**Execution rules:**
- Parallel where dependencies allow
- Sequential for dependent tasks
- TDD mandatory for all coding work
- Error handling with auto-retry (3x)
- Log all decisions, issues, tests, changes

**Checklist:**
```
[ ] T1 complete (directory structure)
[ ] T2 complete (SKILL.md)
[ ] T3 complete (README.md)
[ ] ... all subtasks complete
[ ] All tests passing
[ ] All artifacts created
```

### Step 5: Write Structured JSON Logs

1. **Action**: Write all logs to JSON files in tasks/TASK-XXX/logs/
2. **Why**: Machine-readable logging for knowledge graph and analysis
3. **Output**: decisions.json, issues.json, tests.json, changes.json

**Log files:**
```
tasks/TASK-001/
  logs/
    decisions.json      # Decisions and trade-offs made
    issues.json         # Issues encountered and resolutions
    tests.json          # TDD test results (RED-GREEN-REFACTOR cycles)
    changes.json        # Codebase changes for changelog
```

**Checklist:**
```
[ ] decisions.json created with valid schema
[ ] issues.json created with valid schema
[ ] tests.json created with valid schema
[ ] changes.json created with valid schema
[ ] All logs follow brainstorming.md schemas
```

### Step 6: Update Knowledge Graph

1. **Action**: Write modular knowledge files to tasks/TASK-XXX/knowledge/
2. **Why**: Capture learnings, patterns, decisions for future reference
3. **Output**: metadata.json, decisions.json, learnings.json, patterns.json, anti-patterns.json

**Knowledge files:**
```
tasks/TASK-001/
  knowledge/
    metadata.json       # Task execution metadata
    decisions.json      # Technical decisions made
    learnings.json      # Lessons learned
    patterns.json       # Code patterns applied
    anti-patterns.json  # Anti-patterns avoided
```

**Checklist:**
```
[ ] metadata.json created
[ ] decisions.json created
[ ] learnings.json created
[ ] patterns.json created
[ ] anti-patterns.json created
[ ] All files ready for later merging
```

### Step 7: Update Documentation

1. **Action**: Update documentation files automatically
2. **Why**: Keep docs in sync with code changes
3. **Output**: CHANGELOG.md, README-updates.md, dev-notes.md entries

**Documentation updates:**
```
Always:
  - CHANGELOG.md (add entry for this task)

If new feature:
  - README.md (update features section)
  - README-updates.md (document changes)

If user-facing:
  - docs/ (update user documentation)

If complex:
  - dev-notes.md (document technical decisions)
```

**Checklist:**
```
[ ] CHANGELOG.md updated
[ ] README.md updated (if new feature)
[ ] docs/ updated (if user-facing)
[ ] dev-notes.md updated (if complex)
```

### Step 8: Present Completion Summary

1. **Action**: Present task completion summary to user
2. **Why**: Enable user review and approval before status update
3. **Output**: User approval or feedback

**Summary format:**
```markdown
## Task TASK-XXX Complete

**Subtasks completed**: X/X
**Tests**: X passing
**Files modified**: X
**Duration**: X hours

**Skills invoked**:
- skill-name-1
- skill-name-2
...

**Logs written**:
- decisions.json
- issues.json
- tests.json
- changes.json

**Knowledge updated**:
- metadata.json
- decisions.json
- learnings.json
- patterns.json
- anti-patterns.json

**Docs updated**:
- CHANGELOG.md
- README.md (if applicable)
- dev-notes.md (if applicable)

---

Does this completion look correct? [yes/no/adjust]
```

**Checklist:**
```
[ ] Summary presented to user
[ ] User reviewed completion
[ ] User approved or provided feedback
[ ] Feedback incorporated if needed
```

### Step 9: Update Spec Status

1. **Action**: Update task status in spec after user approval
2. **Why**: Mark task as complete in system
3. **Output**: Updated spec with completion status

**Status update:**
```
After user approval:
  Mark task as complete in spec
  Update completion timestamp
  Set status: "completed"
```

**Checklist:**
```
[ ] User approval obtained
[ ] Status updated in spec
[ ] Completion timestamp recorded
```

### Step 10: Prompt for Blog Generation

1. **Action**: Prompt user for blog article generation
2. **Why**: Offer optional blog creation while context is fresh
3. **Output**: User decision (yes/no/maybe later)

**Prompt format:**
```
✅ Task TASK-001 completed successfully!

📝 Generate blog article about this task?
   This will capture problems solved and lessons learned.
   [yes] [no] [maybe later]
```

**If yes:**
- Invoke blog-generator skill
- Pass task logs and knowledge
- Generate blog/YYY-MM-DD-title.md

**Checklist:**
```
[ ] Blog prompt presented
[ ] User response captured
[ ] Blog generated if yes (or scheduled for later)
```

### Step 11: Generate Summary.md

1. **Action**: Write human-readable summary to tasks/TASK-XXX/summary.md
2. **Why**: Provide accessible overview of task execution
3. **Output**: summary.md file

**Summary structure:**
```markdown
# Task TASK-XXX: {Title}

## Overview
Brief summary of what was accomplished.

## Subtasks Completed
List of all subtasks with completion status.

## Skills Used
List of skills invoked and their purposes.

## Test Results
Summary of TDD cycles and test outcomes.

## Changes Made
Summary of files modified and key changes.

## Decisions Made
Key technical decisions and trade-offs.

## Lessons Learned
Key takeaways for future tasks.

## Output Files
- logs/decisions.json
- logs/issues.json
- logs/tests.json
- logs/changes.json
- knowledge/*.json
- docs/*
```

**Checklist:**
```
[ ] summary.md created
[ ] All sections included
[ ] Human-readable format
[ ] References to log files included
```

## Rule F: Human Interaction

### When to Request Human Approval

**Required before:**
- Updating task status in spec
- Making destructive changes (delete files, drop tables)
- Modifying production systems or data
- Proceeding after errors that need human judgment

**Request format:**
```
I'm about to {action} which will {consequence}.
Task: {task-id}
Files: {files-affected}
Please confirm: [yes/no/adjust]
```

### When to Request Human Advice

**Recommended for:**
- Unclear task dependencies or ordering
- Ambiguous success criteria
- Multiple valid skill invocation approaches
- Error handling decisions (retry vs abort)

**Request format:**
```
I encountered {situation} with options:

Option A: {description, pros/cons}
Option B: {description, pros/cons}

Which approach should I take?
```

### When to Request Human Feedback

**Required after:**
- Presenting completion summary
- All subtasks completed
- Error handling completed
- Documentation updates completed

**Request format:**
```
I completed {task-id} with:
- Subtasks: X/X complete
- Tests: X passing
- Files: X modified
- Duration: X hours

Does this meet your expectations? [yes/no/adjust]
```

## Rule G: Permissions

**Required:**
- File system read access to `specs/` directory
- File system write access to `tasks/` directory
- Write access to project root for documentation updates (CHANGELOG.md, README.md)
- Read access to existing skills for invocation

**Scope:**
- Can read files in `specs/` directory
- Can create/modify files in `tasks/` directory
- Can update documentation files (CHANGELOG.md, README.md, docs/, dev-notes.md)
- Can invoke existing skills from skills/ directory
- Cannot access sensitive configuration or system files
- Cannot execute arbitrary shell commands without approval

## Rule H: Tool Usage

**Required Tools:**
- `read_file` - Read task specifications from specs/
- `edit_file` or `create_file` - Write logs, knowledge, docs, summary
- `list_directory` or `glob` - Scan directories for existing files
- `grep` - Search for patterns in codebase
- `terminal` - Run tests, commands as needed (with approval)

**Command Patterns:**
```bash
# Read spec file
read_file specs/TASK-001.json

# Create log file
create_file tasks/TASK-001/logs/decisions.json

# Run tests
terminal -c "npm test"

# List directory
list_directory tasks/
```

**Tool Call Sequence:**
1. Use `read_file` to load spec from specs/TASK-XXX.json
2. Use `list_directory` to check existing task outputs
3. Execute subtasks (may invoke skills, run terminal commands)
4. Use `create_file` to write all log files
5. Use `create_file` to write all knowledge files
6. Use `edit_file` to update documentation
7. Use `create_file` to write summary.md

## Rule I: Format and Structure

This skill follows agent-friendly markdown format:

```markdown
# Task Executor Skill
## Rule A: Goals
## Rule B: Acceptance Criteria
## Rule C: Decision Management
## Rule D: Triggers
## Rule E: Steps, Tasks, and Checklists
## Rule F: Human Interaction
## Rule G: Permissions
## Rule H: Tool Usage
## Rule J: README Documentation (see README.md)
## Limits
```

**Content Guidelines:**
- ✅ Numbered steps for sequences
- ✅ Bullets for lists
- ✅ Code blocks for commands and examples
- ✅ Decision trees using if/then format
- ❌ NO intros, fluff, or embedded large docs

## Rule J: README Documentation

See `README.md` in this skill directory for:
- Installation instructions
- Features overview
- When to use this skill
- Usage examples with /task command
- Integration with /spec command

## Limits

### What This Skill Does Not Cover

- **Spec creation**: Does not create task specs (use `spec-creator` skill)
- **Blog generation**: Does not generate blog articles (use `blog-generator` skill when available)
- **Initial setup**: Does not create specs/ or tasks/ directories (run once manually)
- **Skill creation**: Does not create new skills (use `skill-creator` skill)

### Anti-Use Cases

Do NOT use this skill for:
- Tasks without specifications (create spec first with /spec)
- Simple one-command tasks (run directly instead)
- Exploratory work without clear goals (use discovery workflow first)
- Tasks not intended for structured execution with logging

### Resource Requirements

- **specs/ directory**: Must exist with task specification files
- **tasks/ directory**: Must exist for output storage
- **skills/ directory**: Must have required skills available
- **Documentation files**: CHANGELOG.md, README.md should exist

## References

*For complete JSON schemas, see `references/schemas.md`*
*For execution workflow, see `references/execution-workflow.md`*
*For skill orchestration logic, see `references/skill-orchestration.md`*
*For knowledge graph updates, see `references/knowledge-update.md`*
*For documentation updates, see `references/documentation-update.md`*
*For error handling strategies, see `references/error-handling.md`*
