# Lightfast Blog Templates

Reference templates from lightfast blog-writer skill for technology and product blog posts.

---

## BaseHub Entry Fields

This frontmatter structure maps to `AIGeneratedPost` type in `@repo/cms-workflows`, enabling publish via `/publish_blog`.

### Core Fields

- **title**: Blog post title (compelling, keyword-rich)
- **slug**: URL slug (kebab-case, no category prefix)
- **publishedAt**: ISO date string (YYYY-MM-DD)
- **category**: One of: `technology`, `company`, `product`
- **contentType**: One of: `tutorial`, `announcement`, `thought-leadership`, `case-study`, `comparison`, `deep-dive`, `guide`

### AEO Fields (Answer Engine Optimization)

- **excerpt**: 2-3 sentences for listings (max 300 chars)
- **tldr**: 80-100 word summary for AI citation. Self-contained paragraph with key benefits.

### SEO Fields (nested under `seo:`)

- **seo.metaDescription**: 150-160 chars with primary keyword
- **seo.focusKeyword**: Primary keyword phrase
- **seo.secondaryKeywords**: Array of 2-4 secondary keywords
- **seo.faq**: Array of 3-5 question/answer pairs

### Author (hardcoded for now)

- **author**: `patrick-tehubijuluw`

### Internal Fields (nested under `_internal:`)

Stripped before publishing:

- **_internal.status**: `draft` or `published`
- **_internal.generated**: ISO timestamp
- **_internal.sources**: Array of research URLs
- **_internal.word_count**: Approximate word count
- **_internal.reading_time**: Estimated reading time

---

## Frontmatter Template

```yaml
---
# Core fields
title: "Blog Post Title"
slug: "blog-post-slug"
publishedAt: "YYYY-MM-DD"
category: "technology" | "company" | "product"
contentType: "deep-dive" | "announcement" | "tutorial" | "thought-leadership" | "case-study" | "guide"

# AEO fields
excerpt: "2-3 sentence summary for listings, max 300 chars"
tldr: "80-100 word summary for AI citation. Self-contained paragraph covering key user benefits and main insights."

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

---

## Technology Blog Template

**Audience**: Developers, engineers, technical decision makers

**Tone**: Authoritative and opinionated, data-driven claims, assumes technical knowledge

**Word Count**: 800-1,500 words

### Required Elements

- Code examples (1+ per major section)
- Technical metrics/benchmarks
- Implementation details
- "Why we built it this way" section
- 5-10 external citations

### Structure

```markdown
## [Technical Problem/Hook]

[1-2 paragraphs introducing the technical challenge or industry controversy]

**Key metrics:**
- [Data point 1]
- [Data point 2]

---

## [Technical Deep-Dive Section]

[Layer 1: Foundation explanation]

```typescript
// Code example
```

[Layer 2: Implementation details]

---

## [Solution/How We Built It]

[Natural product positioning with technical specifics]

**What's included:**
- [Capability 1]
- [Capability 2]

---

## Why We Built It This Way

[1-2 paragraphs on architectural decisions]

---

## Lessons Learned

[From task execution - what worked, what didn't]

---

## Frequently Asked Questions

**Q: [Technical question]?**
A: [Complete, self-contained answer]

**Q: [Implementation question]?**
A: [Step-by-step answer]

---

## Resources

- [Documentation](/docs/relevant-page)
- [API Reference](/docs/api-reference/endpoint)
- [Quick Start](/docs/get-started/quickstart)
```

### Title Patterns

- "What we discovered about [topic] via [methodology]"
- "Introducing [tool]: [benefit for developers]"
- "[Technical concept] for [use case]"
- "[Topic]: Why the [industry debate] misses the point"

### Opening Hook Examples

- Start with controversial technical take
- Lead with surprising data point
- Present industry problem developers face

### Vocabulary

**Use**: RAG, SSR, webhooks, SDK, API, vector search, semantic, pipeline, architecture, latency, throughput

**Avoid**: Marketing buzzwords without technical backing, vague claims

### Code Example Requirements

- Copy-paste ready
- Include npm/pnpm commands
- Show actual SDK usage
- Syntax highlighted with language tag

### CTA Style

Documentation-focused, low-friction:
- "Full documentation available at..."
- "Get started with: `npm install @lightfast/sdk`"
- "See the API reference for..."

### Example Titles

- "Introducing next-aeo: Optimize your Next.js app for AI visibility"
- "What we discovered about AI crawlers via server log analysis"
- "X-Forwarded-For for AI agents"
- "Bring Profound data directly into your AI workflow with MCP"

---

## Product Blog Template

**Audience**: Customers, prospects, product managers

**Tone**: Professional B2B, benefit-oriented, problem-aware and empathetic

**Word Count**: 500-1,000 words

### Required Elements

- Market shift/pain point identification
- Feature breakdown with bullets
- Use cases/early adoption stories
- Availability statement
- 3-5 external citations

### Structure

```markdown
## [Market Shift/Pain Point]

[1-2 paragraphs identifying the problem]

---

## Introducing [Feature Name]

[What it is and high-level purpose]

**Key capabilities:**
- [Capability 1]: [Benefit]
- [Capability 2]: [Benefit]
- [Capability 3]: [Benefit]

---

## How It Works

[Brief explanation or walkthrough]

```yaml
# Example configuration
```

---

## Use Cases

**[Use case 1]**: [How the feature helps]

**[Use case 2]**: [How the feature helps]

---

## Availability

[When and how to access. Availability statement.]

---

## Frequently Asked Questions

**Q: [Pricing/access question]?**
A: [Clear answer]

**Q: [Integration question]?**
A: [Technical answer]

---

## Get Started

- [Quick Start](/docs/get-started/quickstart)
- [Feature Docs](/docs/features/feature-name)
- [Pricing](/pricing)
```

### Title Patterns

- "Introducing [Feature]: [benefit]"
- "[Feature Name]: Your new [capability]"
- "Now [action]: [what's new]"
- "[Analysis Type]: Your new window into [domain]"

### Opening Hook Examples

- "Content operations are often too manual..."
- "Teams spend X hours per week on..."
- Identify specific pain point

### Vocabulary

**Use**: streamline, automate, visibility, insights, control, workflow, operations

**Avoid**: Over-technical jargon without explanation

### Feature Breakdown Format

**Key capabilities:**
- **[Capability]**: [1-sentence benefit]
- **[Capability]**: [1-sentence benefit]
- **[Capability]**: [1-sentence benefit]

### Availability Statement Examples

- "Available starting today to all Lightfast customers"
- "Rolling out to Pro and Enterprise plans this week"
- "Now in beta for early access customers"

### CTA Style

Soft availability statements:
- "Available now in your dashboard"
- "Get started in Settings -> Features"
- "Contact sales for Enterprise access"

### Example Titles

- "Introducing Profound Workflows: Automating content operations"
- "Introducing support for ChatGPT Shopping"
- "Shopping Analysis: Your new window into conversational shopping"
- "Introducing Agency Mode: Scale smarter, pitch faster"

---

## Company Blog Template

**Audience**: General audience, investors, partners, press

**Tone**: Professional, visionary, forward-looking

**Word Count**: 300-800 words

### Required Elements

- Bold reframing statement
- Core announcement (who, what, when)
- Strategic context
- Executive quote
- Looking ahead vision

### Structure

```markdown
## [Bold Reframing Statement]

[The internet is no longer... -> it's now...]

---

## [Core Announcement]

[Who, what, when - the news]

**Key highlights:**
- [Highlight 1]
- [Highlight 2]

---

## [Strategic Context]

[Why this matters for the industry]

> "[Executive quote]" -- Name, Title

---

## [Looking Ahead]

[Vision statement, next steps]

---

## Frequently Asked Questions

**Q: [Impact question]?**
A: [Answer with forward-looking vision]

---

## Learn More

- [Careers](/careers)
- [About](/about)
- [Contact](/contact)
```

---

## Content Type Definitions

### deep-dive

Technical exploration of a topic with thorough analysis and implementation details.

**When to use**: Complex technical topics, architecture decisions, performance analysis

**Word count**: 1,200-1,500

### tutorial

Step-by-step guide teaching a specific skill or workflow.

**When to use**: How-to guides, getting started, implementation guides

**Word count**: 800-1,200

### thought-leadership

Opinion piece on industry trends, future directions, or controversial takes.

**When to use**: Industry commentary, predictions, contrarian views

**Word count**: 800-1,000

### case-study

Real-world example of solving a problem with specific outcomes.

**When to use**: Customer success stories, internal project retrospectives

**Word count**: 1,000-1,500

### comparison

Side-by-side analysis of tools, approaches, or technologies.

**When to use**: Tool evaluations, migration guides, decision frameworks

**Word count**: 1,000-1,200

### guide

Comprehensive resource covering a topic end-to-end.

**When to use**: Best practices, complete references, handbooks

**Word count**: 1,500-2,500

### announcement

News about product launches, features, or company updates.

**When to use**: Product releases, feature launches, company news

**Word count**: 500-800

---

## Usage

These templates are used by the blog-generator skill to:
- Determine appropriate structure based on category (technology/product/company)
- Generate frontmatter with all required fields
- Apply correct tone and vocabulary for target audience
- Include required elements per content type
- Format CTAs appropriately for content type

See `category-guides.md` for category detection logic.
See `patrick-writing-style.md` for writing style guidelines.
See `frontmatter-schema.md` for complete field specifications.