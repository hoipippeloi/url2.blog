---
name: blog-generator
description: Generate developer-focused blog articles from task execution logs with Patrick Tehubijuluw's friendly, tutorial-focused writing style. Use this skill when you need to create blog articles from completed tasks, document problems solved and lessons learned, or share technical insights with the developer community. Automatically determines appropriate blog category (technology or product) based on task content, generates SEO-optimized frontmatter with AEO fields, includes code examples from task execution, creates FAQ sections from decisions and learnings, and saves to tasks/TASK-XXX/blog/ directory. Always use this skill after /task command completes when user requests blog generation.
---

# Blog Generator Skill

## Rule A: Goals

This skill enables:
- **Transform task logs into blog articles**: Convert structured task execution logs (decisions, issues, tests, changes, learnings, patterns) into compelling developer-focused blog posts
- **Automatic category detection**: Analyze task content and automatically determine whether to write a technology blog (for dev-focused tasks) or product blog (for feature announcements)
- **SEO-optimized frontmatter generation**: Generate complete frontmatter with core fields (title, slug, publishedAt, category, contentType), AEO fields (excerpt, tldr), SEO fields (metaDescription, focusKeyword, secondaryKeywords, faq), and internal tracking fields (status, generated, sources, word_count, reading_time)
- **Patrick Tehubijuluw writing style**: Apply friendly, tutorial-focused writing style (3/10 formality, conversational, encouraging closings like "Have fun!", "Happy designing!")
- **FAQ generation from task insights**: Extract 3-5 FAQ questions from task decisions and generate answers from learnings and patterns
- **Code example extraction**: Include code snippets from task execution with proper syntax highlighting
- **Complete blog output**: Generate full blog articles saved to `tasks/TASK-XXX/blog/YYYY-MM-DD-slug.md` format

## Rule B: Acceptance Criteria

1. **Complete Frontmatter**: Blog article generated with all frontmatter fields populated (core: title, slug, publishedAt, category, contentType; AEO: excerpt, tldr; SEO: metaDescription, focusKeyword, secondaryKeywords, faq array with 3-5 questions; internal: status, generated, sources, word_count, reading_time)

2. **Correct Category Detection**: Blog category (technology or product) correctly determined based on task content analysis using lightfast category guides (technology for dev-focused tasks with code, product for feature announcements)

3. **Writing Style Applied**: Patrick Tehubijuluw writing style applied throughout (3/10 formality, conversational tone, direct address "you", encouraging closings like "Have fun!", "Happy designing!", "See you soon!")

4. **Code Examples Included**: Code examples from task execution included where available (minimum 1 for technology blogs, properly formatted with syntax highlighting)

5. **FAQ Section Generated**: FAQ section with 3-5 questions generated from actual task decisions and learnings (no fabricated questions)

6. **Word Count Met**: Word count within target range (technology: 800-1,500 words, product: 500-1,000 words)

7. **Correct Output Location**: Blog saved to correct directory structure (`tasks/TASK-XXX/blog/YYYY-MM-DD-slug.md` with kebab-case slug)

## Rule C: Decision Management

### Category Detection Logic

**Technology Blog** (800-1,500 words):
- **When**: Task involves coding, new tools, technical discoveries, SDK work, API development
- **Audience**: Developers, engineers, technical decision makers
- **Tone**: Authoritative, data-driven, assumes technical knowledge
- **Required**: Code examples (1+ per major section), technical metrics, implementation details

**Product Blog** (500-1,000 words):
- **When**: Task involves new features, user-facing capabilities, product announcements
- **Audience**: Customers, prospects, product managers
- **Tone**: Professional B2B, benefit-oriented, problem-aware
- **Required**: Pain point identification, feature breakdown, use cases

**Decision Process**:
```
1. Analyze task spec and logs for keywords
2. Check file types modified (.ts, .js, .svelte = technology; docs, config = product)
3. Check skill usage (tdd-workflow, codebase-context = technology; documentation = product)
4. Check requirements/description for product language ("feature", "users", "customers" = product)
5. Default to technology for coding tasks
```

### Writing Style Application

**Patrick Tehubijuluw Style** (3/10 formality):
- **Voice**: Friendly, helpful, enthusiastic, slightly playful
- **Language**: Simple vocabulary, action verbs, conversational markers ("quite simple", "handy right?", "easy right?")
- **Structure**: Short paragraphs (1-3 sentences), numbered lists for steps, generous white space
- **Engagement**: Direct address ("you will learn"), rhetorical questions, personal anecdotes ("I often hear...", "I stumbled upon...")
- **Closings**: Encouraging statements ("Have fun!", "See you soon!", "Happy designing!")

**When to Deviate**:
- Never deviate from Patrick's style for developer blogs
- For product blogs, maintain friendliness but increase formality slightly (4-5/10)
- Never use marketing buzzwords or corporate speak

### Code Example Handling

**Include code when**:
- Task logs contain code snippets in changes.json or tests.json
- Task involves implementation work (not just documentation)
- Code demonstrates key concepts or solutions

**Format requirements**:
- Use proper syntax highlighting (typescript, javascript, svelte, etc.)
- Include copy-paste ready examples
- Add npm/pnpm commands where relevant
- Keep examples focused and minimal

**When no code available**:
- Use conceptual examples or pseudo-code
- Focus on architecture decisions from decisions.json
- Emphasize lessons learned and patterns applied

### FAQ Generation Strategy

**Source questions from**:
- Task decisions (technical decisions become "Why did you..." questions)
- Task learnings (lessons become "How do I..." questions)
- Task issues (problems solved become "What if..." questions)

**Question patterns**:
- "What is [topic]?" → Answer from patterns.json
- "How do I [action]?" → Answer from learnings.json with steps
- "Why [decision]?" → Answer from decisions.json with rationale
- "When should I [approach]?" → Answer from context and trade-offs

**When to skip FAQ**:
- Never skip FAQ for technology blogs (required)
- For very short product blogs (<500 words), 2-3 questions acceptable
- Always generate at least 2 questions minimum

## Rule D: Triggers

**Trigger Description**: "Generate blog articles from task logs with Patrick's writing style and automatic category detection"

Use this skill when the user:
- Requests to "generate blog", "write blog post", or "create article" after task completion
- Mentions "document lessons learned", "share insights", or "write about this task"
- Has completed `/task` command and blog prompt was answered "yes"
- References "TASK-XXX" with request to blog about the work
- Wants to publish technical insights from task execution
- Needs SEO-optimized blog posts from completed development work

## Rule E: Steps, Tasks, and Checklists

### Step 1: Read Task Logs and Knowledge

1. **Action**: Read all JSON files from `tasks/TASK-XXX/logs/` and `tasks/TASK-XXX/knowledge/`
2. **Why**: Extract technical insights, decisions, learnings, patterns, and code examples for blog content
3. **Output**: Complete task data object with all insights

**Files to read**:
```
tasks/TASK-XXX/
  logs/
    decisions.json    → Technical decisions for FAQ and "Why" sections
    issues.json       → Problems solved for hook and challenges section
    tests.json        → Test coverage for credibility metrics
    changes.json      → Code changes for examples
  knowledge/
    metadata.json     → Task stats (duration, skills, files)
    decisions.json    → Deep technical decisions
    learnings.json    → Lessons for FAQ answers
    patterns.json     → Patterns for "What we learned" section
    anti-patterns.json → Avoided pitfalls for "Best practices" section
```

**Checklist**:
```
[ ] All log files read successfully
[ ] All knowledge files read successfully
[ ] Task metadata extracted (skills, duration, files)
[ ] Code examples identified from changes
[ ] FAQ questions extracted from decisions/learnings
```

### Step 2: Determine Blog Category

1. **Action**: Analyze task content using lightfast category guides
2. **Why**: Select appropriate template (technology vs product) for content structure
3. **Output**: Category (technology or product) with confidence score

**Analysis factors**:
```
Technology indicators:
- File types: .ts, .js, .svelte, .py
- Skills: tdd-workflow, codebase-context, svelte5-best-practices
- Keywords: "implement", "API", "SDK", "function", "component", "architecture"
- Code changes > 100 lines

Product indicators:
- Keywords: "feature", "users", "customers", "release", "announcement"
- Skills: documentation-generator
- File types: .md (docs), config files
- User-facing changes
```

**Checklist**:
```
[ ] Category determined (technology or product)
[ ] Confidence score recorded
[ ] Word count target set (tech: 800-1500, product: 500-1000)
[ ] Template structure selected
```

### Step 3: Generate Frontmatter

1. **Action**: Generate all frontmatter fields from task data
2. **Why**: Enable SEO, AEO optimization, and workflow tracking
3. **Output**: Complete frontmatter YAML object

**Frontmatter structure**:
```yaml
---
# Core fields
title: "Blog Post Title from Task"
slug: "blog-post-slug"
publishedAt: "YYYY-MM-DD"
category: "technology" | "product"
contentType: "deep-dive" | "tutorial" | "guide" | "announcement"

# AEO fields
excerpt: "2-3 sentence summary for listings, max 300 chars"
tldr: "80-100 word summary for AI citation"

# SEO nested object
seo:
  metaDescription: "150-160 char meta description with primary keyword"
  focusKeyword: "primary keyword phrase"
  secondaryKeywords:
    - "secondary keyword 1"
    - "secondary keyword 2"
  faq:
    - question: "What is [topic]?"
      answer: "Concise answer optimized for featured snippets."
    - question: "How do I [action]?"
      answer: "Step-by-step answer with specifics."

# Author (hardcoded)
author: "patrick-tehubijuluw"

# Internal fields (stripped before publish)
_internal:
  status: draft
  generated: "YYYY-MM-DDTHH:MM:SSZ"
  sources:
    - "https://source1.com"
    - "https://source2.com"
  word_count: 1200
  reading_time: "6 min"
---
```

**Checklist**:
```
[ ] Core fields generated (title, slug, publishedAt, category, contentType)
[ ] AEO fields generated (excerpt, tldr)
[ ] SEO fields generated (metaDescription, focusKeyword, secondaryKeywords, faq)
[ ] FAQ has 3-5 questions from decisions/learnings
[ ] Internal fields populated (status, generated, sources, word_count, reading_time)
[ ] Slug is kebab-case, no category prefix
[ ] Reading time calculated (word_count / 200)
```

### Step 4: Generate Blog Content

1. **Action**: Generate full blog content using Patrick's writing style and category template
2. **Why**: Create engaging, tutorial-focused content that resonates with developer audience
3. **Output**: Complete blog post in markdown format

**Technology blog structure**:
```markdown
## [Technical Problem/Hook]

[1-2 paragraphs introducing the technical challenge]

**Key metrics:**
- [Data point from task: files modified, tests written, duration]

---

## [Technical Deep-Dive Section]

[Layer 1: Foundation explanation]

```typescript
// Code example from task logs
```

[Layer 2: Implementation details]

---

## How We Built It

[Natural positioning with technical specifics]

**What's included:**
- [Capability 1 from task]
- [Capability 2 from task]

---

## Why We Built It This Way

[1-2 paragraphs on architectural decisions from decisions.json]

---

## Lessons Learned

[From learnings.json and patterns.json]

---

## Frequently Asked Questions

**Q: [Question from decisions]?**
A: [Answer from learnings]

**Q: [Question from patterns]?**
A: [Answer with steps]

---

## Resources

- [Task references from sources]
```

**Product blog structure**:
```markdown
## [Market Shift/Pain Point]

[1-2 paragraphs identifying the problem]

---

## What We Built

[What it is and high-level purpose]

**Key capabilities:**
- [Capability 1]: [Benefit]
- [Capability 2]: [Benefit]
- [Capability 3]: [Benefit]

---

## How It Works

[Brief explanation]

---

## Use Cases

**[Use case 1]**: [How it helps]

**[Use case 2]**: [How it helps]

---

## Frequently Asked Questions

**Q: [Question]?**
A: [Clear answer]

---

## Get Started

[Next steps]
```

**Writing style checklist**:
```
[ ] Patrick's style applied (3/10 formality, conversational)
[ ] Short paragraphs (1-3 sentences)
[ ] Direct address ("you will learn")
[ ] Rhetorical questions included
[ ] Code examples formatted with syntax highlighting
[ ] Encouraging closing ("Have fun!", "Happy designing!")
[ ] Word count within target (tech: 800-1500, product: 500-1000)
```

### Step 5: Save Blog Post

1. **Action**: Save blog to `tasks/TASK-XXX/blog/YYYY-MM-DD-slug.md`
2. **Why**: Store in correct location for workflow tracking and publishing
3. **Output**: Blog file saved successfully

**File naming**:
```
Format: tasks/TASK-XXX/blog/YYYY-MM-DD-slug.md
Example: tasks/TASK-001/blog/2025-01-15-spec-creator-skill.md
```

**Checklist**:
```
[ ] Blog directory created (tasks/TASK-XXX/blog/)
[ ] File saved with correct naming convention
[ ] Frontmatter includes complete YAML block
[ ] Content follows markdown format
[ ] All sections present per category template
```

## Rule F: Human Interaction

### When to Request Human Approval

**Required before:**
- Publishing blog post (changing _internal.status from "draft" to "published")
- Blog contains sensitive information (API keys, internal URLs, proprietary algorithms)
- Task involved security fixes or vulnerabilities (require careful wording)
- Word count significantly outside target range (<700 or >1600 for technology)

**Request format**:
```
Blog post generated: tasks/TASK-XXX/blog/YYYY-MM-DD-slug.md

Stats:
- Word count: XXXX (target: 800-1500)
- Category: technology | product
- FAQ questions: X
- Code examples: X

Ready to publish? [yes/no/adjust]
```

### When to Request Human Advice

**Recommended for:**
- Category detection confidence <70% (unclear if technology or product)
- No code examples available for technology blog
- Task logs sparse or incomplete (<3 decisions, <2 learnings)
- Multiple valid title/slug options with different SEO implications

**Request format**:
```
Need guidance for TASK-XXX blog:

Issue: [Describe issue]

Options:
- Option A: [description, pros/cons]
- Option B: [description, pros/cons]

Which approach should I take?
```

### When to Request Human Feedback

**Required after:**
- Blog generation complete (present summary for review)
- FAQ section generated (verify questions are accurate)
- Technical decisions described (verify accuracy of rationale)

**Request format**:
```
Blog post generated for TASK-XXX!

Title: [Title]
Category: [technology/product]
Word count: [XXXX]
Reading time: [X min]
FAQ: [X questions]

Preview: tasks/TASK-XXX/blog/YYYY-MM-DD-slug.md

Does this look accurate and complete? [yes/no/adjust]
```

## Rule G: Permissions

**Required:**
- File system read access to `tasks/TASK-XXX/logs/` directory
- File system read access to `tasks/TASK-XXX/knowledge/` directory
- File system write access to `tasks/TASK-XXX/blog/` directory
- Read access to references/ for writing style and templates

**Scope:**
- Can read all JSON log files from task execution
- Can read all knowledge graph files
- Can create/modify files only in `tasks/TASK-XXX/blog/` directory
- Cannot modify task logs or knowledge files (read-only)
- Cannot access files outside tasks/ directory
- Cannot publish blogs externally (only generates draft files)

## Rule H: Tool Usage

**Required Tools:**
- `read_file` - Read task logs and knowledge JSON files
- `list_directory` or `glob` - Scan tasks/TASK-XXX/ for available files
- `create_file` or `edit_file` - Write blog post to blog/ directory
- `create_directory` - Create blog/ directory if needed

**Command Patterns**:
```bash
# Read task logs
read_file tasks/TASK-001/logs/decisions.json
read_file tasks/TASK-001/knowledge/learnings.json

# Create blog directory
create_directory tasks/TASK-001/blog/

# Write blog post
create_file tasks/TASK-001/blog/2025-01-15-slug.md
```

**Tool Call Sequence**:
1. Use `list_directory` to scan tasks/TASK-XXX/ for logs/ and knowledge/ directories
2. Use `read_file` to read all JSON files from logs/ and knowledge/
3. Analyze task content to determine category
4. Generate frontmatter with all fields
5. Generate blog content with Patrick's writing style
6. Use `create_directory` to create blog/ directory if needed
7. Use `create_file` to write complete blog post

## Rule I: Format and Structure

This skill follows agent-friendly markdown format:

```markdown
# Blog Generator Skill
## Rule A: Goals
## Rule B: Acceptance Criteria
## Rule C: Decision Management
## Rule D: Triggers
## Rule E: Steps, Tasks, and Checklists
## Rule F: Human Interaction
## Rule G: Permissions
## Rule H: Tool Usage
## Rule J: README Documentation (see README.md)
## Limits
```

**Content Guidelines**:
- ✅ Numbered steps for sequences
- ✅ Bullets for lists
- ✅ Code blocks for commands and examples
- ✅ Decision trees using if/then format
- ❌ NO intros, fluff, or embedded large docs
- ✅ Progressive disclosure (core in body, details in references/)

## Rule J: README Documentation

See `README.md` in this skill directory for:
- Installation instructions
- Features overview
- When to use this skill
- Usage examples with blog generation
- Patrick Tehubijuluw writing style summary
- Lightfast blog templates reference

## Limits

### What This Skill Does Not Cover

- **Blog publishing**: Does not publish blogs externally (only generates draft files in tasks/TASK-XXX/blog/)
- **Image generation**: Does not create screenshots or diagrams (references them in content)
- **SEO submission**: Does not submit blogs to search engines or social media
- **Content strategy**: Does not plan blog calendar or content strategy
- **Analytics**: Does not track blog performance or readership metrics

### Anti-Use Cases

Do NOT use this skill for:
- Tasks without completed logs (must have decisions.json, learnings.json minimum)
- Personal blogs not related to task execution (use general writing tools)
- Marketing copy or press releases (different style required)
- Academic papers or technical documentation (use documentation-generator skill)
- Tasks with sensitive/security content without human review

### Resource Requirements

- **Task logs**: tasks/TASK-XXX/logs/ must exist with at least decisions.json
- **Knowledge files**: tasks/TASK-XXX/knowledge/ must exist with learnings.json
- **References**: references/ folder must contain writing style profile and blog templates
- **Minimum content**: At least 3 decisions and 2 learnings for quality blog generation

## References

*For Patrick Tehubijuluw writing style profile, see `references/patrick-writing-style.md`*
*For lightfast blog templates, see `references/lightfast-templates.md`*
*For category detection logic, see `references/category-guides.md`*
*For frontmatter schema, see `references/frontmatter-schema.md`*