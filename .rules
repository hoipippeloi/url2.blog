# AGENTS.md — Repository principles and rules

# Golden guidelines for every change and task we do

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Quick Start

1. Run tests (TDD) before any change: `npm test` or `pytest`
2. Use [`openmemory.md`](openmemory.md) for querying and storing relevant, concise data and information

## Core Operating Principles

### 1. Test-First Always
- Write tests BEFORE implementation
- No PR merges without passing tests

### 2. Architecture Boundaries
- Code flows: Types → Config → Repo → Service → Runtime → UI
- Cross-cutting concerns via Providers only
- Violations blocked by linters

### 3. Knowledge In-Repo
- Slack/docs external = invisible to agents
- All decisions documented in [`/docs/decisions/`](/docs/decisions/)
- Stale docs = tech debt

### 4. Progressive Disclosure
- Start small, follow links deeper
- Don't load everything into context at once
- Use this file as your map

### 5. Mechanical Enforcement
- Linters enforce architecture
- CI validates structure
- Custom rules have remediation messages

---

## Workflow

### New Feature
1. Create execution plan in /specs
2. Write failing tests in [`tests/`](tests/)
3. Implement to pass tests
4. Update docs if behavior changes
5. Run quality checks
6. Open PR

### Bug Fix
1. Reproduce in test
2. Fix to pass test
3. Log root cause in plan
4. Prevent regression

### Refactor
1. Ensure test coverage
2. Refactor
3. Verify tests pass
4. Update quality score

---

## Review Philosophy

- Agent-to-agent review preferred
- Human review for judgment calls
- Short-lived branches
- Fix flakes with re-runs, not blocks
- Automerge when quality gates pass

---

## Golden Principles

1. **Shared utilities > hand-rolled helpers** — Keep invariants centralized
2. **Validate boundaries** — No YOLO data probing
3. **Typed SDKs over guessed shapes** — Agents can't build on assumptions
4. **Continuous garbage collection** — Small refactors daily > big rewrites monthly

---

## Escalation

Escalate to human when:
- Architecture decision required
- User judgment needed
- Security boundary touched
- Quality score drops below threshold
