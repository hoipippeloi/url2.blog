# Task Rules

Every task executed by an agent must include the following:

## Logging Requirements

### Decisions Log
- Record all decisions made at each step
- Document trade-offs considered and why choices were made
- Store in `tasks/TASK-XXX/logs/decisions.json`

### Issues Log
- Document all issues encountered
- Record how each issue was resolved
- Store in `tasks/TASK-XXX/logs/issues.json`

### Test Results
- Log all TDD workflow test results
- Track test cycles (red → green → refactor)
- Store in `tasks/TASK-XXX/logs/tests.json`

### Skills Used
- Track which skills were invoked during execution
- Record skill parameters and outcomes

### Changes Log
- Record all codebase changes relevant to users
- Format for changelog inclusion
- Store in `tasks/TASK-XXX/logs/changes.json`

## Mandatory Workflows

### TDD Workflow
- **Required for all coding tasks**
- Use `tdd-workflow` skill
- Write tests before implementation
- Follow red → green → refactor cycle

### Codebase Context
- Use `codebase-context` skill when understanding existing code
- Identify patterns and conventions to follow

### Svelte 5 Best Practices
- Follow `svelte5-best-practices` skill guidelines
- Use runes, not stores where appropriate
- Leverage Snippets, not slots

### SvelteKit + Tailwind
- Follow `sveltekit-svelte5-tailwind-skill` patterns
- Use proper project structure and conventions

## Documentation Updates

### Task Specification
- Keep spec current if requirements change
- Update task management status

### README Updates
- Update README files when adding new features
- Document new usage patterns or configurations

### Knowledge Graph
- Update after each task completes
- Record metadata, decisions, learnings, patterns, anti-patterns
- Store in `tasks/TASK-XXX/knowledge/`

### User Documentation
- Update docs/ for new end-user features
- Include usage examples and screenshots where helpful

### Developer Notes
- Write journey notes for codebase development
- Document architectural decisions and reasoning

## Post-Task Activities

### Blog Article
- Generate blog post on problems solved and lessons learned
- Use `blog-generator` skill after task completion
- Save to `tasks/TASK-XXX/blog/`

### Changelog
- Update CHANGELOG.md with user-relevant changes
- Include date, task reference, and description

## Task Specification Standard

- Use standard JSON schema for task specs
- Break work into manageable, independent subtasks
- Define clear dependencies between subtasks
- Include success criteria for each subtask
- Store in `specs/TASK-XXX.json`

---

## Quick Reference Checklist

```
[ ] Decisions logged at each step
[ ] Issues and resolutions documented
[ ] TDD tests logged (if coding task)
[ ] Skills used tracked
[ ] Changes logged for changelog
[ ] Knowledge graph updated
[ ] README updated (if relevant)
[ ] User docs updated (if new features)
[ ] Developer notes written
[ ] Blog article generated
[ ] Changelog updated
```
