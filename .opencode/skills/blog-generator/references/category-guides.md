# Category Detection Guides

Reference guides for automatically determining blog category (technology vs product) based on task content analysis.

---

## Overview

The blog-generator skill automatically categorizes blog posts as either **technology** or **product** based on analysis of task execution logs, knowledge files, and task specifications. This document defines the detection logic, indicators, and decision matrix.

---

## Technology Blog Category

**Category ID**: `technology`

**Content Types**: `deep-dive`, `tutorial`, `guide`, `case-study`, `comparison`

**Word Count**: 800-1,500 words

**Audience**: Developers, engineers, technical decision makers

### Detection Indicators

#### Strong Indicators (High Confidence)

| Indicator | Signal | Confidence |
|-----------|--------|------------|
| File types modified | `.ts`, `.js`, `.svelte`, `.py`, `.go`, `.rs` | +30% |
| Skills invoked | `tdd-workflow`, `codebase-context`, `svelte5-best-practices` | +25% |
| Code changes > 100 lines | Significant implementation work | +25% |
| Keywords in spec | "implement", "API", "SDK", "function", "component", "architecture", "refactor" | +20% |
| Test files created | `.test.ts`, `.spec.ts`, `__tests__/` | +20% |

#### Moderate Indicators (Medium Confidence)

| Indicator | Signal | Confidence |
|-----------|--------|------------|
| Technical decisions | Architecture, patterns, algorithms in decisions.json | +15% |
| Performance metrics | Benchmarks, latency, throughput mentioned | +15% |
| External citations | Links to technical docs, RFCs, specifications | +10% |
| Code examples | Snippets in changes.json or knowledge | +15% |

#### Weak Indicators (Low Confidence)

| Indicator | Signal | Confidence |
|-----------|--------|------------|
| Task duration > 60 min | Complex technical work | +5% |
| Multiple files modified | >5 files touched | +5% |
| Technical learnings | Pattern-based learnings in knowledge | +5% |

### Decision Keywords

**High-signal technology keywords**:
- implement, build, develop, create (when referring to code)
- API, endpoint, route, handler
- function, method, class, component
- architecture, design pattern, algorithm
- refactor, optimize, performance
- test, spec, unit test, integration test
- SDK, library, package, module
- database, query, schema, migration
- authentication, authorization, security
- deployment, CI/CD, pipeline

**Example task descriptions that indicate technology**:
- "Implement user authentication with JWT tokens"
- "Refactor data layer for better performance"
- "Build REST API for user management"
- "Add unit tests for authentication module"
- "Optimize database queries for faster loading"

---

## Product Blog Category

**Category ID**: `product`

**Content Types**: `announcement`, `guide`, `tutorial`

**Word Count**: 500-1,000 words

**Audience**: Customers, prospects, product managers

### Detection Indicators

#### Strong Indicators (High Confidence)

| Indicator | Signal | Confidence |
|-----------|--------|------------|
| Keywords in spec | "feature", "release", "launch", "users", "customers" | +30% |
| User-facing changes | UI components, user flows, onboarding | +25% |
| Skills invoked | `documentation-generator`, `frontend-design` | +20% |
| Release notes | CHANGELOG.md entries with "New feature" | +25% |

#### Moderate Indicators (Medium Confidence)

| Indicator | Signal | Confidence |
|-----------|--------|------------|
| Benefit-oriented language | "streamline", "simplify", "easier", "faster" | +15% |
| Pain point mentioned | Problem statement for users | +15% |
| Use cases described | User scenarios in spec | +10% |
| Availability info | "Available starting", "Rolling out" | +15% |

#### Weak Indicators (Low Confidence)

| Indicator | Signal | Confidence |
|-----------|--------|------------|
| Marketing materials | Press release, announcement draft | +5% |
| Screenshots added | UI screenshots in assets | +5% |
| Customer feedback | User testimonials, quotes | +5% |

### Decision Keywords

**High-signal product keywords**:
- feature, release, launch, announce
- users, customers, clients
- benefit, value, improve, enhance
- streamline, simplify, automate
- dashboard, interface, UI, UX
- workflow, process, operation
- availability, release date, beta
- pricing, plan, tier, subscription

**Example task descriptions that indicate product**:
- "Launch new dashboard feature for analytics"
- "Release automated reporting for enterprise customers"
- "Announce beta availability of AI workflows"
- "Improve onboarding flow for new users"
- "Add team collaboration features"

---

## Decision Matrix

### Classification Algorithm

```
1. Initialize confidence scores:
   technology_confidence = 0
   product_confidence = 0

2. Analyze task spec description:
   - Scan for technology keywords → +technology_confidence
   - Scan for product keywords → +product_confidence

3. Analyze files modified:
   - Code files (.ts, .js, .svelte, .py) → +technology_confidence
   - Docs/config files → +product_confidence

4. Analyze skills invoked:
   - tdd-workflow, codebase-context → +technology_confidence
   - documentation-generator → +product_confidence

5. Analyze changes.json:
   - Lines changed > 100 → +technology_confidence
   - UI files modified → +product_confidence

6. Analyze knowledge/decisions.json:
   - Technical decisions → +technology_confidence
   - User-facing decisions → +product_confidence

7. Determine category:
   if technology_confidence > product_confidence + 20:
       category = "technology"
       confidence = technology_confidence
   elif product_confidence > technology_confidence + 20:
       category = "product"
       confidence = product_confidence
   else:
       # Too close to call, use tiebreaker
       if code_files_count > doc_files_count:
           category = "technology"
           confidence = 50 + (technology_confidence - product_confidence)
       else:
           category = "product"
           confidence = 50 + (product_confidence - technology_confidence)

8. Validate confidence:
   if confidence < 60:
       flag for human review
       log uncertainty reason
```

### Confidence Thresholds

| Confidence | Action |
|------------|--------|
| 80-100% | Auto-categorize, no review needed |
| 60-79% | Auto-categorize, log for monitoring |
| 40-59% | Flag for human review before publishing |
| <40% | Require human decision, cannot auto-categorize |

---

## Tiebreaker Rules

When technology and product confidence scores are within 20 points:

### Use Technology When:
- Code changes > 200 lines
- Test files created or modified
- Technical architecture decisions in decisions.json
- Performance optimizations mentioned
- Security improvements implemented

### Use Product When:
- User-facing UI changes present
- Benefit-oriented language in spec
- Release/launch timeline mentioned
- Customer impact described
- Marketing/announcement context present

### Default Fallback:
- **Default to technology** for coding tasks (safer assumption)
- **Default to product** for documentation-only tasks

---

## Edge Cases

### Case 1: Full-Stack Feature Development

**Scenario**: Task involves both backend API (technology) and frontend UI (product)

**Resolution**:
- If backend work > 60% of changes → technology
- If frontend UI > 60% of changes → product
- If balanced (40-60% each) → technology (default for coding tasks)

### Case 2: Technical Documentation

**Scenario**: Task creates technical docs (API docs, architecture docs)

**Resolution**:
- API reference, SDK docs → technology (audience is developers)
- User guides, how-to docs → product (audience is users)
- Architecture decision records → technology

### Case 3: Performance Optimization

**Scenario**: Task optimizes existing feature for speed

**Resolution**:
- Backend optimization (queries, algorithms) → technology
- Frontend optimization (UX, loading states) → product
- Both present → technology (performance is technical)

### Case 4: Bug Fix

**Scenario**: Task fixes a bug

**Resolution**:
- Security bug → technology
- Performance bug → technology
- UI/UX bug → product
- Default → technology (bug fixes are typically technical)

---

## Examples

### Example 1: Clear Technology

**Task Spec**:
```
"Implement JWT-based authentication with refresh tokens"
```

**Analysis**:
- Keywords: "implement", "JWT", "authentication", "tokens" → +80% technology
- Files: `src/auth.ts`, `src/auth.test.ts` → +30% technology
- Skills: tdd-workflow → +25% technology

**Result**: `technology` (95% confidence)

---

### Example 2: Clear Product

**Task Spec**:
```
"Launch new analytics dashboard for enterprise customers"
```

**Analysis**:
- Keywords: "launch", "dashboard", "customers", "enterprise" → +70% product
- Files: `docs/analytics-guide.md`, `src/Dashboard.svelte` → +40% product
- Skills: frontend-design → +20% product

**Result**: `product` (85% confidence)

---

### Example 3: Mixed (Technology Default)

**Task Spec**:
```
"Build user profile page with settings management"
```

**Analysis**:
- Keywords: "build", "page", "settings", "management" → +40% technology, +30% product
- Files: `src/Profile.svelte`, `src/api/profile.ts` → +30% technology, +20% product
- Skills: svelte5-best-practices → +15% technology

**Result**: `technology` (65% confidence) - default for coding tasks

---

## Implementation Notes

### For AI Agents

When implementing category detection:

1. **Scan all inputs**: Read task spec, logs, knowledge files
2. **Weight recent signals higher**: Task spec description > file types > skills
3. **Look for combinations**: Single keyword = weak, multiple = strong
4. **Consider audience**: Who benefits from this blog? (developers vs users)
5. **When uncertain**: Default to technology for code, product for features
6. **Log reasoning**: Always record why a category was chosen

### For Human Review

When category detection flags for review:

1. **Review confidence score**: <60% needs human decision
2. **Check top indicators**: What drove the classification?
3. **Consider blog purpose**: Is this teaching devs or announcing to users?
4. **Make final call**: Choose technology or product based on primary audience
5. **Update detection logic**: If wrong, note why to improve algorithm

---

## Usage

This category detection logic is used by:
- **blog-generator skill**: To automatically categorize blog posts
- **content-generator**: To select appropriate template structure
- **frontmatter-generator**: To set category field correctly

See `lightfast-templates.md` for template structures per category.
See `patrick-writing-style.md` for writing style guidelines.
See `frontmatter-schema.md` for category field specifications.