# Task Command Integration

Reference documentation for how spec-creator integrates with the /task command workflow.

---

## Overview

The spec-creator skill creates task specifications that are executed by the `/task` command via the task-executor skill. This document describes the integration points and workflow between spec creation and task execution.

---

## Command Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  /spec       │    │  specs/      │    │  /task       │
│  Command     │    │  Directory   │    │  Command     │
│              │    │              │    │              │
│ • Interview  │───►│ TASK-001.json │───►│ • Load spec  │
│ • Build spec │    │ TASK-002.json │    │ • Execute    │
│ • Decompose  │    │ ...           │    │ • Log all    │
│ • Output JSON│    │               │    │ • Complete   │
└──────────────┘    └──────────────┘    └──────────────┘
     │                    │                    │
     │                    │                    │
     ▼                    ▼                    ▼
  spec-creator        Storage            task-executor
  skill               Location           skill
```

---

## Spec File Location

Specs created by spec-creator are saved to:
```
specs/
  ├── TASK-001.json    # First task specification
  ├── TASK-002.json    # Second task specification
  └── TASK-003.json    # Third task specification
```

**Naming convention:**
- Format: `TASK-NNN.json` where NNN is 001, 002, 003, etc.
- Auto-incremented based on highest existing TASK-NNN
- Stored in project root `specs/` directory

---

## /task Command Invocation

### Primary Mode: Spec File Reference

```bash
/task specs/TASK-001.json
```

**What happens:**
1. task-executor loads the JSON file
2. Parses task specification
3. Analyzes context for skill orchestration
4. Executes subtasks respecting dependencies
5. Logs all activities in structured JSON
6. Updates knowledge graph
7. Updates documentation automatically
8. Presents completion summary for approval
9. Prompts for blog generation

### Alternative Mode: Natural Language Prompt

```bash
/task "Implement user authentication with email and password"
```

**What happens:**
1. task-executor parses the NLP prompt
2. Infers requirements from prompt
3. Builds minimal task specification
4. Executes with inferred context
5. Same logging and knowledge capture as primary mode

**Note:** Spec file reference is preferred for complex tasks with clear requirements.

---

## Integration Points

### 1. Spec Output → Task Input

**spec-creator outputs:**
```json
{
  "task": {
    "id": "TASK-001",
    "title": "...",
    "spec": { ... },
    "subtasks": [ ... ],
    "orchestration": { ... }
  }
}
```

**task-executor expects:**
- Same JSON structure
- Valid schema (validated before execution)
- All required fields present

### 2. Task Decomposition → Subtask Execution

**spec-creator decomposes:**
- Complex work into independent subtasks
- Defines dependencies between subtasks
- Estimates effort per subtask (5-30 min ideal)

**task-executor executes:**
- Subtasks in dependency order
- Parallel where dependencies allow
- Sequential for dependent tasks
- Reports completion status per subtask

### 3. Spec Success Criteria → Task Validation

**spec-creator defines:**
- Measurable success criteria
- Clear completion conditions
- Acceptance criteria

**task-executor validates:**
- Tests pass against success criteria
- All subtasks complete successfully
- User approves completion

---

## Task Execution Output

After `/task` command completes, the following structure is created:

```
tasks/TASK-001/
  ├── spec.json              # Copy of input specification
  ├── logs/                  # Structured JSON logs
  │   ├── decisions.json     # Decisions and trade-offs
  │   ├── issues.json        # Issues and resolutions
  │   ├── tests.json         # TDD test results
  │   └── changes.json       # Codebase changes
  ├── knowledge/             # Knowledge graph entries
  │   ├── metadata.json      # Execution metadata
  │   ├── decisions.json     # Technical decisions
  │   ├── learnings.json     # Lessons learned
  │   ├── patterns.json      # Patterns applied
  │   └── anti-patterns.json # Anti-patterns avoided
  ├── docs/                  # Documentation updates
  │   ├── changelog.md       # Changelog entry
  │   ├── dev-notes.md       # Developer notes
  │   └── README-updates.md  # README changes
  └── summary.md             # Human-readable summary
```

---

## Workflow Sequence

### Complete Workflow

1. **User invokes /spec:**
   ```
   /spec create user authentication feature
   ```

2. **spec-creator conducts interview:**
   - 6 questions asked one at a time
   - Answers captured incrementally
   - Spec built section by section
   - User approves each section

3. **spec-creator decomposes into subtasks:**
   - Task boundaries identified
   - Dependencies determined
   - Effort estimated
   - Subtasks ordered logically

4. **spec-creator generates spec file:**
   ```
   specs/TASK-001.json created
   ```

5. **User invokes /task:**
   ```
   /task specs/TASK-001.json
   ```

6. **task-executor loads and parses spec:**
   - Validates JSON schema
   - Extracts task metadata
   - Plans skill orchestration

7. **task-executor executes subtasks:**
   - Invokes required skills
   - Runs TDD workflow
   - Handles errors with auto-retry
   - Logs all activities

8. **task-executor completes:**
   - Writes structured logs
   - Updates knowledge graph
   - Updates documentation
   - Presents summary for approval

9. **User approves completion:**
   - Reviews summary
   - Confirms success
   - Optionally generates blog article

---

## Error Handling Integration

### When Spec is Invalid

**task-executor detects:**
- Schema validation errors
- Missing required fields
- Invalid dependency references
- Circular dependencies

**Response:**
```
❌ Spec validation failed:
- Error 1: Missing required field 'success_criteria'
- Error 2: Subtask T3 references non-existent dependency T5

Please fix the spec file or re-run /spec to regenerate.
```

### When Execution Fails

**task-executor handles:**
- Skill invocation failures
- Test failures
- Resource errors
- Permission errors

**Logging:**
- All errors logged to `issues.json`
- Retry attempts recorded
- Fallback strategies noted
- Final status in summary.md

---

## Best Practices

### For Spec Creation

1. **Be specific in success criteria:**
   - Measurable outcomes
   - Clear completion conditions
   - Testable requirements

2. **Keep subtasks independent:**
   - Minimal dependencies
   - Clear boundaries
   - Self-contained descriptions

3. **Estimate realistically:**
   - 5-30 minutes per subtask ideal
   - Account for testing time
   - Include documentation effort

### For Task Execution

1. **Review spec before executing:**
   - Verify all fields present
   - Check dependencies correct
   - Confirm success criteria clear

2. **Monitor execution progress:**
   - Watch for skill invocation errors
   - Check test results
   - Review logs as they're written

3. **Approve thoughtfully:**
   - Review completion summary
   - Verify success criteria met
   - Check logs for issues

---

## Related Documentation

- `task-specification-schema.md` - JSON schema for task specs
- `task-execution-workflow.md` - Complete execution workflow
- See `task-executor` skill references for execution details

---

## Usage

This integration reference is used by:
- **spec-creator skill**: To understand how specs are consumed
- **task-executor skill**: To understand spec structure
- **Users**: To understand end-to-end workflow
- **Documentation**: To explain system architecture

**Output location:** `specs/TASK-XXX.json` → execution → `tasks/TASK-XXX/`
