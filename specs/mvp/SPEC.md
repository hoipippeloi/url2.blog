# URL2.blog MVP

## Feature Overview

URL2.blog is a simple blog writer that transforms URLs, bookmarks, and interests into blog posts. The application targets content creators and developers who want to quickly convert their saved links into structured blog content.

The core problem solved is the friction between saving interesting URLs and actually writing about them. Users often bookmark content with the intention of writing about it later, but the process of starting from scratch is daunting. URL2.blog bridges this gap by generating draft blog posts from URLs with customizable options for tone, format, and structure.

The MVP focuses on the essential flow: save URLs, generate blog posts with AI assistance (using self-hosted LLM gateway), and edit the results. This establishes the foundation for future enhancements like authentication, batch processing, scheduling, and analytics.

**Note**: Authentication is explicitly excluded from MVP to reduce complexity and accelerate time-to-market.

## Success Criteria

- Users can complete the full flow (save URL → generate blog → edit → save) in under 2 minutes
- Generated blog posts render correctly with all frontmatter fields (title, tags, category, tone, format)
- Error rate for blog generation stays below 5%
- Users can re-generate blog posts for any saved URL on demand
- LLM gateway integration is documented and reusable for future projects

## Design Goals

**Primary Goals:**
- Must provide a frictionless single-page experience for the core workflow
- Must match the design system in `docs/design/design-system.html` exactly
- Must integrate with the LLaMA CPP gateway at https://hoi-llm-gateway.up.railway.app/
- Must persist user data and generated content reliably
- Must document LLM gateway usage in `/docs` for reusability

**Secondary Goals:**
- Nice to have: Optimistic UI updates during generation
- Nice to have: Keyboard shortcuts for common actions
- Nice to have: Visual feedback during AI generation process

## User Experience

Users land on the homepage and see a URL input field prominently displayed. Pasting a URL and clicking "Save" triggers a modal with blog configuration options (title, blog reason, tone, format, tags, category, additional instructions). Clicking "Generate" calls the LLM gateway service and displays the generated content in an editor. Users can modify the content and save their changes. The main feed shows all their saved URLs with the ability to regenerate any blog post at any time.

The journey is linear and focused: each step has a single primary action, reducing cognitive load. The modal pattern keeps configuration contextual without navigation.

## Design Rationale

The single-page modal flow was chosen to minimize context switching and maintain user focus. Modal configuration keeps all options visible without requiring separate pages, which reduces implementation complexity and improves perceived performance. The feed-based URL list enables quick regeneration and iteration, supporting the exploratory nature of content creation.

Trade-offs: Modal patterns can become cramped on mobile, but the MVP prioritizes desktop-first development (Railway deployment target). The monolithic page approach may need refactoring for advanced features like batch operations or team collaboration.

## Constraints and Assumptions

**Constraints:**
- Must use SvelteKit with Svelte 5 runes and patterns
- Must use TypeScript with strict type checking
- Must use Prisma Postgres for data persistence
- Must use Tailwind CSS with the design system from `docs/design/design-system.html`
- Must follow Test Driven Development (TDD) for all logic
- Deployment target is Railway
- Must use LLaMA CPP gateway at https://hoi-llm-gateway.up.railway.app/
- No authentication in MVP

**Assumptions:**
- LLM gateway service will be available and responsive
- Users primarily access the app from desktop browsers
- Each user manages their own URL collection (no sharing/collaboration in MVP)
- LLM gateway supports standard completion/chat API format

---

## Functional Requirements

### FR-1: URL Save Flow

**Description**: Users can paste a URL into an input field and save it to their collection with a single click.

**Acceptance Criteria**:
- [ ] Given an authenticated user, when they paste a valid URL into the input field, then the "Save" button becomes enabled
- [ ] Given a user clicks "Save" with a valid URL, when the save completes, then the URL appears in their feed
- [ ] Given a user enters an invalid URL format, when they click "Save", then they see a validation error message
- [ ] Given a user saves a duplicate URL, when the save completes, then they are notified the URL already exists

**Priority**: Must Have

### FR-2: Blog Generation Modal

**Description**: After saving a URL, a modal appears with configuration options for the blog post generation.

**Acceptance Criteria**:
- [ ] Given a user saves a URL, when the save completes, then the generation modal appears automatically
- [ ] Given the modal is open, when the user sees the form, then it displays fields for: title, blog reason, tone, format, tags, category, additional instructions
- [ ] Given the modal form, when the user fills required fields, then the "Generate" button becomes enabled
- [ ] Given the user clicks "Generate", when the generation starts, then the modal shows a loading state

**Priority**: Must Have

### FR-3: Blog Post Generation

**Description**: The system generates a blog post from the URL using the LLaMA CPP gateway (Qwen3.5-2B model), applying the user's configuration options.

**Acceptance Criteria**:
- [ ] Given a user clicks "Generate", when the API responds, then the generated blog post appears in the editor
- [ ] Given a generation request, when the API fails, then the user sees an error with retry option
- [ ] Given a blog post is generated, when it displays, then it includes frontmatter (title, tags, category, tone, format)
- [ ] Given a generation timeout (>30s), when the user waits too long, then they can cancel and retry
- [ ] Given the generation request, when it's sent, then it uses the documented LLM gateway integration pattern

**Priority**: Must Have

### FR-4: Blog Post Editor

**Description**: Users can edit the generated blog post content and save their changes.

**Acceptance Criteria**:
- [ ] Given a blog post is displayed, when the user modifies the content, then changes appear in real-time
- [ ] Given a user edits a blog post, when they click "Save", then the changes are persisted to the database
- [ ] Given a user makes unsaved changes, when they navigate away, then they are prompted to save or discard
- [ ] Given a save operation, when it fails, then the user is notified and can retry

**Priority**: Must Have

### FR-5: URL Feed with Regeneration

**Description**: Users see a feed of all their saved URLs and can regenerate blog posts for any URL.

**Acceptance Criteria**:
- [ ] Given a user is on the main page, when the feed loads, then all their saved URLs are displayed
- [ ] Given a URL in the feed, when the user clicks "Regenerate", then the generation modal appears for that URL
- [ ] Given the feed, when a URL has an existing blog post, then it shows a preview or status indicator
- [ ] Given the feed has many URLs, when it exceeds viewport, then it scrolls with pagination or virtualization

**Priority**: Must Have

---

## Edge Cases and Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid URL format (e.g., "not-a-url") | Show validation error: "Please enter a valid URL (e.g., https://...)" |
| LLM service timeout (>30s) | Show error: "Generation timed out. Please retry." with auto-retry option |
| LLM service returns empty/malformed content | Show error: "Could not generate content. Please try again or adjust your instructions." |
| Database connection failure | Show error: "Unable to save. Please check your connection and retry." |
| Network disconnect during generation | Show error: "Connection lost. Please reconnect and retry." |
| Duplicate URL submission | Show warning: "This URL already exists in your collection" with option to view existing post |

---

## Skills Required for Implementation

**Frontend:**
- Svelte 5 best practices: `.opencode\skills\svelte5-best-practices\SKILL.md`
- SvelteKit + Tailwind integration: `.opencode\skills\sveltekit-svelte5-tailwind-skill\SKILL.md`
- Modern frontend design: `.opencode\skills\modern-frontend-design\SKILL.md`

**Backend & Data:**
- TypeScript: `.opencode\skills\mastering-typescript\SKILL.md`
- Prisma Postgres: `.opencode\skills\prisma-postgres\SKILL.md`

**Testing:**
- Test Driven Development: `.opencode\skills\tdd-workflow\SKILL.md`

**Deployment:**
- Railway deployment: `.opencode\skills\railway-docs\SKILL.md`

---

## Scope Notes

The following are intentionally excluded from MVP and should be separate specs:
- Authentication (Google OAuth, etc.)
- Batch URL import/export
- Blog post scheduling or auto-publishing
- Analytics and usage tracking
- Team collaboration features
- Custom domain configuration
- Social media sharing integration
- Template library for blog formats
