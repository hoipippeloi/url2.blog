# Documentation Update Reference

Reference documentation for automatic documentation updates performed by the task-executor skill.

---

## Overview

The task-executor skill automatically updates documentation files based on the type of work completed in each task. This ensures documentation stays in sync with code changes and new features.

---

## Documentation Update Decision Matrix

| File | When Updated | Trigger Condition |
|------|--------------|-------------------|
| CHANGELOG.md | Always | Every task makes some change |
| README.md | Conditional | New public feature, API change, or new skill |
| docs/ | Conditional | User-facing feature changes |
| dev-notes.md | Conditional | Complex logic, new patterns, or significant technical decisions |

---

## CHANGELOG.md Updates

### Always Updated

**Every task** adds an entry to CHANGELOG.md regardless of work type.

**Format:**
```markdown
## [Date] - TASK-XXX

### Added
- New features or files added

### Changed
- Modified functionality

### Fixed
- Bug fixes

### Removed
- Deleted features or files

### Technical
- Technical implementation details
```

**Example entry:**
```markdown
## 2025-01-15 - TASK-001

### Added
- spec-creator skill for interactive spec creation
- spec-creator/README.md with installation and usage
- spec-creator/references/ with JSON schemas

### Changed
- README.md updated to include spec-creator in available skills
- skills.json registered new spec-creator skill

### Technical
- Follows all 10 skill rules (A-J). See `skill-rules.md`
- Interview workflow with 6 questions asked one at a time
- Spec output to specs/TASK-XXX.json format
```

**Update process:**
```
1. Read existing CHANGELOG.md
2. Create new entry header with date and task ID
3. Categorize changes (Added, Changed, Fixed, Removed, Technical)
4. Prepend entry to top of CHANGELOG.md
5. Save file
```

---

## README.md Updates

### When Updated

README.md is updated when:
- New public feature is added
- New skill is created in skills/ directory
- Public API changes
- New capability available to users
- Feature removal or deprecation

### Update Triggers

| Trigger | Action |
|---------|--------|
| New skill created | Add to "Available Skills" section |
| New feature | Add to "Features" section |
| New command | Add to "Commands" or "Usage" section |
| API change | Update "API" or "Integration" section |
| Breaking change | Add to "Breaking Changes" notice |

### Update Format

**Skills list entry:**
```markdown
- **skill-name** - Description from SKILL.md frontmatter. Use this skill when you need to...
```

**Installation command:**
```bash
npx skills add creatuluw/agent-skills --skill skill-name
```

**Features section:**
```markdown
- **Feature name** - Brief description of capability
```

### Example Update

**Before:**
```markdown
#### Skills in this repository:

- **spec-creator** - Interactive spec creation...
```

**After:**
```markdown
#### Skills in this repository:

- **spec-creator** - Interactive spec creation...
- **task-executor** - Execute tasks from structured JSON specifications...
```

---

## docs/ Updates

### When Updated

User documentation in `docs/` is updated when:
- User-facing features change
- User workflows are modified
- New user capabilities added
- Configuration options change
- Integration points change

### Documentation Types

| Type | Location | When Updated |
|------|----------|--------------|
| User guides | docs/user-guide/ | New user features |
| API docs | docs/api/ | API endpoint changes |
| Integration docs | docs/integration/ | New integrations |
| Configuration | docs/config/ | Config options change |

### Update Process

```
1. Identify user-facing changes from task
2. Determine which docs need updating
3. Update relevant documentation files
4. Add new docs if new feature requires
5. Update docs index/navigation if needed
```

### Example

**New authentication feature:**
```
docs/
  ├── user-guide/
  │   └── authentication.md    # New file
  ├── api/
  │   └── auth-endpoints.md    # New file
  └── README.md                # Updated with links
```

---

## dev-notes.md Updates

### When Updated

Developer notes are updated when:
- Complex logic is implemented
- New architectural patterns introduced
- Significant technical decisions made
- Performance optimizations added
- Refactoring with structural changes
- New development workflows established

### Content Guidelines

**Include:**
- Technical decision rationale
- Architecture trade-offs
- Implementation details
- Performance considerations
- Security implications
- Migration notes for developers

**Exclude:**
- Obvious or self-documenting code
- Trivial implementation details
- Temporary workarounds (document in comments instead)

### Format

```markdown
## TASK-XXX: [Feature Name]

### Date
YYYY-MM-DD

### Overview
Brief description of what was built and why.

### Technical Decisions

#### Decision 1: [Name]
**Context**: Situation that required decision
**Options**: Alternatives considered
**Choice**: What was chosen
**Rationale**: Why this choice was made

### Architecture Changes

#### Change 1: [Name]
**What changed**: Description
**Why**: Reason for change
**Impact**: Effects on system

### Implementation Details

**Files modified:**
- path/to/file1.ts - Purpose
- path/to/file2.ts - Purpose

**Key functions:**
- `functionName()` - Purpose and behavior

### Patterns Applied

- **Pattern 1**: Name and description
- **Pattern 2**: Name and description

### Performance Considerations

- Benchmark results if applicable
- Optimization strategies used
- Trade-offs made

### Security Considerations

- Security measures implemented
- Threats addressed
- Remaining risks

### Migration Notes

For developers updating from previous version:
- Breaking changes
- Required updates
- Deprecation notices

### Testing Strategy

- Test types written
- Coverage achieved
- Test patterns used

### Related Tasks

- TASK-XXX: Related task 1
- TASK-XXX: Related task 2

---

*Written: YYYY-MM-DD*
*Author: task-executor skill*
```

---

## Documentation Update Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│              Documentation Update Workflow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANALYZE TASK CHANGES                                        │
│     └─► Identify what files were modified                       │
│     └─► Determine change type (feature, bugfix, refactor, docs) │
│     └─► Assess user impact                                      │
│     └─► Assess developer impact                                 │
│                                                                  │
│  2. CLASSIFY DOCUMENTATION NEEDS                                │
│     └─► CHANGELOG.md: Always update                             │
│     └─► README.md: If public-facing change                      │
│     └─► docs/: If user workflow changes                         │
│     └─► dev-notes.md: If complex/technical change               │
│                                                                  │
│  3. UPDATE DOCUMENTS                                            │
│     └─► CHANGELOG.md: Add entry                                 │
│     └─► README.md: Update relevant sections                     │
│     └─► docs/: Update or create user docs                       │
│     └─► dev-notes.md: Document technical decisions              │
│                                                                  │
│  4. VALIDATE                                                    │
│     └─► Check all updates are consistent                        │
│     └─► Verify links work                                       │
│     └─► Ensure formatting correct                               │
│                                                                  │
│  5. SAVE                                                        │
│     └─► Write all updated files                                 │
│     └─► Log changes in changes.json                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Decision Logic

### CHANGELOG.md Decision

**Always update.** Every task produces some change.

```javascript
function shouldUpdateChangelog(task) {
  return true; // Always
}
```

### README.md Decision

**Update if public-facing:**

```javascript
function shouldUpdateReadme(task) {
  const isPublicFacing = 
    task.changes.some(c => c.isPublicFeature) ||
    task.changes.some(c => c.isNewSkill) ||
    task.changes.some(c => c.isAPIChange);
  
  return isPublicFacing;
}
```

**Triggers:**
- `isNewSkill` = true → Update README skills list
- `isPublicFeature` = true → Update README features
- `isAPIChange` = true → Update README API section

### docs/ Decision

**Update if user-facing:**

```javascript
function shouldUpdateUserDocs(task) {
  const isUserFacing =
    task.changes.some(c => c.affectsUserWorkflow) ||
    task.changes.some(c => c.isUserFeature) ||
    task.changes.some(c => c.isConfigChange);
  
  return isUserFacing;
}
```

**Triggers:**
- `affectsUserWorkflow` = true → Update user guides
- `isUserFeature` = true → Add feature docs
- `isConfigChange` = true → Update config docs

### dev-notes.md Decision

**Update if complex:**

```javascript
function shouldUpdateDevNotes(task) {
  const isComplex =
    task.changes.some(c => c.hasComplexLogic) ||
    task.changes.some(c => c.isNewPattern) ||
    task.changes.some(c => c.isArchitecturalChange) ||
    task.changes.some(c => c.hasSignificantDecisions);
  
  return isComplex;
}
```

**Triggers:**
- `hasComplexLogic` = true → Document logic
- `isNewPattern` = true → Document pattern
- `isArchitecturalChange` = true → Document architecture
- `hasSignificantDecisions` = true → Document decisions

---

## Examples

### Example 1: New Skill Creation

**Task:** Create spec-creator skill

**Documentation updates:**
- ✅ CHANGELOG.md - Entry for new skill
- ✅ README.md - Add to skills list
- ❌ docs/ - Not user-facing change
- ✅ dev-notes.md - Document skill creation pattern

**CHANGELOG.md entry:**
```markdown
## 2025-01-15 - TASK-001

### Added
- spec-creator skill with SKILL.md (10 rules compliant)
- spec-creator/README.md
- spec-creator/references/ with schemas

### Changed
- README.md skills list updated
- skills.json updated with new skill

### Technical
- Implements /spec command workflow
- Interview pattern with 6 questions
- Spec output to specs/TASK-XXX.json
```

**README.md update:**
```markdown
- **spec-creator** - Interactive spec creation and task decomposition...
```

**dev-notes.md entry:**
```markdown
## TASK-001: Spec Creator Skill

### Technical Decisions

#### Decision 1: Interview Workflow
**Context**: Need to gather complete requirements
**Options**: One-shot spec vs iterative interview
**Choice**: Iterative interview (6 questions)
**Rationale**: Better requirements capture, user approval at each step
```

### Example 2: User Authentication Feature

**Task:** Implement user authentication

**Documentation updates:**
- ✅ CHANGELOG.md - Entry for auth feature
- ✅ README.md - New public feature
- ✅ docs/ - User auth workflow
- ✅ dev-notes.md - Complex security decisions

**CHANGELOG.md entry:**
```markdown
## 2025-01-15 - TASK-002

### Added
- User authentication with email/password
- Login/logout endpoints
- JWT session management
- Password hashing with bcrypt

### Changed
- User model updated with auth fields

### Technical
- bcrypt for password hashing
- JWT for stateless sessions
- TDD workflow enforced
- 15 tests written, all passing
```

**docs/ update:**
```
docs/
  ├── user-guide/
  │   └── authentication.md    # How to use auth
  └── api/
      └── auth-endpoints.md    # API reference
```

**dev-notes.md entry:**
```markdown
## TASK-002: User Authentication

### Technical Decisions

#### Decision 1: Password Hashing
**Context**: Need secure password storage
**Options**: bcrypt vs argon2 vs scrypt
**Choice**: bcrypt
**Rationale**: Widely adopted, well-tested, good security

#### Decision 2: Session Management
**Context**: Need stateless sessions
**Options**: JWT vs sessions vs OAuth
**Choice**: JWT
**Rationale**: Stateless, scalable, easy integration

### Security Considerations

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire after 24 hours
- HTTPS required for all auth endpoints
- Rate limiting on login attempts
```

---

## Best Practices

### For CHANGELOG.md

1. **Be specific** - Mention exact files and features
2. **Categorize** - Use Added, Changed, Fixed, Removed, Technical
3. **Include task ID** - Reference TASK-XXX
4. **Keep chronological** - Newest entries at top
5. **Be consistent** - Use same format every time

### For README.md

1. **Update incrementally** - Only change what's needed
2. **Test links** - Verify all links work after update
3. **Match format** - Follow existing skill entry format
4. **Include installation** - Add npx skills command
5. **Keep concise** - One paragraph per skill/feature

### For docs/

1. **User-focused** - Write for end users, not developers
2. **Examples** - Include usage examples
3. **Screenshots** - Add visuals when helpful
4. **Navigation** - Update docs index if adding new files
5. **Version** - Note which version docs apply to

### For dev-notes.md

1. **Decision-focused** - Emphasize why, not just what
2. **Trade-offs** - Document alternatives considered
3. **Code references** - Link to relevant code sections
4. **Performance** - Include benchmarks if relevant
5. **Security** - Document security decisions thoroughly

---

## Related Documents

- `schemas.md` - JSON schema for changes.json log
- `task-execution-workflow.md` - Complete execution workflow
- `skill-orchestration.md` - Skill decision logic
- `knowledge-update.md` - Knowledge graph update procedures

---

## Usage

This documentation update reference is used by:
- **task-executor skill**: To implement automatic doc updates
- **spec-creator skill**: To understand doc requirements in specs
- **Users**: To understand what docs get updated
- **Documentation**: To explain system behavior

**Part of:** task-executor skill references for portable, self-contained operation