# Spec Creator

Interactive specification creation and task decomposition for AI agent execution workflows.

## Installation

Install via skills.sh CLI:
```bash
npx skills add creatuluw/agent-skills --skill spec-creator
```

Or manually:
1. Copy the `skills/spec-creator` directory to your skills folder
2. Ensure `SKILL.md` is in the root directory

## Features

- **Interactive Interview Workflow** - One-question-at-a-time requirements gathering to build complete context
- **Incremental Spec Building** - Present spec sections (200-300 words) for user review and approval
- **Task Decomposition** - Break complex work into independent, executable subtasks with dependencies
- **Machine-Readable Output** - Generate JSON specs compatible with `/task` command execution
- **Human Approval Gates** - Ensure specs are validated before execution begins
- **Auto-ID Management** - Automatic task ID increment (TASK-001, TASK-002, etc.)

## When to Use

Use this skill when:
- You need to create structured task specifications for AI agent execution
- You want to break down complex work into manageable subtasks
- You're preparing tasks for automated execution via `/task` command
- You have vague requirements that need clarification and structure
- You need to plan implementation workflows with clear success criteria
- You want to ensure proper task structure before touching code

**Do NOT use for:**
- Simple one-command tasks (run directly instead)
- Tasks already well-defined (skip to `/task` execution)
- Exploratory work without clear goals

## Usage

### Basic Usage

1. **Invoke the skill:**
   ```
   /spec create user authentication feature
   ```

2. **Interview Phase:** Answer questions one at a time
   - "What's the overall goal?"
   - "Any constraints?"
   - "What files involved?"
   - "What does success look like?"

3. **Review Phase:** Approve each spec section
   - Title & Description
   - Context & Requirements
   - Constraints & Success Criteria

4. **Task Decomposition:** Review subtask breakdown
   - Task dependencies
   - Estimated effort per task
   - Execution order

5. **Output:** Spec saved to `specs/TASK-XXX.json`
   ```bash
   # Then execute via:
   /task specs/TASK-001.json
   ```

### Example Session

```
User: "I need to implement user login with email and password"

Spec Creator: "What's the overall goal or objective of this work?"

User: "Allow users to authenticate with email/password"

Spec Creator: "Are there any constraints or limitations?"

User: "Must use bcrypt for password hashing, JWT for sessions"

... (continues interview) ...

Spec Creator: "Here's the spec summary:

**Title**: User Email/Password Authentication
**Goal**: Implement secure user login with email/password
**Subtasks**: 5 tasks (setup, backend, frontend, testing, docs)

Does this look correct? [yes/no/adjust]"

User: "yes"

Spec Creator: "✅ Spec saved to specs/TASK-001.json"
```

### Output Structure

Generated spec files follow this schema:
```json
{
  "task": {
    "id": "TASK-001",
    "title": "User Email/Password Authentication",
    "spec": {
      "description": "...",
      "context": "...",
      "requirements": [...],
      "constraints": [...],
      "success_criteria": [...]
    },
    "subtasks": [
      {
        "id": "T1",
        "name": "Setup database schema",
        "depends_on": [],
        "estimated_minutes": 15
      }
    ],
    "orchestration": {
      "execution_mode": "parallel",
      "error_handling": "auto-retry"
    }
  }
}
```

## Integration with /task Command

The spec-creator skill is designed to work with the `/task` command:

1. **Create spec:** `/spec <goal>` → `specs/TASK-XXX.json`
2. **Execute task:** `/task specs/TASK-XXX.json` → runs task with logging, TDD, knowledge updates
3. **Optional blog:** Prompted at task completion → `blog/YYYY-MM-DD-title.md`

## Related Skills

- **task-executor** - Execute tasks from specs (when created)
- **tdd-workflow** - Used during task execution for coding
- **skill-creator** - For creating new skills like this one
- **writing-plans** - Similar pattern for implementation plans

## References

- `references/skill-rules.md` - 10 mandatory skill rules
- `references/task-rules.md` - Task execution requirements
- `references/task-specification-schema.md` - JSON schema for task specs
- `references/task-execution-workflow.md` - Execution workflow details