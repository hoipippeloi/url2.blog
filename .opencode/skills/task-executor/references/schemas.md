# Task Executor JSON Schemas

Reference schemas from `brainstorming.md` for task execution logging and knowledge capture.

---

## Task Specification Schema

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
          "pattern": "^TASK-\\d{3}$"
        },
        "title": {
          "type": "string",
          "maxLength": 100
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "spec": {
          "type": "object",
          "required": ["description", "success_criteria"],
          "properties": {
            "description": { "type": "string" },
            "context": { "type": "string" },
            "requirements": {
              "type": "array",
              "items": { "type": "string" }
            },
            "constraints": {
              "type": "array",
              "items": { "type": "string" }
            },
            "success_criteria": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },
        "subtasks": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "name", "depends_on"],
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" },
              "description": { "type": "string" },
              "depends_on": {
                "type": "array",
                "items": { "type": "string" }
              },
              "estimated_minutes": { "type": "integer" }
            }
          }
        },
        "orchestration": {
          "type": "object",
          "properties": {
            "execution_mode": {
              "type": "string",
              "enum": ["sequential", "parallel", "mixed"]
            },
            "error_handling": {
              "type": "string",
              "enum": ["auto-retry", "user-guidance", "decision-tree"]
            }
          }
        }
      }
    }
  }
}
```

---

## Decisions Log Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Decisions Log",
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
          "context": { "type": "string" },
          "choice": { "type": "string" },
          "alternatives": {
            "type": "array",
            "items": { "type": "string" }
          },
          "rationale": { "type": "string" },
          "trade_offs": {
            "type": "array",
            "items": { "type": "string" }
          },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```

---

## Issues Log Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Issues Log",
  "type": "object",
  "required": ["task_id", "issues"],
  "properties": {
    "task_id": { "type": "string" },
    "issues": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["description", "resolution", "timestamp"],
        "properties": {
          "id": { "type": "string" },
          "description": { "type": "string" },
          "severity": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"]
          },
          "error_type": { "type": "string" },
          "resolution": { "type": "string" },
          "retry_count": { "type": "integer" },
          "fallback_used": { "type": "boolean" },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```

---

## Tests Log Schema (TDD)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TDD Tests Log",
  "type": "object",
  "required": ["task_id", "tdd_cycles"],
  "properties": {
    "task_id": { "type": "string" },
    "tdd_cycles": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["cycle_number", "phase", "status"],
        "properties": {
          "cycle_number": { "type": "integer" },
          "phase": {
            "type": "string",
            "enum": ["RED", "GREEN", "REFACTOR"]
          },
          "test_file": { "type": "string" },
          "test_name": { "type": "string" },
          "code_file": { "type": "string" },
          "status": {
            "type": "string",
            "enum": ["passed", "failed", "skipped"]
          },
          "error": { "type": "string" },
          "implementation": { "type": "string" },
          "refactoring": { "type": "string" },
          "lines_changed": {
            "type": "object",
            "properties": {
              "added": { "type": "integer" },
              "removed": { "type": "integer" }
            }
          },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```

---

## Changes Log Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Codebase Changes Log",
  "type": "object",
  "required": ["task_id", "changes"],
  "properties": {
    "task_id": { "type": "string" },
    "changes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["file", "type", "description"],
        "properties": {
          "file": { "type": "string" },
          "type": {
            "type": "string",
            "enum": ["added", "modified", "deleted", "renamed"]
          },
          "description": { "type": "string" },
          "lines_changed": {
            "type": "object",
            "properties": {
              "added": { "type": "integer" },
              "removed": { "type": "integer" }
            }
          },
          "purpose": { "type": "string" },
          "related_subtask": { "type": "string" }
        }
      }
    },
    "summary": {
      "type": "object",
      "properties": {
        "files_added": { "type": "integer" },
        "files_modified": { "type": "integer" },
        "files_deleted": { "type": "integer" },
        "total_lines_added": { "type": "integer" },
        "total_lines_removed": { "type": "integer" }
      }
    }
  }
}
```

---

## Knowledge Graph Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Knowledge Graph Entry",
  "type": "object",
  "required": ["task_id", "timestamp"],
  "properties": {
    "task_id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "metadata": {
      "type": "object",
      "properties": {
        "completed": { "type": "boolean" },
        "duration_minutes": { "type": "integer" },
        "skills_used": {
          "type": "array",
          "items": { "type": "string" }
        },
        "files_modified": {
          "type": "array",
          "items": { "type": "string" }
        },
        "patterns_applied": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "decisions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "context": { "type": "string" },
          "choice": { "type": "string" },
          "rationale": { "type": "string" }
        }
      }
    },
    "learnings": {
      "type": "array",
      "items": { "type": "string" }
    },
    "patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "example": { "type": "string" }
        }
      }
    },
    "anti_patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "avoided_reason": { "type": "string" }
        }
      }
    },
    "related_tasks": {
      "type": "array",
      "items": { "type": "string" }
    },
    "blog_article_ref": { "type": "string" }
  }
}
```

---

## Usage

These schemas are used by the task-executor skill to validate:
- Task specifications from `specs/TASK-XXX.json`
- Log files in `tasks/TASK-XXX/logs/`
- Knowledge files in `tasks/TASK-XXX/knowledge/`

**Validation ensures:**
- All required fields present
- Correct data types
- Proper date-time formats
- Enum values match allowed options
- Arrays have correct structure

See `brainstorming.md#file-structures-schemas` for complete documentation.