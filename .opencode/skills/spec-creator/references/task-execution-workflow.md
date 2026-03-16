# Task Execution Workflow

Reference workflow for how tasks are executed by the task-executor skill. This document describes the end-to-end task execution process that specs created by spec-creator will follow.

---

## Overview

The task execution workflow transforms structured task specifications into working implementations while maintaining rigorous logging, knowledge capture, and documentation updates.

---

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    /task Execution Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOAD                                                        │
│     └─► Load spec from file OR parse NLP prompt                 │
│                                                                  │
│  2. ANALYZE                                                     │
│     └─► LLM analyzes task context                               │
│         └─► Determine which skills to invoke                    │
│         └─► Identify file types, codebase size, requirements    │
│                                                                  │
│  3. ORCHESTRATE                                                 │
│     └─► Invoke skills in dependency order                       │
│         └─► tdd-workflow (always for coding)                    │
│         └─► svelte5-best-practices (if frontend)                │
│         └─► codebase-context (if large codebase)                │
│         └─► sveltekit-svelte5-tailwind-skill (if full-stack)    │
│                                                                  │
│  4. EXECUTE                                                     │
│     └─► Execute subtasks respecting dependencies                │
│         └─► Parallel where possible                             │
│         └─► Sequential for dependent tasks                      │
│                                                                  │
│  5. LOG                                                         │
│     └─► Write structured JSON logs                              │
│         └─► decisions.json                                      │
│         └─► issues.json                                         │
│         └─► tests.json                                          │
│         └─► changes.json                                        │
│                                                                  │
│  6. UPDATE                                                      │
│     └─► Automatic documentation updates                         │
│         └─► CHANGELOG.md                                        │
│         └─► README.md (if new feature)                          │
│         └─► docs/ (if user-facing change)                       │
│         └─► dev-notes.md (if complex logic)                     │
│                                                                  │
│  7. KNOWLEDGE                                                   │
│     └─► Update knowledge graph                                  │
│         └─► metadata.json                                       │
│         └─► decisions.json                                      │
│         └─► learnings.json                                      │
│         └─► patterns.json                                       │
│         └─► anti-patterns.json                                  │
│                                                                  │
│  8. COMPLETE                                                    │
│     └─► User approves task completion                           │
│         └─► Update spec/task status                             │
│         └─► Prompt: "Generate blog article?" [yes/no]           │
│         └─► Generate summary.md                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Load Specification

**Input modes:**

### File Reference Mode (Primary)
```
Input: specs/TASK-001.json
Action: read_file specs/TASK-001.json
Parse: JSON → task object
```

### NLP Prompt Mode (Fallback)
```
Input: "Implement user auth with login/logout"
Action: Parse prompt, extract intent, build minimal spec
Parse: NLP → task object with inferred requirements
```

**Validation checklist:**
```
[ ] Input detected (file path or NLP)
[ ] Specification loaded
[ ] Task ID extracted (or generated for NLP)
[ ] Subtasks array parsed
[ ] Orchestration settings read
```

---

## Step 2: Analyze Task Context

**Analysis factors:**
- File types mentioned (.svelte, .ts, .md, etc.)
- Codebase size (if known from context)
- Task type (frontend, backend, testing, docs, integration)
- Skills mentioned in spec
- Requirements that need specific skills

**Decision process:**
```
1. Classify task type from spec content
2. Identify file types involved
3. Determine codebase context needs
4. Map requirements to skill capabilities
5. Build skill invocation plan
```

**Output:** Ordered list of skills to invoke per subtask

---

## Step 3: Orchestrate Skills

**Skill invocation rules:**

### Mandatory Skills
| Skill | When Invoked |
|-------|--------------|
| tdd-workflow | Always for coding tasks |

### Conditional Skills
| Skill | Trigger Condition |
|-------|-------------------|
| svelte5-best-practices | .svelte files involved |
| sveltekit-svelte5-tailwind-skill | Full-stack SvelteKit work |
| codebase-context | Large codebase or context needed |

**Invocation process:**
```
For each subtask:
  1. Determine required skills from analysis
  2. Invoke skill with subtask context
  3. Capture skill result
  4. Log skill usage
  5. Check for errors
  6. Handle errors (retry/fallback)
  7. Continue to next subtask
```

---

## Step 4: Execute Subtasks

**Execution rules:**
- Parallel where dependencies allow
- Sequential for dependent tasks
- TDD mandatory for all coding work
- Error handling with auto-retry (3x)
- Log all decisions, issues, tests, changes

**Dependency resolution:**
```
If subtask.depends_on is empty → Can run parallel
If subtask.depends_on has items → Must run after deps complete
```

**Execution checklist:**
```
[ ] All subtasks completed
[ ] Dependencies respected
[ ] TDD workflow enforced for coding
[ ] Tests passing
[ ] Artifacts created
```

---

## Step 5: Write Structured JSON Logs

**Log files created:**
```
tasks/TASK-001/
  logs/
    decisions.json      # Decisions and trade-offs made
    issues.json         # Issues encountered and resolutions
    tests.json          # TDD test results (RED-GREEN-REFACTOR cycles)
    changes.json        # Codebase changes for changelog
```

**Log schemas:** See `task-specification-schema.md` for detailed JSON schemas

**Validation:**
```
[ ] decisions.json created with valid schema
[ ] issues.json created with valid schema
[ ] tests.json created with valid schema
[ ] changes.json created with valid schema
```

---

## Step 6: Update Documentation

**Automatic updates:**

| File | When Updated |
|------|--------------|
| CHANGELOG.md | Always (every task) |
| README.md | New public feature or API change |
| docs/ | User-facing feature changes |
| dev-notes.md | Complex logic or new patterns |

**Documentation checklist:**
```
[ ] CHANGELOG.md updated
[ ] README.md updated (if applicable)
[ ] docs/ updated (if applicable)
[ ] dev-notes.md updated (if applicable)
```

---

## Step 7: Update Knowledge Graph

**Knowledge files created:**
```
tasks/TASK-001/
  knowledge/
    metadata.json       # Task execution metadata
    decisions.json      # Technical decisions made
    learnings.json      # Lessons learned
    patterns.json       # Code patterns applied
    anti-patterns.json  # Anti-patterns avoided
```

**Modular design:** Each category in separate file for later merging

**Knowledge checklist:**
```
[ ] metadata.json created
[ ] decisions.json created
[ ] learnings.json created
[ ] patterns.json created
[ ] anti-patterns.json created
```

---

## Step 8: Complete & Approve

**Completion summary:**
```markdown
## Task TASK-XXX Complete

**Subtasks completed**: X/X
**Tests**: X passing
**Files modified**: X
**Duration**: X hours

**Skills invoked**: [list]
**Logs written**: [list]
**Knowledge updated**: [list]
**Docs updated**: [list]

---

Does this completion look correct? [yes/no/adjust]
```

**User approval flow:**
1. Present completion summary
2. User reviews and approves
3. Update task status in spec
4. Prompt for blog generation

**Blog prompt:**
```
✅ Task TASK-001 completed successfully!

📝 Generate blog article about this task?
   This will capture problems solved and lessons learned.
   [yes] [no] [maybe later]
```

---

## Error Handling

**Error classification:**
| Type | Handling |
|------|----------|
| Transient (network, timeout) | Auto-retry 3x with exponential backoff |
| Logic error (test failing) | Invoke tdd-workflow to fix |
| Missing resource | Log error, continue with next task |
| Permission error | Log error, continue |
| Skill invocation failure | Retry once, log, try alternative |

**Retry logic:**
```
On error:
  1. Classify error type
  2. Retry up to 3 times (for transient errors)
  3. If still fails, try alternative approach
  4. Log error in issues.json
  5. Continue with next subtask
  6. Report all errors in final summary
```

---

## Output Structure

**Complete output directory:**
```
tasks/TASK-001/
  ├── spec.json              # Task specification (input)
  ├── logs/                  # Structured JSON logs
  │   ├── decisions.json     # Decisions and trade-offs
  │   ├── issues.json        # Issues and resolutions
  │   ├── tests.json         # TDD test results
  │   └── changes.json       # Codebase changes
  ├── knowledge/             # Knowledge graph updates
  │   ├── metadata.json      # Execution metadata
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

---

## Spec Implications for spec-creator

When creating specs, ensure:

1. **Clear subtask boundaries** - Each subtask should be independently executable
2. **Explicit dependencies** - Define depends_on arrays correctly
3. **Realistic estimates** - 5-30 minutes per subtask ideal
4. **Testable success criteria** - Each subtask should have verifiable outcomes
5. **Skill requirements noted** - Mention if specific skills are needed
6. **Context completeness** - Provide enough context for autonomous execution

**Spec quality affects:**
- How well task-executor can analyze context
- Which skills get invoked
- How smoothly execution proceeds
- Quality of logs and knowledge captured

---

## Related Documents

- `task-specification-schema.md` - JSON schema for task specs
- `task-command-integration.md` - Integration with /task command
- `task-executor-references/schemas.md` - Log and knowledge schemas