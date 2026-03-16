# Task Specification Schema

Reference schema for task specifications used by the spec-creator skill.

---

## JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Task Specification",
  "type": "object",
  "required": ["task"],
  "properties": {
    "task": {
      "type": "object",
      "required": ["id", "title", "spec", "subtasks"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^TASK-\\d{3}$",
          "description": "Task identifier in format TASK-NNN"
        },
        "title": {
          "type": "string",
          "maxLength": 100,
          "description": "Short descriptive title for the task"
        },
        "created": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp of spec creation"
        },
        "spec": {
          "type": "object",
          "required": ["description", "success_criteria"],
          "properties": {
            "description": {
              "type": "string",
              "description": "Detailed description of what the task should accomplish"
            },
            "context": {
              "type": "string",
              "description": "Project background and motivation for this task"
            },
            "requirements": {
              "type": "array",
              "items": { "type": "string" },
              "description": "List of functional and non-functional requirements"
            },
            "constraints": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Technical, time, or resource constraints"
            },
            "success_criteria": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Measurable criteria that define task completion"
            }
          }
        },
        "subtasks": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "name", "depends_on"],
            "properties": {
              "id": {
                "type": "string",
                "description": "Subtask identifier (T1, T2, etc.)"
              },
              "name": {
                "type": "string",
                "description": "Short name for the subtask"
              },
              "description": {
                "type": "string",
                "description": "Detailed description of what the subtask should do"
              },
              "depends_on": {
                "type": "array",
                "items": { "type": "string" },
                "description": "List of subtask IDs that must complete before this one"
              },
              "estimated_minutes": {
                "type": "integer",
                "description": "Estimated effort in minutes (5-30 min ideal)"
              }
            }
          },
          "description": "Ordered list of decomposed subtasks"
        },
        "orchestration": {
          "type": "object",
          "properties": {
            "execution_mode": {
              "type": "string",
              "enum": ["sequential", "parallel", "mixed"],
              "description": "How subtasks should be executed"
            },
            "error_handling": {
              "type": "string",
              "enum": ["auto-retry", "user-guidance", "decision-tree"],
              "description": "Strategy for handling errors during execution"
            }
          },
          "description": "Execution configuration for the task"
        }
      }
    }
  }
}
```

---

## Required Fields

Every task specification MUST include:

| Field | Location | Required | Description |
|-------|----------|----------|-------------|
| `id` | task | ✅ | Task identifier (TASK-NNN format) |
| `title` | task | ✅ | Short descriptive title |
| `description` | task.spec | ✅ | What the task should accomplish |
| `success_criteria` | task.spec | ✅ | Measurable completion criteria |
| `subtasks` | task | ✅ | Array of decomposed subtasks |

## Optional Fields

| Field | Location | Description |
|-------|----------|-------------|
| `created` | task | ISO 8601 timestamp |
| `context` | task.spec | Project background |
| `requirements` | task.spec | Functional/non-functional requirements |
| `constraints` | task.spec | Technical/time/resource constraints |
| `orchestration` | task | Execution configuration |

---

## Subtask Structure

Each subtask must have:

```json
{
  "id": "T1",
  "name": "Task name",
  "description": "Clear description of what to do",
  "depends_on": [],
  "estimated_minutes": 15
}
```

**Dependency rules:**
- Empty `depends_on` array = can start immediately
- Non-empty array = must wait for listed subtasks to complete
- No circular dependencies allowed
- Dependencies must reference valid subtask IDs

---

## Example Task Specification

```json
{
  "task": {
    "id": "TASK-001",
    "title": "User Email/Password Authentication",
    "created": "2025-01-15T10:00:00Z",
    "spec": {
      "description": "Implement secure user login with email/password authentication",
      "context": "E-commerce site needs user accounts for order tracking",
      "requirements": [
        "Users can register with email and password",
        "Users can login with credentials",
        "Users can logout securely",
        "Passwords are hashed with bcrypt",
        "Sessions use JWT tokens"
      ],
      "constraints": [
        "Must use bcrypt for password hashing",
        "Must use JWT for session management",
        "Must follow OWASP security guidelines"
      ],
      "success_criteria": [
        "Users can register successfully",
        "Users can login with valid credentials",
        "Invalid credentials are rejected",
        "Logout invalidates session",
        "All security tests pass"
      ]
    },
    "subtasks": [
      {
        "id": "T1",
        "name": "Setup database schema",
        "description": "Create users table with email, password hash, timestamps",
        "depends_on": [],
        "estimated_minutes": 15
      },
      {
        "id": "T2",
        "name": "Implement registration API",
        "description": "Create POST /api/register endpoint with validation",
        "depends_on": ["T1"],
        "estimated_minutes": 30
      },
      {
        "id": "T3",
        "name": "Implement login API",
        "description": "Create POST /api/login with JWT token generation",
        "depends_on": ["T1"],
        "estimated_minutes": 30
      }
    ],
    "orchestration": {
      "execution_mode": "parallel",
      "error_handling": "auto-retry"
    }
  }
}
```

---

## Validation Rules

The spec-creator skill validates:

1. **ID Format**: Must match `^TASK-\d{3}$` pattern
2. **Title Length**: Maximum 100 characters
3. **Timestamp Format**: ISO 8601 date-time
4. **Subtask Dependencies**: Must reference valid subtask IDs
5. **Required Fields**: All required fields must be present
6. **No Circular Dependencies**: Dependency graph must be acyclic

---

## Usage

This schema is used by:
- **spec-creator skill**: To generate valid task specifications
- **task-executor skill**: To parse and validate task inputs
- **validation utilities**: To verify spec correctness before execution

**Output location**: `specs/TASK-XXX.json`
