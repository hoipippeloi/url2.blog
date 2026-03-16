# Tailwind CSS v4 Integration Guide

Based on the **Gray HTML** template by Cruip.com

## Overview

This document explains how Tailwind CSS v4 is integrated in our SvelteKit application, following the patterns established in the Gray HTML template. Tailwind v4 introduces significant changes from v3, including a new CSS-first configuration approach and improved performance.

## Key Differences in Tailwind CSS v4

### 1. No More `tailwind.config.js`

Tailwind v4 eliminates the JavaScript configuration file entirely. Instead, configuration is done directly in CSS using the `@theme` directive.

### 2. CSS-First Configuration

All customization happens in CSS files using native CSS features:
- `@theme` - Define custom design tokens
- `@layer` - Organize styles into layers
- `@import` - Import Tailwind and additional styles
- `@plugin` - Load and configure plugins

### 3. Native CSS Variables

Tailwind v4 uses CSS custom properties (variables) extensively for theming, making it easier to create dynamic themes.

## File Structure

```
src/
├── app.css                    # Main Tailwind CSS file (entry point)
└── lib/
    └── components/            # Svelte components
        ├── Header.svelte
        ├── Breadcrumb.svelte
        └── index.ts
```

## Installation

### Required Packages

```json
{
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/forms": "^0.5.7"
  }
}
```

### Install Command

```bash
npm install -D tailwindcss @tailwindcss/vite @tailwindcss/forms
```

## Configuration

### 1. Vite Configuration (`vite.config.ts`)

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()]
});
```

**Key Points:**
- Import `@tailwindcss/vite` plugin
- Add it to the plugins array alongside SvelteKit
- No separate PostCSS configuration needed

### 2. Main CSS File (`src/app.css`)

This is the entry point for all styles:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Inter+Tight:ital,wght@0,500;0,600;0,700;1,700&display=fallback');

@theme {
  --font-inter: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-inter-tight: "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --spacing: 0.25rem;
}
```

**Structure Breakdown:**

#### a. Import Tailwind Core

```css
@import "tailwindcss";
```

This single import replaces the old v3 approach:
```css
/* OLD v3 way - NO LONGER USED */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### b. Import Fonts

```css
@import url('...Google Fonts URL...') layer(base);
```

The `layer(base)` parameter ensures fonts are loaded in the base layer.

#### c. Define Custom Theme

```css
@theme {
  /* Custom CSS variables */
  --font-inter: "Inter", ui-sans-serif, system-ui, sans-serif;
  --spacing: 0.25rem;
  
  /* Custom animations */
  @keyframes my-animation {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

**What goes in `@theme`:**
- Custom fonts
- Custom spacing values
- Custom colors (optional, Tailwind v4 includes all colors by default)
- Custom animations with `@keyframes`
- Text size definitions with line-height and letter-spacing
- Breakpoint overrides

### 3. Plugin Configuration

Plugins are configured directly in CSS:

```css
@plugin "@tailwindcss/forms" {
  strategy: base;
}
```

**Plugin Strategies:**
- `base` - Adds base form styles (recommended)
- `class` - Only applies when using form utility classes

## Gray HTML Pattern Implementation

### Component Layers

The Gray HTML template uses organized CSS layers:

```css
@layer theme, base, components, utilities;
```

This defines the cascade order (lowest to highest specificity).

### Custom Component Styles

Components are defined in the `@layer components` block:

```css
.btn, .btn-sm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn {
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2);
}

.btn-sm {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 1);
}
```

**Benefits of This Approach:**
- Reusable component classes
- Consistent spacing using CSS variables
- Can be overridden by utility classes
- Easier to maintain than inline Tailwind classes for common patterns

### Form Styles

```css
.form-input {
  appearance: none;
  border-radius: 0.375rem;
  border-width: 1px;
  border-color: rgb(228 228 231);
  background-color: rgb(255 255 255);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus {
  border-color: rgb(39 39 42);
  outline: none;
}
```

### Custom Shadow Utilities

```css
.shadow-xs {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

### Gradient Utilities

Tailwind v4 handles gradients differently. In our implementation:

```css
.bg-linear-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.bg-linear-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
```

Usage in HTML:
```html
<h1 class="bg-clip-text text-transparent bg-linear-to-r from-zinc-500 via-zinc-900 to-zinc-900">
  Gradient Text
</h1>
```

## Advanced Theming

### Typography Scale

Define custom text sizes with line-height and letter-spacing:

```css
@theme {
  --text-xs: 0.75rem;
  --text-xs--line-height: 1.5;
  
  --text-base: 1rem;
  --text-base--line-height: 1.5;
  --text-base--letter-spacing: -0.017em;
  
  --text-5xl: 3.25rem;
  --text-5xl--line-height: 1.2;
  --text-5xl--letter-spacing: -0.017em;
}
```

### Custom Animations

```css
@theme {
  --animate-infinite-scroll: infinite-scroll 60s linear infinite;
  
  @keyframes infinite-scroll {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }
}
```

Usage:
```html
<div class="animate-infinite-scroll">...</div>
```

## Border Color Compatibility

Tailwind v4 changed the default border color from `gray-200` to `currentColor`. To maintain v3 compatibility:

```css
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}
```

## Component Integration in SvelteKit

### 1. Import in Layout

```svelte
<script lang="ts">
  import '../app.css';
</script>
```

Import the main CSS file in your root layout (`+layout.svelte`).

### 2. Using Custom Classes

```svelte
<button class="btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800">
  Click Me
</button>

<input type="text" class="form-input" placeholder="Enter text" />
```

### 3. Dynamic Classes with Svelte

```svelte
<a 
  class="text-sm font-medium px-3 py-2 transition rounded-md"
  class:text-zinc-900={$page.url.pathname === item.href}
  class:bg-zinc-100={$page.url.pathname === item.href}
  class:text-zinc-500={$page.url.pathname !== item.href}
  href={item.href}
>
  {item.label}
</a>
```

## Performance Considerations

### 1. CSS Output Size

Tailwind v4 includes intelligent tree-shaking:
- Only used utilities are included in production
- Smaller bundle sizes compared to v3
- Faster CSS processing

### 2. Development Speed

- Instant HMR (Hot Module Replacement)
- No rebuild needed for most changes
- JIT (Just-In-Time) compilation is built-in

## Build Process

### Development

```bash
npm run dev
```

Tailwind CSS processes automatically via the Vite plugin with:
- Watch mode enabled
- Fast incremental builds
- HMR support

### Production

```bash
npm run build
```

Automatically:
- Minifies CSS
- Removes unused styles
- Optimizes output

## Utility Classes Reference

### From Gray HTML Template

#### Typography
- `.h1`, `.h2`, `.h3`, `.h4` - Responsive heading classes

#### Buttons
- `.btn` - Standard button
- `.btn-sm` - Small button

#### Forms
- `.form-input` - Text inputs
- `.form-textarea` - Textareas
- `.form-select` - Select dropdowns
- `.form-checkbox` - Checkboxes
- `.form-radio` - Radio buttons

#### Utilities
- `.shadow-xs` - Extra small shadow
- `.no-scrollbar` - Hide scrollbars

## Migration from Tailwind v3 to v4

### Changes Required

1. **Remove `tailwind.config.js`**
   - Move all configuration to CSS `@theme` blocks

2. **Update Import Statements**
   ```css
   /* Before (v3) */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   /* After (v4) */
   @import "tailwindcss";
   ```

3. **Update Vite Config**
   - Add `@tailwindcss/vite` plugin

4. **Color References**
   - Some color names may have changed
   - Use `--color-*` CSS variables for consistency

5. **Plugin Syntax**
   ```css
   /* Configure plugins in CSS */
   @plugin "@tailwindcss/forms" {
     strategy: base;
   }
   ```

## Troubleshooting

### Issue: Styles Not Applying

**Solution:** Ensure `app.css` is imported in your root layout:
```svelte
<script>
  import '../app.css';
</script>
```

### Issue: Custom Theme Not Working

**Solution:** Check that your `@theme` block is in the main CSS file, not in a Svelte component's `<style>` tag.

### Issue: Vite Plugin Not Found

**Solution:** 
```bash
npm install -D @tailwindcss/vite
```

### Issue: Border Colors Look Different

**Solution:** Add the border compatibility layer shown in the "Border Color Compatibility" section above.

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Gray HTML Template by Cruip](https://cruip.com)
- [SvelteKit Documentation](https://kit.svelte.dev)

## Example: Complete Setup

Here's a minimal complete setup:

**`vite.config.ts`:**
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()]
});
```

**`src/app.css`:**
```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

.btn {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition;
}
```

**`src/routes/+layout.svelte`:**
```svelte
<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<div class="min-h-screen bg-white">
  {@render children?.()}
</div>
```

**`src/routes/+page.svelte`:**
```svelte
<main class="p-8">
  <h1 class="text-4xl font-bold text-zinc-900">
    Hello Tailwind v4!
  </h1>
  <button class="btn bg-zinc-900 text-white mt-4">
    Click Me
  </button>
</main>
```

## Conclusion

Tailwind CSS v4 simplifies configuration while providing more power through native CSS features. The Gray HTML template demonstrates best practices for organizing styles using `@layer`, creating reusable component classes, and maintaining a scalable design system.

Key takeaways:
- Configuration is now in CSS, not JavaScript
- Use `@theme` for customization
- Plugins are configured in CSS
- Better performance and smaller bundles
- More control with native CSS features

