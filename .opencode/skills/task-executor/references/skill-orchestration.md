# Skill Orchestration Reference

Reference documentation for intelligent skill orchestration used by the task-executor skill.

---

## Overview

Skill orchestration is the process of analyzing task context and dynamically invoking the appropriate skills based on task requirements, file types, codebase characteristics, and work type.

---

## Orchestration Decision Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              Skill Orchestration Decision Flow                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANALYZE TASK CONTEXT                                        │
│     └─► Parse task specification                                │
│     └─► Identify file types (.svelte, .ts, .md, etc.)           │
│     └─► Determine work type (frontend, backend, testing, docs)  │
│     └─► Assess codebase size/complexity                         │
│                                                                  │
│  2. CLASSIFY REQUIREMENTS                                       │
│     └─► Coding work? → tdd-workflow (MANDATORY)                 │
│     └─► Frontend work? → svelte5-best-practices                 │
│     └─► Full-stack? → sveltekit-svelte5-tailwind-skill          │
│     └─► Large codebase? → codebase-context                      │
│     └─► Documentation? → documentation-generator                │
│                                                                  │
│  3. BUILD INVOCATION PLAN                                       │
│     └─► Order skills by dependency                              │
│     └─► Plan parallel execution where possible                  │
│     └─► Identify skill context requirements                     │
│                                                                  │
│  4. INVOKE SKILLS                                               │
│     └─► Execute skills in planned order                         │
│     └─► Capture results and artifacts                           │
│     └─► Handle errors with retry/fallback                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mandatory Skills

### tdd-workflow

**Always invoked for:**
- Any task that writes production code
- Feature implementation
- Bug fixes
- Refactoring work
- API development
- Component development

**Rationale:** Test-driven development ensures code quality, maintainability, and correctness. The RED-GREEN-REFACTOR cycle is mandatory for all coding work.

**Invocation pattern:**
```
For each coding subtask:
  1. Invoke tdd-workflow
  2. Write failing test (RED)
  3. Write minimal implementation (GREEN)
  4. Refactor while tests pass (REFACTOR)
  5. Capture test results in tests.json
```

---

## Conditional Skills

### svelte5-best-practices

**Invoked when:**
- Task involves `.svelte` files
- Component development or refactoring
- Svelte 4 to Svelte 5 migration
- Runes usage ($state, $derived, $effect, $props, $bindable, $inspect)
- Snippets usage ({#snippet}, {@render})
- Store to rune migration
- Slots to snippets migration
- TypeScript props typing
- Generic components
- SSR state isolation
- Performance optimization

**Patterns applied:**
- Modern Svelte 5 component structure
- Reactive state with runes
- Snippet-based composition
- Type-safe props
- SSR-friendly state management

---

### sveltekit-svelte5-tailwind-skill

**Invoked when:**
- Full-stack SvelteKit development
- SvelteKit 2 project setup
- Tailwind CSS v4 integration
- Forms and actions implementation
- Data loading patterns
- API routes development
- Layout and page structure
- Authentication flows
- Deployment configuration

**Integration patterns:**
- SvelteKit + Svelte 5 + Tailwind v4 stack
- Modern forms and actions
- Type-safe data loading
- Unified design system

---

### codebase-context

**Invoked when:**
- Codebase is large (>50 files)
- Task requires understanding existing architecture
- Refactoring legacy code
- Onboarding to new project
- Cross-module changes
- Complex dependency chains
- LLM context optimization needed

**Outputs:**
- CODEBASE_GRAPH.md - Symbol and relationship documentation
- SEMANTIC_INDEX.md - Searchable symbol catalog
- CONTEXT_GUIDE.md - Retrieval rules for LLM sessions

**Benefits:**
- 70% token reduction
- Improved accuracy
- Near-zero hallucinations

---

### documentation-generator

**Invoked when:**
- Task requires API documentation
- New feature needs user docs
- Code changes need explanation
- Architecture decisions need recording
- Onboarding docs needed

**Outputs:**
- API documentation
- User guides
- Architecture decision records
- Developer onboarding docs

---

## Skill Invocation Process

### Step 1: Analyze Task Context

**Input:** Task specification from `specs/TASK-XXX.json`

**Analysis:**
```javascript
function analyzeTaskContext(taskSpec) {
  const context = {
    fileTypes: extractFileTypes(taskSpec),
    workType: classifyWorkType(taskSpec),
    codebaseSize: assessCodebaseSize(),
    complexity: assessComplexity(taskSpec),
    requirements: taskSpec.spec.requirements
  };
  return context;
}
```

**Factors considered:**
- File extensions mentioned (.svelte, .ts, .py, .md, etc.)
- Task type (frontend, backend, testing, docs, integration)
- Number of files to modify
- Number of subtasks
- Dependencies between subtasks
- Technical requirements

### Step 2: Map Skills to Requirements

**Decision matrix:**

| Requirement | Skill |
|-------------|-------|
| Write code | tdd-workflow |
| Svelte components | svelte5-best-practices |
| SvelteKit full-stack | sveltekit-svelte5-tailwind-skill |
| Large codebase understanding | codebase-context |
| API documentation | documentation-generator |
| Test automation | testing-framework |
| Code refactoring | tdd-workflow + codebase-context |

**Mapping logic:**
```javascript
function mapSkillsToRequirements(context) {
  const skills = [];
  
  // Mandatory for all coding
  if (context.workType === 'coding') {
    skills.push('tdd-workflow');
  }
  
  // Frontend work
  if (context.fileTypes.includes('.svelte')) {
    skills.push('svelte5-best-practices');
    skills.push('sveltekit-svelte5-tailwind-skill');
  }
  
  // Large codebase
  if (context.codebaseSize === 'large') {
    skills.push('codebase-context');
  }
  
  // Documentation needed
  if (context.requirements.includes('documentation')) {
    skills.push('documentation-generator');
  }
  
  return skills;
}
```

### Step 3: Plan Invocation Order

**Dependency-based ordering:**
```
1. codebase-context (if needed) - Provides context for other skills
2. tdd-workflow - Foundation for all coding work
3. Domain skills (svelte5, sveltekit, etc.) - Apply patterns
4. Documentation skills - Generate docs from completed work
```

**Parallel execution:**
- Independent subtasks can invoke skills in parallel
- Dependent subtasks must wait for dependencies

**Ordering rules:**
- Context skills before implementation skills
- Foundation skills before specialization skills
- Documentation skills after implementation

### Step 4: Invoke Skills

**Invocation pattern:**
```javascript
async function invokeSkill(skillName, context) {
  // Load skill definition
  const skill = await loadSkill(skillName);
  
  // Validate skill rules compliance
  validateSkillRules(skill);
  
  // Execute skill workflow
  const result = await executeSkillWorkflow(skill, context);
  
  // Log skill usage
  logSkillUsage({
    skill: skillName,
    duration: result.duration,
    outcome: result.outcome,
    artifacts: result.artifacts
  });
  
  return result;
}
```

**Per-subtask invocation:**
```
For each subtask:
  1. Get required skills from invocation plan
  2. Invoke skills in order
  3. Capture results
  4. Handle errors (retry/fallback)
  5. Log outcomes
  6. Continue to next subtask
```

---

## Error Handling in Orchestration

### Skill Invocation Failures

**Retry strategy:**
1. First failure → Retry once with same context
2. Second failure → Try alternative approach
3. Third failure → Log error, continue with next subtask

**Fallback strategies:**
- If skill not found → Use built-in workflow
- If skill times out → Increase timeout, retry
- If skill produces invalid output → Reject, retry with validation

### Missing Skills

**Detection:**
- Skill file not found in skills/ directory
- Skill name not recognized
- Skill dependencies not met

**Handling:**
```
On missing skill:
  1. Log warning: "Skill X not found"
  2. Check if alternative skill available
  3. Use built-in workflow if no alternative
  4. Continue execution with degraded capability
  5. Report in final summary
```

### Skill Conflicts

**Detection:**
- Two skills modify same file
- Two skills have conflicting patterns
- Skill outputs incompatible with next skill inputs

**Resolution:**
1. Detect conflict during planning
2. Reorder skills to avoid conflict
3. Insert coordination step between conflicting skills
4. Log conflict and resolution in decisions.json

---

## Orchestration Examples

### Example 1: Frontend Feature

**Task:** "Add user profile page with Svelte 5"

**Analysis:**
- File types: .svelte, .ts
- Work type: Frontend component development
- Codebase: Medium (20-50 files)
- Skills needed: tdd-workflow, svelte5-best-practices

**Invocation plan:**
```
1. tdd-workflow (for component tests)
2. svelte5-best-practices (for component patterns)
Parallel: Can run together for same subtask
```

### Example 2: Full-Stack Authentication

**Task:** "Implement user authentication with SvelteKit"

**Analysis:**
- File types: .svelte, .ts, .md
- Work type: Full-stack (frontend + backend)
- Codebase: Large (50+ files)
- Skills needed: tdd-workflow, svelte5-best-practices, sveltekit-svelte5-tailwind-skill, codebase-context

**Invocation plan:**
```
1. codebase-context (understand existing auth patterns)
2. tdd-workflow (for all coding work)
3. svelte5-best-practices (for component patterns)
4. sveltekit-svelte5-tailwind-skill (for full-stack integration)
Sequential: Must run in this order due to dependencies
```

### Example 3: Documentation Update

**Task:** "Update API documentation for new endpoints"

**Analysis:**
- File types: .md
- Work type: Documentation
- Codebase: Any size
- Skills needed: documentation-generator

**Invocation plan:**
```
1. documentation-generator (primary skill)
Simple: Single skill invocation
```

---

## Skill Invocation Logging

**Logged data:**
```json
{
  "skill_invocation": {
    "skill_name": "tdd-workflow",
    "subtask_id": "T2",
    "invoked_at": "2025-01-15T14:30:00Z",
    "completed_at": "2025-01-15T14:45:00Z",
    "duration_minutes": 15,
    "outcome": "success",
    "artifacts": [
      "src/auth.test.ts",
      "src/auth.ts"
    ],
    "test_results": {
      "written": 5,
      "passing": 5,
      "failing": 0
    }
  }
}
```

**Logged to:** `tasks/TASK-XXX/logs/decisions.json`

---

## Related Documents

- `schemas.md` - JSON schemas for skill invocation logs
- `task-execution-workflow.md` - Complete execution workflow
- `task-command-integration.md` - Integration with /task command

---

## Usage

This orchestration reference is used by:
- **task-executor skill**: To implement skill invocation logic
- **spec-creator skill**: To understand which skills to mention in specs
- **Users**: To understand how skills are selected and invoked
- **Documentation**: To explain system architecture

**Part of:** task-executor skill references for portable, self-contained operation