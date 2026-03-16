# Error Handling Reference

Reference documentation for error handling strategies used by the task-executor skill.

---

## Overview

Error handling in task execution follows a classification-based approach where different error types trigger different handling strategies. All errors are logged to `issues.json` for later analysis and knowledge capture.

---

## Error Classification

### Transient Errors

**Examples:**
- Network timeouts
- API rate limiting
- Temporary server errors (5xx)
- File system locks
- Resource contention

**Handling Strategy:** Auto-retry 3x with exponential backoff

**Retry pattern:**
```
Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Attempt 4: Wait 4 seconds

If all 4 attempts fail → Try fallback strategy
```

**Exponential backoff formula:**
```
delay_ms = base_delay * (2 ^ (attempt_number - 1))
where base_delay = 1000ms
```

**Logged data:**
```json
{
  "error_type": "transient",
  "description": "Network timeout connecting to API",
  "severity": "medium",
  "retry_count": 3,
  "fallback_used": false,
  "resolution": "Succeeded on retry 3",
  "timestamp": "2025-01-15T14:30:00Z"
}
```

---

### Logic Errors

**Examples:**
- Test failures (RED phase in TDD)
- Assertion failures
- Business logic bugs
- Incorrect implementations
- Validation failures

**Handling Strategy:** Invoke tdd-workflow to fix

**Resolution process:**
```
1. Detect test failure
2. Analyze failure reason
3. Invoke tdd-workflow skill
4. Write failing test (if not already written)
5. Fix implementation
6. Re-run tests
7. Log resolution
```

**Logged data:**
```json
{
  "error_type": "logic",
  "description": "Test failed: expected 200 but got 401",
  "severity": "high",
  "retry_count": 0,
  "fallback_used": false,
  "resolution": "Fixed authentication middleware to return 200 on success",
  "timestamp": "2025-01-15T14:35:00Z"
}
```

---

### Missing Resource Errors

**Examples:**
- File not found
- Module/package not installed
- Database table missing
- API endpoint not implemented
- Skill file not found

**Handling Strategy:** Log error, continue with next task

**Resolution process:**
```
1. Detect missing resource
2. Log error in issues.json
3. Mark subtask as blocked/failed
4. Continue with independent subtasks
5. Report in final summary
```

**When to stop:**
- Resource is critical for task completion
- No workaround available
- User approval needed to proceed

**Logged data:**
```json
{
  "error_type": "missing_resource",
  "description": "Skill file not found: testing-framework",
  "severity": "medium",
  "retry_count": 0,
  "fallback_used": true,
  "resolution": "Used built-in test workflow instead of skill",
  "timestamp": "2025-01-15T14:40:00Z"
}
```

---

### Permission Errors

**Examples:**
- File write permission denied
- Database access denied
- API authentication failed
- Insufficient privileges
- Read-only file system

**Handling Strategy:** Log error, continue

**Resolution process:**
```
1. Detect permission error
2. Log error with file/resource path
3. Skip operation requiring permission
4. Continue with other subtasks
5. Report in final summary for user review
```

**When to request user approval:**
- Permission needed for critical operation
- Permission can be granted by user
- Alternative approach not available

**Logged data:**
```json
{
  "error_type": "permission",
  "description": "Write permission denied: /etc/config.json",
  "severity": "high",
  "retry_count": 0,
  "fallback_used": false,
  "resolution": "Skipped config update, logged for manual review",
  "timestamp": "2025-01-15T14:45:00Z"
}
```

---

### Skill Invocation Failures

**Examples:**
- Skill file not found
- Skill execution timeout
- Skill produces invalid output
- Skill dependencies not met
- Skill conflicts with other skills

**Handling Strategy:** Retry once, log, try alternative approach

**Resolution process:**
```
1. Detect invocation failure
2. Retry once with same parameters
3. If fails again, log error
4. Try alternative skill or approach
5. If no alternative, skip and continue
6. Report in final summary
```

**Fallback options:**
- Use built-in workflow instead of skill
- Use alternative skill with similar capability
- Skip skill-dependent subtask
- Request user guidance

**Logged data:**
```json
{
  "error_type": "skill_invocation",
  "description": "Skill 'codebase-context' timed out after 5 minutes",
  "severity": "medium",
  "retry_count": 1,
  "fallback_used": true,
  "resolution": "Used manual file listing instead of skill",
  "timestamp": "2025-01-15T14:50:00Z"
}
```

---

## Retry Logic

### Retry Configuration

**Default retry settings:**
- Max retries: 3
- Base delay: 1000ms (1 second)
- Backoff multiplier: 2x
- Max delay: 8000ms (8 seconds)

**Retry decision tree:**
```
On error:
  ├─ Is error transient?
  │  ├─ Yes → Retry 3x with exponential backoff
  │  └─ No → Check error type
  │
  ├─ Is error logic (test failure)?
  │  ├─ Yes → Invoke tdd-workflow to fix
  │  └─ No → Check error type
  │
  ├─ Is error missing resource?
  │  ├─ Yes → Log and continue
  │  └─ No → Check error type
  │
  ├─ Is error permission?
  │  ├─ Yes → Log and continue (or request approval)
  │  └─ No → Check error type
  │
  └─ Is error skill invocation?
     ├─ Yes → Retry once, then try alternative
     └─ No → Log as unknown error type
```

### Retry Implementation

**Pseudo-code:**
```javascript
async function executeWithRetry(operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!isTransientError(error)) {
        // Not retryable, handle immediately
        break;
      }
      
      if (attempt < maxRetries) {
        // Wait with exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  
  // All retries exhausted
  throw lastError;
}
```

**Error classification:**
```javascript
function isTransientError(error) {
  return error.type === 'network' ||
         error.type === 'timeout' ||
         error.type === 'rate_limit' ||
         error.code >= 500; // Server errors
}
```

---

## Fallback Strategies

### When Retries Fail

**Fallback hierarchy:**
1. **Retry** (up to 3x for transient errors)
2. **Alternative approach** (different method/tool)
3. **Skip** (log and continue with next task)
4. **Request user guidance** (block and wait)

**Decision criteria:**
```
Can we retry? → Yes, if transient
Can we try alternative? → Yes, if workaround exists
Can we skip? → Yes, if not critical
Should we block? → Yes, if critical and no workaround
```

### Common Fallbacks

**Skill not available:**
- Fallback: Use built-in workflow
- Example: Skill missing → Use native implementation

**API unavailable:**
- Fallback: Use cached data or mock
- Example: API down → Use last known state

**Test framework missing:**
- Fallback: Use simple assertion checks
- Example: Jest missing → Use Node.js assert module

**Codebase context unavailable:**
- Fallback: Manual file listing
- Example: Large codebase → Use `find` command

---

## Error Logging

### Issues Log Schema

**File:** `tasks/TASK-XXX/logs/issues.json`

**Schema:**
```json
{
  "task_id": "TASK-001",
  "issues": [
    {
      "id": "ERR-001",
      "description": "Error description",
      "severity": "low|medium|high|critical",
      "error_type": "transient|logic|missing_resource|permission|skill_invocation",
      "resolution": "How it was resolved",
      "retry_count": 0,
      "fallback_used": false,
      "timestamp": "2025-01-15T14:30:00Z"
    }
  ]
}
```

**Required fields:**
- `id`: Unique error identifier
- `description`: Clear error description
- `severity`: Impact level
- `error_type`: Classification
- `resolution`: How it was handled
- `timestamp`: ISO 8601 timestamp

**Optional fields:**
- `retry_count`: Number of retries attempted
- `fallback_used`: Whether fallback strategy was used
- `file_path`: Related file (if applicable)
- `subtask_id`: Related subtask (if applicable)

---

## Severity Levels

### Critical

**Characteristics:**
- Blocks task completion
- No workaround available
- Data loss risk
- Security vulnerability

**Handling:**
- Stop execution immediately
- Request user approval
- Do not continue without resolution

**Examples:**
- Database corruption detected
- Security credentials exposed
- Production data at risk

---

### High

**Characteristics:**
- Significant functionality blocked
- Workaround exists but degrades quality
- Multiple subtasks affected

**Handling:**
- Log error
- Try fallback strategy
- Continue if possible
- Report prominently in summary

**Examples:**
- Main feature implementation failed
- Test suite not passing
- Critical dependency missing

---

### Medium

**Characteristics:**
- Some functionality degraded
- Workaround available
- Single subtask affected

**Handling:**
- Log error
- Apply fallback
- Continue execution
- Report in summary

**Examples:**
- Optional feature skipped
- Non-critical test failing
- Documentation generation failed

---

### Low

**Characteristics:**
- Minor inconvenience
- Easy workaround
- No functional impact

**Handling:**
- Log error
- Continue execution
- Mention in summary

**Examples:**
- Formatting issue
- Non-essential warning
- Cosmetic problem

---

## Error Reporting in Summary

### Final Summary Format

**Errors section:**
```markdown
## Errors Encountered

**Total**: X errors
- Critical: 0
- High: X
- Medium: X
- Low: X

**Critical/High errors:**
1. [ERR-001] Description - Resolution
2. [ERR-002] Description - Resolution

**Impact**: [Brief description of impact on task completion]
```

**When to surface errors:**
- All critical errors always surfaced
- High errors always surfaced
- Medium errors if >3 occurred
- Low errors if pattern detected

---

## Best Practices

### Error Prevention

1. **Validate inputs early**
   - Check spec file exists before loading
   - Validate JSON schema before parsing
   - Check skill files exist before invoking

2. **Set appropriate timeouts**
   - Skill invocation: 5 minutes default
   - File operations: 30 seconds
   - Network requests: 10 seconds

3. **Use defensive programming**
   - Try-catch around all external calls
   - Validate all assumptions
   - Fail fast on critical errors

### Error Recovery

1. **Idempotent operations**
   - Make operations safe to retry
   - Use temporary files for writes
   - Commit only after success

2. **Graceful degradation**
   - Continue with reduced capability
   - Log what was skipped
   - Report in final summary

3. **Clear error messages**
   - Explain what failed
   - Explain why it failed
   - Suggest how to fix

---

## Related Documents

- `schemas.md` - JSON schema for issues.json
- `execution-workflow.md` - Complete execution workflow
- `logging-guide.md` - Structured logging best practices
- `knowledge-update.md` - Knowledge graph update procedures

---

## Usage

This error handling reference is used by:
- **task-executor skill**: To implement error handling logic
- **Users**: To understand how errors are handled
- **Documentation**: To explain error recovery strategies

**Part of:** task-executor skill references for portable, self-contained operation