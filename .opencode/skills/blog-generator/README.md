# Blog Generator

Generate developer-focused blog articles from task execution logs with Patrick Tehubijuluw's friendly, tutorial-focused writing style.

## Installation

Install via skills.sh CLI:
```bash
npx skills add creatuluw/agent-skills --skill blog-generator
```

Or manually:
1. Copy the `skills/blog-generator` directory to your skills folder
2. Ensure `SKILL.md` is in the root directory

## Features

- **Automatic Blog Generation** - Transform task execution logs into compelling developer-focused blog articles
- **Smart Category Detection** - Automatically determines technology vs product blog based on task content analysis
- **SEO-Optimized Frontmatter** - Complete frontmatter with core fields, AEO fields (excerpt, tldr), SEO fields (metaDescription, focusKeyword, FAQ), and internal tracking
- **Patrick Tehubijuluw Writing Style** - Friendly, tutorial-focused writing (3/10 formality, conversational, encouraging closings)
- **FAQ Generation** - Extracts 3-5 FAQ questions from task decisions and learnings
- **Code Example Integration** - Includes code snippets from task execution with proper syntax highlighting
- **Lightfast Templates** - Follows technology and product blog templates from lightfast blog-writer
- **Reading Time Calculation** - Automatic reading time estimation (word_count / 200)
- **Slug Generation** - Automatic kebab-case slug generation from title

## When to Use

Use this skill when:
- You need to create blog articles from completed tasks after `/task` command
- You want to document problems solved and lessons learned from task execution
- You want to share technical insights with the developer community
- You need SEO-optimized blog posts with AEO fields for AI citation
- User requested blog generation at task completion (answered "yes" to blog prompt)
- You want to transform task logs into publishable technical content

**Do NOT use for:**
- Tasks without completed logs (must have decisions.json, learnings.json minimum)
- Personal blogs not related to task execution
- Marketing copy or press releases (different style required)
- Academic papers or technical documentation (use documentation-generator skill)

## Usage

### Basic Usage

1. **Complete a task with /task command:**
   ```bash
   /task specs/TASK-001.json
   ```

2. **When prompted for blog generation, answer "yes":**
   ```
   ✅ Task TASK-001 completed successfully!
   
   📝 Generate blog article about this task?
      This will capture problems solved and lessons learned.
      [yes] [no] [maybe later]
   
   Your response: yes
   ```

3. **Blog generator creates article:**
   ```
   tasks/TASK-001/
     blog/
       2025-01-15-spec-creator-skill.md  ← Generated blog
   ```

### Manual Invocation

```bash
/blog TASK-001
```

This generates a blog article from TASK-001 logs even if you skipped blog generation during task completion.

### Output Structure

Generated blogs follow this structure:
```markdown
---
# Core fields
title: "Blog Post Title"
slug: "blog-post-slug"
publishedAt: "2025-01-15"
category: "technology" | "product"
contentType: "deep-dive" | "tutorial" | "guide" | "announcement"

# AEO fields
excerpt: "2-3 sentence summary for listings"
tldr: "80-100 word summary for AI citation"

# SEO fields
seo:
  metaDescription: "150-160 char meta description"
  focusKeyword: "primary keyword phrase"
  secondaryKeywords:
    - "keyword 1"
    - "keyword 2"
  faq:
    - question: "What is [topic]?"
      answer: "Concise answer for featured snippets."

# Internal tracking
_internal:
  status: draft
  generated: "2025-01-15T14:30:00Z"
  word_count: 1200
  reading_time: "6 min"
---

## [Technical Problem/Hook]

[Content with Patrick's writing style...]

## Frequently Asked Questions

**Q: [Question]?**
A: [Answer from task learnings]

---

Have fun!
```

## Blog Categories

### Technology Blogs (800-1,500 words)

**When**: Task involves coding, new tools, technical discoveries, SDK work, API development

**Audience**: Developers, engineers, technical decision makers

**Structure**:
- Technical problem/hook
- Data/research backing
- Technical deep-dive with code examples
- Solution/product positioning
- FAQ section (3-5 questions)
- Resources/links

### Product Blogs (500-1,000 words)

**When**: Task involves new features, user-facing capabilities, product announcements

**Audience**: Customers, prospects, product managers

**Structure**:
- Market shift/pain point
- Feature introduction
- Key capabilities (bulleted)
- Use cases
- FAQ section (3-5 questions)
- Availability/next steps

## Writing Style

Blogs are written in **Patrick Tehubijuluw's style**:
- **Formality**: 3/10 (friendly, conversational)
- **Tone**: Helpful, enthusiastic, slightly playful
- **Structure**: Short paragraphs (1-3 sentences), numbered lists for steps
- **Engagement**: Direct address ("you will learn"), rhetorical questions
- **Closings**: Encouraging statements ("Have fun!", "Happy designing!", "See you soon!")

## Integration with Task System

The blog-generator skill integrates with the task execution system:

1. **Create spec**: `/spec <goal>` → `specs/TASK-XXX.json`
2. **Execute task**: `/task specs/TASK-XXX.json` → runs task with logging, TDD, knowledge updates
3. **Blog prompt**: Prompted at task completion → generates blog if "yes"
4. **Output**: `tasks/TASK-XXX/blog/YYYY-MM-DD-slug.md`

## Related Skills

- **task-executor** - Execute tasks from specs with full automation and logging
- **spec-creator** - Create task specifications before execution
- **tdd-workflow** - Invoked automatically for all coding tasks
- **documentation-generator** - For technical documentation (different from blogs)

## References

This skill follows patterns from:
- `references/patrick-writing-style.md` - Patrick Tehubijuluw writing style profile
- `references/lightfast-templates.md` - Lightfast blog templates (technology/product)
- `references/category-guides.md` - Category detection logic
- `references/frontmatter-schema.md` - Complete frontmatter schema
- `references/skill-rules.md` - 10 mandatory skill rules

## Skill Structure

```
blog-generator/
├── SKILL.md              # Skill definition (10 rules compliant)
├── README.md             # This file
├── references/           # Reference documentation
│   ├── patrick-writing-style.md
│   ├── lightfast-templates.md
│   ├── category-guides.md
│   └── frontmatter-schema.md
└── scripts/              # Executable utilities
    ├── category-detector.js
    ├── frontmatter-generator.js
    ├── content-generator.js
    ├── faq-generator.js
    ├── code-extractor.js
    └── slug-calculator.js
```

## Compliance

This skill follows all 10 mandatory rules (see `references/skill-rules.md`):
- Rule A: Goals ✓
- Rule B: Acceptance Criteria (7 criteria) ✓
- Rule C: Decision Management ✓
- Rule D: Triggers (natural language hook) ✓
- Rule E: Steps/Tasks/Checklists (5 steps) ✓
- Rule F: Human Interaction ✓
- Rule G: Permissions ✓
- Rule H: Tool Usage ✓
- Rule I: Format (agent-friendly) ✓
- Rule J: README Documentation ✓

## Example Output

See `tasks/TASK-001/blog/` for example blog posts generated from task execution logs.