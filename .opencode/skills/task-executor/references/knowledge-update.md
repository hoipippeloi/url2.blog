# Knowledge Graph Update Reference

Reference documentation for knowledge graph updates used by the task-executor skill.

---

## Overview

The knowledge graph update system captures technical decisions, lessons learned, patterns applied, and anti-patterns avoided during task execution. Each category is stored in a separate modular JSON file for later merging and aggregation.

---

## Knowledge Files Structure

```
tasks/TASK-001/
  knowledge/
    metadata.json       # Task execution metadata
    decisions.json      # Technical decisions made
    learnings.json      # Lessons learned
    patterns.json       # Code patterns applied
    anti-patterns.json  # Anti-patterns avoided
```

**Design principle:** Modular separation enables:
- Independent analysis per category
- Easy merging across multiple tasks
- Targeted queries for specific knowledge types
- Incremental knowledge base growth

---

## metadata.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Task Execution Metadata",
  "type": "object",
  "required": ["task_id", "timestamp", "completed"],
  "properties": {
    "task_id": {
      "type": "string",
      "pattern": "^TASK-\\d{3}$",
      "description": "Task identifier"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Completion timestamp"
    },
    "completed": {
      "type": "boolean",
      "description": "Whether task completed successfully"
    },
    "duration_minutes": {
      "type": "integer",
      "description": "Total execution time in minutes"
    },
    "skills_used": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of skills invoked during execution"
    },
    "files_modified": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of files modified or created"
    },
    "patterns_applied": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of pattern names applied"
    },
    "subtasks_completed": {
      "type": "integer",
      "description": "Number of subtasks completed"
    },
    "subtasks_total": {
      "type": "integer",
      "description": "Total number of subtasks"
    },
    "tests_written": {
      "type": "integer",
      "description": "Number of tests written"
    },
    "tests_passing": {
      "type": "integer",
      "description": "Number of tests passing"
    }
  }
}
```

**Example:**
```json
{
  "task_id": "TASK-001",
  "timestamp": "2025-01-15T16:45:00Z",
  "completed": true,
  "duration_minutes": 135,
  "skills_used": [
    "tdd-workflow",
    "svelte5-best-practices",
    "codebase-context"
  ],
  "files_modified": [
    "src/auth.ts",
    "src/auth.test.ts",
    "src/components/Login.svelte"
  ],
  "patterns_applied": [
    "RED-GREEN-REFACTOR",
    "runes-state-management",
    "snippet-composition"
  ],
  "subtasks_completed": 12,
  "subtasks_total": 12,
  "tests_written": 15,
  "tests_passing": 15
}
```

---

## decisions.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Technical Decisions Log",
  "type": "object",
  "required": ["task_id", "decisions"],
  "properties": {
    "task_id": { "type": "string" },
    "decisions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["context", "choice", "rationale", "timestamp"],
        "properties": {
          "id": { "type": "string" },
          "context": {
            "type": "string",
            "description": "Situation requiring decision"
          },
          "choice": {
            "type": "string",
            "description": "Decision made"
          },
          "alternatives": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Options considered but not chosen"
          },
          "rationale": {
            "type": "string",
            "description": "Reasoning for the choice"
          },
          "trade_offs": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Trade-offs acknowledged"
          },
          "impact": {
            "type": "string",
            "description": "Expected impact of decision"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "task_id": "TASK-001",
  "decisions": [
    {
      "id": "D1",
      "context": "State management for user session",
      "choice": "Svelte 5 $state rune instead of stores",
      "alternatives": [
        "Writable store",
        "Context API",
        "External state library"
      ],
      "rationale": "Runes provide better SSR isolation, simpler syntax, and are the Svelte 5 recommended approach",
      "trade_offs": [
        "Less ecosystem compatibility with store-based code",
        "Newer API with less community examples"
      ],
      "impact": "Cleaner component code, better SSR behavior",
      "timestamp": "2025-01-15T14:30:00Z"
    },
    {
      "id": "D2",
      "context": "Password hashing algorithm",
      "choice": "bcrypt with 12 rounds",
      "alternatives": [
        "Argon2",
        "scrypt",
        "PBKDF2"
      ],
      "rationale": "bcrypt is well-established, widely supported, and provides sufficient security for our threat model",
      "trade_offs": [
        "Argon2 is more modern but less battle-tested",
        "Higher rounds increase security but slow login"
      ],
      "impact": "Industry-standard password security",
      "timestamp": "2025-01-15T14:35:00Z"
    }
  ]
}
```

---

## learnings.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Lessons Learned",
  "type": "object",
  "required": ["task_id", "learnings"],
  "properties": {
    "task_id": { "type": "string" },
    "learnings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["description", "category", "applicability"],
        "properties": {
          "id": { "type": "string" },
          "description": {
            "type": "string",
            "description": "Lesson learned statement"
          },
          "category": {
            "type": "string",
            "enum": ["technical", "process", "architecture", "testing", "tooling"],
            "description": "Category of lesson"
          },
          "applicability": {
            "type": "string",
            "description": "When/where this lesson applies"
          },
          "confidence": {
            "type": "string",
            "enum": ["high", "medium", "low"],
            "description": "Confidence level in lesson validity"
          },
          "source": {
            "type": "string",
            "description": "What experience led to this learning"
          }
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "task_id": "TASK-001",
  "learnings": [
    {
      "id": "L1",
      "description": "Using $derived for computed values reduces reactivity bugs compared to manual calculations",
      "category": "technical",
      "applicability": "Svelte 5 component development",
      "confidence": "high",
      "source": "Refactored computed user data from manual to $derived"
    },
    {
      "id": "L2",
      "description": "Writing tests before implementation catches edge cases that would be missed otherwise",
      "category": "process",
      "applicability": "All feature development",
      "confidence": "high",
      "source": "TDD workflow caught null input handling early"
    },
    {
      "id": "L3",
      "description": "Separate authentication module simplifies testing and reuse across components",
      "category": "architecture",
      "applicability": "Feature modularization",
      "confidence": "high",
      "source": "Extracted auth logic from component to dedicated module"
    }
  ]
}
```

---

## patterns.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Patterns Applied",
  "type": "object",
  "required": ["task_id", "patterns"],
  "properties": {
    "task_id": { "type": "string" },
    "patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "description", "application"],
        "properties": {
          "id": { "type": "string" },
          "name": {
            "type": "string",
            "description": "Pattern name"
          },
          "description": {
            "type": "string",
            "description": "What the pattern does"
          },
          "category": {
            "type": "string",
            "enum": ["architectural", "component", "state", "testing", "security"],
            "description": "Pattern category"
          },
          "application": {
            "type": "string",
            "description": "How it was applied in this task"
          },
          "code_example": {
            "type": "string",
            "description": "Code snippet showing pattern usage"
          },
          "benefits": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Benefits gained from pattern"
          },
          "source": {
            "type": "string",
            "description": "Pattern source or origin"
          }
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "task_id": "TASK-001",
  "patterns": [
    {
      "id": "P1",
      "name": "RED-GREEN-REFACTOR",
      "description": "Test-driven development cycle: write failing test, write minimal code, refactor",
      "category": "testing",
      "application": "Applied to all authentication functions",
      "code_example": "1. Write test for login()\n2. Implement minimal login()\n3. Refactor with error extraction",
      "benefits": [
        "All code covered by tests",
        "Edge cases discovered early",
        "Confidence in refactoring"
      ],
      "source": "tdd-workflow skill"
    },
    {
      "id": "P2",
      "name": "Runes State Management",
      "description": "Svelte 5 $state rune for reactive component state",
      "category": "state",
      "application": "User session state in Login component",
      "code_example": "let user = $state(null);\n$effect(() => { loadUser() })",
      "benefits": [
        "Simpler syntax than stores",
        "Better SSR isolation",
        "Type inference"
      ],
      "source": "svelte5-best-practices skill"
    },
    {
      "id": "P3",
      "name": "Snippet Composition",
      "description": "Svelte 5 {@render} for component composition",
      "category": "component",
      "application": "Form validation error rendering",
      "code_example": "{@render errors()} <div class=\"error\">...</div>",
      "benefits": [
        "Cleaner than slots",
        "Type-safe",
        "Better IDE support"
      ],
      "source": "svelte5-best-practices skill"
    }
  ]
}
```

---

## anti-patterns.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Anti-Patterns Avoided",
  "type": "object",
  "required": ["task_id", "anti_patterns"],
  "properties": {
    "task_id": { "type": "string" },
    "anti_patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "description", "avoided_reason"],
        "properties": {
          "id": { "type": "string" },
          "name": {
            "type": "string",
            "description": "Anti-pattern name"
          },
          "description": {
            "type": "string",
            "description": "What the anti-pattern is"
          },
          "category": {
            "type": "string",
            "enum": ["architectural", "component", "state", "testing", "security"],
            "description": "Anti-pattern category"
          },
          "avoided_reason": {
            "type": "string",
            "description": "Why it was avoided"
          },
          "alternative": {
            "type": "string",
            "description": "What pattern was used instead"
          },
          "consequences_avoided": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Negative outcomes prevented"
          }
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "task_id": "TASK-001",
  "anti_patterns": [
    {
      "id": "AP1",
      "name": "God Component",
      "description": "Single component handling multiple unrelated responsibilities",
      "category": "component",
      "avoided_reason": "Would make component hard to test, maintain, and reuse",
      "alternative": "Separated into Login, Register, and PasswordReset components",
      "consequences_avoided": [
        "Unmaintainable code",
        "Difficult testing",
        "Poor reusability"
      ]
    },
    {
      "id": "AP2",
      "name": "Store Without Cleanup",
      "description": "Creating stores without proper subscription cleanup",
      "category": "state",
      "avoided_reason": "Would cause memory leaks and stale updates",
      "alternative": "Used $state rune with automatic lifecycle management",
      "consequences_avoided": [
        "Memory leaks",
        "Stale state",
        "Unexpected behavior"
      ]
    },
    {
      "id": "AP3",
      "name": "Code Without Tests",
      "description": "Writing production code without test coverage",
      "category": "testing",
      "avoided_reason": "Would lead to regressions and unverified behavior",
      "alternative": "TDD workflow: tests written before implementation",
      "consequences_avoided": [
        "Undetected bugs",
        "Regression risks",
        "Uncode confidence"
      ]
    },
    {
      "id": "AP4",
      "name": "Plain Text Passwords",
      "description": "Storing or transmitting passwords without hashing",
      "category": "security",
      "avoided_reason": "Critical security vulnerability",
      "alternative": "bcrypt hashing with 12 rounds",
      "consequences_avoided": [
        "Credential theft",
        "Account compromise",
        "Legal liability"
      ]
    }
  ]
}
```

---

## Update Procedures

### Step 1: Capture During Execution

**Capture points:**
- Decisions made during skill orchestration
- Lessons learned from test failures
- Patterns applied from skill usage
- Anti-patterns identified and avoided

**Real-time capture:**
```javascript
// During task execution
function captureDecision(context, choice, rationale) {
  knowledge.decisions.push({
    id: generateId(),
    context,
    choice,
    rationale,
    timestamp: new Date().toISOString()
  });
}
```

### Step 2: Structure by Category

**Separation logic:**
```javascript
function categorizeKnowledge(item) {
  if (item.type === 'decision') return 'decisions.json';
  if (item.type === 'learning') return 'learnings.json';
  if (item.type === 'pattern') return 'patterns.json';
  if (item.type === 'anti-pattern') return 'anti-patterns.json';
}
```

### Step 3: Validate Schema

**Validation:**
```javascript
function validateKnowledge(entry, schema) {
  const valid = validateAgainstSchema(entry, schema);
  if (!valid) {
    throw new Error(`Invalid knowledge entry: ${JSON.stringify(entry)}`);
  }
  return valid;
}
```

### Step 4: Write Modular Files

**File writing:**
```javascript
async function writeKnowledgeFiles(knowledge) {
  await writeFile('knowledge/decisions.json', knowledge.decisions);
  await writeFile('knowledge/learnings.json', knowledge.learnings);
  await writeFile('knowledge/patterns.json', knowledge.patterns);
  await writeFile('knowledge/anti-patterns.json', knowledge.anti-patterns);
  await writeFile('knowledge/metadata.json', knowledge.metadata);
}
```

---

## Best Practices

### For Decision Capture

1. **Capture immediately**: Record decisions when made, not at end
2. **Include alternatives**: Document what was considered but rejected
3. **Explain rationale**: Make reasoning explicit for future reference
4. **Note trade-offs**: Acknowledge what was sacrificed

### For Learning Capture

1. **Be specific**: Vague lessons are not actionable
2. **Note confidence**: Distinguish proven vs. hypothesized lessons
3. **Categorize properly**: Enables targeted retrieval later
4. **Link to source**: What experience led to the learning

### For Pattern Documentation

1. **Name clearly**: Use established pattern names when possible
2. **Show code**: Include actual code examples
3. **List benefits**: What value did the pattern provide
4. **Credit source**: Where did you learn the pattern

### For Anti-Pattern Avoidance

1. **Name the anti-pattern**: Helps others recognize it
2. **Explain consequences**: What bad outcomes were prevented
3. **Show alternative**: What pattern was used instead
4. **Justify avoidance**: Why the anti-pattern was rejected

---

## Merge Preparation

### Modular Design Benefits

**Separate files enable:**
- Parallel writing without conflicts
- Targeted merging per category
- Independent analysis of decision types
- Incremental knowledge base growth

### Merge Strategy

**Future merging:**
```javascript
async function mergeKnowledgeFiles(taskEntries) {
  const merged = {
    decisions: [],
    learnings: [],
    patterns: [],
    anti_patterns: []
  };
  
  for (const task of taskEntries) {
    merged.decisions.push(...task.decisions);
    merged.learnings.push(...task.learnings);
    merged.patterns.push(...task.patterns);
    merged.anti_patterns.push(...task.anti_patterns);
  }
  
  return merged;
}
```

### Aggregation Readiness

**Fields for aggregation:**
- task_id: Links knowledge to source task
- timestamp: Enables chronological sorting
- category: Enables filtering by type
- confidence: Enables quality filtering

---

## Related Documents

- `schemas.md` - Complete JSON schema definitions
- `task-execution-workflow.md` - Where knowledge is captured
- `skill-orchestration.md` - Decision points during orchestration
- `documentation-update.md` - How knowledge relates to docs

---

## Usage

This knowledge update reference is used by:
- **task-executor skill**: To implement knowledge capture logic
- **blog-generator skill**: To extract lessons for articles
- **knowledge-merger utility**: To aggregate across tasks
- **Users**: To understand knowledge structure and retrieval

**Part of:** task-executor skill references for portable, self-contained operation