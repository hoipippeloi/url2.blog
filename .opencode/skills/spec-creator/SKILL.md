---
name: spec-creator
description: Interactive spec creation and task decomposition for AI agent execution. Use when you need to create structured task specifications, break down complex work into manageable subtasks, plan implementation workflows, or prepare tasks for automated execution via /task command. Always use this skill before starting /task execution to ensure clear requirements and proper task structure.
---

# Spec Creator Skill

## Rule A: Goals

This skill enables:
- **Structured specification creation**: Transform vague requirements into precise, actionable task specifications
- **Interactive requirements gathering**: Use one-question-at-a-time interviews to capture complete context
- **Task decomposition**: Break complex work into independent, executable subtasks with clear dependencies
- **Machine-readable output**: Generate JSON specs compatible with `/task` command execution
- **Human approval gates**: Ensure specs are validated before execution begins

## Rule B: Acceptance Criteria

1. **Spec Validity**: Generated JSON conforms to task specification schema with all required fields (id, title, spec, subtasks, orchestration)

2. **Task Executability**: Each subtask is independently executable with clear description, dependencies, and estimated effort

3. **User Approval**: User explicitly approves spec structure, content, and task breakdown before JSON generation

4. **Context Completeness**: Spec includes sufficient context (description, requirements, constraints, success criteria) for autonomous agent execution

## Rule C: Decision Management

### Spec Granularity

**When to create new spec:**
- Work is independent from existing tasks
- Work requires fresh AI session context
- Work has distinct success criteria

**When to extend existing spec:**
- Work is continuation of previous task
- Requirements changed but core structure same
- User explicitly requests modification

### Task Decomposition

**Split task when:**
- Task requires multiple different skills
- Task would take >30 minutes for AI agent
- Task touches unrelated files or systems
- Task has multiple success criteria

**Combine tasks when:**
- Tasks are trivial (<2 minutes each)
- Tasks are tightly coupled (must be done together)
- Combining improves clarity or reduces redundancy

### Interview Depth

**Deep interview needed when:**
- Requirements are ambiguous or vague
- Work involves multiple systems or teams
- Success criteria are non-obvious
- Work has significant constraints or dependencies

**Light interview sufficient when:**
- Work is routine or follows established patterns
- Requirements are clear and specific
- User has provided detailed initial context

### Error Handling

**If user provides unclear answers:**
1. Rephrase question with concrete examples
2. Offer multiple-choice options
3. Ask for clarification on specific point only

**If scope keeps expanding:**
1. Suggest breaking into multiple specs
2. Define MVP scope for first spec
3. Create follow-up specs for additional work

## Rule D: Triggers

**Trigger Description**: "Create structured task specifications with interactive interviews and task breakdown"

Use this skill when the user:
- Requests to "create a spec", "write specification", or "define requirements"
- Mentions "break down into tasks", "decompose work", or "plan implementation"
- Wants to "prepare for /task", "create task JSON", or "structure work for agents"
- Has vague requirements that need clarification and structure
- Needs to create executable specs for AI agent workflows
- References "TASK-XXX", "task specification", or "implementation plan"

## Rule E: Steps, Tasks, and Checklists

### Step 1: Capture Intent

1. **Action**: Listen to user's high-level goal or request
2. **Why**: Establish initial context and scope boundary
3. **Output**: Store working title and one-sentence goal

**Checklist:**
```
[ ] Captured high-level goal in one sentence
[ ] Identified general domain (frontend, backend, testing, docs, etc.)
[ ] Noted any explicit constraints mentioned
[ ] Asked: "What's the overall goal or objective?"
```

### Step 2: Interview Loop (One Question at a Time)

1. **Action**: Ask clarifying questions sequentially (one at a time)
2. **Why**: Build complete context without overwhelming user
3. **Output**: Accumulated requirements and constraints

**Question Sequence:**
```
1. "What's the overall goal or objective of this work?"
   → Wait for answer, then acknowledge

2. "Are there any constraints or limitations I should know about?"
   → Wait for answer, then acknowledge

3. "What files, systems, or components will be involved?"
   → Wait for answer, then acknowledge

4. "What does success look like? How will we know it's done?"
   → Wait for answer, then acknowledge

5. "Are there any existing patterns or code I should follow?"
   → Wait for answer, then acknowledge

6. "What's the priority or urgency of this work?"
   → Wait for answer, then acknowledge
```

**Rules:**
- Ask ONE question at a time
- Wait for complete answer before next question
- Acknowledge each answer before proceeding
- If answer is unclear, rephrase or offer choices

### Step 3: Build Spec Incrementally

1. **Action**: Present spec sections incrementally (200-300 words each)
2. **Why**: Enable user review and catch misunderstandings early
3. **Output**: Approved spec sections

**Presentation Order:**
```
Section 1: Title & Description
  → Ask: "Does this title and description capture the goal?"

Section 2: Context & Background
  → Ask: "Is this context accurate and complete?"

Section 3: Requirements
  → Ask: "Are these requirements correct? Missing anything?"

Section 4: Constraints
  → Ask: "Are these constraints accurate?"

Section 5: Success Criteria
  → Ask: "Will these criteria confirm completion?"
```

**After each section:**
- Present 200-300 words maximum
- Ask: "Does this look right so far?"
- Incorporate feedback before next section

### Step 4: Decompose into Subtasks

1. **Action**: Break spec into independent, executable subtasks
2. **Why**: Enable parallel execution and clear progress tracking
3. **Output**: Ordered subtask list with dependencies

**Decomposition Process:**
```
1. Identify natural task boundaries
   - Different files or systems
   - Different skills required
   - Different success criteria

2. Determine dependencies
   - Which tasks must complete before others
   - Which tasks can run in parallel

3. Estimate effort per task
   - 5-30 minutes ideal per subtask
   - Adjust granularity accordingly

4. Order logically
   - Setup tasks first
   - Implementation tasks middle
   - Testing/verification tasks last
```

**Subtask Template:**
```json
{
  "id": "T1",
  "name": "Task name",
  "description": "Clear description of what to do",
  "depends_on": [],
  "estimated_minutes": 15
}
```

### Step 5: Present for Approval

1. **Action**: Present complete spec + subtasks for approval
2. **Why**: Ensure user validates before execution
3. **Output**: User approval or feedback

**Presentation Format:**
```markdown
## Task Specification Summary

**Title**: {title}
**Goal**: {one-sentence goal}

**Spec Sections**:
- Description: {summary}
- Context: {summary}
- Requirements: {count} items
- Constraints: {count} items
- Success Criteria: {count} items

**Subtasks**: {count} tasks
- T1: {name} ({estimated_minutes}min) - depends on: {deps}
- T2: {name} ({estimated_minutes}min) - depends on {deps}
...

**Orchestration**:
- Execution mode: parallel
- Error handling: auto-retry

---

Does this specification look correct and complete? [yes/no/adjust]
```

### Step 6: Generate JSON Output

1. **Action**: Write validated spec to specs/TASK-XXX.json
2. **Why**: Create machine-readable input for /task command
3. **Output**: Validated JSON file

**File Naming:**
```
Format: specs/TASK-{NNN}.json
Example: specs/TASK-001.json
         specs/TASK-002.json
```

**Auto-increment task ID:**
- Scan specs/ directory for highest TASK-NNN
- Increment by 1 for new spec

## Rule F: Human Interaction

### When to Request Human Approval

**Required before:**
- Generating final JSON spec file
- Proceeding to next spec section during interview
- Finalizing task decomposition
- Using default values for unspecified requirements

**Request format:**
```
I've drafted {section_name}:
{content summary}

Does this look right? [yes/no/adjust]
```

### When to Request Human Advice

**Recommended for:**
- Ambiguous requirements with multiple interpretations
- Unclear task dependencies or ordering
- Multiple valid decomposition approaches
- Choosing between sequential vs parallel execution

**Request format:**
```
I see two options for {situation}:

Option A: {description, pros/cons}
Option B: {description, pros/cons}

Which approach should I take?
```

### When to Request Human Feedback

**Required after:**
- Completing interview loop
- Presenting task decomposition
- Generating final spec structure

**Request format:**
```
I've completed {stage} with:
- {summary point 1}
- {summary point 2}

Does this meet your expectations? [yes/no/adjust]
```

## Rule G: Permissions

**Required:**
- File system read/write access to `specs/` directory
- Write access to create JSON files
- Read access to scan existing specs for ID increment

**Scope:**
- Can create files only in `specs/` directory
- Cannot modify files outside `specs/`
- Cannot access sensitive configuration or system files
- Cannot execute shell commands or install packages

## Rule H: Tool Usage

**Required Tools:**
- `read_file` - Examine existing specs for patterns and ID tracking
- `edit_file` or `create_file` - Write new spec JSON files
- `glob` or `list_directory` - Scan specs/ directory for existing TASK-NNN files

**Command Patterns:**
```bash
# Read existing spec patterns
read_file specs/TASK-001.json

# Scan for next task ID
list_directory specs/

# Create new spec file
edit_file -path specs/TASK-002.json -mode create
```

**Tool Call Sequence:**
1. Use `list_directory` or `glob` to scan specs/ for existing TASK-NNN files
2. Determine next task ID by incrementing highest found
3. Conduct interview loop (no tools needed, conversation only)
4. Build spec sections incrementally with user approval
5. Use `edit_file` to write validated spec JSON

## Rule I: Format and Structure

This skill follows agent-friendly markdown format:

```markdown
# Spec Creator Skill
## Rule A: Goals
## Rule B: Acceptance Criteria
## Rule C: Decision Management
## Rule D: Triggers
## Rule E: Steps, Tasks, and Checklists
## Rule F: Human Interaction
## Rule G: Permissions
## Rule H: Tool Usage
## Rule J: README Documentation (see README.md)
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
- Usage examples

## Limits

### What This Skill Does Not Cover

- **Task execution**: This skill creates specs, not executes them (use `/task` command)
- **Code implementation**: Does not write implementation code
- **Testing**: Does not run tests (use `tdd-workflow` skill during execution)
- **Documentation updates**: Does not update README, changelog, etc. (happens during `/task` execution)

### Anti-Use Cases

Do NOT use this skill for:
- Simple one-command tasks (run directly instead)
- Tasks already well-defined (skip to `/task` execution)
- Exploratory work without clear goals (use discovery workflow first)
- Tasks not intended for AI agent execution

## References

*For complete JSON schema, see `references/task-specification-schema.md`*
*For execution workflow, see `references/task-execution-workflow.md`*
*For integration with /task command, see `references/task-command-integration.md`*