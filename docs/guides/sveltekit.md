# SvelteKit Integration

## Prerequisites

- SvelteKit 2+
- Node.js 18+

## Quick Start

**1. Install and generate config:**

```bash
npm install -D autotheme
npx autotheme init
# Select "SvelteKit" when prompted
npx autotheme
```

**2. Import in `src/app.css`:**

```css
/* src/app.css */
@import "./autotheme.css";
```

**3. Use the tokens:**

```svelte
<style>
  .card {
    background: var(--surface-raised);
    color: var(--text-1);
  }
</style>
```

## Full Setup

### Install & Generate Config

```bash
npm install -D autotheme
npx autotheme init
```

Select "SvelteKit" for framework-specific defaults:

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": {
    "path": "./src/autotheme.css",
    "tailwind": true
  }
}
```

### CSS Import

Import in your app's global stylesheet:

```css
/* src/app.css */
@import "./autotheme.css";

/* Your custom styles */
```

Make sure `app.css` is imported in your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import "../app.css";
</script>

<slot />
```

### Using Semantic Tokens

```svelte
<div class="page">
  <nav class="sidebar">Navigation</nav>
  <main class="content">
    <button class="btn-primary">Action</button>
  </main>
</div>

<style>
  .page {
    background: var(--surface);
    color: var(--text-1);
  }

  .sidebar {
    background: var(--surface-sunken);
    border-right: 1px solid var(--border);
  }

  .btn-primary {
    background: var(--accent);
    color: var(--accent-contrast);
  }
</style>
```

## Dark Mode

### Store-Based Toggle (Recommended)

Create a theme store and toggle `color-scheme`:

```ts
// src/lib/stores/theme.ts
import { writable } from "svelte/store";
import { browser } from "$app/environment";

const stored = browser ? localStorage.getItem("theme") : null;
export const theme = writable<"light" | "dark">((stored as "light" | "dark") ?? "light");

theme.subscribe((value) => {
  if (browser) {
    document.documentElement.style.colorScheme = value;
    localStorage.setItem("theme", value);
  }
});
```

```svelte
<!-- src/lib/components/ThemeToggle.svelte -->
<script>
  import { theme } from "$lib/stores/theme";
</script>

<button on:click={() => $theme = $theme === "dark" ? "light" : "dark"}>
  Toggle theme
</button>
```

AutoTheme's `light-dark()` tokens respond to the `color-scheme` property change.

### CSS-Only with `prefers-color-scheme`

For automatic system-preference matching without JavaScript:

```css
/* src/app.css */
@import "./autotheme.css";

:root {
  color-scheme: light dark;
}
```

## Tailwind v4

SvelteKit uses Vite, which handles `@import` natively.

Enable palette generation:

```json
{
  "palette": true,
  "output": { "tailwind": true }
}
```

Import AutoTheme in `app.css` before using Tailwind utilities:

```css
/* src/app.css */
@import "./autotheme.css";
```

Use in your components:

```svelte
<div class="bg-primary-500 text-primary-contrast p-4 rounded-lg">
  Styled with Tailwind
</div>
```

## Troubleshooting

### OKLCH Browser Support

OKLCH is supported in Chrome 111+, Firefox 113+, Safari 15.4+. For older browsers, set `format: "hsl"` in your config.

### `@import` Ordering

CSS `@import` rules must appear before any other rules in the file. Place `@import "./autotheme.css"` as the first line of `app.css`.

### Scoped Styles

Svelte's scoped styles work with CSS custom properties. Global variables from `app.css` are accessible in all component `<style>` blocks.

### SSR and `color-scheme`

When using the store-based toggle, the initial `color-scheme` is set on the client. To prevent a flash of unstyled content, add an inline script in `app.html`:

```html
<!-- src/app.html -->
<script>
  const theme = localStorage.getItem("theme");
  if (theme) document.documentElement.style.colorScheme = theme;
</script>
```
