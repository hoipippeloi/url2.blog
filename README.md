# URL2.blog

Transform your URLs into blog posts using AI.

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:generate
pnpm db:push

# Start development server
pnpm dev
```

Visit `http://localhost:5173`

## Features

✅ **URL Save Flow** - Paste any URL and save it to your collection
✅ **Blog Generation Modal** - Configure title, tone, format, tags, category
✅ **AI Blog Generation** - Powered by Qwen3.5-2B via LLaMA gateway
✅ **Blog Editor** - Edit and save generated content
✅ **URL Feed** - View all saved URLs with regeneration option

## Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS v4 + Custom design system
- **Database**: PostgreSQL + Prisma
- **AI**: Qwen3.5-2B via Railway gateway
- **Deployment**: Railway

## Commands

```bash
# Development
pnpm dev          # Start dev server (port 5173)

# Build
pnpm build        # Production build
pnpm preview      # Preview production build

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio

# Testing
pnpm test         # Run tests

# Code Quality
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm check        # Type check
```

## Project Structure

```
src/
├── app.css              # Design system styles
├── app.html             # HTML template
├── lib/
│   ├── components/
│   │   └── Modal.svelte # Blog generation modal
│   ├── llm-gateway/
│   │   ├── client.ts    # LLM API client
│   │   └── index.ts     # Exported instance
│   ├── server/
│   │   ├── database.ts  # Prisma client
│   │   └── index.ts     # Server helpers
│   └── validators.ts    # Zod schemas
├── routes/
│   ├── +layout.svelte   # Layout component
│   ├── +layout.ts       # Layout data
│   ├── +page.svelte     # Main page
│   └── +page.server.ts  # Server actions
└── tests/
    └── setup.ts         # Test setup

prisma/
└── schema.prisma        # Database schema
```

## Database Schema

### SavedUrl
- `id` - Unique identifier
- `url` - The saved URL (unique)
- `createdAt`, `updatedAt` - Timestamps
- `blogPosts` - Relation to blog posts

### BlogPost
- `id` - Unique identifier
- `savedUrlId` - Foreign key to SavedUrl
- `title` - Blog post title
- `content` - Full content with frontmatter
- `frontmatter` - JSON metadata
- `tone`, `format`, `category` - Classification
- `tags` - Array of tags
- `blogReason` - Why this was written
- `additionalInstructions` - Optional notes

## LLM Gateway

**Base URL**: `https://hoi-llm-gateway.up.railway.app`
**Model**: `unsloth/Qwen3.5-2B-GGUF`

See `docs/llm-gateway-integration.md` for complete API documentation.

## Deployment

### Railway

1. Connect your GitHub repository
2. Provision PostgreSQL database
3. Deploy automatically

Railway automatically sets `DATABASE_URL`.

### Environment Variables

See `.env.example` for required variables.

## Design System

Based on `docs/design/design-system.html`:

- **Colors**: Terracotta accent (#a65d3f), warm neutrals
- **Fonts**: Bricolage Grotesque (display), Lekton (body), JetBrains Mono (code)
- **Components**: Buttons, inputs, modals, cards, alerts, tags, badges
- **Themes**: Light & dark mode support

## Testing

```bash
# Run tests
pnpm test

# Test with UI
pnpm test:ui
```

## License

MIT
